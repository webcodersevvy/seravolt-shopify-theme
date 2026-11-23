/**
 * SERAVOLT Web Components Architecture
 * - <sv-mode-switcher>: 3-mode interactive handbag silhouette & spec configurator (GSAP + WebGL)
 * - <sv-cart-drawer>: Slide-over Shopping Bag powered by Shopify AJAX Cart API & Section Rendering API
 * - <sv-product-form>: AJAX Add-to-Bag form with optimistic state & live cart sync
 * - <sv-variant-picker>: Swatch/variant selection with URL history sync & price/SKU update
 * - <sv-header-menu>: Responsive mobile drawer toggle
 */

const MODES = [
  {
    status: '08:00 — STUDIO CONFIGURATION  ·  4 LOCK PORTS ENGAGED',
    spec: 'SV-001 MONOLITH + TOP HANDLES + 14” SLEEVE',
    capacity: 'CAPACITY: 12.5 L',
    bodyW: '220px',
    bodyH: '172px',
    fill: '#141413',
    handleVisible: true,
    handleW: '96px',
    handleH: '48px'
  },
  {
    status: '13:00 — TRANSIT CONFIGURATION  ·  40MM ARCHITECT STRAP',
    spec: 'SV-002 AXIS + 40MM STRAP + VOLT NANO POD',
    capacity: 'HANDS-FREE TRANSIT',
    bodyW: '210px',
    bodyH: '126px',
    fill: '#8C4A2F',
    handleVisible: true,
    handleW: '164px',
    handleH: '64px'
  },
  {
    status: '19:30 — EVENING CONFIGURATION  ·  DETACHED FOLIO MODULE',
    spec: 'SV-004 FOLIO CLUTCH · MAGNETIC RAIL DETACHED',
    capacity: 'SLIM 25 MM PROFILE',
    bodyW: '236px',
    bodyH: '120px',
    fill: '#4A1C24',
    handleVisible: false,
    handleW: '96px',
    handleH: '0px'
  }
];

class SvModeSwitcher extends HTMLElement {
  connectedCallback() {
    this.tabs = Array.from(this.querySelectorAll('[role="tab"]'));
    this.statusEl = this.querySelector('[data-sv-status]');
    this.specEl = this.querySelector('[data-sv-spec]');
    this.capacityEl = this.querySelector('[data-sv-capacity]');
    this.handleEl = this.querySelector('[data-sv-handle]');
    this.bodyEl = this.querySelector('[data-sv-body]');
    this.claspEl = this.querySelector('[data-sv-clasp]');
    this.shaderEl = this.querySelector('sv-brass-stage');

    this.tabs.forEach((tab, idx) => {
      tab.addEventListener('click', () => this.selectMode(idx));
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') this.selectMode((idx + 1) % this.tabs.length);
        if (e.key === 'ArrowLeft') this.selectMode((idx - 1 + this.tabs.length) % this.tabs.length);
      });
    });
  }

  selectMode(index) {
    const mode = MODES[index] || MODES[0];
    this.tabs.forEach((t, i) => t.setAttribute('aria-selected', String(i === index)));

    if (this.statusEl) this.statusEl.textContent = mode.status;
    if (this.specEl) this.specEl.textContent = mode.spec;
    if (this.capacityEl) this.capacityEl.textContent = mode.capacity;
    if (this.shaderEl && typeof this.shaderEl.setMode === 'function') {
      this.shaderEl.setMode(index);
    }

    if (window.gsap) {
      if (this.bodyEl) {
        window.gsap.to(this.bodyEl, {
          width: mode.bodyW,
          height: mode.bodyH,
          backgroundColor: mode.fill,
          duration: 0.45,
          ease: 'power3.out'
        });
      }
      if (this.handleEl) {
        window.gsap.to(this.handleEl, {
          width: mode.handleW,
          height: mode.handleVisible ? mode.handleH : '0px',
          opacity: mode.handleVisible ? 1 : 0,
          duration: 0.35,
          ease: 'power2.out'
        });
      }
      if (this.claspEl) {
        window.gsap.fromTo(this.claspEl, { scaleX: 0.78 }, { scaleX: 1, duration: 0.35, ease: 'back.out(2)' });
      }
    } else {
      if (this.bodyEl) {
        this.bodyEl.style.width = mode.bodyW;
        this.bodyEl.style.height = mode.bodyH;
        this.bodyEl.style.backgroundColor = mode.fill;
      }
      if (this.handleEl) {
        this.handleEl.style.width = mode.handleW;
        this.handleEl.style.height = mode.handleVisible ? mode.handleH : '0px';
        this.handleEl.style.opacity = mode.handleVisible ? '1' : '0';
      }
    }
  }
}

class SvCartDrawer extends HTMLElement {
  connectedCallback() {
    this.backdrop = this.querySelector('[data-drawer-close]');
    this.closeBtn = this.querySelector('[data-drawer-close-btn]');
    this.bodyContainer = this.querySelector('[data-drawer-content]');

    this.addEventListener('click', (e) => {
      if (e.target.closest('[data-drawer-close], [data-drawer-close-btn]')) {
        this.close();
      }
      const qtyBtn = e.target.closest('[data-cart-qty]');
      if (qtyBtn) {
        this.updateLine(qtyBtn.dataset.lineKey, Number(qtyBtn.dataset.cartQty));
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.hasAttribute('open')) this.close();
    });

    document.addEventListener('sv:cart-open', () => this.open());
    document.addEventListener('sv:cart-updated', () => this.refresh());
  }

