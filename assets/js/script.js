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
  if (!toast) return;
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
  if (!cartItems || !cartTotal || !cartCount) return;

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
    if (!item) return;
    const titleEl = item.querySelector('.menu-title');
    const priceEl = item.querySelector('.menu-price');
    if (!titleEl || !priceEl) return;

    const title = titleEl.textContent.trim();
    const price = Number(priceEl.textContent.replace(/\D/g, "")) || 0;

    cart.push({ title, price });
    saveCart();
    updateCart();

    showToast(`«${title}» добавлено в корзину`);
  };
});

if (openCart && cartModal) {
  openCart.onclick = () => {
    cartModal.classList.add('modal--open');
    document.body.style.overflow = "hidden";
  };
}

if (closeCart && cartModal) {
  closeCart.onclick = () => {
    cartModal.classList.remove('modal--open');
    document.body.style.overflow = "";
  };
}

if (cartModal) {
  cartModal.onclick = e => {
    if (e.target === cartModal) {
      cartModal.classList.remove('modal--open');
      document.body.style.overflow = "";
    }
  };
}

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
  if (profile.name && profileName) profileName.value = profile.name;
  if (profile.phone && profilePhone) profilePhone.value = profile.phone;
}
loadProfile();

// Жёсткая валидация профиля
if (profileName) {
  profileName.addEventListener("input", () => {
    profileName.value = profileName.value
      .replace(/[^А-Яа-яЁё\s]/g, "")
      .slice(0, 20);
  });
}

if (profilePhone) {
  profilePhone.addEventListener("input", () => {
    let v = profilePhone.value.replace(/\D/g, "");

    if (v.startsWith("375")) {
      v = v.slice(0, 12);
      profilePhone.value =
        "+375 " +
        v.slice(3, 5) + " " +
        v.slice(5, 8) + " " +
        v.slice(8, 10) + " " +
        v.slice(10, 12);
      return;
    }

    if (v.startsWith("7")) {
      v = v.slice(0, 11);
      profilePhone.value =
        "+7 " +
        v.slice(1, 4) + " " +
        v.slice(4, 7) + " " +
        v.slice(7, 9) + " " +
        v.slice(9, 11);
      return;
    }

    profilePhone.value = v ? "+" + v : "";
  });
}

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

