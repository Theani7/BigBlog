document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('blog-search');
  const tagFilters = document.querySelectorAll('.tag-filter');
  const postCards = document.querySelectorAll('.post-card');
  const noResults = document.getElementById('blog-no-results');
  const tagCount = document.getElementById('tag-count');

  function getActiveTags() {
    const active = [];
    tagFilters.forEach((btn) => {
      if (btn.classList.contains('active')) {
        active.push(btn.dataset.tag);
      }
    });
    return active;
  }

  function filterPosts() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const activeTags = getActiveTags();
    let visibleCount = 0;

    postCards.forEach((card) => {
      const title = (card.querySelector('.post-title')?.textContent || '').toLowerCase();
      const description = (card.querySelector('.post-description')?.textContent || '').toLowerCase();
      const tags = card.dataset.tags ? card.dataset.tags.split(',').map((t) => t.trim().toLowerCase()) : [];

      const matchesSearch = !query || title.includes(query) || description.includes(query);
      const matchesTags = activeTags.length === 0 || activeTags.some((tag) => tags.includes(tag.toLowerCase()));

      if (matchesSearch && matchesTags) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (noResults) {
      noResults.style.display = visibleCount === 0 ? '' : 'none';
    }

    if (tagCount) {
      tagCount.textContent = `${visibleCount} post${visibleCount !== 1 ? 's' : ''}`;
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterPosts);
  }

  tagFilters.forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      filterPosts();
    });
  });

  filterPosts();
});