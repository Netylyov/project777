/* ============================
   ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
============================ */

let cartItems = [];
let currentOrderItems = [];

/* ============================
   МОБИЛЬНОЕ МЕНЮ
============================ */

const burgerBtn = document.getElementById("burgerBtn");
const mobileMenu = document.getElementById("mobileMenu");

if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener("click", () => {
        mobileMenu.classList.toggle("open");
    });

    mobileMenu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => mobileMenu.classList.remove("open"));
    });
}

/* ============================
   ФИЛЬТР МЕНЮ
============================ */

document.querySelectorAll(".menu-categories button").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".menu-categories button.active")?.classList.remove("active");
        btn.classList.add("active");

        const filter = btn.dataset.filter;
        document.querySelectorAll(".menu-item").forEach(item => {
            item.style.display = (filter === "all" || item.dataset.category === filter) ? "block" : "none";
        });
    });
});

/* ============================
   КОРЗИНА
============================ */

const openCart = document.getElementById("openCart");
const cartModal = document.getElementById("cartModal");
const closeCart = document.getElementById("closeCart");
const cartCount = document.getElementById("cartCount");
const cartItemsContainer = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");

function updateCartUI() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

    cartItems.forEach((item, index) => {
        total += item.price * item.qty;

        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <div class="cart-item-main">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-controls">
                    <button class="qty-btn" data-index="${index}" data-action="minus">−</button>
                    <div class="qty-value">${item.qty}</div>
                    <button class="qty-btn" data-index="${index}" data-action="plus">+</button>
                </div>
            </div>
            <div class="cart-item-right">
                <div class="cart-item-price">${item.price * item.qty} BYN</div>
                <button class="cart-remove" data-index="${index}">Удалить</button>
            </div>
        `;
        cartItemsContainer.appendChild(div);
    });

    cartTotal.textContent = total;
    cartCount.textContent = cartItems.reduce((s, i) => s + i.qty, 0);
}

document.querySelectorAll(".menu-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const item = btn.closest(".menu-item");
        const title = item.querySelector(".menu-title").textContent;
        const price = Number(item.querySelector(".menu-price").textContent);

        const existing = cartItems.find(i => i.title === title);
        if (existing) existing.qty++;
        else cartItems.push({ title, price, qty: 1 });

        updateCartUI();
    });
});

openCart.addEventListener("click", () => {
    cartModal.style.display = "flex";
});

closeCart.addEventListener("click", () => {
    cartModal.style.display = "none";
});

cartItemsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("qty-btn")) {
        const index = e.target.dataset.index;
        const action = e.target.dataset.action;

        if (action === "plus") cartItems[index].qty++;
        if (action === "minus" && cartItems[index].qty > 1) cartItems[index].qty--;

        updateCartUI();
    }

    if (e.target.classList.contains("cart-remove")) {
        const index = e.target.dataset.index;
        cartItems.splice(index, 1);
        updateCartUI();
    }
});

/* ============================
   ОТКРЫТИЕ МОДАЛКИ БРОНИ
============================ */

const bookingModal = document.getElementById("bookingModal");
const openBookingHero = document.getElementById("openBookingHero");
const closeBooking = document.getElementById("closeBooking");

function openBookingForm() {
    bookingModal.style.display = "flex";

    const profile = JSON.parse(localStorage.getItem("profile") || "{}");
    if (profile.name) document.getElementById("name").value = profile.name;
    if (profile.phone) document.getElementById("phone").value = profile.phone;
}

openBookingHero?.addEventListener("click", openBookingForm);
closeBooking?.addEventListener("click", () => bookingModal.style.display = "none");

/* ============================
   СТАТИЧНАЯ ФОРМА (РАСКРЫТИЕ)
============================ */

const openStaticBooking = document.getElementById("openStaticBooking");
const staticBookingWrapper = document.getElementById("staticBookingWrapper");

openStaticBooking.addEventListener("click", () => {
    staticBookingWrapper.style.display =
        staticBookingWrapper.style.display === "block" ? "none" : "block";
});

/* ============================
   ПРОФИЛЬ
============================ */

const saveProfile = document.getElementById("saveProfile");

saveProfile.addEventListener("click", () => {
    const name = document.getElementById("profileName").value.trim();
    const phone = document.getElementById("profilePhone").value.trim();

    localStorage.setItem("profile", JSON.stringify({ name, phone }));
});

/* ============================
   ИСТОРИЯ ЗАКАЗОВ
============================ */

const openHistory = document.getElementById("openHistory");
const historyModal = document.getElementById("historyModal");
const closeHistory = document.getElementById("closeHistory");
const historyList = document.getElementById("historyList");

function loadOrderHistory() {
    return JSON.parse(localStorage.getItem("orderHistory") || "[]");
}

function saveOrderHistory(history) {
    localStorage.setItem("orderHistory", JSON.stringify(history));
}

function renderOrderHistory() {
    const history = loadOrderHistory();

    if (!history.length) {
        historyList.innerHTML = "<p>Пока нет заказов.</p>";
        return;
    }

    historyList.innerHTML = history.map((order, i) => `
        <div class="history-item">
            <h4>Заказ #${i + 1} от ${order.date}</h4>
            <p>Гостей: ${order.guests}</p>
            <ul>
                ${order.items.map(item => `<li>${item.title} × ${item.qty}</li>`).join("")}
            </ul>
        </div>
    `).join("");
}

openHistory.addEventListener("click", () => {
    renderOrderHistory();
    historyModal.style.display = "flex";
});

closeHistory.addEventListener("click", () => {
    historyModal.style.display = "none";
});

/* ============================
   ОБРАБОТЧИК БРОНИ (ОБЩИЙ)
============================ */

function handleBookingSubmit(name, phone, date, time, guests, comment) {
    const history = loadOrderHistory();

    history.push({
        date: new Date().toLocaleString("ru-RU"),
        name,
        phone,
        datetime: `${date} ${time}`,
        guests,
        comment,
        items: currentOrderItems
    });

    saveOrderHistory(history);
    renderOrderHistory();

    cartItems = [];
    updateCartUI();

    alert("Бронь оформлена и добавлена в историю.");
}

/* ============================
   МОДАЛЬНАЯ ФОРМА
============================ */

const bookingForm = document.getElementById("booking-form");

bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    handleBookingSubmit(
        document.getElementById("name").value.trim(),
        document.getElementById("phone").value.trim(),
        document.getElementById("date").value,
        document.getElementById("time").value,
        document.getElementById("guests").value,
        document.getElementById("comment").value.trim()
    );

    bookingForm.reset();
    bookingModal.style.display = "none";
});

/* ============================
   СТАТИЧНАЯ ФОРМА
============================ */

const staticForm = document.getElementById("static-booking-form");

staticForm.addEventListener("submit", (e) => {
    e.preventDefault();

    handleBookingSubmit(
        document.getElementById("static-name").value.trim(),
        document.getElementById("static-phone").value.trim(),
        document.getElementById("static-date").value,
        document.getElementById("static-time").value,
        document.getElementById("static-guests").value,
        document.getElementById("static-comment").value.trim()
    );

    staticForm.reset();
});

/* ============================
   ИНИЦИАЛИЗАЦИЯ
============================ */
function initGuestsSelect(id) {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = "";
    for (let i = 1; i <= 12; i++) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = `${i} гость${i === 1 ? "" : (i < 5 ? "я" : "ей")}`;
        select.appendChild(opt);
    }
}

initGuestsSelect("guests");
initGuestsSelect("static-guests");

renderOrderHistory();
updateCartUI();
