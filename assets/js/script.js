/* ===========================
   БУРГЕР-МЕНЮ
=========================== */
const burgerBtn = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (burgerBtn && mobileMenu) {
  burgerBtn.onclick = () => mobileMenu.classList.toggle('open');
}


/* ===========================
   МОДАЛКА БРОНИРОВАНИЯ
=========================== */
const bookingModal = document.getElementById('bookingModal');
const openBookingModal = document.getElementById('openBookingModal');
const openBookingHero = document.getElementById('openBookingHero');
const closeBooking = document.getElementById('closeBooking');

function openBooking() {
  if (bookingModal) bookingModal.classList.add('modal--open');
}

if (openBookingModal) openBookingModal.onclick = openBooking;
if (openBookingHero) openBookingHero.onclick = openBooking;

if (closeBooking) {
  closeBooking.onclick = () => bookingModal && bookingModal.classList.remove('modal--open');
}

if (bookingModal) {
  bookingModal.onclick = (e) => {
    if (e.target === bookingModal) bookingModal.classList.remove('modal--open');
  };
}


/* ===========================
   ФИЛЬТР МЕНЮ
=========================== */
const filterButtons = document.querySelectorAll('.menu-categories button');
const menuItems = document.querySelectorAll('.menu-item');

filterButtons.forEach(btn => {
  btn.onclick = () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const category = btn.dataset.filter;

    menuItems.forEach(item => {
      if (category === 'all' || item.dataset.category === category) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  };
});


/* ===========================
   КОРЗИНА
=========================== */
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

const cartModal = document.getElementById('cartModal');
const openCart = document.getElementById('openCart');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCart() {
  if (!cartItems || !cartTotal || !cartCount) return;

  cartItems.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;

    const div = document.createElement('div');
    div.className = 'cart-row';
    div.innerHTML = `
      <span>${item.title}</span>
      <span>${item.price} BYN</span>
      <button data-index="${index}" class="remove-item">✕</button>
    `;
    cartItems.appendChild(div);
  });

  cartTotal.textContent = total;
  cartCount.textContent = cart.length;

  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.onclick = () => {
      cart.splice(btn.dataset.index, 1);
      saveCart();
      updateCart();
    };
  });
}

document.querySelectorAll('.menu-btn').forEach(btn => {
  btn.onclick = () => {
    const item = btn.closest('.menu-item');
    if (!item) return;

    const titleEl = item.querySelector('.menu-title');
    const priceEl = item.querySelector('.menu-price');
    if (!titleEl || !priceEl) return;

    const title = titleEl.textContent;
    const price = Number(priceEl.textContent);

    cart.push({ title, price });
    saveCart();
    updateCart();
  };
});

if (openCart && cartModal) openCart.onclick = () => cartModal.classList.add('modal--open');
if (closeCart && cartModal) closeCart.onclick = () => cartModal.classList.remove('modal--open');

if (cartModal) {
  cartModal.onclick = (e) => {
    if (e.target === cartModal) cartModal.classList.remove('modal--open');
  };
}

updateCart();


/* ===========================
   FIREBASE (безопасная инициализация)
=========================== */
let db = null;
let auth = null;
let provider = null;

if (window.firebase) {
  try {
    db = firebase.firestore();
    auth = firebase.auth();
    provider = new firebase.auth.GoogleAuthProvider();
  } catch (e) {
    console.error('Firebase init error:', e);
  }
}


/* ===========================
   ПРОФИЛЬ + GOOGLE LOGIN
=========================== */
const profileName = document.getElementById('profileName');
const profilePhone = document.getElementById('profilePhone');
const saveProfile = document.getElementById('saveProfile');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const avatar = document.getElementById('profileAvatar');

let profile = JSON.parse(localStorage.getItem('profile') || '{}');

function loadProfile() {
  if (profileName && profile.name) profileName.value = profile.name;
  if (profilePhone && profile.phone) profilePhone.value = profile.phone;
}
loadProfile();

