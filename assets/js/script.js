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
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1500);
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCart() {
  cartItems.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    total += Number(item.price);

    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `
      <span>${item.title}</span>
      <span>${item.price} BYN</span>
      <button class="remove-item" data-index="${index}">✕</button>
    `;
    cartItems.appendChild(row);
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

openCart.onclick = () => {
  cartModal.classList.add('modal--open');
  document.body.style.overflow = "hidden";
};

closeCart.onclick = () => {
  cartModal.classList.remove('modal--open');
  document.body.style.overflow = "";
};

updateCart();


/* ===========================
   FIREBASE
=========================== */
let db = firebase.firestore();
let auth = firebase.auth();
let provider = new firebase.auth.GoogleAuthProvider();
let currentUserId = "guest";


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
  showToast("Профиль сохранён");
};

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

auth.onAuthStateChanged(user => {
  if (user) {
    currentUserId = user.uid;
    logoutBtn.style.display = 'block';
  } else {
    currentUserId = "guest";
  }
});

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
const clearBooking = document.getElementById('clearBooking');

function openBooking() {
  bookingModal.classList.add('modal--open');
  document.body.style.overflow = "hidden";

  document.getElementById('name').value = profile.name || "";
  document.getElementById('phone').value = profile.phone || "";
}

openBookingModal.onclick = openBooking;
openBookingHero.onclick = openBooking;

closeBooking.onclick = () => {
  bookingModal.classList.remove('modal--open');
  document.body.style.overflow = "";
};

clearBooking.onclick = () => bookingForm.reset();


/* ===========================
   ОТПРАВКА ЗАЯВКИ
=========================== */
bookingForm.addEventListener("submit", async e => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const guests = document.getElementById("guests").value;
  const comment = document.getElementById("comment").value.trim();
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  if (!name || !phone || !date || !time) {
    showToast("Заполните обязательные поля");
    return;
  }

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

  cart = [];
  saveCart();
  updateCart();

  showToast("Заявка отправлена!");

  bookingModal.classList.remove("modal--open");
  document.body.style.overflow = "";
  bookingForm.reset();
});


/* ===========================
   ОФОРМЛЕНИЕ ЗАКАЗА → БРОНИРОВАНИЕ
=========================== */
document.getElementById('checkoutBtn').onclick = () => {
  if (cart.length === 0) {
    showToast("Корзина пуста");
    return;
  }

  cartModal.classList.remove('modal--open');
  document.body.style.overflow = "";

  openBooking();

  const commentField = document.getElementById('comment');
  commentField.value = "Заказ:\n" + cart.map(i => `• ${i.title} — ${i.price} BYN`).join("\n");
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
  historyList.innerHTML = "Загрузка...";

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

openHistory.onclick = () => {
  loadHistory();
  historyModal.classList.add("modal--open");
};

openHistoryFooter.onclick = () => {
  loadHistory();
  historyModal.classList.add("modal--open");
};

closeHistory.onclick = () => {
  historyModal.classList.remove("modal--open");
};
