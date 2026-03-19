/* ===========================
   ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
=========================== */
let db = null;
let auth = null;
let provider = null;
let currentUserId = "guest";

/* ===========================
   ИНИЦИАЛИЗАЦИЯ FIREBASE (ЕСЛИ ПОДКЛЮЧЕН)
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
  if (!toast) {
    // Создаем toast если его нет
    const newToast = document.createElement('div');
    newToast.id = 'toast';
    newToast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10000;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: none;
    `;
    document.body.appendChild(newToast);
    showToast(text);
    return;
  }
  toast.textContent = text;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 2000);
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function closeAllModals() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.classList.remove('modal--open');
    modal.style.display = 'none';
  });
  document.body.style.overflow = "";
}

/* ===========================
   СТИЛИ ДЛЯ TOAST И МОДАЛОК
=========================== */
function addGlobalStyles() {
  if (document.getElementById('global-styles')) return;
  
  const styles = document.createElement('style');
  styles.id = 'global-styles';
  styles.textContent = `
    #toast {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10000;
      display: none;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideUp 0.3s ease;
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translate(-50%, 20px);
      }
      to {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    }
    
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      z-index: 9999;
      align-items: center;
      justify-content: center;
    }
    
    .modal--open {
      display: flex !important;
    }
    
    .modal-content {
      background: white;
      padding: 30px;
      border-radius: 12px;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      animation: modalFadeIn 0.3s ease;
    }
    
    @keyframes modalFadeIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    .close {
      position: absolute;
      top: 15px;
      right: 20px;
      font-size: 24px;
      cursor: pointer;
      color: #666;
    }
    
    .close:hover {
      color: #000;
    }
    
    .cart-count {
      background: #e44d2e;
      color: white;
      border-radius: 50%;
      padding: 2px 6px;
      font-size: 12px;
      position: absolute;
      top: -5px;
      right: -5px;
      min-width: 18px;
      text-align: center;
    }
    
    .cart-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      border-bottom: 1px solid #eee;
    }
    
    .cart-item:last-child {
      border-bottom: none;
    }
    
    .remove-item {
      background: none;
      border: none;
      color: #999;
      font-size: 18px;
      cursor: pointer;
      padding: 0 5px;
    }
    
    .remove-item:hover {
      color: #e44d2e;
    }
    
    .empty-cart {
      text-align: center;
      color: #999;
      padding: 20px;
    }
    
    .history-item {
      padding: 15px;
      border-bottom: 1px solid #eee;
      margin-bottom: 10px;
    }
    
    .history-item:last-child {
      border-bottom: none;
    }
    
    .history-date {
      color: #666;
      font-size: 14px;
      margin-bottom: 5px;
    }
    
    .history-name {
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .history-booking {
      color: #e44d2e;
      margin-bottom: 5px;
    }
    
    .history-items {
      margin: 10px 0;
      padding-left: 10px;
      color: #555;
    }
    
    .history-total {
      font-weight: bold;
      color: #333;
      margin-top: 5px;
    }
    
    .history-comment {
      color: #666;
      font-style: italic;
      margin-top: 5px;
      padding: 5px;
      background: #f9f9f9;
      border-radius: 4px;
    }
    
    .no-orders {
      text-align: center;
      color: #999;
      padding: 30px;
    }
  `;
  document.head.appendChild(styles);
}

/* ===========================
   БУРГЕР-МЕНЮ
=========================== */
function initBurgerMenu() {
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMenu.classList.toggle('open');
    });

    // Закрытие при клике вне меню
    document.addEventListener('click', (e) => {
      if (!burgerBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
      }
    });
  }
}

/* ===========================
   ФИЛЬТР МЕНЮ
=========================== */
function initMenuFilter() {
  const filterButtons = document.querySelectorAll('.category-btn, .menu-categories button');
  const menuItems = document.querySelectorAll('.menu-item, .dish-card');

  if (!filterButtons.length || !menuItems.length) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.dataset.filter || btn.dataset.category;

      menuItems.forEach(item => {
        const match = category === 'all' || 
                     item.dataset.category === category || 
                     item.dataset.filter === category;
        item.style.display = match ? 'block' : 'none';
      });
    });
  });
}

