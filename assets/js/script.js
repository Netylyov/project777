/* ===========================
   ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
=========================== */
let db = null;
let auth = null;
let provider = null;
let currentUserId = "guest";

/* ===========================
   ИНИЦИАЛИЗАЦИЯ FIREBASE
=========================== */
if (window.firebase) {
  try {
    db = firebase.firestore();
    auth = firebase.auth();
    provider = new firebase.auth.GoogleAuthProvider();
    console.log('✅ Firebase инициализирован');
  } catch (e) {
    console.error('❌ Ошибка инициализации Firebase:', e);
  }
}

/* ===========================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
=========================== */
function showToast(text) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1500);
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function closeAllModals() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.classList.remove('modal--open');
  });
  document.body.style.overflow = "";
}

/* ===========================
   БУРГЕР-МЕНЮ
=========================== */
function initBurgerMenu() {
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
    console.log('✅ Бургер-меню инициализировано');
  }
}

/* ===========================
   ФИЛЬТР МЕНЮ
=========================== */
function initMenuFilter() {
  const filterButtons = document.querySelectorAll('.menu-categories button');
  const menuItems = document.querySelectorAll('.menu-item');

  if (!filterButtons.length || !menuItems.length) {
    console.warn('⚠️ Элементы фильтра не найдены');
    return;
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.dataset.filter;

      menuItems.forEach(item => {
        const match = category === 'all' || item.dataset.category === category;
        item.style.display = match ? '' : 'none';
      });
    });
  });
  console.log('✅ Фильтр меню инициализирован');
}

