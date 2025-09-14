// javascrip/auth.js

// ==============================
// INICIALIZACIÓN DEL MÓDULO DE AUTENTICACIÓN
// ==============================
document.addEventListener('partialsLoaded', () => {
    // Se asegura de que los modales existan en el DOM antes de asignarles eventos.
    initAuthSystem();
});


function initAuthSystem() {
    // --- Referencias a elementos del DOM ---
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const userStateContainer = document.getElementById('user-state');
    const authActionsContainer = document.getElementById('auth-actions');
    const userNameEl = document.getElementById('user-name');
    const logoutBtn = document.getElementById('logout-btn');

    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');

    // --- Lógica de eventos ---
    loginBtn?.addEventListener('click', () => loginModal?.classList.add('show'));
    registerBtn?.addEventListener('click', () => registerModal?.classList.add('show'));
    logoutBtn?.addEventListener('click', handleLogout);

    // Cerrar modales
    document.getElementById('close-login-btn')?.addEventListener('click', () => loginModal.classList.remove('show'));
    document.getElementById('close-register-btn')?.addEventListener('click', () => registerModal.classList.remove('show'));
    
    // Cambiar entre modales
    document.getElementById('show-register-link')?.addEventListener('click', () => {
        loginModal.classList.remove('show');
        registerModal.classList.add('show');
    });
    document.getElementById('show-login-link')?.addEventListener('click', () => {
        registerModal.classList.remove('show');
        loginModal.classList.add('show');
    });

    // Manejar formularios
    document.getElementById('register-form')?.addEventListener('submit', handleRegister);
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);

    // --- Estado inicial ---
    updateAuthUI();
}

// ==============================
// FUNCIONES PRINCIPALES
// ==============================

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const password = document.getElementById('reg-password').value;
    const dob = document.getElementById('reg-dob').value;
    const code = document.getElementById('reg-code').value.trim().toUpperCase();
    const errorEl = document.getElementById('register-error');

    // Validación de campos vacíos
    if (!name || !email || !password || !dob) {
        errorEl.textContent = 'Todos los campos son obligatorios.';
        return;
    }
    
    // Simulación: Guardamos usuarios en un array en localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(user => user.email === email)) {
        errorEl.textContent = 'Este correo ya está registrado.';
        return;
    }

    // Lógica de descuentos
    const discount = calculateDiscount(dob, code, email);

    const newUser = { name, email, password, dob, discount };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Iniciar sesión automáticamente después del registro
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    // Ocultar modal y actualizar UI
    document.getElementById('register-modal').classList.remove('show');
    updateAuthUI();
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    if (!email || !password) {
        errorEl.textContent = 'Correo y contraseña son obligatorios.';
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const foundUser = users.find(user => user.email === email && user.password === password);

    if (foundUser) {
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        document.getElementById('login-modal').classList.remove('show');
        updateAuthUI();
        window.dispatchEvent(new Event('userLoggedIn')); // Avisa al carrito que recargue
    } else {
        errorEl.textContent = 'Credenciales incorrectas.';
    }
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    updateAuthUI();
    window.dispatchEvent(new Event('userLoggedOut')); // Avisa al carrito que recargue
}

function updateAuthUI() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userStateContainer = document.getElementById('user-state');
    const authActionsContainer = document.getElementById('auth-actions');

    if (user) {
        // Mostrar estado "logueado"
        authActionsContainer.style.display = 'none';
        userStateContainer.style.display = 'flex';
        document.getElementById('user-name').textContent = `Hola, ${user.name.split(' ')[0]}`;
    } else {
        // Mostrar botones de "login/register"
        authActionsContainer.style.display = 'flex';
        userStateContainer.style.display = 'none';
    }
}

function calculateDiscount(dob, code, email) {
    // Prioridad 1: Mayor de 50 años
    const birthDate = new Date(dob);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age >= 50) {
        return { type: 'percentage', value: 0.50, description: 'Descuento del 50% por ser mayor de 50 años' };
    }

    // Prioridad 2: Código FELICES50
    if (code === 'FELICES50') {
        return { type: 'percentage', value: 0.10, description: 'Descuento del 10% de por vida' };
    }
    
    // Prioridad 3: Estudiante de Duoc en su cumpleaños
    const isDuoc = email.endsWith('@duoc.cl') || email.endsWith('@profesor.duoc.cl');
    if (isDuoc) {
        const today = new Date();
        // Comparamos solo día y mes, no el año.
        if (birthDate.getMonth() === today.getMonth() && birthDate.getDate() === today.getDate()) {
             return { type: 'birthday', value: 1, description: '¡Feliz cumpleaños! Tienes una torta gratis.' };
        }
    }
    
    return null; // Sin descuento
}