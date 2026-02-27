// ===============================
// BURGER MENU
// ===============================

const burgerBtn = document.getElementById("burgerBtn");
const mobileMenu = document.getElementById("mobileMenu");

burgerBtn?.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
});

document.querySelectorAll(".mobile-menu a").forEach(link => {
    link.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
    });
});

// ===============================
// MENU FILTER
// ===============================

const filterButtons = document.querySelectorAll(".menu-categories button");
const menuItems = document.querySelectorAll(".menu-item");

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const filter = btn.dataset.filter;

        menuItems.forEach(item => {
            item.style.display =
                filter === "all" || item.dataset.category === filter
                    ? "flex"
                    : "none";
        });
    });
});

// ===============================
// BOOKING MODAL
// ===============================

const bookingModal = document.getElementById("bookingModal");
const openBooking = document.getElementById("openBooking");
const openBookingHero = document.getElementById("openBookingHero");
const closeBooking = document.getElementById("closeBooking");

function openBookingModal() {
    bookingModal.style.display = "flex";
}

function closeBookingModal() {
    bookingModal.style.display = "none";
}

openBooking?.addEventListener("click", openBookingModal);
openBookingHero?.addEventListener("click", openBookingModal);
closeBooking?.addEventListener("click", closeBookingModal);

window.addEventListener("click", e => {
    if (e.target === bookingModal) closeBookingModal();
});

// ===============================
// BOOKING FORM ENHANCEMENTS
// ===============================

const bookingForm = document.getElementById("booking-form");
const phoneInput = document.getElementById("phone");
const guestsSelect = document.getElementById("guests");
const clearBookingBtn = document.getElementById("clearBooking");

// Маска телефона
if (phoneInput) {
    phoneInput.addEventListener("input", () => {
        let v = phoneInput.value.replace(/\D/g, "");

        if (v.length === 0) {
            phoneInput.value = "";
            return;
        }

        if (v.startsWith("375")) v = v.slice(3);
        if (v.startsWith("80")) v = v.slice(2);

        let f = "+375 ";

        if (v.length > 0) f += "(" + v.substring(0, 2);
        if (v.length >= 2) f += ") " + v.substring(2, 5);
        if (v.length >= 5) f += "-" + v.substring(5, 7);
        if (v.length >= 7) f += "-" + v.substring(7, 9);

        phoneInput.value = f;
    });
}

// Гости 1–15
if (guestsSelect) {
    guestsSelect.innerHTML = '<option value="">Выберите</option>';
    for (let i = 1; i <= 15; i++) {
        const opt = document.createElement("option");
        opt.value = String(i);
        opt.textContent = i;
        guestsSelect.appendChild(opt);
    }
}

// Очистка формы
if (clearBookingBtn) {
    clearBookingBtn.addEventListener("click", () => {
        bookingForm.reset();
        phoneInput.value = "";
    });
}

// ===============================
// BOOKING SEND TO LOCAL BACKEND
// ===============================

if (bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            name: document.getElementById("name").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            date: document.getElementById("date").value,
            time: document.getElementById("time").value,
            guests: document.getElementById("guests").value,
            comment: document.getElementById("comment").value.trim()
        };

        if (!data.name || !data.phone || !data.date || !data.time || !data.guests) {
            alert("Пожалуйста, заполните все обязательные поля.");
            return;
        }

        const phoneValid = /^\+375 \(\d{2}\) \d{3}-\d{2}-\d{2}$/.test(data.phone);
        if (!phoneValid) {
            alert("Введите номер в формате +375 (XX) XXX-XX-XX");
            return;
        }

        const now = new Date();
        const selected = new Date(`${data.date}T${data.time}`);
        if (isNaN(selected.getTime()) || selected < now) {
            alert("Нельзя выбрать прошедшую дату или время.");
            return;
        }

        if (+data.guests < 1 || +data.guests > 15) {
            alert("Количество гостей должно быть от 1 до 15.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3001/api/booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            console.log("Ответ сервера:", result);

            if (!response.ok || !result.ok) {
                alert(result.message || "Ошибка отправки бронирования");
                return;
            }

            closeBookingModal();
            alert("Бронирование отправлено!");

        } catch (err) {
            console.error("Ошибка:", err);
            alert("Ошибка отправки бронирования");
        }
    });
}

// ===============================
// CART SYSTEM
// ===============================

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

