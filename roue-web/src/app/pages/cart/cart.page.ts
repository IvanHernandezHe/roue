import { Component, inject, OnInit } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WishlistService, WishItem } from '../../core/wishlist.service';
import { AuthStore } from '../../state/auth.store';
import { ToastService } from '../../core/toast.service';
import { CartStore } from '../../state/cart.store';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/cart.service';
import { ApiService } from '../../core/api.service';
import { ProductAssetsService } from '../../core/product-assets.service';
import { forkJoin, switchMap } from 'rxjs';

@Component({
  standalone: true,
  imports: [NgFor, NgIf, CurrencyPipe, RouterLink, FormsModule],
  template: `
  <section class="container my-4">
    <h2>Carrito</h2>
    <!-- Coupon -->
    <div class="row g-2 align-items-center mb-3 cart-coupon-row">
      <div class="col-12 col-md-6 d-flex flex-column flex-sm-row gap-2">
        <input class="form-control flex-grow-1" placeholder="Cupón de descuento" [(ngModel)]="coupon" name="coupon"/>
        <button class="btn btn-outline-dark w-100 w-sm-auto" (click)="applyCoupon()">Aplicar</button>
        <button class="btn btn-outline-secondary w-100 w-sm-auto" *ngIf="cart.coupon()" (click)="removeCoupon()">Quitar</button>
      </div>
      <div class="col-12 col-md-6 text-md-end" *ngIf="cart.coupon() as c">
        <small class="text-muted">Cupón aplicado: <strong>{{ c.code }}</strong></small>
      </div>
    </div>
    <ng-container *ngIf="cart.items().length; else empty">
      <div class="table-responsive cart-table-wrapper">
        <table class="table align-middle cart-table">
          <thead><tr><th>Producto</th><th style="width: 200px;">Cantidad</th><th>Importe</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let i of cart.items()">
              <td>
                <div class="d-flex align-items-center gap-2">
                  <img [src]="i.imageUrl || '/assets/product/fallback/default-tire.jpg'" [alt]="i.name" class="cart-thumb" loading="lazy"/>
                  <div>
                    {{ i.name }}
                    <small class="text-muted d-block">SKU {{ i.sku }}</small>
                    <small class="text-muted" *ngIf="i.stock !== undefined">Quedan {{ i.stock }}</small>
                  </div>
                </div>
              </td>
              <td data-label="Cantidad">
                <div class="btn-group cart-qty-group" role="group" aria-label="cantidad">
                  <button class="btn btn-outline-secondary" (click)="dec(i.productId)">−</button>
                  <button class="btn btn-light" disabled>{{ i.qty }}</button>
                  <button class="btn btn-outline-secondary" (click)="inc(i.productId)" [disabled]="i.stock && i.qty >= i.stock">+</button>
                </div>
              </td>
              <td data-label="Importe">{{ (i.price * i.qty) | currency:'MXN' }}</td>
              <td data-label="Acciones" class="text-end text-md-start"><button class="btn btn-sm btn-outline-danger cart-remove-btn" (click)="remove(i.productId)">Quitar</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </ng-container>
    <ng-template #empty>
      <div class="alert alert-info">Tu carrito está vacío.</div>
    </ng-template>

    <div class="d-flex flex-column flex-lg-row justify-content-between align-items-stretch align-items-lg-center mt-3 gap-3 cart-summary">
      <div class="cart-totals">
        <div><strong>Subtotal: {{ cart.subtotal() | currency:'MXN' }}</strong></div>
        <div *ngIf="cart.estimateDiscount() > 0" class="text-success">Descuento estimado: −{{ cart.estimateDiscount() | currency:'MXN' }}</div>
        <div>Total estimado: <strong>{{ (cart.subtotal() - cart.estimateDiscount()) | currency:'MXN' }}</strong></div>
      </div>
      <div class="d-flex flex-column flex-sm-row gap-2 cart-summary-actions">
        <button class="btn btn-outline-danger w-100 w-sm-auto" (click)="clearConfirm()" [disabled]="cart.items().length===0">Vaciar</button>
        <a class="btn btn-dark w-100 w-sm-auto" routerLink="/checkout" [class.disabled]="cart.items().length===0">Ir a pagar</a>
      </div>
    </div>
  </section>

  <!-- Saved for later -->
  <section class="container mb-5" *ngIf="auth.isAuthenticated()">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3">
      <h3 class="h5 m-0">Guardados para después</h3>
      <div class="d-flex flex-column flex-sm-row gap-2 w-100 w-sm-auto saved-actions">
        <button class="btn btn-sm btn-outline-dark w-100 w-sm-auto" (click)="moveAllSavedToCart()" [disabled]="saved.length===0">Mover todos</button>
        <button class="btn btn-sm btn-outline-secondary w-100 w-sm-auto" (click)="clearAllSaved()" [disabled]="saved.length===0">Quitar todos</button>
      </div>
    </div>
    <div *ngIf="saved.length; else noneSaved">
      <div class="table-responsive">
        <table class="table align-middle">
          <thead><tr><th>Producto</th><th>Precio</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let w of saved">
              <td>
                <div class="d-flex align-items-center gap-2">
                  <img [src]="w.imageUrl || '/assets/product/fallback/default-tire.jpg'" [alt]="w.productName" class="cart-thumb" loading="lazy"/>
                  <div>
                    <a [routerLink]="['/product', w.productId]" class="link-underline link-underline-opacity-0">{{ w.productName }}</a>
                    <small class="text-muted d-block">SKU {{ w.productSku }}</small>
                    <small class="text-muted" *ngIf="w.stock !== undefined && w.stock !== null">{{ w.stock > 0 ? 'Disponible' : 'Sin stock' }}</small>
                  </div>
                </div>
              </td>
              <td>{{ w.price | currency:'MXN' }}</td>
              <td class="text-nowrap">
                <button class="btn btn-sm btn-outline-dark me-1" (click)="moveSavedToCart(w)">Mover al carrito</button>
                <button class="btn btn-sm btn-outline-secondary" (click)="removeSaved(w)">Quitar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <ng-template #noneSaved><div class="text-muted">No hay artículos guardados.</div></ng-template>
  </section>
  `
})
export class CartPage implements OnInit {
  cart = inject(CartStore);
  auth = inject(AuthStore);
  #wishlist = inject(WishlistService);
  #toast = inject(ToastService);
  #cartApi = inject(CartService);
  #productsApi = inject(ApiService);
  #assets = inject(ProductAssetsService);
  #imgLookupPending = new Set<string>();
  coupon = '';
  saved: WishItem[] = [];
  remove(id: string) { this.cart.remove(id); }
  inc(id: string) { this.cart.increment(id); }
  dec(id: string) { this.cart.decrement(id); }
  clearConfirm() {
    if (confirm('¿Vaciar carrito? Esta acción no se puede deshacer.')) {
      const snapshot = this.cart.items();
      this.cart.clear();
      this.#toast.showWithAction('Carrito vaciado', 'Deshacer', () => this.restore(snapshot));
    }
  }
  applyCoupon() { this.cart.applyCoupon(this.coupon); }
  removeCoupon() { this.cart.clearCoupon(); }
  ngOnInit() {
    if (this.auth.isAuthenticated()) this.loadSaved();
    // Try hydrate from server if it has content (does not override local non-empty carts)
    this.#cartApi.get().subscribe({
      next: (res) => {
        const local = this.cart.items();
        if (res.items?.length && (local.length === 0 || this.cart.isServerSynced())) {
          this.cart.replaceFromServer(res);
        }
      },
      error: () => {}
    });
  }
  loadSaved() {
    this.#wishlist.list().subscribe({
      next: (l) => { this.saved = l; this.enrichSavedImages(); },
      error: () => (this.saved = [])
    });
  }
  private enrichSavedImages() {
    for (const w of this.saved) {
      if ((w as any).imageUrl || this.#imgLookupPending.has(w.productId)) continue;
      this.#imgLookupPending.add(w.productId);
      this.#productsApi.getProduct(w.productId)
        .pipe(switchMap(p => this.#assets.enrichProduct(p)))
        .subscribe({
          next: (p) => {
            const img = p.images && p.images.length ? p.images[0] : null;
            this.saved = this.saved.map(x => x.productId === w.productId ? { ...x, imageUrl: img, stock: (p as any).stock ?? (x as any).stock ?? null } : x);
            this.#imgLookupPending.delete(w.productId);
          },
          error: () => { this.#imgLookupPending.delete(w.productId); }
        });
    }
  }
  moveSavedToCart(w: WishItem) {
    this.#wishlist.moveToCart(w.productId, 1).subscribe({
      next: (res) => { this.cart.replaceFromServer(res); this.loadSaved(); this.#toast.success('Movido al carrito'); },
      error: () => {}
    });
  }
  removeSaved(w: WishItem) { this.#wishlist.remove(w.productId).subscribe({ next: () => this.loadSaved(), error: () => {} }); }

  moveAllSavedToCart() {
    if (!this.saved.length) return;
    forkJoin(this.saved.map(w => this.#wishlist.moveToCart(w.productId, 1))).subscribe({
      next: (responses) => {
        const last = responses.length ? responses[responses.length - 1] : null;
        if (last) this.cart.replaceFromServer(last);
        this.loadSaved();
        this.#toast.success('Todos movidos al carrito');
      },
      error: () => {
        this.loadSaved();
        this.#toast.warning('No se pudieron mover todos');
      }
    });
  }
  clearAllSaved() {
    if (!this.saved.length) return;
    if (!confirm('¿Quitar todos los guardados?')) return;
    forkJoin(this.saved.map(w => this.#wishlist.remove(w.productId))).subscribe({
      next: () => { this.loadSaved(); this.#toast.info('Guardados vaciados'); },
      error: () => { this.loadSaved(); this.#toast.warning('No se pudieron quitar todos'); }
    });
  }

  private restore(items: ReturnType<CartStore['items']>) { this.cart.restoreSnapshot(items as any); }
}
