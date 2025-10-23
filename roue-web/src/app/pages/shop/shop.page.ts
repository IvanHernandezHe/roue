import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { CartStore } from '../../state/cart.store';
import { ProductAssetsService } from '../../core/product-assets.service';
import { switchMap } from 'rxjs';

@Component({
  standalone: true,
  imports: [NgFor, NgIf, CurrencyPipe, ProductCardComponent, LucideAngularModule],
  styles: [`
    :host { display: block; }
    .filters-card {
      position: relative;
      border-radius: var(--brand-radius-lg);
      border: 1px solid var(--brand-border);
      background: linear-gradient(180deg, #ffffff 0%, #f4f6fb 100%);
      padding: 1.4rem;
      box-shadow: var(--shadow-soft);
    }
    .filters-card::before { content: none; }
    .filters-sticky { position: sticky; top: 96px; }
    .filter-title { font-family: var(--font-display); letter-spacing: .08em; text-transform: uppercase; font-size: .85rem; }
    .filters-card .form-label { font-weight: 600; color: var(--brand-muted); letter-spacing: .02em; }
    .filters-card .section + .section { border-top: 1px dashed color-mix(in srgb, var(--brand-border) 70%, #ffffff); padding-top: .85rem; margin-top: .85rem; }
    .filters-card .brands-scroll { max-height: 220px; overflow: auto; }
    .filters-card .form-select,
    .filters-card .form-control { font-size: .9rem; border-radius: var(--brand-radius-sm); }
    .filters-card .form-select:focus,
    .filters-card .form-control:focus { border-color: var(--brand-primary); box-shadow: 0 0 0 4px rgba(29, 111, 200, 0.12); background: var(--brand-cloud); }

    .chips { display: flex; flex-wrap: wrap; gap: .45rem .6rem; }
    .chips .form-check {
      margin: 0;
      padding: .25rem .75rem;
      border-radius: var(--brand-radius-sm);
      border: 1px solid var(--brand-border);
      background: #ffffff;
      display: inline-flex;
      align-items: center;
      gap: .35rem;
      transition: border-color .18s ease, background .18s ease, color .18s ease;
    }
    .chips .form-check-input { margin: 0; pointer-events: auto; }
    .chips .form-check-label { font-size: .85rem; font-weight: 600; letter-spacing: .02em; cursor: pointer; }
    .chips .form-check:hover { border-color: var(--brand-primary); }
    .chips .form-check.is-selected {
      background: var(--surface-subtle);
      border-color: var(--brand-primary);
      color: var(--brand-primary-dark);
    }
    .chips .form-check.is-selected .form-check-label { color: inherit; }

    .list-check { display: block; }
    .list-check .form-check {
      display: flex;
      align-items: center;
      gap: .6rem;
      padding: .55rem .7rem;
      border-radius: var(--brand-radius-sm);
      border: 1px solid var(--brand-border);
      background: #ffffff;
      margin-bottom: .45rem;
      cursor: pointer;
      transition: border-color .18s ease, background .18s ease;
    }
    .list-check .form-check:hover { border-color: var(--brand-primary); }
    .list-check .form-check-input { margin-top: 0; }
    .list-check .form-check-label { font-size: .92rem; cursor: pointer; flex: 1; }
    .list-check .form-check.is-selected {
      border-color: var(--brand-primary);
      background: var(--surface-subtle);
      color: var(--brand-primary-dark);
    }

    .results-head { gap: .75rem; }
    .active-filters { margin-bottom: .75rem; display: flex; flex-wrap: wrap; gap: .6rem; }
    .filter-chip {
      display: inline-flex;
      align-items: center;
      gap: .35rem;
      padding: .35rem .75rem;
      border-radius: var(--brand-radius-sm);
      border: 1px solid var(--brand-border);
      background: #ffffff;
      font-size: .88rem;
      font-weight: 600;
      letter-spacing: .01em;
      transition: border-color .18s ease, background .18s ease;
    }
    .filter-chip:hover { border-color: var(--brand-primary); background: var(--surface-subtle); }
    .filter-chip .btn-clear {
      border: none;
      background: transparent;
      padding: 0;
      display: inline-flex;
      align-items: center;
      color: inherit;
      cursor: pointer;
    }
    .filter-chip--accent {
      border-color: var(--brand-primary);
      background: var(--surface-subtle);
      color: var(--brand-primary-dark);
    }

    .filters-toggle { display: none; }
    @media (max-width: 991.98px) { .filters-toggle { display: inline-flex; } .filters-sticky { position: static; } }

    .filters-overlay {
      position: fixed;
      inset: 0;
      background: rgba(7, 12, 24, .35);
      z-index: 1040;
    }
    .filters-drawer {
      position: fixed;
      right: 0;
      top: 0;
      bottom: 0;
      width: min(92vw, 420px);
      background: linear-gradient(180deg, #ffffff 0%, #f4f6fb 100%);
      z-index: 1041;
      border-left: 1px solid var(--brand-border);
      animation: drawerIn .24s cubic-bezier(.22,1,.32,1);
      overflow-y: auto;
      padding: 1.25rem;
      box-shadow: var(--shadow-soft);
    }
    @keyframes drawerIn { from { transform: translateX(24px); opacity: .9; } to { transform: translateX(0); opacity: 1; } }
    .filters-sticky-footer {
      position: sticky;
      bottom: 0;
      background: #ffffff;
      border-top: 1px solid var(--brand-border);
      margin: 1rem -1rem -1rem;
      padding: 1rem;
    }

    .price-range {
      --price-track-base: color-mix(in srgb, var(--brand-border) 70%, #ffffff);
      --price-track-fill: var(--brand-primary);
    }
    .price-range .range-values { display: flex; justify-content: space-between; font-size: .85rem; color: var(--brand-muted); margin-bottom: .35rem; }
    .price-range .range-inputs { position: relative; height: 34px; }
    .price-range .range-track {
      position: absolute;
      left: 0;
      right: 0;
      top: 14px;
      height: 4px;
      border-radius: var(--brand-radius-sm);
      background: var(--price-track-base);
    }
    .price-range .range-fill {
      position: absolute;
      top: 14px;
      height: 4px;
      border-radius: var(--brand-radius-sm);
      background: var(--price-track-fill);
      pointer-events: none;
      transition: left .18s ease, width .18s ease;
    }
    .price-range input[type=range] {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      width: 100%;
      appearance: none;
      height: 34px;
      background: none;
      pointer-events: none;
    }
    .price-range input[type=range]::-webkit-slider-thumb {
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--brand-primary);
      border: 2px solid #fff;
      pointer-events: auto;
      cursor: pointer;
    }
    .price-range input[type=range]::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--brand-primary);
      border: none;
      pointer-events: auto;
      cursor: pointer;
    }
    .price-range input[type=range].min { z-index: 3; }
    .price-range input[type=range].max { z-index: 2; }

    :host-context([data-bs-theme='dark']) .filters-card,
    :host-context([data-bs-theme='dark']) .filters-drawer {
      background: var(--brand-cloud);
      border-color: var(--brand-border);
    }
    :host-context([data-bs-theme='dark']) .filters-card::before { content: none; }
    :host-context([data-bs-theme='dark']) .filters-card .section + .section { border-top-color: var(--brand-border); }
    :host-context([data-bs-theme='dark']) .chips .form-check,
    :host-context([data-bs-theme='dark']) .list-check .form-check {
      background: var(--brand-cloud);
      border-color: var(--brand-border);
      color: var(--brand-ink);
    }
    :host-context([data-bs-theme='dark']) .chips .form-check.is-selected,
    :host-context([data-bs-theme='dark']) .list-check .form-check.is-selected {
      background: var(--surface-subtle);
      border-color: var(--brand-primary);
      color: var(--brand-primary);
    }
    :host-context([data-bs-theme='dark']) .filter-chip {
      background: var(--brand-cloud);
      border-color: var(--brand-border);
      color: var(--brand-ink);
    }
    :host-context([data-bs-theme='dark']) .filter-chip--accent {
      border-color: var(--brand-primary);
      background: var(--surface-subtle);
      color: var(--brand-primary);
    }
    :host-context([data-bs-theme='dark']) .filters-sticky-footer {
      background: var(--brand-cloud);
      border-top-color: var(--brand-border);
    }
    :host-context([data-bs-theme='dark']) .price-range {
      --price-track-base: rgba(92,108,148,.35);
    }
  `],
  template: `
  <section class="container my-4">
    <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-2 mb-3">
      <h2 class="m-0">Tienda</h2>
      <div class="d-flex align-items-center gap-2 w-100 w-lg-auto">
        <input #q class="form-control" [value]="currentQuery" placeholder="Buscar marca, modelo o SKU" (input)="onSearch(q.value)"/>
        <button class="btn btn-outline-secondary" (click)="onSearch('')">Limpiar</button>
        <button class="btn btn-dark filters-toggle" type="button" (click)="openFilters()">
          <lucide-icon name="sliders-horizontal" size="18" class="me-1"></lucide-icon>
          Filtros
          <span *ngIf="activeFilterCount() > 0" class="badge text-bg-light text-dark ms-2">{{ activeFilterCount() }}</span>
        </button>
      </div>
    </div>
    <div class="row g-3">
      <!-- Sidebar Filters -->
      <aside class="col-12 col-lg-3 d-none d-lg-block">
        <div class="feature p-3 filters-card filters-sticky">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="h6 m-0 filter-title">Filtros</div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-dark" (click)="undo()" [disabled]="!canUndo" title="Retrocede un paso en los filtros">Deshacer</button>
              <button class="btn btn-sm btn-outline-secondary" (click)="resetFilters()">Limpiar</button>
            </div>
          </div>
          <div class="mb-3 section">
            <label class="form-label small text-muted">Categoría</label>
            <select class="form-select form-select-sm" (change)="onCategory($any($event.target).value)" [value]="selectedCategory">
              <option value="">Todas</option>
              <option *ngFor="let c of categoriesAll" [value]="c">{{c}}</option>
            </select>
          </div>
          <div class="mb-3 section">
            <label class="form-label small text-muted">Marca</label>
            <div class="list-check brands-scroll">
              <div class="form-check" *ngFor="let b of brandsAll" [class.is-selected]="brandsSelected.has(b.key)">
                <input class="form-check-input" type="checkbox" [attr.id]="idFor('b', b.key)" [checked]="brandsSelected.has(b.key)" (change)="toggleSet(brandsSelected, b.key, $any($event.target).checked)"/>
                <label class="form-check-label" [attr.for]="idFor('b', b.key)">{{ b.label }}</label>
              </div>
            </div>
          </div>
          <div class="mb-3 section">
            <label class="form-label small text-muted">Modelo</label>
            <input #model class="form-control form-control-sm" placeholder="Ej. P-Zero" (input)="setModelQuery(model.value)" [value]="modelQuery"/>
          </div>
          <div class="mb-3 section price-range" *ngIf="priceBounds || globalPriceBounds">
            <label class="form-label small text-muted">Precio</label>
            <div class="range-values"><span>{{ priceMin | currency:'MXN':'symbol-narrow' }}</span><span>{{ priceMax | currency:'MXN':'symbol-narrow' }}</span></div>
            <div class="range-inputs">
            <div class="range-track"></div>
            <div class="range-fill" [style.left.%]="priceFillLeft()" [style.width.%]="priceFillWidth()"></div>
              <input class="min" type="range" [attr.min]="priceMinBound()" [attr.max]="priceMaxBound()" [step]="priceStep" [value]="priceMin" (input)="onPriceMin($any($event.target).value)"/>
              <input class="max" type="range" [attr.min]="priceMinBound()" [attr.max]="priceMaxBound()" [step]="priceStep" [value]="priceMax" (input)="onPriceMax($any($event.target).value)"/>
            </div>
          </div>

          <div class="row g-2 mb-3 section">
            <div class="col-4">
              <label class="form-label small text-muted">Ancho</label>
              <select class="form-select form-select-sm" (change)="setWidth($any($event.target).value)" [value]="widthSelected ?? ''">
                <option [value]="''">Todos</option>
                <option *ngFor="let w of widthsAll" [value]="w">{{w}}</option>
              </select>
            </div>
            <div class="col-4">
              <label class="form-label small text-muted">Alto</label>
              <select class="form-select form-select-sm" (change)="setAspect($any($event.target).value)" [value]="aspectSelected ?? ''">
                <option [value]="''">Todos</option>
                <option *ngFor="let a of aspectsAll" [value]="a">{{a}}</option>
              </select>
            </div>
            <div class="col-4">
              <label class="form-label small text-muted">Rin</label>
              <select class="form-select form-select-sm" (change)="setRim($any($event.target).value)" [value]="rimSelected ?? ''">
                <option [value]="''">Todos</option>
                <option *ngFor="let r of rimsAll" [value]="r">{{r}}</option>
              </select>
            </div>
          </div>

          <div class="row g-2 mb-3 section">
            <div class="col-6">
              <label class="form-label small text-muted">Tipo</label>
              <div class="chips">
                <div class="form-check" *ngFor="let t of typesAll" [class.is-selected]="typesSelected.has(t)">
                  <input class="form-check-input" type="checkbox" [id]="'t-'+t" [checked]="typesSelected.has(t)" (change)="toggleSet(typesSelected, t, $any($event.target).checked)"/>
                  <label class="form-check-label" [for]="'t-'+t">{{t}}</label>
                </div>
              </div>
            </div>
            <div class="col-6">
              <label class="form-label small text-muted">Velocidad</label>
              <div class="chips">
                <div class="form-check" *ngFor="let s of speedRatingsAll" [class.is-selected]="speedSelected.has(s)">
                  <input class="form-check-input" type="checkbox" [id]="'s-'+s" [checked]="speedSelected.has(s)" (change)="toggleSet(speedSelected, s, $any($event.target).checked)"/>
                  <label class="form-check-label" [for]="'s-'+s">{{s}}</label>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-2 section">
            <label class="form-label small text-muted">Rango de carga</label>
            <div class="chips">
              <div class="form-check" *ngFor="let l of loadIndicesAll" [class.is-selected]="loadSelected.has(l)">
                <input class="form-check-input" type="checkbox" [id]="'l-'+l" [checked]="loadSelected.has(l)" (change)="toggleSet(loadSelected, l, $any($event.target).checked)"/>
                <label class="form-check-label" [for]="'l-'+l">{{l}}</label>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Product Grid -->
      <div class="col-12 col-lg-9">
        <div class="d-flex flex-wrap align-items-center justify-content-between results-head mb-2">
          <div class="h6 m-0">{{ products.length }} resultados</div>
        </div>
        <div class="active-filters chips" *ngIf="hasActiveFilters()">
          <span class="filter-chip filter-chip--accent" *ngIf="selectedCategory">
            {{ selectedCategory }}
            <button class="btn-clear" (click)="onCategory('')" aria-label="Quitar categoría">
              <lucide-icon name="x" size="16"></lucide-icon>
            </button>
          </span>
          <ng-container *ngFor="let b of brandFilters()">
            <span class="filter-chip">
              {{ brandLabel(b) }}
              <button class="btn-clear" (click)="toggleSet(brandsSelected, b, false)" aria-label="Quitar marca {{b}}">
                <lucide-icon name="x" size="16"></lucide-icon>
              </button>
            </span>
          </ng-container>
          <span class="filter-chip" *ngIf="modelQuery">
            Modelo: {{ modelQuery }}
            <button class="btn-clear" (click)="setModelQuery('')" aria-label="Quitar modelo">
              <lucide-icon name="x" size="16"></lucide-icon>
            </button>
          </span>
          <span class="filter-chip" *ngIf="widthSelected !== undefined">
            Ancho: {{ widthSelected }}
            <button class="btn-clear" (click)="setWidth('')" aria-label="Quitar ancho">
              <lucide-icon name="x" size="16"></lucide-icon>
            </button>
          </span>
          <span class="filter-chip" *ngIf="aspectSelected !== undefined">
            Alto: {{ aspectSelected }}
            <button class="btn-clear" (click)="setAspect('')" aria-label="Quitar alto">
              <lucide-icon name="x" size="16"></lucide-icon>
            </button>
          </span>
          <span class="filter-chip" *ngIf="rimSelected !== undefined">
            Rin: {{ rimSelected }}
            <button class="btn-clear" (click)="setRim('')" aria-label="Quitar rin">
              <lucide-icon name="x" size="16"></lucide-icon>
            </button>
          </span>
          <ng-container *ngFor="let t of arr(typesSelected)">
            <span class="filter-chip">
              Tipo: {{ t }}
              <button class="btn-clear" (click)="toggleSet(typesSelected, t, false)" aria-label="Quitar tipo {{t}}">
                <lucide-icon name="x" size="16"></lucide-icon>
              </button>
            </span>
          </ng-container>
          <ng-container *ngFor="let s of arr(speedSelected)">
            <span class="filter-chip">
              Vel: {{ s }}
              <button class="btn-clear" (click)="toggleSet(speedSelected, s, false)" aria-label="Quitar velocidad {{s}}">
                <lucide-icon name="x" size="16"></lucide-icon>
              </button>
            </span>
          </ng-container>
          <ng-container *ngFor="let l of arr(loadSelected)">
            <span class="filter-chip">
              Carga: {{ l }}
              <button class="btn-clear" (click)="toggleSet(loadSelected, l, false)" aria-label="Quitar carga {{l}}">
                <lucide-icon name="x" size="16"></lucide-icon>
              </button>
            </span>
          </ng-container>
          <span class="filter-chip" *ngIf="priceFilterActive()">
            Precio: {{ priceMin | currency:'MXN':'symbol-narrow' }} – {{ priceMax | currency:'MXN':'symbol-narrow' }}
            <button class="btn-clear" (click)="resetPriceFilter()" aria-label="Quitar precio">
              <lucide-icon name="x" size="16"></lucide-icon>
            </button>
          </span>
        </div>
        <div class="row g-3">
          <div class="col-12 col-sm-6 col-lg-4" *ngFor="let p of products; trackBy: trackById">
            <app-product-card [product]="p"></app-product-card>
          </div>
          <div class="col-12" *ngIf="!products.length">
            <div class="alert alert-info">No se encontraron resultados con los filtros seleccionados.</div>
          </div>
        </div>
      </div>
    </div>
    <!-- Mobile filters drawer -->
    <div *ngIf="filtersOpen" class="filters-overlay" (click)="closeFilters()"></div>
    <div *ngIf="filtersOpen" class="filters-drawer">
      <div class="feature p-3 filters-card">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div class="h6 m-0 filter-title">Filtros</div>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-secondary" (click)="resetFilters()">Limpiar</button>
            <button class="btn btn-sm btn-outline-dark" (click)="closeFilters()">Cerrar</button>
          </div>
        </div>
        <div class="mb-3 section">
          <label class="form-label small text-muted">Categoría</label>
          <select class="form-select form-select-sm" (change)="onCategory($any($event.target).value)" [value]="selectedCategory">
            <option value="">Todas</option>
            <option *ngFor="let c of categoriesAll" [value]="c">{{c}}</option>
          </select>
        </div>
          <div class="mb-3 section">
          <label class="form-label small text-muted">Marca</label>
          <div class="list-check brands-scroll">
            <div class="form-check" *ngFor="let b of brandsAll" [class.is-selected]="brandsSelected.has(b.key)">
              <input class="form-check-input" type="checkbox" [attr.id]="idFor('mb-b', b.key)" [checked]="brandsSelected.has(b.key)" (change)="toggleSet(brandsSelected, b.key, $any($event.target).checked)"/>
              <label class="form-check-label" [attr.for]="idFor('mb-b', b.key)">{{ b.label }}</label>
            </div>
          </div>
        </div>
        <div class="mb-3 section">
          <label class="form-label small text-muted">Modelo</label>
          <input #modelMb class="form-control form-control-sm" placeholder="Ej. P-Zero" (input)="setModelQuery(modelMb.value)" [value]="modelQuery"/>
        </div>
        <div class="mb-3 section price-range" *ngIf="priceBounds || globalPriceBounds">
          <label class="form-label small text-muted">Precio</label>
          <div class="range-values"><span>{{ priceMin | currency:'MXN':'symbol-narrow' }}</span><span>{{ priceMax | currency:'MXN':'symbol-narrow' }}</span></div>
          <div class="range-inputs">
            <div class="range-track"></div>
            <div class="range-fill" [style.left.%]="priceFillLeft()" [style.width.%]="priceFillWidth()"></div>
            <input class="min" type="range" [attr.min]="priceMinBound()" [attr.max]="priceMaxBound()" [step]="priceStep" [value]="priceMin" (input)="onPriceMin($any($event.target).value)"/>
            <input class="max" type="range" [attr.min]="priceMinBound()" [attr.max]="priceMaxBound()" [step]="priceStep" [value]="priceMax" (input)="onPriceMax($any($event.target).value)"/>
          </div>
        </div>
        <div class="row g-2 mb-3 section">
          <div class="col-4">
            <label class="form-label small text-muted">Ancho</label>
            <select class="form-select form-select-sm" (change)="setWidth($any($event.target).value)" [value]="widthSelected ?? ''">
              <option [value]="''">Todos</option>
              <option *ngFor="let w of widthsAll" [value]="w">{{w}}</option>
            </select>
          </div>
          <div class="col-4">
            <label class="form-label small text-muted">Alto</label>
            <select class="form-select form-select-sm" (change)="setAspect($any($event.target).value)" [value]="aspectSelected ?? ''">
              <option [value]="''">Todos</option>
              <option *ngFor="let a of aspectsAll" [value]="a">{{a}}</option>
            </select>
          </div>
          <div class="col-4">
            <label class="form-label small text-muted">Rin</label>
            <select class="form-select form-select-sm" (change)="setRim($any($event.target).value)" [value]="rimSelected ?? ''">
              <option [value]="''">Todos</option>
              <option *ngFor="let r of rimsAll" [value]="r">{{r}}</option>
            </select>
          </div>
        </div>
        <div class="row g-2 mb-3 section">
          <div class="col-6">
            <label class="form-label small text-muted">Tipo</label>
            <div class="chips">
              <div class="form-check" *ngFor="let t of typesAll">
                <input class="form-check-input" type="checkbox" [attr.id]="idFor('mb-t', t)" [checked]="typesSelected.has(t)" (change)="toggleSet(typesSelected, t, $any($event.target).checked)"/>
                <label class="form-check-label" [attr.for]="idFor('mb-t', t)">{{t}}</label>
              </div>
            </div>
          </div>
          <div class="col-6">
            <label class="form-label small text-muted">Velocidad</label>
            <div class="chips">
              <div class="form-check" *ngFor="let s of speedRatingsAll">
                <input class="form-check-input" type="checkbox" [attr.id]="idFor('mb-s', s)" [checked]="speedSelected.has(s)" (change)="toggleSet(speedSelected, s, $any($event.target).checked)"/>
                <label class="form-check-label" [attr.for]="idFor('mb-s', s)">{{s}}</label>
              </div>
            </div>
          </div>
        </div>
        <div class="mb-2 section">
          <label class="form-label small text-muted">Rango de carga</label>
          <div class="chips">
            <div class="form-check" *ngFor="let l of loadIndicesAll">
              <input class="form-check-input" type="checkbox" [attr.id]="idFor('mb-l', l)" [checked]="loadSelected.has(l)" (change)="toggleSet(loadSelected, l, $any($event.target).checked)"/>
              <label class="form-check-label" [attr.for]="idFor('mb-l', l)">{{l}}</label>
            </div>
          </div>
        </div>
        <div class="filters-sticky-footer">
          <div class="d-grid gap-2">
            <button class="btn btn-dark" (click)="applyAndClose()">Aplicar</button>
            <button class="btn btn-outline-dark" (click)="closeFilters()">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  </section>
  `
})
export class ShopPage {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cart = inject(CartStore);
  private assets = inject(ProductAssetsService);
  products: Product[] = [];
  private allProducts: Product[] = [];
  currentQuery = '';
  categoriesAll: string[] = [];
  selectedCategory = '';
  // Filters state
  canUndo = false;
  brandsAll: { key: string; label: string }[] = [];
  brandLabels = new Map<string, string>();
  brandsSelected = new Set<string>();
  modelQuery = '';
  widthsAll: number[] = [];
  aspectsAll: number[] = [];
  rimsAll: number[] = [];
  widthSelected?: number;
  aspectSelected?: number;
  rimSelected?: number;
  typesAll: string[] = [];
  typesSelected = new Set<string>();
  loadIndicesAll: string[] = [];
  loadSelected = new Set<string>();
  speedRatingsAll: string[] = [];
  speedSelected = new Set<string>();
  arr<T>(s: Set<T>): T[] { return Array.from(s); }
  filtersOpen = false;
  readonly priceStep = 50;
  priceMin = 0;
  priceMax = 0;
  priceBounds: { min: number; max: number } | null = null;
  globalPriceBounds: { min: number; max: number } | null = null;

