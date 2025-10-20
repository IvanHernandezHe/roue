import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { WishlistStore } from '../../state/wishlist.store';
import { RouterLink } from '@angular/router';
import { CartStore } from '../../state/cart.store';

@Component({
  standalone: true,
  imports: [NgFor, NgIf, CurrencyPipe, RouterLink],
  template: `
  <section class="container my-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="m-0">Guardados para después</h2>
      <div class="d-flex gap-2" *ngIf="store.items() as list" >
        <button class="btn btn-sm btn-outline-dark" (click)="moveAll()" [disabled]="!list.length">Mover todos al carrito</button>
        <button class="btn btn-sm btn-outline-secondary" (click)="removeAll()" [disabled]="!list.length">Quitar todos</button>
      </div>
    </div>
    <div *ngIf="store.items() as list; else loading">
      <div *ngIf="list.length; else empty">
        <!-- Desktop/tablet: table -->
        <div class="table-responsive d-none d-md-block">
          <table class="table align-middle">
            <thead><tr><th>Producto</th><th>Precio</th><th></th></tr></thead>
            <tbody>
              <tr *ngFor="let w of list">
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
                  <button class="btn btn-sm btn-outline-dark me-1" (click)="move(w.productId)">Mover al carrito</button>
                  <button class="btn btn-sm btn-outline-secondary" (click)="remove(w.productId)">Quitar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile: card list -->
        <div class="d-md-none">
          <div class="row g-2">
            <div class="col-12" *ngFor="let w of list">
              <div class="card p-2">
                <div class="d-flex gap-2 align-items-center">
                  <img [src]="w.imageUrl || '/assets/product/fallback/default-tire.jpg'" [alt]="w.productName" class="cart-thumb" style="width:64px;height:64px" loading="lazy"/>
                  <div class="flex-grow-1">
                    <a [routerLink]="['/product', w.productId]" class="fw-semibold text-decoration-none">{{ w.productName }}</a>
                    <div class="small text-muted">SKU {{ w.productSku }}</div>
                    <div class="small" [class.text-success]="w.stock > 0" [class.text-muted]="w.stock <= 0" *ngIf="w.stock !== undefined && w.stock !== null">{{ w.stock > 0 ? 'Disponible' : 'Sin stock' }}</div>
                  </div>
                  <div class="text-nowrap ms-2">{{ w.price | currency:'MXN' }}</div>
                </div>
                <div class="d-flex justify-content-end gap-2 mt-2">
                  <button class="btn btn-sm btn-outline-dark" (click)="move(w.productId)">Mover al carrito</button>
                  <button class="btn btn-sm btn-outline-secondary" (click)="remove(w.productId)">Quitar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ng-template #empty>
        <div class="alert alert-info">Aún no tienes artículos guardados. <a routerLink="/shop">Ir a la tienda</a></div>
      </ng-template>
    </div>
    <ng-template #loading>
      <p class="text-muted">Cargando…</p>
    </ng-template>
  </section>
  `
})
export class WishlistPage implements OnInit {
  store = inject(WishlistStore);
  cart = inject(CartStore);
  ngOnInit(): void { this.store.load(); }
  move(productId: string) { this.store.moveToCart(productId, 1); }
  remove(productId: string) { this.store.remove(productId); }
  moveAll() { this.store.moveAllToCart(); }
  removeAll() { this.store.removeAll(); }
}
