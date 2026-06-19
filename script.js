/* ============================================================
   FoodieGo — Premium Food Delivery App JavaScript
   Features: Cart, Filters, Scroll Reveal, Nav, Favorites, 
             Ripple Effects, Newsletter, Scroll-to-top
   ============================================================ */

'use strict';

/* ==================== NAVBAR ==================== */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

// Scroll-based navbar styling
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
});

// Mobile menu toggle
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close mobile menu on nav link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

/* ==================== SMOOTH SCROLL ==================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ==================== SCROLL REVEAL (Intersection Observer) ==================== */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || 0);
        setTimeout(() => {
          el.classList.add('visible');
        }, delay);
        revealObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ==================== RIPPLE EFFECT ==================== */
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.ripple');
  if (!btn) return;

  const rect = btn.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100 + '%';
  const y = ((e.clientY - rect.top) / rect.height) * 100 + '%';

  btn.style.setProperty('--x', x);
  btn.style.setProperty('--y', y);

  btn.classList.remove('rippling');
  // Trigger reflow
  void btn.offsetWidth;
  btn.classList.add('rippling');

  setTimeout(() => btn.classList.remove('rippling'), 600);
});

/* ==================== CART STATE ==================== */
let cart = [];

const cartBtn = document.getElementById('cartBtn');
const cartBadge = document.getElementById('cartBadge');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartItemsEl = document.getElementById('cartItems');
const cartEmpty = document.getElementById('cartEmpty');
const cartSummary = document.getElementById('cartSummary');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartTotal = document.getElementById('cartTotal');

// Open cart
function openCart() {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close cart
function closeCart() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

/* ==================== ADD TO CART ==================== */
document.querySelectorAll('.btn-add-cart').forEach(btn => {
  btn.addEventListener('click', function () {
    const name = this.dataset.name;
    const price = parseInt(this.dataset.price);
    const img = this.dataset.img;

    // Check if item already in cart
    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name, price, img, qty: 1 });
    }

    updateCart();
    openCart();

    // Animate button
    this.textContent = '✓ Added!';
    this.style.background = 'linear-gradient(135deg, #22C55E, #16A34A)';
    setTimeout(() => {
      this.textContent = '+ Add';
      this.style.background = '';
    }, 1500);
  });
});

/* ==================== UPDATE CART UI ==================== */
function updateCart() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Update badge
  cartBadge.textContent = totalQty;
  cartBadge.style.transform = 'scale(1.3)';
  setTimeout(() => { cartBadge.style.transform = ''; }, 250);

  // Toggle empty/summary states
  if (cart.length === 0) {
    cartEmpty.style.display = 'flex';
    cartSummary.style.display = 'none';
  } else {
    cartEmpty.style.display = 'none';
    cartSummary.style.display = 'block';
    cartSubtotal.textContent = `₹${subtotal}`;
    cartTotal.textContent = `₹${subtotal}`;
  }

  // Render items
  // Remove old item nodes (keep cartEmpty in place)
  const existingItems = cartItemsEl.querySelectorAll('.cart-item');
  existingItems.forEach(el => el.remove());

  cart.forEach((item, index) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <div class="cart-item-img"><img src="${item.img}" alt="${item.name}"/></div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price * item.qty}</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn qty-minus" data-index="${index}" aria-label="Decrease">−</button>
        <span class="qty-count">${item.qty}</span>
        <button class="qty-btn qty-plus" data-index="${index}" aria-label="Increase">+</button>
      </div>
      <button class="cart-item-remove" data-index="${index}" aria-label="Remove">🗑</button>
    `;
    cartItemsEl.appendChild(itemEl);
  });

  // Bind quantity and remove buttons
  cartItemsEl.querySelectorAll('.qty-minus').forEach(btn => {
    btn.addEventListener('click', () => changeQty(parseInt(btn.dataset.index), -1));
  });

  cartItemsEl.querySelectorAll('.qty-plus').forEach(btn => {
    btn.addEventListener('click', () => changeQty(parseInt(btn.dataset.index), 1));
  });

  cartItemsEl.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeItem(parseInt(btn.dataset.index)));
  });
}

/* ==================== QUANTITY CONTROLS ==================== */
function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    removeItem(index);
    return;
  }
  updateCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  updateCart();
}

/* ==================== MENU FILTER ==================== */
const filterBtns = document.querySelectorAll('.filter-btn');
const menuCards = document.querySelectorAll('.menu-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', function () {
    // Update active state
    filterBtns.forEach(b => b.classList.remove('active'));
    this.classList.add('active');

    const filter = this.dataset.filter;

    menuCards.forEach(card => {
      const category = card.dataset.category;
      const show = filter === 'all' || category === filter;

      if (show) {
        card.classList.remove('hidden');
        // Re-trigger reveal for filtered cards
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
          card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
        }, 50);
      } else {
        card.classList.add('hidden');
        card.style.opacity = '';
        card.style.transform = '';
        card.style.transition = '';
      }
    });
  });
});

/* ==================== FAVOURITE HEART TOGGLE ==================== */
document.querySelectorAll('.fav-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    this.classList.toggle('active');

    // Quick scale animation
    this.style.transform = 'scale(1.4)';
    setTimeout(() => { this.style.transform = ''; }, 250);
  });
});

/* ==================== NEWSLETTER VALIDATION ==================== */
const subscribeBtn = document.getElementById('subscribeBtn');
const emailInput = document.getElementById('emailInput');
const newsletterMsg = document.getElementById('newsletterMsg');

subscribeBtn.addEventListener('click', () => {
  const email = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    showNewsletterMsg('Please enter your email address.', 'error');
    emailInput.focus();
    return;
  }

  if (!emailRegex.test(email)) {
    showNewsletterMsg('Hmm, that doesn\'t look like a valid email. Try again!', 'error');
    emailInput.focus();
    return;
  }

  // Simulate success
  showNewsletterMsg('🎉 You\'re in! Check your inbox for a welcome surprise.', 'success');
  emailInput.value = '';
  subscribeBtn.textContent = '✓ Subscribed!';
  subscribeBtn.style.background = 'linear-gradient(135deg, #22C55E, #16A34A)';
  setTimeout(() => {
    subscribeBtn.textContent = 'Subscribe';
    subscribeBtn.style.background = '';
    newsletterMsg.textContent = '';
    newsletterMsg.className = 'newsletter-note';
  }, 4000);
});

// Allow subscribe on Enter key
emailInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') subscribeBtn.click();
});

function showNewsletterMsg(text, type) {
  newsletterMsg.textContent = text;
  newsletterMsg.className = `newsletter-note ${type}`;
}

/* ==================== SCROLL TO TOP ==================== */
const scrollTopBtn = document.getElementById('scrollTop');

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ==================== NAVBAR ACTIVE LINK ON SCROLL ==================== */
const sections = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinkEls.forEach(link => {
          link.classList.toggle('active-link', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  },
  { threshold: 0.4 }
);

sections.forEach(section => sectionObserver.observe(section));

// Active link styles (injected dynamically)
const activeLinkStyle = document.createElement('style');
activeLinkStyle.textContent = `.nav-link.active-link { color: var(--primary); background: rgba(255,107,53,0.08); }`;
document.head.appendChild(activeLinkStyle);

/* ==================== CART BADGE TRANSITION STYLES ==================== */
const cartBadgeStyle = document.createElement('style');
cartBadgeStyle.textContent = `.cart-badge { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }`;
document.head.appendChild(cartBadgeStyle);

/* ==================== INITIALIZE ==================== */
updateCart(); // Render empty cart state on load