  open() {
    this.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
    this.refresh();
  }

  close() {
    this.removeAttribute('open');
    document.body.style.overflow = '';
  }

  async refresh() {
    try {
      const root = window.Shopify?.routes?.root || '/';
      const [cartRes, sectionRes] = await Promise.all([
        fetch(`${root}cart.js`, { headers: { Accept: 'application/json' } }),
        fetch(`${root}?section_id=cart-drawer`)
      ]);
      const cart = await cartRes.json();
      const html = await sectionRes.text();

      document.querySelectorAll('[data-cart-count]').forEach((el) => {
        el.textContent = `BAG (${cart.item_count})`;
      });

      const doc = new DOMParser().parseFromString(html, 'text/html');
      const nextContent = doc.querySelector('[data-drawer-content]');
      if (nextContent && this.bodyContainer) {
        this.bodyContainer.innerHTML = nextContent.innerHTML;
      }
    } catch (err) {
      console.error('[SERAVOLT Cart]', err);
    }
  }

  async updateLine(key, quantity) {
    const root = window.Shopify?.routes?.root || '/';
    await fetch(`${root}cart/change.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ id: key, quantity })
    });
    await this.refresh();
  }
}

class SvProductForm extends HTMLElement {
  connectedCallback() {
    this.form = this.querySelector('form');
    if (!this.form) return;
    this.submitBtn = this.form.querySelector('[type="submit"]');
    this.statusEl = this.querySelector('[data-form-status]');

    this.form.addEventListener('submit', async (e) => {
      if (document.documentElement.dataset.cartDrawer !== 'true') return;
      e.preventDefault();
      if (!this.submitBtn) return;

      const originalLabel = this.submitBtn.textContent;
      this.submitBtn.disabled = true;
      this.submitBtn.textContent = this.submitBtn.dataset.addingLabel || 'ADDING TO BAG...';

      try {
        const root = window.Shopify?.routes?.root || '/';
        const formData = new FormData(this.form);
        const res = await fetch(`${root}cart/add.js`, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: formData
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.description || 'Unable to add object to bag.');
        }
        document.dispatchEvent(new CustomEvent('sv:cart-updated'));
        document.dispatchEvent(new CustomEvent('sv:cart-open'));
        if (this.statusEl) this.statusEl.textContent = '';
      } catch (error) {
        if (this.statusEl) this.statusEl.textContent = error.message;
      } finally {
        this.submitBtn.disabled = false;
        this.submitBtn.textContent = originalLabel;
      }
    });
  }
}

class SvVariantPicker extends HTMLElement {
  connectedCallback() {
    const dataNode = this.querySelector('script[type="application/json"]');
    if (!dataNode) return;
    this.variants = JSON.parse(dataNode.textContent);
    this.buttons = Array.from(this.querySelectorAll('[data-variant-id]'));

    this.buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.variantId);
        const variant = this.variants.find((v) => v.id === id);
        if (!variant) return;

        this.buttons.forEach((b) => {
          const active = Number(b.dataset.variantId) === id;
          b.setAttribute('aria-checked', String(active));
          b.classList.toggle('is-active', active);
        });

        const form = this.closest('[data-pdp-scope]')?.querySelector('form input[name="id"]');
        if (form) form.value = String(variant.id);

        const priceEl = this.closest('[data-pdp-scope]')?.querySelector('[data-product-price]');
        if (priceEl && btn.dataset.formattedPrice) {
          priceEl.textContent = btn.dataset.formattedPrice;
        }

        const url = new URL(window.location.href);
        url.searchParams.set('variant', String(variant.id));
        window.history.replaceState({}, '', url.toString());
      });
    });
  }
}

class SvHeaderMenu extends HTMLElement {
  connectedCallback() {
    const trigger = this.querySelector('[data-menu-trigger]');
    const drawer = this.querySelector('[data-mobile-drawer]');
    const bagTrigger = this.querySelector('[data-bag-trigger]');

    trigger?.addEventListener('click', () => {
      const isOpen = drawer?.hasAttribute('open');
      if (isOpen) {
        drawer.removeAttribute('open');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.textContent = 'MENU';
      } else {
        drawer?.setAttribute('open', '');
        trigger.setAttribute('aria-expanded', 'true');
        trigger.textContent = 'CLOSE';
      }
    });

    bagTrigger?.addEventListener('click', (e) => {
      if (document.documentElement.dataset.cartDrawer === 'true') {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('sv:cart-open'));
      }
    });
  }
}

if (!customElements.get('sv-mode-switcher')) customElements.define('sv-mode-switcher', SvModeSwitcher);
if (!customElements.get('sv-cart-drawer')) customElements.define('sv-cart-drawer', SvCartDrawer);
if (!customElements.get('sv-product-form')) customElements.define('sv-product-form', SvProductForm);
if (!customElements.get('sv-variant-picker')) customElements.define('sv-variant-picker', SvVariantPicker);
if (!customElements.get('sv-header-menu')) customElements.define('sv-header-menu', SvHeaderMenu);
