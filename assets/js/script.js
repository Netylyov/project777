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
      const match = category === 'all' || item.dataset.category === category;
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
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1500);
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCart() {
  if (!cartItems) return;

  cartItems.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    const priceNum = Number(item.price) || 0;
    total += priceNum;

    const div = document.createElement('div');
    div.className = 'cart-row';
    div.innerHTML = `
      <span>${item.title}</span>
      <span>${priceNum} BYN</span>
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
    const title = item.querySelector('.menu-title').textContent.trim();
    const price = Number(item.querySelector('.menu-price').textContent.replace(/\D/g, ""));

    cart.push({ title, price });
    saveCart();
    updateCart();
    showToast(`«${title}» добавлено в корзину`);
  };
});

if (openCart) openCart.onclick = () => {
  cartModal.classList.add('modal--open');
  document.body.style.overflow = "hidden";
};

if (closeCart) closeCart.onclick = () => {
  cartModal.classList.remove('modal--open');
  document.body.style.overflow = "";
};

updateCart();


/* ===========================
   FIREBASE
=========================== */
let db = null;
let auth = null;
let provider = null;
let currentUserId = "guest";

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

if (saveProfile) {
  saveProfile.onclick = () => {
    profile = {
      name: profileName.value,
      phone: profilePhone.value
    };
    localStorage.setItem('profile', JSON.stringify(profile));
    showToast("Профиль сохранён");
  };
}

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
      currentUserId = user.uid;
      if (logoutBtn) logoutBtn.style.display = 'block';
      if (user.photoURL) {
        avatar.src = user.photoURL;
        avatar.style.display = 'block';
      }
    } else {
      currentUserId = "guest";
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

  const nameField = bookingModal.querySelector('#name');
  const phoneField = bookingModal.querySelector('#phone');

  if (profile.name) nameField.value = profile.name;
  if (profile.phone) phoneField.value = profile.phone;
}

if (openBookingModal) openBookingModal.onclick = openBooking;
if (openBookingHero) openBookingHero.onclick = openBooking;

if (closeBooking) closeBooking.onclick = () => {
  bookingModal.classList.remove('modal--open');
  document.body.style.overflow = "";
};


/* ===========================
   ФИНАЛЬНЫЙ РАБОЧИЙ SUBMIT
=========================== */

(function () {
  const modal = bookingModal;
  const form = bookingForm;
  if (!modal || !form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();

    const name = modal.querySelector("#name").value.trim();
    const phone = modal.querySelector("#phone").value.trim();
    const date = modal.querySelector("#date").value;
    const time = modal.querySelector("#time").value;
    const guests = modal.querySelector("#guests").value;
    const comment = modal.querySelector("#comment").value.trim();

    if (!name || !phone || !date || !time) {
      showToast("Заполните обязательные поля");
      return;
    }

    let saved = false;

    try {
      if (db) {
        const total = cart.reduce((s, i) => s + Number(i.price), 0);

        await db.collection("orders").add({
          userId: currentUserId,
          name,
          phone,
          guests,
          comment,
          date,
          time,
          total,
          items: cart,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        saved = true;
      }
    } catch (err) {
      console.warn("Ошибка Firestore:", err);
    }

    cart = [];
    saveCart();
    updateCart();

    showToast(saved ? "Заявка отправлена!" : "Заявка отправлена (без БД)");

    bookingModal.classList.remove("modal--open");
    document.body.style.overflow = "";
    form.reset();
  };
})();


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

  historyList.innerHTML = "<p>Загрузка...</p>";

  db.collection("orders")
    .where("userId", "==", currentUserId)
    .orderBy("timestamp", "desc")
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        historyList.innerHTML = "<p>Заказов пока нет.</p>";
        return;
      }

      historyList.innerHTML = "";

      snapshot.forEach(doc => {
        const o = doc.data();
        const div = document.createElement("div");
        div.className = "history-item";
        div.innerHTML = `
          <div><b>Дата:</b> ${o.timestamp ? o.timestamp.toDate().toLocaleString() : "-"}</div>
          <div><b>Сумма:</b> ${o.total} BYN</div>
          <div><b>Имя:</b> ${o.name}</div>
          <div><b>Телефон:</b> ${o.phone}</div>
          <div><b>Гостей:</b> ${o.guests}</div>
          <div><b>Комментарий:</b> ${o.comment || "-"}</div>
          <div><b>Позиции:</b><br>${o.items.map(i => `• ${i.title} — ${i.price} BYN`).join("<br>")}</div>
          <hr>
        `;
        historyList.appendChild(div);
      });
    });
}

function openHistoryFn() {
  loadHistory();
  historyModal.classList.add("modal--open");
}

if (openHistory) openHistory.onclick = openHistoryFn;
if (openHistoryFooter) openHistoryFooter.onclick = openHistoryFn;
if (closeHistory) closeHistory.onclick = () => historyModal.classList.remove("modal--open");


/* ===========================
   ОГРАНИЧЕНИЕ ДАТЫ
=========================== */

(function () {
  const dateInput = document.getElementById("date");
  if (!dateInput) return;

  const today = new Date();
  const min = today.toISOString().split("T")[0];

  const maxDate = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + 1);
  const max = maxDate.toISOString().split("T")[0];

  dateInput.min = min;
  dateInput.max = max;
})();
