// ===== Globals / State =====
const currentYear = new Date().getFullYear();
let navigationHistory = [];
let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
let searchIndex = [];

// DOM cache
let bodyEl, themeToggle, mobileToggle, sidebar, filterBtn, filterPanel;
let searchBox, navigationArea, contentArea;
let recentSearchesList, previewModal, modalTitle, modalCloseBtn;

// Category display names
const categoryNames = {
  'all-masters': 'All Masters Yearwise',
  'front-pages': 'All Masters Front Pages Yearwise',
  'society': 'Society',
  'smc': 'School Managing Committee',
  'pta-ec': 'PTA (EC)',
  'pta-gb': 'PTA (GB)',
  'fee-regulation': 'School-Level Fee Regulation Committees',
  'staff-directory': 'Staff Directory',
  'attendance': 'Attendance',
  'leave': 'Leave Management'
};

// Front page subcategories config
const frontPageSubcategories = [
  { id: 'school-undertaking', name: 'School Under taking' },
  { id: 'master-index', name: 'Master Index' },
  { id: 'specimen-signature', name: 'Specimen Signature' },
  { id: 'school-id-email', name: 'School Id & School E-mail' },
  { id: 'class-enrollment', name: 'Class wise Enrollment of Students' },
  { id: 'staff-academic', name: 'Staff Statement (Academic)' },
  { id: 'staff-academic-contractual', name: 'Staff Statement (Academic - Contractual)' },
  { id: 'staff-non-academic', name: 'Staff Statement (Non - Academic)' },
  { id: 'staff-non-academic-contractual', name: 'Staff Statement (Non - Academic - Contractual)' },
  { id: 'staff-group-d', name: 'Staff Statement (Group - D)' },
  { id: 'management-committee', name: 'Members of Management Committee' },
  { id: 'fdr-copy', name: 'Copy of FDR' },
  { id: 'fee-structure', name: 'Fee Structure' },
  { id: 'school-area', name: 'Statement Regarding School Area' },
  { id: 'building-utilization', name: 'Building Utilization' },
  { id: 'noc-fire', name: 'NOC(Fire Safety)' },
  { id: 'special-activities', name: 'Special Activities' },
  { id: 'playground', name: 'Playground' },
  { id: 'scheme-management', name: 'Scheme of Management' },
  { id: 'building-fitness', name: 'Building Fitness Certificate' },
  { id: 'infrastructure', name: 'Infrastructure of Building' },
  { id: 'ec-copy', name: 'Copy of EC (Essentiality Certificate)' },
  { id: 'recognition-copy', name: 'Copy of Recognization' },
  { id: 'upgradation-copy', name: 'Copy of Upgradation' },
  { id: 'health-certificate', name: 'Copy of School Health Certificate' },
  { id: 'rwh-certificate', name: 'RWH Certificate (Rain Water Harvesting)' },
  { id: 'classroom-details', name: 'Detail of Classrooms' },
  { id: 'ews-dg', name: 'EWS - DG' },
  { id: 'library', name: 'Library' },
  { id: 'physics-lab', name: 'Physics Lab' },
  { id: 'chemistry-lab', name: 'Chemistry Lab' },
  { id: 'biology-lab', name: 'Biology Lab' },
  { id: 'composite-lab', name: 'Composite Lab' },
  { id: 'dmsss-certificate', name: 'DMSSS Certificate (No Commercial use of School Campus)' }
];

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
  cacheDom();
  initTheme();
  initSidebarToggle();
  initFilterPanel();
  initCategoryToggles();
  initNavLinks();
  initSearch();
  initModalHandlers();
  initGlobalContentClickHandlers();
  initLogoHome();
  buildSearchIndex();
  updateRecentSearchesUI();

  // Initial history state: Dashboard/Home
  navigationHistory = [{
    type: 'home',
    name: 'Home',
    render: renderDashboard
  }];
  renderDashboard();
  updateBreadcrumb();
});

