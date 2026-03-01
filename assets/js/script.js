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
