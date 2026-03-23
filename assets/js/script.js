/* ===========================
   ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
=========================== */
let db = null;
let auth = null;
let provider = null;
let currentUserId = "guest";
let globalCartUpdateFunction = null;

/* ===========================
   ИНИЦИАЛИЗАЦИЯ FIREBASE (ЕСЛИ ПОДКЛЮЧЕН)
=========================== */
if (window.firebase) {
  try {
    db = firebase.firestore();
    auth = firebase.auth();
    provider = new firebase.auth.GoogleAuthProvider();
    console.log('✅ Firebase инициализирован');
  } catch (e) {
    console.error('❌ Ошибка инициализации Firebase:', e);
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
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: none;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 2000);
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function closeAllModals() {
  const modals = document.querySelectorAll('.modal, .cart-modal, .history-modal, .booking-sheet');
  modals.forEach(modal => {
    modal.classList.remove('modal--open');
    modal.style.display = 'none';
  });
  document.body.style.overflow = "";
}

/* ===========================
   СИНХРОНИЗАЦИЯ С FIREBASE
=========================== */
async function saveProfileToFirebase(profile) {
  if (!auth || !currentUserId || currentUserId === "guest") return;
  try {
    await db.collection('users').doc(currentUserId).set({
      profile: profile,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('✅ Профиль синхронизирован с Firebase');
  } catch (error) {
    console.error('❌ Ошибка синхронизации профиля:', error);
  }
}

async function loadProfileFromFirebase() {
  if (!auth || !currentUserId || currentUserId === "guest") return null;
  try {
    const doc = await db.collection('users').doc(currentUserId).get();
    if (doc.exists && doc.data().profile) {
      console.log('✅ Профиль загружен из Firebase');
      return doc.data().profile;
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки профиля:', error);
  }
  return null;
}

async function saveCartToFirebase(cart) {
  if (!auth || !currentUserId || currentUserId === "guest") return;
  try {
    await db.collection('users').doc(currentUserId).set({
      cart: cart,
      cartUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('✅ Корзина синхронизирована с Firebase');
  } catch (error) {
    console.error('❌ Ошибка синхронизации корзины:', error);
  }
}

async function loadCartFromFirebase() {
  if (!auth || !currentUserId || currentUserId === "guest") return null;
  try {
    const doc = await db.collection('users').doc(currentUserId).get();
    if (doc.exists && doc.data().cart) {
      console.log('✅ Корзина загружена из Firebase');
      return doc.data().cart;
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки корзины:', error);
  }
  return null;
}

async function saveHistoryToFirebase(history) {
  if (!auth || !currentUserId || currentUserId === "guest") return;
  try {
    await db.collection('users').doc(currentUserId).set({
      orderHistory: history,
      historyUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('✅ История синхронизирована с Firebase');
  } catch (error) {
    console.error('❌ Ошибка синхронизации истории:', error);
  }
}

async function loadHistoryFromFirebase() {
  if (!auth || !currentUserId || currentUserId === "guest") return null;
  try {
    const doc = await db.collection('users').doc(currentUserId).get();
    if (doc.exists && doc.data().orderHistory) {
      console.log('✅ История загружена из Firebase');
      return doc.data().orderHistory;
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки истории:', error);
  }
  return null;
}

async function syncAllData() {
  if (!auth || !currentUserId || currentUserId === "guest") {
    console.log('👤 Гость, синхронизация не требуется');
    return;
  }
  
  console.log('🔄 Начинаем синхронизацию с Firebase...');
  
  const firebaseProfile = await loadProfileFromFirebase();
  const firebaseCart = await loadCartFromFirebase();
  const firebaseHistory = await loadHistoryFromFirebase();
  
  const localProfile = JSON.parse(localStorage.getItem('profile') || '{}');
  const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
  const localHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
  
  if (firebaseProfile && Object.keys(firebaseProfile).length > 0) {
    localStorage.setItem('profile', JSON.stringify(firebaseProfile));
    const profileName = document.getElementById('profileName');
    const profilePhone = document.getElementById('profilePhone');
    if (profileName && firebaseProfile.name) profileName.value = firebaseProfile.name;
    if (profilePhone && firebaseProfile.phone) profilePhone.value = firebaseProfile.phone;
    console.log('📱 Профиль синхронизирован из Firebase');
  } else if (localProfile && Object.keys(localProfile).length > 0) {
    await saveProfileToFirebase(localProfile);
    console.log('☁️ Профиль отправлен в Firebase');
  }
  
  if (firebaseCart && firebaseCart.length > 0) {
    localStorage.setItem('cart', JSON.stringify(firebaseCart));
    if (globalCartUpdateFunction) globalCartUpdateFunction();
    console.log('🛒 Корзина синхронизирована из Firebase');
  } else if (localCart && localCart.length > 0) {
    await saveCartToFirebase(localCart);
    console.log('☁️ Корзина отправлена в Firebase');
  }
  
  let mergedHistory = [];
  if (firebaseHistory && firebaseHistory.length > 0) mergedHistory = [...firebaseHistory];
  if (localHistory && localHistory.length > 0) {
    localHistory.forEach(localOrder => {
      if (!mergedHistory.some(fbOrder => fbOrder.id === localOrder.id)) mergedHistory.push(localOrder);
    });
  }
  mergedHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  if (mergedHistory.length > 0) {
    localStorage.setItem('orderHistory', JSON.stringify(mergedHistory));
    await saveHistoryToFirebase(mergedHistory);
    console.log('📜 История синхронизирована');
  }
  
  console.log('✅ Синхронизация завершена');
}

/* ===========================
   ЖЕСТКАЯ МАСКА ТЕЛЕФОНА
=========================== */
function forcePhoneMask() {
  console.log('🔧 Устанавливаем жесткую маску для телефонов...');
  
  function applyStrictMask(inputElement) {
    if (!inputElement) return;
    
    const newInput = inputElement.cloneNode(true);
    inputElement.parentNode.replaceChild(newInput, inputElement);
    
    newInput.addEventListener('input', function(e) {
      let numbers = e.target.value.replace(/\D/g, '');
      if (numbers.length > 12) numbers = numbers.slice(0, 12);
      
      let formatted = '';
      if (numbers.length === 0) formatted = '';
      else if (numbers.startsWith('375')) {
        if (numbers.length <= 3) formatted = '+' + numbers;
        else if (numbers.length <= 5) formatted = '+' + numbers.slice(0, 3) + ' ' + numbers.slice(3);
        else if (numbers.length <= 8) formatted = '+' + numbers.slice(0, 3) + ' ' + numbers.slice(3, 5) + ' ' + numbers.slice(5);
        else if (numbers.length <= 10) formatted = '+' + numbers.slice(0, 3) + ' ' + numbers.slice(3, 5) + ' ' + numbers.slice(5, 8) + ' ' + numbers.slice(8);
        else formatted = '+' + numbers.slice(0, 3) + ' ' + numbers.slice(3, 5) + ' ' + numbers.slice(5, 8) + ' ' + numbers.slice(8, 10) + ' ' + numbers.slice(10, 12);
      } 
      else if (numbers.startsWith('7')) {
        if (numbers.length <= 1) formatted = '+' + numbers;
        else if (numbers.length <= 4) formatted = '+' + numbers.slice(0, 1) + ' ' + numbers.slice(1);
        else if (numbers.length <= 7) formatted = '+' + numbers.slice(0, 1) + ' ' + numbers.slice(1, 4) + ' ' + numbers.slice(4);
        else if (numbers.length <= 9) formatted = '+' + numbers.slice(0, 1) + ' ' + numbers.slice(1, 4) + ' ' + numbers.slice(4, 7) + ' ' + numbers.slice(7);
        else formatted = '+' + numbers.slice(0, 1) + ' ' + numbers.slice(1, 4) + ' ' + numbers.slice(4, 7) + ' ' + numbers.slice(7, 9) + ' ' + numbers.slice(9, 11);
      }
      else {
        if (numbers.length <= 3) formatted = '+' + numbers;
        else if (numbers.length <= 6) formatted = '+' + numbers.slice(0, 3) + ' ' + numbers.slice(3);
        else if (numbers.length <= 9) formatted = '+' + numbers.slice(0, 3) + ' ' + numbers.slice(3, 6) + ' ' + numbers.slice(6);
        else formatted = '+' + numbers.slice(0, 3) + ' ' + numbers.slice(3, 6) + ' ' + numbers.slice(6, 9) + ' ' + numbers.slice(9, 12);
      }
      e.target.value = formatted;
    });
    
    newInput.addEventListener('keydown', function(e) {
      const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End', 'Enter'];
      if (allowedKeys.includes(e.key)) return;
      if (!/[\d]/.test(e.key)) e.preventDefault();
    });
    
    newInput.addEventListener('blur', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length === 0) return;
      
      if (value.startsWith('375') && value.length !== 12) {
        e.target.style.borderColor = '#ff4757';
        showToast('❌ Введите полный номер: +375 XX XXX XX XX');
      } 
      else if (value.startsWith('7') && value.length !== 11) {
        e.target.style.borderColor = '#ff4757';
        showToast('❌ Введите полный номер: +7 XXX XXX XX XX');
      } 
      else if (value.length > 0 && value.length < 9) {
        e.target.style.borderColor = '#ff4757';
        showToast('❌ Введите корректный номер телефона');
      } 
      else {
        e.target.style.borderColor = '#4caf50';
      }
      setTimeout(() => {
        e.target.style.borderColor = 'rgba(255,255,255,0.3)';
      }, 2000);
    });
    return newInput;
  }
  
  const phoneFields = ['phone', 'profilePhone'];
  phoneFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      applyStrictMask(field);
      console.log(`✅ Маска для ${fieldId}`);
    }
  });
  
  const observer = new MutationObserver(() => {
    phoneFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field && !field.hasAttribute('data-masked')) {
        applyStrictMask(field);
        field.setAttribute('data-masked', 'true');
      }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
  console.log('✅ Жесткая маска установлена');
}

/* ===========================
   СТИЛИ ДЛЯ TOAST И МОДАЛОК
=========================== */
function addGlobalStyles() {
  if (document.getElementById('global-styles')) return;
  
  const styles = document.createElement('style');
  styles.id = 'global-styles';
  styles.textContent = `
    #toast {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10000;
      display: none;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideUp 0.3s ease;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translate(-50%, 20px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }
    .modal, .cart-modal, .history-modal, .booking-sheet {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      z-index: 9999;
      align-items: center;
      justify-content: center;
    }
    .modal--open { display: flex !important; }
    .modal-content, .cart-content, .history-content, .booking-sheet__window {
      background: rgba(0,0,0,0.92);
      padding: 30px;
      border-radius: 12px;
      max-width: 500px;
      width: 90%;
      max-height: 85vh;
      overflow-y: auto;
      position: relative;
      animation: modalFadeIn 0.3s ease;
      color: #fff;
    }
    .cart-content { max-width: 400px; }
    @keyframes modalFadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .cart-close, .history-close {
      position: absolute;
      top: 15px;
      right: 20px;
      font-size: 24px;
      cursor: pointer;
      color: #fff;
      background: none;
      border: none;
    }
    .cart-count {
      background: #e44d2e;
      color: white;
      border-radius: 50%;
      padding: 2px 6px;
      font-size: 12px;
      position: absolute;
      top: -5px;
      right: -5px;
      min-width: 18px;
      text-align: center;
    }
    .cart-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .remove-item {
      background: none;
      border: none;
      color: #ff4757;
      font-size: 18px;
      cursor: pointer;
      padding: 0 5px;
    }
    .empty-cart { text-align: center; color: #999; padding: 20px; }
    .cart-total {
      font-size: 18px;
      font-weight: 600;
      margin: 15px 0;
      padding-top: 10px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    .cart-buttons { display: flex; gap: 10px; margin-top: 15px; }
    .clear-cart-btn {
      background: #ff4757; color: white; border: none; padding: 12px 20px;
      border-radius: 10px; font-size: 16px; font-weight: 500; cursor: pointer; flex: 1;
    }
    .clear-cart-btn:hover { background: #ee3a4a; }
    .clear-history-btn {
      background: #ff4757; color: white; border: none; padding: 10px 18px;
      border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;
    }
    .clear-history-btn:hover { background: #ee3a4a; }
    .history-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .history-header h2 { margin: 0; font-size: 24px; color: #fff; }
    .history-item {
      padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);
      margin-bottom: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;
    }
    .history-date { color: #aaa; font-size: 12px; margin-bottom: 8px; }
    .history-name { font-weight: bold; margin-bottom: 5px; }
    .history-booking { color: #f7c325; margin-bottom: 8px; font-size: 14px; }
    .history-items { margin: 10px 0; padding-left: 10px; color: #ccc; font-size: 13px; }
    .history-total { font-weight: bold; margin-top: 8px; color: #f7c325; }
    .no-orders { text-align: center; color: #999; padding: 40px; }
    .btn-primary {
      background: #f7c325; color: #000; border: none; padding: 12px 24px;
      border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer;
    }
    .phone-hint { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 4px; display: block; }
    input[type="text"]#phone, input[type="text"]#profilePhone { transition: border-color 0.3s ease; }
    input[type="text"]#phone:focus, input[type="text"]#profilePhone:focus { outline: none; border-color: #f7c325 !important; }
  `;
  document.head.appendChild(styles);
}

/* ===========================
   БУРГЕР-МЕНЮ
=========================== */
function initBurgerMenu() {
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener('click', (e) => { e.stopPropagation(); mobileMenu.classList.toggle('open'); });
    document.addEventListener('click', (e) => {
      if (!burgerBtn.contains(e.target) && !mobileMenu.contains(e.target)) mobileMenu.classList.remove('open');
    });
  }
}

/* ===========================
   ФИЛЬТР МЕНЮ
=========================== */
function initMenuFilter() {
  const filterButtons = document.querySelectorAll('.menu-categories button');
  const menuItems = document.querySelectorAll('.menu-item');
  if (!filterButtons.length || !menuItems.length) return;
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.dataset.filter;
      menuItems.forEach(item => {
        const match = category === 'all' || item.dataset.category === category;
        item.style.display = match ? 'block' : 'none';
      });
    });
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
    if (cartTotal) cartTotal.textContent = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    if (cartItems) {
      cartItems.innerHTML = '';
      if (cart.length === 0) { cartItems.innerHTML = '<p class="empty-cart">Корзина пуста</p>'; return; }
      cart.forEach((item, index) => {
        const div = document.createElement('div'); div.className = 'cart-item';
        div.innerHTML = `<span>${item.title}</span><span>${Number(item.price) || 0} BYN</span><button class="remove-item" data-index="${index}">✕</button>`;
        cartItems.appendChild(div);
      });
      document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
          cart.splice(btn.dataset.index, 1); saveCart(cart); updateCart(); showToast('Товар удален');
          if (auth && currentUserId !== "guest") saveCartToFirebase(cart);
        });
      });
    }
  }

  document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const item = btn.closest('.menu-item');
      if (!item) return;
      const titleEl = item.querySelector('.menu-title');
      const priceEl = item.querySelector('.menu-price');
      let title = titleEl ? titleEl.textContent.trim() : 'Блюдо';
      let price = priceEl ? Number(priceEl.textContent.replace(/[^\d]/g, '')) || 0 : 0;
      cart.push({ title, price });
      saveCart(cart);
      updateCart();
      if (auth && currentUserId !== "guest") await saveCartToFirebase(cart);
      showToast(`«${title}» добавлено`);
    });
  });

  if (openCart && cartModal) {
    openCart.addEventListener('click', (e) => {
      e.preventDefault();
      cart = JSON.parse(localStorage.getItem('cart') || '[]');
      updateCart();
      cartModal.style.display = 'flex';
      cartModal.classList.add('modal--open');
      document.body.style.overflow = "hidden";
    });
  }
  if (closeCart && cartModal) closeCart.addEventListener('click', () => { cartModal.style.display = 'none'; cartModal.classList.remove('modal--open'); document.body.style.overflow = ""; });
  if (cartModal) cartModal.addEventListener('click', (e) => { if (e.target === cartModal) { cartModal.style.display = 'none'; cartModal.classList.remove('modal--open'); document.body.style.overflow = ""; } });
  if (clearCartBtn) clearCartBtn.addEventListener('click', () => { if (confirm('Очистить корзину?')) { cart = []; saveCart(cart); updateCart(); showToast('🛒 Корзина очищена'); if (auth && currentUserId !== "guest") saveCartToFirebase(cart); } });
  if (checkoutBtn) checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) { showToast("Корзина пуста"); return; }
    if (cartModal) { cartModal.style.display = 'none'; cartModal.classList.remove('modal--open'); }
    const orderText = cart.map(item => `• ${item.title} — ${item.price} BYN`).join('\n');
    setTimeout(() => {
      const bookingModal = document.getElementById('bookingModal');
      const commentField = document.getElementById('comment');
      if (commentField) commentField.value = `Заказ:\n${orderText}`;
      if (bookingModal) { bookingModal.style.display = 'flex'; bookingModal.classList.add('modal--open'); }
    }, 300);
  });
  updateCart();
  globalCartUpdateFunction = function() { cart = JSON.parse(localStorage.getItem('cart') || '[]'); updateCart(); };
  document.addEventListener('cartUpdated', function() { cart = JSON.parse(localStorage.getItem('cart') || '[]'); updateCart(); });
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

  if (profileName) profileName.addEventListener('input', () => { profileName.value = profileName.value.replace(/[^А-Яа-яЁё\s]/g, "").replace(/\s+/g, " ").slice(0, 30); });
  if (saveProfile) {
    saveProfile.addEventListener('click', async () => {
      profile = { name: profileName ? profileName.value : "", phone: profilePhone ? profilePhone.value : "" };
      localStorage.setItem('profile', JSON.stringify(profile));
      if (auth && currentUserId !== "guest") await saveProfileToFirebase(profile);
      showToast('Профиль сохранён и синхронизирован');
    });
  }
  if (googleLoginBtn && auth) googleLoginBtn.addEventListener('click', () => { auth.signInWithPopup(provider).then(async result => { const user = result.user; if (user.displayName && profileName) { profileName.value = user.displayName; profile.name = user.displayName; } if (user.photoURL && avatar) { avatar.src = user.photoURL; avatar.style.display = 'block'; } localStorage.setItem('profile', JSON.stringify(profile)); await syncAllData(); showToast('Вы успешно вошли'); }).catch(error => { console.error(error); showToast('Ошибка при входе'); }); });
  if (auth) auth.onAuthStateChanged(async user => { if (user) { currentUserId = user.uid; if (logoutBtn) logoutBtn.style.display = 'block'; if (user.photoURL && avatar) { avatar.src = user.photoURL; avatar.style.display = 'block'; } await syncAllData(); } else { currentUserId = "guest"; if (logoutBtn) logoutBtn.style.display = 'none'; } });
  if (logoutBtn && auth) logoutBtn.addEventListener('click', () => { auth.signOut().then(() => { localStorage.removeItem('profile'); if (profileName) profileName.value = ''; if (profilePhone) profilePhone.value = ''; if (avatar) avatar.style.display = 'none'; showToast('Вы вышли из аккаунта'); }); });
}

