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
    .category-badge {
      position: absolute;
      top: .9rem;
      left: .9rem;
      background: rgba(255,255,255,0.92);
      border: 1px solid color-mix(in srgb, var(--brand-border) 65%, transparent);
      border-radius: var(--brand-radius-sm);
      box-shadow: 0 4px 12px -8px rgba(16, 22, 34, 0.4);
      padding: .35rem .7rem;
      font-weight: 600;
      letter-spacing: .05em;
    }
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
    :host-context([data-bs-theme='dark']) .category-badge {
      background: rgba(18, 26, 44, 0.95);
      border-color: color-mix(in srgb, var(--brand-border) 60%, transparent);
      color: var(--brand-ink);
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
    .stock-badge { align-self: flex-start; letter-spacing: .05em; border: 1px solid transparent; }
    .stock-low { background: rgba(255, 99, 99, .12); color: #b61a1a; border-color: rgba(255, 99, 99, .3); }
    .stock-mid { background: rgba(255, 184, 77, .16); color: #a3540a; border-color: rgba(255, 184, 77, .35); }
    .stock-high { background: rgba(38, 170, 120, .16); color: #0c7847; border-color: rgba(38, 170, 120, .32); }
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
  <div class="card h-100 position-relative">
    <span *ngIf="(product?.category || '').trim().length" class="badge rounded-pill text-bg-light position-absolute category-badge">{{ product!.category }}</span>
    <a [routerLink]="['/product', product!.id]" class="media d-block" (mouseenter)="startHover()" (mouseleave)="stopHover()" (focus)="startHover()" (blur)="stopHover()" (pointerdown)="onPointerDown($event)" (touchstart)="onTouchStart()">
      <img [src]="currentImage" [class.loading]="imageLoading" (load)="onImageLoad()" [attr.decoding]="'async'" loading="lazy" alt="{{product!.brand}} {{product!.modelName}}" />
      <div class="img-loader" *ngIf="imageLoading"></div>
    </a>
    <div class="card-body d-flex flex-column gap-1">
      <h5 class="card-title brand-model mb-0">
        <a class="text-decoration-none" [routerLink]="['/product', product!.id]">
          {{product!.brand}} {{product!.modelName}}
        </a>
      </h5>
      <div class="text-muted small">{{product!.size}} · SKU {{product!.sku}}</div>
      <span *ngIf="product?.stock !== undefined" class="badge stock-badge mt-2" [ngClass]="stockClass(product!.stock || 0)">{{ stockLabel(product!.stock || 0) }}</span>
      <div class="mt-auto pt-2">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <strong class="price">{{ product!.price | currency:'MXN' }}</strong>
        </div>
        <div class="actions">
          <button class="btn btn-outline-secondary btn-sm btn-fav" type="button" (click)="saveForLater()" [title]="auth.isAuthenticated() ? 'Agregar a favoritos' : 'Inicia sesión para guardar'" aria-label="Agregar a favoritos">
            <lucide-icon name="heart" size="16" [strokeWidth]="2.5" aria-hidden="true"></lucide-icon>
            <span class="d-none d-sm-inline">Guardar</span>
          </button>
          <button class="btn btn-primary btn-sm fw-semibold" type="button" (click)="addToCart()">
            <lucide-icon name="shopping-cart" size="16" [strokeWidth]="2.5" aria-hidden="true"></lucide-icon>
            <span>Agregar</span>
          </button>
        </div>
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

  addToCart() {
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

  stockClass(stock: number) {
    if (stock <= 5) return 'stock-low';
    if (stock <= 20) return 'stock-mid';
    return 'stock-high';
  }
  stockLabel(stock: number) {
    if (stock <= 5) return `Quedan ${stock}`;
    if (stock <= 20) return `Stock bajo: ${stock}`;
    return `Stock: ${stock}`;
  }
}
