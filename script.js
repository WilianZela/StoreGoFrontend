const PRODUCTS = [
  { id: 'ps5', name: 'PlayStation 5', desc: 'Capacidad de almacenamiento: 825 GB', price: 900000, img: 'img/ps5.avif' },
  { id: 'ps4', name: 'PlayStation 4', desc: 'Capacidad de almacenamiento: 500 GB', price: 250000, img: 'img/ps4.webp' },
  { id: 'ps3', name: 'PlayStation 3', desc: 'Memoria interna: 160 GB HDD', price: 70000, img: 'img/ps3.jpg' }
];

const CART_KEY = 'storego_cart';
const ALLOWED_EMAIL_DOMAINS = ['gmail.com', 'duocuc.cl', 'profesor.duoc.cl'];

function isAllowedEmail(email) {
  const domain = email.split('@')[1] || '';
  return ALLOWED_EMAIL_DOMAINS.includes(domain.toLowerCase());
}

function formatCLP(value) {
  return '$' + value.toLocaleString('es-CL');
}

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function addToCart(id) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty += 1;
  } else {
    cart.push({ id, qty: 1 });
  }
  saveCart(cart);
  const product = PRODUCTS.find(p => p.id === id);
  showToast(`${product.name} añadido al carrito`);
}

function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
  renderCart();
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    saveCart(cart.filter(i => i.id !== id));
  } else {
    saveCart(cart);
  }
  renderCart();
}

function updateCartCount() {
  const count = getCart().reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll('#cartCount').forEach(el => {
    el.textContent = count;
  });
  document.querySelectorAll('#cartIcon').forEach(el => {
    el.src = count > 0 ? 'img/carrito_ocupado.png' : 'img/carrito_vacio.png';
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function renderProductGrid(containerId, products) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <div class="product-thumb"><img src="${p.img}" alt="${p.name}"></div>
      <h3>${p.name}</h3>
      <p class="product-desc">${p.desc}</p>
      <div class="product-footer">
        <span class="price">${formatCLP(p.price)}</span>
        <button class="btn-add" data-id="${p.id}">Añadir</button>
      </div>
    </div>
  `).join('');
  grid.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', () => addToCart(btn.dataset.id));
  });
}

function renderCart() {
  const container = document.getElementById('items-carrito');
  if (!container) return;
  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío.</p>';
    document.getElementById('subtotal').textContent = formatCLP(0);
    document.getElementById('total').textContent = formatCLP(0);
    return;
  }

  let total = 0;
  container.innerHTML = cart.map(item => {
    const product = PRODUCTS.find(p => p.id === item.id);
    const lineTotal = product.price * item.qty;
    total += lineTotal;
    return `
      <div class="carrito-item">
        <img src="${product.img}" alt="${product.name}">
        <div class="carrito-item-info">
          <h3>${product.name}</h3>
          <p>${formatCLP(product.price)} c/u</p>
        </div>
        <div class="qty-controls">
          <button data-action="dec" data-id="${item.id}">−</button>
          <span>${item.qty}</span>
          <button data-action="inc" data-id="${item.id}">+</button>
        </div>
        <strong>${formatCLP(lineTotal)}</strong>
        <button class="remove-item" data-id="${item.id}">Quitar</button>
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-action="inc"]').forEach(btn => {
    btn.addEventListener('click', () => changeQty(btn.dataset.id, 1));
  });
  container.querySelectorAll('[data-action="dec"]').forEach(btn => {
    btn.addEventListener('click', () => changeQty(btn.dataset.id, -1));
  });
  container.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
  });

  document.getElementById('subtotal').textContent = formatCLP(total);
  document.getElementById('total').textContent = formatCLP(total);
}

function setupMobileNav() {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
}

function setupNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail').value.trim();
    if (!isAllowedEmail(email)) {
      showToast('Usa un correo @gmail.com, @duocuc.cl o @profesor.duoc.cl');
      return;
    }
    showToast('¡Gracias por suscribirte!');
    form.reset();
  });
}

function setupContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('contactEmail').value.trim();
    if (!isAllowedEmail(email)) {
      showToast('Usa un correo @gmail.com, @duocuc.cl o @profesor.duoc.cl');
      return;
    }
    showToast('Mensaje enviado, te responderemos pronto.');
    form.reset();
  });
}

function setupFinalizarCompra() {
  const btn = document.getElementById('finalizarCompra');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (getCart().length === 0) {
      showToast('Tu carrito está vacío');
      return;
    }
    saveCart([]);
    renderCart();
    showToast('¡Compra realizada con éxito!');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  setupMobileNav();
  setupNewsletterForm();
  setupContactForm();
  setupFinalizarCompra();
  renderProductGrid('featuredGrid', PRODUCTS);
  renderProductGrid('productGrid', PRODUCTS);
  renderCart();
});