// ===== DOM Helpers =====
function cacheDom() {
  bodyEl = document.body;
  themeToggle = document.getElementById('themeToggle');
  mobileToggle = document.getElementById('mobileToggle');
  sidebar = document.getElementById('sidebar');
  filterBtn = document.getElementById('filterBtn');
  filterPanel = document.getElementById('filterPanel');
  searchBox = document.getElementById('searchBox');
  navigationArea = document.getElementById('navigationArea');
  contentArea = document.getElementById('contentArea');
  recentSearchesList = document.getElementById('recentSearchesList');
  previewModal = document.getElementById('previewModal');
  modalTitle = document.getElementById('modalTitle');
  modalCloseBtn = document.getElementById('modalCloseBtn');
}

// ===== Theme =====
function initTheme() {
  if (localStorage.getItem('theme') === 'dark') {
    bodyEl.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
  }

  themeToggle.addEventListener('click', () => {
    bodyEl.classList.toggle('dark-mode');
    const isDark = bodyEl.classList.contains('dark-mode');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

// ===== Sidebar / Navigation =====
function initSidebarToggle() {
  mobileToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });

  document.addEventListener('click', e => {
    if (window.innerWidth <= 768) {
      if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
        sidebar.classList.add('collapsed');
      }
    }
  });
}

function initCategoryToggles() {
  const configs = [
    { headerId: 'schoolBoardHeader', listId: 'schoolBoardList' },
    { headerId: 'masterHeader', listId: 'masterList' },
    { headerId: 'staffHeader', listId: 'staffList' }
  ];

  configs.forEach(cfg => {
    const header = document.getElementById(cfg.headerId);
    const list = document.getElementById(cfg.listId);
    header.addEventListener('click', () => {
      header.classList.toggle('expanded');
      list.classList.toggle('expanded');
    });
  });

  // Auto expand School Board on load
  document.getElementById('schoolBoardHeader').classList.add('expanded');
  document.getElementById('schoolBoardList').classList.add('expanded');
}

function initNavLinks() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const category = link.getAttribute('data-category');
      const name = categoryNames[category] || link.textContent.trim();

      setActiveNav(category);

      const state = {
        type: 'category',
        category,
        name,
        render: () => renderCategory(category, name)
      };
      pushState(state);
      state.render();

      if (window.innerWidth <= 768) {
        sidebar.classList.add('collapsed');
      }
    });
  });
}

function setActiveNav(category) {
  const links = document.querySelectorAll('.nav-link');
  links.forEach(a => {
    if (category && a.dataset.category === category) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
}

function initLogoHome() {
  const logo = document.getElementById('logoHome');
  if (!logo) return;
  logo.addEventListener('click', () => {
    navigationHistory = [{
      type: 'home',
      name: 'Home',
      render: renderDashboard
    }];
    setActiveNav(null);
    renderDashboard();
    updateBreadcrumb();
  });
}

// ===== Filter Panel (UI only) =====
function initFilterPanel() {
  filterBtn.addEventListener('click', e => {
    e.stopPropagation();
    filterPanel.classList.toggle('active');
  });

  document.addEventListener('click', e => {
    if (!filterPanel.contains(e.target) && e.target !== filterBtn) {
      filterPanel.classList.remove('active');
    }
  });
}

// ===== History & Breadcrumb =====
function pushState(state) {
  navigationHistory.push(state);
  updateBreadcrumb();
}

function updateBreadcrumb() {
  if (navigationHistory.length === 0) return;

  let html = '<div class="breadcrumb-nav">';
  navigationHistory.forEach((item, index) => {
    const isLast = index === navigationHistory.length - 1;
    if (!isLast) {
      html += `<a href="#" data-bc-index="${index}">${item.name}</a><span>/</span>`;
    } else {
      html += `<span>${item.name}</span>`;
    }
  });
  html += '</div>';

  if (navigationHistory.length > 1) {
    html += '<button class="back-button" id="backButton">← Back</button>';
  }

  navigationArea.innerHTML = html;

  const backBtn = document.getElementById('backButton');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (navigationHistory.length > 1) {
        navigationHistory.pop();
        const current = navigationHistory[navigationHistory.length - 1];
        current.render();
        updateBreadcrumb();
      }
    });
  }

  navigationArea.querySelectorAll('a[data-bc-index]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const index = parseInt(link.getAttribute('data-bc-index'), 10);
      navigationHistory = navigationHistory.slice(0, index + 1);
      const current = navigationHistory[navigationHistory.length - 1];
      current.render();
      updateBreadcrumb();
    });
  });
}

