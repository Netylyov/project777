/* ===========================
   ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
=========================== */
let db = null;
let auth = null;
let provider = null;
let currentUserId = "guest";
let globalCartUpdateFunction = null;

/* ===========================
   ИНИЦИАЛИЗАЦИЯ FIREBASE
=========================== */
if (window.firebase && firebase.firestore) {
  try {
    db = firebase.firestore();
    auth = firebase.auth();
    provider = new firebase.auth.GoogleAuthProvider();
    console.log('✅ Firebase инициализирован');
  } catch (e) {
    console.error('❌ Ошибка Firebase:', e);
  }
}

/* ===========================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
=========================== */
function showToast(text) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10000;
      font-size: 16px;
      display: none;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 2000);
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

/* ===========================
   БУРГЕР-МЕНЮ
=========================== */
function initBurgerMenu() {
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (burgerBtn && mobileMenu) {
    burgerBtn.onclick = (e) => {
      e.stopPropagation();
      mobileMenu.classList.toggle('open');
    };
    document.addEventListener('click', (e) => {
      if (!burgerBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
      }
    });
  }
}

/* ===========================
   ФИЛЬТР МЕНЮ
=========================== */
function initMenuFilter() {
  const filterButtons = document.querySelectorAll('.menu-categories button');
  const menuItems = document.querySelectorAll('.menu-item');
  if (!filterButtons.length) return;
  filterButtons.forEach(btn => {
    btn.onclick = () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.dataset.filter;
      menuItems.forEach(item => {
        item.style.display = (category === 'all' || item.dataset.category === category) ? 'block' : 'none';
      });
    };
  });
}

/* ===========================
   КОРЗИНА
=========================== */
function initCart() {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const cartModal = document.getElementById('cartModal');
  const openCart = document.getElementById('openCart');
  const closeCart = document.getElementById('closeCart');
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const cartCount = document.getElementById('cartCount');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const clearCartBtn = document.getElementById('clearCartBtn');

  function updateCart() {
    if (cartCount) cartCount.textContent = cart.length;
    if (cartTotal) {
      cartTotal.textContent = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    }
    if (cartItems) {
      cartItems.innerHTML = '';
      if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
        return;
      }
      cart.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `<span>${item.title}</span><span>${Number(item.price) || 0} BYN</span><button class="remove-item" data-index="${index}">✕</button>`;
        cartItems.appendChild(div);
      });
      document.querySelectorAll('.remove-item').forEach(btn => {
        btn.onclick = () => {
          cart.splice(btn.dataset.index, 1);
          saveCart(cart);
          updateCart();
          showToast('Товар удален');
        };
      });
    }
  }

  document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const item = btn.closest('.menu-item');
      if (!item) return;
      const titleEl = item.querySelector('.menu-title');
      const priceEl = item.querySelector('.menu-price');
      const title = titleEl ? titleEl.textContent.trim() : 'Блюдо';
      const price = priceEl ? Number(priceEl.textContent.replace(/[^\d]/g, '')) || 0 : 0;
      cart.push({ title, price });
      saveCart(cart);
      updateCart();
      showToast(`«${title}» добавлено`);
    };
  });

  if (openCart && cartModal) {
    openCart.onclick = (e) => {
      e.preventDefault();
      updateCart();
      cartModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    };
  }
  if (closeCart && cartModal) closeCart.onclick = () => { cartModal.style.display = 'none'; document.body.style.overflow = ''; };
  if (cartModal) cartModal.onclick = (e) => { if (e.target === cartModal) { cartModal.style.display = 'none'; document.body.style.overflow = ''; } };
  if (clearCartBtn) clearCartBtn.onclick = () => { if (confirm('Очистить корзину?')) { cart = []; saveCart(cart); updateCart(); showToast('🛒 Корзина очищена'); } };
  if (checkoutBtn) checkoutBtn.onclick = () => {
    if (cart.length === 0) { showToast('Корзина пуста'); return; }
    if (cartModal) cartModal.style.display = 'none';
    const orderText = cart.map(item => `• ${item.title} — ${item.price} BYN`).join('\n');
    setTimeout(() => {
      const commentField = document.getElementById('comment');
      const bookingModal = document.getElementById('bookingModal');
      if (commentField) commentField.value = `Заказ:\n${orderText}`;
      if (bookingModal) bookingModal.style.display = 'flex';
    }, 300);
  };
  updateCart();
  globalCartUpdateFunction = updateCart;
}

