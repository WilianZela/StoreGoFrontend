const PRODUCTS = [
  { id: 'ps5', name: 'PlayStation 5', desc: 'Capacidad de almacenamiento: 825 GB', price: 900000, img: 'img/ps5.avif' },
  { id: 'ps4', name: 'PlayStation 4', desc: 'Capacidad de almacenamiento: 500 GB', price: 250000, img: 'img/ps4.webp' },
  { id: 'ps3', name: 'PlayStation 3', desc: 'Memoria interna: 160 GB HDD', price: 70000, img: 'img/ps3.jpg' }
];

const CART_KEY = 'storego_cart';
const ALLOWED_EMAIL_DOMAINS = ['gmail.com', 'duoc.cl', 'profesor.duoc.cl'];

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

function addToCart(id, qty = 1) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty += qty;
  } else {
    cart.push({ id, qty });
  }
  saveCart(cart);
  const product = PRODUCTS.find(p => p.id === id);
  showToast(qty > 1 ? `${qty} × ${product.name} añadidos al carrito` : `${product.name} añadido al carrito`);
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
      <a href="producto.html?id=${p.id}" class="product-thumb"><img src="${p.img}" alt="${p.name}"></a>
      <h3><a href="producto.html?id=${p.id}">${p.name}</a></h3>
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
      showToast('Usa un correo @gmail.com, @duoc.cl o @profesor.duoc.cl');
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
      showToast('Usa un correo @gmail.com, @duoc.cl o @profesor.duoc.cl');
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

/* ---------- Sesión y usuarios (demo, solo frontend) ---------- */
const USERS_KEY = 'storego_users';
const SESSION_KEY = 'storego_session';

// Usuarios de prueba. En un sistema real las contraseñas NO se guardan en el navegador.
const DEFAULT_USERS = [
  { nombre: 'Administrador', apellidos: 'StoreGo', email: 'admin@duoc.cl', password: 'admin123', rol: 'admin' },
  { nombre: 'Vendedor', apellidos: 'StoreGo', email: 'vendedor@duoc.cl', password: 'vend123', rol: 'vendedor' }
];

// Arreglo de regiones y comunas (reemplazar por el arreglo complementario del entregable).
const REGIONES = [
  { nombre: 'Región Metropolitana de Santiago', comunas: ['Santiago', 'Maipú', 'Puente Alto', 'La Florida', 'Ñuñoa'] },
  { nombre: 'Región de la Araucanía', comunas: ['Temuco', 'Padre Las Casas', 'Villarrica', 'Pucón', 'Lautaro'] },
  { nombre: 'Región de Ñuble', comunas: ['Chillán', 'Chillán Viejo', 'San Carlos', 'Bulnes', 'Quillón'] },
  { nombre: 'Región del Biobío', comunas: ['Concepción', 'Talcahuano', 'Los Ángeles', 'Coronel', 'Chiguayante'] },
  { nombre: 'Región de Valparaíso', comunas: ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'Concón'] }
];

function getStoredUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch (e) { return []; }
}

function getUsers() {
  return [...DEFAULT_USERS, ...getStoredUsers()];
}

function saveUser(user) {
  const users = getStoredUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { return null; }
}

function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email, nombre: user.nombre, rol: user.rol }));
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = 'index.html';
}

// Agrega al menú los enlaces de Iniciar sesión / Registrarse, o Panel y Salir si ya hay sesión.
function setupAuthNav() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  nav.querySelectorAll('.auth-link').forEach(el => el.remove());
  const addLink = (text, href) => {
    const a = document.createElement('a');
    a.className = 'auth-link';
    a.href = href;
    a.textContent = text;
    nav.appendChild(a);
    return a;
  };
  const session = getSession();
  if (!session) {
    addLink('Iniciar sesión', 'login.html');
    addLink('Registrarse', 'registro.html');
    return;
  }
  if (session.rol !== 'cliente') addLink('Panel', 'admin.html');
  const out = addLink(`Salir (${session.nombre})`, '#');
  out.addEventListener('click', e => { e.preventDefault(); logout(); });
}

// Protege las páginas del administrador según el rol (solo visual: sin backend no es seguridad real).
function guardPage() {
  const allowed = document.body.dataset.requireRole;
  if (!allowed) return;
  const session = getSession();
  if (!session || !allowed.split(',').includes(session.rol)) {
    window.location.replace('login.html');
    return;
  }
  document.body.hidden = false;
  document.querySelectorAll('[data-roles]').forEach(el => {
    if (!el.dataset.roles.split(',').includes(session.rol)) el.remove();
  });
  document.querySelectorAll('[data-user-name]').forEach(el => { el.textContent = session.nombre; });
  document.querySelectorAll('[data-user-role]').forEach(el => { el.textContent = session.rol; });
  const out = document.getElementById('logoutBtn');
  if (out) out.addEventListener('click', e => { e.preventDefault(); logout(); });
}