const openCart = document.getElementById("openCart");
const cartModal = document.getElementById("cartModal");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const checkoutBtn = document.getElementById("checkoutBtn");

openCart?.addEventListener("click", () => {
    cartModal.style.display = "flex";
    renderCart();
});

closeCart?.addEventListener("click", () => {
    cartModal.style.display = "none";
});

document.querySelectorAll(".menu-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const item = btn.closest(".menu-item");
        const title = item.querySelector(".menu-title").textContent;
        const price = parseFloat(item.querySelector(".menu-price").textContent);

        const existing = cart.find(i => i.title === title);

        if (existing) {
            existing.qty++;
        } else {
            cart.push({ title, price, qty: 1 });
        }

        saveCart();
        updateCartCount();
        renderCart();

        cartModal.style.display = "flex";
    });
});

function renderCart() {
    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Корзина пуста</p>";
        cartTotal.textContent = "0";
        return;
    }

    cart.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.dataset.index = index;

        div.innerHTML = `
            <div class="cart-item-main">
                <div class="cart-item-title">${item.title}</div>

                <div class="cart-item-controls">
                    <button class="qty-btn minus">−</button>
                    <span class="qty-value">${item.qty}</span>
                    <button class="qty-btn plus">+</button>
                </div>
            </div>

            <div class="cart-item-right">
                <div class="cart-item-price">${item.price * item.qty} BYN</div>
                <button class="cart-remove">✕</button>
            </div>
        `;

        cartItems.appendChild(div);
    });

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    cartTotal.textContent = total;
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
    cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
}

updateCartCount();

cartItems?.addEventListener("click", e => {
    const parent = e.target.closest(".cart-item");
    if (!parent) return;

    const index = parseInt(parent.dataset.index, 10);
    const item = cart[index];
    if (!item) return;

    if (e.target.classList.contains("plus")) {
        item.qty++;
    } else if (e.target.classList.contains("minus")) {
        item.qty--;
        if (item.qty <= 0) cart.splice(index, 1);
    } else if (e.target.classList.contains("cart-remove")) {
        cart.splice(index, 1);
    } else {
        return;
    }

    saveCart();
    updateCartCount();
    renderCart();
});

// ===============================
// HISTORY
// ===============================

const openHistory = document.getElementById("openHistory");
const historyModal = document.getElementById("historyModal");
const closeHistory = document.getElementById("closeHistory");
const historyList = document.getElementById("historyList");

openHistory?.addEventListener("click", () => {
    historyModal.style.display = "flex";
    renderHistory();
});

closeHistory?.addEventListener("click", () => {
    historyModal.style.display = "none";
});

window.addEventListener("click", e => {
    if (e.target === historyModal) historyModal.style.display = "none";
});

function renderHistory() {
    historyList.innerHTML = "";

    if (history.length === 0) {
        historyList.innerHTML = "<p>История пуста</p>";
        return;
    }

    history.forEach(order => {
        const div = document.createElement("div");
        div.className = "history-item";

        div.innerHTML = `
            <h4>${order.date}</h4>
            <p>Сумма: ${order.total} BYN</p>
            <ul>
                ${order.items.map(i => `<li>${i.title} × ${i.qty}</li>`).join("")}
            </ul>
            <hr>
        `;

        historyList.appendChild(div);
    });
}

// ===============================
// PROFILE
// ===============================

const profileName = document.getElementById("profileName");
const profilePhone = document.getElementById("profilePhone");
const saveProfile = document.getElementById("saveProfile");

const savedProfile = JSON.parse(localStorage.getItem("profile")) || null;

if (savedProfile) {
    profileName.value = savedProfile.name || "";
    profilePhone.value = savedProfile.phone || "";
}

saveProfile?.addEventListener("click", () => {
    const data = {
        name: profileName.value.trim(),
        phone: profilePhone.value.trim()
    };

    localStorage.setItem("profile", JSON.stringify(data));
    alert("Профиль сохранён");
});

// ===============================
// CHECKOUT
// ===============================

checkoutBtn?.addEventListener("click", () => {
    if (cart.length === 0) {
        alert("Корзина пуста");
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const order = {
        items: [...cart],
        total,
        date: new Date().toLocaleString()
    };

    history.push(order);
    localStorage.setItem("history", JSON.stringify(history));

    cart = [];
    saveCart();
    updateCartCount();
    renderCart();

    alert("Заказ оформлен!");
});
