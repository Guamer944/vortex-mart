/* =========================================
   1. LANGUAGE CONFIGURATION
   ========================================= */
let currentLang = 'en'; // Default language

const translations = {
    en: {
        cart: "Cart",
        deals_title: "Exclusive Deals",
        bundle_tag: "BUNDLE",
        promo1_title: "Starter Pack",
        promo1_desc: "Buy any 3 pencils & get a free eraser.",
        sale_tag: "SALE",
        promo2_title: "Used Tech",
        promo2_desc: "Calculators are 15% off this week only.",
        cash_title: "Cash Accepted",
        cash_desc: "Select \"Cash\" at checkout and pay in person.",
        inventory_title: "Inventory",
        inventory_sub: "Quality student goods, delivered to you.",
        back_btn: "Back to Store",
        add_cart: "Add to Cart",
        your_cart: "Your Cart",
        cart_empty: "Your cart is empty.",
        clear_all: "Clear All",
        full_name: "Full Name (Required)",
        payment_method: "Payment Method",
        cash: "Cash",
        place_cash_order: "Place Cash Order",
        search_placeholder: "Search inventory...",
        view_btn: "View",
        choose_option: "Choose Option",
        remove: "Remove"
    },
    fr: {
        cart: "Panier",
        deals_title: "Offres Exclusives",
        bundle_tag: "PAQUET",
        promo1_title: "Kit de Départ",
        promo1_desc: "Achetez 3 crayons, obtenez une gomme gratuite.",
        sale_tag: "SOLDE",
        promo2_title: "Technologie",
        promo2_desc: "Calculatrices à -15% cette semaine seulement.",
        cash_title: "Argent Comptant",
        cash_desc: "Sélectionnez \"Argent\" à la caisse et payez en personne.",
        inventory_title: "Inventaire",
        inventory_sub: "Produits étudiants de qualité.",
        back_btn: "Retour au Magasin",
        add_cart: "Ajouter au Panier",
        your_cart: "Votre Panier",
        cart_empty: "Votre panier est vide.",
        clear_all: "Tout Effacer",
        full_name: "Nom Complet (Requis)",
        payment_method: "Mode de Paiement",
        cash: "Argent",
        place_cash_order: "Commander (Payer en personne)",
        search_placeholder: "Rechercher...",
        view_btn: "Voir",
        choose_option: "Choisir une option",
        remove: "Retirer"
    }
};

/* =========================================
   2. PRODUCT DATA (Bilingual)
   ========================================= */