// ===== Status Helpers =====
function getStatusForYear(year) {
  const y = Number(year);
  if (!y) return null;
  if (y === currentYear) return 'new';
  if (y === currentYear - 1) return 'updated';
  if (y < 2000) return 'archived';
  return null;
}

function getStatusBadge(status) {
  if (!status) return '';
  const labels = { new: 'New', updated: 'Updated', archived: 'Archived' };
  return `<span class="status-badge status-${status}">${labels[status]}</span>`;
}

// ===== Dashboard =====
function renderDashboard() {
  contentArea.innerHTML = `
    <div class="header">
      <h1>Admin Dashboard</h1>
      <p class="subtitle">Quick access to the most used records and recent documents.</p>
    </div>

    <div class="dashboard">
      <div class="dashboard-row">
        <div class="dashboard-card primary" id="goCurrentMaster">
          <h3>Current Session Master</h3>
          <p>Open ${currentYear}-${(currentYear + 1).toString().slice(2)} master file</p>
        </div>
        <div class="dashboard-card" id="goCurrentSMC">
          <h3>SMC (${currentYear}-${currentYear + 1})</h3>
          <p>View committee details and records</p>
        </div>
        <div class="dashboard-card" id="goFeeRegulation">
          <h3>Fee Regulation Committee</h3>
          <p>View latest fee regulation records</p>
        </div>
      </div>

      <div class="dashboard-row">
        <div class="dashboard-card wide">
          <h3>Recently Opened Documents</h3>
          <div id="recentDocsList"></div>
        </div>
      </div>
    </div>
  `;

  attachDashboardEvents();
  renderRecentDocs();
}

function attachDashboardEvents() {
  const goCurrentMaster = document.getElementById('goCurrentMaster');
  const goCurrentSMC = document.getElementById('goCurrentSMC');
  const goFeeRegulation = document.getElementById('goFeeRegulation');

  if (goCurrentMaster) {
    goCurrentMaster.addEventListener('click', () => {
      const name = categoryNames['all-masters'];
      setActiveNav('all-masters');
      const state = {
        type: 'category',
        category: 'all-masters',
        name,
        render: () => renderCategory('all-masters', name)
      };
      pushState(state);
      state.render();
      // After list renders, automatically open current year if exists
      if (window.masterDocuments && window.masterDocuments[currentYear]) {
        openMasterYear(currentYear);
      }
    });
  }

  if (goCurrentSMC) {
    goCurrentSMC.addEventListener('click', () => {
      const name = categoryNames['smc'];
      setActiveNav('smc');
      const state = {
        type: 'category',
        category: 'smc',
        name,
        render: () => renderCategory('smc', name)
      };
      pushState(state);
      state.render();
    });
  }

  if (goFeeRegulation) {
    goFeeRegulation.addEventListener('click', () => {
      const name = categoryNames['fee-regulation'];
      setActiveNav('fee-regulation');
      const state = {
        type: 'category',
        category: 'fee-regulation',
        name,
        render: () => renderCategory('fee-regulation', name)
      };
      pushState(state);
      state.render();
    });
  }
}

// ===== Category Rendering =====
function renderCategory(category, categoryName) {
  if (category === 'all-masters') {
    renderAllMastersYears(categoryName);
  } else if (category === 'front-pages') {
    renderFrontPages(categoryName);
  } else if (window.schoolData && window.schoolData[category]) {
    renderYearWiseCategory(category, categoryName);
  } else {
    renderPlaceholder(categoryName);
  }
}

function renderAllMastersYears(categoryName) {
  let html = `
    <div class="header">
      <h1>${categoryName}</h1>
      <p class="subtitle">Select a year to view master documents.</p>
    </div>
    <div class="year-grid">
  `;

  for (let y = currentYear; y >= 1995; y--) {
    const status = getStatusForYear(y);
    html += `
      <div class="year-card" data-master-year="${y}">
        ${getStatusBadge(status)}
        <h3>${y}-${(y + 1).toString().slice(2)}</h3>
        <p>Master File</p>
      </div>
    `;
  }

  html += '</div>';
  contentArea.innerHTML = html;
}

