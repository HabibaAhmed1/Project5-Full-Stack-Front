/* =========================================================
   NATURA — storefront logic
   Product data, rendering, search, cart, favorites, auth
========================================================= */

const PRODUCTS = [
    {
        id: "p1",
        name: "Wildflower Raw Honey",
        category: "Pantry",
        price: 12.5,
        unit: "340g jar",
        icon: "hexagon",
        tint: "#f4e6c8",
        ink: "#8a5a14",
        tag: "Best seller",
        blurb: "Unfiltered, cold-extracted honey from small apiaries."
    },
    {
        id: "p2",
        name: "Cold-Pressed Olive Oil",
        category: "Pantry",
        price: 18,
        unit: "500ml bottle",
        icon: "droplet",
        tint: "#e4ecd4",
        ink: "#4c6b34",
        tag: "Organic",
        blurb: "First press, single estate, bottled within 48 hours."
    },
    {
        id: "p3",
        name: "Toasted Oat Granola",
        category: "Breakfast",
        price: 9.75,
        unit: "450g bag",
        icon: "wheat",
        tint: "#efe4cd",
        ink: "#93641f",
        tag: null,
        blurb: "Slow-toasted oats with maple, seeds and dried fig."
    },
    {
        id: "p4",
        name: "Smooth Almond Butter",
        category: "Pantry",
        price: 11.25,
        unit: "310g jar",
        icon: "circle-dot",
        tint: "#ece2cf",
        ink: "#7a5527",
        tag: null,
        blurb: "Just roasted almonds, stone-ground until silky."
    },
    {
        id: "p5",
        name: "Sparkling Ginger Kombucha",
        category: "Drinks",
        price: 5.5,
        unit: "330ml bottle",
        icon: "citrus",
        tint: "#e6ecda",
        ink: "#5a7a3a",
        tag: "New",
        blurb: "Slow-fermented tea with fresh pressed ginger."
    },
    {
        id: "p6",
        name: "Sun-Dried Fruit Mix",
        category: "Snacks",
        price: 8.25,
        unit: "300g pouch",
        icon: "grape",
        tint: "#f0e3d6",
        ink: "#a1552e",
        tag: null,
        blurb: "Apricot, fig and mulberry, sun-dried with no sulfites."
    },
    {
        id: "p7",
        name: "Loose Leaf Chamomile",
        category: "Drinks",
        price: 7,
        unit: "80g tin",
        icon: "flower-2",
        tint: "#eef0dd",
        ink: "#6b7a3a",
        tag: null,
        blurb: "Whole dried blossoms, hand-picked at peak bloom."
    },
    {
        id: "p8",
        name: "Toasted Coconut Chips",
        category: "Snacks",
        price: 6.5,
        unit: "150g bag",
        icon: "palmtree",
        tint: "#eee6d2",
        ink: "#8a6a1f",
        tag: null,
        blurb: "Thick-cut coconut, lightly toasted and lightly salted."
    },
    {
        id: "p9",
        name: "Tri-Colour Quinoa",
        category: "Pantry",
        price: 10.5,
        unit: "500g bag",
        icon: "wheat",
        tint: "#e7ecd8",
        ink: "#557038",
        tag: "Organic",
        blurb: "White, red and black quinoa, stone-cleaned and dried."
    }
];

const STORAGE = {
    cart: "natura_cart",
    favorites: "natura_favorites",
    user: "natura_user"
};

const state = {
    cart: loadJSON(STORAGE.cart, []),
    favorites: loadJSON(STORAGE.favorites, []),
    user: loadJSON(STORAGE.user, null),
    query: "",
    searchType: "name"
};

function loadJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
        return fallback;
    }
}

function saveJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        /* storage unavailable — fail silently */
    }
}

/* ---------------------------------------------------------
   Rendering — product grid
--------------------------------------------------------- */

function matchesQuery(product, query, type) {
    if (!query) return true;
    const q = query.trim().toLowerCase();
    const field = type === "category" ? product.category : product.name;
    return field.toLowerCase().includes(q);
}

