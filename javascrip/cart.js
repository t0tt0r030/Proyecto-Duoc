// Data simulada de productos
const products = [
  { id: 1, name: 'Pastel de Chocolate', price: 25000 },
  { id: 2, name: 'Pastel Doble Chocolate', price: 22000 },
  { id: 3, name: 'Pastel Frutos Rojos', price: 28000 },
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];

// ----------------- Helpers -----------------
function waitForElements(ids, cb) {
  const missing = ids.filter(id => !document.getElementById(id));
  if (missing.length === 0) { cb(); return; }
  const observer = new MutationObserver(() => {
    const stillMissing = ids.filter(id => !document.getElementById(id));
    if (stillMissing.length === 0) {
      observer.disconnect();
      cb();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function renderCartCount() {
  const cartCountEl = document.getElementById('cart-count');
  if (!cartCountEl) return;
  const totalItems = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  cartCountEl.textContent = totalItems;
}

// ----------------- Operaciones del carrito -----------------
function addToCart(productId) {
  const id = Number(productId);
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existingItem = cart.find(item => Number(item.id) === id);
  if (existingItem) {
    existingItem.quantity = Number(existingItem.quantity || 0) + 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  renderCartCount();
  renderCartModal();
}

function removeFromCart(productId) {
  const id = Number(productId);
  cart = cart.filter(item => Number(item.id) !== id);
  saveCart();
  renderCartCount();
  renderCartModal();
}

function updateQuantity(productId, newQuantity) {
  const id = Number(productId);
  const q = Number(newQuantity) || 0;
  const item = cart.find(i => Number(i.id) === id);
  if (!item) return;
  if (q <= 0) {
    removeFromCart(id);
  } else {
    item.quantity = q;
    saveCart();
    renderCartCount();
    renderCartModal();
  }
}

// ----------------- Render del modal -----------------
function renderCartModal() {
  const cartModal = document.getElementById('cart-modal');
  if (!cartModal) return;

  const cartItemsList = cartModal.querySelector('.cart-items');
  const cartTotalEl = cartModal.querySelector('.total-price');

  if (!cartItemsList || !cartTotalEl) return;

  cartItemsList.innerHTML = '';
  let total = 0;

  if (!Array.isArray(cart) || cart.length === 0) {
    cartItemsList.innerHTML = '<p>Tu carrito está vacío.</p>';
    cartTotalEl.textContent = '$0';
    return;
  }

  cart.forEach(item => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    const itemTotal = price * qty;
    total += itemTotal;

    const itemElement = document.createElement('li');
    itemElement.classList.add('cart-item');
    itemElement.innerHTML = `
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>$${price.toLocaleString('es-CL')} x ${qty} = $${itemTotal.toLocaleString('es-CL')}</p>
      </div>
      <div class="cart-item-actions">
        <input type="number" name="quantity-input" min="1" value="${qty}" data-id="${item.id}">
        <button class="remove-btn" data-id="${item.id}" aria-label="Eliminar">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    cartItemsList.appendChild(itemElement);
  });

  // Aplicar descuento (si el usuario logueado tiene uno)
  const user = JSON.parse(localStorage.getItem('currentUser'));
  let discountMsg = '';
  if (user && user.discount) {
    const d = user.discount;
    if (d.type === 'percentage' && typeof d.value === 'number') {
      const discountAmount = total * d.value;
      total = total - discountAmount;
      discountMsg = ` (Descuento: ${Math.round(d.value * 100)}%)`;
    } else if (d.type === 'birthday') {
      discountMsg = ` (${d.description || 'Torta gratis'})`;
      total = 0;
    }
  }

  cartTotalEl.textContent = `$${total.toLocaleString('es-CL')}${discountMsg}`;
}

// ----------------- Listeners e inicialización -----------------
function initCartListeners() {


  const cartIcon = document.getElementById('cart-icon-container');
  const cartModal = document.getElementById('cart-modal');
  const closeBtn = document.getElementById('close-cart-btn');

  if (initCartListeners.hasRun) return;
    initCartListeners.hasRun = true;


  if (!cartIcon || !cartModal || !closeBtn) {
    console.error("Cart elements not found! Check your IDs in the HTML.");
    return;
  }

  cartIcon.addEventListener('click', () => {
    renderCartModal();
    cartModal.classList.add('show');
  });

  closeBtn.addEventListener('click', () => {
    cartModal.classList.remove('show');
  });

  cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) cartModal.classList.remove('show');
  });

  // Delegación: inputs de cantidad
  document.addEventListener('change', (e) => {
    if (e.target && e.target.matches('input[name="quantity-input"]')) {
      const id = Number(e.target.dataset.id);
      const quantity = Number(e.target.value);
      updateQuantity(id, quantity);
    }
  });

  // Delegación: botones add / remove
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.add-to-cart-btn');
    if (addBtn) {
      const id = Number(addBtn.dataset.id);
      addToCart(id);
      return;
    }
    const rem = e.target.closest('.remove-btn');
    if (rem) {
      const id = Number(rem.dataset.id);
      removeFromCart(id);
    }
  });

  // Re-render cuando el usuario loguea/desloguea (porque el descuento puede cambiar)
  window.addEventListener('userLoggedIn', () => { renderCartCount(); renderCartModal(); });
  window.addEventListener('userLoggedOut', () => { renderCartCount(); renderCartModal(); });
}




// Wait until HTML partials are injected (si usas partials)
document.addEventListener('DOMContentLoaded', () => {
  waitForElements(['cart-icon-container', 'cart-modal', 'cart-count'], () => {
    renderCartCount();
    initCartListeners();
    renderCartModal();
  });
});
