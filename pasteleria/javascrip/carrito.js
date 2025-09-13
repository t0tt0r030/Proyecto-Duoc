let cart = []; // El carrito estará en esta variable

function renderCartCount() {
    const cartCountEl = document.getElementById('cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountEl.textContent = totalItems;
}

function addToCart(productId) {
    // Aquí puedes obtener la información del producto del HTML o de una lista predefinida
    const productsData = [
        { id: 1, name: 'Pastel de Chocolate', price: 15000 },
        { id: 2, name: 'Pastel de Vainilla', price: 12000 },
        // ...añade todos tus productos aquí
    ];

    const product = productsData.find(p => p.id == productId);

    if (product) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        console.log("Carrito actualizado:", cart);
        renderCartCount();
    }
}

// Inicializar la funcionalidad del carrito
document.addEventListener('DOMContentLoaded', () => {
    // Escuchar clics en todos los botones "Agregar al carrito"
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const productId = e.target.dataset.productId;
            addToCart(productId);
        }
    });
});