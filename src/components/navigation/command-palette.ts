(() => {
  interface SearchPost {
    title: string;
    description: string;
    slug: string;
    tags: string[];
    category: string;
  }

  interface CategoryItem {
    name: string;
    count: number;
  }

  interface ArticleItem {
    title: string;
    description: string;
    url: string;
    tags: string[];
    category: string;
    _content: string;
  }

  interface RecentItem {
    url: string;
    title: string;
    time: number;
  }

  let indexPromise: Promise<SearchPost[]> | null = null;

  function loadSearchIndex(): Promise<SearchPost[]> {
    if (indexPromise) return indexPromise;
    indexPromise = fetch('/api/search-index.json')
      .then((r) => r.json())
      .then((data: SearchPost[]) => data)
      .catch(() => []);
    return indexPromise;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const palette = document.getElementById('command-palette');
    const input = palette?.querySelector<HTMLInputElement>('[data-command-input]');
    const navList = palette?.querySelector('[data-navigation-list]');
    const categoriesList = palette?.querySelector('[data-categories-list]');
    const articlesList = palette?.querySelector<HTMLElement>('[data-articles-list]');
    const recentList = palette?.querySelector<HTMLElement>('[data-recent-list]');
    const recentSection = palette?.querySelector('[data-section-recent]');
    const articlesSection = palette?.querySelector('[data-section-articles]');
    const emptySection = palette?.querySelector('[data-section-empty]');
    const backdrop = palette?.querySelector('.command-palette-backdrop');

    if (!palette || !input || !navList || !articlesList || !recentList) return;

    let categories: CategoryItem[] = [];
    let articles: ArticleItem[] = [];
    let indexLoaded = false;

    const recentKey = 'command-palette-recent';
    const getRecent = (): RecentItem[] => {
      try {
        return JSON.parse(localStorage.getItem(recentKey) || '[]');
      } catch {
        return [];
      }
    };
    const addRecent = (url: string, title: string) => {
      const recent = getRecent().filter((r) => r.url !== url);
      recent.unshift({ url, title, time: Date.now() });
      localStorage.setItem(recentKey, JSON.stringify(recent.slice(0, 5)));
    };

    const buildCategories = (index: SearchPost[]): CategoryItem[] => {
      const cats = new Map<string, number>();
      index.forEach((post) => {
        if (!cats.has(post.category)) cats.set(post.category, 0);
        cats.set(post.category, (cats.get(post.category) || 0) + 1);
      });
      return Array.from(cats.entries()).map(([cat, count]) => ({
        name: cat,
        count,
      }));
    };

    const buildArticleIndex = (index: SearchPost[]): ArticleItem[] => {
      return index.map((post) => ({
        title: post.title,
        description: post.description,
        url: `/p/${post.slug}`,
        tags: post.tags,
        category: post.category,
        _content:
          `${post.title} ${post.description} ${post.tags.join(' ')} ${post.category}`.toLowerCase(),
      }));
    };

    const escapeHtml = (value: string): string =>
      value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const ensureCategories = () => {
      if (!categoriesList) return;
      if (categoriesList.children.length > 0) return;
      if (categories.length === 0 && indexLoaded) {
        categoriesList.innerHTML =
          '<li class="command-item"><span class="command-item-label" style="color:var(--text-tertiary)">No categories</span></li>';
        return;
      }
      categories.forEach((cat) => {
        const li = document.createElement('li');
        li.className = 'command-item';
        li.dataset.type = 'category';
        li.innerHTML = `
          <span class="command-item-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </span>
          <span class="command-item-label">${escapeHtml(cat.name)}</span>
          <span class="command-item-hint">${cat.count} article${cat.count !== 1 ? 's' : ''}</span>
        `;
        li.addEventListener('click', () => {
          input.value = cat.name;
          filterCommands(cat.name);
          input.focus();
        });
        categoriesList.appendChild(li);
      });
    };

    const ensureIndex = async () => {
      if (indexLoaded) return;
      const index = await loadSearchIndex();
      if (Array.isArray(index)) {
        categories = buildCategories(index);
        articles = buildArticleIndex(index);
      }
      indexLoaded = true;
      ensureCategories();
    };

    const open = () => {
      palette.hidden = false;
      palette.removeAttribute('hidden');
      ensureIndex();
      window.requestAnimationFrame(() => {
        input.value = '';
        filterCommands('');
        input.focus();
      });
      document.body.style.overflow = 'hidden';
      palette.setAttribute('aria-hidden', 'false');
    };

    const close = () => {
      palette.hidden = true;
      palette.setAttribute('hidden', '');
      palette.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      input.blur();
    };

    const isOpen = () => {
      return !palette.hidden && !palette.hasAttribute('hidden');
    };

    const fuzzyMatch = (query: string, text: string) => {
      if (!query) return true;
      const q = query.toLowerCase().trim();
      const words = q.split(/\s+/).filter(Boolean);
      return words.every((word) => text.includes(word));
    };

    const filterCommands = (query: string) => {
      const allItems = palette.querySelectorAll<HTMLElement>('.command-item');
      allItems.forEach((item) => {
        const label = item.querySelector('.command-item-label')?.textContent || '';
        const hint = item.querySelector('.command-item-hint')?.textContent || '';
        const match = fuzzyMatch(query, `${label} ${hint}`.toLowerCase());
        item.style.display = match ? '' : 'none';
      });

      const catItems = categoriesList?.querySelectorAll<HTMLElement>('.command-item') || [];
      catItems.forEach((item) => {
        const label = item.querySelector('.command-item-label')?.textContent || '';
        item.style.display = fuzzyMatch(query, label.toLowerCase()) ? '' : 'none';
      });

      if (query.length >= 2 && articles.length > 0) {
        const matched = articles.filter((a) => fuzzyMatch(query, a._content)).slice(0, 5);

        if (matched.length > 0) {
          articlesSection?.removeAttribute('hidden');
          articlesList.innerHTML = matched
            .map(
              (a) => `
            <li class="command-item" data-type="article" data-url="${escapeHtml(a.url)}">
              <span class="command-item-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </span>
              <span class="command-item-label">${escapeHtml(a.title)}</span>
              <span class="command-item-hint">${escapeHtml(a.category)}</span>
            </li>
          `
            )
            .join('');
        } else {
          articlesSection?.setAttribute('hidden', '');
        }
      } else {
        articlesSection?.setAttribute('hidden', '');
      }

      const recent = getRecent();
      if (recent.length > 0 && !query) {
        recentSection?.removeAttribute('hidden');
        recentList.innerHTML = recent
          .map(
            (r) => `
          <li class="command-item" data-type="recent" data-url="${escapeHtml(r.url)}">
            <span class="command-item-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </span>
            <span class="command-item-label">${escapeHtml(r.title)}</span>
            <span class="command-item-hint">Recent</span>
          </li>
        `
          )
          .join('');
      } else {
        recentSection?.setAttribute('hidden', '');
      }

      const visibleItems = palette.querySelectorAll<HTMLElement>(
        '.command-item:not([style*="display: none"])'
      );
      const hasResults = visibleItems.length > 0;
      emptySection?.toggleAttribute('hidden', hasResults);

      activeIndex = 0;
      updateActiveItem();
    };

    let activeIndex = 0;

    const updateActiveItem = () => {
      const items = palette.querySelectorAll<HTMLElement>(
        '.command-item:not([style*="display: none"])'
      );
      items.forEach((item, i) => {
        item.classList.toggle('command-item--active', i === activeIndex);
        if (i === activeIndex) item.scrollIntoView({ block: 'nearest' });
      });
    };

    const executeItem = (item: HTMLElement) => {
      const url = item.dataset.url;
      if (!url) return;
      const label = item.querySelector('.command-item-label')?.textContent || '';
      addRecent(url, label);
      window.location.href = url;
    };

    input.addEventListener('input', () => {
      filterCommands(input.value);
    });

    input.addEventListener('keydown', (e) => {
      const items = palette.querySelectorAll<HTMLElement>(
        '.command-item:not([style*="display: none"])'
      );
      const count = items.length;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          activeIndex = (activeIndex + 1) % count;
          updateActiveItem();
          break;
        case 'ArrowUp':
          e.preventDefault();
          activeIndex = (activeIndex - 1 + count) % count;
          updateActiveItem();
          break;
        case 'Enter': {
          e.preventDefault();
          const activeItem = items[activeIndex];
          if (activeItem) executeItem(activeItem);
          break;
        }
        case 'Escape':
          e.preventDefault();
          close();
          break;
      }
    });

    palette.querySelectorAll<HTMLElement>('.command-item').forEach((item) => {
      item.addEventListener('click', () => executeItem(item));
    });

    backdrop?.addEventListener('click', close);

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen()) close();
        else open();
      }
      if (e.key === 'Escape' && isOpen()) {
        close();
      }
    });

    document.addEventListener('click', (e) => {
      const target = e.target;
      const searchBtn =
        target instanceof Element ? target.closest('[data-command-palette-trigger]') : null;
      if (searchBtn) {
        e.preventDefault();
        open();
      }
    });

    (
      window as unknown as { commandPalette: { open: () => void; close: () => void } }
    ).commandPalette = {
      open,
      close,
    };
  });
})();
