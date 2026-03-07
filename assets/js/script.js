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
      item.style.display =
        category === 'all' || item.dataset.category === category
          ? 'flex'
          : 'none';
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

/* ===== TOAST ===== */
function showToast(text) {
  const toast = document.getElementById('toast');
  toast.textContent = text;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 1500);
}

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

/* ===== ДОБАВЛЕНИЕ В КОРЗИНУ + TOAST ===== */
document.querySelectorAll('.menu-btn').forEach(btn => {
  btn.onclick = () => {
    const item = btn.closest('.menu-item');
    const title = item.querySelector('.menu-title').textContent;
    const price = Number(item.querySelector('.menu-price').textContent);

    cart.push({ title, price });
    saveCart();
    updateCart();

    showToast(`«${title}» добавлено в корзину`);
  };
});

openCart.onclick = () => cartModal.classList.add('modal--open');
closeCart.onclick = () => cartModal.classList.remove('modal--open');

cartModal.onclick = e => {
  if (e.target === cartModal) cartModal.classList.remove('modal--open');
};

updateCart();


/* ===========================
   FIREBASE
=========================== */
let db = null;
let auth = null;
let provider = null;

if (window.firebase) {
  db = firebase.firestore();
  auth = firebase.auth();
  provider = new firebase.auth.GoogleAuthProvider();
}


/* ===========================
   ПРОФИЛЬ
=========================== */
const profileName = document.getElementById('profileName');
const profilePhone = document.getElementById('profilePhone');
const saveProfile = document.getElementById('saveProfile');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const avatar = document.getElementById('profileAvatar');

let profile = JSON.parse(localStorage.getItem('profile') || '{}');

function loadProfile() {
  if (profile.name) profileName.value = profile.name;
  if (profile.phone) profilePhone.value = profile.phone;
}
loadProfile();

saveProfile.onclick = () => {
  profile = {
    name: profileName.value,
    phone: profilePhone.value
  };
  localStorage.setItem('profile', JSON.stringify(profile));
  alert('Профиль сохранён');
};

if (googleLoginBtn && auth) {
  googleLoginBtn.onclick = () => {
    auth.signInWithPopup(provider).then(result => {
      const user = result.user;

      if (user.displayName) {
        profileName.value = user.displayName;
        profile.name = user.displayName;
      }

      if (user.photoURL) {
        avatar.src = user.photoURL;
        avatar.style.display = 'block';
      }

      localStorage.setItem('profile', JSON.stringify(profile));
    });
  };
}

if (auth) {
  auth.onAuthStateChanged(user => {
    if (user) {
      logoutBtn.style.display = 'block';
      if (user.photoURL) {
        avatar.src = user.photoURL;
        avatar.style.display = 'block';
      }
    }
  });
}

logoutBtn.onclick = () => {
  auth.signOut().then(() => {
    localStorage.removeItem('profile');
    location.reload();
  });
};


/* ===========================
   БРОНИРОВАНИЕ
=========================== */
const bookingModal = document.getElementById('bookingModal');
const openBookingModal = document.getElementById('openBookingModal');
const openBookingHero = document.getElementById('openBookingHero');
const closeBooking = document.getElementById('closeBooking');
const bookingForm = document.getElementById('booking-form');
const guestsSelect = document.getElementById('guests');

function openBooking() {
  bookingModal.classList.add('modal--open');

  document.getElementById('name').value = profileName.value || "";
  document.getElementById('phone').value = profilePhone.value || "";
}

openBookingModal.onclick = openBooking;
openBookingHero.onclick = openBooking;
closeBooking.onclick = () => bookingModal.classList.remove('modal--open');

bookingModal.onclick = e => {
  if (e.target === bookingModal) bookingModal.classList.remove('modal--open');
};

bookingForm.onsubmit = e => {
  e.preventDefault();

  alert('Заявка отправлена! Мы свяжемся с вами.');
  bookingForm.reset();
  bookingModal.classList.remove('modal--open');
};


/* ===========================
   ИСТОРИЯ ЗАКАЗОВ
=========================== */
const historyModal = document.getElementById('historyModal');
const openHistory = document.getElementById('openHistory');
const openHistoryFooter = document.getElementById('openHistoryFooter');
const closeHistory = document.getElementById('closeHistory');
const historyList = document.getElementById('historyList');

function loadHistory() {
  if (!db) return;

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
  loadHistory();
  historyModal.classList.add('modal--open');
}

openHistory.onclick = openHistoryFn;
openHistoryFooter.onclick = openHistoryFn;
closeHistory.onclick = () => historyModal.classList.remove('modal--open');

historyModal.onclick = e => {
  if (e.target === historyModal) historyModal.classList.remove('modal--open');
};


/* ===========================
   ОФОРМЛЕНИЕ ЗАКАЗА
=========================== */
const checkoutBtn = document.getElementById('checkoutBtn');

checkoutBtn.onclick = () => {
  if (cart.length === 0) return;

  const order = {
    items: cart.map(i => i.title),
    total: cart.reduce((a, b) => a + b.price, 0),
    name: profileName.value,
    phone: profilePhone.value,
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