const products = [
    { 
        id: 1, 
        name: { en: "Articulated Dragon", fr: "Dragon Articulé" }, 
        category: { en: "3D Print", fr: "Impression 3D" }, 
        price: 15.00, 
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuKZZ03oQzHaAx5AOVfZ-W7BPGKGClv_ahGw&s",
        desc: { en: "A fully flexible 3D printed dragon.", fr: "Dragon imprimé en 3D entièrement flexible." },
        variants: { name: { en: "Color", fr: "Couleur" }, options: { en: ["Red", "Blue", "Green"], fr: ["Rouge", "Bleu", "Vert"] } }
    },
    { 
        id: 2, 
        name: { en: "Pop-it", fr: "Pop-it" }, 
        category: { en: "Toys", fr: "Jouets" }, 
        price: 10.00, 
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-9juUSHat1wMnDI4TGx0iBVb3Vk0xKIkWYA&s",
        desc: { en: "Silicone fidget toy.", fr: "Jouet en silicone." },
        variants: null
    },
    { 
        id: 3, 
        // 🍌 THE SECRET BANANA 🍌
        name: { en: "A Single Banana", fr: "Une Seule Banane" }, 
        category: { en: "Rare", fr: "Rare" }, 
        price: 1000.00, 
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6K7ukGLhKcvBY8CeyLiTfjKCX0i8lwM4zSg&s",
        desc: { en: "Buy it. Dare to dream.", fr: "Achete le. Osez rêver." },
        variants: { name: { en: "Type", fr: "Type" }, options: { en: ["Standard"], fr: ["Standard"] } }
    },
    { 
        id: 4, 
        name: { en: "Fidget Spinner", fr: "Fidget Spinner" }, 
        category: { en: "3D Print", fr: "Impression 3D" }, 
        price: 5.00, 
        image: "https://placehold.co/600x400/111/fff?text=Spinner",
        desc: { en: "High speed bearing fidget spinner.", fr: "Roulement à haute vitesse." },
        variants: { name: { en: "Color", fr: "Couleur" }, options: { en: ["Black", "White"], fr: ["Noir", "Blanc"] } }
    },
    { 
        id: 5, 
        name: { en: "Graphing Calc", fr: "Calculatrice Graphique" }, 
        category: { en: "Tech", fr: "Techno" }, 
        price: 40.00, 
        image: "https://placehold.co/600x400/111/fff?text=Calc",
        desc: { en: "Used TI-84 Plus. Working.", fr: "TI-84 Plus usagée. Fonctionnelle." },
        variants: null
    },
    { 
        id: 6, 
        name: { en: "Mystery Box", fr: "Boîte Mystère" }, 
        category: { en: "Bundle", fr: "Paquet" }, 
        price: 8.00, 
        image: "https://placehold.co/600x400/111/fff?text=Mystery",
        desc: { en: "A box containing 3 random used toys.", fr: "Une boîte contenant 3 jouets usagés aléatoires." },
        variants: null
    },
];

let cart = [];
let currentProduct = null;
let selectedVariant = null;

// DOM Elements
const grid = document.getElementById('productGrid');
const cartModal = document.getElementById('cartModal');
const cartCount = document.getElementById('cartCount');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutForm = document.getElementById('checkoutForm');
const productPage = document.getElementById('product-page-overlay');

// Initialize
async function init() {
    updateTextLanguage(); 
    renderProducts(products);
    
    try {
        const res = await fetch('/api/config/paypal');
        if (!res.ok) throw new Error("Server error");
        
        const clientId = await res.text();
        if (clientId && clientId.length > 10) {
            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
            script.onload = setupPayPal;
            document.head.appendChild(script);
        }
    } catch (e) { console.error("PayPal failed to load:", e); }
}

/* =========================================
   LANGUAGE & RENDER
   ========================================= */
function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'fr' : 'en';
    document.getElementById('currentLangDisplay').innerText = currentLang.toUpperCase();
    updateTextLanguage();
    renderProducts(products);
    updateCart();
}

function updateTextLanguage() {
    const elements = document.querySelectorAll('[data-lang]');
    elements.forEach(el => {
        const key = el.getAttribute('data-lang');
        if (translations[currentLang][key]) el.innerText = translations[currentLang][key];
    });
    document.getElementById('searchInput').placeholder = translations[currentLang].search_placeholder;
    document.getElementById('customerName').placeholder = currentLang === 'fr' ? "ex: Jean Dupont" : "e.g. John Smith";
}

