/* ==========================================================================
   LÓGICA INTERACTIVA DE CATÁLOGO, CARRITO Y PREGUNTAS FRECUENTES
   ========================================================================== */

let cart = [];
let currentCategory = 'todos';
let visibleCount = 8;
let searchQuery = '';

const allCards = Array.from(document.querySelectorAll('.product-card'));
const loadMoreBtn = document.getElementById('loadMoreBtn');
const searchInput = document.getElementById('searchInput');
const cartCount = document.getElementById('cartCount');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartBody = document.getElementById('cartBody');
const cartTotal = document.getElementById('cartTotal');

// Modales Checkout
const openCheckoutModalBtn = document.getElementById('openCheckoutModalBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckoutModalBtn = document.getElementById('closeCheckoutModalBtn');
const checkoutForm = document.getElementById('checkoutForm');
const modalTotalAmount = document.getElementById('modalTotalAmount');
const successModal = document.getElementById('successModal');
const closeSuccessBtn = document.getElementById('closeSuccessBtn');
const orderNumber = document.getElementById('orderNumber');

function formatPrice(price) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
}

// Controlar visualización del catálogo (Tandas de a 8)
function updateCatalog() {
  const matched = allCards.filter(card => {
    const category = card.getAttribute('data-category');
    const name = card.getAttribute('data-name').toLowerCase();
    
    const matchesCat = currentCategory === 'todos' || category === currentCategory;
    const matchesSearch = name.includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  allCards.forEach(c => c.style.display = 'none');
  matched.slice(0, visibleCount).forEach(c => c.style.display = 'flex');

  if (visibleCount < matched.length) {
    loadMoreBtn.style.display = 'inline-block';
  } else {
    loadMoreBtn.style.display = 'none';
  }
}

// Asignar eventos a cada tarjeta del HTML
allCards.forEach(card => {
  const id = parseInt(card.getAttribute('data-id'));
  const name = card.getAttribute('data-name');
  const price = parseFloat(card.getAttribute('data-price'));
  const image = card.querySelector('img').getAttribute('src');

  card.querySelector('.btn-add-cart').addEventListener('click', () => {
    addToCart({ id, name, price, image });
  });
});

function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  renderCart();
  toggleCart(true);
}

function renderCart() {
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalMoney = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  cartCount.textContent = totalCount;
  cartTotal.textContent = formatPrice(totalMoney);

  if (cart.length === 0) {
    cartBody.innerHTML = `<div style="text-align:center; padding: 40px 0; color: var(--text-muted);">
      <i class="fa-solid fa-bag-shopping" style="font-size:2rem; margin-bottom:10px; opacity:0.4;"></i>
      <p>Tu carrito está vacío</p>
    </div>`;
  } else {
    cartBody.innerHTML = cart.map(item => `
      <div class="cart-item-row">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
          <div class="cart-qty-controls">
            <button class="qty-btn-mini" onclick="changeQty(${item.id}, -1)">-</button>
            <span style="font-size:0.85rem; font-weight:bold;">${item.qty}</span>
            <button class="qty-btn-mini" onclick="changeQty(${item.id}, 1)">+</button>
          </div>
        </div>
        <button onclick="removeFromCart(${item.id})" style="background:none; border:none; color: var(--text-muted); cursor:pointer;">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `).join('');
  }
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) removeFromCart(id);
    else renderCart();
  }
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
}

function toggleCart(open) {
  cartDrawer.classList.toggle('active', open);
  cartOverlay.classList.toggle('active', open);
}

// Abrir checkout modal
openCheckoutModalBtn.addEventListener('click', () => {
  if (cart.length === 0) return;
  const totalMoney = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  modalTotalAmount.textContent = formatPrice(totalMoney);
  toggleCart(false);
  checkoutModal.classList.add('active');
});

closeCheckoutModalBtn.addEventListener('click', () => {
  checkoutModal.classList.remove('active');
});

// Confirmar pedido y abrir WhatsApp
checkoutForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('clientName').value;
  const phone = document.getElementById('clientPhone').value;
  const dni = document.getElementById('clientDni').value;
  const address = document.getElementById('clientAddress').value;
  const city = document.getElementById('clientCity').value;
  const zip = document.getElementById('clientZip').value;
  const payment = document.getElementById('paymentMethod').value;

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const orderId = Math.floor(1000 + Math.random() * 9000);

  let msg = `¡Hola *FR Mates y Accesorios*! 🧉\n`;
  msg += `Quisiera confirmar mi *Pedido #${orderId}*:\n\n`;
  msg += `*PRODUCTOS:*\n`;
  cart.forEach(i => {
    msg += `• ${i.name} (x${i.qty}) - ${formatPrice(i.price * i.qty)}\n`;
  });
  msg += `\n*TOTAL:* ${formatPrice(total)}\n\n`;
  msg += `*DATOS DE ENVÍO:*\n`;
  msg += `• Cliente: ${name}\n`;
  msg += `• DNI/CUIT: ${dni}\n`;
  msg += `• Teléfono: ${phone}\n`;
  msg += `• Dirección: ${address}\n`;
  msg += `• Ciudad: ${city} (CP: ${zip})\n`;
  msg += `• Medio de Pago: ${payment}\n\n`;
  msg += `¿Me confirman los datos para realizar la transferencia/pago? Gracias.`;

  checkoutModal.classList.remove('active');
  orderNumber.textContent = orderId;
  successModal.classList.add('active');

  cart = [];
  renderCart();

  window.open(`https://wa.me/5493815551234?text=${encodeURIComponent(msg)}`, '_blank');
});

closeSuccessBtn.addEventListener('click', () => {
  successModal.classList.remove('active');
});

// Event Listeners
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentCategory = e.target.dataset.category;
    visibleCount = 8;
    updateCatalog();
  });
});

loadMoreBtn.addEventListener('click', () => {
  visibleCount += 8;
  updateCatalog();
});

searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  visibleCount = 8;
  updateCatalog();
});

openCartBtn.addEventListener('click', () => toggleCart(true));
closeCartBtn.addEventListener('click', () => toggleCart(false));
cartOverlay.addEventListener('click', () => toggleCart(false));

// Acordeón Preguntas Frecuentes
document.querySelectorAll('.faq-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.parentElement.classList.toggle('active');
  });
});

updateCatalog();