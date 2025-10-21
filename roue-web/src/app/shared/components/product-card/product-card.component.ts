import { Component, Input, OnChanges, OnDestroy, SimpleChanges, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { CurrencyPipe, NgIf, NgClass } from '@angular/common';
import { CartStore } from '../../../state/cart.store';
import { AuthStore } from '../../../state/auth.store';
import { WishlistStore } from '../../../state/wishlist.store';
import { ToastService } from '../../../core/toast.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  standalone: true,
  selector: 'app-product-card',
  imports: [CurrencyPipe, RouterLink, NgIf, NgClass, LucideAngularModule],
  styles: [`
    .card {
      border-radius: var(--brand-radius-md);
      border: 1px solid var(--brand-border);
      background: linear-gradient(180deg, #ffffff 0%, #f7f8fb 100%);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: .85rem;
      box-shadow: var(--shadow-soft);
      transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
      overflow: hidden;
    }
    .card:hover {
      border-color: color-mix(in srgb, var(--brand-primary) 35%, var(--brand-border));
      transform: translateY(-2px);
      box-shadow: var(--shadow-hover);
    }
    .media {
      position: relative;
      overflow: hidden;
      border: 1px solid var(--brand-border);
      border-radius: var(--brand-radius-sm);
      background: linear-gradient(135deg, #ffffff 0%, #f0f3f9 100%);
      box-shadow: inset 0 1px 2px rgba(16, 22, 34, 0.05);
    }
    .media::before {
      content: '';
      display: block;
      aspect-ratio: 1 / 1;
    }
    .media img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform .25s ease, opacity .35s ease, filter .45s ease;
      will-change: transform, opacity, filter;
      transform: scale(1);
      opacity: 0;
      filter: blur(10px);
    }
    .card:hover .media img { transform: scale(1.01); }
    .media img.loading {
      opacity: 0;
      filter: blur(10px);
      transform: scale(1.04);
    }
    .media img:not(.loading) {
      opacity: 1;
      filter: blur(0);
    }
    .media .img-loader {
      position: absolute;
      inset: 0;
      margin: .75rem;
      border-radius: var(--brand-radius-sm);
      background: linear-gradient(120deg, rgba(209,213,219,.6) 0%, rgba(236,239,244,.3) 50%, rgba(255,255,255,.45) 100%);
      background-size: 200% 100%;
      animation: shimmer 1.1s ease-in-out infinite;
    }
    .brand-model {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 2.6em;
      font-weight: 600;
      letter-spacing: .01em;
    }
    .price {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--brand-primary);
    }
    .card-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: .45rem;
      margin-bottom: .75rem;
    }
    .badge-chip {
      display: inline-flex;
      align-items: center;
      gap: .25rem;
      padding: .3rem .65rem;
      border-radius: var(--brand-radius-sm);
      font-size: .7rem;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: .06em;
      border: 1px solid color-mix(in srgb, var(--brand-border) 70%, transparent);
      background: rgba(255,255,255,0.9);
      color: var(--brand-muted);
    }
    .category-chip {
      color: var(--brand-primary);
      border-color: color-mix(in srgb, var(--brand-primary) 35%, var(--brand-border));
      background: rgba(236, 244, 255, .8);
    }
    .featured-chip {
      background: rgba(255, 215, 0, .18);
      color: #b8860b;
      border-color: rgba(255, 215, 0, .32);
    }
    .promo-chip {
      background: rgba(29, 111, 200, .12);
      color: var(--brand-primary);
      border-color: rgba(29, 111, 200, .28);
    }
    .low-stock-chip {
      background: rgba(255, 99, 99, .12);
      color: #b61a1a;
      border-color: rgba(255, 99, 99, .3);
    }
    .brand-row {
      display: flex;
      align-items: center;
      gap: .65rem;
    }
    .brand-logo-frame {
      width: 92px;
      height: 36px;
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-logo {
      max-width: 100%;
      max-height: 100%;
      display: block;
      object-fit: contain;
    }
    .brand-name {
      font-weight: 600;
      letter-spacing: .02em;
    }
    .size-usage {
      display: flex;
      flex-wrap: wrap;
      gap: .4rem;
    }
    .size-chip,
    .usage-chip {
      display: inline-flex;
      align-items: center;
      gap: .25rem;
      padding: .35rem .6rem;
      border-radius: var(--brand-radius-sm);
      font-size: .78rem;
      font-weight: 600;
      letter-spacing: .02em;
      border: 1px solid color-mix(in srgb, var(--brand-border) 70%, transparent);
      background: color-mix(in srgb, var(--brand-cloud) 85%, #ffffff);
    }
    .usage-chip {
      background: rgba(29, 111, 200, .1);
      color: var(--brand-primary);
      border-color: rgba(29, 111, 200, .24);
    }
    .spec-row {
      display: flex;
      flex-wrap: wrap;
      gap: .6rem;
      margin-top: .6rem;
      font-size: .78rem;
      color: var(--brand-muted);
    }
    .spec-row strong {
      color: var(--brand-primary);
      font-weight: 700;
      margin-left: .25rem;
    }
    .price-band {
      display: flex;
      flex-direction: column;
      gap: .35rem;
    }
    .availability {
      font-size: .85rem;
      color: var(--brand-muted);
    }
    .availability.low { color: #a3540a; }
    .availability.out { color: #b61a1a; }
    .primary-action {
      display: inline-flex;
      align-items: center;
      gap: .45rem;
      justify-content: center;
      transition: background var(--transition-base), color var(--transition-base), border-color var(--transition-base);
    }
    .primary-action.disabled-state {
      background: rgba(104, 112, 125, .18);
      border-color: rgba(104, 112, 125, .25);
      color: #5c6472;
      cursor: not-allowed;
    }
    .primary-action.disabled-state lucide-icon { opacity: .7; }
    .card-out .media { filter: grayscale(.18); }
    :host-context([data-bs-theme='dark']) .card {
      background: linear-gradient(180deg, rgba(20, 29, 46, 0.92) 0%, rgba(18, 25, 40, 0.88) 100%);
      border-color: color-mix(in srgb, var(--brand-border) 60%, transparent);
      box-shadow: 0 18px 42px -30px rgba(0,0,0,.8);
    }
    :host-context([data-bs-theme='dark']) .card:hover {
      border-color: color-mix(in srgb, var(--brand-primary) 35%, var(--brand-border));
      box-shadow: 0 26px 52px -32px rgba(15, 30, 60, .85);
    }
    :host-context([data-bs-theme='dark']) .media {
      background: rgba(26, 34, 52, 0.95);
      border-color: color-mix(in srgb, var(--brand-border) 60%, transparent);
    }
    :host-context([data-bs-theme='dark']) .media img:not(.loading) {
      opacity: 1;
      filter: blur(0);
    }
    :host-context([data-bs-theme='dark']) .media .img-loader {
      background: linear-gradient(120deg, rgba(46,58,82,.6) 0%, rgba(46,58,82,.35) 50%, rgba(100,116,139,.25) 100%);
    }
    :host-context([data-bs-theme='dark']) .badge-chip {
      background: rgba(18, 26, 44, 0.92);
      color: var(--brand-ink);
      border-color: color-mix(in srgb, var(--brand-border) 60%, transparent);
    }
    :host-context([data-bs-theme='dark']) .size-chip {
      background: rgba(26, 34, 52, 0.8);
      border-color: color-mix(in srgb, var(--brand-border) 60%, transparent);
      color: var(--brand-ink);
    }
    :host-context([data-bs-theme='dark']) .usage-chip {
      background: rgba(29, 111, 200, .2);
      border-color: rgba(29, 111, 200, .3);
      color: var(--brand-primary);
    }
    :host-context([data-bs-theme='dark']) .availability {
      color: color-mix(in srgb, var(--brand-ink) 70%, rgba(148,163,184,.85));
    }
    .actions {
      display: flex;
      gap: .65rem;
      flex-wrap: wrap;
    }
    .actions .btn {
      flex: 1 1 0;
      justify-content: center;
      text-align: center;
      display: inline-flex;
      align-items: center;
      gap: .45rem;
    }
    .btn-fav {
      border: 1px solid var(--brand-border);
      background: #ffffff;
      color: var(--brand-ink-soft);
      transition: border-color var(--transition-base), color var(--transition-base), background var(--transition-base), box-shadow var(--transition-base);
    }
    .btn-fav:hover,
    .btn-fav:focus {
      border-color: color-mix(in srgb, var(--brand-primary) 45%, var(--brand-border));
      color: var(--brand-primary);
      background: rgba(236, 244, 255, 0.5);
      box-shadow: 0 12px 28px -20px rgba(13, 28, 54, 0.42);
    }
    @keyframes shimmer { 0% { background-position: -180% 0; } 100% { background-position: 180% 0; } }
    .media .img-loader { background-size: 200% 100%; }
    :host-context([data-bs-theme='dark']) .media .img-loader {
      background: linear-gradient(120deg, rgba(30,41,59,.6) 0%, rgba(30,41,59,.35) 50%, rgba(100,116,139,.25) 100%);
    }
    @media (max-width: 575.98px) {
      .actions { flex-direction: column; }
    }
  `],
  template: `
  <div class="card h-100 position-relative" [class.card-out]="isOutOfStock">
    <div class="card-meta">
      <span *ngIf="(product?.category || '').trim().length" class="badge-chip category-chip">{{ product!.category }}</span>
      <span *ngIf="product?.isFeatured" class="badge-chip featured-chip">⭐ Más vendido</span>
      <span *ngIf="promoLabel" class="badge-chip promo-chip">{{ promoLabel }}</span>
      <span *ngIf="lowStockBadge" class="badge-chip low-stock-chip">{{ lowStockBadge }}</span>
    </div>
    <a [routerLink]="['/product', product!.id]" class="media d-block" (mouseenter)="startHover()" (mouseleave)="stopHover()" (focus)="startHover()" (blur)="stopHover()" (pointerdown)="onPointerDown($event)" (touchstart)="onTouchStart()">
      <img [src]="currentImage" [class.loading]="imageLoading" (load)="onImageLoad()" [attr.decoding]="'async'" loading="lazy" alt="{{product!.brand}} {{product!.modelName}}" />
      <div class="img-loader" *ngIf="imageLoading"></div>
    </a>
    <div class="card-body d-flex flex-column">
      <div class="brand-row">
        <div *ngIf="brandLogo" class="brand-logo-frame">
          <img [src]="brandLogo!" [alt]="product!.brand" class="brand-logo" loading="lazy"/>
        </div>
        <span class="brand-name">{{ product!.brand }}</span>
      </div>
      <h5 class="card-title brand-model mb-1">
        <a class="text-decoration-none" [routerLink]="['/product', product!.id]">
          {{ product!.modelName }}
        </a>
      </h5>
      <div class="sku text-muted small">SKU {{ product!.sku }}</div>
      <div class="size-usage mt-2">
        <span class="size-chip">{{ product!.size }}</span>
        <span class="usage-chip" *ngIf="usageLabel">{{ usageLabel }}</span>
      </div>
      <div class="spec-row" *ngIf="loadIndex || speedRating">
        <span *ngIf="loadIndex">Índice carga <strong>{{ loadIndex }}</strong></span>
        <span *ngIf="speedRating">Velocidad <strong>{{ speedRating }}</strong></span>
      </div>
      <div class="price-band mt-3">
        <strong class="price">{{ product!.price | currency:'MXN' }}</strong>
        <div class="availability" [ngClass]="{ 'low': isLowStock, 'out': isOutOfStock }">{{ availabilityLabel }}</div>
      </div>
      <div class="actions pt-3">
        <button class="btn btn-outline-secondary btn-sm btn-fav" type="button" (click)="saveForLater()" [title]="auth.isAuthenticated() ? 'Agregar a favoritos' : 'Inicia sesión para guardar'" aria-label="Agregar a favoritos">
          <lucide-icon name="heart" size="16" [strokeWidth]="2.5" aria-hidden="true"></lucide-icon>
          <span class="d-none d-sm-inline">Guardar</span>
        </button>
        <button class="btn btn-sm fw-semibold primary-action"
          type="button"
          (click)="addToCart()"
          [disabled]="isOutOfStock"
          [ngClass]="isOutOfStock ? 'btn-secondary disabled-state' : 'btn-primary'">
          <lucide-icon name="shopping-cart" size="16" [strokeWidth]="2.5" aria-hidden="true"></lucide-icon>
          <span>{{ isOutOfStock ? 'Agotado' : 'Agregar' }}</span>
        </button>
      </div>
    </div>
  </div>
  `
})
export class ProductCardComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) product!: Product;
  #cart = inject(CartStore);
  auth = inject(AuthStore);
  #wishlist = inject(WishlistStore);
  #toast = inject(ToastService);
  #router = inject(Router);
  private readonly fallbackImage = '/assets/product/fallback/default-tire.jpg';
  private hoverTimer: any = null;
  private loadedImages = new Set<string>();
  private static activeTouchCard: ProductCardComponent | null = null; // ensure only one touch carousel runs
  imageIndex = 0;
  currentImage = this.fallbackImage;
  imageLoading = true;
  get stockCount(): number { return this.product?.stock ?? 0; }
  get isOutOfStock(): boolean { return this.stockCount <= 0; }
  get isLowStock(): boolean { const qty = this.stockCount; return qty > 0 && qty <= 3; }
  get lowStockBadge(): string | null { return this.isLowStock ? `🔥 Solo ${this.stockCount} disponibles` : null; }
  get availabilityLabel(): string {
    if (this.isOutOfStock) return 'Agotado';
    if (this.isLowStock) return `Solo ${this.stockCount} disponibles`;
    if (this.stockCount <= 6) return `Stock limitado (${this.stockCount})`;
    return 'Disponible';
  }
  get promoLabel(): string | null {
    const value = this.product?.promoLabel?.trim();
    return value && value.length ? value : null;
  }
  get brandLogo(): string | null {
    const value = this.product?.brandLogoUrl?.trim();
    return value && value.length ? value : null;
  }
  get usageLabel(): string | null {
    const raw = this.product?.tire?.type ?? '';
    const trimmed = raw.trim();
    if (!trimmed.length) {
      const fallback = this.product?.category?.trim();
      return fallback && fallback.length ? this.toTitleCase(fallback) : null;
    }
    switch (trimmed.toUpperCase()) {
      case 'AUTO':
        return 'Auto';
      case 'AUTO DEPORTIVO':
        return 'Auto deportivo';
      case 'SUV':
        return 'SUV';
      case 'CAMIONETA':
      case 'CAMIONETA LIGERA':
        return 'Camioneta ligera';
      case 'OFFROAD':
      case 'OFF-ROAD':
        return 'Off-road';
      default:
        return this.toTitleCase(trimmed);
    }
  }
  get loadIndex(): string | null {
    return this.extractCode(this.product?.tire?.loadIndex);
  }
  get speedRating(): string | null {
    return this.extractCode(this.product?.tire?.speedRating);
  }

  addToCart() {
    if (this.isOutOfStock) {
      return;
    }
    this.#cart.add(this.product);
  }
  saveForLater() {
    if (!this.auth.isAuthenticated()) {
      this.#toast.info('Inicia sesión para guardar en favoritos');
      this.#router.navigate(['/auth'], { queryParams: { returnUrl: '/shop' } });
      return;
    }
    this.#wishlist.add(this.product.id);
    this.#toast.success('Guardado en favoritos');
  }

  ngOnChanges(_: SimpleChanges): void {
    this.loadedImages.clear();
    this.clearHoverTimer();
    this.setImage(0);
  }

  ngOnDestroy(): void {
    this.clearHoverTimer();
    if (ProductCardComponent.activeTouchCard === this) {
      ProductCardComponent.activeTouchCard = null;
    }
  }

  onPointerDown(event: PointerEvent) {
    if (event.pointerType !== 'touch') return;
    this.activateTouchCarousel();
  }

  onTouchStart() {
    if (typeof window !== 'undefined' && 'PointerEvent' in window) return;
    this.activateTouchCarousel();
  }

  startHover() {
    const imgs = this.gallery();
    if (imgs.length <= 1) return;
    this.clearHoverTimer();
    const next = (this.imageIndex + 1) % imgs.length;
    this.setImage(next);
    this.hoverTimer = setInterval(() => this.advanceImage(), 2200);
  }

  stopHover() {
    const imgs = this.gallery();
    if (imgs.length <= 1) return;
    this.clearHoverTimer();
    this.setImage(0);
  }

  onImageLoad() {
    this.loadedImages.add(this.currentImage);
    this.imageLoading = false;
  }

  private advanceImage() {
    const imgs = this.gallery();
    if (imgs.length <= 1) return;
    const next = (this.imageIndex + 1) % imgs.length;
    this.setImage(next);
  }

  private setImage(index: number) {
    const imgs = this.gallery();
    const clamped = (index >= 0 && index < imgs.length) ? index : 0;
    const nextSrc = imgs[clamped] ?? this.fallbackImage;
    if (nextSrc === this.currentImage) {
      this.imageIndex = clamped;
      return;
    }

    this.imageIndex = clamped;
    const alreadyLoaded = this.loadedImages.has(nextSrc);
    this.imageLoading = true;
    this.currentImage = nextSrc;

    if (alreadyLoaded) {
      requestAnimationFrame(() => {
        this.imageLoading = false;
      });
    }
  }

  private gallery(): string[] {
    const arr = (this.product?.images ?? []).filter((src): src is string => !!src);
    return arr.length ? arr : [this.fallbackImage];
  }

  private extractCode(value?: string | null): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed.length) return null;
    const idx = trimmed.indexOf('(');
    const code = idx > 0 ? trimmed.substring(0, idx).trim() : trimmed;
    return code.length ? code : null;
  }

  private toTitleCase(value: string): string {
    return value.toLowerCase().replace(/\b\w/g, ch => ch.toUpperCase());
  }

  private clearHoverTimer() {
    if (this.hoverTimer) {
      clearInterval(this.hoverTimer);
      this.hoverTimer = null;
    }
  }

  private activateTouchCarousel() {
    if (ProductCardComponent.activeTouchCard && ProductCardComponent.activeTouchCard !== this) {
      ProductCardComponent.activeTouchCard.stopTouchAutoScroll();
    }
    ProductCardComponent.activeTouchCard = this;
    this.startTouchAutoScroll();
  }

  private startTouchAutoScroll() {
    this.startHover();
  }

  private stopTouchAutoScroll() {
    this.stopHover();
    if (ProductCardComponent.activeTouchCard === this) {
      ProductCardComponent.activeTouchCard = null;
    }
  }
}
