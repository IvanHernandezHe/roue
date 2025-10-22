import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgFor, NgIf, AsyncPipe, SlicePipe, NgStyle } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ApiService } from '../../core/api.service';
import { FormsModule } from '@angular/forms';
import { Product } from '../../core/models/product.model';
import { Brand } from '../../core/models/brand.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, AsyncPipe, SlicePipe, NgStyle, ProductCardComponent, FormsModule, LucideAngularModule],
  styles: [`
    :host { display: block; overflow-x: hidden; }

    .hero {
      position: relative;
      border-radius: var(--brand-radius-lg);
      border: 1px solid var(--brand-border);
      background: linear-gradient(135deg, #ffffff 0%, #f4f6fb 100%);
      box-shadow: var(--shadow-soft);
    }
    .hero-img {
      width: 100%;
      max-width: 500px;
      border-radius: var(--brand-radius-md);
      border: 1px solid var(--brand-border);
      background: var(--brand-cloud);
      padding: clamp(1rem, 3vw, 1.4rem);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
    }
    .hero-copy { position: relative; z-index: 1; }

    .search-panel {
      border-radius: var(--brand-radius-md);
      border: 1px solid var(--brand-border);
      background: #ffffff;
      box-shadow: var(--shadow-soft);
      padding: clamp(1rem, 2.5vw, 1.6rem);
    }
    :host-context([data-bs-theme="dark"]) .search-panel {
      background: var(--brand-cloud);
      box-shadow: none;
    }

    .simple-carousel {
      position: relative;
      overflow: hidden;
      height: clamp(32vh, 58vh, 72vh);
      max-height: 720px;
      border: 1px solid var(--brand-border);
      background: linear-gradient(135deg, #ffffff 0%, #eef1f7 100%);
      box-shadow: var(--shadow-soft);
    }
    .simple-track {
      display: flex;
      width: 100%;
      height: 100%;
      transition: transform 620ms cubic-bezier(.22,1,.34,1);
      will-change: transform;
    }
    .simple-item { flex: 0 0 100%; height: 100%; }
    .simple-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
    .simple-progress {
      position: absolute;
      left: clamp(12px, 4vw, 42px);
      right: clamp(12px, 4vw, 42px);
      bottom: clamp(12px, 4vw, 36px);
      display: flex;
      gap: 8px;
      z-index: 4;
    }
    .simple-progress .bar {
      flex: 1;
      height: 4px;
      border-radius: var(--brand-radius-sm);
      background: rgba(15, 18, 30, .12);
      overflow: hidden;
    }
    .simple-progress .fill {
      display: block;
      height: 100%;
      width: 0%;
      background: var(--brand-primary);
      transition: width 150ms linear;
    }
    .simple-carousel[data-paused="true"] .fill { background: color-mix(in srgb, var(--brand-primary) 40%, transparent); }

    .value-grid .feature {
      padding: 1.2rem;
      text-align: left;
      background: linear-gradient(180deg, #ffffff 0%, #f5f6fb 100%);
      border: 1px solid var(--brand-border);
      border-radius: var(--brand-radius-md);
      box-shadow: var(--shadow-soft);
    }
    .value-grid .feature small { color: var(--brand-muted); }

    .category-tile {
      min-height: 180px;
      background: linear-gradient(160deg, #ffffff 0%, #f3f5fb 100%);
    }
    .category-tile h5 {
      position: absolute;
      left: 1.4rem;
      bottom: 1.4rem;
      margin: 0;
      font-family: var(--font-display);
      letter-spacing: .05em;
    }
    .category-tile span {
      position: absolute;
      top: clamp(1.2rem, 3vw, 1.6rem);
      left: clamp(1.2rem, 3vw, 1.6rem);
      font-size: .8rem;
      font-weight: 600;
      color: var(--brand-muted);
      letter-spacing: .12em;
      text-transform: uppercase;
    }

    .brand-marquee {
      position: relative;
      overflow: hidden;
      border-radius: var(--brand-radius-lg);
      border: 1px solid var(--brand-border);
      background: linear-gradient(90deg, rgba(255,255,255,0.85) 0%, rgba(245,247,253,0.9) 100%);
      padding-block: clamp(18px, 3vw, 32px);
      mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.78) 12%, rgba(0,0,0,0.95) 88%, transparent 100%);
      -webkit-mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.78) 12%, rgba(0,0,0,0.95) 88%, transparent 100%);
    }
    .brand-marquee:hover .marquee-track,
    .brand-marquee:focus-within .marquee-track {
      animation-play-state: paused;
    }
    .marquee-track {
      display: flex;
      align-items: center;
      gap: clamp(36px, 6vw, 72px);
      width: max-content;
      animation: marquee-scroll linear infinite;
      will-change: transform;
    }
    .marquee-track.no-animation {
      animation: none;
    }
    @keyframes marquee-scroll {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    .brand-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.65rem;
    }
    .brand-card {
      width: clamp(120px, 14vw, 160px);
      height: clamp(58px, 9vw, 78px);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: clamp(12px, 2vw, 18px);
      transition: transform var(--transition-base), filter var(--transition-base);
      position: relative;
    }
    .brand-card:hover,
    .brand-card:focus-visible {
      transform: translateY(-4px);
    }
    .brand-card:focus-visible {
      outline: 2px solid var(--brand-primary);
      outline-offset: 6px;
    }
    .brand-card img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 1px 2px rgba(15,18,30,0.06));
    }
    .brand-card.inactive img {
      filter: grayscale(1) opacity(0.45);
    }
    .brand-caption {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--brand-muted);
    }
    .brand-caption.inactive {
      color: rgba(15, 18, 30, 0.35);
    }
    .brand-status {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--brand-primary);
    }
    .brand-status.inactive {
      color: rgba(15, 18, 30, 0.4);
    }

    .cashback {
      border-radius: var(--brand-radius-lg);
      background: linear-gradient(180deg, #ffffff 0%, #f4f6fb 100%);
      color: var(--brand-ink);
      border: 1px solid var(--brand-border);
      padding: 2rem;
      box-shadow: var(--shadow-soft);
    }
    .cashback .btn-light {
      background: var(--brand-cloud);
      border: 1px solid var(--brand-border);
      color: var(--brand-ink);
    }
    .cashback .btn-light:hover,
    .cashback .btn-light:focus {
      border-color: var(--brand-primary);
      color: var(--brand-primary);
      background: var(--surface-subtle);
    }

    .floating-fabs { right: 20px; bottom: 20px; }
    .fab {
      width: clamp(48px, 9vw, 58px);
      height: clamp(48px, 9vw, 58px);
      border-radius: var(--brand-radius-sm);
      background: var(--brand-primary);
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      transition: background var(--transition-base);
      position: relative;
    }
    .fab svg { width: 60%; height: 60%; }
    .fab:hover,
    .fab:focus-visible {
      background: var(--brand-primary-dark);
    }
    .fab::after {
      content: attr(data-label);
      position: absolute;
      right: calc(100% + 8px);
      top: 50%;
      transform: translateY(-50%);
      opacity: 0;
      background: var(--surface-contrast);
      color: #fff;
      font-size: .72rem;
      padding: .35rem .55rem;
      border-radius: var(--brand-radius-sm);
      white-space: nowrap;
      pointer-events: none;
      transition: opacity var(--transition-base);
    }
    .fab:hover::after,
    .fab:focus-visible::after {
      opacity: 1;
    }
    .fab-call { background: var(--brand-primary); }
    .fab-wa { background: #1f8f57; }

    .pill {
      min-height: 88px;
      justify-content: center;
      gap: .25rem;
    }
    .pill small { color: var(--brand-muted); }

    @media (max-width: 767.98px) {
      .simple-carousel {
        height: min(58vh, 420px);
      }
      .cashback {
        padding: 1.5rem;
      }
    }

    @media (max-width: 575.98px) {
      .hero-img {
        max-width: 360px;
        margin-inline: auto;
      }
      .simple-progress {
        left: 16px;
        right: 16px;
      }
      .brand-logos a {
        width: 100%;
        max-width: 220px;
      }
      .floating-fabs {
        right: 12px;
        bottom: 12px;
      }
      .floating-fabs .fab::after {
        display: none;
      }
    }

    @media (max-width: 991.98px) {
      .hero { border-radius: var(--brand-radius-md); }
    }

    :host-context([data-bs-theme="dark"]) .hero {
      background: var(--brand-cloud);
    }
    :host-context([data-bs-theme="dark"]) .hero-img {
      background: var(--brand-cloud);
      border-color: var(--brand-border);
    }
    :host-context([data-bs-theme="dark"]) .category-tile {
      background: var(--brand-cloud);
    }
    :host-context([data-bs-theme="dark"]) .brand-logos a {
      background: var(--brand-cloud);
      border-color: var(--brand-border);
    }
    :host-context([data-bs-theme="dark"]) .simple-progress .bar {
      background: rgba(148,163,184,.45);
    }
    :host-context([data-bs-theme="dark"]) .simple-progress .fill {
      background: var(--brand-primary);
    }
  `],
  template: `
  <!-- Image carousel just below navbar -->
  <section class="container-fluid p-0 m-0">
    <div class="simple-carousel" [attr.data-paused]="paused" (pointerenter)="pause()" (pointerleave)="resume()" (pointerdown)="pause()" (pointerup)="resume()" (pointercancel)="resume()">
      <div class="simple-track" [style.transform]="'translate3d(-' + (currentSlide * 100) + '%,0,0)'"><!--
        -->
        <div class="simple-item" *ngFor="let s of slides; trackBy: trackByIndex">
          <img [src]="s.src" [alt]="s.alt">
        </div>
      </div>
      <div class="simple-progress" aria-hidden="true">
        <div class="bar" *ngFor="let s of slides; let i = index">
          <span class="fill" [style.width]="barWidth(i)"></span>
        </div>
      </div>
    </div>
  </section>

  <!-- Hero with search panel -->
  <header class="hero py-4 py-lg-5 mb-4">
    <div class="container">
      <div class="row align-items-center g-4">
        <!-- Left: Title + search -->
        <div class="col-12 col-lg-7 hero-copy">
          <span class="section-eyebrow">Experiencia Roue</span>
          <h1 class="display-6 fw-bold mb-3 drift-in">Encuentra tu llanta ideal</h1>
          <p class="text-muted mb-3">Busca por palabra clave o filtra por marca, año y precio. Recibe asesoría personalizada y recompensas en cada compra.</p>

          <div class="search-panel">
            <div class="row g-2">
              <div class="col-12">
                <input #kw class="form-control form-control-lg" placeholder="Buscar (marca, modelo o SKU)"/>
              </div>
              <div class="col-6 col-md-4">
                <select class="form-select" [(ngModel)]="filters.brand">
                  <option [ngValue]="undefined" selected>Marca</option>
                  <option *ngFor="let b of brands" [value]="b">{{b}}</option>
                </select>
              </div>
              <div class="col-6 col-md-4">
                <select class="form-select" [(ngModel)]="filters.year">
                  <option [ngValue]="undefined" selected>Año</option>
                  <option *ngFor="let y of years" [value]="y">{{y}}</option>
                </select>
              </div>
              <div class="col-12 col-md-4">
                <select class="form-select" [(ngModel)]="filters.price">
                  <option [ngValue]="undefined" selected>Precio</option>
                  <option value="-5000">Hasta $5,000</option>
                  <option value="5000-10000">$5,000–$10,000</option>
                  <option value="10000+">$10,000 o más</option>
                </select>
              </div>
              <div class="col-12 d-grid">
                <button class="btn btn-jdm btn-lg" (click)="submitSearch(kw.value)">Buscar</button>
              </div>
            </div>
          </div>

          <div class="row g-3 mt-3">
            <div class="col-12 col-sm-4">
              <div class="pill sticker-red">20%<small>OFF</small></div>
            </div>
            <div class="col-12 col-sm-4">
              <div class="pill sticker">Envío<small>Gratis</small></div>
            </div>
            <div class="col-12 col-sm-4">
              <div class="pill sticker">6 MSI<small>Financiamiento</small></div>
            </div>
          </div>
        </div>

        <!-- Right: hero image -->
        <div class="col-12 col-lg-5 text-center d-flex flex-column gap-3">
          <img src="/assets/product/fallback/default-tire.jpg" alt="llanta" class="hero-img border rounded-3 bg-body align-self-center"/>
        </div>
      </div>
    </div>
  </header>

  

  <!-- Value props (secondary strip) -->
  <section class="container mb-4 value-grid">
    <div class="row g-3">
      <div class="col-12 col-md-4">
        <div class="feature p-4 h-100">
          <div class="section-eyebrow mb-2">Promociones</div>
          <div class="fw-bold fs-5">4x3 en marcas selectas</div>
          <small>Promociones por tiempo limitado</small>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="feature p-4 h-100">
          <div class="section-eyebrow mb-2">Servicio</div>
          <div class="fw-bold fs-5">Instalación a domicilio</div>
          <small>Agenda en tu horario</small>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="feature p-4 h-100">
          <div class="section-eyebrow mb-2">Cashback</div>
          <div class="fw-bold fs-5">Recompensas en cada compra</div>
          <small>Acumula y canjea puntos</small>
        </div>
      </div>
    </div>
  </section>

  <!-- Popular tires -->
  <section class="container mb-5">
    <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-3">
      <div>
        <span class="section-eyebrow">Catálogo destacado</span>
        <h2 class="h4 m-0 section-title">Llantas populares</h2>
      </div>
      <div class="d-flex flex-column flex-sm-row align-items-stretch align-items-lg-center gap-2 w-100 w-lg-auto">
        <input #q class="form-control flex-fill" placeholder="Buscar marca, modelo o SKU" (input)="onSearch(q.value)"/>
        <button class="btn btn-outline-secondary w-100 w-sm-auto" (click)="onSearch('')">Limpiar</button>
        <a class="btn btn-light fw-semibold w-100 w-sm-auto text-center" routerLink="/shop">Ver todo</a>
      </div>
    </div>
    <div class="row g-3">
      <div class="col-12 col-sm-6 col-lg-4" *ngFor="let p of (products$ | async) | slice:0:6; trackBy: trackById">
        <app-product-card [product]="p"></app-product-card>
      </div>
      <div class="col-12" *ngIf="(products$ | async)?.length === 0">
        <div class="alert alert-info">Aún no hay productos disponibles.</div>
      </div>
    </div>
  </section>

  <!-- Categories / quick links -->
  <section class="container mb-5">
    <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-3">
      <div>
        <span class="section-eyebrow">Explora por tipo</span>
        <h2 class="h4 m-0 section-title">Categorías principales</h2>
      </div>
    </div>
    <div class="row g-3">
      <div class="col-6 col-md-3">
        <div class="category-tile">
          <span>01</span>
          <h5>Autos</h5>
          <a routerLink="/shop" aria-label="Llantas para autos"></a>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="category-tile">
          <span>02</span>
          <h5>SUV</h5>
          <a routerLink="/shop" aria-label="Llantas para SUV"></a>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="category-tile">
          <span>03</span>
          <h5>Camioneta</h5>
          <a routerLink="/shop" aria-label="Llantas para camioneta"></a>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="category-tile">
          <span>04</span>
          <h5>Performance</h5>
          <a routerLink="/shop" aria-label="Llantas performance"></a>
        </div>
      </div>
    </div>
  </section>

  <!-- Services -->
  <section class="container mb-5">
    <h2 class="h4 mb-3">Servicios adicionales</h2>
    <div class="row g-3">
      <div class="col-12 col-md-6 col-lg-3">
        <div class="service-card">
          <div class="fw-bold">Balanceo</div>
          <small class="text-muted">Incluido en la instalación</small>
        </div>
      </div>
      <div class="col-12 col-md-6 col-lg-3">
        <div class="service-card">
          <div class="fw-bold">Alineación</div>
          <small class="text-muted">Opcional al finalizar compra</small>
        </div>
      </div>
      <div class="col-12 col-md-6 col-lg-3">
        <div class="service-card">
          <div class="fw-bold">Rotación</div>
          <small class="text-muted">Mejor desempeño y vida útil</small>
        </div>
      </div>
      <div class="col-12 col-md-6 col-lg-3">
        <div class="service-card">
          <div class="fw-bold">Garantía por escrito</div>
          <small class="text-muted">Cobertura ante defectos de fabricación</small>
        </div>
      </div>
    </div>
  </section>

  <!-- Cashback + payments -->
  <section class="container mb-5">
    <div class="row g-3 align-items-stretch">
      <div class="col-12 col-lg-7">
        <div class="cashback p-4 h-100 d-flex flex-column flex-lg-row align-items-center gap-3">
          <img src="https://dummyimage.com/96x96/0f52ba/ffffff&text=%" alt="Cashback" class="rounded-circle bg-body" style="width:92px;height:92px;object-fit:cover;"/>
          <div class="flex-fill">
            <div class="section-eyebrow text-white-50 mb-1">Cashback inteligente</div>
            <div class="h4 m-0">Obtén 5% de cashback</div>
            <p class="m-0" style="color: rgba(255,255,255,.75);">Regístrate y recibe saldo personalizado en tus compras por categoría.</p>
          </div>
          <a routerLink="/perfil" class="btn btn-light text-dark fw-semibold">Crear cuenta</a>
        </div>
      </div>
      <div class="col-12 col-lg-5">
        <div class="feature p-4 h-100">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h3 class="h5 m-0">Métodos de pago</h3>
          </div>
          <div class="d-flex flex-wrap gap-3 align-items-center">
            <img src="https://dummyimage.com/80x32/ddd/999&text=Visa" alt="Visa"/>
            <img src="https://dummyimage.com/80x32/ddd/999&text=Mastercard" alt="Mastercard"/>
            <img src="https://dummyimage.com/80x32/ddd/999&text=AMEX" alt="AMEX"/>
            <img src="https://dummyimage.com/80x32/ddd/999&text=OXXO" alt="OXXO"/>
            <img src="https://dummyimage.com/80x32/ddd/999&text=Transfer" alt="Transferencia"/>
          </div>
          <small class="text-muted d-block mt-2">Pagos seguros con encriptación.</small>
        </div>
      </div>
    </div>
  </section>

  <!-- Tire search by size/model -->
  <section class="container mb-5">
    <div class="info-split p-3 p-lg-4">
      <div class="row g-4 align-items-center">
        <div class="col-12 col-lg-6">
          <h2 class="h5 mb-3">¿No sabes qué llanta elegir?</h2>
          <p class="text-muted">Busca por medida tal como aparece en tu llanta: ancho / perfil R rin.</p>
          <div class="row g-2">
            <div class="col-4">
              <select class="form-select" [(ngModel)]="size.width">
                <option [ngValue]="undefined" disabled selected>Ancho</option>
                <option *ngFor="let w of widths" [value]="w">{{w}}</option>
              </select>
            </div>
            <div class="col-4">
              <select class="form-select" [(ngModel)]="size.aspect">
                <option [ngValue]="undefined" disabled selected>Perfil</option>
                <option *ngFor="let a of aspects" [value]="a">{{a}}</option>
              </select>
            </div>
            <div class="col-4">
              <select class="form-select" [(ngModel)]="size.rim">
                <option [ngValue]="undefined" disabled selected>Rin</option>
                <option *ngFor="let r of rims" [value]="r">{{r}}</option>
              </select>
            </div>
            <div class="col-12 d-flex flex-column flex-sm-row gap-2">
              <button class="btn btn-dark w-100 w-sm-auto" (click)="onSizeSearch()" [disabled]="!size.width || !size.aspect || !size.rim">Buscar {{size.width}}/{{size.aspect}}R{{size.rim}}</button>
              <button class="btn btn-outline-secondary w-100 w-sm-auto" (click)="resetSize()">Limpiar</button>
            </div>
          </div>
        </div>
        <div class="col-12 col-lg-6">
          <h2 class="h5 mb-3">¿Ya sabes lo que buscas?</h2>
          <div class="d-flex flex-column flex-sm-row align-items-stretch gap-2">
            <input #search2 class="form-control flex-fill" placeholder="Modelo, marca o SKU"/>
            <button class="btn btn-outline-dark w-100 w-sm-auto" (click)="goToShop(search2.value)">Buscar</button>
          </div>
          <small class="text-muted">Ejemplo: P-Zero, 205/55R16 o 123456</small>
        </div>
      </div>
    </div>
  </section>

  <!-- Brands -->
  <section class="container mb-5 brand-logos" aria-labelledby="brands-title">
    <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-3">
      <div>
        <span class="section-eyebrow">Confianza</span>
        <h2 id="brands-title" class="h4 m-0 section-title">Marcas aliadas</h2>
      </div>
    </div>
    <ng-container *ngIf="brandLogos.length; else brandLogosEmpty">
      <div class="brand-marquee" role="list" aria-live="polite">
        <div
          class="marquee-track"
          [class.no-animation]="!marqueeActive"
          [ngStyle]="{ 'animation-duration': marqueeDuration }"
        >
          <div
            class="brand-item"
            *ngFor="let brand of brandMarquee; let i = index; trackBy: trackMarqueeIndex"
            role="listitem"
          >
            <ng-container *ngIf="brand.active; else inactiveBrand">
              <a
                class="brand-card"
                [routerLink]="['/shop']"
                [queryParams]="{ brand: brand.name }"
                [attr.aria-label]="'Ver llantas de ' + brand.name"
              >
                <img
                  [src]="brand.logoUrl || fallbackBrandLogo"
                  [attr.alt]="brand.name"
                  loading="lazy"
                  (error)="onBrandImageError($event)"
                />
              </a>
              <span class="brand-caption">{{ brand.name }}</span>
            </ng-container>
            <ng-template #inactiveBrand>
              <div class="brand-card inactive">
                <img
                  [src]="brand.logoUrl || fallbackBrandLogo"
                  [attr.alt]="brand.name + ' no disponible'"
                  loading="lazy"
                  (error)="onBrandImageError($event)"
                />
              </div>
              <span class="brand-caption inactive">{{ brand.name }}</span>
              <span class="brand-status inactive">No disponible por ahora</span>
            </ng-template>
          </div>
        </div>
      </div>
    </ng-container>
    <ng-template #brandLogosEmpty>
      <div class="text-muted small">Agrega marcas en el panel de administración para mostrarlas aquí.</div>
    </ng-template>
  </section>

  <!-- Coupons / promos -->
  <section class="container mb-5">
    <div class="row g-3">
      <div class="col-12 col-lg-6">
        <div class="coupon-card p-4 h-100 d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-3">
          <div class="flex-fill">
            <div class="h5 m-0">Cupones promocionales</div>
            <small class="text-muted">Aplica tu cupón al pagar. Ej.: ROUE10</small>
          </div>
          <div class="d-flex flex-column flex-sm-row align-items-stretch gap-2 w-100 w-lg-auto">
            <input #coupon class="form-control flex-fill" placeholder="Código"/>
            <button class="btn btn-dark w-100 w-sm-auto" (click)="applyCoupon(coupon.value)">Aplicar</button>
          </div>
        </div>
      </div>
      <div class="col-12 col-lg-6">
        <div class="feature p-4 h-100">
          <div class="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-2">
            <h3 class="h5 m-0">Promociones vigentes</h3>
            <a class="btn btn-sm btn-outline-dark w-100 w-sm-auto text-center" routerLink="/shop">Ver más</a>
          </div>
          <ul class="m-0 ps-3">
            <li>4x3 en líneas seleccionadas</li>
            <li>MSI en compras mayores a $5,000</li>
            <li>Envío e instalación a domicilio</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- Trust bar -->
  <section class="container mb-5 trust-logos text-center text-muted">
    <div class="d-flex flex-wrap justify-content-center gap-4">
      <img src="https://dummyimage.com/120x28/ddd/999&text=Visa" alt="Visa"/>
      <img src="https://dummyimage.com/120x28/ddd/999&text=Mastercard" alt="Mastercard"/>
      <img src="https://dummyimage.com/120x28/ddd/999&text=Oxxo" alt="Oxxo"/>
      <img src="https://dummyimage.com/120x28/ddd/999&text=Stripe" alt="Stripe"/>
    </div>
  </section>

  <!-- Contact / social strip -->
  <section class="container mb-5">
    <div class="feature p-3 p-lg-4 d-flex flex-column flex-lg-row align-items-center justify-content-between gap-3">
      <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3 gap-md-4 w-100">
        <div>
          <div class="fw-bold">Atención al cliente</div>
          <small class="text-muted">Lun–Sáb 9:00–19:00</small>
        </div>
        <div>
          <div class="fw-bold">Tel:</div>
          <a [href]="'tel:' + supportPhone" class="text-decoration-none">{{ supportPhoneDisplay }}</a>
        </div>
        <div>
          <div class="fw-bold">Correo:</div>
          <a href="mailto:hola@roue.mx" class="text-decoration-none">hola@roue.mx</a>
        </div>
      </div>
      <div class="d-flex flex-wrap justify-content-center justify-content-lg-start align-items-center gap-3">
        <a href="https://facebook.com/roue" target="_blank" rel="noopener" class="btn btn-outline-secondary btn-sm w-100 w-sm-auto">Facebook</a>
        <a href="https://instagram.com/roue" target="_blank" rel="noopener" class="btn btn-outline-secondary btn-sm w-100 w-sm-auto">Instagram</a>
        <a href="https://t.me/roue" target="_blank" rel="noopener" class="btn btn-outline-secondary btn-sm w-100 w-sm-auto">Telegram</a>
      </div>
    </div>
  </section>

  <!-- Floating action buttons -->
  <div class="floating-fabs" aria-label="Acciones rápidas">
    <a class="fab fab-help" routerLink="/ayuda" aria-label="Emergencia o ayuda" data-label="Emergencia">
      <!-- Wheel/tire icon with double rim and five spokes -->
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
        <circle cx="12" cy="12" r="5.5" stroke="currentColor" stroke-width="2"/>
        <g fill="currentColor">
          <path d="M10.856 6.62 L12 12 L13.144 6.62 Z"/>
          <path d="M16.763 9.25 L12 12 L17.47 11.425 Z"/>
          <path d="M16.087 15.68 L12 12 L14.237 17.025 Z"/>
          <path d="M9.763 17.025 L12 12 L7.913 15.68 Z"/>
          <path d="M6.53 11.425 L12 12 L7.237 9.25 Z"/>
        </g>
        <circle cx="12" cy="12" r="1.7" fill="currentColor"/>
      </svg>
    </a>
    <a class="fab fab-call" [href]="'tel:' + supportPhone" aria-label="Llámanos" data-label="Llámanos">
      <lucide-icon name="phone" size="22" [strokeWidth]="2.4" aria-hidden="true"></lucide-icon>
    </a>
    <a class="fab fab-wa" [href]="waLink" target="_blank" rel="noopener" aria-label="WhatsApp" data-label="WhatsApp">
      <!-- Official-style WhatsApp glyph -->
      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M20.52 3.48A11.31 11.31 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.02.52 3.97 1.5 5.7L0 24l6.46-1.68A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52ZM12 21.6c-1.9 0-3.75-.51-5.37-1.49l-.38-.22-3.76.98.99-3.77-.24-.39A9.59 9.59 0 1 1 21.6 12 9.6 9.6 0 0 1 12 21.6Zm5.06-6.95c-.28-.14-1.66-.83-1.92-.93-.26-.1-.45-.14-.63.14-.18.28-.74.93-.9 1.12-.16.19-.34.22-.62.07-.28-.14-1.2-.44-2.28-1.4-.84-.75-1.4-1.67-1.57-1.96-.17-.29-.02-.44.12-.59.12-.12.28-.34.42-.5.14-.16.2-.28.28-.47.1-.19.05-.35-.02-.5-.07-.15-.66-1.57-.9-2.14-.24-.56-.48-.49-.65-.49-.17 0-.36-.02-.55-.02-.2 0-.5.07-.78.36-.27.28-1.01.98-1.01 2.41 0 1.42 1.03 2.78 1.17 2.97.14.19 2.02 3.12 4.89 4.39.68.3 1.2.47 1.61.61.68.22 1.29.18 1.77.11.54-.08 1.66-.69 1.9-1.35.23-.66.23-1.23.16-1.35-.07-.12-.26-.2-.54-.34Z"/>
      </svg>
    </a>
  </div>
  `
})
export class LandingPage implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private router = inject(Router);
  products$ = this.api.getProducts();
  readonly waNumber = '5215555555555';
  readonly waLink = `https://wa.me/${this.waNumber}?text=${encodeURIComponent('Hola, quiero una cotización de llantas')}`;
  readonly supportPhone = '5555555555';
  readonly supportPhoneDisplay = '(55) 5555 5555';
  brandLogos: Brand[] = [];
  brandMarquee: Brand[] = [];
  marqueeDuration = '24s';
  marqueeActive = false;
  readonly fallbackBrandLogo = '/assets/brand/roue-mark2.svg';

  // Carousel state
  slides = [
    { src: '/assets/main-header/slider1.jpg', alt: 'Promoción 1' },
    { src: '/assets/main-header/slider2.jpg', alt: 'Promoción 2' },
    { src: '/assets/main-header/slider3.jpg', alt: 'Promoción 3' },
    { src: '/assets/main-header/slider4.jpg', alt: 'Promoción 4' },
  ];
  currentSlide = 0;
  progressPct = 0; // 0..100
  readonly slideDurationMs = 5000;
  #timer: any = null;
  paused = false;

  constructor() {
    this.#startTimer(true);
  }

  ngOnInit(): void {
    this.api.getBrands().subscribe({
      next: brands => {
        this.brandLogos = [...brands].sort((a, b) => {
          if (a.active === b.active) return a.name.localeCompare(b.name);
          return a.active ? -1 : 1;
        });
        this.brands = this.brandLogos.map(b => b.name);
        this.#buildBrandMarquee();
      },
      error: () => {
        this.brandLogos = [];
        this.brandMarquee = [];
        this.marqueeActive = false;
        this.brands = [];
      }
    });
  }

  ngOnDestroy(): void { this.#stopTimer(); }

  #startTimer(reset: boolean) {
    this.#stopTimer();
    const step = 100; // ms
    if (reset) this.progressPct = 0;
    this.#timer = setInterval(() => {
      this.progressPct += (step / this.slideDurationMs) * 100;
      if (this.progressPct >= 100) {
        this.nextSlide();
      }
    }, step);
  }

  #stopTimer() { if (this.#timer) { clearInterval(this.#timer); this.#timer = null; } }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.progressPct = 0;
  }

  barWidth(i: number): string {
    if (i < this.currentSlide) return '100%';
    if (i > this.currentSlide) return '0%';
    return `${Math.min(100, Math.max(0, this.progressPct))}%`;
  }
  trackByIndex(i: number) { return i; }

  // Pause/Resume controls
  pause() {
    if (this.paused) return;
    this.paused = true;
    this.#stopTimer();
  }
  resume() {
    if (!this.paused) return;
    this.paused = false;
    this.#startTimer(false);
  }
  // tap-to-toggle could be implemented if desired, but pointerdown/up gives press-to-pause UX

  widths = [165, 175, 185, 195, 205, 215, 225, 235, 245, 255, 265, 275, 285, 295, 305, 315];
  aspects = [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];
  rims = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
  size: { width?: number; aspect?: number; rim?: number } = {};

  // Landing hero filters (for UX; concatenated into a query string)
  brands: string[] = [];
  years = Array.from({ length: 26 }, (_, i) => 2000 + i);
  filters: { brand?: string; year?: number; price?: string } = {};

  onSearch(q: string) {
    const t = (q || '').trim();
    this.products$ = this.api.getProducts(t || undefined);
  }

  trackById(_: number, p: Product) { return p.id; }
  trackMarqueeIndex(index: number) { return index; }

  onBrandImageError(evt: Event) {
    const target = evt.target as HTMLImageElement | null;
    if (!target) return;
    if (target.src !== this.fallbackBrandLogo) {
      target.src = this.fallbackBrandLogo;
      return;
    }
  }

  #buildBrandMarquee() {
    const base = this.brandLogos.filter(Boolean);
    if (!base.length) {
      this.brandMarquee = [];
      this.marqueeActive = false;
      return;
    }

    const loopSource = base.length > 1 ? [...base, ...base] : [...base];
    this.brandMarquee = loopSource;

    const durationSeconds = Math.max(16, base.length * 4);
    this.marqueeDuration = `${durationSeconds}s`;
    this.marqueeActive = base.length > 1;
  }

  onSizeSearch() {
    if (!this.size.width || !this.size.aspect || !this.size.rim) return;
    const q = `${this.size.width}/${this.size.aspect}R${this.size.rim}`;
    this.goToShop(q);
  }

  resetSize() { this.size = {}; }

  onBrandQuick(brand: string) {
    const b = (brand || '').trim();
    if (!b) return;
    this.filters.brand = b;
    this.router.navigate(['/shop'], { queryParams: { brand: b } });
  }

  goToShop(q?: string) {
    const params: any = {};
    const t = (q || '').trim();
    if (t) params.q = t;
    if (this.filters.brand) params.brand = this.filters.brand;
    this.router.navigate(['/shop'], { queryParams: params });
  }

  submitSearch(keyword: string) {
    const parts = [(keyword || '').trim()]
      .concat(this.filters.brand ? [this.filters.brand] : [])
      .concat(this.filters.year ? [String(this.filters.year)] : [])
      .concat(this.filters.price ? [this.filters.price] : [])
      .filter(Boolean) as string[];
    const q = parts.join(' ');
    this.goToShop(q);
  }

  applyCoupon(code: string) {
    const t = (code || '').trim();
    if (!t) return;
    alert(`Cupón "${t}" se aplicará en el checkout.`);
  }
}
