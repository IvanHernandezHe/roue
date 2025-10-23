import { signal, computed, Injectable, effect, inject } from '@angular/core';
import { Product } from '../core/models/product.model';
import { CartService, CartDto } from '../core/cart.service';
import { AuthStore } from './auth.store';
import { ToastService } from '../core/toast.service';
import { DiscountsService, DiscountInfo } from '../core/discounts.service';
import { ApiService } from '../core/api.service';
import { ProductAssetsService } from '../core/product-assets.service';
import { switchMap } from 'rxjs';

export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
  stock?: number;
  imageUrl?: string | null;
}

@Injectable({ providedIn: 'root' })
export class CartStore {
  #storageKey = 'roue_cart_v1';
  #originKey = 'roue_cart_origin_v1'; // 'server' | 'local'
  #couponKey = 'roue_coupon_v1';
  #items = signal<CartItem[]>(this.#rehydrate());
  readonly items = this.#items.asReadonly();
  readonly count = computed(() => this.#items().reduce((s, i) => s + i.qty, 0));
  readonly subtotal = computed(() => this.#items().reduce((s, i) => s + i.price * i.qty, 0));
  #coupon = signal<DiscountInfo | null>(this.#rehydrateCoupon());
  readonly coupon = this.#coupon.asReadonly();
  couponCode() { return this.#coupon()?.code ?? null; }
  estimateDiscount = computed(() => {
    const c = this.#coupon();
    if (!c) return 0;
    const sub = this.subtotal();
    // 0=Percentage, 1=FixedAmount (según backend)
    if (c.type === 0) return Math.round((sub * c.value / 100) * 100) / 100;
    if (c.type === 1) return Math.min(sub, c.value);
    return 0;
  });

  #api = inject(CartService);
  #auth = inject(AuthStore);
  #toast = inject(ToastService);
  #discounts = inject(DiscountsService);
  #productsApi = inject(ApiService);
  #assets = inject(ProductAssetsService);
  #imgLookupPending = new Set<string>();
  #lastAuthIdentity: string | null = null;

  constructor() {
    effect(() => {
      const snapshot = JSON.stringify(this.#items());
      try { localStorage.setItem(this.#storageKey, snapshot); } catch {}
    });
    effect(() => {
      const c = this.#coupon();
      try { c ? localStorage.setItem(this.#couponKey, JSON.stringify(c)) : localStorage.removeItem(this.#couponKey); } catch {}
    });
    effect(() => {
      const authUser = this.#auth.user();
      if (authUser) {
        this.#lastAuthIdentity = authUser.id ?? authUser.email ?? '__auth';
        return;
      }
      const hadAuth = this.#lastAuthIdentity !== null;
      if (hadAuth) {
        this.#resetAfterSignOut();
      } else {
        this.#api.forget();
      }
      this.#lastAuthIdentity = null;
    });
  }

  // Reload current cart snapshot from server (if authenticated)
  reload() {
    if (!this.#auth.isAuthenticated()) return;
    this.#api.get().subscribe({
      next: (res) => this.replaceFromServer(res),
      error: () => {}
    });
  }

  add(p: Product, qty = 1) {
    if (this.#auth.isAuthenticated()) {
      const changed = this.#addLocal(p, qty);
      if (changed) {
        this.#toast.success('Producto agregado al carrito');
      }
      this.#api.add(p.id, qty).subscribe({
        next: (res) => this.replaceFromServer(res),
        error: () => {
          this.#toast.info('Agregado al carrito (offline)');
        }
      });
      return;
    }
    const changed = this.#addLocal(p, qty);
    if (changed) {
      this.#toast.success('Producto agregado al carrito');
    }
    this.#api.add(p.id, qty).subscribe({
      next: (res) => this.replaceFromServer(res),
      error: () => {
        if (changed) {
          this.#toast.info('Guardado en este dispositivo. Se sincronizará cuando la conexión se restablezca.');
        }
      }
    });
  }
  remove(id: string) {
    const removed = this.#items().find(i => i.productId === id);
    if (this.#auth.isAuthenticated()) {
      this.#api.remove(id).subscribe({
        next: (res) => {
          this.replaceFromServer(res);
          if (removed) this.#toast.showWithAction('Producto quitado', 'Deshacer', () => this.#undoRemove(removed));
        },
        error: () => { this.#removeLocal(id); if (removed) this.#toast.showWithAction('Producto quitado', 'Deshacer', () => this.#undoRemove(removed)); }
      });
    } else {
      this.#removeLocal(id);
      if (removed) this.#toast.showWithAction('Producto quitado', 'Deshacer', () => this.#undoRemove(removed));
      this.#api.remove(id).subscribe({ next: (res) => this.replaceFromServer(res), error: () => {} });
    }
  }
  clear() {
    if (this.#auth.isAuthenticated()) {
      this.#api.clear().subscribe({
        next: (res) => { this.replaceFromServer(res); this.#toast.info('Carrito vaciado'); },
        error: () => { this.#items.set([]); this.#setOrigin('local'); this.#toast.info('Carrito vaciado'); }
      });
    } else {
      this.#items.set([]);
      this.#setOrigin('local');
      this.#toast.info('Carrito vaciado');
      this.#api.clear().subscribe({ next: (res) => this.replaceFromServer(res), error: () => {} });
    }
  }

  replaceFromServer(dto: CartDto) {
    if (!this.#shouldAcceptServerSnapshot(dto)) {
      return;
    }
    const items = dto.items.map(i => ({ productId: i.productId, name: i.name, sku: i.sku, price: i.price, qty: i.qty, stock: (i as any).stock, imageUrl: (i as any).imageUrl ?? null }));
    this.#items.set(items);
    this.#api.remember(dto.id);
    this.#setOrigin('server');
    // Enrich with product images if missing
    this.#enrichMissingImages();
  }

  increment(id: string, by = 1) {
    if (by <= 0) return;
    const currItem = this.#items().find(i => i.productId === id);
    if (currItem && Number.isFinite(currItem.stock as any) && (currItem.stock as number) > 0 && currItem.qty >= (currItem.stock as number)) {
      this.#toast.warning('Alcanzaste las existencias disponibles');
      return;
    }
    const currQty = currItem?.qty ?? 0;
    const desired = currQty + by;
    this.#setQtyLocal(id, desired);
    const updated = this.#items().find(i => i.productId === id);
    const target = updated?.qty ?? desired;
    this.#scheduleSetQtyServer(id, target);
  }

  decrement(id: string, by = 1) {
    if (by <= 0) return;
    const curr = this.#items().find(i => i.productId === id)?.qty ?? 0;
    const next = Math.max(0, curr - by);
    this.#setQtyLocal(id, next);
    const updated = this.#items().find(i => i.productId === id);
    const target = updated?.qty ?? next;
    this.#scheduleSetQtyServer(id, target);
  }

  setQty(id: string, qty: number) {
    if (!Number.isFinite(qty) || qty < 1) { this.remove(id); return; }
    const q = Math.floor(qty);
    this.#setQtyLocal(id, q);
    const updated = this.#items().find(i => i.productId === id);
    const target = updated?.qty ?? q;
    this.#scheduleSetQtyServer(id, target);
  }

  isServerSynced(): boolean {
    try { return localStorage.getItem(this.#originKey) === 'server'; } catch { return false; }
  }
  markServerSynced() { this.#setOrigin('server'); }
  markLocalChanged() { this.#setOrigin('local'); }
  // Restore snapshot (used for undo clear)
  restoreSnapshot(items: CartItem[]) {
    if (this.#auth.isAuthenticated()) {
      const body = items.map(i => ({ productId: i.productId, qty: i.qty }));
      this.#api.merge(body).subscribe({
        next: (res) => this.replaceFromServer(res),
        error: () => { this.#items.set(items); this.#setOrigin('local'); }
      });
    } else {
      this.#items.set(items);
      this.#setOrigin('local');
    }
  }

  #resetAfterSignOut() {
    this.#api.forget();
    this.#items.set([]);
    this.#coupon.set(null);
    this.#setOrigin('local');
    try {
      localStorage.removeItem(this.#storageKey);
      localStorage.removeItem(this.#couponKey);
      localStorage.removeItem(this.#originKey);
    } catch {}
    for (const timer of this.#qtyTimers.values()) {
      clearTimeout(timer);
    }
    this.#qtyTimers.clear();
    this.#imgLookupPending.clear();
  }

  #rehydrate(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.#storageKey);
      if (!raw) return [];
      const arr = JSON.parse(raw) as CartItem[];
      if (!Array.isArray(arr)) return [];
      return arr.filter(x => x && typeof x.productId === 'string' && Number.isFinite(x.price) && Number.isFinite(x.qty));
    } catch {
      return [];
    }
  }

  #setOrigin(v: 'server' | 'local') { try { localStorage.setItem(this.#originKey, v); } catch {} }

  // Local helpers
  #addLocal(p: Product, qty: number): boolean {
    let changed = false;
    const exists = this.#items().find(i => i.productId === p.id);
    if (exists) {
      this.#items.update(list => list.map(i => {
        if (i.productId !== p.id) return i;
        const stock = Number.isFinite(i.stock as any) ? (i.stock as number) : Infinity;
        const nextQty = Math.min(i.qty + qty, stock);
        if (nextQty !== i.qty) changed = true;
        if (nextQty === i.qty) this.#toast.warning('Alcanzaste las existencias disponibles');
        return { ...i, qty: nextQty };
      }));
    } else {
      const initialQty = Math.min(qty, Number.isFinite(p.stock as any) ? (p.stock as number) : qty);
      const firstImage = p.images && p.images.length ? p.images[0] : null;
      this.#items.update(list => [...list, { productId: p.id, name: `${p.brand} ${p.modelName} ${p.size}`, sku: p.sku, price: p.price, qty: initialQty, stock: p.stock, imageUrl: firstImage }]);
      if (initialQty < qty) this.#toast.warning('Se agregó el máximo disponible');
      changed = initialQty > 0;
    }
    this.#setOrigin('local');
    return changed;
  }
  #removeLocal(id: string) { this.#items.update(list => list.filter(i => i.productId !== id)); this.#setOrigin('local'); }
  #incrementLocal(id: string, by: number) { this.#items.update(list => list.map(i => i.productId === id ? { ...i, qty: i.qty + by } : i)); this.#setOrigin('local'); }
  #decrementLocal(id: string, by: number) {
    this.#items.update(list => list.flatMap(i => {
      if (i.productId !== id) return [i];
      const nextQty = i.qty - by;
      return nextQty > 0 ? [{ ...i, qty: nextQty }] : [];
    }));
    this.#setOrigin('local');
  }
  #setQtyLocal(id: string, qty: number) {
    this.#items.update(list => list.map(i => {
      if (i.productId !== id) return i;
      const max = Number.isFinite(i.stock as any) && (i.stock as number) > 0 ? Math.min(qty, i.stock as number) : qty;
      return { ...i, qty: max };
    }));
    this.#setOrigin('local');
  }
  // Debounced server update
  #qtyTimers = new Map<string, any>();
  #scheduleSetQtyServer(id: string, qty: number) {
    const prev = this.#qtyTimers.get(id);
    if (prev) clearTimeout(prev);
    const t = setTimeout(() => {
      this.#api.setQty(id, qty).subscribe({
        next: (res) => this.replaceFromServer(res),
        error: () => {
          this.markLocalChanged();
          this.#toast.warning('No se pudo actualizar la cantidad en el servidor');
        }
      });
    }, 250);
    this.#qtyTimers.set(id, t);
  }

  // Enrich missing images by fetching product details once per product
  #enrichMissingImages() {
    const list = this.#items();
    for (const i of list) {
      if (i.imageUrl || this.#imgLookupPending.has(i.productId)) continue;
      this.#imgLookupPending.add(i.productId);
      this.#productsApi.getProduct(i.productId)
        .pipe(switchMap(p => this.#assets.enrichProduct(p)))
        .subscribe({
          next: (p) => {
            const img = p.images && p.images.length ? p.images[0] : null;
            if (img) {
              this.#items.update(curr => curr.map(x => x.productId === i.productId ? { ...x, imageUrl: img, stock: p.stock ?? x.stock } : x));
            }
            this.#imgLookupPending.delete(i.productId);
          },
          error: () => { this.#imgLookupPending.delete(i.productId); }
        });
    }
  }

  // Coupons
  applyCoupon(code: string) {
    const trimmed = (code || '').trim();
    if (!trimmed) { this.#toast.info('Ingresa un código válido'); return; }
    this.#discounts.validate(trimmed).subscribe({
      next: (info) => { this.#coupon.set(info); this.#toast.success('Cupón aplicado'); },
      error: () => { this.#toast.danger('Cupón inválido o expirado'); }
    });
  }
  clearCoupon() { this.#coupon.set(null); this.#toast.info('Cupón removido'); }

  #rehydrateCoupon(): DiscountInfo | null {
    try { const raw = localStorage.getItem(this.#couponKey); return raw ? JSON.parse(raw) as DiscountInfo : null; } catch { return null; }
  }

  #shouldAcceptServerSnapshot(dto: CartDto): boolean {
    if (!dto) return false;
    if (!dto.userId) return true;
    if (!this.#auth.isAuthenticated()) {
      this.#api.forget();
      return false;
    }
    const current = this.#auth.user();
    const currentId = current?.id?.toLowerCase() ?? null;
    const dtoUserId = dto.userId.toLowerCase();
    if (currentId && dtoUserId !== currentId) {
      this.#api.forget();
      return false;
    }
    return true;
  }

  #undoRemove(item: CartItem) {
    if (this.#auth.isAuthenticated()) {
      this.#api.add(item.productId, item.qty).subscribe({
        next: (res) => this.replaceFromServer(res),
        error: () => this.#addItemRaw(item)
      });
    } else {
      this.#addItemRaw(item);
    }
  }
  #addItemRaw(item: CartItem) { this.#items.update(list => [...list, item]); this.#setOrigin('local'); }
}
