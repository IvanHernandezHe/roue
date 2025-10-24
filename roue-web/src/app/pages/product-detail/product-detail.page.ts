import { Component, inject, OnInit, OnDestroy, signal, computed, ElementRef, ViewChild, HostListener, AfterViewInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, CurrencyPipe, NgFor, NgClass } from '@angular/common';
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
  imports: [NgIf, NgFor, NgClass, CurrencyPipe, RouterLink, LucideAngularModule],
  styles: [`
    :host { display: block; --viewer-h: clamp(280px, 42vh, 480px); }

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
    .crumb .sep { color: var(--brand-muted); }

    .detail-layout {
      display: grid;
      gap: clamp(1.5rem, 3vw, 2rem);
      align-items: start;
    }
    @media (min-width: 992px) {
      .detail-layout {
        grid-template-columns: minmax(0, 1fr) minmax(320px, 400px);
        gap: clamp(2rem, 3vw, 2.8rem);
      }
    }
    @media (min-width: 1280px) {
      .detail-layout {
        grid-template-columns: minmax(0, 1.08fr) minmax(360px, 440px);
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
      gap: .4rem;
      width: 82px;
    }
    @media (min-width: 768px) { .rail { display: flex; flex-shrink: 0; } }

    .viewer-stage {
      display: flex;
      flex-direction: column;
      gap: .9rem;
      min-width: 0;
      align-items: stretch;
    }

    .thumbs {
      display: flex;
      gap: .35rem;
      overflow-x: auto;
      padding-bottom: .25rem;
    }
    .thumb {
      width: 72px;
      height: 72px;
      border-radius: var(--brand-radius-sm);
      border: 1px solid var(--brand-border);
      background: #ffffff;
      cursor: pointer;
      box-shadow: var(--shadow-soft);
      transition: border-color .18s ease, background .18s ease, box-shadow var(--transition-base), transform var(--transition-base);
    }
    .thumb:hover { border-color: var(--brand-primary); transform: translateY(-2px); box-shadow: var(--shadow-hover); }
    .thumb.active {
      border-color: var(--brand-primary);
      background: var(--surface-subtle);
    }
    .thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    @media (max-width: 767.98px) {
      .thumb { width: 62px; height: 62px; }
    }

    .simple-carousel {
      position: relative;
      overflow: hidden;
      border-radius: var(--brand-radius-lg);
      border: 1px solid var(--brand-border);
      background: linear-gradient(135deg, #ffffff 0%, #f0f3f9 100%);
      height: var(--viewer-h);
      width: min(100%, clamp(260px, 62vw, 560px));
      margin: 0;
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
      padding: clamp(0.65rem, 2.4vw, 1.2rem);
      max-height: calc(var(--viewer-h) - clamp(20px, 3vh, 36px));
    }
    .simple-progress {
      position: absolute;
      left: clamp(12px, 4vw, 32px);
      right: clamp(12px, 4vw, 32px);
      bottom: clamp(12px, 4vw, 26px);
      display: flex;
      gap: 6px;
      z-index: 2;
    }
    .simple-progress .bar {
      flex: 1;
      height: 3px;
      background: rgba(17,18,23,.18);
      border-radius: var(--brand-radius-sm);
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
      .viewer-stage { align-items: stretch; }
      .simple-carousel { height: auto; max-width: 100%; margin-inline: auto; }
      .simple-item img { height: auto; }
    }

    .detail-panel {
      display: flex;
      flex-direction: column;
      gap: clamp(1.2rem, 2.4vw, 1.8rem);
    }

    .detail-card {
      border-radius: var(--brand-radius-lg);
      border: 1px solid var(--brand-border);
      background: linear-gradient(180deg, #ffffff 0%, #f4f6fb 100%);
      padding: clamp(1.25rem, 2.4vw, 1.75rem);
      display: grid;
      gap: 1.05rem;
      box-shadow: var(--shadow-soft);
    }
    .detail-card > p { margin-bottom: .3rem; }
    .product-title {
      font-family: var(--font-display);
      letter-spacing: .02em;
      font-size: clamp(1.65rem, 3vw, 2.2rem);
    }
    .meta-chips {
      display: flex;
      flex-wrap: wrap;
      gap: .45rem;
    }
    .badge-chip {
      display: inline-flex;
      align-items: center;
      gap: .3rem;
      padding: .35rem .65rem;
      border-radius: var(--brand-radius-sm);
      border: 1px solid color-mix(in srgb, var(--brand-border) 70%, transparent);
      background: rgba(255,255,255,.92);
      font-size: .7rem;
      font-weight: 600;
      letter-spacing: .055em;
      text-transform: uppercase;
      color: var(--brand-muted);
    }
    .badge-chip.category { color: var(--brand-primary); border-color: color-mix(in srgb, var(--brand-primary) 35%, var(--brand-border)); background: rgba(236,244,255,.8); }
    .badge-chip.featured { background: rgba(255,215,0,.18); border-color: rgba(255,215,0,.32); color: #b8860b; }
    .badge-chip.promo { background: rgba(29,111,200,.12); border-color: rgba(29,111,200,.28); color: var(--brand-primary); }
    .badge-chip.low { background: rgba(255,99,99,.12); border-color: rgba(255,99,99,.3); color: #b61a1a; }
    .badge-chip.out { background: rgba(104,112,125,.16); border-color: rgba(104,112,125,.28); color: #5c6472; }

    .brand-row {
      display: flex;
      align-items: center;
      gap: .6rem;
    }
    .brand-logo {
      width: 40px;
      height: 40px;
      border-radius: var(--brand-radius-sm);
      border: 1px solid color-mix(in srgb, var(--brand-border) 65%, transparent);
      background: #fff;
      padding: .32rem;
      object-fit: contain;
      box-shadow: inset 0 1px 2px rgba(16,22,34,.06);
    }
    .brand-name { font-weight: 700; letter-spacing: .02em; text-transform: uppercase; }

    .size-usage {
      display: flex;
      flex-wrap: wrap;
      gap: .5rem;
    }
    .size-chip,
    .usage-chip {
      display: inline-flex;
      align-items: center;
      gap: .3rem;
      padding: .38rem .7rem;
      border-radius: var(--brand-radius-sm);
      border: 1px solid color-mix(in srgb, var(--brand-border) 65%, transparent);
      background: rgba(236, 242, 255, .6);
      font-weight: 600;
      letter-spacing: .03em;
    }
    .usage-chip {
      background: rgba(29,111,200,.12);
      border-color: rgba(29,111,200,.28);
      color: var(--brand-primary);
    }

    .spec-inline {
      display: flex;
      flex-wrap: wrap;
      gap: .6rem;
      font-size: .82rem;
      color: var(--brand-muted);
    }
    .spec-inline strong {
      margin-left: .25rem;
      color: var(--brand-primary);
      font-weight: 700;
    }

    .price-row {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: .85rem 1.2rem;
    }
    .price-amount {
      font-family: var(--font-display);
      font-size: clamp(1.75rem, 3vw, 2.3rem);
      color: var(--brand-primary);
    }
    .price-meta {
      display: flex;
      flex-direction: column;
      gap: .35rem;
      min-width: 180px;
    }
    .availability-note {
      font-size: .9rem;
      font-weight: 600;
      color: var(--brand-muted);
    }
    .availability-note.low { color: #a3540a; }
    .availability-note.out { color: #b61a1a; }

    .qty-group {
      display: inline-flex;
      border-radius: var(--brand-radius-sm);
      border: 1px solid var(--brand-border);
      background: #ffffff;
      box-shadow: var(--shadow-soft);
    }
    .qty-btn {
      width: 42px;
      height: 42px;
      border: none;
      background: transparent;
      font-weight: 600;
      color: var(--brand-ink);
      transition: background .18s ease, color .18s ease;
    }
    .qty-btn:hover:not(:disabled) { background: var(--surface-subtle); color: var(--brand-primary); }
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
    .disabled-state {
      background: rgba(104,112,125,.2) !important;
      border-color: rgba(104,112,125,.28) !important;
      color: rgba(92,100,114,.85) !important;
      cursor: not-allowed;
    }
    .disabled-state lucide-icon { opacity: .7; }

    .specs-card {
      border-radius: var(--brand-radius-lg);
      border: 1px solid var(--brand-border);
      background: linear-gradient(180deg, #ffffff 0%, #f4f6fb 100%);
      padding: clamp(1.1rem, 2.2vw, 1.6rem);
      box-shadow: var(--shadow-soft);
    }
    .specs-table {
      width: 100%;
      border-collapse: collapse;
      font-size: .95rem;
    }
    .specs-table th {
      width: 32%;
      color: var(--brand-muted);
      font-weight: 600;
      padding: .6rem .7rem;
      border-bottom: 1px solid var(--brand-border);
      background: var(--surface-subtle);
    }
    .specs-table td {
      padding: .6rem .7rem;
      border-bottom: 1px solid var(--brand-border);
    }
    .specs-table tr:nth-child(odd) td { background: var(--brand-cream); }

    @media (min-width: 992px) {
      .specs-table tbody {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: .7rem;
      }
      .specs-table tr {
        display: flex;
        flex-direction: column;
        border: 1px solid var(--brand-border);
        border-radius: var(--brand-radius-sm);
        background: #fff;
        padding: .65rem .75rem;
      }
      .specs-table th {
        width: auto;
        border-bottom: none;
        background: transparent;
        padding: 0;
        font-size: .78rem;
        color: var(--brand-muted);
      }
      .specs-table td {
        padding: .25rem 0 0;
        border-bottom: none;
        background: transparent;
        font-weight: 600;
      }
      .specs-table tr:nth-child(odd) td { background: transparent; }
    }

    @media (prefers-reduced-motion: reduce) {
      .thumb:hover,
      .post-card:hover,
      .service-card:hover { transform: none !important; }
    }

    :host-context([data-bs-theme='dark']) .simple-carousel {
      background: linear-gradient(180deg, rgba(23,24,30,.96) 0%, rgba(12,12,16,.92) 100%);
      border-color: rgba(74, 78, 92, 0.45);
      color: var(--brand-ink);
    }
    :host-context([data-bs-theme='dark']) .thumb {
      background: rgba(15,16,22,.94);
      border-color: rgba(70, 73, 85, 0.4);
      color: var(--brand-ink);
    }
    :host-context([data-bs-theme='dark']) .thumb.active {
      border-color: rgba(112, 118, 138, 0.7);
      background: rgba(26, 28, 36, 0.96);
    }
    :host-context([data-bs-theme='dark']) .detail-card,
    :host-context([data-bs-theme='dark']) .specs-card {
      background: linear-gradient(190deg, rgba(20,21,28,.95) 0%, rgba(12,13,18,.9) 100%);
      border-color: rgba(68, 72, 86, 0.45);
      color: var(--brand-ink);
    }
    :host-context([data-bs-theme='dark']) .specs-table th,
    :host-context([data-bs-theme='dark']) .specs-table td {
      background: transparent;
      border-color: rgba(70, 74, 88, 0.4);
      color: var(--brand-ink);
    }
    :host-context([data-bs-theme='dark']) .specs-table tr:nth-child(odd) td {
      background: rgba(23, 24, 32, 0.75);
    }
    @media (min-width: 992px) {
      :host-context([data-bs-theme='dark']) .specs-table tr {
        background: rgba(24, 25, 32, 0.9);
        border-color: rgba(82, 86, 102, 0.5);
      }
    }
    :host-context([data-bs-theme='dark']) .badge-chip {
      background: rgba(33,34,43,0.88);
      border-color: rgba(78, 82, 98, 0.45);
      color: var(--brand-ink);
    }
    :host-context([data-bs-theme='dark']) .badge-chip.out {
      background: rgba(97, 104, 118, 0.24);
      border-color: rgba(116, 124, 140, 0.42);
      color: rgba(214, 218, 228, 0.9);
    }
    :host-context([data-bs-theme='dark']) .size-chip {
      background: rgba(40, 41, 52, 0.9);
      border-color: rgba(96, 100, 116, 0.45);
      color: var(--brand-ink);
    }
    :host-context([data-bs-theme='dark']) .usage-chip {
      background: rgba(69, 88, 140, 0.38);
      border-color: rgba(110, 138, 204, 0.32);
      color: #b7c9ff;
    }
    :host-context([data-bs-theme='dark']) .brand-logo {
      background: rgba(30, 32, 40, 0.92);
      border-color: rgba(78, 82, 100, 0.42);
    }
    :host-context([data-bs-theme='dark']) .availability-note {
      color: rgba(202, 209, 226, 0.84);
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
          <div class="viewer-stage flex-fill">
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

      <div #panelEl class="detail-panel">
        <div class="detail-card">
          <span class="section-eyebrow text-muted">Ficha técnica</span>
          <div class="meta-chips" *ngIf="hasMetaChips">
            <span class="badge-chip category" *ngIf="(product?.category || '').trim().length">{{ product!.category }}</span>
            <span class="badge-chip featured" *ngIf="product?.isFeatured">⭐ Más vendido</span>
            <span class="badge-chip promo" *ngIf="promoLabel">{{ promoLabel }}</span>
            <span class="badge-chip low" *ngIf="lowStockBadge">{{ lowStockBadge }}</span>
            <span class="badge-chip out" *ngIf="isOutOfStock">Agotado</span>
          </div>
          <div class="brand-row mt-2">
            <img *ngIf="brandLogo" [src]="brandLogo!" [alt]="product!.brand" class="brand-logo" loading="lazy"/>
            <span class="brand-name">{{ product!.brand }}</span>
          </div>
          <h2 class="product-title mb-1">{{ product!.modelName }}</h2>
          <div class="text-muted small">SKU {{ product!.sku }}</div>
          <div class="size-usage mt-2">
            <span class="size-chip">{{ product!.size }}</span>
            <span class="usage-chip" *ngIf="usageLabel">{{ usageLabel }}</span>
          </div>
          <div class="spec-inline mt-2" *ngIf="loadIndexCode || speedRatingCode">
            <span *ngIf="loadIndexCode">Índice carga <strong>{{ loadIndexCode }}</strong></span>
            <span *ngIf="speedRatingCode">Velocidad <strong>{{ speedRatingCode }}</strong></span>
          </div>
          <div class="price-row mt-3">
            <div class="price-amount">{{ product!.price | currency:'MXN' }}</div>
            <div class="price-meta">
              <span class="availability-note" [ngClass]="{ 'low': isLowStock, 'out': isOutOfStock }">{{ availabilityLabel }}</span>
              <span class="text-muted small" *ngIf="product?.category">Categoría {{ product!.category }}</span>
            </div>
          </div>
          <p class="text-muted mb-2">Llanta {{ product!.brand }} {{ product!.modelName }} en medida {{ product!.size }} lista para tu vehículo.</p>

          <div class="d-flex align-items-center gap-3 flex-wrap">
            <div class="d-flex align-items-center gap-2">
              <label class="text-muted">Cantidad</label>
              <div class="qty-group">
                <button class="qty-btn" type="button" (click)="dec()" [disabled]="isOutOfStock || qty()<=1">−</button>
                <input class="qty-input" type="number" [value]="qty()" readonly aria-live="polite">
                <button class="qty-btn" type="button" (click)="inc()" [disabled]="isOutOfStock || qty()>=maxPurchasable">+</button>
              </div>
            </div>
            <div class="text-muted small" *ngIf="hasStockInfo && !isOutOfStock">En stock: {{ displayStock }}</div>
            <div class="text-muted small" *ngIf="isOutOfStock">Inventario agotado</div>
            <div class="text-muted small" *ngIf="!hasStockInfo">Consultar inventario</div>
          </div>

          <div class="cta-group">
            <button class="btn btn-lg fw-semibold btn-ico"
              type="button"
              [ngClass]="isOutOfStock ? 'btn-secondary disabled-state' : 'btn-primary'"
              (click)="addToCart()"
              [disabled]="isOutOfStock">
              <lucide-icon name="shopping-cart" size="18" [strokeWidth]="2.5" aria-hidden="true"></lucide-icon>
              <span>{{ isOutOfStock ? 'Agotado' : 'Añadir al carrito' }}</span>
            </button>
            <button class="btn btn-light btn-lg text-dark fw-semibold btn-ico"
              type="button"
              (click)="buyNow()"
              [disabled]="isOutOfStock"
              [ngClass]="{ 'disabled-state': isOutOfStock }">
              <lucide-icon name="credit-card" size="18" [strokeWidth]="2.5" aria-hidden="true"></lucide-icon>
              <span>Comprar ahora</span>
            </button>
            <button class="btn btn-outline-secondary btn-lg btn-ico" *ngIf="auth.isAuthenticated()" (click)="saveForLater()">
              <lucide-icon name="heart" size="18" [strokeWidth]="2.5" aria-hidden="true"></lucide-icon>
              <span>Guardar</span>
            </button>
          </div>
        </div>

        <div #specsEl class="specs-card">
          <table class="specs-table">
            <tbody>
              <tr><th class="w-25">Marca</th><td class="text-uppercase">{{ product!.brand }}</td></tr>
              <tr><th>Modelo</th><td>{{ product!.modelName }}</td></tr>
              <tr><th>Tamaño</th><td>{{ product!.size }}</td></tr>
              <tr><th>Categoría</th><td>{{ product!.category || '—' }}</td></tr>
              <tr *ngIf="usageLabel"><th>Uso recomendado</th><td>{{ usageLabel }}</td></tr>
              <tr *ngIf="loadIndexCode"><th>Índice de carga</th><td>{{ loadIndexCode }}</td></tr>
              <tr *ngIf="speedRatingCode"><th>Índice de velocidad</th><td>{{ speedRatingCode }}</td></tr>
              <tr *ngIf="promoLabel"><th>Promoción</th><td>{{ promoLabel }}</td></tr>
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
  auth = inject(AuthStore);
  private wishlist = inject(WishlistStore);
  private assets = inject(ProductAssetsService);
  product?: Product;
  idx = signal(0);
  qty = signal(1);
  images = signal<string[]>([
    '/assets/product/fallback/default-tire.jpg',
    '/assets/product/fallback/default-tire.jpg',
    '/assets/product/fallback/default-tire.jpg'
  ]);
  title = computed(() => this.product ? `${this.product.brand} ${this.product.modelName} ${this.product.size}` : '');
  // autoplay
  readonly autoMs = 5500;
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

  private get stockValue(): number | null {
    const raw = this.product?.stock;
    return typeof raw === 'number' ? raw : null;
  }
  get displayStock(): number | null {
    return this.stockValue;
  }
  get isOutOfStock(): boolean {
    const raw = this.stockValue;
    return raw !== null && raw <= 0;
  }
  get isLowStock(): boolean {
    const raw = this.stockValue;
    return raw !== null && raw > 0 && raw <= 3;
  }
  get maxPurchasable(): number {
    const raw = this.stockValue;
    return raw !== null && raw > 0 ? raw : Number.MAX_SAFE_INTEGER;
  }
  get availabilityLabel(): string {
    const raw = this.stockValue;
    if (raw === null) return 'Consultar inventario';
    if (raw <= 0) return 'Agotado';
    if (raw <= 3) return `¡Quedan ${raw}!`;
    if (raw <= 6) return `Stock limitado (${raw})`;
    return 'Disponible para envío inmediato';
  }
  get lowStockBadge(): string | null {
    const raw = this.stockValue;
    if (raw !== null && raw > 0 && raw <= 3) return `🔥 Solo ${raw} disponibles`;
    return null;
  }
  get promoLabel(): string | null {
    const text = this.product?.promoLabel?.trim();
    return text && text.length ? text : null;
  }
  get brandLogo(): string | null {
    const url = this.product?.brandLogoUrl?.trim();
    return url && url.length ? url : null;
  }
  get usageLabel(): string | null {
    const tireType = this.product?.tire?.type?.trim() ?? '';
    if (tireType.length) {
      switch (tireType.toUpperCase()) {
        case 'AUTO': return 'Auto';
        case 'AUTO DEPORTIVO': return 'Auto deportivo';
        case 'SUV': return 'SUV';
        case 'CAMIONETA':
        case 'CAMIONETA LIGERA': return 'Camioneta ligera';
        case 'OFFROAD':
        case 'OFF-ROAD': return 'Off-road';
        default: return this.toTitleCase(tireType);
      }
    }
    const category = this.product?.category?.trim();
    return category && category.length ? this.toTitleCase(category) : null;
  }
  get loadIndexCode(): string | null { return this.extractCode(this.product?.tire?.loadIndex); }
  get speedRatingCode(): string | null { return this.extractCode(this.product?.tire?.speedRating); }
  get hasMetaChips(): boolean {
    return !!(
      (this.product?.category || '').trim().length ||
      this.product?.isFeatured ||
      this.promoLabel ||
      this.lowStockBadge ||
      this.isOutOfStock
    );
  }
  get hasStockInfo(): boolean { return this.stockValue !== null; }

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
        if (this.isOutOfStock) this.qty.set(1);
        else this.qty.set(Math.min(this.qty(), this.maxPurchasable));
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
  inc() {
    if (this.isOutOfStock) return;
    this.qty.set(Math.min(this.maxPurchasable, this.qty()+1));
  }
  dec() {
    if (this.isOutOfStock) return;
    this.qty.set(Math.max(1, this.qty()-1));
  }
  addToCart() {
    if (!this.product || this.isOutOfStock) return;
    this.cart.add(this.product, this.qty());
  }
  buyNow() {
    if (this.isOutOfStock) return;
    this.addToCart();
    window.location.href = '/checkout';
  }
  saveForLater() { if (this.product) this.wishlist.add(this.product.id); }

  parsed() {
    const size = this.product?.size || '';
    const m = size.match(/(\d{3})\/(\d{2})\s*R?(\d{2})/i);
    if (!m) return { width: null, aspect: null, rim: null } as any;
    return { width: Number(m[1]), aspect: Number(m[2]), rim: Number(m[3]) } as any;
  }
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
    const viewer = this.viewerRef?.nativeElement;
    if (!viewer) return;
    if (window.innerWidth < 768) {
      viewer.style.height = 'auto';
      return;
    }
    viewer.style.removeProperty('height');
  }

  private extractCode(value?: string | null): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed.length) return null;
    const bracket = trimmed.indexOf('(');
    const core = bracket > 0 ? trimmed.substring(0, bracket).trim() : trimmed;
    return core.length ? core : null;
  }

  private toTitleCase(value: string): string {
    return value.toLowerCase().replace(/\b\w/g, ch => ch.toUpperCase());
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