  add(p: Product) { this.cart.add(p); }

  onSearch(q: string) {
    const t = (q || '').trim();
    if (t === this.currentQuery) return;
    this.currentQuery = t;
    this.load();
  }

  onCategory(c: string) {
    const next = (c || '').trim();
    if (next === this.selectedCategory) return;
    this.selectedCategory = next;
    this.load();
  }
  trackById(_: number, p: Product) { return p.id; }
  private load() {
    this.api.getProducts(this.currentQuery || undefined, this.selectedCategory || undefined)
      .pipe(
        switchMap(list => this.assets.enrichProducts(list))
      )
      .subscribe(list => {
        this.allProducts = list;
        this.buildOptions(list);
        this.syncPriceBounds();
        this.applyFilters('other');
      });
  }

  private buildOptions(list: Product[]) {
    const categories = new Set<string>();
    const brands = new Map<string, string>();
    const widths = new Set<number>();
    const aspects = new Set<number>();
    const rims = new Set<number>();
    const types = new Set<string>();
    const loads = new Set<string>();
    const speeds = new Set<string>();

    let minPrice = Number.POSITIVE_INFINITY;
    let maxPrice = Number.NEGATIVE_INFINITY;
    for (const p of list) {
      const category = (p.category || '').trim();
      if (category) categories.add(category);
      const brandName = (p.brand || '').trim();
      if (brandName) {
        const brandKey = this.normalizeKey(brandName);
        if (!brands.has(brandKey)) brands.set(brandKey, brandName);
      }
      const parts = this.parseSize(p.size);
      if (parts) {
        widths.add(parts.width);
        aspects.add(parts.aspect);
        rims.add(parts.rim);
      }
      const rimD = p.rim?.diameterIn;
      if (rimD && Number.isFinite(rimD)) rims.add(Number(rimD));
      const t = (p.tire?.type || '').trim(); if (t) types.add(t.toUpperCase());
      const li = (p.tire?.loadIndex || '').trim(); if (li) loads.add(li);
      const sr = (p.tire?.speedRating || '').trim(); if (sr) speeds.add(sr.toUpperCase());
      if (Number.isFinite(p.price)) {
        if (p.price < minPrice) minPrice = p.price;
        if (p.price > maxPrice) maxPrice = p.price;
      }
    }

    this.categoriesAll = Array.from(categories).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
    const brandEntries = Array.from(brands.entries()).sort(([, a], [, b]) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
    this.brandsAll = brandEntries.map(([key, label]) => ({ key, label }));
    this.brandLabels = new Map(brandEntries);
    this.widthsAll = Array.from(widths).sort((a,b)=>a-b);
    this.aspectsAll = Array.from(aspects).sort((a,b)=>a-b);
    this.rimsAll = Array.from(rims).sort((a,b)=>a-b);
    this.typesAll = Array.from(types).sort((a,b)=>a.localeCompare(b));
    this.loadIndicesAll = Array.from(loads).sort((a,b)=>a.localeCompare(b));
    this.speedRatingsAll = Array.from(speeds).sort((a,b)=>a.localeCompare(b));
    if (minPrice !== Number.POSITIVE_INFINITY && maxPrice !== Number.NEGATIVE_INFINITY) {
      const minBound = Math.floor(minPrice / this.priceStep) * this.priceStep;
      let maxBound = Math.ceil(maxPrice / this.priceStep) * this.priceStep;
      if (maxBound === minBound) maxBound = minBound + this.priceStep;
      const isUnset = this.priceMin === 0 && this.priceMax === 0;
      const hadPrice = !isUnset && this.priceFilterActive();
      this.globalPriceBounds = { min: minBound, max: maxBound };
      this.priceBounds = { ...this.globalPriceBounds };
      if (!hadPrice) {
        this.priceMin = minBound;
        this.priceMax = maxBound;
      }
    } else {
      this.globalPriceBounds = null;
      this.priceBounds = null;
      this.priceMin = 0;
      this.priceMax = 0;
    }
  }

  private applyFilters(source: 'price' | 'other' = 'other') {
    const q = this.currentQuery;
    const brandKeys = this.brandsSelected;
    const hasBrandFilter = brandKeys.size > 0;
    const widthSel = this.widthSelected;
    const aspectSel = this.aspectSelected;
    const rimSel = this.rimSelected;
    const typeSet = this.typesSelected;
    const loadSet = this.loadSelected;
    const speedSet = this.speedSelected;
    const modelQ = this.normalizeKey(this.modelQuery);
    const normalizedQuery = this.normalizeKey(q);

    const has = (s: Set<any>) => s && s.size > 0;

    let filtered = this.allProducts.filter(p => {
      if (normalizedQuery) {
        const searchable = this.normalizeKey(`${p.brand ?? ''} ${p.modelName ?? ''} ${p.sku ?? ''} ${p.size ?? ''}`);
        if (!searchable.includes(normalizedQuery)) return false;
      }

      const category = (p.category || '').trim();
      if (this.selectedCategory && category !== this.selectedCategory) return false;

      const brandKey = this.normalizeKey(p.brand);
      if (hasBrandFilter && (!brandKey || !brandKeys.has(brandKey))) return false;

      if (modelQ) {
        const modelName = this.normalizeKey(p.modelName);
        if (!modelName.includes(modelQ)) return false;
      }

      const parts = this.parseSize(p.size);
      if (widthSel !== undefined && !(parts && parts.width === widthSel)) return false;
      if (aspectSel !== undefined && !(parts && parts.aspect === aspectSel)) return false;
      // rim can come from tire size or rim.diameterIn (for rims category)
      const rimFromProduct = Number(p.rim?.diameterIn);
      const rimCandidate = parts?.rim ?? (Number.isFinite(rimFromProduct) ? rimFromProduct : null);
      if (rimSel !== undefined && !(rimCandidate !== null && rimCandidate === rimSel)) return false;

      const t = (p.tire?.type || '').trim().toUpperCase();
      if (has(typeSet) && !(t && typeSet.has(t))) return false;
      const li = (p.tire?.loadIndex || '').trim();
      if (has(loadSet) && !(li && loadSet.has(li))) return false;
      const sr = (p.tire?.speedRating || '').trim().toUpperCase();
      if (has(speedSet) && !(sr && speedSet.has(sr))) return false;

      // Price range (apply only if slider is narrowed inside current bounds)
      const bounds = this.priceBounds || this.globalPriceBounds;
      const usingCustomPrice = !!bounds && (this.priceMin > bounds.min || this.priceMax < bounds.max);
      if (usingCustomPrice && !(p.price >= this.priceMin && p.price <= this.priceMax)) return false;

      return true;
    });

    this.products = filtered;
    if (source !== 'price') {
      if (filtered.length) {
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;
        for (const p of filtered) {
          if (Number.isFinite(p.price)) {
            if (p.price < min) min = p.price;
            if (p.price > max) max = p.price;
          }
        }
        if (min !== Number.POSITIVE_INFINITY && max !== Number.NEGATIVE_INFINITY) {
          const minBound = Math.floor(min / this.priceStep) * this.priceStep;
          let maxBound = Math.ceil(max / this.priceStep) * this.priceStep;
          if (maxBound === minBound) maxBound = minBound + this.priceStep;
          this.priceBounds = { min: minBound, max: maxBound };
        } else {
          this.priceBounds = this.globalPriceBounds ? { ...this.globalPriceBounds } : null;
        }
      } else {
        this.priceBounds = this.globalPriceBounds ? { ...this.globalPriceBounds } : null;
      }
    }
    this.syncPriceBounds();
    this.syncUrlAndPersist();
  }

  setModelQuery(v: string) {
    const next = (v || '').trim();
    if (next === this.modelQuery) return;
    this.modelQuery = next;
    this.applyFilters('other');
  }

  toggleSet<T>(set: Set<T>, value: T, checked: boolean | undefined) {
    let normalized: any = value;
    if (set === (this.brandsSelected as unknown as Set<any>)) {
      normalized = this.normalizeKey(String(value ?? '')) as any;
    } else if (typeof value === 'string') {
      normalized = value.trim();
    }
    if (!normalized && normalized !== 0) {
      if (!checked) return;
    }
    const next = new Set<T>(set);
    if (checked) {
      if (next.has(normalized)) return;
      next.add(normalized);
    } else {
      if (!next.has(normalized)) return;
      next.delete(normalized);
    }
    if (set === (this.brandsSelected as unknown as Set<any>)) {
      this.brandsSelected = next as unknown as Set<string>;
    } else if (set === (this.typesSelected as unknown as Set<any>)) {
      this.typesSelected = next as unknown as Set<string>;
    } else if (set === (this.speedSelected as unknown as Set<any>)) {
      this.speedSelected = next as unknown as Set<string>;
    } else if (set === (this.loadSelected as unknown as Set<any>)) {
      this.loadSelected = next as unknown as Set<string>;
    } else {
      set.clear();
      next.forEach(v => set.add(v as any));
    }
    this.applyFilters('other');
  }

  setWidth(value: string) {
    const next = value ? Number(value) : undefined;
    if (next === this.widthSelected) return;
    this.widthSelected = next;
    this.applyFilters('other');
  }
  setAspect(value: string) {
    const next = value ? Number(value) : undefined;
    if (next === this.aspectSelected) return;
    this.aspectSelected = next;
    this.applyFilters('other');
  }
  setRim(value: string) {
    const next = value ? Number(value) : undefined;
    if (next === this.rimSelected) return;
    this.rimSelected = next;
    this.applyFilters('other');
  }

  resetFilters() {
    this.brandsSelected.clear();
    this.modelQuery = '';
    this.widthSelected = undefined;
    this.aspectSelected = undefined;
    this.rimSelected = undefined;
    this.typesSelected.clear();
    this.loadSelected.clear();
    this.speedSelected.clear();
    if (this.globalPriceBounds) {
      this.priceBounds = { ...this.globalPriceBounds };
      this.priceMin = this.globalPriceBounds.min;
      this.priceMax = this.globalPriceBounds.max;
    } else {
      this.priceBounds = null;
      this.priceMin = 0;
      this.priceMax = 0;
    }
    // Also clear search and category to truly reset
    this.currentQuery = '';
    this.selectedCategory = '';
    this.load();
  }

  hasActiveFilters() {
    const priceBounds = this.priceBounds || this.globalPriceBounds;
    return !!(
      this.selectedCategory || this.modelQuery ||
      this.widthSelected !== undefined || this.aspectSelected !== undefined || this.rimSelected !== undefined ||
      this.brandsSelected.size || this.typesSelected.size || this.speedSelected.size || this.loadSelected.size ||
      (priceBounds && (this.priceMin > priceBounds.min || this.priceMax < priceBounds.max))
    );
  }

  activeFilterCount(): number {
    let n = 0;
    if (this.selectedCategory) n++;
    if (this.modelQuery) n++;
    if (this.widthSelected !== undefined) n++;
    if (this.aspectSelected !== undefined) n++;
    if (this.rimSelected !== undefined) n++;
    n += this.brandsSelected.size;
    n += this.typesSelected.size;
    n += this.speedSelected.size;
    n += this.loadSelected.size;
    if (this.priceFilterActive()) n++;
    return n;
  }

  private parseSize(size: string | null | undefined): { width: number; aspect: number; rim: number } | null {
    if (!size) return null;
    const raw = String(size).toUpperCase();
    const sanitized = raw.replace(/-/g, ' ');
    const widthAspect = sanitized.match(/(\d{3})\s*\/\s*(\d{2,3})/);
    if (!widthAspect) return null;
    const width = Number(widthAspect[1]);
    const aspect = Number(widthAspect[2]);
    const searchFrom = widthAspect.index !== undefined ? widthAspect.index + widthAspect[0].length : 0;
    const remainder = sanitized.slice(searchFrom);
    const rimMatch = remainder.match(/[A-Z]*\s*R\s*(\d{1,2}(?:\.\d)?)/) || sanitized.match(/R\s*(\d{1,2}(?:\.\d)?)/);
    if (!rimMatch) return null;
    const rim = Number(rimMatch[1]);
    if (!Number.isFinite(width) || !Number.isFinite(aspect) || !Number.isFinite(rim)) return null;
    return { width, aspect, rim };
  }

  private normalizeKey(value: string | null | undefined): string {
    const trimmed = (value ?? '').toString().trim().toLowerCase();
    return trimmed ? trimmed.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
  }

  private toQueryParams() {
    const csv = (s: Set<string>) => {
      if (!s.size) return undefined;
      const items = Array.from(s, v => (v ?? '').toString().trim()).filter(Boolean).sort();
      return items.length ? items.join(',') : undefined;
    };
    const num = (v?: number) => (v !== undefined ? String(v) : undefined);
    return {
      q: this.currentQuery || undefined,
      category: this.selectedCategory || undefined,
      brand: csv(this.brandsSelected),
      model: this.modelQuery || undefined,
      width: num(this.widthSelected),
      aspect: num(this.aspectSelected),
      rim: num(this.rimSelected),
      type: csv(this.typesSelected),
      load: csv(this.loadSelected),
      speed: csv(this.speedSelected),
      priceMin: this.priceBounds && this.priceMin !== this.priceBounds.min ? String(this.priceMin) : undefined,
      priceMax: this.priceBounds && this.priceMax !== this.priceBounds.max ? String(this.priceMax) : undefined,
    } as Record<string, string | undefined>;
  }

  private syncUrlAndPersist() {
    const params = this.toQueryParams();
    // Only navigate if params changed to avoid loops
    const current = this.route.snapshot.queryParamMap;
    const keys = ['q','category','brand','model','width','aspect','rim','type','load','speed'];
    let changed = false;
    for (const k of keys) {
      const now = (params as any)[k] ?? null;
      const cur = current.get(k);
      if ((now ?? null) !== (cur ?? null)) { changed = true; break; }
    }
    if (changed) {
      this.router.navigate([], { relativeTo: this.route, queryParams: params });
    }
    try { localStorage.setItem('shopFilters', JSON.stringify(params)); } catch {}
    this.updateCanUndo();
  }

  private updateFromQueryParams(qp: import('@angular/router').ParamMap) {
    const getCsv = (key: string) => (qp.get(key) || '').split(',').map(x => x.trim()).filter(Boolean);
    const prevQ = this.currentQuery;
    const prevCat = this.selectedCategory;

    this.currentQuery = (qp.get('q') || '').trim();
    this.selectedCategory = (qp.get('category') || '').trim();
    const brandCsv = getCsv('brand').map(v => this.normalizeKey(v));
    this.brandsSelected = new Set(brandCsv);
    this.modelQuery = qp.get('model') || '';
    const w = qp.get('width'); this.widthSelected = w ? Number(w) : undefined;
    const a = qp.get('aspect'); this.aspectSelected = a ? Number(a) : undefined;
    const r = qp.get('rim'); this.rimSelected = r ? Number(r) : undefined;
    this.typesSelected = new Set(getCsv('type'));
    this.loadSelected = new Set(getCsv('load'));
    this.speedSelected = new Set(getCsv('speed'));
    const parseOptionalNumber = (key: string) => {
      const raw = qp.get(key);
      if (raw === null) return null;
      const trimmed = raw.trim();
      if (!trimmed.length) return null;
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : null;
    };
    const pmin = parseOptionalNumber('priceMin');
    const pmax = parseOptionalNumber('priceMax');
    if (pmin !== null) this.priceMin = pmin;
    if (pmax !== null) this.priceMax = pmax;
    if (this.priceMin > this.priceMax) { const t = this.priceMin; this.priceMin = this.priceMax; this.priceMax = t; }

    return { qChanged: prevQ !== this.currentQuery, catChanged: prevCat !== this.selectedCategory };
  }

  private hasAnyFilterParam(qp: import('@angular/router').ParamMap) {
    const keys = ['q','category','brand','model','width','aspect','rim','type','load','speed','priceMin','priceMax'];
    return keys.some(k => qp.get(k));
  }

  constructor() {
    this.route.queryParamMap.subscribe(qp => {
      // Do not auto-restore from localStorage when opening without params.
      // Always derive state from URL and then load/apply.
      const { qChanged, catChanged } = this.updateFromQueryParams(qp);
      if (qChanged || catChanged || !this.allProducts.length) this.load();
      else this.applyFilters('other');
      this.updateCanUndo();
    });
    this.updateCanUndo();
  }

  undo() { try { history.back(); } catch {} }

  private updateCanUndo() { this.canUndo = (history.length || 0) > 1; }

  openFilters() { this.filtersOpen = true; }
  closeFilters() { this.filtersOpen = false; }
  applyAndClose() { this.applyFilters('other'); this.closeFilters(); }

  onPriceMin(v: number | string) {
    const bounds = this.priceBounds || this.globalPriceBounds;
    if (!bounds) return;
    const n = Number(v);
    if (!Number.isFinite(n)) return;
    const clamped = Math.max(bounds.min, Math.min(bounds.max, n));
    const maxAllowed = Math.max(bounds.min, this.priceMax - this.priceStep);
    this.priceMin = Math.min(clamped, maxAllowed);
    if (this.priceMin < bounds.min) this.priceMin = bounds.min;
    this.applyFilters('price');
  }
  onPriceMax(v: number | string) {
    const bounds = this.priceBounds || this.globalPriceBounds;
    if (!bounds) return;
    const n = Number(v);
    if (!Number.isFinite(n)) return;
    const clamped = Math.max(bounds.min, Math.min(bounds.max, n));
    const minAllowed = Math.min(bounds.max, this.priceMin + this.priceStep);
    this.priceMax = Math.max(clamped, minAllowed);
    if (this.priceMax > bounds.max) this.priceMax = bounds.max;
    this.applyFilters('price');
  }

  resetPriceFilter() {
    if (this.globalPriceBounds) {
      this.priceBounds = { ...this.globalPriceBounds };
      this.priceMin = this.globalPriceBounds.min;
      this.priceMax = this.globalPriceBounds.max;
    } else {
      this.priceBounds = null;
      this.priceMin = 0;
      this.priceMax = 0;
    }
    this.applyFilters('other');
  }

  idFor(prefix: string, value: string) {
    const s = String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `${prefix}-${s}`;
  }

  pricePct(v: number) {
    const bounds = this.priceBounds || this.globalPriceBounds;
    if (!bounds) return 0;
    let { min, max } = bounds;
    if (max <= min) return 0;
    const clamped = Math.max(min, Math.min(max, v));
    return ((clamped - min) / (max - min)) * 100;
  }

  brandLabel(key: string): string {
    return this.brandLabels.get(key) ?? key;
  }

  brandFilters(): string[] {
    return Array.from(this.brandsSelected).sort((a, b) => this.brandLabel(a).localeCompare(this.brandLabel(b)));
  }

  priceFilterActive(): boolean {
    const bounds = this.priceBounds || this.globalPriceBounds;
    if (!bounds) return false;
    return this.priceMin > bounds.min || this.priceMax < bounds.max;
  }

  priceFillLeft(): number {
    const bounds = this.priceBounds || this.globalPriceBounds;
    if (!bounds) return 0;
    const minPct = this.pricePct(this.priceMin);
    const maxPct = this.pricePct(this.priceMax);
    return Math.max(Math.min(minPct, maxPct), 0);
  }

  priceFillWidth(): number {
    const bounds = this.priceBounds || this.globalPriceBounds;
    if (!bounds) return 0;
    const minPct = this.pricePct(this.priceMin);
    const maxPct = this.pricePct(this.priceMax);
    const start = Math.max(Math.min(minPct, maxPct), 0);
    const end = Math.min(Math.max(minPct, maxPct), 100);
    return Math.max(end - start, 0);
  }

  priceMinBound(): number {
    return (this.priceBounds || this.globalPriceBounds)?.min ?? 0;
  }

  priceMaxBound(): number {
    return (this.priceBounds || this.globalPriceBounds)?.max ?? 0;
  }

  private syncPriceBounds() {
    let bounds = this.priceBounds || this.globalPriceBounds;
    if (!bounds) {
      this.priceMin = 0;
      this.priceMax = 0;
      return;
    }
    let { min, max } = bounds;
    if (max <= min) {
      max = min + this.priceStep;
      if (this.priceBounds) this.priceBounds = { min, max };
      if (this.globalPriceBounds) this.globalPriceBounds = { min, max };
    }
    const isUnset = this.priceMin === 0 && this.priceMax === 0;
    if (isUnset) {
      this.priceMin = min;
      this.priceMax = max;
      return;
    }
    if (this.priceMin === 0) this.priceMin = min;
    if (this.priceMax === 0) this.priceMax = max;
    this.priceMin = Math.min(Math.max(this.priceMin, min), max - this.priceStep);
    this.priceMax = Math.max(Math.min(this.priceMax, max), min + this.priceStep);
    if (this.priceMin > this.priceMax - this.priceStep) {
      this.priceMin = Math.max(min, this.priceMax - this.priceStep);
    }
    if (this.priceMax < this.priceMin + this.priceStep) {
      this.priceMax = Math.min(max, this.priceMin + this.priceStep);
    }
  }
}
