// ===============================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ===============================

// Текущие позиции корзины (заполняются твоей логикой)
let cartItems = [];          // сюда ты должен класть товары при добавлении в корзину
let currentOrderItems = [];  // временное хранилище заказа при переходе к брони

// ===============================
// УТИЛИТЫ
// ===============================

// Безопасное чтение истории заказов
function loadOrderHistory() {
  try {
    const raw = localStorage.getItem('orderHistory');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Ошибка чтения истории заказов:', e);
    return [];
  }
}

// Сохранение истории заказов
function saveOrderHistory(history) {
  try {
    localStorage.setItem('orderHistory', JSON.stringify(history));
  } catch (e) {
    console.error('Ошибка сохранения истории заказов:', e);
  }
}

// Отрисовка истории заказов
function renderOrderHistory() {
  const container = document.getElementById('history-list');
  if (!container) return;

  const history = loadOrderHistory();

  if (!history.length) {
    container.innerHTML = '<p>Пока нет заказов.</p>';
    return;
  }

  container.innerHTML = history
    .map((order, index) => {
      const itemsHtml = order.items
        .map(item => `<li>${item.title} × ${item.qty}</li>`)
        .join('');

      return `
        <div class="history-item">
          <h4>Заказ #${index + 1} от ${order.date}</h4>
          <p>Гостей: ${order.guests || '-'}</p>
          <ul>${itemsHtml}</ul>
        </div>
      `;
    })
    .join('');
}

// ===============================
// КОРЗИНА
// ===============================

// Пример функции, которая должна возвращать текущие товары корзины
// ТЫ ДОЛЖЕН ПОДСТРОИТЬ ЭТУ ФУНКЦИЮ ПОД СВОЮ СТРУКТУРУ
function getCartItems() {
  // Если у тебя уже есть глобальный массив с товарами — используй его
  // Например, если ты хранишь в window.cartItems:
  if (Array.isArray(window.cartItems)) {
    return window.cartItems;
  }

  // Если нет — возвращаем cartItems (локальный массив)
  return cartItems;
}

// Очистка корзины (адаптируй под свою логику)
function clearCart() {
  cartItems = [];
  if (Array.isArray(window.cartItems)) {
    window.cartItems = [];
  }

  const cartContainer = document.querySelector('.cart-items');
  if (cartContainer) {
    cartContainer.innerHTML = '<p>Корзина пуста.</p>';
  }
}

// Обработчик кнопки "Оформить заказ" в корзине
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('cart-checkout-btn')) {
    e.preventDefault();

    // забираем текущие позиции корзины
    currentOrderItems = getCartItems();

    if (!currentOrderItems || !currentOrderItems.length) {
      alert('Сначала добавьте блюда в корзину.');
      return;
    }

    // закрываем модалку корзины, если есть
    const cartModal = document.querySelector('.cart-modal');
    if (cartModal) {
      cartModal.style.display = 'none';
    }

    // скроллим к блоку бронирования
    const bookingSection = document.querySelector('#booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
});

// ===============================
// БРОНИРОВАНИЕ
// ===============================

const bookingForm = document.getElementById('booking-form');
const bookingClearBtn = document.querySelector('.booking-clear');

if (bookingForm) {
  // Жёсткое форматирование/валидация при отправке
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('booking-name');
    const phoneInput = document.getElementById('booking-phone');
    const datetimeInput = document.getElementById('booking-datetime');
    const guestsSelect = document.getElementById('booking-guests');
    const commentInput = document.getElementById('booking-comment');

    const name = nameInput?.value.trim();
    const phone = phoneInput?.value.trim();
    const datetime = datetimeInput?.value;
    const guests = guestsSelect?.value;

    // Простая валидация
    if (!name) {
      alert('Введите имя.');
      nameInput?.focus();
      return;
    }

    if (!phone) {
      alert('Введите телефон.');
      phoneInput?.focus();
      return;
    }

    if (!datetime) {
      alert('Выберите дату и время.');
      datetimeInput?.focus();
      return;
    }

    if (!guests) {
      alert('Выберите количество гостей.');
      guestsSelect?.focus();
      return;
    }

    // Загружаем текущую историю
    const history = loadOrderHistory();

    // Добавляем новый заказ
    history.push({
      date: new Date().toLocaleString('ru-RU'),
      name,
      phone,
      datetime,
      guests,
      comment: commentInput?.value.trim() || '',
      items: currentOrderItems || []
    });

    // Сохраняем историю
    saveOrderHistory(history);

    // Перерисовываем историю
    renderOrderHistory();

    // Очищаем корзину
    clearCart();

    // Можно очистить форму
    bookingForm.reset();

    alert('Бронь оформлена, заказ сохранён в истории.');
  });
}

// Кнопка "Очистить" в форме бронирования
if (bookingClearBtn && bookingForm) {
  bookingClearBtn.addEventListener('click', () => {
    bookingForm.reset();
  });
}

// ===============================
// ФИКС МОДАЛКИ ДЛЯ СПИСКА ГОСТЕЙ
// ===============================

// На случай, если CSS где-то режет overflow, подстрахуемся JS-классом
function fixModalSelectOverflow() {
  const modalContent = document.querySelector('.modal-content');
  if (!modalContent) return;

  modalContent.style.overflow = 'visible';
  modalContent.style.maxHeight = 'none';
}

document.addEventListener('DOMContentLoaded', fixModalSelectOverflow);

// ===============================
// ИСТОРИЯ ПРИ ЗАГРУЗКЕ
// ===============================

document.addEventListener('DOMContentLoaded', () => {
  renderOrderHistory();
});
