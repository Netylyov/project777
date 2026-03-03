window.addEventListener("DOMContentLoaded", () => {
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

  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");
  const guestsSelect = document.getElementById("guests");
  const commentInput = document.getElementById("comment");

  function openBookingModal() {
    if (!bookingModal) return;
    bookingModal.style.display = "flex";
  }

  function closeBookingModal() {
    if (!bookingModal) return;
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
        name: nameInput ? nameInput.value.trim() : "",
        phone: phoneInput ? phoneInput.value.trim() : "",
        date: dateInput ? dateInput.value : "",
        time: timeInput ? timeInput.value : "",
        guests: guestsSelect ? guestsSelect.value : "",
        comment: commentInput ? commentInput.value.trim() : ""
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

  // =========================
  // КОРЗИНА
  // =========================
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
  } catch {
    cart = [];
  }

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
    if (!cartCount || !cartItems || !cartTotal) return;

    cartCount.textContent = String(cart.length);
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch {}

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

    cartTotal.textContent = String(total);

    cartItems.querySelectorAll(".remove-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.index);
        if (Number.isNaN(i)) return;
        cart.splice(i, 1);
        updateCart();
      });
    });
  }

  updateCart();

  document.querySelectorAll(".menu-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".menu-item");
      if (!item) return;

      const titleEl = item.querySelector(".menu-title");
      const priceEl = item.querySelector(".menu-price");
      if (!titleEl || !priceEl) return;

      const title = titleEl.textContent.trim();
      const price = Number(priceEl.textContent.trim());
      if (!title || Number.isNaN(price)) return;

      cart.push({ title, price });
      updateCart();
      showToast(`«${title}» добавлено в корзину`);
    });
  });

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

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (!cart.length) {
        alert("Корзина пуста");
        return;
      }

      alert("Заказ оформлен! Спасибо ❤️");

      cart = [];
      updateCart();
      if (cartModal) cartModal.style.display = "none";
    });
  }

  // =========================
  // ИСТОРИЯ ЗАКАЗОВ (заглушка)
  // =========================
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

  if (saveProfile && profileName && profilePhone) {
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

      try {
        localStorage.setItem("profileName", name);
        localStorage.setItem("profilePhone", phone);
      } catch {}

      alert("Профиль сохранён");
    });
  }
});