/* ===========================
   КОРЗИНА
=========================== */
function initCart() {
  console.log('🛒 Инициализация корзины...');
  
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  console.log('📦 Загружена корзина:', cart);

  const cartModal = document.getElementById('cartModal');
  const openCart = document.getElementById('openCart');
  const closeCart = document.getElementById('closeCart');
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const cartCount = document.getElementById('cartCount');
  const checkoutBtn = document.getElementById('checkoutBtn');

  function updateCart() {
    if (!cartItems || !cartTotal || !cartCount) {
      console.warn('⚠️ Элементы корзины не найдены');
      return;
    }

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
        <button class="remove-item" data-index="${index}">✕</button>
      `;
      cartItems.appendChild(div);
    });

    cartTotal.textContent = total;
    cartCount.textContent = cart.length;

    // Добавляем обработчики для кнопок удаления
    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = btn.dataset.index;
        cart.splice(index, 1);
        saveCart(cart);
        updateCart();
        showToast('Товар удален из корзины');
      });
    });
  }

  // Добавление в корзину
  document.querySelectorAll('.menu-btn').forEach(btn => {
    // Удаляем старые обработчики, чтобы не было дублирования
    btn.removeEventListener('click', btn._handler);
    
    btn._handler = () => {
      const item = btn.closest('.menu-item');
      if (!item) return;
      
      const titleEl = item.querySelector('.menu-title');
      const priceEl = item.querySelector('.menu-price');
      if (!titleEl || !priceEl) return;

      const title = titleEl.textContent.trim();
      const price = Number(priceEl.textContent.replace(/\D/g, "")) || 0;

      cart.push({ title, price });
      saveCart(cart);
      updateCart();
      showToast(`«${title}» добавлено в корзину`);
    };
    
    btn.addEventListener('click', btn._handler);
  });

  // Открытие корзины
  if (openCart && cartModal) {
    openCart.addEventListener('click', () => {
      cartModal.classList.add('modal--open');
      document.body.style.overflow = "hidden";
    });
  }

  // Закрытие корзины
  if (closeCart && cartModal) {
    closeCart.addEventListener('click', () => {
      cartModal.classList.remove('modal--open');
      document.body.style.overflow = "";
    });
  }

  // Закрытие по клику на оверлей
  if (cartModal) {
    cartModal.addEventListener('click', e => {
      if (e.target === cartModal) {
        cartModal.classList.remove('modal--open');
        document.body.style.overflow = "";
      }
    });
  }

  // Оформление заказа из корзины
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast("Корзина пуста");
        return;
      }

      if (cartModal) {
        cartModal.classList.remove('modal--open');
      }

      // Заполняем комментарий в форме бронирования
      const commentField = document.getElementById('comment');
      if (commentField) {
        let orderText = "Заказ:\n";
        cart.forEach(item => {
          const priceNum = Number(item.price) || 0;
          orderText += `• ${item.title} — ${priceNum} BYN\n`;
        });
        commentField.value = orderText;
      }
      
      // Открываем модалку бронирования
      const bookingModal = document.getElementById('bookingModal');
      if (bookingModal) {
        bookingModal.classList.add('modal--open');
      }
    });
  }

  // Первоначальное обновление
  updateCart();
  console.log('✅ Корзина инициализирована');
}

/* ===========================
   ПРОФИЛЬ
=========================== */
function initProfile() {
  console.log('👤 Инициализация профиля...');
  
  const profileName = document.getElementById('profileName');
  const profilePhone = document.getElementById('profilePhone');
  const saveProfile = document.getElementById('saveProfile');
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const avatar = document.getElementById('profileAvatar');

  let profile = JSON.parse(localStorage.getItem('profile') || '{}');

  // Загрузка профиля
  if (profile.name && profileName) profileName.value = profile.name;
  if (profile.phone && profilePhone) profilePhone.value = profile.phone;

  // Валидация имени
  if (profileName) {
    profileName.addEventListener('input', () => {
      profileName.value = profileName.value
        .replace(/[^А-Яа-яЁё\s]/g, "")
        .replace(/\s+/g, " ")
        .slice(0, 20);
    });
  }

  // Валидация телефона
  if (profilePhone) {
    profilePhone.addEventListener('input', () => {
      let v = profilePhone.value.replace(/\D/g, "");

      if (v.startsWith("375")) {
        v = v.slice(0, 12);
        profilePhone.value =
          "+375 " +
          v.slice(3, 5) + " " +
          v.slice(5, 8) + " " +
          v.slice(8, 10) + " " +
          v.slice(10, 12);
      } else if (v.startsWith("7")) {
        v = v.slice(0, 11);
        profilePhone.value =
          "+7 " +
          v.slice(1, 4) + " " +
          v.slice(4, 7) + " " +
          v.slice(7, 9) + " " +
          v.slice(9, 11);
      } else {
        profilePhone.value = v ? "+" + v : "";
      }
    });
  }

  // Сохранение профиля
  if (saveProfile) {
    saveProfile.addEventListener('click', () => {
      profile = {
        name: profileName ? profileName.value : "",
        phone: profilePhone ? profilePhone.value : ""
      };
      localStorage.setItem('profile', JSON.stringify(profile));
      showToast('Профиль сохранён');
    });
  }

  // Авторизация через Google
  if (googleLoginBtn && auth) {
    googleLoginBtn.addEventListener('click', () => {
      auth.signInWithPopup(provider)
        .then(result => {
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
          showToast('Вы успешно вошли');
        })
        .catch(error => {
          console.error('Ошибка входа:', error);
          showToast('Ошибка при входе');
        });
    });
  }

  // Отслеживание состояния авторизации
  if (auth) {
    auth.onAuthStateChanged(user => {
      if (user) {
        currentUserId = user.uid;
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (user.photoURL && avatar) {
          avatar.src = user.photoURL;
          avatar.style.display = 'block';
        }
      } else {
        currentUserId = "guest";
        if (logoutBtn) logoutBtn.style.display = 'none';
      }
    });
  }

  // Выход из аккаунта
  if (logoutBtn && auth) {
    logoutBtn.addEventListener('click', () => {
      auth.signOut()
        .then(() => {
          localStorage.removeItem('profile');
          if (profileName) profileName.value = '';
          if (profilePhone) profilePhone.value = '';
          if (avatar) avatar.style.display = 'none';
          showToast('Вы вышли из аккаунта');
        })
        .catch(error => {
          console.error('Ошибка при выходе:', error);
          showToast('Ошибка при выходе');
        });
    });
  }
  
  console.log('✅ Профиль инициализирован');
}

/* ===========================
   БРОНИРОВАНИЕ
=========================== */
function initBooking() {
  console.log('📅 Инициализация бронирования...');
  
  const bookingModal = document.getElementById('bookingModal');
  const openBookingModal = document.getElementById('openBookingModal');
  const openBookingHero = document.getElementById('openBookingHero');
  const closeBooking = document.getElementById('closeBooking');
  const bookingForm = document.getElementById('booking-form');
  const clearBooking = document.getElementById('clearBooking');

  if (!bookingModal || !bookingForm) {
    console.error('❌ Элементы бронирования не найдены');
    return;
  }

  // Валидация полей
  const nameInput = document.getElementById('name');
  const phoneInput = document.getElementById('phone');
  const dateInput = document.getElementById('date');
  const timeInput = document.getElementById('time');
  const guestsInput = document.getElementById('guests');
  const commentInput = document.getElementById('comment');

  if (nameInput) {
    nameInput.addEventListener('input', () => {
      nameInput.value = nameInput.value
        .replace(/[^А-Яа-яЁё\s]/g, "")
        .replace(/\s+/g, " ")
        .slice(0, 20);
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      let v = phoneInput.value.replace(/\D/g, "");

      if (v.startsWith("375")) {
        v = v.slice(0, 12);
        phoneInput.value =
          "+375" +
          (v.length > 3 ? " " + v.slice(3, 5) : "") +
          (v.length > 5 ? " " + v.slice(5, 8) : "") +
          (v.length > 8 ? " " + v.slice(8, 10) : "") +
          (v.length > 10 ? " " + v.slice(10, 12) : "");
      } else if (v.startsWith("7")) {
        v = v.slice(0, 11);
        phoneInput.value =
          "+7" +
          (v.length > 1 ? " " + v.slice(1, 4) : "") +
          (v.length > 4 ? " " + v.slice(4, 7) : "") +
          (v.length > 7 ? " " + v.slice(7, 9) : "") +
          (v.length > 9 ? " " + v.slice(9, 11) : "");
      } else {
        phoneInput.value = v ? "+" + v : "";
      }
    });
  }

  // Установка ограничений даты
  if (dateInput) {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 1);
    
    dateInput.min = today.toISOString().split('T')[0];
    dateInput.max = maxDate.toISOString().split('T')[0];
  }

  // Валидация времени
  if (timeInput) {
    timeInput.addEventListener('blur', () => {
      if (!timeInput.value) return;
      let [h, m] = timeInput.value.split(':').map(Number);
      if (isNaN(h)) h = 12;
      if (isNaN(m)) m = 0;
      h = Math.min(23, Math.max(0, h));
      m = Math.min(59, Math.max(0, m));
      timeInput.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    });
  }

  // Открытие модалки
  function openBooking() {
    bookingModal.classList.add('modal--open');
    document.body.style.overflow = "hidden";

    const profile = JSON.parse(localStorage.getItem('profile') || '{}');
    if (nameInput && profile.name) nameInput.value = profile.name;
    if (phoneInput && profile.phone) phoneInput.value = profile.phone;

    // Устанавливаем дату по умолчанию (завтра)
    if (dateInput && !dateInput.value) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.value = tomorrow.toISOString().split('T')[0];
    }

    // Устанавливаем время по умолчанию
    if (timeInput && !timeInput.value) {
      timeInput.value = '18:00';
    }
  }

  if (openBookingModal) openBookingModal.addEventListener('click', openBooking);
  if (openBookingHero) openBookingHero.addEventListener('click', openBooking);

  // Закрытие модалки
  if (closeBooking) {
    closeBooking.addEventListener('click', () => {
      bookingModal.classList.remove('modal--open');
      document.body.style.overflow = "";
    });
  }

  bookingModal.addEventListener('click', e => {
    if (e.target === bookingModal) {
      bookingModal.classList.remove('modal--open');
      document.body.style.overflow = "";
    }
  });

  // Очистка формы
  if (clearBooking) {
    clearBooking.addEventListener('click', (e) => {
      e.preventDefault();
      bookingForm.reset();
      if (commentInput) commentInput.value = '';
    });
  }

  // ОБРАБОТЧИК ОТПРАВКИ
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    console.log('=== НАЧАЛО ОТПРАВКИ ===');
    
    const name = nameInput?.value.trim();
    const phone = phoneInput?.value.trim();
    const guests = guestsInput?.value || '2';
    const comment = commentInput?.value.trim() || '';
    const date = dateInput?.value;
    const time = timeInput?.value;

    console.log('Данные формы:', { name, phone, guests, comment, date, time });

    // Валидация
    if (!name) {
      showToast('Введите имя');
      return;
    }
    if (!phone) {
      showToast('Введите телефон');
      return;
    }
    if (!date) {
      showToast('Выберите дату');
      return;
    }
    if (!time) {
      showToast('Выберите время');
      return;
    }

    // Блокируем кнопку
    const submitBtn = bookingForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправка...';
    }

    try {
      // Получаем корзину
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
      
      console.log('Корзина:', cart);
      console.log('Firebase доступен:', !!db);

      // СОХРАНЯЕМ В ИСТОРИЮ
      const orderData = {
        id: Date.now().toString(),
        userId: currentUserId,
        name,
        phone,
        guests: Number(guests),
        comment,
        date,
        time,
        total,
        items: cart,
        status: 'new',
        timestamp: new Date().toISOString()
      };

      // Сохраняем в Firebase если доступен
      if (db) {
        try {
          await db.collection('orders').add({
            ...orderData,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          });
          console.log('✅ Заказ сохранен в Firebase');
        } catch (firebaseError) {
          console.error('Ошибка Firebase:', firebaseError);
          saveOrderToLocalStorage(orderData);
        }
      } else {
        saveOrderToLocalStorage(orderData);
      }

      // ОЧИЩАЕМ КОРЗИНУ
      localStorage.setItem('cart', '[]');
      
      // Обновляем отображение корзины
      const cartCount = document.getElementById('cartCount');
      if (cartCount) cartCount.textContent = '0';
      
      const cartTotal = document.getElementById('cartTotal');
      if (cartTotal) cartTotal.textContent = '0';

      // УВЕДОМЛЕНИЕ
      showToast('✅ Заявка успешно отправлена!');

      // ЗАКРЫВАЕМ ФОРМУ
      bookingModal.classList.remove('modal--open');
      document.body.style.overflow = "";

      // ОЧИЩАЕМ ФОРМУ
      bookingForm.reset();
      if (commentInput) commentInput.value = '';

      console.log('✅ Все операции завершены');

    } catch (error) {
      console.error('❌ Ошибка:', error);
      showToast('❌ Ошибка при отправке заявки');
      
    } finally {
      // Разблокируем кнопку
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить заявку';
      }
    }
  });

  // Функция сохранения в localStorage
  function saveOrderToLocalStorage(orderData) {
    try {
      const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      history.unshift(orderData);
      if (history.length > 50) history.pop();
      localStorage.setItem('orderHistory', JSON.stringify(history));
      console.log('✅ Заказ сохранен в localStorage');
    } catch (e) {
      console.error('Ошибка сохранения:', e);
    }
  }
  
  console.log('✅ Бронирование инициализировано');
}

/* ===========================
   ИСТОРИЯ ЗАКАЗОВ
=========================== */
function initHistory() {
  console.log('📜 Инициализация истории...');
  
  const historyModal = document.getElementById('historyModal');
  const openHistory = document.getElementById('openHistory');
  const openHistoryFooter = document.getElementById('openHistoryFooter');
  const closeHistory = document.getElementById('closeHistory');
  const historyList = document.getElementById('historyList');

  if (!historyModal || !historyList) {
    console.warn('⚠️ Элементы истории не найдены');
    return;
  }

  async function loadHistory() {
    const allOrders = [];
    
    // Из Firebase
    if (db) {
      try {
        const snapshot = await db.collection('orders')
          .where('userId', '==', currentUserId)
          .orderBy('timestamp', 'desc')
          .get();

        snapshot.forEach(doc => {
          const order = doc.data();
          allOrders.push({
            ...order,
            id: doc.id,
            source: 'firebase',
            displayDate: order.timestamp?.toDate().toLocaleString('ru-RU') || '-'
          });
        });
      } catch (error) {
        console.error('Ошибка загрузки из Firebase:', error);
      }
    }
    
    // Из localStorage
    const localHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    localHistory.forEach(order => {
      allOrders.push({
        ...order,
        source: 'local',
        displayDate: new Date(order.timestamp).toLocaleString('ru-RU')
      });
    });
    
    // Сортируем
    allOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (allOrders.length === 0) {
      historyList.innerHTML = '<p>Заказов пока нет.</p>';
      return;
    }

    historyList.innerHTML = '';

    allOrders.forEach(order => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <div><strong>Дата заказа:</strong> ${order.displayDate}</div>
        <div><strong>Сумма:</strong> ${order.total} BYN</div>
        <div><strong>Имя:</strong> ${order.name}</div>
        <div><strong>Телефон:</strong> ${order.phone}</div>
        <div><strong>Дата брони:</strong> ${order.date} ${order.time}</div>
        <div><strong>Гостей:</strong> ${order.guests}</div>
        <div><strong>Комментарий:</strong> ${order.comment || '-'}</div>
        <div><strong>Позиции:</strong><br>
          ${order.items.map(i => `• ${i.title} — ${i.price} BYN`).join('<br>')}
        </div>
        <hr>
      `;
      historyList.appendChild(div);
    });
  }

  function openHistoryModal() {
    loadHistory();
    historyModal.classList.add('modal--open');
    document.body.style.overflow = 'hidden';
  }

  if (openHistory) openHistory.addEventListener('click', openHistoryModal);
  if (openHistoryFooter) openHistoryFooter.addEventListener('click', openHistoryModal);

  if (closeHistory) {
    closeHistory.addEventListener('click', () => {
      historyModal.classList.remove('modal--open');
      document.body.style.overflow = '';
    });
  }

  historyModal.addEventListener('click', e => {
    if (e.target === historyModal) {
      historyModal.classList.remove('modal--open');
      document.body.style.overflow = '';
    }
  });
  
  console.log('✅ История инициализирована');
}

