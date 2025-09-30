/* script.js -- renders grid, wiring for search & categories */
(function () {
  const productsSection = document.getElementById('products-section');
  const breadcrumbEl = document.getElementById('breadcrumb');
  const countEl = document.getElementById('product-count');
  const controlsLeft = document.getElementById('controlsLeft');
  const headerEl = document.querySelector('.navbar');
  const controlsEl = document.querySelector('.controls');

  let allProducts = window.PRODUCTS || [];
  let currentCategory = null;
  let currentSearch = '';

  function formatMoney(n) {
    return '$' + Number(n).toLocaleString();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }

   function renderProducts(list) {
    if (!Array.isArray(list)) list = [];
    countEl.textContent = `${list.length} Products`;

    productsSection.innerHTML = `
      <div class="grid">
        ${list.map(p => {
          const imgs = p.images && p.images.length ? p.images : [p.image];
          return `
            <div class="product-card" data-cats="${p.categories.join(' ')}">
              <a href="product.html?id=${encodeURIComponent(p.id)}" class="card-link">
                <div class="card-img-wrap">
                  <img src="${imgs[0]}" data-index="0"
                       alt="${escapeHtml(p.name)}"
                       onerror="this.onerror=null;this.src='https://picsum.photos/seed/${encodeURIComponent(p.id)}/800/800'">
                  <button class="img-prev">&lt;</button>
                  <button class="img-next">&gt;</button>
                </div>
                <h3>${escapeHtml(p.name)}</h3>
                <p>${escapeHtml(p.colors)}</p>
                <div class="price">${formatMoney(p.price)}</div>
              </a>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // attach arrow listeners for cycling images
    document.querySelectorAll('.product-card').forEach((card, i) => {
      const product = list[i];
      const imgs = product.images && product.images.length ? product.images : [product.image];
      let index = 0;
      const imgEl = card.querySelector('img');
      const prevBtn = card.querySelector('.img-prev');
      const nextBtn = card.querySelector('.img-next');

      function showImg(idx) {
        index = (idx + imgs.length) % imgs.length;
        imgEl.src = imgs[index];
        imgEl.setAttribute("data-index", index);
      }

      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showImg(index - 1);
      });

      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showImg(index + 1);
      });
    });
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

  // category link wiring
  document.querySelectorAll('[data-category-link]').forEach(link => {
    link.addEventListener('click', (ev) => {
      ev.preventDefault();
      const cat = link.getAttribute('data-category-link');
      const bc = link.getAttribute('data-breadcrumb') || (cat || '').toUpperCase();

      currentCategory = cat === 'all' ? null : cat;
      breadcrumbEl.textContent = bc;
      applyFilters();

      // close sidebar if a category was clicked
      if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
        restoreBreadcrumb();
      }
    });
  });

  // breadcrumb binding
  function bindBreadcrumb() {
    if (breadcrumbEl) {
      breadcrumbEl.onclick = () => {
        currentCategory = null;
        breadcrumbEl.textContent = 'ALL PRODUCTS';
        applyFilters();
      };
    }
  }
  bindBreadcrumb();

  // Sidebar toggle
  const exploreToggle = document.getElementById('exploreToggle');
  const sidebar = document.getElementById('exploreSidebar');
  const closeSidebar = document.getElementById('closeSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const breadcrumbDefaultHTML = breadcrumbEl ? breadcrumbEl.innerHTML : 'ALL PRODUCTS';

  function showControlsSearch() {
    if (!breadcrumbEl) return;
    breadcrumbEl.onclick = null; // disable breadcrumb reset while search active
    breadcrumbEl.innerHTML = `
      <input id="controlsSearch" class="controls-search" type="search"
             placeholder="Search products..." aria-label="Search products">
    `;
    const searchInput = document.getElementById('controlsSearch');
    if (searchInput) {
      searchInput.value = currentSearch || '';
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value || '';
        applyFilters();
      });
      searchInput.focus();
    }
  }

  function restoreBreadcrumb() {
    if (!breadcrumbEl) return;
    breadcrumbEl.innerHTML = breadcrumbDefaultHTML;
    bindBreadcrumb();
  }

  function positionSidebarOverlay() {
    const headerH = headerEl ? headerEl.offsetHeight : 0;
    const controlsH = controlsEl ? controlsEl.offsetHeight : 0;
    const topPx = headerH + controlsH;
    if (sidebar) {
      sidebar.style.top = `${topPx}px`;
      sidebar.style.height = `calc(100% - ${topPx}px)`;
    }
    if (overlay) {
      overlay.style.top = `${topPx}px`;
      overlay.style.height = `calc(100% - ${topPx}px)`;
    }
  }

  if (exploreToggle && sidebar && closeSidebar && overlay) {
    exploreToggle.addEventListener('click', (e) => {
      e.preventDefault();
      showControlsSearch();
      positionSidebarOverlay();
      sidebar.classList.add('open');
      overlay.classList.add('show');
      sidebar.setAttribute('aria-hidden', 'false');
      overlay.setAttribute('aria-hidden', 'false');
    });

    function closeSide() {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
      sidebar.setAttribute('aria-hidden', 'true');
      overlay.setAttribute('aria-hidden', 'true');
      restoreBreadcrumb();
      positionSidebarOverlay();
    }

    closeSidebar.addEventListener('click', closeSide);
    overlay.addEventListener('click', closeSide);
    window.addEventListener('resize', () => {
      if (sidebar.classList.contains('open')) {
        positionSidebarOverlay();
      }
    });
  }

  // initial position
  window.addEventListener('load', positionSidebarOverlay);

  // NEW: check for category in URL
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('category');
  if (catParam) {
    currentCategory = catParam === 'all' ? null : catParam;
    breadcrumbEl.textContent = catParam.toUpperCase();
  }

  // initial render
  applyFilters();
})();
