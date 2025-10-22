// ======================
// READLIFY LIBRARY JS (FULLY UPDATED)
// ======================

// ===== DOM ELEMENTS =====
const modal = document.getElementById('modal');
const addTopBtn = document.getElementById('addTopBtn');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const board = document.getElementById('board');
const emptyState = document.getElementById('emptyState');
const imageInput = document.getElementById('bookImage');
const previewImage = document.getElementById('previewImage');
const imageUploadBox = document.querySelector('.image-upload');
const searchInput = document.getElementById('searchInput');
const themeToggle = document.getElementById('themeToggle');

// ===== INITIALIZE =====
document.getElementById('currentYear').textContent = new Date().getFullYear();
let uploadedImage = '';
let books = JSON.parse(localStorage.getItem('books') || '[]');

// ===== FULL SCREEN LOADER =====
window.addEventListener('load', () => {
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    document.body.classList.add('loaded');
    document.body.style.overflow = 'auto';
  }, 3000); // loader shows for 2 seconds
});

// ===== MODAL CONTROLS =====
addTopBtn?.addEventListener('click', () => {
  modal.classList.add('active');
  document.getElementById('bookTitle').focus();
});

cancelBtn?.addEventListener('click', closeModal);
function closeModal() {
  modal.classList.remove('active');
  setTimeout(clearModal, 250);
}

// Close modal with ESC key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
});

// ===== IMAGE UPLOAD =====
imageUploadBox?.addEventListener('click', () => imageInput.click());

imageInput?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    uploadedImage = event.target.result;
    previewImage.src = uploadedImage;
    previewImage.style.display = 'block';
  };
  reader.readAsDataURL(file);
});

// ===== SAVE MULTIPLE BOOKS =====
saveBtn?.addEventListener('click', () => {
  const titles = document.getElementById('bookTitle').value.trim().split(',');
  const authors = document.getElementById('bookAuthor').value.trim().split(',');
  const status = document.getElementById('bookStatus').value;
  const tags = document.getElementById('bookTags').value.trim();
  const notes = document.getElementById('bookNotes').value.trim();

  if (!titles[0]) {
    alert('⚠️ Please enter at least one book title.');
    return;
  }

  titles.forEach((title, index) => {
    const book = {
      id: Date.now() + Math.random(), // unique ID
      title: title.trim(),
      author: authors[index]?.trim() || '',
      status,
      tags,
      notes,
      image: uploadedImage || '',
      createdAt: new Date().toISOString()
    };
    books.push(book);
  });

  saveToLocalStorage();
  renderBooks();
  clearModal();
  closeModal();
});

// ===== ADD SINGLE BOOK CARD =====
function addBookCard(book) {
  const card = document.createElement('div');
  card.className = 'book-card';
  card.innerHTML = `
    <div class="card-actions">
      <button class="delete-btn" title="Delete" onclick="deleteBook(${book.id})">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
    <img src="${book.image || 'https://via.placeholder.com/150x200?text=No+Image'}" alt="${book.title}">
    <div class="book-title">${book.title}</div>
    <div class="book-author">${book.author || ''}</div>
    <div style="font-size:12px;color:var(--muted);">${book.status}</div>
  `;
  board.prepend(card);
}

// ===== CLEAR MODAL =====
function clearModal() {
  document.querySelectorAll('#modal input, #modal textarea, #modal select').forEach(el => el.value = '');
  previewImage.src = '';
  previewImage.style.display = 'none';
  uploadedImage = '';
}

// ===== DELETE BOOK =====
function deleteBook(id) {
  if (confirm('Delete this book permanently?')) {
    books = books.filter(b => b.id !== id);
    saveToLocalStorage();
    renderBooks();
  }
}

// ===== SAVE TO LOCALSTORAGE =====
function saveToLocalStorage() {
  localStorage.setItem('books', JSON.stringify(books));
}

// ===== RENDER ALL BOOKS =====
function renderBooks(filtered = books) {
  board.innerHTML = '';
  if (filtered.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';
  filtered.sort((a, b) => b.id - a.id).forEach(addBookCard);
}

// ===== SEARCH FUNCTION =====
searchInput?.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(query) ||
    (b.author && b.author.toLowerCase().includes(query)) ||
    (b.tags && b.tags.toLowerCase().includes(query))
  );
  renderBooks(filteredBooks);
});

// ===== THEME TOGGLE =====
const root = document.documentElement;
const savedTheme = localStorage.getItem('theme') || 'light';
root.dataset.theme = savedTheme;
updateThemeIcon(savedTheme);

themeToggle?.addEventListener('click', () => {
  const currentTheme = root.dataset.theme;
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  root.dataset.theme = newTheme;
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);

  themeToggle.classList.add('glow');
  setTimeout(() => themeToggle.classList.remove('glow'), 400);
});

function updateThemeIcon(theme) {
  const icon = themeToggle?.querySelector('i');
  if (!icon) return;
  icon.classList.toggle('fa-sun', theme === 'dark');
  icon.classList.toggle('fa-moon', theme === 'light');
}

// ===== DASHBOARD / CATEGORIES SWITCH =====
function showDashboard() {
  document.getElementById('categoriesPage').style.display = 'none';
  document.getElementById('boardWrap').style.display = 'block';
  renderBooks();
}

// ===== GET UNIQUE CATEGORIES (FROM TAGS) =====
function getCategories() {
  return [...new Set(books.map(b => b.tags).filter(tag => tag && tag.trim() !== ''))];
}

// ===== SHOW CATEGORIES PAGE =====
document.getElementById('categoryLink').addEventListener('click', e => {
  e.preventDefault();
  document.getElementById('boardWrap').style.display = 'none';
  document.getElementById('categoriesPage').style.display = 'block';

  const list = document.getElementById('categoryList');
  const board = document.getElementById('categoryBoard');
  const categoryTitle = document.getElementById('categoryTitle');

  list.innerHTML = '';
  board.innerHTML = '';
  categoryTitle.textContent = '';

  getCategories().forEach(tag => {
    const li = document.createElement('li');
    li.textContent = tag;
    li.style.cursor = 'pointer';

    li.addEventListener('click', () => {
      categoryTitle.textContent = tag;
      board.innerHTML = '';
      const filteredBooks = books.filter(b => b.tags === tag);
      if (filteredBooks.length === 0) {
        board.innerHTML = '<p>No books in this category.</p>';
      } else {
        filteredBooks.forEach(book => addBookCardToBoard(book, board));
      }
    });

    list.appendChild(li);
  });
});

// ===== HELPER TO ADD CARD TO ANY CONTAINER =====
function addBookCardToBoard(book, container) {
  const card = document.createElement('div');
  card.className = 'book-card';
  card.innerHTML = `
    <div class="card-actions">
      <button onclick="deleteBook(${book.id}); renderBooks();">Delete</button>
    </div>
    <img src="${book.image || 'https://via.placeholder.com/150x200?text=No+Image'}" alt="${book.title}">
    <div class="book-title">${book.title}</div>
    <div class="book-author">${book.author || ''}</div>
    <div style="font-size:12px;color:gray;">${book.status}</div>
  `;
  container.appendChild(card);
}

// ===== INITIAL RENDER =====
renderBooks();
