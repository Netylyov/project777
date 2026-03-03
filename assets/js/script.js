// =========================
// БУРГЕР-МЕНЮ
// =========================
const burgerBtn = document.getElementById("burgerBtn");
const mobileMenu = document.getElementById("mobileMenu");

if (burgerBtn && mobileMenu) {
  burgerBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("active");
    burgerBtn.classList.toggle("active");
  });

  mobileMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("active");
      burgerBtn.classList.remove("active");
    });
  });
}



// =========================
// МОДАЛКА БРОНИРОВАНИЯ
// =========================
const openBooking = document.getElementById("openBooking");
const openBookingHero = document.getElementById("openBookingHero");
const bookingModal = document.getElementById("bookingModal");
const closeBooking = document.getElementById("closeBooking");
const bookingForm = document.getElementById("booking-form");
const clearBooking = document.getElementById("clearBooking");

function openBookingModal() {
  bookingModal.style.display = "flex";
}

function closeBookingModal() {
  bookingModal.style.display = "none";
}

if (openBooking) openBooking.addEventListener("click", openBookingModal);
if (openBookingHero) openBookingHero.addEventListener("click", openBookingModal);
if (closeBooking) closeBooking.addEventListener("click", closeBookingModal);

if (bookingModal) {
  bookingModal.addEventListener("click", (e) => {
    if (e.target === bookingModal) closeBookingModal();
  });
}

if (clearBooking && bookingForm) {
  clearBooking.addEventListener("click", () => bookingForm.reset());
}

if (bookingForm) {
  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const payload = {
      name: document.getElementById("name").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      date: document.getElementById("date").value,
      time: document.getElementById("time").value,
      guests: document.getElementById("guests").value,
      comment: document.getElementById("comment").value.trim()
    };

    console.log("Заявка:", payload);
    alert("Заявка отправлена!");

    bookingForm.reset();
    closeBookingModal();
  });
}



// =========================
// ФИЛЬТРАЦИЯ МЕНЮ
// =========================
const filterButtons = document.querySelectorAll(".menu-categories button");
const menuItems = document.querySelectorAll(".menu-item");

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const category = btn.dataset.filter;

    menuItems.forEach(item => {
      if (category === "all" || item.dataset.category === category) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
  });
});



// =========================
// КОРЗИНА
// =========================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const openCart = document.getElementById("openCart");
const closeCart = document.getElementById("closeCart");
const cartModal = document.getElementById("cartModal");
const checkoutBtn = document.getElementById("checkoutBtn");

function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.background = "#000";
  toast.style.color = "#f7c325";
  toast.style.padding = "10px 16px";
  toast.style.borderRadius = "8px";
  toast.style.boxShadow = "0 4px 10px rgba(0,0,0,0.4)";
  toast.style.zIndex = "9999";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.2s ease";

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 200);
  }, 1500);
}

function updateCart() {
  cartCount.textContent = cart.length;
  localStorage.setItem("cart", JSON.stringify(cart));

  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div>${item.title} — ${item.price} BYN</div>
      <button data-index="${index}" class="remove-item">Удалить</button>
    `;
    cartItems.appendChild(div);
  });

  cartTotal.textContent = total;

  cartItems.querySelectorAll(".remove-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.index);
      cart.splice(i, 1);
      updateCart();
    });
  });
}

updateCart();

document.querySelectorAll(".menu-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".menu-item");
    const title = item.querySelector(".menu-title").textContent.trim();
    const price = Number(item.querySelector(".menu-price").textContent.trim());

    cart.push({ title, price });
    updateCart();
    showToast(`«${title}» добавлено в корзину`);
  });
});

if (openCart) openCart.addEventListener("click", () => cartModal.style.display = "flex");
if (closeCart) closeCart.addEventListener("click", () => cartModal.style.display = "none");

if (cartModal) {
  cartModal.addEventListener("click", (e) => {
    if (e.target === cartModal) cartModal.style.display = "none";
  });
}

if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    if (!cart.length) {
      alert("Корзина пуста");
      return;
    }

    alert("Заказ оформлен! Спасибо ❤️");

    cart = [];
    updateCart();
    cartModal.style.display = "none";
  });
}



// =========================
// ИСТОРИЯ ЗАКАЗОВ (заглушка)
// =========================
const openHistory = document.getElementById("openHistory");
const closeHistory = document.getElementById("closeHistory");
const historyModal = document.getElementById("historyModal");

if (openHistory) openHistory.addEventListener("click", () => historyModal.style.display = "flex");
if (closeHistory) closeHistory.addEventListener("click", () => historyModal.style.display = "none");

if (historyModal) {
  historyModal.addEventListener("click", (e) => {
    if (e.target === historyModal) historyModal.style.display = "none";
  });
}



// =========================
// ПРОФИЛЬ + ВАЛИДАЦИЯ ТЕЛЕФОНА
// =========================
const profileName = document.getElementById("profileName");
const profilePhone = document.getElementById("profilePhone");
const saveProfile = document.getElementById("saveProfile");

function isValidPhone(phone) {
  const cleaned = phone.replace(/\s|-/g, "");
  return /^\+375\d{9}$/.test(cleaned);
}

if (saveProfile) {
  saveProfile.addEventListener("click", () => {
    const name = profileName.value.trim();
    const phone = profilePhone.value.trim();

    if (!name) {
      alert("Введите имя");
      return;
    }

    if (!isValidPhone(phone)) {
      alert("Введите телефон в формате +375XXXXXXXXX");
      return;
    }

    localStorage.setItem("profileName", name);
    localStorage.setItem("profilePhone", phone);

    alert("Профиль сохранён");
  });
}
