
const foods = [
  {
    id: 1,
    name: "Classic Smash Burger",
    category: "Burgers",
    price: 900,
    rating: "4.9",
    badge: "BESTSELLER",
    description: "Juicy beef, melted cheese & signature sauce.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80"
  },
 
  {
    id: 3,
    name: "Margherita Pizza",
    category: "Pizza",
    price: 2000,
    rating: "4.9",
    badge: "FAN FAVORITE",
    description: "Golden crust, fresh mozzarella & basil.",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 4,
    name: "Pepperoni Pizza",
    category: "Pizza",
    price: 2100,
    rating: "4.9",
    badge: "POPULAR",
    description: "Classic pepperoni, melted cheese & herbs.",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 5,
    name: "Crispy Golden Fries",
    category: "Sides",
    price: 200,
    rating: "4.7",
    badge: "CRISPY",
    description: "Golden potato fries with a pinch of seasoning.",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 6,
    name: "Loaded Cheese Fries",
    category: "Sides",
    price: 750,
    rating: "4.8",
    badge: "MUST TRY",
    description: "Crispy fries covered in creamy cheese sauce.",
    image: "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 7,
    name: "Fresh Strawberry Shake",
    category: "Drinks",
    price: 600,
    rating: "4.8",
    badge: "FRESH",
    description: "Creamy strawberry milkshake, served chilled.",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 8,
    name: "Iced Coffee",
    category: "Drinks",
    price: 380,
    rating: "4.7",
    badge: "REFRESHING",
    description: "Smooth iced coffee for your little pick-me-up.",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=80"
  }
];

let selectedCategory = "All";
let cart = [];
let toastTimer;

const foodGrid = document.getElementById("foodGrid");
const foodSearch = document.getElementById("foodSearch");
const emptyMessage = document.getElementById("emptyMessage");
const categoryFilters = document.getElementById("categoryFilters");

const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartItemCount = document.getElementById("cartItemCount");
const cartTotal = document.getElementById("cartTotal");
const checkoutMessage = document.getElementById("checkoutMessage");
const toast = document.getElementById("toast");

// Safe HTML escaping for text inserted into the page.
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function formatPrice(price) {
  return "Rs" + price.toFixed(2);
}

// Render food cards
function renderFoods() {
  const searchTerm = foodSearch.value.trim().toLowerCase();

  const filteredFoods = foods.filter(food => {
    const matchesCategory =
      selectedCategory === "All" ||
      food.category === selectedCategory;

    const matchesSearch =
      food.name.toLowerCase().includes(searchTerm) ||
      food.category.toLowerCase().includes(searchTerm) ||
      food.description.toLowerCase().includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  foodGrid.innerHTML = filteredFoods.map(food => `
    <article class="food-card">
      <div class="food-image">
        <img
          src="${food.image}"
          alt="${escapeHTML(food.name)}"
          loading="lazy"
        >
        <span class="food-badge ${
          food.badge === "POPULAR" || food.badge === "BESTSELLER"
            ? "popular" : ""
        }">${escapeHTML(food.badge)}</span>
      </div>

      <div class="food-card-body">
        <span class="food-category">${escapeHTML(food.category)}</span>
        <h3>${escapeHTML(food.name)}</h3>
        <p class="food-description">${escapeHTML(food.description)}</p>

        <div class="food-rating">★ ${food.rating}
          <span>· Sample rating</span>
        </div>

        <div class="food-meta">
          <span class="food-price">${formatPrice(food.price)}</span>
          <button
            class="add-cart"
            data-add="${food.id}"
            aria-label="Add ${escapeHTML(food.name)} to basket"
          >+</button>
        </div>
      </div>
    </article>
  `).join("");

  emptyMessage.hidden = filteredFoods.length > 0;
}

categoryFilters.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  selectedCategory = button.dataset.category;

  categoryFilters.querySelectorAll(".filter-btn").forEach(filter => {
    const active = filter === button;
    filter.classList.toggle("active", active);
    filter.setAttribute("aria-pressed", String(active));
  });

  renderFoods();
});

foodSearch.addEventListener("input", renderFoods);

document.getElementById("showAllBtn").addEventListener("click", () => {
  selectedCategory = "All";
  foodSearch.value = "";

  categoryFilters.querySelectorAll(".filter-btn").forEach(button => {
    const active = button.dataset.category === "All";
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  renderFoods();
});

// Add food to cart
foodGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (!button) return;

  addToCart(Number(button.dataset.add));
});

function addToCart(foodId) {
  const food = foods.find(item => item.id === foodId);
  if (!food) return;

  const existingItem = cart.find(item => item.id === foodId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...food, quantity: 1 });
  }

  checkoutMessage.textContent = "";
  renderCart();
  showToast(`${food.name} added to your basket!`);
}

// Change quantities or remove items
cartItems.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;
  const item = cart.find(food => food.id === id);

  if (!item) return;

  if (action === "increase") {
    item.quantity += 1;
  } else if (action === "decrease") {
    item.quantity -= 1;

    if (item.quantity <= 0) {
      cart = cart.filter(food => food.id !== id);
    }
  } else if (action === "remove") {
    cart = cart.filter(food => food.id !== id);
  }

  checkoutMessage.textContent = "";
  renderCart();
});

function renderCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  cartCount.textContent = totalItems;
  cartItemCount.textContent = `(${totalItems})`;
  cartTotal.textContent = formatPrice(subtotal);

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <p class="cart-empty">
        Your basket is looking a little hungry.
        Add something delicious!
      </p>
    `;
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${escapeHTML(item.name)}">

      <div class="cart-item-info">
        <h3>${escapeHTML(item.name)}</h3>
        <p>${formatPrice(item.price)} each</p>

        <div class="quantity-control">
          <button data-action="decrease" data-id="${item.id}"
            aria-label="Decrease quantity">−</button>
          <span>${item.quantity}</span>
          <button data-action="increase" data-id="${item.id}"
            aria-label="Increase quantity">+</button>
        </div>

        <button class="cart-remove"
          data-action="remove" data-id="${item.id}">Remove</button>
      </div>

      <strong>${formatPrice(item.price * item.quantity)}</strong>
    </div>
  `).join("");
}

// Open and close cart
function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("show");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("cart-open");
  document.getElementById("cartClose").focus();
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("show");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("cart-open");
  document.getElementById("cartOpen").focus();
}

document.getElementById("cartOpen").addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && cartDrawer.classList.contains("open")) {
    closeCart();
  }
});

// Mobile navigation
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "×" : "☰";
});

navLinks.addEventListener("click", event => {
  if (event.target.closest("a")) {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  }
});

// Demo checkout: no real payment or order is processed.
document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (cart.length === 0) {
    checkoutMessage.textContent = "Please add something to your basket first.";
    return;
  }

  checkoutMessage.textContent =
    "Demo only: connect a backend to submit real orders and process payment.";
});

// Newsletter demo
document.getElementById("newsletterForm").addEventListener("submit", event => {
  event.preventDefault();

  const emailInput = document.getElementById("newsletterEmail");
  const message = document.getElementById("newsletterMessage");

  if (!emailInput.checkValidity()) {
    emailInput.reportValidity();
    return;
  }

  message.textContent =
    "Demo subscription only. Connect a server to save email addresses.";

  emailInput.value = "";
});

// Small toast notification
function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

// Automatically update footer year
document.getElementById("currentYear").textContent =
  new Date().getFullYear();

// Initial page render
renderFoods();
renderCart();

