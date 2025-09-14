// Data simulada de productos
const products = [
    { id: 1, name: 'Pastel de Chocolate', price: 25000 },
    { id: 2, name: 'Pastel Doble Chocolate', price: 22000 },
    { id: 3, name: 'Pastel Frutos Rojos', price: 28000 },
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener("DOMContentLoaded", () => {
  // espera a que se carguen los includes
  const observer = new MutationObserver(() => {
    if (document.getElementById("cart-modal")) {
      initCartListeners(); // ahora sí engancha
      renderCartCount();
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
});

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function renderCartCount() {
    const cartCountEl = document.getElementById('cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountEl.textContent = totalItems;
}

function addToCart(productId) {
    const product = products.find(p => p.id == productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    renderCartCount();
    renderCartModal();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCartCount();
    renderCartModal();
}

function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            saveCart();
            renderCartModal();
        }
    }
}

// javascrip/cart.js (modificaciones destacadas)

// ... (el resto del código: products, cart, saveCart, renderCartCount, etc. se mantiene igual) ...

// Escucha los eventos de login/logout para refrescar el carrito
window.addEventListener('userLoggedIn', renderCartModal);
window.addEventListener('userLoggedOut', renderCartModal);


function renderCartModal() {
    const cartModal = document.getElementById('cart-modal');
    if (!cartModal) return;

    const cartItemsList = cartModal.querySelector('.cart-items');
    const subtotalEl = cartModal.querySelector('.subtotal-price');
    const totalEl = cartModal.querySelector('.total-price');
    const discountLine = cartModal.querySelector('.discount-line');
    const discountAmountEl = cartModal.querySelector('.discount-amount');
    const discountDescEl = cartModal.querySelector('.discount-description');

    if (!cartItemsList || !totalEl) return;

    cartItemsList.innerHTML = '';
    let subtotal = 0;

    if (cart.length === 0) {
        cartItemsList.innerHTML = '<p>Tu carrito está vacío.</p>';
        subtotalEl.textContent = '$0';
        totalEl.textContent = '$0';
        discountLine.style.display = 'none';
    } else {
        cart.forEach(item => {
            const itemElement = document.createElement('li');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toLocaleString('es-CL')} x ${item.quantity}</p>
                </div>
                <div class="cart-item-actions">
                    <input type="number" name="quantity-input" min="1" value="${item.quantity}" data-id="${item.id}">
                    <button class="remove-btn" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            cartItemsList.appendChild(itemElement);
            subtotal += item.price * item.quantity;
        });

        subtotalEl.textContent = `$${subtotal.toLocaleString('es-CL')}`;

        // --- LÓGICA DE DESCUENTO ---
        const user = JSON.parse(localStorage.getItem('currentUser'));
        let finalTotal = subtotal;
        let discountApplied = 0;

        if (user && user.discount && cart.length > 0) {
            const discount = user.discount;
            discountLine.style.display = 'block';
            discountDescEl.textContent = discount.description;

            if (discount.type === 'percentage') {
                discountApplied = subtotal * discount.value;
                finalTotal = subtotal - discountApplied;
                discountAmountEl.textContent = `- $${discountApplied.toLocaleString('es-CL')}`;
            } 
            else if (discount.type === 'birthday') {
                // Regala el producto más caro del carrito
                const mostExpensiveItem = cart.reduce((max, item) => item.price > max.price ? item : max, cart[0]);
                discountApplied = mostExpensiveItem.price;
                finalTotal = subtotal - discountApplied;
                discountAmountEl.textContent = `- $${discountApplied.toLocaleString('es-CL')}`;
            }

        } else {
            discountLine.style.display = 'none';
        }

        totalEl.textContent = `$${Math.max(0, finalTotal).toLocaleString('es-CL')}`;
    }
}


function initCartListeners() {
    const cartIcon = document.getElementById('cart-icon-container');
    const cartModal = document.getElementById('cart-modal');
    const closeBtn = document.getElementById('close-cart-btn');

    if (!cartIcon || !cartModal || !closeBtn) return;
        

    cartIcon.addEventListener('click', () => {
        cartModal.classList.add('show');
        renderCartModal();
    });

    closeBtn.addEventListener('click', () => {
        cartModal.classList.remove('show');
    });

    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('show');
        }
    });

    document.addEventListener('change', (e) => {
        if (e.target.matches('.cart-item-actions input')) {
            const id = parseInt(e.target.dataset.id);
            const quantity = parseInt(e.target.value);
            updateQuantity(id, quantity);
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.matches('.add-to-cart-btn')) {
            const id = parseInt(e.target.dataset.id);
            addToCart(id);
        }
        if (e.target.closest('.remove-btn')) {
            const id = parseInt(e.target.closest('.remove-btn').dataset.id);
            removeFromCart(id);
        }
    });
}