function renderProducts(items) {
    grid.innerHTML = items.map(p => `
        <div class="product-card" onclick="openProductPage(${p.id})">
            <img src="${p.image}" class="product-img" alt="${p.name[currentLang]}">
            <div class="product-info">
                <div class="product-cat">${p.category[currentLang]}</div>
                <div class="product-name">${p.name[currentLang]}</div>
                <div class="product-footer">
                    <div class="price">$${p.price.toFixed(2)}</div>
                    <button class="view-btn">${translations[currentLang].view_btn}</button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterProducts() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    renderProducts(products.filter(p => p.name[currentLang].toLowerCase().includes(term)));
}

/* =========================================
   PRODUCT PAGE & CART
   ========================================= */
function openProductPage(id) {
    const p = products.find(prod => prod.id === id);
    currentProduct = p;
    selectedVariant = null;

    document.getElementById('detail-img').src = p.image;
    document.getElementById('detail-cat').innerText = p.category[currentLang];
    document.getElementById('detail-title').innerText = p.name[currentLang];
    document.getElementById('detail-price').innerText = `$${p.price.toFixed(2)}`;
    document.getElementById('detail-desc').innerText = p.desc[currentLang];

    const variantSection = document.getElementById('variant-section');
    const variantContainer = document.getElementById('variant-options-container');
    const variantLabel = document.getElementById('variant-label');

    variantContainer.innerHTML = '';

    if (p.variants) {
        variantSection.style.display = 'block';
        variantLabel.innerText = `${translations[currentLang].choose_option} (${p.variants.name[currentLang]}):`;
        const options = p.variants.options[currentLang]; 
        options.forEach((opt, index) => {
            const btn = document.createElement('div');
            btn.className = 'v-btn';
            btn.innerText = opt;
            btn.onclick = () => selectVariant(opt, btn);
            if (index === 0) selectVariant(opt, btn);
            variantContainer.appendChild(btn);
        });
    } else {
        variantSection.style.display = 'none';
        selectedVariant = 'Standard';
    }
    productPage.classList.remove('hidden');
}

function selectVariant(option, btnElement) {
    selectedVariant = option;
    document.querySelectorAll('.v-btn').forEach(b => b.classList.remove('selected'));
    btnElement.classList.add('selected');
}

function closeProductPage() {
    productPage.classList.add('hidden');
    currentProduct = null;
}

// 🛒 ADD ITEM AT FULL PRICE INITIALLY
function addItemFromPage() {
    if (!currentProduct) return;
    
    const cartItem = {
        id: currentProduct.id,
        name: currentProduct.name[currentLang],
        price: currentProduct.price, // Add at NORMAL PRICE ($1000)
        variantSelected: selectedVariant,
        image: currentProduct.image
    };

    cart.push(cartItem);
    updateCart();
    
    const addedText = currentLang === 'fr' ? "ajouté au panier!" : "added to cart!";
    showToast(`${cartItem.name} ${addedText}`);
    closeProductPage();
}

function removeFromCart(idx) {
    cart.splice(idx, 1);
    updateCart();
}

function clearCart() {
    if(cart.length === 0) return;
    if(confirm(currentLang === 'fr' ? "Tout effacer?" : "Remove all items?")) {
        cart = [];
        updateCart();
    }
}

function updateCart() {
    cartCount.innerText = cart.length;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<div class="empty-state">${translations[currentLang].cart_empty}</div>`;
        cartTotalEl.innerText = "$0.00";
        checkoutForm.style.display = 'none';
    } else {
        const total = cart.reduce((sum, i) => sum + i.price, 0);
        cartTotalEl.innerText = `$${total.toFixed(2)}`;
        
        cartItemsContainer.innerHTML = cart.map((item, idx) => `
            <div class="cart-item">
                <div>
                    <strong>${item.name}</strong>
                    <div style="font-size:0.8rem; color:#666;">
                        ${item.variantSelected !== 'Standard' ? item.variantSelected + ' | ' : ''} 
                        $${item.price.toFixed(2)}
                    </div>
                </div>
                <span class="remove-link" onclick="removeFromCart(${idx})">${translations[currentLang].remove}</span>
            </div>
        `).join('');
        
        checkoutForm.style.display = 'block';
    }
}

/* =========================================
   SECRET PRIZE CHECKER
   ========================================= */
