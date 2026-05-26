const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open-menu');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

const orderButtons = document.querySelectorAll('.order-pick');
orderButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const menuName = button.dataset.menu;
    localStorage.setItem('selectedMenu', menuName);
    window.location.href = 'order.html';
  });
});

const orderForm = document.getElementById('orderForm');
const prices = {
  'Spaghetti Bolognese': 21,
  'Carbonara Pasta': 19,
  'Pizza Margherita': 24,
  'Mushroom Risotto': 18,
  'Bomboloni': 9,
  'Triple Gelato': 8,
  'Tiramisu Slice': 10
};

function valueOf(id) {
  const element = document.getElementById(id);
  if (!element) {
    return '';
  }
  return element.value.trim();
}

function setError(id, message) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = message;
  }
}

function markInvalid(id, invalid) {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }
  if (invalid) {
    element.classList.add('invalid-field');
  } else {
    element.classList.remove('invalid-field');
  }
}

function hasNumber(text) {
  const digits = '0123456789';
  for (let index = 0; index < text.length; index += 1) {
    if (digits.includes(text[index])) {
      return true;
    }
  }
  return false;
}

function isOnlyDigits(text) {
  const digits = '0123456789';
  if (text.length === 0) {
    return false;
  }
  for (let index = 0; index < text.length; index += 1) {
    if (!digits.includes(text[index])) {
      return false;
    }
  }
  return true;
}

function selectedService() {
  const checked = document.querySelector('input[name="service"]:checked');
  if (!checked) {
    return '';
  }
  return checked.value;
}

function checkedExtras() {
  return Array.from(document.querySelectorAll('input[name="toppings"]:checked'));
}

function clearErrors() {
  const errorIds = ['serviceError', 'nameError', 'phoneError', 'addressError', 'menuError', 'quantityError', 'paymentError', 'confirmError'];
  errorIds.forEach((id) => setError(id, ''));
  ['customerName', 'phoneNumber', 'deliveryAddress', 'chosenMenu', 'quantity', 'paymentMethod'].forEach((id) => markInvalid(id, false));
}

function updateSummary() {
  if (!orderForm) {
    return;
  }

  const chosenMenu = valueOf('chosenMenu');
  const quantityText = valueOf('quantity');
  let quantity = Number(quantityText);

  if (!Number.isFinite(quantity) || quantity < 1) {
    quantity = 1;
  }

  const extras = checkedExtras();
  let extraTotal = 0;
  const extraNames = [];

  extras.forEach((extra) => {
    extraTotal += Number(extra.dataset.extra);
    extraNames.push(extra.value);
  });

  const basePrice = prices[chosenMenu] || 0;
  const total = (basePrice + extraTotal) * quantity;

  document.getElementById('summaryMenu').textContent = chosenMenu || 'Not selected';
  document.getElementById('summaryQuantity').textContent = String(quantity);
  document.getElementById('summaryExtras').textContent = extraNames.length > 0 ? extraNames.join(', ') : 'None';
  document.getElementById('summaryTotal').textContent = '$' + total.toFixed(2);
}

function toggleAddressBox() {
  const addressBox = document.getElementById('addressBox');
  if (!addressBox) {
    return;
  }

  if (selectedService() === 'Delivery') {
    addressBox.classList.add('show-field');
  } else {
    addressBox.classList.remove('show-field');
    const address = document.getElementById('deliveryAddress');
    if (address) {
      address.value = '';
    }
    setError('addressError', '');
    markInvalid('deliveryAddress', false);
  }
}

function validateOrderForm() {
  clearErrors();
  let valid = true;

  const service = selectedService();
  const name = valueOf('customerName');
  const phone = valueOf('phoneNumber');
  const address = valueOf('deliveryAddress');
  const chosenMenu = valueOf('chosenMenu');
  const quantity = Number(valueOf('quantity'));
  const payment = valueOf('paymentMethod');
  const confirmed = document.getElementById('confirmOrder').checked;

  if (service === '') {
    setError('serviceError', 'Please choose Pick-up or Delivery.');
    valid = false;
  }

  if (name.length < 3) {
    setError('nameError', 'Name must be at least 3 characters.');
    markInvalid('customerName', true);
    valid = false;
  } else if (hasNumber(name)) {
    setError('nameError', 'Name cannot contain numbers.');
    markInvalid('customerName', true);
    valid = false;
  }

  if (!isOnlyDigits(phone)) {
    setError('phoneError', 'Phone number must contain numbers only.');
    markInvalid('phoneNumber', true);
    valid = false;
  } else if (phone.length < 8 || phone.length > 15) {
    setError('phoneError', 'Phone number must be 8 to 15 digits.');
    markInvalid('phoneNumber', true);
    valid = false;
  }

  if (service === 'Delivery' && address.length < 10) {
    setError('addressError', 'Delivery address must be at least 10 characters.');
    markInvalid('deliveryAddress', true);
    valid = false;
  }

  if (chosenMenu === '') {
    setError('menuError', 'Please choose one menu item.');
    markInvalid('chosenMenu', true);
    valid = false;
  }

  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 10) {
    setError('quantityError', 'Quantity must be between 1 and 10.');
    markInvalid('quantity', true);
    valid = false;
  }

  if (payment === '') {
    setError('paymentError', 'Please choose a payment method.');
    markInvalid('paymentMethod', true);
    valid = false;
  }

  if (!confirmed) {
    setError('confirmError', 'Please confirm your order information.');
    valid = false;
  }

  return valid;
}

if (orderForm) {
  const chosenMenuInput = document.getElementById('chosenMenu');
  const savedMenu = localStorage.getItem('selectedMenu');

  if (savedMenu && chosenMenuInput) {
    chosenMenuInput.value = savedMenu;
    localStorage.removeItem('selectedMenu');
  }

  orderForm.addEventListener('input', updateSummary);
  orderForm.addEventListener('change', () => {
    toggleAddressBox();
    updateSummary();
  });

  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const successMessage = document.getElementById('successMessage');

    if (validateOrderForm()) {
      successMessage.textContent = 'Thank you! Your order has been received by Mamma Mia Ristorante.';
      orderForm.reset();
      toggleAddressBox();
      updateSummary();
    } else {
      successMessage.textContent = '';
    }
  });

  toggleAddressBox();
  updateSummary();
}
