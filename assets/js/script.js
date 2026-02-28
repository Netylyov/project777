// БУРГЕР-МЕНЮ
const burgerBtn = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (burgerBtn && mobileMenu) {
  burgerBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.style.display === 'block';
    mobileMenu.style.display = isOpen ? 'none' : 'block';
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.style.display = 'none';
    });
  });
}

// МОДАЛКА БРОНИ
const bookingModal = document.getElementById('bookingModal');
const openBooking = document.getElementById('openBooking');
const openBookingHero = document.getElementById('openBookingHero');
const closeBooking = document.getElementById('closeBooking');
const bookingForm = document.getElementById('booking-form');
const clearBooking = document.getElementById('clearBooking');
const guestsSelect = document.getElementById('guests');

// Заполняем количество гостей
if (guestsSelect) {
  guestsSelect.innerHTML = '';
  for (let i = 1; i <= 12; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${i} гость${i === 1 ? '' : i < 5 ? 'я' : 'ей'}`;
    guestsSelect.appendChild(opt);
  }
}

function openBookingModal() {
  if (bookingModal) bookingModal.style.display = 'flex';
}

function closeBookingModal() {
  if (bookingModal) bookingModal.style.display = 'none';
}

if (openBooking) openBooking.addEventListener('click', openBookingModal);
if (openBookingHero) openBookingHero.addEventListener('click', openBookingModal);
if (closeBooking) closeBooking.addEventListener('click', closeBookingModal);

if (bookingModal) {
  bookingModal.addEventListener('click', (e) => {
    if (e.target === bookingModal) closeBookingModal();
  });
}

// Очистка формы
if (clearBooking && bookingForm) {
  clearBooking.addEventListener('click', () => {
    bookingForm.reset();
  });
}

// ОТПРАВКА БРОНИ (ФРОНТОВАЯ ЛОГИКА)
if (bookingForm) {
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    const date = document.getElementById('date')?.value;
    const time = document.getElementById('time')?.value;
    const guests = document.getElementById('guests')?.value;
    const comment = document.getElementById('comment')?.value.trim();

    if (!name || !phone || !date || !time || !guests) {
      alert('Пожалуйста, заполните все обязательные поля.');
      return;
    }

    // Здесь ДОЛЖЕН быть реальный backend.
    // На GitHub Pages backend не работает, поэтому просто логируем.
    const payload = { name, phone, date, time, guests, comment };
    console.log('Заявка на бронь:', payload);

    alert('Заявка отправлена! Мы свяжемся с вами для подтверждения.');
    bookingForm.reset();
    closeBookingModal();
  });
}

// КОРЗИНА (минимальный функционал, чтобы не падало)
const openCart = document.getElementById('openCart');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');

function openCartModal() {
  if (cartModal) cartModal.style.display = 'flex';
}
function closeCartModal() {
  if (cartModal) cartModal.style.display = 'none';
}

if (openCart) openCart.addEventListener('click', openCartModal);
if (closeCart) closeCart.addEventListener('click', closeCartModal);
if (cartModal) {
  cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) closeCartModal();
  });
}

// ИСТОРИЯ ЗАКАЗОВ (заглушка, чтобы не ломалось)
const openHistory = document.getElementById('openHistory');
const historyModal = document.getElementById('historyModal');
const closeHistory = document.getElementById('closeHistory');

function openHistoryModal() {
  if (historyModal) historyModal.style.display = 'flex';
}
function closeHistoryModal() {
  if (historyModal) historyModal.style.display = 'none';
}

if (openHistory) openHistory.addEventListener('click', openHistoryModal);
if (closeHistory) closeHistory.addEventListener('click', closeHistoryModal);
if (historyModal) {
  historyModal.addEventListener('click', (e) => {
    if (e.target === historyModal) closeHistoryModal();
  });
}
