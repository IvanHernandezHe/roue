import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  styles: [`
    :host { display: block; }
    .help-grid {
      display: grid;
      grid-template-columns: repeat(1, minmax(0,1fr));
      gap: 1rem;
    }
    @media (min-width: 768px) { .help-grid { grid-template-columns: repeat(3, minmax(0,1fr)); } }

    .help-tile {
      padding: 1rem;
      display: flex;
      gap: .85rem;
      align-items: center;
      border-radius: var(--brand-radius-md);
      border: 1px solid var(--brand-border);
      background: linear-gradient(180deg, #ffffff 0%, #f4f6fb 100%);
      box-shadow: var(--shadow-soft);
      transition: border-color var(--transition-base), background var(--transition-base), box-shadow var(--transition-base), transform var(--transition-base);
    }
    .help-tile:hover {
      border-color: color-mix(in srgb, var(--brand-primary) 35%, var(--brand-border));
      background: #ffffff;
      box-shadow: var(--shadow-hover);
      transform: translateY(-3px);
    }
    .help-tile lucide-icon { color: var(--brand-primary); }
    .help-icon,
    .contact-icon,
    .tip-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: var(--brand-radius-sm);
      background: rgba(236, 242, 255, 0.6);
      color: var(--brand-primary);
      flex: 0 0 28px;
    }
    .help-icon svg,
    .contact-icon svg { width: 60%; height: 60%; }

    .card {
      border-radius: var(--brand-radius-lg);
      border: 1px solid var(--brand-border);
      background: linear-gradient(180deg, #ffffff 0%, #f4f6fb 100%);
      box-shadow: var(--shadow-soft);
    }

    .contact { display: grid; gap: .65rem; }
    .contact a { text-decoration: none; font-weight: 600; color: var(--brand-primary); }
    .contact-item { display: flex; align-items: center; gap: .8rem; padding: .4rem 0; }

    .tips-list { list-style: none; margin: 0; padding: 0; display: grid; gap: .8rem; }
    .tip-item {
      display: flex;
      align-items: flex-start;
      gap: .75rem;
      padding: .85rem 1rem;
      border-radius: var(--brand-radius-md);
      background: linear-gradient(180deg, #ffffff 0%, #f2f5fb 100%);
      border: 1px dashed color-mix(in srgb, var(--brand-primary) 35%, var(--brand-border));
    }
    .tip-icon { width: 28px; height: 28px; }

    :host-context([data-bs-theme='dark']) .help-tile,
    :host-context([data-bs-theme='dark']) .card {
      background: var(--brand-cloud);
      border-color: var(--brand-border);
    }
    :host-context([data-bs-theme='dark']) .tip-item {
      background: var(--surface-subtle);
      border-color: color-mix(in srgb, var(--brand-primary) 45%, var(--brand-border));
    }
  `],
  template: `
  <section class="container my-4">
    <nav class="small mb-2"><a routerLink="/">Inicio</a> › Ayuda</nav>
    <span class="section-eyebrow mb-2 d-inline-flex">Soporte Roue</span>
    <h1 class="display-6 mb-3">Ayuda y Emergencias</h1>

    <div class="card p-3 mb-3">
      <div class="help-grid">
        <div class="help-tile">
          <span class="help-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" focusable="false">
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
          </span>
          <div>
            <div class="fw-semibold">Asistencia inmediata</div>
            <small class="text-muted">¿Neumático dañado? Contáctanos ahora.</small>
          </div>
        </div>
        <div class="help-tile">
          <lucide-icon name="message-circle" size="22" [strokeWidth]="2.5" aria-hidden="true"></lucide-icon>
          <div>
            <div class="fw-semibold">WhatsApp</div>
            <small class="text-muted">Respuesta rápida por chat.</small>
          </div>
        </div>
        <div class="help-tile">
          <span class="help-icon" aria-hidden="true">
            <lucide-icon name="phone" size="22" [strokeWidth]="2.4"></lucide-icon>
          </span>
          <div>
            <div class="fw-semibold">Llámanos</div>
            <small class="text-muted">Horario: 9:00–18:00 hrs.</small>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3 align-items-stretch">
      <div class="col-12 col-md-6">
        <div class="card p-3 h-100">
          <span class="section-eyebrow mb-2 d-inline-flex">Contáctanos</span>
          <h2 class="h5 mb-3">Estamos disponibles</h2>
          <div class="contact">
            <div class="contact-item">
              <span class="contact-icon" aria-hidden="true">
                <lucide-icon name="phone" size="20" [strokeWidth]="2.4"></lucide-icon>
              </span>
              <div><span class="text-muted">Teléfono: </span><a [href]="'tel:' + supportPhone">{{ supportPhoneDisplay }}</a></div>
            </div>
            <div class="contact-item">
              <span class="contact-icon" aria-hidden="true">
                <lucide-icon name="message-circle" size="20" [strokeWidth]="2.4"></lucide-icon>
              </span>
              <div><span class="text-muted">WhatsApp: </span><a [href]="waLink" target="_blank" rel="noopener">Escríbenos</a></div>
            </div>
            <div class="contact-item">
              <span class="contact-icon" aria-hidden="true">
                <lucide-icon name="mail" size="20" [strokeWidth]="2.4"></lucide-icon>
              </span>
              <div><span class="text-muted">Correo: </span><a href="mailto:hola@roue.mx">hola@roue.mx</a></div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6">
        <div class="card p-3 h-100">
          <span class="section-eyebrow mb-2 d-inline-flex">Tips express</span>
          <h2 class="h5 mb-3">Qué hacer antes de llamar</h2>
          <ul class="tips-list">
            <li class="tip-item">
              <span class="tip-icon"><lucide-icon name="alert-triangle" size="18" [strokeWidth]="2.4"></lucide-icon></span>
              <div class="small">Evita circular si detectas daño severo en la llanta.</div>
            </li>
            <li class="tip-item">
              <span class="tip-icon"><lucide-icon name="gauge" size="18" [strokeWidth]="2.4"></lucide-icon></span>
              <div class="small">Revisa la presión de todas las llantas antes de continuar.</div>
            </li>
            <li class="tip-item">
              <span class="tip-icon"><lucide-icon name="map-pin" size="18" [strokeWidth]="2.4"></lucide-icon></span>
              <div class="small">Comparte tu ubicación al contactar soporte para una atención más rápida.</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
  `
})
export class AyudaPage {
  readonly waNumber = '5215555555555';
  readonly waLink = `https://wa.me/${this.waNumber}?text=${encodeURIComponent('Hola, necesito ayuda con mis llantas')}`;
  readonly supportPhone = '5555555555';
  readonly supportPhoneDisplay = '(55) 5555 5555';
}