if (googleLoginBtn && auth) {
  googleLoginBtn.onclick = () => {
    auth.signInWithPopup(provider).then(result => {
      const user = result.user;

      if (user.displayName && profileName) {
        profileName.value = user.displayName;
        profile.name = user.displayName;
      }

      if (user.photoURL && avatar) {
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
      if (logoutBtn) logoutBtn.style.display = 'block';
      if (user.photoURL && avatar) {
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
   БРОНИРОВАНИЕ
=========================== */

const bookingModal = document.getElementById('bookingModal');
const openBookingModal = document.getElementById('openBookingModal');
const openBookingHero = document.getElementById('openBookingHero');
const closeBooking = document.getElementById('closeBooking');
const bookingForm = document.getElementById('booking-form');
const clearBooking = document.getElementById('clearBooking');

function applyValidation() {
  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");

  if (!nameInput || !phoneInput) return;

  nameInput.oninput = e => {
    e.target.value = e.target.value
      .replace(/[^А-Яа-яЁё ]/g, "")
      .replace(/\s{2,}/g, " ")
      .trimStart()
      .slice(0, 20);
  };

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

function openBooking() {
  if (!bookingModal) return;

  bookingModal.classList.add('modal--open');
  document.body.style.overflow = "hidden";

  const nameField = document.getElementById('name');
  const phoneField = document.getElementById('phone');

  if (nameField && profileName) {
    nameField.value = profileName.value || "";
  }
  if (phoneField && profilePhone) {
    phoneField.value = (profilePhone.value || "").replace(/\D/g, "");
  }

  applyValidation();
}

if (openBookingModal) openBookingModal.onclick = openBooking;
if (openBookingHero) openBookingHero.onclick = openBooking;

if (closeBooking && bookingModal) {
  closeBooking.onclick = () => {
    bookingModal.classList.remove('modal--open');
    document.body.style.overflow = "";
  };
}

if (bookingModal) {
  bookingModal.onclick = e => {
    if (e.target === bookingModal) {
      bookingModal.classList.remove('modal--open');
      document.body.style.overflow = "";
    }
  };
}

if (clearBooking && bookingForm) {
  clearBooking.onclick = () => {
    bookingForm.reset();
  };
}


/* ===========================
   ОТПРАВКА ЗАКАЗА + FIRESTORE + ОЧИСТКА КОРЗИНЫ
=========================== */

if (bookingForm) {
  bookingForm.onsubmit = async e => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const guests = document.getElementById("guests").value;
    const comment = document.getElementById("comment").value.trim();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    const userId = auth?.currentUser?.uid || "guest";

    const total = cart.reduce((sum, item) => sum + Number(item.price), 0);

    await db.collection("orders").add({
      userId,
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

    // Очищаем корзину
    cart = [];
    saveCart();
    updateCart();

    alert('Заявка отправлена! Мы свяжемся с вами.');

    bookingModal.classList.remove('modal--open');
    document.body.style.overflow = "";
    bookingForm.reset();
  };
}


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

    if (cartModal) {
      cartModal.classList.remove('modal--open');
      document.body.style.overflow = "";
    }

    openBooking();

    const commentField = document.getElementById('comment');

    if (commentField) {
      let orderText = "Заказ:\n";
      cart.forEach(item => {
        const priceNum = Number(item.price) || 0;
        orderText += `• ${item.title} — ${priceNum} BYN\n`;
      });

      commentField.value = orderText;
    }
  };
}


/* ===========================
   ИСТОРИЯ ЗАКАЗОВ (ПЕРСОНАЛЬНАЯ)
=========================== */
const historyModal = document.getElementById('historyModal');
const openHistory = document.getElementById('openHistory');
const openHistoryFooter = document.getElementById('openHistoryFooter');
const closeHistory = document.getElementById('closeHistory');
const historyList = document.getElementById('historyList');

function loadHistory() {
  if (!db || !historyList) return;

  historyList.innerHTML = '';

  const userId = auth?.currentUser?.uid || "guest";

  db.collection('orders')
    .where("userId", "==", userId)
    .orderBy('timestamp', 'desc')
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        historyList.innerHTML = "<p>Заказов пока нет.</p>";
        return;
      }

      snapshot.forEach(doc => {
        const order = doc.data();
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
          <div><b>Дата:</b> ${order.timestamp ? order.timestamp.toDate().toLocaleString() : '-'}</div>
          <div><b>Сумма:</b> ${order.total} BYN</div>
          <div><b>Имя:</b> ${order.name}</div>
          <div><b>Телефон:</b> ${order.phone}</div>
          <div><b>Гостей:</b> ${order.guests}</div>
          <div><b>Комментарий:</b> ${order.comment || '-'}</div>
          <div><b>Позиции:</b><br>${order.items.map(i => `• ${i.title} — ${i.price} BYN`).join("<br>")}</div>
          <hr>
        `;
        historyList.appendChild(div);
      });
    });
}

function openHistoryFn() {
  loadHistory();
  if (historyModal) {
    historyModal.classList.add('modal--open');
  }
}

if (openHistory) openHistory.onclick = openHistoryFn;
if (openHistoryFooter) openHistoryFooter.onclick = openHistoryFn;
if (closeHistory && historyModal) {
  closeHistory.onclick = () => historyModal.classList.remove('modal--open');
}

if (historyModal) {
  historyModal.onclick = e => {
    if (e.target === historyModal) historyModal.classList.remove('modal--open');
  };
}


/* ===========================
   ДАТА (ОГРАНИЧЕНИЯ)
=========================== */
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
    if (dateInput.value.length >= 5) {
      const year = dateInput.value.slice(0, 4);
      const rest = dateInput.value.slice(4);
      dateInput.value = year + rest;
    }

    if (dateInput.value < minDate) dateInput.value = minDate;
    if (dateInput.value > maxDate) dateInput.value = maxDate;
  });
});


/* ===========================
   ЖЁСТКАЯ ВАЛИДАЦИЯ ВРЕМЕНИ
=========================== */
document.addEventListener("DOMContentLoaded", () => {
  const timeInputs = document.querySelectorAll('input[type="time"]');
  if (!timeInputs.length) return;

  timeInputs.forEach(timeInput => {
    const fixTime = () => {
      let v = timeInput.value;

      if (!/^\d{1,2}:\d{1,2}$/.test(v)) return;

      let [h, m] = v.split(":").map(Number);

      if (h < 0) h = 0;
      if (h > 23) h = 23;

      if (m < 0) m = 0;
      if (m > 59) m = 59;

      timeInput.value =
        String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
    };

      timeInput.addEventListener("input", fixTime);
    timeInput.addEventListener("blur", fixTime);
    timeInput.addEventListener("change", fixTime);
  });
});