/* ===========================
   ОГРАНИЧЕНИЯ ДАТЫ
=========================== */
function initDateRestrictions() {
  const dateInput = document.getElementById('date');
  if (!dateInput) return;

  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + 1);

  dateInput.min = today.toISOString().split('T')[0];
  dateInput.max = maxDate.toISOString().split('T')[0];
}

/* ===========================
   ВАЛИДАЦИЯ ВРЕМЕНИ
=========================== */
function initTimeValidation() {
  document.querySelectorAll('input[type="time"]').forEach(input => {
    input.addEventListener('blur', () => {
      if (!input.value) return;
      let [h, m] = input.value.split(':').map(Number);
      if (isNaN(h)) h = 0;
      if (isNaN(m)) m = 0;
      h = Math.min(23, Math.max(0, h));
      m = Math.min(59, Math.max(0, m));
      input.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    });
  });
}

/* ===========================
   ЗАКРЫТИЕ ПО ESC
=========================== */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeAllModals();
  }
});

/* ===========================
   ЗАПУСК ПРИ ЗАГРУЗКЕ
=========================== */
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Запуск инициализации...');
  
  // Проверяем наличие основных элементов
  console.log('📄 Проверка элементов:');
  console.log('- burgerBtn:', !!document.getElementById('burgerBtn'));
  console.log('- cartModal:', !!document.getElementById('cartModal'));
  console.log('- bookingModal:', !!document.getElementById('bookingModal'));
  console.log('- profileName:', !!document.getElementById('profileName'));
  
  // Инициализируем все модули
  initBurgerMenu();
  initMenuFilter();
  initCart();
  initProfile();
  initBooking();
  initHistory();
  initDateRestrictions();
  initTimeValidation();
  
  console.log('✅ Инициализация завершена');
});

// Для отладки в консоли
window.viewLocalHistory = function() {
  const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
  console.log('📜 История заказов (localStorage):', history);
  return history;
};

window.viewCart = function() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  console.log('🛒 Текущая корзина:', cart);
  return cart;
};