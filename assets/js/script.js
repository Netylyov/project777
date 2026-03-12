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
      const match =
        category === 'all' || item.dataset.category === category;

      item.style.display = match ? '' : 'none';
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

openCart.onclick = () => {
  cartModal.classList.add('modal--open');
  document.body.style.overflow = "hidden";
};

closeCart.onclick = () => {
  cartModal.classList.remove('modal--open');
  document.body.style.overflow = "";
};

cartModal.onclick = e => {
  if (e.target === cartModal) {
    cartModal.classList.remove('modal--open');
    document.body.style.overflow = "";
  }
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

function openBooking() {
  bookingModal.classList.add('modal--open');
  document.body.style.overflow = "hidden";

  document.getElementById('name').value = (profileName.value || "");
  document.getElementById('phone').value = (profilePhone.value || "").replace(/\D/g, "");

  applyValidation();
}

openBookingModal.onclick = openBooking;
if (openBookingHero) openBookingHero.onclick = openBooking;

closeBooking.onclick = () => {
  bookingModal.classList.remove('modal--open');
  document.body.style.overflow = "";
};

bookingModal.onclick = e => {
  if (e.target === bookingModal) {
    bookingModal.classList.remove('modal--open');
    document.body.style.overflow = "";
  }
};

bookingForm.onsubmit = e => {
  e.preventDefault();

  alert('Заявка отправлена! Мы свяжемся с вами.');

  bookingModal.classList.remove('modal--open');
  document.body.style.overflow = "";
  bookingForm.reset();
};


/* ===========================
   ОФОРМЛЕНИЕ ЗАКАЗА → БРОНИРОВАНИЕ
=========================== */

const checkoutBtn = document.getElementById('checkoutBtn');

if (checkoutBtn) {
  checkoutBtn.onclick = () => {
    if (cart.length === 0) {
      showToast("Корзина пуста");
      return;
    }

    cartModal.classList.remove('modal--open');
    document.body.style.overflow = "";

    openBooking();

    const commentField = document.getElementById('comment');

    let orderText = "Заказ:\n";
    cart.forEach(item => {
      orderText += `• ${item.title} — ${item.price} BYN\n`;
    });

    commentField.value = orderText;
  };
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

if (openHistory) openHistory.onclick = openHistoryFn;
if (openHistoryFooter) openHistoryFooter.onclick = openHistoryFn;
if (closeHistory) {
  closeHistory.onclick = () => historyModal.classList.remove('modal--open');
}

if (historyModal) {
  historyModal.onclick = e => {
    if (e.target === historyModal) historyModal.classList.remove('modal--open');
  };
}


/* ===========================
   ВАЛИДАЦИЯ И МАСКА ТЕЛЕФОНА
=========================== */

function applyValidation() {
  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");

  if (!nameInput || !phoneInput) return;

  /* === ВАЛИДАЦИЯ ИМЕНИ (русские буквы + пробелы) === */
  nameInput.oninput = e => {
    e.target.value = e.target.value
      .replace(/[^А-Яа-яЁё ]/g, "")
      .replace(/\s{2,}/g, " ")
      .trimStart()
      .slice(0, 20);
  };

  /* === МАСКА ТЕЛЕФОНА (BY +375, RU +7) === */
  phoneInput.oninput = e => {
    let value = e.target.value.replace(/\D/g, "");

    if (value === "3" || value === "37") {
      e.target.value = value;
      return;
    }

    if (value.startsWith("375")) {
      const p1 = value.slice(3, 5);
      const p2 = value.slice(5, 8);
      const p3 = value.slice(8, 10);
      const p4 = value.slice(10, 12);

      e.target.value =
        "+375" +
        (p1 ? " " + p1 : "") +
        (p2 ? " " + p2 : "") +
        (p3 ? " " + p3 : "") +
        (p4 ? " " + p4 : "");

      return;
    }

    if (value.startsWith("7")) {
      const p1 = value.slice(1, 4);
      const p2 = value.slice(4, 7);
      const p3 = value.slice(7, 9);
      const p4 = value.slice(9, 11);

      e.target.value =
        "+7" +
        (p1 ? " " + p1 : "") +
        (p2 ? " " + p2 : "") +
        (p3 ? " " + p3 : "") +
        (p4 ? " " + p4 : "");

      return;
    }

    if (value !== "") {
      e.target.value = "";
    }
  };
}
document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("date");
  if (!dateInput) return;

  const today = new Date();

  const format = d => d.toISOString().split("T")[0];

  const minDate = format(today);

  const maxDateObj = new Date(today);
  maxDateObj.setMonth(maxDateObj.getMonth() + 1);
  const maxDate = format(maxDateObj);

  dateInput.min = minDate;
  dateInput.max = maxDate;

  dateInput.addEventListener("input", () => {
    // Ограничение длины года (YYYY-MM-DD → первые 4 цифры — год)
    if (dateInput.value.length >= 5) {
      const year = dateInput.value.slice(0, 4);
      const rest = dateInput.value.slice(4);
      dateInput.value = year + rest;
    }

    // Исправление выхода за диапазон
    if (dateInput.value < minDate) dateInput.value = minDate;
    if (dateInput.value > maxDate) dateInput.value = maxDate;
  });
});
