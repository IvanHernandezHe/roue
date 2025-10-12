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
      border-radius: var(--brand-radius-lg, 26px);
      border: 1.5px solid var(--brand-border, #d9dde7);
      background: var(--brand-cloud, #fff);
      padding: .6rem;
      display: flex;
      flex-direction: column;
      gap: .75rem;
    }
    .card:hover {
      transform: translateY(-6px);
      border-color: var(--brand-primary, #0f52ba);
      box-shadow: 0 26px 52px rgba(15, 82, 186, .18);
    }
    .media {
      position: relative;
      overflow: hidden;
      border-radius: calc(var(--brand-radius-lg, 26px) - 8px);
      background: linear-gradient(165deg, color-mix(in srgb, var(--brand-primary, #0f52ba) 6%, #ffffff) 0%, #f9fbff 100%);
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
      object-fit: contain;
      padding: 1.1rem;
      transition: transform .35s ease, opacity .25s ease;
      transform: scale(.96);
    }
    .card:hover .media img { transform: scale(1); }
    .media img.loading { opacity: 0; }
    .media .img-loader {
      position: absolute;
      inset: 0;
      margin: .9rem;
      border-radius: 1.3rem;
      background: linear-gradient(120deg, rgba(215,219,232,.6) 0%, rgba(229,233,247,.25) 45%, rgba(255,255,255,.4) 70%);
      background-size: 200% 100%;
      animation: shimmer 1.2s ease-in-out infinite;
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
      color: var(--brand-primary, #0f52ba);
    }
    .category-badge {
      position: absolute;
      top: .75rem;
      left: .75rem;
      background: rgba(255,255,255,.82);
      border: 1px solid color-mix(in srgb, var(--brand-primary, #0f52ba) 25%, #ffffff);
      backdrop-filter: blur(6px);
    }
    :host-context([data-bs-theme='dark']) .media {
      background: linear-gradient(165deg, rgba(15,82,186,.18) 0%, rgba(7,16,36,.85) 100%);
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
      border: 1.5px solid var(--brand-border, #d9dde7);
      background: var(--brand-cloud, #fff);
      color: var(--brand-ink-soft, #2f3344);
    }
    .btn-fav:hover,
    .btn-fav:focus {
      border-color: var(--brand-primary, #0f52ba);
      color: var(--brand-primary, #0f52ba);
      background: color-mix(in srgb, var(--brand-primary, #0f52ba) 12%, #ffffff);
      box-shadow: 0 16px 28px rgba(15, 82, 186, .16);
    }
    .stock-badge { align-self: flex-start; letter-spacing: .05em; border: 1.5px solid transparent; }
    .stock-low { background: rgba(255, 99, 99, .15); color: #c22222; border-color: rgba(255, 99, 99, .4); }
    .stock-mid { background: rgba(255, 184, 77, .18); color: #c2640e; border-color: rgba(255, 184, 77, .42); }
    .stock-high { background: rgba(38, 170, 120, .18); color: #0f8b55; border-color: rgba(38, 170, 120, .38); }
    @keyframes shimmer { 0% { background-position: -180% 0; } 100% { background-position: 180% 0; } }
    .media .img-loader { background-size: 200% 100%; }
    :host-context([data-bs-theme='dark']) .media .img-loader {
      background: linear-gradient(120deg, rgba(30,41,59,.7) 0%, rgba(30,41,59,.45) 40%, rgba(100,116,139,.25) 70%);
    }
    @media (max-width: 575.98px) {
      .actions { flex-direction: column; }
    }
  `],
  template: `
  <div class="card h-100 position-relative">
    <span *ngIf="product?.category" class="badge rounded-pill text-bg-light position-absolute category-badge">{{ product!.category }}</span>
    <a [routerLink]="['/product', product!.id]" class="media d-block" (mouseenter)="startHover()" (mouseleave)="stopHover()" (focus)="startHover()" (blur)="stopHover()">
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
  private readonly fallbackImage = '/assets/pzero-1_80.jpg';
  private hoverTimer: any = null;
  private loadedImages = new Set<string>();
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
    this.imageIndex = clamped;
    const src = imgs[clamped] ?? this.fallbackImage;
    this.currentImage = src;
    this.imageLoading = !this.loadedImages.has(src);
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