/* ===========================
   КОРЗИНА
=========================== */
function initCart() {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');

  const cartModal = document.getElementById('cartModal');
  const openCart = document.getElementById('openCart');
  const closeCart = document.getElementById('closeCart');
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const cartCount = document.getElementById('cartCount');
  const checkoutBtn = document.getElementById('checkoutBtn');

  function updateCart() {
    // Обновляем счетчик на всех элементах
    document.querySelectorAll('.cart-count, #cartCount').forEach(el => {
      if (el) el.textContent = cart.length;
    });

    if (cartTotal) {
      const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
      cartTotal.textContent = total;
    }

    if (cartItems) {
      cartItems.innerHTML = '';
      
      if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
        return;
      }

      cart.forEach((item, index) => {
        const priceNum = Number(item.price) || 0;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
          <span class="cart-item-title">${item.title}</span>
          <span class="cart-item-price">${priceNum} BYN</span>
          <button class="remove-item" data-index="${index}">✕</button>
        `;
        cartItems.appendChild(div);
      });

      // Добавляем обработчики удаления
      document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const index = btn.dataset.index;
          cart.splice(index, 1);
          saveCart(cart);
          updateCart();
          showToast('Товар удален');
        });
      });
    }
  }

  // Добавление в корзину
  document.querySelectorAll('.add-to-cart, .menu-btn, .order-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const item = btn.closest('.menu-item, .dish-card, .product-card');
      if (!item) return;
      
      const titleEl = item.querySelector('.dish-title, .menu-title, h3, .title');
      const priceEl = item.querySelector('.dish-price, .menu-price, .price, [data-price]');
      
      let title = 'Блюдо';
      let price = 0;
      
      if (titleEl) title = titleEl.textContent.trim();
      if (priceEl) {
        price = Number(priceEl.textContent.replace(/[^\d]/g, '')) || 
                Number(priceEl.dataset.price) || 0;
      }

      cart.push({ title, price });
      saveCart(cart);
      updateCart();
      showToast(`«${title}» добавлено`);
    });
  });

  // Открытие корзины
  if (openCart && cartModal) {
    openCart.addEventListener('click', (e) => {
      e.preventDefault();
      cartModal.style.display = 'flex';
      cartModal.classList.add('modal--open');
      document.body.style.overflow = "hidden";
      updateCart();
    });
  }

  // Закрытие корзины
  if (closeCart && cartModal) {
    closeCart.addEventListener('click', () => {
      cartModal.style.display = 'none';
      cartModal.classList.remove('modal--open');
      document.body.style.overflow = "";
    });
  }

  // Закрытие по клику на фон
  if (cartModal) {
    cartModal.addEventListener('click', (e) => {
      if (e.target === cartModal) {
        cartModal.style.display = 'none';
        cartModal.classList.remove('modal--open');
        document.body.style.overflow = "";
      }
    });
  }

  // Оформление заказа
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast("Корзина пуста");
        return;
      }

      // Закрываем корзину
      if (cartModal) {
        cartModal.style.display = 'none';
        cartModal.classList.remove('modal--open');
      }

      // Формируем текст заказа
      const orderText = cart.map(item => `• ${item.title} — ${item.price} BYN`).join('\n');
      
      // Открываем бронирование с заказом
      setTimeout(() => {
        const bookingModal = document.getElementById('bookingModal');
        const commentField = document.getElementById('comment');
        
        if (commentField) {
          commentField.value = `Заказ:\n${orderText}`;
        }
        
        if (bookingModal) {
          bookingModal.style.display = 'flex';
          bookingModal.classList.add('modal--open');
        }
      }, 300);
    });
  }

  // Первоначальное обновление
  updateCart();
}

/* ===========================
   ПРОФИЛЬ
=========================== */
function initProfile() {
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
        .slice(0, 30);
    });
  }

  // Валидация телефона
  if (profilePhone) {
    profilePhone.addEventListener('input', () => {
      let v = profilePhone.value.replace(/\D/g, "");

      if (v.startsWith("375")) {
        v = v.slice(0, 12);
        let formatted = "+375";
        if (v.length > 3) formatted += " " + v.slice(3, 5);
        if (v.length > 5) formatted += " " + v.slice(5, 8);
        if (v.length > 8) formatted += " " + v.slice(8, 10);
        if (v.length > 10) formatted += " " + v.slice(10, 12);
        profilePhone.value = formatted;
      } else if (v.startsWith("7")) {
        v = v.slice(0, 11);
        let formatted = "+7";
        if (v.length > 1) formatted += " " + v.slice(1, 4);
        if (v.length > 4) formatted += " " + v.slice(4, 7);
        if (v.length > 7) formatted += " " + v.slice(7, 9);
        if (v.length > 9) formatted += " " + v.slice(9, 11);
        profilePhone.value = formatted;
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

  // Google авторизация
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

  // Состояние авторизации
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

  // Выход
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
          console.error('Ошибка выхода:', error);
          showToast('Ошибка при выходе');
        });
    });
  }
}

/* ===========================
   БРОНИРОВАНИЕ (ФИНАЛЬНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ)
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

  // Поля формы
  const nameInput = document.getElementById('name');
  const phoneInput = document.getElementById('phone');
  const dateInput = document.getElementById('date');
  const timeInput = document.getElementById('time');
  const guestsInput = document.getElementById('guests');
  const commentInput = document.getElementById('comment');

  console.log('✅ Поля формы найдены');

  // Валидация полей
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      nameInput.value = nameInput.value
        .replace(/[^А-Яа-яЁё\s]/g, "")
        .replace(/\s+/g, " ")
        .slice(0, 30);
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      let v = phoneInput.value.replace(/\D/g, "");
      if (v.startsWith("375")) {
        v = v.slice(0, 12);
        let formatted = "+375";
        if (v.length > 3) formatted += " " + v.slice(3, 5);
        if (v.length > 5) formatted += " " + v.slice(5, 8);
        if (v.length > 8) formatted += " " + v.slice(8, 10);
        if (v.length > 10) formatted += " " + v.slice(10, 12);
        phoneInput.value = formatted;
      } else if (v.startsWith("7")) {
        v = v.slice(0, 11);
        let formatted = "+7";
        if (v.length > 1) formatted += " " + v.slice(1, 4);
        if (v.length > 4) formatted += " " + v.slice(4, 7);
        if (v.length > 7) formatted += " " + v.slice(7, 9);
        if (v.length > 9) formatted += " " + v.slice(9, 11);
        phoneInput.value = formatted;
      }
    });
  }

  // Ограничения даты
  if (dateInput) {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 1);
    
    dateInput.min = today.toISOString().split('T')[0];
    dateInput.max = maxDate.toISOString().split('T')[0];
    
    // Устанавливаем дату по умолчанию (завтра)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().split('T')[0];
  }

  // Время по умолчанию
  if (timeInput && !timeInput.value) {
    timeInput.value = '18:00';
  }

  // Открытие модалки
  function openBooking() {
    console.log('📂 Открытие формы бронирования');
    bookingModal.style.display = 'flex';
    bookingModal.classList.add('modal--open');
    document.body.style.overflow = "hidden";

    const profile = JSON.parse(localStorage.getItem('profile') || '{}');
    if (nameInput && profile.name) nameInput.value = profile.name;
    if (phoneInput && profile.phone) phoneInput.value = profile.phone;
  }

  if (openBookingModal) {
    openBookingModal.addEventListener('click', openBooking);
    console.log('✅ Обработчик открытия добавлен для кнопки в шапке');
  }
  if (openBookingHero) {
    openBookingHero.addEventListener('click', openBooking);
    console.log('✅ Обработчик открытия добавлен для hero-кнопки');
  }

  // Закрытие
  if (closeBooking) {
    closeBooking.addEventListener('click', () => {
      console.log('📂 Закрытие формы бронирования');
      bookingModal.style.display = 'none';
      bookingModal.classList.remove('modal--open');
      document.body.style.overflow = "";
    });
  }

  bookingModal.addEventListener('click', (e) => {
    if (e.target === bookingModal) {
      bookingModal.style.display = 'none';
      bookingModal.classList.remove('modal--open');
      document.body.style.overflow = "";
    }
  });

  // Очистка
  if (clearBooking) {
    clearBooking.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('🧹 Очистка формы');
      bookingForm.reset();
      if (commentInput) commentInput.value = '';
      if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = tomorrow.toISOString().split('T')[0];
      }
      if (timeInput) timeInput.value = '18:00';
      showToast('Форма очищена');
    });
  }

  // ========== ИСПРАВЛЕННАЯ ОТПРАВКА (ФОРМА ЗАКРЫВАЕТСЯ, УВЕДОМЛЕНИЕ, ОЧИСТКА КОРЗИНЫ) ==========
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('=== НАЧАЛО ОТПРАВКИ ===');

    const name = nameInput?.value.trim();
    const phone = phoneInput?.value.trim();
    const guests = guestsInput?.value || '2';
    const comment = commentInput?.value.trim() || '';
    const date = dateInput?.value;
    const time = timeInput?.value;

    console.log('📋 Данные формы:', { name, phone, guests, comment, date, time });

    // Валидация
    if (!name) {
      showToast('❌ Введите имя');
      return;
    }
    if (!phone) {
      showToast('❌ Введите телефон');
      return;
    }
    if (!date) {
      showToast('❌ Выберите дату');
      return;
    }
    if (!time) {
      showToast('❌ Выберите время');
      return;
    }

    // Блокируем кнопку
    const submitBtn = bookingForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправка...';
    }

    try {
      // Получаем корзину ДО очистки
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

      console.log('🛒 Товары в корзине:', cart);
      console.log('💰 Общая сумма:', total);

      // Данные заказа
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

      // СОХРАНЯЕМ В ИСТОРИЮ (localStorage)
      const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      history.unshift(orderData);
      if (history.length > 30) history.pop();
      localStorage.setItem('orderHistory', JSON.stringify(history));
      console.log('✅ Заказ сохранен в истории');

      // Сохраняем в Firebase если есть
      if (db) {
        try {
          await db.collection('orders').add({
            ...orderData,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          });
          console.log('✅ Заказ сохранен в Firebase');
        } catch (e) {
          console.log('⚠️ Firebase недоступен, сохранено только локально');
        }
      }

      // ===== ВАЖНО: СНАЧАЛА ПОКАЗЫВАЕМ УВЕДОМЛЕНИЕ =====
      showToast('✅ Ваш заказ оформлен!');
      console.log('✅ Уведомление показано');

      // ===== ПОТОМ ОЧИЩАЕМ КОРЗИНУ =====
      localStorage.setItem('cart', '[]');
      console.log('✅ Корзина очищена');
      
      // Обновляем счетчик на всех элементах
      document.querySelectorAll('.cart-count, #cartCount, [data-cart-count]').forEach(el => {
        if (el) {
          el.textContent = '0';
        }
      });
      
      // Обновляем общую сумму если есть
      const cartTotal = document.getElementById('cartTotal');
      if (cartTotal) cartTotal.textContent = '0';
      
      // Очищаем список товаров в корзине если он открыт
      const cartItems = document.getElementById('cartItems');
      if (cartItems) {
        cartItems.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
      }

      // ===== И ТОЛЬКО ПОТОМ ЗАКРЫВАЕМ ФОРМУ =====
      // Даем небольшую задержку, чтобы пользователь увидел уведомление
      setTimeout(() => {
        // ЗАКРЫВАЕМ ФОРМУ БРОНИРОВАНИЯ
        bookingModal.style.display = 'none';
        bookingModal.classList.remove('modal--open');
        document.body.style.overflow = "";
        console.log('✅ Форма бронирования закрыта');

        // ОЧИЩАЕМ ПОЛЯ ФОРМЫ
        bookingForm.reset();
        if (commentInput) commentInput.value = '';
        
        // Восстанавливаем дату по умолчанию
        if (dateInput) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          dateInput.value = tomorrow.toISOString().split('T')[0];
        }
        
        // Восстанавливаем время по умолчанию
        if (timeInput) {
          timeInput.value = '18:00';
        }
        
        // Восстанавливаем количество гостей
        if (guestsInput) {
          guestsInput.value = '2';
        }

        console.log('✅ Форма очищена');
        console.log('=== ОТПРАВКА ЗАВЕРШЕНА УСПЕШНО ===');

        // Разблокируем кнопку после закрытия
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Отправить заявку';
        }
      }, 500); // Задержка полсекунды, чтобы уведомление было видно

    } catch (error) {
      console.error('❌ ОШИБКА ПРИ ОТПРАВКЕ:', error);
      showToast('❌ Ошибка при отправке заявки');
      
      // Разблокируем кнопку в случае ошибки
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить заявку';
      }
    }
  });
  // ========== КОНЕЦ ИСПРАВЛЕННОЙ ОТПРАВКИ ==========
  
  console.log('✅ Бронирование полностью инициализировано');
}

/* ===========================
   ИСТОРИЯ ЗАКАЗОВ
=========================== */
function initHistory() {
  const historyModal = document.getElementById('historyModal');
  const openHistory = document.getElementById('openHistory');
  const openHistoryFooter = document.getElementById('openHistoryFooter');
  const closeHistory = document.getElementById('closeHistory');
  const historyList = document.getElementById('historyList');

  if (!historyModal || !historyList) return;

  function loadHistory() {
    const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    
    if (history.length === 0) {
      historyList.innerHTML = '<p class="no-orders">У вас пока нет заказов</p>';
      return;
    }

    historyList.innerHTML = history.map(order => `
      <div class="history-item">
        <div class="history-date">${new Date(order.timestamp).toLocaleString('ru-RU')}</div>
        <div class="history-name">${order.name} • ${order.phone}</div>
        <div class="history-booking">${order.date} ${order.time} • ${order.guests} чел.</div>
        <div class="history-items">
          ${order.items.map(item => `• ${item.title} — ${item.price} BYN`).join('<br>')}
        </div>
        <div class="history-total">Сумма: ${order.total} BYN</div>
        ${order.comment ? `<div class="history-comment">Комментарий: ${order.comment}</div>` : ''}
      </div>
    `).join('');
  }

  function openHistoryModal() {
    loadHistory();
    historyModal.style.display = 'flex';
    historyModal.classList.add('modal--open');
    document.body.style.overflow = 'hidden';
  }

  if (openHistory) openHistory.addEventListener('click', openHistoryModal);
  if (openHistoryFooter) openHistoryFooter.addEventListener('click', openHistoryModal);

  if (closeHistory) {
    closeHistory.addEventListener('click', () => {
      historyModal.style.display = 'none';
      historyModal.classList.remove('modal--open');
      document.body.style.overflow = '';
    });
  }

  historyModal.addEventListener('click', (e) => {
    if (e.target === historyModal) {
      historyModal.style.display = 'none';
      historyModal.classList.remove('modal--open');
      document.body.style.overflow = '';
    }
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
  console.log('🚀 Запуск инициализации сайта...');
  
  // Добавляем глобальные стили
  addGlobalStyles();
  
  // Инициализация всех модулей
  initBurgerMenu();
  initMenuFilter();
  initCart();
  initProfile();
  initBooking();
  initHistory();
  
  console.log('✅ Сайт полностью загружен и готов к работе');
});

// ===========================
// ОТЛАДОЧНЫЕ ФУНКЦИИ
// ===========================
window.debug = {
  cart: () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    console.log('🛒 Текущая корзина:', cart);
    return cart;
  },
  history: () => {
    const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    console.log('📜 История заказов:', history);
    return history;
  },
  profile: () => {
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');
    console.log('👤 Профиль:', profile);
    return profile;
  },
  clear: () => {
    if (confirm('Очистить все данные?')) {
      localStorage.clear();
      location.reload();
    }
  },
  test: () => {
    showToast('🔔 Тестовое уведомление');
  }
};