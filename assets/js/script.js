// ===== БУРГЕР-МЕНЮ =====
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

// ===== МОДАЛКА БРОНИРОВАНИЯ =====
const openBooking = document.getElementById("openBooking");
const openBookingHero = document.getElementById("openBookingHero");
const bookingModal = document.getElementById("bookingModal");
const closeBooking = document.getElementById("closeBooking");
const bookingForm = document.getElementById("booking-form");
const clearBooking = document.getElementById("clearBooking");

if (bookingModal) {
  const openBookingModal = () => {
    bookingModal.style.display = "flex";
  };
  const closeBookingModal = () => {
    bookingModal.style.display = "none";
  };

  if (openBooking) openBooking.addEventListener("click", openBookingModal);
  if (openBookingHero) openBookingHero.addEventListener("click", openBookingModal);
  if (closeBooking) closeBooking.addEventListener("click", closeBookingModal);

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

    console.log("Заявка на бронь:", payload);
    alert("Заявка отправлена!");

    bookingForm.reset();
    if (bookingModal) bookingModal.style.display = "none";
  });
}

// ===== ФИЛЬТРАЦИЯ МЕНЮ =====
const filterButtons = document.querySelectorAll(".menu-categories button");
const menuItems = document.querySelectorAll(".menu-item");

if (filterButtons.length && menuItems.length) {
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
}

// ===== КОРЗИНА =====
let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const openCart = document.getElementById("openCart");
const closeCart = document.getElementById("closeCart");
const cartModal = document.getElementById("cartModal");

function updateCart() {
  if (!cartCount || !cartItems || !cartTotal) return;

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

if (openCart && cartModal) {
  openCart.addEventListener("click", () => {
    cartModal.style.display = "flex";
  });
}

if (closeCart && cartModal) {
  closeCart.addEventListener("click", () => {
    cartModal.style.display = "none";
  });

  cartModal.addEventListener("click", (e) => {
    if (e.target === cartModal) cartModal.style.display = "none";
  });
}

document.querySelectorAll(".menu-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".menu-item");
    if (!item) return;

    const titleEl = item.querySelector(".menu-title");
    const priceEl = item.querySelector(".menu-price");

    if (!titleEl || !priceEl) return;

    const title = titleEl.textContent.trim();
    const price = Number(priceEl.textContent.trim());

    if (!title || isNaN(price)) return;

    cart.push({ title, price });
    updateCart();
  });
});

// ===== ИСТОРИЯ ЗАКАЗОВ (заглушка) =====
const openHistory = document.getElementById("openHistory");
const closeHistory = document.getElementById("closeHistory");
const historyModal = document.getElementById("historyModal");

if (openHistory && historyModal) {
  openHistory.addEventListener("click", () => {
    historyModal.style.display = "flex";
  });
}

if (closeHistory && historyModal) {
  closeHistory.addEventListener("click", () => {
    historyModal.style.display = "none";
  });

  historyModal.addEventListener("click", (e) => {
    if (e.target === historyModal) historyModal.style.display = "none";
  });
}
