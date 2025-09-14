// Auth: registro / login (frontend mock con localStorage)

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

// Lanza init cuando los elementos existen
document.addEventListener('DOMContentLoaded', () => {
  waitForElements(['login-btn','register-btn','login-modal','register-modal','auth-actions','user-state'], () => {
    initAuthSystem();
  });
});

// ----------------- Inicialización -----------------
function initAuthSystem() {
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const userStateContainer = document.getElementById('user-state');
  const authActionsContainer = document.getElementById('auth-actions');
  const userNameEl = document.getElementById('user-name');
  const logoutBtn = document.getElementById('logout-btn');

  const loginModal = document.getElementById('login-modal');
  const registerModal = document.getElementById('register-modal');

  loginBtn?.addEventListener('click', () => loginModal?.classList.add('show'));
  registerBtn?.addEventListener('click', () => registerModal?.classList.add('show'));
  logoutBtn?.addEventListener('click', handleLogout);

  document.getElementById('close-login-btn')?.addEventListener('click', () => loginModal.classList.remove('show'));
  document.getElementById('close-register-btn')?.addEventListener('click', () => registerModal.classList.remove('show'));
  //APLICATIVO DE MODALES
      // Abrir modales
    document.getElementById('btn-login').addEventListener('click', e => {
      e.preventDefault();
      loginModal.classList.add('show');
    });
    
    document.getElementById('btn-register').addEventListener('click', e => {
      e.preventDefault();
      registerModal.classList.add('show');
    });

    // Cerrar modales
    document.querySelectorAll('.close-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.target.closest('.auth-modal').classList.remove('show');
      });
    });

    // Switch entre login y registro
    document.getElementById('open-register').addEventListener('click', e => {
      e.preventDefault();
      loginModal.classList.remove('show');
      registerModal.classList.add('show');
    });
    document.getElementById('open-login').addEventListener('click', e => {
      e.preventDefault();
      registerModal.classList.remove('show');
      loginModal.classList.add('show');
    });
   
    document.querySelector('a[href="partials/login-modal.html"]').addEventListener('click', e => {
      e.preventDefault();
      loginModal.classList.add('show');
    });

    document.querySelector('a[href="partials/registro-modal.html"]').addEventListener('click', e => {
      e.preventDefault();
      registerModal.classList.add('show');
    });

    loginModal.querySelector('.close-btn').addEventListener('click', () => loginModal.classList.remove('show'));
    registerModal.querySelector('.close-btn').addEventListener('click', () => registerModal.classList.remove('show'));


  //LISTO MODALES


  document.getElementById('register-form')?.addEventListener('submit', handleRegister);
  document.getElementById('login-form')?.addEventListener('submit', handleLogin);

  updateAuthUI();
}

// ----------------- Lógica -----------------
function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const password = document.getElementById('reg-password').value;
  const dob = document.getElementById('reg-dob').value;
  const code = (document.getElementById('reg-code').value || '').trim().toUpperCase();
  const errorEl = document.getElementById('register-error');

  errorEl.textContent = '';

  if (!name || !email || !password || !dob) {
    errorEl.textContent = 'Todos los campos son obligatorios.';
    return;
  }

  const users = JSON.parse(localStorage.getItem('users')) || [];
  if (users.find(user => user.email === email)) {
    errorEl.textContent = 'Este correo ya está registrado.';
    return;
  }

  const discount = calculateDiscount(dob, code, email);

  const newUser = { name, email, password, dob, discount };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', JSON.stringify(newUser));

  // cierra modal, actualiza UI y avisa al carrito
  document.getElementById('register-modal')?.classList.remove('show');
  updateAuthUI();
  window.dispatchEvent(new Event('userLoggedIn'));
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');

  errorEl.textContent = '';

  if (!email || !password) {
    errorEl.textContent = 'Correo y contraseña son obligatorios.';
    return;
  }

  const users = JSON.parse(localStorage.getItem('users')) || [];
  const foundUser = users.find(user => user.email === email && user.password === password);

  if (foundUser) {
    localStorage.setItem('currentUser', JSON.stringify(foundUser));
    document.getElementById('login-modal')?.classList.remove('show');
    updateAuthUI();
    window.dispatchEvent(new Event('userLoggedIn'));
  } else {
    errorEl.textContent = 'Credenciales incorrectas.';
  }
}

function handleLogout() {
  localStorage.removeItem('currentUser');
  updateAuthUI();
  window.dispatchEvent(new Event('userLoggedOut'));
}

function updateAuthUI() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const userStateContainer = document.getElementById('user-state');
  const authActionsContainer = document.getElementById('auth-actions');

  if (user) {
    authActionsContainer && (authActionsContainer.style.display = 'none');
    userStateContainer && (userStateContainer.style.display = 'flex');
    const nameEl = document.getElementById('user-name');
    if (nameEl) nameEl.textContent = `Hola, ${user.name.split(' ')[0]}`;
  } else {
    authActionsContainer && (authActionsContainer.style.display = 'flex');
    userStateContainer && (userStateContainer.style.display = 'none');
  }
}

function calculateDiscount(dob, code, email) {
  const birthDate = new Date(dob);
  if (isNaN(birthDate)) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

  if (age >= 50) {
    return { type: 'percentage', value: 0.50, description: 'Descuento del 50% por ser mayor de 50 años' };
  }

  if (code === 'FELICES50') {
    return { type: 'percentage', value: 0.10, description: 'Descuento del 10% de por vida' };
  }

  const isDuoc = email.endsWith('@duoc.cl') || email.endsWith('@profesor.duoc.cl');
  if (isDuoc) {
    if (birthDate.getMonth() === today.getMonth() && birthDate.getDate() === today.getDate()) {
      return { type: 'birthday', value: 1, description: '¡Feliz cumpleaños! Tienes una torta gratis.' };
    }
  }

  return null;
}