function renderFrontPages(categoryName) {
  let html = `
    <div class="header">
      <h1>${categoryName}</h1>
      <p class="subtitle">Select a front-page document type.</p>
    </div>
    <div class="subcategory-grid">
  `;

  frontPageSubcategories.forEach(subcat => {
    html += `
      <div class="subcategory-card"
           data-front-subcat-id="${subcat.id}"
           data-front-subcat-name="${subcat.name}">
        <h4>${subcat.name}</h4>
        <p>View year-wise documents.</p>
      </div>
    `;
  });

  html += '</div>';
  contentArea.innerHTML = html;
}

function renderYearWiseCategory(category, categoryName) {
  const years = window.schoolData[category] || [];
  let html = `
    <div class="header">
      <h1>${categoryName}</h1>
      <p class="subtitle">Select a year to view details.</p>
    </div>
    <div class="year-grid">
  `;

  years.forEach(item => {
    const firstYear = parseInt((item.year || '').split('-')[0], 10) || null;
    const status = firstYear ? getStatusForYear(firstYear) : null;
    html += `
      <div class="year-card"
           data-board-category="${category}"
           data-board-year="${item.year}">
        ${getStatusBadge(status)}
        <h3>${item.year}</h3>
        <p>${item.members || '—'} Members</p>
      </div>
    `;
  });

  html += '</div>';
  contentArea.innerHTML = html;
}

function renderPlaceholder(categoryName) {
  contentArea.innerHTML = `
    <div class="header">
      <h1>${categoryName}</h1>
      <p class="subtitle">Content coming soon.</p>
    </div>
    <div class="dashboard">
      <div class="dashboard-row">
        <div class="dashboard-card wide">
          <h3>${categoryName}</h3>
          <p>This section is under development. More details and documents will be added.</p>
        </div>
      </div>
    </div>
  `;
}

// ===== Master Documents =====
function openMasterYear(year) {
  const state = {
    type: 'year-master',
    year,
    name: `Master ${year}`,
    render: () => renderMasterDocuments(year)
  };
  pushState(state);
  state.render();
}

function renderMasterDocuments(year) {
  let html = `
    <div class="header">
      <h1>Master Documents - ${year}</h1>
      <p class="subtitle">Download & preview master PDFs.</p>
    </div>
    <div class="document-list">
  `;

  const docs = window.masterDocuments && window.masterDocuments[year];

  if (docs && docs.length) {
    docs.forEach(doc => {
      const iconData = getDocIcon(doc.type || 'pdf');
      const pages = doc.pages || 'N/A';
      const size = doc.size || 'PDF';
      const date = doc.date || 'Yearly';

      html += `
        <div class="document-item"
             data-doc-name="${escapeHtml(doc.name)}"
             data-doc-url="${encodeURI(doc.url)}"
             data-doc-year="${year}"
             data-doc-category="Master">
          <div class="document-preview">
            <div class="preview-image">${iconData.icon}</div>
            <div class="preview-info">
              📄 ${pages} pages<br>
              💾 ${size}
            </div>
          </div>
          <div class="document-info">
            <div class="document-icon ${iconData.class}">${iconData.icon}</div>
            <div class="document-details">
              <h4>${doc.name}</h4>
              <div class="document-meta">
                <span>📄 ${pages} pages</span>
                <span>💾 ${size}</span>
                <span>📅 ${date}</span>
              </div>
            </div>
          </div>
          <div class="document-action">Preview →</div>
        </div>
      `;
    });
  } else {
    html += `
      <div class="dashboard">
        <div class="dashboard-row">
          <div class="dashboard-card wide">
            <h3>No documents available</h3>
            <p>Documents for ${year} will be added soon.</p>
          </div>
        </div>
      </div>
    `;
  }

  html += '</div>';
  contentArea.innerHTML = html;
}

// ===== Front-page Subcategory Year & Docs =====
function openFrontSubcat(subcatId, subcatName) {
  const state = {
    type: 'front-subcat',
    subcatId,
    name: subcatName,
    render: () => renderSubcategoryYears(subcatId, subcatName)
  };
  pushState(state);
  state.render();
}

