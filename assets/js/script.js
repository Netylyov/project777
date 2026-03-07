/* ===========================
   БУРГЕР-МЕНЮ
=========================== */
const burgerBtn = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (burgerBtn && mobileMenu) {
  burgerBtn.onclick = () => mobileMenu.classList.toggle('open');
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
  if (!cartItems) return;

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

  if (cartTotal) cartTotal.textContent = total;
  if (cartCount) cartCount.textContent = cart.length;

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

    const title = item.querySelector('.menu-title').textContent;
    const price = Number(item.querySelector('.menu-price').textContent);

    cart.push({ title, price });
    saveCart();
    updateCart();
  };
});

function openCartFn() {
  if (cartModal) cartModal.classList.add('modal--open');
}

function closeCartFn() {
  if (cartModal) cartModal.classList.remove('modal--open');
}

if (openCart) openCart.onclick = openCartFn;
if (closeCart) closeCart.onclick = closeCartFn;

if (cartModal) {
  cartModal.onclick = (e) => {
    if (e.target === cartModal) closeCartFn();
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
    console.error("Firebase init error:", e);
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

if (saveProfile) {
  saveProfile.onclick = () => {
    profile = {
      name: profileName ? profileName.value : "",
      phone: profilePhone ? profilePhone.value : ""
    };
    localStorage.setItem('profile', JSON.stringify(profile));
    alert('Профиль сохранён');
  };
}

if (googleLoginBtn && auth && provider) {
  googleLoginBtn.onclick = () => {
    auth.signInWithPopup(provider)
      .then(result => {
        const user = result.user;

        if (user.displayName && profileName) {
          profileName.value = user.displayName;
          profile.name = user.displayName;
        }

        if (avatar && user.photoURL) {
          avatar.src = user.photoURL;
          avatar.style.display = 'block';
        }

        localStorage.setItem('profile', JSON.stringify(profile));
      })
      .catch(err => console.error("Google login error:", err));
  };
}

if (auth) {
  auth.onAuthStateChanged(user => {
    if (user && logoutBtn) {
      logoutBtn.style.display = 'block';
      if (avatar && user.photoURL) {
        avatar.src = user.photoURL;
        avatar.style.display = 'block';
      }
    }
  });
}

if (logoutBtn && auth) {
  logoutBtn.onclick = () => {
    auth.signOut().then(() => {
      localStorage.removeItem('profile');
      location.reload();
    });
  };
}


/* ===========================
   МОДАЛКА БРОНИРОВАНИЯ (ПРЕМИУМ)
=========================== */
const bookingModal = document.getElementById('bookingModal');
const openBookingModal = document.getElementById('openBookingModal');
const openBookingHero = document.getElementById('openBookingHero');
const closeBooking = document.getElementById('closeBooking');
const bookingForm = document.getElementById('booking-form');
const guestsSelect = document.getElementById('guests');

function openBooking() {
  if (bookingModal) bookingModal.classList.add('modal--open');

  const nameField = document.getElementById('name');
  const phoneField = document.getElementById('phone');

  if (profileName && nameField) {
    nameField.value = profileName.value || "";
  }
  if (profilePhone && phoneField) {
    phoneField.value = profilePhone.value || "";
  }
}

function closeBookingFn() {
  if (bookingModal) bookingModal.classList.remove('modal--open');
}

if (openBookingModal) openBookingModal.onclick = openBooking;
if (openBookingHero) openBookingHero.onclick = openBooking;
if (closeBooking) closeBooking.onclick = closeBookingFn;

if (bookingModal) {
  bookingModal.onclick = (e) => {
    if (e.target === bookingModal) closeBookingFn();
  };
}

if (bookingForm) {
  bookingForm.onsubmit = (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const guests = guestsSelect ? guestsSelect.value : "";
    const comment = document.getElementById('comment').value.trim();

    if (!name || !phone || !date || !time || !guests) {
      alert('Пожалуйста, заполните все обязательные поля.');
      return;
    }

    console.log('Бронь:', { name, phone, date, time, guests, comment });

    alert('Заявка на бронирование отправлена. Мы свяжемся с вами для подтверждения.');
    bookingForm.reset();
    closeBookingFn();
  };
}

const clearBookingBtn = document.getElementById('clearBooking');
if (clearBookingBtn && bookingForm) {
  clearBookingBtn.onclick = () => bookingForm.reset();
}


/* ===========================
   ИСТОРИЯ ЗАКАЗОВ
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
          <div><b>Имя:</b> ${order.name}</div>
          <div><b>Телефон:</b> ${order.phone}</div>
          <div><b>Сумма:</b> ${order.total} BYN</div>
          <div><b>Дата:</b> ${order.timestamp ? order.timestamp.toDate().toLocaleString() : '-'}</div>
          <hr>
        `;
        historyList.appendChild(div);
      });
    });
}

function openHistoryFn() {
  if (historyModal) {
    loadHistory();
    historyModal.classList.add('modal--open');
  }
}

function closeHistoryFn() {
  if (historyModal) historyModal.classList.remove('modal--open');
}

if (openHistory) openHistory.onclick = openHistoryFn;
if (openHistoryFooter) openHistoryFooter.onclick = openHistoryFn;
if (closeHistory) closeHistory.onclick = closeHistoryFn;

if (historyModal) {
  historyModal.onclick = (e) => {
    if (e.target === historyModal) closeHistoryFn();
  };
}


/* ===========================
   ОФОРМЛЕНИЕ ЗАКАЗА
=========================== */
const checkoutBtn = document.getElementById('checkoutBtn');

if (checkoutBtn) {
  checkoutBtn.onclick = () => {
    if (cart.length === 0) return;

    const order = {
      items: cart.map(i => i.title),
      total: cart.reduce((a, b) => a + b.price, 0),
      name: profileName ? profileName.value : "",
      phone: profilePhone ? profilePhone.value : "",
      timestamp: db ? firebase.firestore.FieldValue.serverTimestamp() : null
    };

    if (db) {
      db.collection('orders').add(order).then(() => {
        alert('Заказ оформлен!');
        cart = [];
        saveCart();
        updateCart();
      });
    } else {
      alert('Заказ оформлен (локально)');
      cart = [];
      saveCart();
      updateCart();
    }
  };
}