/* ===========================
   БРОНИРОВАНИЕ (С ПОЛНОЙ ВАЛИДАЦИЕЙ)
=========================== */
function initBooking() {
  const bookingModal = document.getElementById('bookingModal');
  const openBookingModal = document.getElementById('openBookingModal');
  const openBookingHero = document.getElementById('openBookingHero');
  const closeBooking = document.getElementById('closeBooking');
  const bookingForm = document.getElementById('booking-form');
  const clearBooking = document.getElementById('clearBooking');
  if (!bookingModal || !bookingForm) return;

  const nameInput = document.getElementById('name');
  const phoneInput = document.getElementById('phone');
  const dateInput = document.getElementById('date');
  const timeInput = document.getElementById('time');
  const guestsInput = document.getElementById('guests');
  const commentInput = document.getElementById('comment');

  if (dateInput) {
    const today = new Date(); const maxDate = new Date(today); maxDate.setMonth(maxDate.getMonth() + 1);
    dateInput.min = today.toISOString().split('T')[0]; dateInput.max = maxDate.toISOString().split('T')[0];
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1); dateInput.value = tomorrow.toISOString().split('T')[0];
  }
  if (timeInput && !timeInput.value) timeInput.value = '18:00';

  function openBooking() {
    bookingModal.style.display = 'flex'; bookingModal.classList.add('modal--open'); document.body.style.overflow = "hidden";
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');
    if (nameInput && profile.name) nameInput.value = profile.name;
    if (phoneInput && profile.phone) phoneInput.value = profile.phone;
  }
  if (openBookingModal) openBookingModal.addEventListener('click', openBooking);
  if (openBookingHero) openBookingHero.addEventListener('click', openBooking);
  if (closeBooking) closeBooking.addEventListener('click', () => { bookingModal.style.display = 'none'; bookingModal.classList.remove('modal--open'); document.body.style.overflow = ""; });
  bookingModal.addEventListener('click', (e) => { if (e.target === bookingModal) { bookingModal.style.display = 'none'; bookingModal.classList.remove('modal--open'); document.body.style.overflow = ""; } });
  if (clearBooking) clearBooking.addEventListener('click', (e) => { e.preventDefault(); bookingForm.reset(); if (commentInput) commentInput.value = ''; if (dateInput) { const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); dateInput.value = tomorrow.toISOString().split('T')[0]; } if (timeInput) timeInput.value = '18:00'; if (guestsInput) guestsInput.value = '2'; showToast('Форма очищена'); });

  bookingForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = nameInput?.value.trim();
    const phone = phoneInput?.value.trim();
    const guests = guestsInput?.value || '2';
    const comment = commentInput?.value.trim() || '';
    const date = dateInput?.value;
    const time = timeInput?.value;
    
    let errors = [];
    
    if (!name) {
      errors.push('❌ Имя');
      nameInput.style.borderColor = '#ff4757';
    } else {
      nameInput.style.borderColor = '#4caf50';
    }
    
    if (!phone) {
      errors.push('❌ Телефон');
      phoneInput.style.borderColor = '#ff4757';
    } else {
      let phoneNumbers = phone.replace(/\D/g, '');
      if (phoneNumbers.startsWith('375') && phoneNumbers.length !== 12) {
        errors.push('❌ Некорректный номер (+375 XX XXX XX XX)');
        phoneInput.style.borderColor = '#ff4757';
      } else if (phoneNumbers.startsWith('7') && phoneNumbers.length !== 11) {
        errors.push('❌ Некорректный номер (+7 XXX XXX XX XX)');
        phoneInput.style.borderColor = '#ff4757';
      } else if (phoneNumbers.length < 9) {
        errors.push('❌ Некорректный номер телефона');
        phoneInput.style.borderColor = '#ff4757';
      } else {
        phoneInput.style.borderColor = '#4caf50';
      }
    }
    
    if (!date) {
      errors.push('❌ Дата');
      dateInput.style.borderColor = '#ff4757';
    } else {
      dateInput.style.borderColor = '#4caf50';
    }
    
    if (!time) {
      errors.push('❌ Время');
      timeInput.style.borderColor = '#ff4757';
    } else {
      timeInput.style.borderColor = '#4caf50';
    }
    
    if (!guests || guests === '0') {
      errors.push('❌ Количество гостей');
      guestsInput.style.borderColor = '#ff4757';
    } else {
      guestsInput.style.borderColor = '#4caf50';
    }
    
    if (errors.length > 0) {
      let errorMessage = '⚠️ Заполните обязательные поля:\n';
      errors.forEach(err => { errorMessage += `\n${err}`; });
      alert(errorMessage);
      setTimeout(() => {
        if (nameInput) nameInput.style.borderColor = 'rgba(255,255,255,0.3)';
        if (phoneInput) phoneInput.style.borderColor = 'rgba(255,255,255,0.3)';
        if (dateInput) dateInput.style.borderColor = 'rgba(255,255,255,0.3)';
        if (timeInput) timeInput.style.borderColor = 'rgba(255,255,255,0.3)';
        if (guestsInput) guestsInput.style.borderColor = 'rgba(255,255,255,0.3)';
      }, 3000);
      return;
    }

    const submitBtn = bookingForm.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Отправка...'; }
    
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
      const orderData = { 
        id: Date.now().toString(), 
        userId: currentUserId, 
        name, 
        phone, 
        guests: Number(guests), 
        comment, 
        date, 
        time, 
        total, 
        items: cart, 
        status: 'new', 
        timestamp: new Date().toISOString() 
      };
      
      const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      history.unshift(orderData);
      localStorage.setItem('orderHistory', JSON.stringify(history));
      if (auth && currentUserId !== "guest") await saveHistoryToFirebase(history);
      
      localStorage.setItem('cart', '[]');
      if (auth && currentUserId !== "guest") await saveCartToFirebase([]);
      
      const cartCount = document.getElementById('cartCount'); if (cartCount) cartCount.textContent = '0';
      const cartTotalEl = document.getElementById('cartTotal'); if (cartTotalEl) cartTotalEl.textContent = '0';
      const cartItemsEl = document.getElementById('cartItems'); if (cartItemsEl) cartItemsEl.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
      document.querySelectorAll('.cart-count').forEach(el => el.textContent = '0');
      if (globalCartUpdateFunction) globalCartUpdateFunction();
      
      showToast('✅ Ваш заказ оформлен!');
      
      bookingModal.style.display = 'none'; 
      bookingModal.classList.remove('modal--open'); 
      document.body.style.overflow = "";
      bookingForm.reset();
      
      if (commentInput) commentInput.value = '';
      if (dateInput) { 
        const tomorrow = new Date(); 
        tomorrow.setDate(tomorrow.getDate() + 1); 
        dateInput.value = tomorrow.toISOString().split('T')[0]; 
      }
      if (timeInput) timeInput.value = '18:00';
      if (guestsInput) guestsInput.value = '2';
      
    } catch (error) { 
      console.error(error); 
      showToast('❌ Ошибка при отправке'); 
    } finally { 
      setTimeout(() => { 
        if (submitBtn) { 
          submitBtn.disabled = false; 
          submitBtn.textContent = 'Отправить заявку'; 
        } 
      }, 500); 
    }
  });
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
  if (!historyModal || !historyList) return;

  function loadHistory() {
    const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    if (history.length === 0) { historyList.innerHTML = '<p class="no-orders">У вас пока нет заказов</p>'; return; }
    historyList.innerHTML = history.map(order => `<div class="history-item"><div class="history-date">${new Date(order.timestamp).toLocaleString('ru-RU')}</div><div class="history-name">${order.name} • ${order.phone}</div><div class="history-booking">${order.date} ${order.time} • ${order.guests} чел.</div><div class="history-items">${order.items.map(item => `• ${item.title} — ${item.price} BYN`).join('<br>')}</div><div class="history-total">Сумма: ${order.total} BYN</div>${order.comment ? `<div class="history-comment">${order.comment}</div>` : ''}</div>`).join('');
  }
  function clearHistory() { if (confirm('Удалить всю историю заказов?')) { localStorage.setItem('orderHistory', '[]'); if (auth && currentUserId !== "guest") saveHistoryToFirebase([]); loadHistory(); showToast('🗑️ История очищена'); } }
  function openHistoryModal() { loadHistory(); historyModal.style.display = 'flex'; historyModal.classList.add('modal--open'); document.body.style.overflow = 'hidden'; }
  if (openHistory) openHistory.addEventListener('click', openHistoryModal);
  if (openHistoryFooter) openHistoryFooter.addEventListener('click', openHistoryModal);
  if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', clearHistory);
  if (closeHistory) closeHistory.addEventListener('click', () => { historyModal.style.display = 'none'; historyModal.classList.remove('modal--open'); document.body.style.overflow = ''; });
  historyModal.addEventListener('click', (e) => { if (e.target === historyModal) { historyModal.style.display = 'none'; historyModal.classList.remove('modal--open'); document.body.style.overflow = ''; } });
}