function renderSubcategoryYears(subcatId, subcatName) {
  let html = `
    <div class="header">
      <h1>${subcatName}</h1>
      <p class="subtitle">Select a year.</p>
    </div>
    <div class="year-grid">
  `;

  for (let y = currentYear + 1; y >= 1995; y--) {
    const status = getStatusForYear(y);
    html += `
      <div class="year-card"
           data-front-year="${y}"
           data-front-subcat-id="${subcatId}"
           data-front-subcat-name="${subcatName}">
        ${getStatusBadge(status)}
        <h3>${y}</h3>
        <p>Documents</p>
      </div>
    `;
  }

  html += '</div>';
  contentArea.innerHTML = html;
}

function openFrontSubcatYear(subcatId, subcatName, year) {
  const state = {
    type: 'front-subcat-year',
    subcatId,
    subcatName,
    year,
    name: `${subcatName} - ${year}`,
    render: () => renderSubcategoryDocuments(subcatId, subcatName, year)
  };
  pushState(state);
  state.render();
}

function renderSubcategoryDocuments(subcatId, subcatName, year) {
  let html = `
    <div class="header">
      <h1>${subcatName} - ${year}</h1>
      <p class="subtitle">Download & preview documents.</p>
    </div>
    <div class="document-list">
  `;

  const docs = window.frontPageDocuments &&
               window.frontPageDocuments[subcatId] &&
               window.frontPageDocuments[subcatId][year];

  if (docs && docs.length) {
    docs.forEach(doc => {
      const iconData = getDocIcon(doc.type || 'pdf');
      const pages = doc.pages || '10';
      const size = doc.size || '500 KB';
      const date = doc.date || 'Jan ' + year;

      html += `
        <div class="document-item"
             data-doc-name="${escapeHtml(doc.name)}"
             data-doc-url="${encodeURI(doc.url)}"
             data-doc-year="${year}"
             data-doc-category="${escapeHtml(subcatName)}">
          <div class="document-preview">
            <div class="preview-image">${iconData.icon}</div>
            <div class="preview-info">
              📄 ${pages} pages<br>
              💾 ${size}
            </div>
          </div>
          <div class="document-info">
            <div class="document-icon ${iconData.class}">${iconData.icon}</div>
            <div class="document-details">
              <h4>${doc.name}</h4>
              <div class="document-meta">
                <span>📄 ${pages} pages</span>
                <span>💾 ${size}</span>
                <span>📅 ${date}</span>
              </div>
            </div>
          </div>
          <div class="document-action">Preview →</div>
        </div>
      `;
    });
  } else {
    html += `
      <div class="dashboard">
        <div class="dashboard-row">
          <div class="dashboard-card wide">
            <h3>No documents available</h3>
            <p>Documents will be added soon.</p>
          </div>
        </div>
      </div>
    `;
  }

  html += '</div>';
  contentArea.innerHTML = html;
}

// ===== Board / Staff Year Detail Placeholder =====
function openBoardYear(category, year, categoryName) {
  const state = {
    type: 'board-year',
    category,
    year,
    name: `${categoryName} - ${year}`,
    render: () => renderBoardYearDetails(category, year, categoryName)
  };
  pushState(state);
  state.render();
}

function renderBoardYearDetails(category, year, categoryName) {
  contentArea.innerHTML = `
    <div class="header">
      <h1>${categoryName} - ${year}</h1>
      <p class="subtitle">Member details and documents (coming soon).</p>
    </div>
    <div class="dashboard">
      <div class="dashboard-row">
        <div class="dashboard-card wide">
          <h3>Under Development</h3>
          <p>Detailed records for ${categoryName} ${year} will be available here.</p>
        </div>
      </div>
    </div>
  `;
}

// ===== Icons =====
function getDocIcon(type) {
  if (type === 'excel') return { icon: '📊', class: 'icon-excel' };
  if (type === 'image') return { icon: '🖼️', class: 'icon-image' };
  return { icon: '📄', class: 'icon-pdf' };
}

// ===== Search =====
function initSearch() {
  searchBox.addEventListener('keypress', e => {
    if (e.key === 'Enter' && searchBox.value.trim()) {
      const query = searchBox.value.trim();
      addRecentSearch(query);
      handleSearch(query);
    }
  });
}

