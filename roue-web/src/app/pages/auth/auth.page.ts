import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthWidgetComponent } from '../../shared/components/auth-widget/auth-widget.component';

@Component({
  standalone: true,
  imports: [AuthWidgetComponent, RouterLink],
  styles: [`
    :host { display: block; }
    .auth-hero { background: var(--brand-cream); padding: clamp(3rem, 8vw, 4.5rem) 0; }
    .hero-card {
      border-radius: var(--brand-radius-lg);
      background: linear-gradient(180deg, #ffffff 0%, #f4f6fb 100%);
      color: var(--brand-ink);
      padding: clamp(2rem, 6vw, 3rem);
      border: 1px solid var(--brand-border);
      box-shadow: var(--shadow-soft);
    }
    .hero-card h2 { font-family: var(--font-display); letter-spacing: .02em; }
    .fact { display: flex; align-items: flex-start; gap: .9rem; }
    .fact-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--brand-radius-sm);
      background: rgba(236, 242, 255, 0.7);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: var(--brand-primary);
    }
    .auth-section { margin-top: clamp(2.5rem, 6vw, 4rem); }
    .highlight { color: var(--jdm-red); font-weight: 700; }
    @media (max-width: 991.98px) {
      .hero-card { margin-top: 2rem; }
    }
  `],
  template: `
  <section class="auth-hero">
    <div class="container">
      <div class="row g-4 align-items-center">
        <div class="col-lg-6">
          <div>
            <span class="badge text-bg-danger mb-3">Roue Access</span>
            <h1 class="display-5 mb-3">Gestiona tu experiencia en un mismo lugar</h1>
            <p class="lead text-muted mb-4">
              Sincroniza tu carrito entre dispositivos, guarda direcciones favoritas y lleva control de tus pedidos en tiempo real.
            </p>
            <div class="d-flex flex-column gap-3">
              <div class="fact">
                <div class="fact-icon">1</div>
                <div>
                  <strong>Historial centralizado</strong>
                  <p class="text-muted mb-0">Revisa compras previas, facturación y status de envíos en segundos.</p>
                </div>
              </div>
              <div class="fact">
                <div class="fact-icon">2</div>
                <div>
                  <strong>Beneficios exclusivos</strong>
                  <p class="text-muted mb-0">Descuentos personalizados y reserva de stock para clientes registrados.</p>
                </div>
              </div>
              <div class="fact">
                <div class="fact-icon">3</div>
                <div>
                  <strong>Soporte prioritario</strong>
                  <p class="text-muted mb-0">Obtén asistencia inmediata desde tu panel o agenda un callback.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="hero-card">
            <h2 class="h3 mb-3">Mantén tu journey al día</h2>
            <p class="mb-0">Una cuenta activa desbloquea pagos rápidos, recompensas y seguimiento detallado de cada llanta instalada.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="auth-section">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-5">
          <app-auth-widget></app-auth-widget>
        </div>
      </div>
      <div class="text-center text-muted mt-3">
        ¿Necesitas ayuda? Visita nuestra sección de <a routerLink="/ayuda" class="highlight">soporte</a> o contáctanos al <span class="highlight">800 000 1234</span>.
      </div>
    </div>
  </section>
  `
})
export class AuthPage {}