function renderAdminStats() {
  const users = document.getElementById('statUsers');
  const products = document.getElementById('statProducts');
  if (users) users.textContent = getUsers().length;
  if (products) products.textContent = PRODUCTS.length;
}

/* ---------- Validaciones de formularios ---------- */
const required = v => (v === '' ? 'Este campo es obligatorio' : '');
const maxLength = (v, n) => (v.length > n ? `Máximo ${n} caracteres` : '');

// RUN sin puntos ni guion (ej: 111111111): valida el dígito verificador con módulo 11.
function validarRun(run) {
  if (!/^\d{6,8}[0-9kK]$/.test(run)) return false;
  const cuerpo = run.slice(0, -1);
  const dv = run.slice(-1).toUpperCase();
  let suma = 0;
  let mult = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * mult;
    mult = mult === 7 ? 2 : mult + 1;
  }
  const resto = 11 - (suma % 11);
  const esperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  return dv === esperado;
}

const emailRule = v =>
  required(v) ||
  maxLength(v, 100) ||
  (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Ingresa un correo válido') ||
  (isAllowedEmail(v) ? '' : 'Solo correos @duoc.cl, @profesor.duoc.cl o @gmail.com');

const passwordRule = v =>
  required(v) || (v.length < 4 || v.length > 10 ? 'La contraseña debe tener entre 4 y 10 caracteres' : '');

const LOGIN_RULES = {
  email: emailRule,
  password: passwordRule
};

const REGISTER_RULES = {
  run: v =>
    required(v) ||
    (v.length < 7 || v.length > 9 ? 'El RUN debe tener entre 7 y 9 caracteres' : '') ||
    (validarRun(v) ? '' : 'RUN inválido: sin puntos ni guion y con dígito verificador correcto'),
  nombre: v => required(v) || maxLength(v, 50),
  apellidos: v => required(v) || maxLength(v, 100),
  email: emailRule,
  emailConfirm: (v, form) =>
    required(v) || (v.toLowerCase() === form.elements.email.value.trim().toLowerCase() ? '' : 'Los correos no coinciden'),
  password: passwordRule,
  passwordConfirm: (v, form) =>
    required(v) || (v === form.elements.password.value ? '' : 'Las contraseñas no coinciden'),
  fechaNacimiento: v => (v && new Date(v) > new Date() ? 'La fecha no puede ser futura' : ''),
  telefono: v => (v === '' || /^\+?\d{8,12}$/.test(v) ? '' : 'Ingresa entre 8 y 12 dígitos'),
  region: v => (v === '' ? 'Selecciona una región' : ''),
  comuna: v => (v === '' ? 'Selecciona una comuna' : ''),
  direccion: v => required(v) || maxLength(v, 300),
  tipoUsuario: v => (v === '' ? 'Selecciona un tipo de usuario' : '')
};

// Campos que se vuelven a validar cuando cambia el campo original.
const LINKED_FIELDS = { email: 'emailConfirm', password: 'passwordConfirm' };

function showFieldError(input, message) {
  const errorEl = document.getElementById(`${input.name}-error`);
  if (errorEl) errorEl.textContent = message;
  input.classList.toggle('invalid', !!message);
  input.classList.toggle('valid', !message && input.value.trim() !== '');
}

function validateField(input, rules) {
  const rule = rules[input.name];
  if (!rule) return true;
  const value = input.type === 'password' ? input.value : input.value.trim();
  const message = rule(value, input.form);
  showFieldError(input, message);
  return !message;
}

// Validación en tiempo real: mientras se escribe, al salir del campo y al cambiar una lista.
function attachLiveValidation(form, rules) {
  [...form.elements].filter(el => rules[el.name]).forEach(input => {
    input.addEventListener('input', () => {
      if (input.dataset.touched || input.value !== '') validateField(input, rules);
      const linked = form.elements[LINKED_FIELDS[input.name]];
      if (linked && linked.value !== '') validateField(linked, rules);
    });
    input.addEventListener('blur', () => {
      input.dataset.touched = '1';
      validateField(input, rules);
    });
    input.addEventListener('change', () => validateField(input, rules));
  });
}

function validateForm(form, rules) {
  let firstInvalid = null;
  [...form.elements].filter(el => rules[el.name]).forEach(input => {
    input.dataset.touched = '1';
    if (!validateField(input, rules) && !firstInvalid) firstInvalid = input;
  });
  if (firstInvalid) firstInvalid.focus();
  return !firstInvalid;
}

function resetFormState(form) {
  form.querySelectorAll('.invalid, .valid').forEach(el => el.classList.remove('invalid', 'valid'));
  form.querySelectorAll('.field-error').forEach(el => { el.textContent = ''; });
  [...form.elements].forEach(el => delete el.dataset.touched);
}

// Región y comuna: al cambiar la región se actualiza la lista de comunas.
function setupRegionComuna(form) {
  const regionSel = form.elements.region;
  const comunaSel = form.elements.comuna;
  if (!regionSel || !comunaSel) return;
  const resetComunas = () => {
    comunaSel.innerHTML = '<option value="">-- Seleccione la comuna --</option>';
    comunaSel.disabled = true;
  };
  regionSel.innerHTML = '<option value="">-- Seleccione la región --</option>' +
    REGIONES.map(r => `<option value="${r.nombre}">${r.nombre}</option>`).join('');
  resetComunas();
  regionSel.addEventListener('change', () => {
    const region = REGIONES.find(r => r.nombre === regionSel.value);
    resetComunas();
    if (region) {
      comunaSel.innerHTML += region.comunas.map(c => `<option value="${c}">${c}</option>`).join('');
      comunaSel.disabled = false;
    }
  });
  form.addEventListener('reset', () => setTimeout(resetComunas, 0));
}

function setupLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  attachLiveValidation(form, LOGIN_RULES);
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm(form, LOGIN_RULES)) {
      showToast('Revisa los campos marcados en rojo');
      return;
    }
    const email = form.elements.email.value.trim().toLowerCase();
    const password = form.elements.password.value;
    const user = getUsers().find(u => u.email === email && u.password === password);
    if (!user) {
      showToast('Correo o contraseña incorrectos');
      return;
    }
    setSession(user);
    showToast(`Bienvenido, ${user.nombre}`);
    setTimeout(() => {
      window.location.href = user.rol === 'cliente' ? 'index.html' : 'admin.html';
    }, 900);
  });
}