/* ===========================
   ПРИНУДИТЕЛЬНОЕ ИСПРАВЛЕНИЕ ИНТЕРФЕЙСА
=========================== */
function forceFixInterface() {
  console.log('🔧 Принудительное исправление интерфейса...');
  const closeBtn = document.getElementById('closeBooking');
  if (closeBtn) closeBtn.style.cssText = `position: absolute !important; top: 15px !important; right: 15px !important; left: auto !important; width: 34px !important; height: 34px !important; background: rgba(255,255,255,0.2) !important; border: 1px solid rgba(255,255,255,0.3) !important; border-radius: 50% !important; color: white !important; font-size: 20px !important; cursor: pointer !important; display: flex !important; align-items: center !important; justify-content: center !important; z-index: 9999 !important;`;
  document.querySelectorAll('.btn-outline').forEach(btn => { btn.style.background = 'transparent'; btn.style.color = '#fff'; btn.style.border = '2px solid rgba(255,255,255,0.6)'; btn.style.borderRadius = '10px'; btn.style.padding = '12px 24px'; btn.style.fontSize = '16px'; btn.style.fontWeight = '500'; btn.style.cursor = 'pointer'; btn.style.transition = 'all 0.3s ease'; });
  const viewMenuBtn = document.querySelector('.hero-buttons .btn-outline'); if (viewMenuBtn && viewMenuBtn.textContent.includes('Посмотреть меню')) viewMenuBtn.style.border = '2px solid rgba(255,255,255,0.6)';
  const historyFooter = document.getElementById('openHistoryFooter'); if (historyFooter) { historyFooter.style.border = '2px solid rgba(255,255,255,0.6)'; historyFooter.style.padding = '12px 24px'; }
  const cartButtons = document.querySelector('.cart-buttons'); if (cartButtons) { cartButtons.style.display = 'flex'; cartButtons.style.gap = '10px'; cartButtons.style.marginTop = '15px'; }
  const historyClose = document.getElementById('closeHistory'); if (historyClose) historyClose.style.cssText = `position: absolute !important; top: 15px !important; right: 15px !important; width: 34px !important; height: 34px !important; background: rgba(255,255,255,0.2) !important; border: 1px solid rgba(255,255,255,0.3) !important; border-radius: 50% !important; color: white !important; font-size: 20px !important; cursor: pointer !important; display: flex !important; align-items: center !important; justify-content: center !important; z-index: 9999 !important;`;
  console.log('✅ Исправление интерфейса завершено');
}

/* ===========================
   ЗАКРЫТИЕ ПО ESC
=========================== */
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAllModals(); });

/* ===========================
   ЗАПУСК ПРИ ЗАГРУЗКЕ
=========================== */
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Запуск инициализации...');
  addGlobalStyles();
  initBurgerMenu();
  initMenuFilter();
  initCart();
  initProfile();
  initBooking();
  initHistory();
  setTimeout(() => forcePhoneMask(), 300);
  setTimeout(() => forceFixInterface(), 500);
  console.log('✅ Сайт загружен');
});

window.debug = {
  cart: () => JSON.parse(localStorage.getItem('cart') || '[]'),
  history: () => JSON.parse(localStorage.getItem('orderHistory') || '[]'),
  profile: () => JSON.parse(localStorage.getItem('profile') || '{}'),
  clear: () => { if (confirm('Очистить всё?')) { localStorage.clear(); location.reload(); } }
};