function buildSearchIndex() {
  searchIndex = [];

  // Master documents
  if (window.masterDocuments) {
    Object.entries(window.masterDocuments).forEach(([year, docs]) => {
      docs.forEach(doc => {
        searchIndex.push({
          name: doc.name,
          url: doc.url,
          year,
          category: 'Master',
          type: doc.type || 'pdf'
        });
      });
    });
  }

  // Front pages
  if (window.frontPageDocuments) {
    Object.entries(window.frontPageDocuments).forEach(([subcatId, years]) => {
      Object.entries(years).forEach(([year, docs]) => {
        docs.forEach(doc => {
          searchIndex.push({
            name: doc.name,
            url: doc.url,
            year,
            category: subcatId,
            type: doc.type || 'pdf'
          });
        });
      });
    });
  }
}

function handleSearch(query) {
  const q = query.toLowerCase();
  const results = searchIndex.filter(item =>
    item.name.toLowerCase().includes(q) ||
    (item.year && item.year.toString().includes(q)) ||
    (item.category && item.category.toLowerCase().includes(q))
  );

  const state = {
    type: 'search',
    query,
    name: `Search: "${query}"`,
    render: () => renderSearchResults(results, query)
  };
  pushState(state);
  state.render();
}

function renderSearchResults(results, query) {
  if (!results.length) {
    contentArea.innerHTML = `
      <div class="header">
        <h1>No results for "${escapeHtml(query)}"</h1>
        <p class="subtitle">Try a different keyword.</p>
      </div>
    `;
    return;
  }

  let html = `
    <div class="header">
      <h1>Search Results</h1>
      <p class="subtitle">${results.length} document(s) matching "${escapeHtml(query)}"</p>
    </div>
    <div class="document-list">
  `;

  results.forEach(doc => {
    const iconData = getDocIcon(doc.type || 'pdf');
    html += `
      <div class="document-item"
           data-doc-name="${escapeHtml(doc.name)}"
           data-doc-url="${encodeURI(doc.url)}"
           data-doc-year="${doc.year || ''}"
           data-doc-category="${escapeHtml(doc.category || '')}">
        <div class="document-info">
          <div class="document-icon ${iconData.class}">${iconData.icon}</div>
          <div class="document-details">
            <h4>${doc.name}</h4>
            <div class="document-meta">
              <span>📂 ${doc.category || ''}</span>
              <span>📅 ${doc.year || ''}</span>
            </div>
          </div>
        </div>
        <div class="document-action">Preview →</div>
      </div>
    `;
  });

  html += '</div>';
  contentArea.innerHTML = html;
}

// Recent searches
function addRecentSearch(query) {
  if (!recentSearches.includes(query)) {
    recentSearches.unshift(query);
    if (recentSearches.length > 5) recentSearches.pop();
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    updateRecentSearchesUI();
  }
}

function updateRecentSearchesUI() {
  if (!recentSearchesList) return;
  recentSearchesList.innerHTML = recentSearches.map(search =>
    `<div class="recent-search-item" data-search="${escapeHtml(search)}">🕐 ${escapeHtml(search)}</div>`
  ).join('');
}

// ===== Recent Docs =====
function addRecentDoc(doc) {
  const key = 'recentDocs';
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  const filtered = list.filter(d => d.url !== doc.url);

  filtered.unshift({
    name: doc.name,
    url: doc.url,
    year: doc.year || null,
    category: doc.category || null,
    openedAt: Date.now()
  });

  const limited = filtered.slice(0, 10);
  localStorage.setItem(key, JSON.stringify(limited));
}

function renderRecentDocs() {
  const container = document.getElementById('recentDocsList');
  if (!container) return;

  const key = 'recentDocs';
  const list = JSON.parse(localStorage.getItem(key) || '[]');

  if (!list.length) {
    container.innerHTML = '<p class="subtitle">No documents opened yet.</p>';
    return;
  }

  container.innerHTML = list.map(doc => `
    <div class="recent-doc-item"
         data-doc-name="${escapeHtml(doc.name)}"
         data-doc-url="${encodeURI(doc.url)}">
      <span>📄 ${doc.name}</span>
      <small>${doc.year || ''} ${doc.category ? '· ' + doc.category : ''}</small>
    </div>
  `).join('');
}