// Sirve para el registro de la tienda y para "Nuevo usuario" del administrador (que trae tipo de usuario).
function setupRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;
  setupRegionComuna(form);
  attachLiveValidation(form, REGISTER_RULES);
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm(form, REGISTER_RULES)) {
      showToast('Revisa los campos marcados en rojo');
      return;
    }
    const f = form.elements;
    const email = f.email.value.trim().toLowerCase();
    const run = f.run.value.trim().toUpperCase();
    const users = getUsers();
    if (users.some(u => u.email === email)) {
      showFieldError(f.email, 'Este correo ya está registrado');
      f.email.focus();
      return;
    }
    if (users.some(u => u.run === run)) {
      showFieldError(f.run, 'Este RUN ya está registrado');
      f.run.focus();
      return;
    }
    const isAdminForm = !!f.tipoUsuario;
    saveUser({
      run,
      nombre: f.nombre.value.trim(),
      apellidos: f.apellidos.value.trim(),
      email,
      password: f.password.value,
      fechaNacimiento: f.fechaNacimiento.value,
      telefono: f.telefono.value.trim(),
      region: f.region.value,
      comuna: f.comuna.value,
      direccion: f.direccion.value.trim(),
      rol: isAdminForm ? f.tipoUsuario.value : 'cliente'
    });
    if (isAdminForm) {
      showToast('Usuario creado correctamente');
      form.reset();
      resetFormState(form);
      renderAdminStats();
    } else {
      showToast('Cuenta creada, ahora inicia sesión');
      setTimeout(() => { window.location.href = 'login.html'; }, 1200);
    }
  });
}

/* ---------- Detalle de producto ---------- */
function renderProductDetail() {
  const box = document.getElementById('productDetail');
  if (!box) return;
  const id = new URLSearchParams(window.location.search).get('id');
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) {
    box.innerHTML = '<p class="carrito-vacio">Producto no encontrado. <a href="productos.html">Volver a productos</a></p>';
    return;
  }
  document.title = `StoreGo | ${p.name}`;
  const crumb = document.getElementById('crumbName');
  if (crumb) crumb.textContent = p.name;
  box.innerHTML = `
    <div class="detail-image"><img src="${p.img}" alt="${p.name}"></div>
    <div class="detail-info">
      <h1>${p.name}</h1>
      <p class="detail-price">${formatCLP(p.price)}</p>
      <p class="detail-desc">${p.desc}</p>
      <div class="detail-qty">
        <label for="detailQty">Cantidad</label>
        <select id="detailQty">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<option value="${n}">${n}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-primary" id="detailAdd">Añadir al carrito</button>
    </div>
  `;
  document.getElementById('detailAdd').addEventListener('click', () => {
    addToCart(p.id, parseInt(document.getElementById('detailQty').value, 10));
  });
  renderProductGrid('relatedGrid', PRODUCTS.filter(x => x.id !== p.id));
}

document.addEventListener('DOMContentLoaded', () => {
  guardPage();
  updateCartCount();
  setupMobileNav();
  setupAuthNav();
  setupNewsletterForm();
  setupContactForm();
  setupFinalizarCompra();
  setupLoginForm();
  setupRegisterForm();
  renderProductGrid('featuredGrid', PRODUCTS);
  renderProductGrid('productGrid', PRODUCTS);
  renderCart();
  renderProductDetail();
  renderAdminStats();
});
