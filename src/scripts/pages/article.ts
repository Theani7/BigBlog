let _shareMenuListenerAttached = false;

document.addEventListener('astro:page-load', () => {
  const slugMeta = document.querySelector<HTMLMetaElement>('meta[name="story-slug"]');
  if (!slugMeta) return;
  const slug = slugMeta.content || '';
  const authorId =
    document.querySelector<HTMLMetaElement>('meta[name="story-author"]')?.content || '';
  const currentUrl = window.location.href;

  const likeBtn = document.getElementById('like-btn') as HTMLButtonElement | null;
  const bookmarkBtn = document.getElementById('bookmark-btn') as HTMLButtonElement | null;
  const repostBtn = document.getElementById('repost-btn') as HTMLButtonElement | null;
  const followBtn = document.getElementById('follow-btn') as HTMLButtonElement | null;
  const shareBtn = document.getElementById('share-btn') as HTMLButtonElement | null;
  const shareMenu = document.getElementById('share-menu') as HTMLElement | null;
  const commentsBtn = document.getElementById('comments-btn') as HTMLButtonElement | null;

  const likeCount = document.getElementById('like-count');
  const repostCount = document.getElementById('repost-count');
  const commentCount = document.getElementById('comment-count');
  const commentsTitleCount = document.getElementById('comments-title-count');
  const followerCount = document.getElementById('follower-count');

  const commentList = document.getElementById('comment-list');
  const commentForm = document.getElementById('comment-form') as HTMLFormElement | null;
  const commentAuthGate = document.getElementById('comment-auth-gate') as HTMLElement | null;
  const commentAs = document.getElementById('comment-as') as HTMLElement | null;
  const commentAsName = document.getElementById('comment-as-name') as HTMLElement | null;
  const commentContent = document.getElementById('comment-content') as HTMLTextAreaElement | null;
  const commentError = document.getElementById('comment-error') as HTMLElement | null;
  const commentStatus = document.getElementById('comment-status') as HTMLElement | null;
  const commentSubmit = document.getElementById('comment-submit') as HTMLButtonElement | null;

  const toast = document.getElementById('page-toast') as HTMLElement | null;
  const toastText = document.getElementById('page-toast-text') as HTMLElement | null;

  const COMMENTS_API = '/api/comments';
  const REPOST_API = '/api/reposts';
  const FOLLOW_API = '/api/follows';

  let totalComments = 0;
  let currentUser: { id: string; name?: string; email?: string } | null = null;
  let toastTimer: number | undefined;

  function isLoggedIn(): boolean {
    return currentUser !== null;
  }

  function showToast(message: string) {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.removeAttribute('hidden');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.setAttribute('hidden', ''), 2500);
  }

  function showCommentStatus(message: string) {
    if (!commentStatus) return;
    commentStatus.textContent = message;
    commentStatus.removeAttribute('hidden');
    window.setTimeout(() => commentStatus.setAttribute('hidden', ''), 4000);
  }

  async function toggle(
    endpoint: string,
    body: Record<string, string>,
    btn: HTMLButtonElement,
    countEl?: HTMLElement | null
  ) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) {
        showToast(data.error || 'Something went wrong');
        return;
      }
      const active = data.data?.liked ?? data.data?.bookmarked ?? data.data?.reposted;
      if (active !== undefined) {
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', String(active));
      }
      if (countEl && data.data?.count !== undefined) {
        countEl.textContent = String(data.data.count);
      }
      return data.data;
    } catch (error) {
      showToast('Network error, please try again');
      console.error(error);
      return null;
    }
  }

  // ---------------------------------------------------------
  // AUTH + FOLLOW
  // ---------------------------------------------------------
  async function checkAuth() {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.success && meData.user) {
        currentUser = {
          id: meData.user.id,
          name: meData.user.name,
          email: meData.user.email,
        };
      }
    } catch {
      currentUser = null;
    }
    applyAuthState();
  }

  function applyAuthState() {
    if (commentForm) commentForm.hidden = !isLoggedIn();
    if (commentAuthGate) commentAuthGate.hidden = isLoggedIn();
    if (commentAsName) commentAsName.textContent = currentUser?.name || '';
    if (commentAs) commentAs.hidden = !isLoggedIn();
    if (followBtn && authorId) {
      followBtn.hidden = isLoggedIn() && currentUser!.id === authorId;
    }
  }

  async function initFollow() {
    if (!followBtn || !authorId) return;
    try {
      const res = await fetch(`${FOLLOW_API}?authorId=${encodeURIComponent(authorId)}`);
      const data = await res.json();
      if (!data.success) return;
      setFollowState(data.data.following, data.data.count);
    } catch (error) {
      console.error('Failed to load follow state:', error);
    }
  }

  function setFollowState(following: boolean, count: number) {
    if (!followBtn) return;
    followBtn.classList.toggle('is-following', following);
    followBtn.setAttribute('aria-pressed', String(following));
    followBtn.textContent = following ? 'Following' : 'Follow';
    if (followerCount) {
      const formatted =
        count >= 1000
          ? new Intl.NumberFormat('en-US', {
              notation: 'compact',
              maximumFractionDigits: 1,
            }).format(count)
          : String(count);
      followerCount.textContent = `${formatted} ${count === 1 ? 'follower' : 'followers'}`;
    }
  }

  followBtn?.addEventListener('click', async () => {
    if (!authorId) return;
    const data = await toggle(FOLLOW_API, { authorId }, followBtn);
    if (data && typeof data.count === 'number' && typeof data.following === 'boolean') {
      setFollowState(data.following, data.count);
      showToast(data.following ? 'Following author' : 'Unfollowed author');
    }
  });

  // ---------------------------------------------------------
  // SHARE
  // ---------------------------------------------------------
  function buildShareLinks() {
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(document.title || 'Check this out');

    const twitter = document.querySelector<HTMLAnchorElement>('[data-share-twitter]');
    if (twitter)
      twitter.href = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    const linkedin = document.querySelector<HTMLAnchorElement>('[data-share-linkedin]');
    if (linkedin)
      linkedin.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    const facebook = document.querySelector<HTMLAnchorElement>('[data-share-facebook]');
    if (facebook) facebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    const email = document.querySelector<HTMLAnchorElement>('[data-share-email]');
    if (email) email.href = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
  }

  shareBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!shareMenu) return;
    const isOpen = !shareMenu.hasAttribute('hidden');
    shareMenu.toggleAttribute('hidden', isOpen);
    shareBtn.setAttribute('aria-expanded', String(!isOpen));
  });

  shareMenu?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const copyBtn = target.closest('[data-share-copy]');
    if (copyBtn) {
      navigator.clipboard
        .writeText(currentUrl)
        .then(() => showToast('Link copied to clipboard'))
        .catch(() => showToast('Failed to copy link'));
      shareMenu.setAttribute('hidden', '');
      shareBtn?.setAttribute('aria-expanded', 'false');
      return;
    }
    const nativeBtn = target.closest('[data-share-native]');
    if (nativeBtn && 'share' in navigator) {
      navigator.share({ title: document.title, url: currentUrl }).catch(() => {});
      shareMenu.setAttribute('hidden', '');
      shareBtn?.setAttribute('aria-expanded', 'false');
    }
  });

  if (!_shareMenuListenerAttached) {
    _shareMenuListenerAttached = true;
    document.addEventListener('click', (e) => {
      const currentShareMenu = document.getElementById('share-menu');
      const currentShareBtn = document.getElementById('share-btn');
      if (currentShareMenu && !currentShareMenu.hasAttribute('hidden')) {
        const inside =
          currentShareMenu.contains(e.target as Node) ||
          currentShareBtn?.contains(e.target as Node);
        if (!inside) {
          currentShareMenu.setAttribute('hidden', '');
          currentShareBtn?.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }

  if (typeof navigator !== 'undefined' && 'share' in navigator) {
    const nativeItem = document.querySelector<HTMLElement>('[data-share-native]');
    if (nativeItem) nativeItem.hidden = false;
  }

  // ---------------------------------------------------------
  // LIKE / BOOKMARK / REPOST
  // ---------------------------------------------------------
  likeBtn?.addEventListener('click', () => toggle('/api/likes', { slug }, likeBtn, likeCount));
  bookmarkBtn?.addEventListener('click', () => toggle('/api/bookmarks', { slug }, bookmarkBtn));
  repostBtn?.addEventListener('click', () => toggle(REPOST_API, { slug }, repostBtn, repostCount));

  // ---------------------------------------------------------
  // COMMENTS
  // ---------------------------------------------------------
  type CommentData = {
    id: string;
    articleSlug: string;
    content: string;
    authorName: string;
    parentId: string | null;
    status: string;
    isEdited: boolean;
    createdAt: string;
    isMine: boolean;
    reactionCounts: Record<string, number>;
    myReactions: string[];
  };

  function escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(value: string): string {
    const date = new Date(value);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function initials(name: string): string {
    return (
      name
        .split(/\s+/)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || '?'
    );
  }

  function setCommentsCount(count: number) {
    totalComments = count;
    if (commentCount) commentCount.textContent = String(count);
    if (commentsTitleCount) commentsTitleCount.textContent = `(${count})`;
  }

  function buildCommentHtml(comment: CommentData, isReply = false): string {
    const reactions = Object.entries(comment.reactionCounts)
      .map(
        ([emoji, count]) =>
          `<button type="button" class="reaction-btn${comment.myReactions.includes(emoji) ? ' is-active' : ''}" data-comment-id="${comment.id}" data-emoji="${emoji}" aria-pressed="${comment.myReactions.includes(emoji)}">${emoji} <span class="reaction-count">${count}</span></button>`
      )
      .join('');

    const ownControls = comment.isMine
      ? `
        <button type="button" class="comment-menu-btn" data-edit-comment="${comment.id}" aria-label="Edit comment" title="Edit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
        </button>
        <button type="button" class="comment-menu-btn" data-delete-comment="${comment.id}" aria-label="Delete comment" title="Delete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
        </button>
      `
      : '';

    return `
      <div class="comment-item${isReply ? ' is-reply' : ''}" data-comment-id="${comment.id}">
        <div class="comment-head">
          <span class="comment-avatar">${initials(comment.authorName)}</span>
          <div style="display:flex;align-items:center;gap:6px;min-width:0;">
            <span class="comment-author">${escapeHtml(comment.authorName)}</span>
            <span class="comment-time">${formatDate(comment.createdAt)}</span>
            ${comment.isEdited ? '<span class="comment-edited">· edited</span>' : ''}
          </div>
          <div class="comment-menu">
            ${ownControls}
            <div class="report-menu">
              <button type="button" class="comment-menu-btn" data-report-comment="${comment.id}" aria-label="Report comment" title="Report">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" x2="4" y1="22" y2="15"></line></svg>
              </button>
              <div class="report-options" hidden>
                <button type="button" data-report-reason="spam">Spam</button>
                <button type="button" data-report-reason="abuse">Abuse</button>
                <button type="button" data-report-reason="off-topic">Off-topic</button>
                <button type="button" data-report-reason="other">Other</button>
              </div>
            </div>
          </div>
        </div>
        <div class="comment-body">${escapeHtml(comment.content)}</div>
        <div class="comment-foot">
          ${reactions || '<span class="comment-time">No reactions yet</span>'}
          <button type="button" class="comment-reply-btn" data-reply-comment="${comment.id}">Reply</button>
        </div>
        <div class="comment-replies"></div>
      </div>
    `;
  }

  function findCommentEl(commentId: string): HTMLElement | null {
    return document.querySelector<HTMLElement>(`.comment-item[data-comment-id="${commentId}"]`);
  }

  function renderComments(commentsList: CommentData[]) {
    if (!commentList) return;
    if (commentsList.length === 0) {
      commentList.innerHTML = `
        <div class="comment-empty">
          <span class="comment-empty-accent" aria-hidden="true"></span>
          <h4 class="comment-empty-title">No responses yet</h4>
          <p class="comment-empty-text">Start the conversation — share what this story made you think.</p>
          ${isLoggedIn() ? '<button type="button" class="comment-empty-cta" data-focus-comment>Write a response</button>' : ''}
        </div>`;
      return;
    }

    const roots = commentsList.filter((c) => !c.parentId);
    const byParent = new Map<string, CommentData[]>();
    for (const c of commentsList) {
      if (!c.parentId) continue;
      const list = byParent.get(c.parentId) || [];
      list.push(c);
      byParent.set(c.parentId, list);
    }

    commentList.innerHTML = roots
      .map((root) => {
        const replies = (byParent.get(root.id) || [])
          .map((r) => buildCommentHtml(r, true))
          .join('');
        return `${buildCommentHtml(root)}${replies ? `<div class="comment-replies">${replies}</div>` : ''}`;
      })
      .join('');
  }

  async function loadComments() {
    try {
      const res = await fetch(`${COMMENTS_API}?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (!data.success) return;
      renderComments(data.data.comments || []);
      setCommentsCount(data.data.count || 0);
    } catch (error) {
      console.error('Failed to load comments:', error);
      if (commentList) {
        commentList.innerHTML = '<div class="comment-empty">Failed to load responses.</div>';
      }
    }
  }

  function clearCommentForm() {
    if (commentContent) commentContent.value = '';
    if (commentError) commentError.hidden = true;
    if (commentSubmit) commentSubmit.disabled = false;
  }

  async function submitComment(
    parentId: string | null = null,
    formEl?: HTMLElement
  ): Promise<boolean> {
    if (!isLoggedIn()) {
      showToast('Please sign in to comment');
      return false;
    }

    const contentValue =
      (formEl?.querySelector('textarea.reply-content') as HTMLTextAreaElement | null)?.value ||
      commentContent?.value ||
      '';

    if (!contentValue.trim()) {
      showToast('Please write a comment');
      return false;
    }

    const payload: Record<string, string | null> = {
      action: 'create',
      articleSlug: slug,
      content: contentValue,
    };
    if (parentId) payload.parentId = parentId;

    try {
      const res = await fetch(`${COMMENTS_API}?action=create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        showToast(data.error || 'Failed to post comment');
        return false;
      }

      if (data.message) showCommentStatus(data.message);

      if (data.data.status === 'approved') {
        if (parentId) {
          const parentEl = findCommentEl(parentId)?.querySelector('.comment-replies');
          if (parentEl) {
            parentEl.insertAdjacentHTML('beforeend', buildCommentHtml(data.data, true));
            parentEl.style.display = '';
          }
        } else {
          const emptyEl = commentList?.querySelector('.comment-empty');
          if (emptyEl && commentList) commentList.innerHTML = '';
          commentList?.insertAdjacentHTML('afterbegin', buildCommentHtml(data.data));
        }
        setCommentsCount(totalComments + 1);
      }

      if (formEl && parentId) formEl.remove();
      else clearCommentForm();
      return true;
    } catch (error) {
      showToast('Network error, please try again');
      console.error(error);
      return false;
    }
  }

  commentForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    submitComment();
  });

  commentList?.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;

    const focusBtn = target.closest<HTMLButtonElement>('[data-focus-comment]');
    if (focusBtn) {
      commentContent?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      commentContent?.focus();
      return;
    }

    const replyBtn = target.closest<HTMLButtonElement>('[data-reply-comment]');
    if (replyBtn) {
      if (!isLoggedIn()) {
        showToast('Please sign in to reply');
        return;
      }
      const commentEl = replyBtn.closest<HTMLElement>('.comment-item');
      const repliesEl = commentEl?.querySelector<HTMLElement>('.comment-replies');
      if (!commentEl || !repliesEl) return;

      const existing = commentEl.querySelector<HTMLElement>('.reply-form');
      if (existing) {
        existing.remove();
        return;
      }

      const form = document.createElement('div');
      form.className = 'reply-form';
      form.innerHTML = `
        <textarea class="reply-content" placeholder="Write a reply…" maxlength="5000" rows="2"></textarea>
        <div class="reply-form-actions">
          <button type="button" class="cancel">Cancel</button>
          <button type="button" class="submit">Reply</button>
        </div>
      `;
      repliesEl.prepend(form);
      const textarea = form.querySelector<HTMLTextAreaElement>('textarea.reply-content');
      textarea?.focus();

      form
        .querySelector<HTMLButtonElement>('button.cancel')
        ?.addEventListener('click', () => form.remove());
      form.querySelector<HTMLButtonElement>('button.submit')?.addEventListener('click', () => {
        submitComment(replyBtn.dataset.replyComment || null, form);
      });
      return;
    }

    const editBtn = target.closest<HTMLButtonElement>('[data-edit-comment]');
    if (editBtn) {
      const commentEl = editBtn.closest<HTMLElement>('.comment-item');
      if (!commentEl) return;
      const bodyEl = commentEl.querySelector<HTMLElement>('.comment-body');
      if (!bodyEl) return;

      const existingForm = commentEl.querySelector<HTMLElement>('.comment-edit-form');
      if (existingForm) {
        existingForm.remove();
        return;
      }

      const form = document.createElement('div');
      form.className = 'comment-edit-form';
      form.innerHTML = `
        <textarea maxlength="5000" rows="3"></textarea>
        <div class="comment-edit-actions">
          <button type="button" class="cancel">Cancel</button>
          <button type="button" class="save">Save</button>
        </div>
      `;
      form.querySelector<HTMLTextAreaElement>('textarea')!.value = bodyEl.textContent || '';
      bodyEl.replaceWith(form);
      form.querySelector<HTMLTextAreaElement>('textarea')?.focus();

      const cancel = () => {
        const textarea = form.querySelector<HTMLTextAreaElement>('textarea');
        const div = document.createElement('div');
        div.className = 'comment-body';
        div.textContent = textarea?.value || '';
        form.replaceWith(div);
      };

      form.querySelector<HTMLButtonElement>('button.cancel')?.addEventListener('click', cancel);
      form.querySelector<HTMLButtonElement>('button.save')?.addEventListener('click', async () => {
        const textarea = form.querySelector<HTMLTextAreaElement>('textarea');
        const content = textarea?.value || '';
        if (!content.trim()) return;
        try {
          const res = await fetch(`${COMMENTS_API}?action=edit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'edit',
              commentId: editBtn.dataset.editComment,
              content,
            }),
          });
          const data = await res.json();
          if (!data.success) {
            showToast(data.error || 'Failed to edit comment');
            return;
          }
          const div = document.createElement('div');
          div.className = 'comment-body';
          div.textContent = content;
          form.replaceWith(div);
          const editedTag = commentEl.querySelector<HTMLElement>('.comment-edited');
          if (editedTag) editedTag.textContent = '· edited';
          showToast('Comment updated');
        } catch (error) {
          showToast('Network error, please try again');
          console.error(error);
        }
      });
      return;
    }

    const deleteBtn = target.closest<HTMLButtonElement>('[data-delete-comment]');
    if (deleteBtn) {
      const commentEl = deleteBtn.closest<HTMLElement>('.comment-item');
      if (!commentEl) return;
      const commentId = deleteBtn.dataset.deleteComment;
      if (!confirm('Delete this comment?')) return;
      try {
        const res = await fetch(`${COMMENTS_API}?action=delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', commentId }),
        });
        const data = await res.json();
        if (!data.success) {
          showToast(data.error || 'Failed to delete comment');
          return;
        }
        commentEl.remove();
        setCommentsCount(Math.max(0, totalComments - 1));
        showToast('Comment deleted');
      } catch (error) {
        showToast('Network error, please try again');
        console.error(error);
      }
      return;
    }

    const reactionBtn = target.closest<HTMLButtonElement>('[data-emoji]');
    if (reactionBtn) {
      const commentId = reactionBtn.dataset.commentId;
      const emoji = reactionBtn.dataset.emoji;
      if (!commentId || !emoji) return;
      try {
        const res = await fetch(`${COMMENTS_API}?action=react`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'react', commentId, emoji }),
        });
        const data = await res.json();
        if (!data.success) {
          showToast(data.error || 'Failed to react');
          return;
        }
        reactionBtn.classList.toggle('is-active', data.data.added);
        reactionBtn.setAttribute('aria-pressed', String(data.data.added));
        const countEl = reactionBtn.querySelector('.reaction-count');
        if (countEl) countEl.textContent = String(data.data.count);
      } catch (error) {
        showToast('Network error, please try again');
        console.error(error);
      }
      return;
    }

    const reportBtn = target.closest<HTMLButtonElement>('[data-report-comment]');
    if (reportBtn) {
      const optionsEl = reportBtn.parentElement?.querySelector<HTMLElement>('.report-options');
      if (optionsEl) optionsEl.toggleAttribute('hidden');
      return;
    }

    const reportReason = target.closest<HTMLButtonElement>('[data-report-reason]');
    if (reportReason) {
      const menuEl = reportReason.closest<HTMLElement>('.report-options');
      const commentId =
        menuEl?.parentElement?.parentElement?.parentElement?.closest<HTMLElement>('.comment-item')
          ?.dataset.commentId;
      const commentEl = reportReason.closest<HTMLElement>('.comment-item');
      const id = commentEl?.dataset.commentId || commentId;
      if (!id) return;
      try {
        const res = await fetch(`${COMMENTS_API}?action=report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'report',
            commentId: id,
            reason: reportReason.dataset.reportReason,
          }),
        });
        const data = await res.json();
        showToast(
          data.success ? data.message || 'Report submitted' : data.error || 'Failed to report'
        );
        menuEl?.setAttribute('hidden', '');
      } catch (error) {
        showToast('Network error, please try again');
        console.error(error);
      }
      return;
    }
  });

  // ---------------------------------------------------------
  // INIT
  // ---------------------------------------------------------
  async function initState() {
    try {
      const [likesRes, bookmarksRes, repostsRes, followsRes, commentsRes] = await Promise.all([
        fetch(`/api/likes?slug=${encodeURIComponent(slug)}`),
        fetch(`/api/bookmarks?slug=${encodeURIComponent(slug)}`),
        fetch(`${REPOST_API}?slug=${encodeURIComponent(slug)}`),
        authorId ? fetch(`${FOLLOW_API}?authorId=${encodeURIComponent(authorId)}`) : null,
        fetch(`${COMMENTS_API}?slug=${encodeURIComponent(slug)}&count=1`),
      ]);
      const [likesData, bookmarksData, repostsData, followsData, commentsData] = await Promise.all([
        likesRes.json(),
        bookmarksRes.json(),
        repostsRes.json(),
        followsRes ? followsRes.json() : Promise.resolve({ success: false }),
        commentsRes.json(),
      ]);

      if (likesData.success) {
        likeBtn?.classList.toggle('is-active', likesData.data.liked);
        likeBtn?.setAttribute('aria-pressed', String(likesData.data.liked));
        if (likeCount) likeCount.textContent = String(likesData.data.count);
      }
      if (bookmarksData.success) {
        bookmarkBtn?.classList.toggle('is-active', bookmarksData.data.bookmarked);
        bookmarkBtn?.setAttribute('aria-pressed', String(bookmarksData.data.bookmarked));
      }
      if (repostsData.success) {
        repostBtn?.classList.toggle('is-active', repostsData.data.reposted);
        repostBtn?.setAttribute('aria-pressed', String(repostsData.data.reposted));
        if (repostCount) repostCount.textContent = String(repostsData.data.count);
      }
      if (followsData.success) {
        setFollowState(followsData.data.following, followsData.data.count);
      }
      if (commentsData.success) {
        setCommentsCount(commentsData.data.count || 0);
      }
    } catch (error) {
      console.error('Failed to load story state:', error);
    }
  }

  commentsBtn?.addEventListener('click', () => {
    document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  buildShareLinks();
  (async () => {
    await checkAuth();
    initFollow();
    loadComments();
    initState();

    // Track View
    try {
      await fetch('/api/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
    } catch (e) {
      console.error('Failed to track view', e);
    }

    // Track Read
    let readTracked = false;
    const postContent = document.querySelector('.post-content');
    if (postContent) {
      const observer = new IntersectionObserver(
        async (entries) => {
          if (entries[0].isIntersecting && !readTracked) {
            readTracked = true;
            try {
              await fetch('/api/reading-history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleSlug: slug, progress: 100 }),
              });
            } catch (e) {
              console.error('Failed to track read', e);
            }
          }
        },
        { threshold: 0.1 }
      );

      // Observe the last element in the article, or the article itself if small
      const lastChild = postContent.lastElementChild;
      if (lastChild) {
        observer.observe(lastChild);
      } else {
        observer.observe(postContent);
      }
    }
  })();
}); // end astro:page-load
