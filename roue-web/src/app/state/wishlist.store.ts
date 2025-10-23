import { Injectable, computed, inject, signal } from '@angular/core';
import { WishlistService, WishItem } from '../core/wishlist.service';
import { CartStore } from './cart.store';
import { ToastService } from '../core/toast.service';
import { ApiService } from '../core/api.service';
import { ProductAssetsService } from '../core/product-assets.service';
import { forkJoin, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WishlistStore {
  #api = inject(WishlistService);
  #toast = inject(ToastService);
  #cart = inject(CartStore);
  #productsApi = inject(ApiService);
  #assets = inject(ProductAssetsService);
  #imgLookupPending = new Set<string>();

  #items = signal<WishItem[] | null>(null);
  readonly items = this.#items.asReadonly();
  readonly count = computed(() => this.#items()?.length ?? 0);

  reset() {
    this.#imgLookupPending.clear();
    this.#items.set([]);
  }

  load() {
    this.#api.list().subscribe({
      next: (l) => { this.#items.set(l); this.#enrichMissingImages(); },
      error: () => this.#items.set([])
    });
  }
  add(productId: string) {
    this.#api.add(productId).subscribe({
      next: () => { this.#toast.success('Guardado para después'); this.load(); },
      error: () => this.#toast.warning('No se pudo guardar')
    });
  }
  remove(productId: string) {
    this.#api.remove(productId).subscribe({ next: () => this.load(), error: () => {} });
  }
  moveToCart(productId: string, qty = 1) {
    this.#api.moveToCart(productId, qty).subscribe({
      next: () => { this.#toast.success('Movido al carrito'); this.load(); this.#cart.reload(); },
      error: () => this.#toast.warning('No se pudo mover')
    });
  }

  moveAllToCart() {
    const list = this.#items() || [];
    if (!list.length) return;
    forkJoin(list.map(w => this.#api.moveToCart(w.productId, 1))).subscribe({
      next: () => { this.#toast.success('Todos movidos al carrito'); this.load(); this.#cart.reload(); },
      error: () => { this.#toast.warning('No se pudieron mover todos'); this.load(); this.#cart.reload(); }
    });
  }

  removeAll() {
    const list = this.#items() || [];
    if (!list.length) return;
    forkJoin(list.map(w => this.#api.remove(w.productId))).subscribe({
      next: () => { this.#toast.info('Lista vaciada'); this.load(); },
      error: () => { this.#toast.warning('No se pudieron quitar todos'); this.load(); }
    });
  }

  // Enrich wishlist items with first product image and stock
  #enrichMissingImages() {
    const list = this.#items();
    if (!list || !Array.isArray(list)) return;
    for (const w of list) {
      if ((w as any).imageUrl || this.#imgLookupPending.has(w.productId)) continue;
      this.#imgLookupPending.add(w.productId);
      this.#productsApi.getProduct(w.productId)
        .pipe(switchMap(p => this.#assets.enrichProduct(p)))
        .subscribe({
          next: (p) => {
            const img = p.images && p.images.length ? p.images[0] : null;
            this.#items.update(curr => (curr || []).map(x => x.productId === w.productId ? { ...x, imageUrl: img, stock: p.stock ?? (x as any).stock ?? null } : x));
            this.#imgLookupPending.delete(w.productId);
          },
          error: () => { this.#imgLookupPending.delete(w.productId); }
        });
    }
  }
}