async function checkForSecretPrize() {
    // Look for the Banana (ID 3)
    const bananaIndex = cart.findIndex(item => item.id === 3);
    
    if (bananaIndex !== -1) {
        try {
            // Ask server if prize is available
            const res = await fetch('/api/claim-banana', { method: 'POST' });
            const data = await res.json();
            
            if (data.success) {
                // Apply Discount Locally
                cart[bananaIndex].price = 2.00;
                cart[bananaIndex].name += " (WINNER!)";
                updateCart(); // Refresh view
                alert(currentLang === 'fr' ? "🍌 FÉLICITATIONS! Vous avez gagné le prix secret! Le prix est maintenant 2$." : "🍌 CONGRATS! You won the secret prize! Price dropped to $2.");
                return true;
            }
        } catch (e) {
            console.error("Prize check failed", e);
        }
    }
    return false;
}

/* =========================================
   CHECKOUT LOGIC
   ========================================= */
function toggleCart() {
    const isHidden = cartModal.style.display === 'none' || cartModal.style.display === '';
    cartModal.style.display = isHidden ? 'flex' : 'none';
}

function showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function togglePaymentUI() {
    const mode = document.querySelector('input[name="payment"]:checked').value;
    const cashBtn = document.getElementById('cashBtn');
    const ppContainer = document.getElementById('paypal-btn-container');

    if (mode === 'cash') {
        cashBtn.style.display = 'block';
        ppContainer.style.display = 'none';
    } else {
        cashBtn.style.display = 'none';
        ppContainer.style.display = 'block';
    }
}

// 💵 CASH CHECKOUT HANDLER
async function processCashOrder() {
    const name = document.getElementById('customerName').value.trim();
    if (!name) {
        alert(translations[currentLang].full_name);
        return;
    }

    const btn = document.getElementById('cashBtn');
    btn.disabled = true;
    btn.innerText = "Processing...";

    // 1. CHECK FOR SECRET PRIZE RIGHT NOW
    await checkForSecretPrize();

    // 2. Calculate final total
    const total = cart.reduce((sum, i) => sum + i.price, 0).toFixed(2);

    try {
        const formattedItems = cart.map(item => ({
            name: `${item.name} (${item.variantSelected})`,
            price: item.price
        }));

        const res = await fetch('/api/notify-owner', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                customerName: name,
                paymentMethod: 'CASH',
                amount: total,
                items: formattedItems
            })
        });

        if (res.ok) {
            const successMsg = currentLang === 'fr' ? "Commande placée! Veuillez payer en personne." : "Order Placed! Please pay in person.";
            alert(successMsg);
            cart = [];
            updateCart();
            toggleCart();
        } else {
            alert("Error: Server failed");
        }
    } catch (error) {
        alert("Network Error");
    } finally {
        btn.disabled = false;
        btn.innerText = translations[currentLang].place_cash_order;
    }
}

// 💳 PAYPAL CHECKOUT HANDLER
function setupPayPal() {
    if (!window.paypal) return;
    
    paypal.Buttons({
        onClick: async (data, actions) => {
            const name = document.getElementById('customerName').value.trim();
            if (!name) {
                alert(translations[currentLang].full_name);
                return actions.reject();
            }
            // 1. CHECK FOR SECRET PRIZE RIGHT NOW
            await checkForSecretPrize();
            return actions.resolve();
        },
        createOrder: (data, actions) => {
            // 2. Total is recalculated with potential prize price
            const total = cart.reduce((sum, i) => sum + i.price, 0).toFixed(2);
            return actions.order.create({
                purchase_units: [{
                    amount: { value: total },
                    description: "VortexMart Purchase"
                }]
            });
        },
        onApprove: (data, actions) => {
            return actions.order.capture().then(async (details) => {
                const name = document.getElementById('customerName').value;
                const formattedItems = cart.map(item => ({
                    name: `${item.name} (${item.variantSelected})`,
                    price: item.price
                }));

                await fetch('/api/notify-owner', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        customerName: name,
                        paymentMethod: 'PAYPAL',
                        amount: details.purchase_units[0].amount.value,
                        items: formattedItems
                    })
                });
                alert("Payment Successful!");
                cart = [];
                updateCart();
                toggleCart();
            });
        }
    }).render('#paypal-btn-container');
}

init();