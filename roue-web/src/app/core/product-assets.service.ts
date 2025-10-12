import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { Product } from './models/product.model';

type Manifest = Record<string, string[]>;

@Injectable({ providedIn: 'root' })
export class ProductAssetsService {
  #http = inject(HttpClient);
  #manifest$?: Observable<Manifest>;

  enrichProduct(product: Product): Observable<Product> {
    return this.#loadManifest().pipe(
      map(manifest => this.#withImages(product, manifest))
    );
  }

  enrichProducts(products: Product[]): Observable<Product[]> {
    return this.#loadManifest().pipe(
      map(manifest => products.map(p => this.#withImages(p, manifest)))
    );
  }

  primaryImage(product: Product): Observable<string | null> {
    return this.enrichProduct(product).pipe(
      map(p => p.images && p.images.length ? p.images[0] : null)
    );
  }

  #withImages(product: Product, manifest: Manifest): Product {
    const merged = this.#mergeImages(product, manifest);
    const hasExisting = Array.isArray(product.images) && product.images.length > 0;
    if (!hasExisting && merged.length === 0) {
      return product;
    }
    if (hasExisting && this.#arraysEqual(product.images!, merged)) {
      return product;
    }
    return { ...product, images: merged };
  }

  #mergeImages(product: Product, manifest: Manifest): string[] {
    const seen = new Set<string>();
    const fromApi = Array.isArray(product.images) ? product.images : [];
    const normalizedApi = fromApi
      .map(src => this.#normalize(src))
      .filter((src): src is string => !!src)
      .filter(src => this.#dedupe(src, seen));

    const manifestImgs = this.#lookupManifest(product.sku, manifest)
      .filter(src => this.#dedupe(src, seen));

    return [...normalizedApi, ...manifestImgs];
  }

  #lookupManifest(sku: string, manifest: Manifest): string[] {
    if (!sku) return [];
    const key = sku.trim().toUpperCase();
    if (!key) return [];
    const entry = manifest[key];
    return Array.isArray(entry) ? entry : [];
  }

  #loadManifest(): Observable<Manifest> {
    if (!this.#manifest$) {
      this.#manifest$ = this.#http.get<Record<string, unknown>>('/assets/product/manifest.json').pipe(
        map(raw => this.#sanitizeManifest(raw)),
        catchError(() => of({} as Manifest)),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.#manifest$;
  }

  #sanitizeManifest(raw: Record<string, unknown>): Manifest {
    const manifest: Manifest = {};
    for (const [key, value] of Object.entries(raw)) {
      if (!Array.isArray(value)) continue;
      const sanitized = value
        .map(src => this.#normalize(src))
        .filter((src): src is string => !!src);
      if (sanitized.length === 0) continue;
      manifest[key.trim().toUpperCase()] = this.#uniqueCopy(sanitized);
    }
    return manifest;
  }

  #normalize(src: unknown): string | null {
    if (typeof src !== 'string') return null;
    let s = src.trim();
    if (!s) return null;
    s = s.replace(/\\/g, '/');
    if (/pzero-1_80\.jpg$/i.test(s)) return null;
    if (s.startsWith('http://') || s.startsWith('https://')) return s;
    if (s.startsWith('/assets/')) return this.#collapseSlashes(s);
    if (s.startsWith('assets/')) return this.#collapseSlashes('/' + s);
    if (s.startsWith('/product/')) return this.#collapseSlashes('/assets' + s);
    if (s.startsWith('product/')) return this.#collapseSlashes('/assets/' + s);
    if (s.startsWith('/')) return this.#collapseSlashes(s);
    return this.#collapseSlashes('/' + s);
  }

  #collapseSlashes(src: string): string {
    return src.replace(/\/{2,}/g, '/');
  }

  #dedupe(src: string, seen: Set<string>): boolean {
    const key = src.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }

  #uniqueCopy(list: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const item of list) {
      const key = item.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(item);
    }
    return result;
  }

  #arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
}
