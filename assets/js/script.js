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
  bookingModal.classList.add('modal--open');
}

if (openBookingModal) openBookingModal.onclick = openBooking;
if (openBookingHero) openBookingHero.onclick = openBooking;

if (closeBooking) {
  closeBooking.onclick = () => bookingModal.classList.remove('modal--open');
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
    const title = item.querySelector('.menu-title').textContent;
    const price = Number(item.querySelector('.menu-price').textContent);

    cart.push({ title, price });
    saveCart();
    updateCart();
  };
});

if (openCart) openCart.onclick = () => cartModal.classList.add('modal--open');
if (closeCart) closeCart.onclick = () => cartModal.classList.remove('modal--open');

if (cartModal) {
  cartModal.onclick = (e) => {
    if (e.target === cartModal) cartModal.classList.remove('modal--open');
  };
}

updateCart();


/* ===========================
   ИСТОРИЯ ЗАКАЗОВ
=========================== */
let history = JSON.parse(localStorage.getItem('history') || '[]');

const historyModal = document.getElementById('historyModal');
const openHistory = document.getElementById('openHistory');
const openHistoryFooter = document.getElementById('openHistoryFooter');
const closeHistory = document.getElementById('closeHistory');
const historyList = document.getElementById('historyList');

function updateHistory() {
  historyList.innerHTML = '';

  history.forEach(order => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <div>${order.date}</div>
      <div>${order.items.join(', ')}</div>
      <div>${order.total} BYN</div>
    `;
    historyList.appendChild(div);
  });
}

if (openHistory) openHistory.onclick = () => historyModal.classList.add('modal--open');
if (openHistoryFooter) openHistoryFooter.onclick = () => historyModal.classList.add('modal--open');
if (closeHistory) closeHistory.onclick = () => historyModal.classList.remove('modal--open');

if (historyModal) {
  historyModal.onclick = (e) => {
    if (e.target === historyModal) historyModal.classList.remove('modal--open');
  };
}

updateHistory();


/* ===========================
   ОФОРМЛЕНИЕ ЗАКАЗА
=========================== */
const checkoutBtn = document.getElementById('checkoutBtn');

if (checkoutBtn) {
  checkoutBtn.onclick = () => {
    if (cart.length === 0) return;

    const order = {
      date: new Date().toLocaleString(),
      items: cart.map(i => i.title),
      total: cart.reduce((a, b) => a + b.price, 0)
    };

    history.push(order);
    localStorage.setItem('history', JSON.stringify(history));

    cart = [];
    saveCart();
    updateCart();

    alert('Заказ оформлен!');
  };
}


/* ===========================
   ПРОФИЛЬ
=========================== */
const profileName = document.getElementById('profileName');
const profilePhone = document.getElementById('profilePhone');
const saveProfile = document.getElementById('saveProfile');

let profile = JSON.parse(localStorage.getItem('profile') || '{}');

function loadProfile() {
  if (profile.name) profileName.value = profile.name;
  if (profile.phone) profilePhone.value = profile.phone;
}

if (saveProfile) {
  saveProfile.onclick = () => {
    profile = {
      name: profileName.value,
      phone: profilePhone.value
    };
    localStorage.setItem('profile', JSON.stringify(profile));
    alert('Профиль сохранён');
  };
}

loadProfile();
