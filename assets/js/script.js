// ====== МОДАЛКА БРОНИРОВАНИЯ ======
const openBooking = document.getElementById("openBooking");
const openBookingHero = document.getElementById("openBookingHero");
const bookingModal = document.getElementById("bookingModal");
const closeBooking = document.getElementById("closeBooking");
const bookingForm = document.getElementById("booking-form");
const clearBooking = document.getElementById("clearBooking");

// Открытие модалки
if (openBooking) openBooking.addEventListener("click", () => bookingModal.style.display = "flex");
if (openBookingHero) openBookingHero.addEventListener("click", () => bookingModal.style.display = "flex");

// Закрытие модалки
if (closeBooking) closeBooking.addEventListener("click", () => bookingModal.style.display = "none");

// Очистка формы
if (clearBooking) clearBooking.addEventListener("click", () => bookingForm.reset());

// Отправка формы
if (bookingForm) {
  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const payload = {
      name: document.getElementById("name").value,
      phone: document.getElementById("phone").value,
      date: document.getElementById("date").value,
      time: document.getElementById("time").value,
      guests: document.getElementById("guests").value,
      comment: document.getElementById("comment").value
    };

    console.log("Заявка:", payload);
    alert("Заявка отправлена!");

    bookingForm.reset();
    bookingModal.style.display = "none";
  });
}


// ====== КОРЗИНА ======
const openCart = document.getElementById("openCart");
const closeCart = document.getElementById("closeCart");
const cartModal = document.getElementById("cartModal");

if (openCart) openCart.addEventListener("click", () => cartModal.style.display = "flex");
if (closeCart) closeCart.addEventListener("click", () => cartModal.style.display = "none");


// ====== ИСТОРИЯ ЗАКАЗОВ ======
const openHistory = document.getElementById("openHistory");
const closeHistory = document.getElementById("closeHistory");
const historyModal = document.getElementById("historyModal");

if (openHistory) openHistory.addEventListener("click", () => historyModal.style.display = "flex");
if (closeHistory) closeHistory.addEventListener("click", () => historyModal.style.display = "none");


// ====== БУРГЕР-МЕНЮ ======
const burgerBtn = document.getElementById("burgerBtn");
const mobileMenu = document.getElementById("mobileMenu");

if (burgerBtn) {
  burgerBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("active");
    burgerBtn.classList.toggle("active");
  });
}
// ====== ФИЛЬТРАЦИЯ МЕНЮ ======
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


// ====== КОРЗИНА ======
let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

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

  document.querySelectorAll(".remove-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = btn.dataset.index;
      cart.splice(i, 1);
      updateCart();
    });
  });
}

updateCart();


// ====== ДОБАВЛЕНИЕ В КОРЗИНУ ======
document.querySelectorAll(".menu-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".menu-item");
    const title = item.querySelector(".menu-title").textContent;
    const price = Number(item.querySelector(".menu-price").textContent);

    cart.push({ title, price });
    updateCart();
  });
});