// Сохранение профиля вручную
if (saveProfile && profileName && profilePhone) {
  saveProfile.onclick = () => {
    profile = {
      name: profileName.value,
      phone: profilePhone.value
    };
    localStorage.setItem('profile', JSON.stringify(profile));
    alert('Профиль сохранён');
  };
}

// Вход через Google
if (googleLoginBtn && auth && provider && profileName) {
  googleLoginBtn.onclick = () => {
    auth.signInWithPopup(provider)
      .then(result => {
        const user = result.user;

        if (user?.displayName) {
          profileName.value = user.displayName;
          profile.name = user.displayName;
        }

        if (avatar && user?.photoURL) {
          avatar.src = user.photoURL;
          avatar.style.display = 'block';
        }

        localStorage.setItem('profile', JSON.stringify(profile));
      })
      .catch(err => {
        console.error('Google login error:', err);
      });
  };
}

// Отслеживание авторизации
if (auth) {
  auth.onAuthStateChanged(user => {
    if (user) {
      if (logoutBtn) logoutBtn.style.display = 'block';
      if (avatar && user.photoURL) {
        avatar.src = user.photoURL;
        avatar.style.display = 'block';
      }
    }
  });
}

// Выход
if (logoutBtn && auth) {
  logoutBtn.onclick = () => {
    auth.signOut().then(() => {
      localStorage.removeItem('profile');
      location.reload();
    }).catch(err => console.error('Logout error:', err));
  };
}


/* ===========================
   ИСТОРИЯ ЗАКАЗОВ (Firebase)
=========================== */
const historyModal = document.getElementById('historyModal');
const openHistory = document.getElementById('openHistory');
const openHistoryFooter = document.getElementById('openHistoryFooter');
const closeHistory = document.getElementById('closeHistory');
const historyList = document.getElementById('historyList');

function loadHistory() {
  if (!db || !historyList) return;

  historyList.innerHTML = '';

  db.collection('orders')
    .orderBy('timestamp', 'desc')
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const order = doc.data();

        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
          <div><b>Имя:</b> ${order.name || '-'}</div>
          <div><b>Телефон:</b> ${order.phone || '-'}</div>
          <div><b>Сумма:</b> ${order.total} BYN</div>
          <div><b>Дата:</b> ${order.timestamp ? order.timestamp.toDate().toLocaleString() : '-'}</div>
          <hr>
        `;
        historyList.appendChild(div);
      });
    })
    .catch(err => console.error('History load error:', err));
}

if (openHistory && historyModal) {
  openHistory.onclick = () => {
    loadHistory();
    historyModal.classList.add('modal--open');
  };
}

if (openHistoryFooter && historyModal) {
  openHistoryFooter.onclick = () => {
    loadHistory();
    historyModal.classList.add('modal--open');
  };
}

if (closeHistory && historyModal) {
  closeHistory.onclick = () => historyModal.classList.remove('modal--open');
}

if (historyModal) {
  historyModal.onclick = (e) => {
    if (e.target === historyModal) historyModal.classList.remove('modal--open');
  };
}


/* ===========================
   ОФОРМЛЕНИЕ ЗАКАЗА (Firebase)
=========================== */
const checkoutBtn = document.getElementById('checkoutBtn');

if (checkoutBtn) {
  checkoutBtn.onclick = () => {
    if (cart.length === 0) return;

    const nameVal = profileName ? profileName.value : '';
    const phoneVal = profilePhone ? profilePhone.value : '';

    const order = {
      items: cart.map(i => i.title),
      total: cart.reduce((a, b) => a + b.price, 0),
      name: nameVal,
      phone: phoneVal,
      timestamp: db ? firebase.firestore.FieldValue.serverTimestamp() : null
    };

    if (db) {
      db.collection('orders').add(order).then(() => {
        alert('Заказ оформлен!');
        cart = [];
        saveCart();
        updateCart();
      }).catch(err => console.error('Order save error:', err));
    } else {
      // fallback: только локально
      alert('Заказ оформлен (локально, без Firebase)!');
      cart = [];
      saveCart();
      updateCart();
    }
  };
}