function renderProducts() {
    const container = document.getElementById("productsContainer");
    const empty = document.getElementById("emptyState");
    const list = PRODUCTS.filter(p => matchesQuery(p, state.query, state.searchType));

    container.innerHTML = "";

    if (list.length === 0) {
        empty.classList.remove("hidden");
        return;
    }
    empty.classList.add("hidden");

    list.forEach((product, i) => {
        container.appendChild(buildCard(product, i));
    });

    if (window.lucide) lucide.createIcons();
}

function buildCard(product, index) {
    const isFav = state.favorites.includes(product.id);
    const inCart = state.cart.some(item => item.id === product.id);

    const card = document.createElement("article");
    card.className = "product-card rounded-2xl overflow-hidden flex flex-col";
    card.style.animation = `riseIn 0.6s cubic-bezier(0.16,1,0.3,1) both`;
    card.style.animationDelay = `${Math.min(index, 6) * 0.05}s`;

    card.innerHTML = `
        <div class="product-art h-40 flex items-center justify-center" style="background:${product.tint}">
            ${product.tag ? `
                <span class="absolute mt-[-70px] ml-[-90px] bg-[#fffdf8] text-[10px] font-semibold px-2.5 py-1 rounded-full border border-[#e8eadf]" style="color:${product.ink}">
                    ${product.tag}
                </span>
            ` : ""}
            <i data-lucide="${product.icon}" class="w-12 h-12" style="color:${product.ink}" stroke-width="1.5"></i>
            <button
                class="fav-btn absolute mt-[-70px] ml-[130px] w-8 h-8 rounded-full bg-[#fffdf8]/90 border border-[#e8eadf] flex items-center justify-center text-[#4b5c47] hover:text-[#b97a1f] ${isFav ? "is-active" : ""}"
                data-fav="${product.id}"
                aria-pressed="${isFav}"
                aria-label="Save ${product.name} to favorites"
            >
                <i data-lucide="heart" class="w-4 h-4 pointer-events-none"></i>
            </button>
        </div>

        <div class="p-5 flex flex-col flex-1">
            <div class="flex items-center gap-1.5 text-xs font-medium" style="color:${product.ink}">
                <span class="cat-dot"></span>
                ${product.category}
            </div>

            <h3 class="mt-2 font-serif text-lg text-[#293d39] leading-snug">
                ${product.name}
            </h3>

            <p class="mt-1.5 text-sm text-[#7a8274] leading-6">
                ${product.blurb}
            </p>

            <div class="mt-4 flex items-end justify-between">
                <div>
                    <span class="price-tag text-2xl text-[#344d36]">$${product.price.toFixed(2)}</span>
                    <span class="block text-xs text-[#9aa094] mt-0.5">${product.unit}</span>
                </div>

                <button
                    class="add-btn ${inCart ? "is-added" : ""} inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#4d7d2e] text-white text-sm font-medium hover:bg-[#3e6825]"
                    data-add="${product.id}"
                >
                    <i data-lucide="${inCart ? "check" : "shopping-bag"}" class="w-4 h-4 pointer-events-none"></i>
                    <span class="pointer-events-none">${inCart ? "In cart" : "Add"}</span>
                </button>
            </div>
        </div>
    `;

    return card;
}

/* ---------------------------------------------------------
   Cart & favorites
--------------------------------------------------------- */

function toggleFavorite(id) {
    const idx = state.favorites.indexOf(id);
    if (idx === -1) {
        state.favorites.push(id);
        showToast("Saved to favorites");
    } else {
        state.favorites.splice(idx, 1);
        showToast("Removed from favorites");
    }
    saveJSON(STORAGE.favorites, state.favorites);
    updateCounts();
    renderProducts();
}

function addToCart(id) {
    const existing = state.cart.find(item => item.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        state.cart.push({ id, qty: 1 });
    }
    saveJSON(STORAGE.cart, state.cart);
    updateCounts();
    renderProducts();

    const product = PRODUCTS.find(p => p.id === id);
    showToast(`${product.name} added to bag`);
}

function updateCounts() {
    const cartCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById("cartCount").textContent = cartCount;
    document.getElementById("favoriteCount").textContent = state.favorites.length;
}

/* ---------------------------------------------------------
   Toast
--------------------------------------------------------- */

let toastTimer = null;

function showToast(message) {
    const toast = document.getElementById("toast");
    const label = document.getElementById("toastMessage");
    label.textContent = message;
    toast.classList.remove("toast-hidden");
    toast.classList.add("toast-visible");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("toast-visible");
        toast.classList.add("toast-hidden");
    }, 2200);
}