/* ===========================
   ПРОФИЛЬ
=========================== */
function initProfile() {
  const profileName = document.getElementById('profileName');
  const profilePhone = document.getElementById('profilePhone');
  const saveProfile = document.getElementById('saveProfile');
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const avatar = document.getElementById('profileAvatar');
  let profile = JSON.parse(localStorage.getItem('profile') || '{}');

  if (profile.name && profileName) profileName.value = profile.name;
  if (profile.phone && profilePhone) profilePhone.value = profile.phone;

  if (saveProfile) {
    saveProfile.onclick = () => {
      profile = { name: profileName?.value || '', phone: profilePhone?.value || '' };
      localStorage.setItem('profile', JSON.stringify(profile));
      showToast('Профиль сохранён');
    };
  }
  if (googleLoginBtn && auth) {
    googleLoginBtn.onclick = () => {
      auth.signInWithPopup(provider).then(result => {
        const user = result.user;
        if (user.displayName && profileName) profileName.value = user.displayName;
        if (user.photoURL && avatar) { avatar.src = user.photoURL; avatar.style.display = 'block'; }
        localStorage.setItem('profile', JSON.stringify({ name: user.displayName || '', phone: profilePhone?.value || '' }));
        showToast('Вы успешно вошли');
      }).catch(() => showToast('Ошибка входа'));
    };
  }
  if (auth) {
    auth.onAuthStateChanged(user => {
      if (user) {
        currentUserId = user.uid;
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (user.photoURL && avatar) { avatar.src = user.photoURL; avatar.style.display = 'block'; }
      } else {
        currentUserId = 'guest';
        if (logoutBtn) logoutBtn.style.display = 'none';
      }
    });
  }
  if (logoutBtn && auth) {
    logoutBtn.onclick = () => {
      auth.signOut().then(() => {
        localStorage.removeItem('profile');
        if (profileName) profileName.value = '';
        if (profilePhone) profilePhone.value = '';
        if (avatar) avatar.style.display = 'none';
        showToast('Вы вышли');
      });
    };
  }
}