// ===== Modal & Preview =====
function initModalHandlers() {
  modalCloseBtn.addEventListener('click', closeModal);
  previewModal.addEventListener('click', e => {
    if (e.target === previewModal) {
      closeModal();
    }
  });
}

function openPreview(name, url, meta = {}) {
  modalTitle.textContent = name;

  // Add to recent docs
  addRecentDoc({ name, url, year: meta.year, category: meta.category });
  // Refresh recent docs if dashboard is visible
  if (document.getElementById('recentDocsList')) {
    renderRecentDocs();
  }

  // Convert Google Drive view links to preview links
  let embedUrl = url;
  if (url.includes('drive.google.com') && url.includes('/view')) {
    embedUrl = url.replace('/view', '/preview');
  }

  const modalBody = previewModal.querySelector('.modal-body');
  modalBody.innerHTML = `
    <div style="text-align: right; margin-bottom: 15px;">
      <a href="${url}" target="_blank"
         style="background: var(--accent-color); color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; display: inline-flex; align-items: center; gap: 6px;">
        <span>Open in New Tab</span>
        <span>↗</span>
      </a>
    </div>
    <iframe src="${embedUrl}" width="100%" height="100%"
            style="border: none; border-radius: 8px; background: #f5f5f5; min-height: 500px;">
      <p>Your browser does not support iframes. <a href="${url}">Click here to view the document.</a></p>
    </iframe>
  `;

  previewModal.classList.add('active');
}

function closeModal() {
  previewModal.classList.remove('active');
  const modalBody = previewModal.querySelector('.modal-body');
  modalBody.innerHTML = '<div class="pdf-preview" id="previewContent"></div>';
}

// ===== Global content click handlers (delegation) =====
function initGlobalContentClickHandlers() {
  contentArea.addEventListener('click', e => {
    // Master year cards
    const masterCard = e.target.closest('.year-card[data-master-year]');
    if (masterCard) {
      const year = parseInt(masterCard.getAttribute('data-master-year'), 10);
      if (year) openMasterYear(year);
      return;
    }

    // Front-page subcategory cards
    const subcatCard = e.target.closest('.subcategory-card[data-front-subcat-id]');
    if (subcatCard) {
      const id = subcatCard.getAttribute('data-front-subcat-id');
      const name = subcatCard.getAttribute('data-front-subcat-name');
      openFrontSubcat(id, name);
      return;
    }

    // Front-page subcategory year cards
    const frontYearCard = e.target.closest('.year-card[data-front-year]');
    if (frontYearCard) {
      const year = parseInt(frontYearCard.getAttribute('data-front-year'), 10);
      const subcatId = frontYearCard.getAttribute('data-front-subcat-id');
      const subcatName = frontYearCard.getAttribute('data-front-subcat-name');
      if (year && subcatId) {
        openFrontSubcatYear(subcatId, subcatName, year);
      }
      return;
    }

    // Board / staff year cards
    const boardCard = e.target.closest('.year-card[data-board-category]');
    if (boardCard) {
      const category = boardCard.getAttribute('data-board-category');
      const year = boardCard.getAttribute('data-board-year');
      const name = categoryNames[category] || category;
      openBoardYear(category, year, name);
      return;
    }

    // Document items
    const docItem = e.target.closest('.document-item[data-doc-url]');
    if (docItem) {
      const name = docItem.getAttribute('data-doc-name');
      const url = decodeURI(docItem.getAttribute('data-doc-url'));
      const year = docItem.getAttribute('data-doc-year') || null;
      const category = docItem.getAttribute('data-doc-category') || null;
      openPreview(name, url, { year, category });
      return;
    }

    // Recent doc item (dashboard)
    const recentDoc = e.target.closest('.recent-doc-item[data-doc-url]');
    if (recentDoc) {
      const name = recentDoc.getAttribute('data-doc-name');
      const url = decodeURI(recentDoc.getAttribute('data-doc-url'));
      openPreview(name, url);
      return;
    }

    // Recent search item
    const recentSearchItem = e.target.closest('.recent-search-item[data-search]');
    if (recentSearchItem) {
      const query = recentSearchItem.getAttribute('data-search');
      searchBox.value = query;
      handleSearch(query);
      return;
    }
  });
}

// ===== Utils =====
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}