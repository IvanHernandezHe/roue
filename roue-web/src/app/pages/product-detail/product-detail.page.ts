import { Component, inject, OnInit, OnDestroy, signal, computed, ElementRef, ViewChild, HostListener, AfterViewInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, CurrencyPipe, NgFor } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Product } from '../../core/models/product.model';
import { ApiService } from '../../core/api.service';
import { CartStore } from '../../state/cart.store';
import { AuthStore } from '../../state/auth.store';
import { WishlistStore } from '../../state/wishlist.store';
import { ProductAssetsService } from '../../core/product-assets.service';
import { switchMap } from 'rxjs';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, CurrencyPipe, RouterLink, LucideAngularModule],
  styles: [`
    :host { display: block; --viewer-h: clamp(360px, 52vh, 560px); }

    .crumb {
      font-size: .88rem;
      color: var(--brand-muted);
      display: inline-flex;
      align-items: center;
      gap: .5rem;
      flex-wrap: wrap;
    }
    .crumb a {
      color: inherit;
      text-decoration: none;
      font-weight: 600;
    }
    .crumb a:hover { color: var(--brand-primary); text-decoration: underline; }
    .crumb .sep { color: color-mix(in srgb, var(--brand-muted) 65%, #ffffff); }

    .detail-layout {
      display: grid;
      gap: 2.2rem;
    }
    @media (min-width: 992px) {
      .detail-layout {
        grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr);
        gap: 3rem;
      }
    }

    .media-shell {
      display: flex;
      gap: .75rem;
      align-items: stretch;
    }
    .rail {
      display: none;
      flex-direction: column;
      gap: .35rem;
      width: 86px;
    }
    @media (min-width: 768px) { .rail { display: flex; } }
    .thumbs {
      display: flex;
      gap: .35rem;
      overflow-x: auto;
      padding-bottom: .25rem;
    }
    .thumb {
      width: 74px;
      height: 74px;
      border-radius: 16px;
      border: 2px solid transparent;
      background: var(--brand-cloud);
      box-shadow: var(--shadow-soft);
      cursor: pointer;
      transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
    }
    .thumb:hover { transform: translateY(-2px); box-shadow: var(--shadow-hover); }
    .thumb.active {
      border-color: var(--brand-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 20%, transparent);
    }
    .thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: inherit;
    }
    @media (max-width: 767.98px) {
      .thumb { width: 60px; height: 60px; }
    }

    .simple-carousel {
      position: relative;
      overflow: hidden;
      border-radius: clamp(18px, 3vw, 26px);
      border: 1.5px solid var(--brand-border);
      background: radial-gradient(120% 120% at 50% 0%, rgba(15,82,186,.08), rgba(255,255,255,.95));
      height: var(--viewer-h);
      box-shadow: var(--shadow-soft);
    }
    .simple-carousel.plain::after { display: none !important; }
    .simple-track {
      display: flex;
      width: 100%;
      height: 100%;
      transition: transform 620ms cubic-bezier(.22,1,.32,1);
    }
    .simple-item { flex: 0 0 100%; height: 100%; }
    .simple-item img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: clamp(1.6rem, 4vw, 2.2rem);
    }
    .simple-progress {
      position: absolute;
      left: clamp(12px, 4vw, 42px);
      right: clamp(12px, 4vw, 42px);
      bottom: clamp(12px, 4vw, 36px);
      display: flex;
      gap: 6px;
      z-index: 2;
    }
    .simple-progress .bar {
      flex: 1;
      height: 3px;
      background: rgba(17,18,23,.18);
      border-radius: 999px;
      overflow: hidden;
    }
    .simple-progress .fill {
      display: block;
      height: 100%;
      background: var(--brand-primary);
      width: 0%;
      transition: width 160ms linear;
    }
    @media (max-width: 767.98px) {
      .media-shell { flex-direction: column; }
      .simple-carousel { height: auto; }
      .simple-item img { height: auto; }
    }

    .detail-card {
      border-radius: var(--brand-radius-lg);
      border: 1.5px solid var(--brand-border);
      background: rgba(255,255,255,.94);
      box-shadow: var(--shadow-soft);
      padding: clamp(1.6rem, 3vw, 2rem);
      display: grid;
      gap: 1.2rem;
    }
    .product-title {
      font-family: var(--font-display);
      letter-spacing: .02em;
      font-size: clamp(1.65rem, 3vw, 2.2rem);
    }
    .price-row {
      display: flex;
      align-items: baseline;
      gap: 1rem;
    }
    .price-amount {
      font-family: var(--font-display);
      font-size: clamp(1.8rem, 3vw, 2.4rem);
      color: var(--brand-primary);
    }
    .badge-stock {
      display: inline-flex;
      align-items: center;
      gap: .35rem;
      padding: .35rem .9rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--brand-primary) 12%, #ffffff);
      border: 1.5px solid color-mix(in srgb, var(--brand-primary) 35%, #ffffff);
      font-weight: 600;
      letter-spacing: .04em;
    }

    .qty-group {
      display: inline-flex;
      border-radius: var(--brand-radius-sm);
      border: 1.5px solid var(--brand-border);
      overflow: hidden;
      background: var(--brand-cloud);
    }
    .qty-btn {
      width: 42px;
      height: 42px;
      border: none;
      background: transparent;
      font-weight: 600;
      color: var(--brand-ink);
    }
    .qty-btn:hover:not(:disabled) { background: color-mix(in srgb, var(--brand-primary) 12%, #ffffff); color: var(--brand-primary); }
    .qty-input {
      width: 58px;
      border: none;
      text-align: center;
      font-weight: 600;
      background: transparent;
    }

    .cta-group {
      display: flex;
      flex-wrap: wrap;
      gap: .75rem;
    }
    .btn-ico {
      display: inline-flex;
      align-items: center;
      gap: .55rem;
    }

    .specs-card {
      border-radius: var(--brand-radius-lg);
      border: 1.5px solid var(--brand-border);
      background: rgba(255,255,255,.96);
      box-shadow: var(--shadow-soft);
      padding: clamp(1.5rem, 3vw, 1.9rem);
    }
    .specs-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: .95rem;
    }
    .specs-table th {
      width: 32%;
      color: var(--brand-muted);
      font-weight: 600;
      padding: .65rem .75rem;
      background: color-mix(in srgb, var(--brand-primary) 6%, #ffffff);
    }
    .specs-table td {
      padding: .65rem .75rem;
      border-left: 1px solid transparent;
      border-right: 1px solid transparent;
      border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 80%, #ffffff);
    }
    .specs-table tr:first-child th,
    .specs-table tr:first-child td { border-top: none; }
    .specs-table tr:nth-child(odd) td { background: rgba(244,246,252,.7); }

    @media (prefers-reduced-motion: reduce) {
      .thumb:hover,
      .post-card:hover,
      .service-card:hover { transform: none !important; }
    }

    :host-context([data-bs-theme='dark']) .simple-carousel {
      background: radial-gradient(120% 120% at 50% 0%, rgba(15,82,186,.28), rgba(8,12,24,.92));
      border-color: rgba(92,108,148,.45);
      box-shadow: 0 30px 72px rgba(4,10,24,.8);
    }
    :host-context([data-bs-theme='dark']) .thumb {
      background: rgba(10,16,32,.94);
      border-color: rgba(92,108,148,.35);
    }
    :host-context([data-bs-theme='dark']) .thumb.active {
      border-color: rgba(255,255,255,.48);
      box-shadow: 0 0 0 3px rgba(255,255,255,.14);
    }
    :host-context([data-bs-theme='dark']) .detail-card,
    :host-context([data-bs-theme='dark']) .specs-card {
      background: rgba(10,16,32,.94);
      border-color: rgba(92,108,148,.4);
      box-shadow: 0 32px 70px rgba(4,10,24,.75);
      color: #e7e9f2;
    }
    :host-context([data-bs-theme='dark']) .specs-table th {
      color: rgba(231,233,242,.82);
      background: rgba(15,82,186,.22);
    }
    :host-context([data-bs-theme='dark']) .specs-table td {
      background: rgba(12,18,36,.88);
      border-bottom-color: rgba(92,108,148,.35);
    }
    :host-context([data-bs-theme='dark']) .metric {
      background: rgba(12,18,36,.9);
      border-color: rgba(255,255,255,.24);
    }
  `],
  template: `
  <section class="container my-4" *ngIf="product; else loading">
    <nav class="crumb mb-3" aria-label="breadcrumbs">
      <a routerLink="/">Inicio</a>
      <span class="sep">›</span>
      <a routerLink="/shop">Llanta</a>
      <span class="sep">›</span>
      <span>{{ title() }}</span>
    </nav>
    <div class="detail-layout mt-4">
      <div>
        <div class="media-shell">
          <div class="rail" *ngIf="images().length > 1" aria-label="Miniaturas">
            <div class="thumb"
              *ngFor="let src of images(); let i = index"
              [class.active]="i===idx()"
              (click)="select(i)"
              (mouseenter)="preview(i)"
              (mouseleave)="endPreview()"
              [attr.aria-selected]="i===idx()"
              role="button"
              tabindex="0"
              (keyup.enter)="select(i)">
              <img [src]="src" alt="Vista {{i+1}} de {{ title() }}"/>
            </div>
          </div>
          <div class="flex-fill">
            <div #viewerEl
                 class="simple-carousel plain"
                 [attr.data-paused]="paused() ? 'true' : null"
                 (pointerenter)="pause()"
                 (pointerleave)="resume()"
                 aria-roledescription="Carrusel"
                 aria-label="Imágenes del producto">
              <div class="simple-track" [style.transform]="trackTransform()">
                <div class="simple-item" *ngFor="let src of images(); let i = index">
                  <img [src]="src" [alt]="title() + ' imagen ' + (i+1)" (load)="imageLoaded()"/>
                </div>
              </div>
              <div class="simple-progress">
                <span class="bar" *ngFor="let s of images(); let i = index">
                  <i class="fill" [style.width.%]="progress(i)"></i>
                </span>
              </div>
            </div>
            <div class="thumbs d-md-none mt-3" aria-label="Miniaturas móviles">
              <div class="thumb"
                *ngFor="let src of images(); let i = index"
                [class.active]="i===idx()"
                (click)="select(i)"
                (mouseenter)="preview(i)"
                (mouseleave)="endPreview()"
                role="button"
                tabindex="0"
                (keyup.enter)="select(i)">
                <img [src]="src" alt="Vista {{i+1}} de {{ title() }}"/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div #panelEl>
        <div class="detail-card">
          <span class="section-eyebrow text-muted">Ficha técnica</span>
          <h2 class="product-title mb-1">{{ title() }}</h2>
          <div class="text-muted small">SKU {{ product!.sku }}</div>
          <div class="price-row">
            <div class="price-amount">{{ product!.price | currency:'MXN' }}</div>
            <span class="badge-stock">{{ product!.stock ? (product!.stock + ' disponibles') : 'Consultar inventario' }}</span>
          </div>
          <p class="text-muted mb-2">Llanta {{ product!.brand }} {{ product!.modelName }} en medida {{ product!.size }} lista para tu vehículo.</p>
          <div class="small text-muted">Categoría {{ product!.category || 'general' }}</div>

          <div class="d-flex align-items-center gap-3 flex-wrap">
            <div class="d-flex align-items-center gap-2">
              <label class="text-muted">Cantidad</label>
              <div class="qty-group">
                <button class="qty-btn" type="button" (click)="dec()" [disabled]="qty()<=1">−</button>
                <input class="qty-input" type="number" [value]="qty()" readonly aria-live="polite">
                <button class="qty-btn" type="button" (click)="inc()" [disabled]="product!.stock && qty()>=product!.stock!">+</button>
              </div>
            </div>
            <div class="text-muted" *ngIf="product!.stock!==undefined">En stock: {{ product!.stock }}</div>
          </div>

          <div class="cta-group">
            <button class="btn btn-primary btn-lg fw-semibold btn-ico" (click)="addToCart()">
              <lucide-icon name="shopping-cart" size="18" [strokeWidth]="2.5" aria-hidden="true"></lucide-icon>
              <span>Añadir al carrito</span>
            </button>
            <button class="btn btn-light btn-lg text-dark fw-semibold btn-ico" (click)="buyNow()">
              <lucide-icon name="credit-card" size="18" [strokeWidth]="2.5" aria-hidden="true"></lucide-icon>
              <span>Comprar ahora</span>
            </button>
            <button class="btn btn-outline-secondary btn-lg btn-ico" *ngIf="auth.isAuthenticated()" (click)="saveForLater()">
              <lucide-icon name="heart" size="18" [strokeWidth]="2.5" aria-hidden="true"></lucide-icon>
              <span>Guardar</span>
            </button>
          </div>
        </div>

        <div #specsEl class="specs-card mt-3">
          <table class="specs-table">
            <tbody>
              <tr><th class="w-25">Marca</th><td class="text-uppercase">{{ product!.brand }}</td></tr>
              <tr><th>Modelo</th><td>{{ product!.modelName }}</td></tr>
              <tr><th>Tamaño</th><td>{{ product!.size }}</td></tr>
              <tr><th>Categoría</th><td>{{ product!.category || '—' }}</td></tr>
              <tr *ngIf="product!.tire"><th>Tipo</th><td>{{ product!.tire.type || '—' }}</td></tr>
              <tr *ngIf="product!.tire"><th>Rango carga</th><td>{{ product!.tire.loadIndex || '—' }}</td></tr>
              <tr *ngIf="product!.tire"><th>Rango Velocidad</th><td>{{ product!.tire.speedRating || '—' }}</td></tr>
              <ng-container *ngIf="product!.rim">
                <tr><th>Diámetro</th><td>{{ product!.rim.diameterIn || '—' }} in</td></tr>
                <tr><th>Ancho</th><td>{{ product!.rim.widthIn || '—' }} in</td></tr>
                <tr><th>Patrón</th><td>{{ product!.rim.boltPattern || '—' }}</td></tr>
                <tr><th>Offset</th><td>{{ product!.rim.offsetMm || '—' }} mm</td></tr>
                <tr><th>Centro</th><td>{{ product!.rim.centerBoreMm || '—' }} mm</td></tr>
                <tr><th>Material</th><td>{{ product!.rim.material || '—' }}</td></tr>
                <tr><th>Acabado</th><td>{{ product!.rim.finish || '—' }}</td></tr>
              </ng-container>
              <tr><th>Ancho</th><td>{{ parsed().width || '—' }}</td></tr>
              <tr><th>Alto</th><td>{{ parsed().aspect || '—' }}</td></tr>
              <tr><th>Rin</th><td>{{ parsed().rim || '—' }}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <ng-template #loading>
    <div class="container my-4"><div class="alert alert-info">Cargando producto…</div></div>
  </ng-template>
  `
})
export class ProductDetailPage implements OnInit, OnDestroy, AfterViewInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private cart = inject(CartStore);
  private host = inject(ElementRef<HTMLElement>);
  auth = inject(AuthStore);
  private wishlist = inject(WishlistStore);
  private assets = inject(ProductAssetsService);
  product?: Product;
  idx = signal(0);
  qty = signal(1);
  images = signal<string[]>(['/assets/pzero-1_80.jpg','/assets/pzero-1_80.jpg','/assets/pzero-1_80.jpg']);
  title = computed(() => this.product ? `${this.product.brand} ${this.product.modelName} ${this.product.size}` : '');
  // autoplay
  readonly autoMs = 5500;
  private t: any = null;
  private tick: any = null;
  paused = signal(false);
  private autoDisabled = false;
  elapsed = signal(0);
  trackTransform = () => `translate3d(-${this.idx()*100}%,0,0)`;
  // When autoplay is disabled and this is the active slide, keep bar full
  // (visual cue of selection)
  // Override progress method to account for disabled state
  // Note: keeping compatibility with existing bindings
  progress = (i: number) => {
    if (i === this.idx() && this.autoDisabled) return 100;
    return i === this.idx() ? Math.min(100, Math.round(this.elapsed() / this.autoMs * 100)) : 0;
  };

  @ViewChild('viewerEl') viewerRef?: ElementRef<HTMLDivElement>;
  @ViewChild('specsEl') specsRef?: ElementRef<HTMLDivElement>;
  @ViewChild('panelEl') panelRef?: ElementRef<HTMLDivElement>;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getProduct(id)
      .pipe(switchMap(p => this.assets.enrichProduct(p)))
      .subscribe(p => {
        this.product = p;
        if (p.images && p.images.length) this.images.set(p.images);
        setTimeout(() => this.equalizeHeights(), 0);
      });
    this.startAutoplay();
  }
  ngAfterViewInit() { setTimeout(() => this.equalizeHeights(), 0); }
  ngOnDestroy() { this.stopAutoplay(); }

  select(i: number) {
    if (i>=0 && i < this.images().length) {
      this.idx.set(i);
      this.disableAutoplay();
      this.elapsed.set(this.autoMs); // fill progress bar fully
    }
  }
  preview(i: number) {
    if (i>=0 && i < this.images().length) {
      this.idx.set(i);
      this.paused.set(true); // pause while hovering thumbnails
      this.elapsed.set(this.autoMs); // fill bar fully on hover
    }
  }
  endPreview() { if (!this.autoDisabled) this.paused.set(false); }
  inc() { this.qty.set(Math.min((this.product?.stock ?? Number.MAX_SAFE_INTEGER), this.qty()+1)); }
  dec() { this.qty.set(Math.max(1, this.qty()-1)); }
  addToCart() { if (this.product) this.cart.add(this.product, this.qty()); }
  buyNow() { this.addToCart(); window.location.href = '/checkout'; }
  saveForLater() { if (this.product) this.wishlist.add(this.product.id); }

  parsed() {
    const size = this.product?.size || '';
    const m = size.match(/(\d{3})\/(\d{2})\s*R?(\d{2})/i);
    if (!m) return { width: null, aspect: null, rim: null } as any;
    return { width: Number(m[1]), aspect: Number(m[2]), rim: Number(m[3]) } as any;
  }
  productType(): string | null { return this.product?.tire?.type ?? null; }
  loadIndex(): string | null { return this.product?.tire?.loadIndex ?? null; }
  speedRating(): string | null { return this.product?.tire?.speedRating ?? null; }
  savingsPct() { return 0; }

  // autoplay helpers
  pause() { this.paused.set(true); }
  resume() { if (!this.autoDisabled) this.paused.set(false); }
  private startAutoplay() {
    this.stopAutoplay();
    this.tick = setInterval(() => {
      if (!this.paused()) {
        const next = this.elapsed() + 120;
        if (next >= this.autoMs) { this.nextSlide(); this.elapsed.set(0); }
        else this.elapsed.set(next);
      }
    }, 120);
  }
  private stopAutoplay() { if (this.tick) { clearInterval(this.tick); this.tick = null; } }
  private nextSlide() { const n = (this.idx() + 1) % Math.max(1, this.images().length); this.idx.set(n); }
  private disableAutoplay() { this.autoDisabled = true; this.paused.set(true); this.stopAutoplay(); }
  private enableAutoplay() { this.autoDisabled = false; this.elapsed.set(0); this.paused.set(false); this.startAutoplay(); }

  // equal heights (desktop only)
  @HostListener('window:resize') onResize() { this.equalizeHeights(); }
  imageLoaded() { this.equalizeHeights(); }
  private equalizeHeights() {
    const viewer = this.viewerRef?.nativeElement; const panel = this.panelRef?.nativeElement;
    if (!viewer || !panel) return;
    if (window.innerWidth < 768) { viewer.style.height = 'auto'; return; }
    const h = panel.offsetHeight || 0;
    if (h > 0) viewer.style.height = h + 'px';
  }

  // Click en documento para restablecer autoplay si fue deshabilitado manualmente
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    const target = ev.target as HTMLElement | null;
    if (!target) return;
    // Si el click no proviene de una miniatura, reactivar autoplay
    if (this.autoDisabled && !target.closest('.thumb')) {
      this.enableAutoplay();
    }
  }
}