/* ===========================
   БРОНИРОВАНИЕ
=========================== */
function initBooking() {
  const bookingModal = document.getElementById('bookingModal');
  const openBookingModal = document.getElementById('openBookingModal');
  const openBookingHero = document.getElementById('openBookingHero');
  const closeBooking = document.getElementById('closeBooking');
  const bookingForm = document.getElementById('booking-form');
  const clearBooking = document.getElementById('clearBooking');
  
  if (!bookingModal) return;

  const nameInput = document.getElementById('name');
  const phoneInput = document.getElementById('phone');
  const dateInput = document.getElementById('date');
  const timeInput = document.getElementById('time');
  const guestsInput = document.getElementById('guests');
  const commentInput = document.getElementById('comment');

  if (dateInput) {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 1);
    dateInput.min = today.toISOString().split('T')[0];
    dateInput.max = maxDate.toISOString().split('T')[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().split('T')[0];
  }
  if (timeInput && !timeInput.value) timeInput.value = '18:00';

  function openBooking() {
    bookingModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');
    if (nameInput && profile.name) nameInput.value = profile.name;
    if (phoneInput && profile.phone) phoneInput.value = profile.phone;
  }

  if (openBookingModal) openBookingModal.onclick = openBooking;
  if (openBookingHero) openBookingHero.onclick = openBooking;
  if (closeBooking) closeBooking.onclick = () => { bookingModal.style.display = 'none'; document.body.style.overflow = ''; };
  bookingModal.onclick = (e) => { if (e.target === bookingModal) { bookingModal.style.display = 'none'; document.body.style.overflow = ''; } };
  if (clearBooking) clearBooking.onclick = (e) => { e.preventDefault(); bookingForm?.reset(); if (commentInput) commentInput.value = ''; if (dateInput) { const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); dateInput.value = tomorrow.toISOString().split('T')[0]; } if (timeInput) timeInput.value = '18:00'; if (guestsInput) guestsInput.value = '2'; showToast('Форма очищена'); };

  if (bookingForm) {
    bookingForm.onsubmit = (e) => {
      e.preventDefault();
      const name = nameInput?.value.trim();
      const phone = phoneInput?.value.trim();
      const guests = guestsInput?.value || '2';
      const comment = commentInput?.value.trim() || '';
      const date = dateInput?.value;
      const time = timeInput?.value;

      if (!name || !phone || !date || !time) {
        alert('⚠️ Заполните все обязательные поля');
        return;
      }

      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Отправка...'; }

      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
        const orderData = { id: Date.now().toString(), userId: currentUserId, name, phone, guests: Number(guests), comment, date, time, total, items: cart, status: 'new', timestamp: new Date().toISOString() };
        const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        history.unshift(orderData);
        localStorage.setItem('orderHistory', JSON.stringify(history));
        
        localStorage.setItem('cart', '[]');
        if (globalCartUpdateFunction) globalCartUpdateFunction();
        showToast('✅ Ваш заказ оформлен!');
        
        bookingModal.style.display = 'none';
        document.body.style.overflow = '';
        bookingForm.reset();
        if (commentInput) commentInput.value = '';
        if (dateInput) { const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); dateInput.value = tomorrow.toISOString().split('T')[0]; }
        if (timeInput) timeInput.value = '18:00';
        if (guestsInput) guestsInput.value = '2';
      } catch (error) { console.error(error); showToast('❌ Ошибка'); }
      finally { setTimeout(() => { if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Отправить заявку'; } }, 500); }
    };
  }
}

/* ===========================
   ИСТОРИЯ ЗАКАЗОВ
=========================== */
function initHistory() {
  const historyModal = document.getElementById('historyModal');
  const openHistory = document.getElementById('openHistory');
  const openHistoryFooter = document.getElementById('openHistoryFooter');
  const closeHistory = document.getElementById('closeHistory');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const historyList = document.getElementById('historyList');
  if (!historyModal) return;

  function loadHistory() {
    const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    if (!historyList) return;
    if (history.length === 0) { historyList.innerHTML = '<p class="no-orders">У вас пока нет заказов</p>'; return; }
    historyList.innerHTML = history.map(order => `<div class="history-item"><div class="history-date">${new Date(order.timestamp).toLocaleString('ru-RU')}</div><div class="history-name">${order.name} • ${order.phone}</div><div class="history-booking">${order.date} ${order.time} • ${order.guests} чел.</div><div class="history-items">${order.items.map(item => `• ${item.title} — ${item.price} BYN`).join('<br>')}</div><div class="history-total">Сумма: ${order.total} BYN</div>${order.comment ? `<div class="history-comment">${order.comment}</div>` : ''}</div>`).join('');
  }

  function openHistoryModal() { loadHistory(); historyModal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
  if (openHistory) openHistory.onclick = openHistoryModal;
  if (openHistoryFooter) openHistoryFooter.onclick = openHistoryModal;
  if (closeHistory) closeHistory.onclick = () => { historyModal.style.display = 'none'; document.body.style.overflow = ''; };
  if (clearHistoryBtn) clearHistoryBtn.onclick = () => { if (confirm('Удалить всю историю?')) { localStorage.setItem('orderHistory', '[]'); loadHistory(); showToast('🗑️ История очищена'); } };
  historyModal.onclick = (e) => { if (e.target === historyModal) { historyModal.style.display = 'none'; document.body.style.overflow = ''; } };
}

/* ===========================
   ЗАПУСК ПРИ ЗАГРУЗКЕ
=========================== */
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Запуск сайта...');
  initBurgerMenu();
  initMenuFilter();
  initCart();
  initProfile();
  initBooking();
  initHistory();
  console.log('✅ Сайт загружен');
});