"use strict";

// The sample menu.
const products = [
  {
    id: "rustic",
    name: "Rustic loaf",
    category: "bread",
    description: "Crusty bread for soups or sandwiches."
  },
  {
    id: "sandwich",
    name: "Sandwich bread",
    category: "bread",
    description: "A soft loaf for breakfast and lunch."
  },
  {
    id: "croissant",
    name: "Croissant",
    category: "pastry",
    description: "A flaky option for a morning treat."
  },
  {
    id: "sweet",
    name: "Sweet pastries",
    category: "pastry",
    description: "A selection to share with family and friends."
  }
];

// IDs of products the visitor has saved.
let favorites = [];

const storageKeys = {
  favorites: "northStar.favorites",
  category: "northStar.category"
};

let storageAvailable = true;

// Read saved data safely.
function readStored(key, fallback) {
  try {
    const saved = localStorage.getItem(key);

    return saved === null ? fallback : JSON.parse(saved);
  } catch (error) {
    storageAvailable = false;
    return fallback;
  }
}

// Save data safely.
function saveStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    storageAvailable = false;
  }

  showStorageStatus();
}

function showStorageStatus() {
  const status = document.querySelector("#storage-status");

  if (!status) return;

  status.textContent = storageAvailable
    ? "Your favorites and filter are saved in this browser."
    : "Browser storage is unavailable. Your choices may not be remembered.";
}

// Add or remove a favorite.
function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(item => item !== id);
  } else {
    favorites.push(id);
  }

  saveStored(storageKeys.favorites, favorites);
  renderProducts();
}

// Display products that match the selected category.
function renderProducts() {
  const list = document.querySelector("#product-list");
  const category = document.querySelector("#category");

  if (!list || !category) return;

  list.replaceChildren();

  const matchingProducts = products.filter(product => {
    return category.value === "all" ||
      product.category === category.value;
  });

  matchingProducts.forEach(product => {
    const card = document.createElement("article");
    card.className = "menu-item";

    const heading = document.createElement("h3");
    heading.textContent = product.name;

    const description = document.createElement("p");
    description.textContent = product.description;

    const button = document.createElement("button");
    button.type = "button";

    const isSaved = favorites.includes(product.id);

    button.textContent = isSaved
      ? "Remove from favorites"
      : "Save favorite";

    button.setAttribute("aria-pressed", String(isSaved));

    button.setAttribute(
      "aria-label",
      `${isSaved ? "Remove" : "Save"} ${product.name} ` +
      `${isSaved ? "from" : "to"} favorites`
    );

    button.addEventListener("click", () => {
      toggleFavorite(product.id);
    });

    card.append(heading, description, button);
    list.append(card);
  });

  updateSummary();
}

// Show the names and number of saved products.
function updateSummary() {
  const summary = document.querySelector("#favorite-summary");

  const savedNames = products
    .filter(product => favorites.includes(product.id))
    .map(product => product.name);

  if (savedNames.length === 0) {
    summary.textContent =
      "No favorites saved yet. Choose something you would like to try.";
  } else {
    summary.textContent =
      `Saved favorites (${savedNames.length}): ` +
      savedNames.join(", ") + ".";
  }
}

// Restore saved choices when the page opens.
function setupProducts() {
  const category = document.querySelector("#category");

  // Other pages may not contain the product finder.
  if (!category) return;

  const storedFavorites = readStored(storageKeys.favorites, []);

  if (Array.isArray(storedFavorites)) {
    favorites = [
      ...new Set(
        storedFavorites.filter(id => {
          return products.some(product => product.id === id);
        })
      )
    ];
  }

  const storedCategory = readStored(storageKeys.category, "all");

  const allowedCategories = ["all", "bread", "pastry"];

  category.value = allowedCategories.includes(storedCategory)
    ? storedCategory
    : "all";

  category.addEventListener("change", () => {
    saveStored(storageKeys.category, category.value);
    renderProducts();
  });

  renderProducts();
  showStorageStatus();
}

setupProducts();
