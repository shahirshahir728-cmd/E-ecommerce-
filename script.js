const products = [
  {
    id: 1,
    name: "Aura Wireless Headphones",
    category: "Audio",
    label: "BESTSELLER",
    description: "Your own little world, in beautiful sound.",
    price: 129,
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 2,
    name: "Mini Boom Speaker",
    category: "Audio",
    label: "NEW",
    description: "Pocket-sized speaker. Surprisingly big energy.",
    price: 69,
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 3,
    name: "Tempo Smartwatch",
    category: "Wearables",
    label: "",
    description: "A little nudge toward feeling your best.",
    price: 159,
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 4,
    name: "Everyday Earbuds",
    category: "Audio",
    label: "GOOD PICK",
    description: "All-day comfort, all-day soundtrack.",
    price: 89,
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 5,
    name: "Glow Desk Lamp",
    category: "Desk",
    label: "",
    description: "The right light for late-night ideas.",
    price: 74,
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 6,
    name: "Magnetic Power Bank",
    category: "Power",
    label: "TRAVEL READY",
    description: "A little extra juice, wherever you wander.",
    price: 49,
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 7,
    name: "Focus Mechanical Keyboard",
    category: "Desk",
    label: "",
    description: "A satisfying click for every bright idea.",
    price: 119,
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 8,
    name: "Daybreak Smartwatch",
    category: "Wearables",
    label: "LOW STOCK",
    description: "Thoughtful tracking, without the fuss.",
    price: 139,
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=700&q=80"
  }
];

const cart = new Map();
const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("productSearch");
const emptyState = document.getElementById("emptyState");
const cartToast = bootstrap.Toast.getOrCreateInstance(document.getElementById("cartToast"), { delay: 2200 });
let activeFilter = "All";

function money(amount) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function renderProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const visibleProducts = products.filter((product) => {
    const matchesCategory = activeFilter === "All" || product.category === activeFilter;
    const matchesSearch = `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  productGrid.innerHTML = visibleProducts.map((product) => `
    <div class="col">
      <article class="product-card">
        <div class="product-image-wrap">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          ${product.label ? `<span class="product-badge ${product.label === "NEW" ? "sale" : ""}">${product.label}</span>` : ""}
          <button class="wishlist-button" type="button" aria-label="Add ${product.name} to wishlist" aria-pressed="false"><i class="bi bi-heart"></i></button>
        </div>
        <div class="product-details">
          <div class="product-meta"><span>${product.category}</span><span class="product-rating">★ ${product.rating} <span class="text-secondary">(24)</span></span></div>
          <h3>${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <div class="product-buy-row"><span class="product-price">${money(product.price)}</span><button class="add-button" type="button" data-product-id="${product.id}"><i class="bi bi-plus-lg"></i> Add to bag</button></div>
        </div>
      </article>
    </div>
  `).join("");

  emptyState.classList.toggle("d-none", visibleProducts.length > 0);
}

function renderCart() {
  const cartItems = document.getElementById("cartItems");
  const cartEmpty = document.getElementById("cartEmpty");
  const cartFooter = document.getElementById("cartFooter");
  const count = [...cart.values()].reduce((total, item) => total + item.quantity, 0);
  const subtotal = [...cart.values()].reduce((total, item) => total + item.product.price * item.quantity, 0);

  document.getElementById("cartCount").textContent = count;
  document.getElementById("cartTitleCount").textContent = `(${count})`;
  document.getElementById("cartSubtotal").textContent = money(subtotal);
  cartEmpty.classList.toggle("d-none", count > 0);
  cartFooter.classList.toggle("d-none", count === 0);
  cartItems.innerHTML = [...cart.values()].map(({ product, quantity }) => `
    <div class="cart-item">
      <img src="${product.image}" alt="">
      <div>
        <h3>${product.name}</h3>
        <span>${money(product.price)}</span>
        <div class="quantity-control" aria-label="Quantity for ${product.name}">
          <button type="button" data-cart-action="decrease" data-product-id="${product.id}" aria-label="Decrease quantity">−</button>
          <span>${quantity}</span>
          <button type="button" data-cart-action="increase" data-product-id="${product.id}" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <button class="remove-item" type="button" data-cart-action="remove" data-product-id="${product.id}" aria-label="Remove ${product.name}"><i class="bi bi-trash3"></i></button>
    </div>
  `).join("");
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  const current = cart.get(productId);
  cart.set(productId, { product, quantity: current ? current.quantity + 1 : 1 });
  renderCart();
  document.getElementById("toastMessage").textContent = `${product.name} added to your bag.`;
  cartToast.show();
}

document.querySelectorAll(".filter-pill").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll(".filter-pill").forEach((pill) => pill.classList.toggle("active", pill === button));
    renderProducts();
  });
});

document.querySelectorAll(".category-card").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.category;
    document.querySelectorAll(".filter-pill").forEach((pill) => pill.classList.toggle("active", pill.dataset.filter === activeFilter));
    renderProducts();
    document.getElementById("products").scrollIntoView({ behavior: "smooth" });
  });
});

searchInput.addEventListener("input", renderProducts);

document.querySelector(".search-toggle").addEventListener("click", () => {
  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
  searchInput.focus({ preventScroll: true });
});

document.getElementById("viewAllLink").addEventListener("click", (event) => {
  event.preventDefault();
  activeFilter = "All";
  searchInput.value = "";
  document.querySelectorAll(".filter-pill").forEach((pill) => pill.classList.toggle("active", pill.dataset.filter === "All"));
  renderProducts();
});

document.getElementById("clearFilters").addEventListener("click", () => {
  activeFilter = "All";
  searchInput.value = "";
  document.querySelectorAll(".filter-pill").forEach((pill) => pill.classList.toggle("active", pill.dataset.filter === "All"));
  renderProducts();
});

productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-product-id]");
  if (addButton && addButton.classList.contains("add-button")) {
    addToCart(Number(addButton.dataset.productId));
    return;
  }

  const wishlistButton = event.target.closest(".wishlist-button");
  if (wishlistButton) {
    const saved = wishlistButton.getAttribute("aria-pressed") !== "true";
    wishlistButton.setAttribute("aria-pressed", String(saved));
    wishlistButton.classList.toggle("is-saved", saved);
    wishlistButton.innerHTML = `<i class="bi bi-heart${saved ? "-fill" : ""}"></i>`;
  }
});

document.getElementById("cartItems").addEventListener("click", (event) => {
  const button = event.target.closest("[data-cart-action]");
  if (!button) return;

  const productId = Number(button.dataset.productId);
  const item = cart.get(productId);
  if (!item) return;

  if (button.dataset.cartAction === "remove" || (button.dataset.cartAction === "decrease" && item.quantity === 1)) {
    cart.delete(productId);
  } else if (button.dataset.cartAction === "decrease") {
    item.quantity -= 1;
  } else if (button.dataset.cartAction === "increase") {
    item.quantity += 1;
  }
  renderCart();
});

document.getElementById("checkoutButton").addEventListener("click", () => {
  document.getElementById("toastMessage").textContent = "Checkout is coming soon. Thanks for shopping VOLT!";
  cartToast.show();
});

document.getElementById("newsletterForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const message = document.getElementById("newsletterMessage");
  message.textContent = "You're on the list. Keep an eye on your inbox!";
  message.setAttribute("role", "status");
  event.currentTarget.reset();
});

renderProducts();
renderCart();