/* ---------------------------------------------------------
   Auth (lightweight client-side simulation)
--------------------------------------------------------- */

function renderAuthArea() {
    const area = document.getElementById("authArea");

    if (state.user) {
        area.innerHTML = `
            <div class="flex items-center gap-1">
                <span class="hidden sm:inline text-sm text-[#40513e] mr-1">Hi, ${state.user.name}</span>
                <button id="logoutBtn" class="h-9 px-3 rounded-full text-sm font-medium text-[#4b5c47] hover:bg-[#f0f4eb] transition">
                    Logout
                </button>
            </div>
        `;
        document.getElementById("logoutBtn").addEventListener("click", () => {
            state.user = null;
            saveJSON(STORAGE.user, null);
            renderAuthArea();
            showToast("Logged out");
        });
    } else {
        area.innerHTML = `
            <button id="loginBtn" class="h-9 px-3 rounded-full text-sm font-medium text-[#4b5c47] hover:bg-[#f0f4eb] transition">
                Login
            </button>
            <button id="registerBtn" class="h-9 px-4 rounded-full text-sm font-medium bg-[#4d7d2e] text-white hover:bg-[#3e6825] transition">
                Register
            </button>
        `;
        document.getElementById("loginBtn").addEventListener("click", () => openAuthModal("login"));
        document.getElementById("registerBtn").addEventListener("click", () => openAuthModal("register"));
    }
}

function openAuthModal(mode) {
    const modal = document.getElementById("authModal");
    modal.classList.remove("hidden");
    setAuthTab(mode);
    document.getElementById("authName").focus();
}

function closeAuthModal() {
    document.getElementById("authModal").classList.add("hidden");
    document.getElementById("authForm").reset();
}

function setAuthTab(mode) {
    const isLogin = mode === "login";
    document.getElementById("tabLogin").classList.toggle("is-active", isLogin);
    document.getElementById("tabRegister").classList.toggle("is-active", !isLogin);
    document.getElementById("authNameRow").classList.toggle("hidden", isLogin);
    document.getElementById("authSubmit").textContent = isLogin ? "Log in" : "Create account";
    document.getElementById("authForm").dataset.mode = mode;
}

function handleAuthSubmit(e) {
    e.preventDefault();
    const mode = document.getElementById("authForm").dataset.mode;
    const email = document.getElementById("authEmail").value.trim();
    const nameField = document.getElementById("authName").value.trim();
    const name = mode === "register"
        ? (nameField || email.split("@")[0])
        : (email.split("@")[0] || "there");

    state.user = { name, email };
    saveJSON(STORAGE.user, state.user);
    renderAuthArea();
    closeAuthModal();
    showToast(mode === "register" ? "Welcome to Natura" : "Welcome back");
}

/* ---------------------------------------------------------
   Search
--------------------------------------------------------- */

function handleSearch() {
    state.query = document.getElementById("searchInput").value;
    state.searchType = document.getElementById("searchType").value;
    renderProducts();
}

/* ---------------------------------------------------------
   Wire up
--------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    renderProducts();
    renderAuthArea();
    updateCounts();

    document.getElementById("productsContainer").addEventListener("click", (e) => {
        const favBtn = e.target.closest("[data-fav]");
        if (favBtn) {
            toggleFavorite(favBtn.dataset.fav);
            return;
        }
        const addBtn = e.target.closest("[data-add]");
        if (addBtn) {
            addToCart(addBtn.dataset.add);
        }
    });

    document.getElementById("searchBtn").addEventListener("click", handleSearch);
    document.getElementById("searchInput").addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleSearch();
    });
    document.getElementById("searchInput").addEventListener("input", (e) => {
        if (e.target.value === "") handleSearch();
    });

    document.getElementById("tabLogin").addEventListener("click", () => setAuthTab("login"));
    document.getElementById("tabRegister").addEventListener("click", () => setAuthTab("register"));
    document.getElementById("authForm").addEventListener("submit", handleAuthSubmit);
    document.getElementById("closeAuthModal").addEventListener("click", closeAuthModal);
    document.getElementById("authModal").addEventListener("click", (e) => {
        if (e.target.id === "authModal") closeAuthModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAuthModal();
    });
});
