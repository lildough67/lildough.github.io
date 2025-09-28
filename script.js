/* script.js -- renders grid, wiring for search & categories */
(function () {
  const productsSection = document.getElementById('products-section');
  const searchInput = document.querySelector('.search');
  const breadcrumbEl = document.getElementById('breadcrumb');
  const countEl = document.getElementById('product-count');

  let allProducts = window.PRODUCTS || [];
  let currentCategory = null;   // e.g. "sneakers" or null => show all
  let currentSearch = '';

  function formatMoney(n) {
    return '$' + Number(n).toLocaleString();
  }

  function renderProducts(list) {
    if (!Array.isArray(list)) list = [];
    countEl.textContent = `${list.length} Products`;

    // if a category is selected, show breadcrumb text (it is set elsewhere)
    productsSection.innerHTML = `
      <div class="grid">
        ${list.map(p => `
          <a class="product-card" href="product.html?id=${encodeURIComponent(p.id)}" data-cats="${p.categories.join(' ')}">
            <img src="${p.image}" alt="${escapeHtml(p.name)}" onerror="this.onerror=null;this.src='https://picsum.photos/seed/${encodeURIComponent(p.id)}/800/800'">
            <h3>${escapeHtml(p.name)}</h3>
            <p>${escapeHtml(p.colors)}</p>
            <div class="price">${formatMoney(p.price)}</div>
          </a>
        `).join('')}
      </div>
    `;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }

  function applyFilters() {
    let filtered = allProducts.slice();

    if (currentCategory && currentCategory !== 'all') {
      filtered = filtered.filter(p => p.categories.includes(currentCategory));
    }

    if (currentSearch && currentSearch.trim() !== '') {
      const term = currentSearch.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.colors.toLowerCase().includes(term) ||
        p.categories.join(' ').toLowerCase().includes(term)
      );
    }

    renderProducts(filtered);
  }

  // wire search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value || '';
      // reset breadcrumb when searching? We'll keep category but you can decide
      applyFilters();
      // When in "all" mode, show count; otherwise keep breadcrumb text + count
      if (!currentCategory || currentCategory === 'all') {
        breadcrumbEl.textContent = 'ALL PRODUCTS';
      }
    });
  }

  // wire category links (delegate)
  document.querySelectorAll('[data-category-link]').forEach(link => {
    link.addEventListener('click', (ev) => {
      ev.preventDefault();
      const cat = link.getAttribute('data-category-link');
      const bc = link.getAttribute('data-breadcrumb') || (cat || '').toUpperCase();

      currentCategory = cat === 'all' ? null : cat;
      breadcrumbEl.textContent = bc;
      applyFilters();
    });
  });

  // clicking breadcrumb resets to all
  breadcrumbEl.addEventListener('click', () => {
    currentCategory = null;
    breadcrumbEl.textContent = 'ALL PRODUCTS';
    applyFilters();
  });

  // initial render
  applyFilters();

})();
