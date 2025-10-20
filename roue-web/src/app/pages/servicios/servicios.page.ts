import { Component } from '@angular/core';
import { NgClass, NgFor } from '@angular/common';

@Component({
  standalone: true,
  imports: [NgFor, NgClass],
  template: `
    <article class="services-page">
      <section class="services-hero text-white">
        <img
          class="hero-image"
          src="https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=2000&q=80"
          alt="Técnico ajustando una llanta en taller premium"
          loading="lazy"
        />
        <div class="hero-overlay"></div>
        <div class="container position-relative py-5">
          <div class="row gy-5 align-items-end">
            <div class="col-lg-7 hero-copy">
              <span class="section-eyebrow text-white-50">Servicios Roue</span>
              <h1 class="display-5 fw-bold mb-3">Performance confiable para cada kilómetro</h1>
              <p class="hero-lead">
                Del montaje milimétrico a los programas de mantenimiento predictivo. Configuramos soluciones para autos deportivos, SUV, flotillas y pilotos de track-day.
              </p>
              <div class="hero-metrics">
                <div class="metric">
                  <span class="metric-value">24/7</span>
                  <span class="metric-label">Soporte móvil</span>
                </div>
                <div class="metric">
                  <span class="metric-value">+140</span>
                  <span class="metric-label">Marcas certificadas</span>
                </div>
                <div class="metric">
                  <span class="metric-value">99.4%</span>
                  <span class="metric-label">Diagnósticos acertados</span>
                </div>
              </div>
            </div>
            <div class="col-lg-5">
              <aside class="hero-card">
                <span class="hero-label">Diagnóstico inicial</span>
                <h2 class="h4 mb-3">Agenda una revisión integral</h2>
                <p class="text-white-75 mb-4">
                  Evaluamos desgaste, presión, alineación y telemetría para recomendarte la llanta exacta y el plan ideal.
                </p>
                <div class="d-flex flex-column flex-md-row gap-3">
                  <button type="button" class="btn btn-light btn-lg text-dark fw-semibold">Agendar ahora</button>
                  <button type="button" class="btn btn-outline-light btn-lg">Ver planes empresariales</button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section class="py-5 bg-body service-grid">
        <div class="container">
          <div class="text-center mb-5">
            <span class="section-eyebrow d-inline-flex justify-content-center">Experiencia integral</span>
            <h2 class="display-6 section-title">Servicios insignia para dominar cada terreno</h2>
            <p class="text-muted col-lg-8 mx-auto">
              Ingeniería de precisión, herramientas calibradas y especialistas certificados para entregar resultados impecables desde el primer montaje.
            </p>
          </div>
      <div class="row g-4">
            <div class="col-md-6 col-xl-3" *ngFor="let service of services">
              <article class="service-card h-100">
                <figure class="service-media ratio ratio-4x3">
                  <img [src]="service.image" [alt]="service.alt" loading="lazy" />
                </figure>
                <div class="service-body">
                  <span class="service-badge">{{ service.badge }}</span>
                  <h3 class="h4">{{ service.title }}</h3>
                  <p class="text-muted">{{ service.description }}</p>
                  <ul class="text-muted small">
                    <li *ngFor="let item of service.points">{{ item }}</li>
                  </ul>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section class="py-5 plans">
        <div class="container">
          <div class="row gy-5 align-items-center">
            <div class="col-lg-5">
              <span class="section-eyebrow d-inline-flex">Planes a medida</span>
              <h2 class="display-6 section-title">El paquete que potencia tu conducción</h2>
              <p class="text-muted mb-4">
                Configura la combinación perfecta de inspecciones, reemplazos y asistencia para conductores urbanos, entusiastas de pista y flotillas comerciales.
              </p>
              <div class="plan-chips">
                <span>Cobertura nacional</span>
                <span>Garantía antirrotura</span>
                <span>Reportes digitales</span>
              </div>
            </div>
            <div class="col-lg-7">
              <div class="row g-4">
                <div class="col-md-6" *ngFor="let plan of plans">
                  <article class="plan-card" [class.plan-card-highlight]="plan.highlight">
                    <div class="plan-header">
                      <h3 class="h4 mb-1">{{ plan.name }}</h3>
                      <p class="text-muted mb-0">{{ plan.subtitle }}</p>
                    </div>
                    <ul class="plan-list">
                      <li *ngFor="let item of plan.items">{{ item }}</li>
                    </ul>
                    <div class="plan-footer">
                      <span class="plan-price">{{ plan.price }}<span class="plan-price-period">/{{ plan.period }}</span></span>
                      <button type="button" class="btn" [ngClass]="plan.highlight ? 'btn-light text-dark fw-semibold' : 'btn-outline-secondary'">
                        {{ plan.cta }}
                      </button>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-5 bg-body">
        <div class="container">
          <div class="row gy-4 align-items-center">
            <div class="col-lg-6">
              <span class="section-eyebrow d-inline-flex">Cashback inteligente</span>
              <h2 class="display-6 section-title">Acumula saldo en cada servicio</h2>
              <p class="text-muted mb-4">
                Cada intervención suma cashback personalizado según tipo de vehículo, categoría y frecuencia. Visualiza tu balance desde el perfil y redímelo en tu siguiente visita.
              </p>
              <div class="cashback-list">
                <div class="cashback-item">
                  <span class="item-icon">01</span>
                  <div>
                    <strong>Registro sin costo</strong>
                    <p class="text-muted mb-0 small">Crea tu cuenta y obtén 5% en tu primera instalación.</p>
                  </div>
                </div>
                <div class="cashback-item">
                  <span class="item-icon">02</span>
                  <div>
                    <strong>Cashback por categoría</strong>
                    <p class="text-muted mb-0 small">Mayor porcentaje en servicios de mantenimiento predictivo.</p>
                  </div>
                </div>
                <div class="cashback-item">
                  <span class="item-icon">03</span>
                  <div>
                    <strong>Bonos por recurrencia</strong>
                    <p class="text-muted mb-0 small">Desbloquea beneficios adicionales al completar tus rotaciones.</p>
                  </div>
                </div>
              </div>
              <button type="button" class="btn btn-primary btn-lg mt-3">Ver estados de recompensa</button>
            </div>
            <div class="col-lg-6">
              <div class="testimonials">
                <article class="testimonial">
                  <p class="mb-3">“Reducimos 22% el gasto en llantas de nuestra flotilla urbana gracias al plan Predict+ y al cashback de servicios.”</p>
                  <div class="small text-muted">Julio Herrera · Operaciones FleetGo</div>
                </article>
                <article class="testimonial">
                  <p class="mb-3">“El soporte móvil llegó en menos de 40 minutos al autódromo. Ajustaron presiones y alineación antes de la siguiente manga.”</p>
                  <div class="small text-muted">Valeria Núñez · Piloto amateur</div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>
    </article>
  `,
  styles: [`
    :host { display: block; }

    .services-hero {
      position: relative;
      border: 1px solid var(--brand-border);
      border-radius: var(--brand-radius-lg);
      min-height: clamp(520px, 70vh, 720px);
      background: linear-gradient(135deg, var(--brand-primary-dark) 0%, #123b68 100%);
      color: #fff;
      box-shadow: var(--shadow-soft);
      overflow: hidden;
    }
    .hero-image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(.65);
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: rgba(9, 14, 32, .65);
    }
    .hero-copy { position: relative; z-index: 2; max-width: 640px; }
    .hero-lead { color: rgba(255,255,255,.78); font-size: 1.05rem; }
    .hero-metrics {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-top: 2rem;
    }
    .metric {
      min-width: 120px;
      padding: .85rem 1.1rem;
      border-radius: var(--brand-radius-md);
      background: rgba(255,255,255,.18);
      border: 1px solid rgba(255,255,255,.4);
      text-align: center;
      backdrop-filter: blur(8px);
    }
    .metric-value { display: block; font-family: var(--font-display); font-size: 1.5rem; letter-spacing: .08em; }
    .metric-label { display: block; font-size: .72rem; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.7); }

    .hero-card {
      position: relative;
      border-radius: var(--brand-radius-lg);
      padding: clamp(1.8rem, 4vw, 2.4rem);
      background: linear-gradient(180deg, #ffffff 0%, #f3f6fb 100%);
      border: 1px solid var(--brand-border);
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
      color: var(--brand-ink);
      box-shadow: var(--shadow-soft);
    }
    .hero-label {
      display: inline-flex;
      align-items: center;
      padding: .35rem .9rem;
      border-radius: var(--brand-radius-sm);
      background: rgba(236, 242, 255, 0.7);
      letter-spacing: .12em;
      font-size: .64rem;
      text-transform: uppercase;
      color: var(--brand-muted);
    }

    .service-card {
      border-radius: var(--brand-radius-lg);
      border: 1px solid var(--brand-border);
      background: linear-gradient(180deg, #ffffff 0%, #f4f6fb 100%);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: var(--shadow-soft);
      transition: border-color var(--transition-base), background var(--transition-base), transform var(--transition-base), box-shadow var(--transition-base);
    }
    .service-card:hover {
      border-color: color-mix(in srgb, var(--brand-primary) 35%, var(--brand-border));
      background: #ffffff;
      transform: translateY(-4px);
      box-shadow: var(--shadow-hover);
    }
    .service-media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .service-body {
      padding: clamp(1.3rem, 3vw, 1.8rem);
      display: grid;
      gap: .75rem;
    }
    .service-badge {
      display: inline-flex;
      align-items: center;
      padding: .35rem .75rem;
      border-radius: var(--brand-radius-sm);
      background: rgba(236, 242, 255, 0.7);
      color: var(--brand-primary);
      letter-spacing: .08em;
      font-size: .66rem;
      font-weight: 600;
    }

    .plans {
      background: var(--brand-cream);
      border: 1px solid var(--brand-border);
      border-radius: var(--brand-radius-lg);
      box-shadow: var(--shadow-soft);
    }
    .plan-chips {
      display: flex;
      flex-wrap: wrap;
      gap: .5rem;
    }
    .plan-chips span {
      padding: .4rem .95rem;
      border-radius: var(--brand-radius-sm);
      border: 1px solid var(--brand-border);
      background: #ffffff;
      font-weight: 600;
      letter-spacing: .02em;
    }
    .plan-card {
      border-radius: var(--brand-radius-lg);
      border: 1px solid var(--brand-border);
      background: linear-gradient(180deg, #ffffff 0%, #f4f6fb 100%);
      padding: clamp(1.5rem, 3vw, 1.9rem);
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
      transition: border-color var(--transition-base), background var(--transition-base), transform var(--transition-base), box-shadow var(--transition-base);
      box-shadow: var(--shadow-soft);
    }
    .plan-card:hover {
      border-color: color-mix(in srgb, var(--brand-primary) 35%, var(--brand-border));
      background: #ffffff;
      transform: translateY(-4px);
      box-shadow: var(--shadow-hover);
    }
    .plan-card-highlight {
      background: rgba(236, 242, 255, 0.65);
      border-color: color-mix(in srgb, var(--brand-primary) 45%, var(--brand-border));
    }
    .plan-header p { font-size: .9rem; }
    .plan-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: .6rem;
      color: var(--brand-muted);
      font-size: .92rem;
    }
    .plan-list li::before {
      content: '•';
      color: var(--brand-primary);
      margin-right: .5rem;
      font-weight: 700;
    }
    .plan-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .plan-price {
      font-family: var(--font-display);
      font-size: 1.6rem;
      color: var(--brand-primary);
    }
    .plan-price-period {
      font-size: .85rem;
      font-family: var(--font-sans);
      color: var(--brand-muted);
      margin-left: .4rem;
    }

    .cashback-list {
      display: grid;
      gap: 1rem;
    }
    .cashback-item {
      display: flex;
      gap: 1rem;
      padding: .85rem 1rem;
      border-radius: var(--brand-radius-md);
      border: 1px solid var(--brand-border);
      background: linear-gradient(180deg, #ffffff 0%, #f4f6fb 100%);
      box-shadow: var(--shadow-soft);
    }
    .item-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: var(--brand-radius-sm);
      background: rgba(236, 242, 255, 0.7);
      color: var(--brand-primary);
      font-family: var(--font-display);
      font-size: 1rem;
      letter-spacing: .08em;
    }

    .testimonials {
      display: grid;
      gap: 1.1rem;
    }
    .testimonial {
      padding: 1.3rem 1.5rem;
      border-radius: var(--brand-radius-lg);
      border: 1px solid var(--brand-border);
      background: linear-gradient(180deg, #ffffff 0%, #f5f6fb 100%);
      box-shadow: var(--shadow-soft);
    }

    @media (max-width: 767.98px) {
      .plan-footer { flex-direction: column; align-items: flex-start; }
      .hero-metrics { gap: .8rem; }
      .metric { flex: 1 1 45%; }
    }

    :host-context([data-bs-theme='dark']) .hero-card,
    :host-context([data-bs-theme='dark']) .service-card,
    :host-context([data-bs-theme='dark']) .plan-card,
    :host-context([data-bs-theme='dark']) .cashback-item,
    :host-context([data-bs-theme='dark']) .testimonial,
    :host-context([data-bs-theme='dark']) .plans {
      background: var(--brand-cloud);
      border-color: var(--brand-border);
      color: var(--brand-ink);
    }
    :host-context([data-bs-theme='dark']) .plan-card-highlight {
      background: var(--surface-subtle);
      border-color: var(--brand-primary);
    }
  `]
})
export class ServiciosPage {
  readonly services = [
    {
      badge: '01',
      title: 'Montaje y balanceo de precisión',
      description: 'Maquinaria Hunter® Road Force y torque controlado para proteger tu suspensión y brindar suavidad al volante.',
      points: [
        'Diagnóstico digital del aro en segundos',
        'Balanceo dinámico con microajustes',
        'Revisión y calibración de sensores TPMS'
      ],
      image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=1200&q=80',
      alt: 'Especialista instalando llanta de alto desempeño'
    },
    {
      badge: '02',
      title: 'Alineación inteligente en 3D',
      description: 'Visión computarizada para asegurar desgaste uniforme y respuesta precisa en curvas.',
      points: [
        'Lectura milimétrica de caída y convergencia',
        'Reportes visuales para tu historial',
        'Configuraciones street, touring o carga pesada'
      ],
      image: 'https://images.unsplash.com/photo-1605296862957-0e957c31c27d?auto=format&fit=crop&w=1200&q=80',
      alt: 'Vehículo sobre rampa durante servicio de alineación'
    },
    {
      badge: '03',
      title: 'Pit-stop móvil 24/7',
      description: 'Unidades equipadas llegan a tu domicilio, flotilla o pista para resolver emergencias sin detenerte.',
      points: [
        'GPS en ruta y ETA en tiempo real',
        'Montaje, vulcanizado y programación TPMS',
        'Cobertura autopistas y perímetros urbanos'
      ],
      image: 'https://images.unsplash.com/photo-1542367592-8849eb950fd8?auto=format&fit=crop&w=1200&q=80',
      alt: 'Camión de asistencia móvil para cambio de llantas'
    },
    {
      badge: '04',
      title: 'Consultoría de performance',
      description: 'Analizamos hábitos de manejo, telemetría y objetivos para recomendar combinaciones óptimas de llantas y rines.',
      points: [
        'Sesiones uno a uno con especialista',
        'Plan anual de rotación y mantenimiento',
        'Acceso a garantías extendidas y beneficios'
      ],
      image: 'https://images.unsplash.com/photo-1513028325910-4c5090065ff0?auto=format&fit=crop&w=1200&q=80',
      alt: 'Consultor mostrando opciones de llantas premium a cliente'
    }
  ];

  readonly plans = [
    {
      name: 'Track+ Sport',
      subtitle: 'Para autos performance y SUV premium',
      items: [
        'Rotación y balanceo cada 5,000 km',
        'Setup de alineación custom (street / track)',
        'Soporte express en eventos y track-days',
        'Acceso prioritario a llantas semi-slick'
      ],
      price: '$2,890',
      period: 'trimestre',
      cta: 'Solicitar demo',
      highlight: false
    },
    {
      name: 'Predict+ Flotas',
      subtitle: 'Control total para flotillas urbanas y de última milla',
      items: [
        'Monitoreo de desgaste y alerta temprana',
        'Inventario de llantas y rotación automatizada',
        'Cashback preferencial por volumen',
        'Reportes digitales y API para tu ERP'
      ],
      price: '$8,500',
      period: 'mes',
      cta: 'Hablar con un asesor',
      highlight: true
    }
  ];
}
