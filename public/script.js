/* =========================================
   PRODUCT CONFIGURATION
   ========================================= */
const products = [
    { id: 1, name: "Articulated Dragon", category: "3D Print", price: 8.00, image: "https://placehold.co/400x300/111/fff?text=Dragon" },
    { id: 2, name: "Pop It", category: "Toys", price: 5.00, image: "https://placehold.co/400x300/111/fff?text=POP-IT" },
    { id: 3, name: "School Hoodie", category: "Apparel", price: 25.00, image: "https://placehold.co/400x300/111/fff?text=Hoodie" },
    { id: 4, name: "Fidget Spinner", category: "3D Print", price: 5.00, image: "https://placehold.co/400x300/111/fff?text=Spinner" },
    { id: 5, name: "Graphing Calc", category: "Tech", price: 40.00, image: "https://placehold.co/400x300/111/fff?text=Calc" },
    { id: 6, name: "Mystery Box", category: "Bundle", price: 8.00, image: "https://placehold.co/400x300/111/fff?text=Mystery" },
];

let cart = [];

// DOM Elements
const grid = document.getElementById('productGrid');
const cartModal = document.getElementById('cartModal');
const cartCount = document.getElementById('cartCount');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutForm = document.getElementById('checkoutForm');

// Initialize
async function init() {
    renderProducts(products);
    try {
        const res = await fetch('/api/config/paypal');
        const clientId = await res.text();
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
        script.onload = setupPayPal;
        document.head.appendChild(script);
    } catch (e) { console.error("PayPal config missing", e); }
}

// Render Products
function renderProducts(items) {
    grid.innerHTML = items.map(p => `
        <div class="product-card">
            <img src="${p.image}" class="product-img" alt="${p.name}">
            <div class="product-info">
                <div class="product-cat">${p.category}</div>
                <div class="product-name">${p.name}</div>
                <div class="product-footer">
                    <div class="price">$${p.price.toFixed(2)}</div>
                    <button class="add-btn" onclick="addToCart(${p.id})">Add</button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterProducts() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    renderProducts(products.filter(p => p.name.toLowerCase().includes(term)));
}

// Cart Logic
function addToCart(id) {
    cart.push(products.find(p => p.id === id));
    updateCart();
    // Optional: Visual feedback
    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = "Added!";
    setTimeout(() => btn.innerText = originalText, 1000);
}

function removeFromCart(idx) {
    cart.splice(idx, 1);
    updateCart();
}

function updateCart() {
    cartCount.innerText = cart.length;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-state">Cart is empty.</div>';
        cartTotalEl.innerText = "$0.00";
        checkoutForm.style.display = 'none';
    } else {
        const total = cart.reduce((sum, i) => sum + i.price, 0);
        cartTotalEl.innerText = `$${total.toFixed(2)}`;
        
        cartItemsContainer.innerHTML = cart.map((item, idx) => `
            <div class="cart-item">
                <div>
                    <strong>${item.name}</strong>
                    <div style="font-size:0.8rem; color:#666;">$${item.price.toFixed(2)}</div>
                </div>
                <span class="remove-link" onclick="removeFromCart(${idx})">Remove</span>
            </div>
        `).join('');
        
        checkoutForm.style.display = 'block';
    }
}

function toggleCart() {
    const isHidden = cartModal.style.display === 'none' || cartModal.style.display === '';
    cartModal.style.display = isHidden ? 'flex' : 'none';
}

// Payment Toggling
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

// CASH CHECKOUT
async function processCashOrder() {
    const name = document.getElementById('customerName').value.trim();
    if (!name) {
        alert("Please enter your full name so we know who to deliver to!");
        return;
    }

    const total = cart.reduce((sum, i) => sum + i.price, 0).toFixed(2);
    
    // Send to Server
    const res = await fetch('/api/notify-owner', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            customerName: name,
            paymentMethod: 'CASH',
            amount: total,
            items: cart
        })
    });

    if (res.ok) {
        alert(`Order Placed! Please find the owner to pay $${total} cash and pick up your items.`);
        cart = [];
        updateCart();
        toggleCart();
    } else {
        alert("Error placing order. Try again.");
    }
}

// PAYPAL CHECKOUT
function setupPayPal() {
    paypal.Buttons({
        onClick: (data, actions) => {
            const name = document.getElementById('customerName').value.trim();
            if (!name) {
                alert("Please enter your full name first.");
                return actions.reject();
            }
            return actions.resolve();
        },
        createOrder: (data, actions) => {
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
                
                await fetch('/api/notify-owner', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        customerName: name,
                        paymentMethod: 'PAYPAL',
                        amount: details.purchase_units[0].amount.value,
                        items: cart
                    })
                });

                alert("Payment Successful! We will deliver your items soon.");
                cart = [];
                updateCart();
                toggleCart();
            });
        }
    }).render('#paypal-btn-container');
}

init();