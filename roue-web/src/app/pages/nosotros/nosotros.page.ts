import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `
    <article class="nosotros-page">
      <section class="nosotros-hero position-relative overflow-hidden text-white">
        <div class="container py-5">
          <div class="row align-items-center gy-4">
            <div class="col-lg-6">
              <span class="sticker sticker-red mb-3">Roue Performance</span>
              <h1 class="display-4 text-uppercase drift-in">Impulsamos cada kilómetro</h1>
              <p class="lead text-white-50 mb-4">
                Somos especialistas en llantas premium que combinan ingeniería avanzada, asesoría personalizada
                y logística inmediata para mantener tu flota y tus proyectos siempre en movimiento.
              </p>
              <div class="d-flex flex-wrap gap-3">
                <div class="stat-card">
                  <span class="stat-number">18+</span>
                  <span class="stat-label">Años optimizando el desempeño vehicular</span>
                </div>
                <div class="stat-card">
                  <span class="stat-number">4800+</span>
                  <span class="stat-label">Vehículos equipados cada año</span>
                </div>
                <div class="stat-card">
                  <span class="stat-number">9.7/10</span>
                  <span class="stat-label">Índice de satisfacción en servicio y asesoría</span>
                </div>
              </div>
            </div>
            <div class="col-lg-6">
              <div class="ratio ratio-4x3 image-frame rounded-4 shadow-lg" data-slot="hero">
                <div class="image-slot">
                  <span class="placeholder-text">Inserta aquí tu imagen hero del showroom o taller</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="hero-accent"></div>
      </section>

      <section class="py-5 bg-body">
        <div class="container">
          <div class="row align-items-center gy-5">
            <div class="col-lg-6 order-lg-2">
              <div class="image-stack">
                <div class="ratio ratio-4x3 image-frame rounded-4 mb-4" data-slot="historia-principal">
                  <div class="image-slot">
                    <span class="placeholder-text">Coloca una foto del equipo montando llantas</span>
                  </div>
                </div>
                <div class="image-stack-secondary">
                  <div class="ratio ratio-1x1 image-frame rounded-4" data-slot="historia-detalle">
                    <div class="image-slot">
                      <span class="placeholder-text">Añade un detalle de tu almacén o inventario</span>
                    </div>
                  </div>
                  <div class="ratio ratio-1x1 image-frame rounded-4" data-slot="historia-ambiente">
                    <div class="image-slot">
                      <span class="placeholder-text">Incluye una toma de instalaciones o sala de ventas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-6 order-lg-1">
              <span class="sticker mb-3">Nuestra historia</span>
              <h2 class="section-title display-6">Del taller boutique a la experiencia high performance</h2>
              <p class="text-muted mb-4">
                Nacimos como un pequeño garage apasionado por el grip perfecto y hoy somos el aliado estratégico para
                conductores, flotas y concesionarios que buscan llantas confiables, atractivas y listas para cualquier reto.
              </p>
              <div class="story-timeline">
                <div class="timeline-item">
                  <div class="timeline-year">2009</div>
                  <p class="timeline-copy">Abrimos nuestra primera bodega especializada en llantas de alto rendimiento.</p>
                </div>
                <div class="timeline-item">
                  <div class="timeline-year">2014</div>
                  <p class="timeline-copy">Integramos servicios móviles de montaje y balanceo para flotas.</p>
                </div>
                <div class="timeline-item">
                  <div class="timeline-year">2020</div>
                  <p class="timeline-copy">Lanzamos programas de reciclaje y reacondicionamiento responsable de llantas.</p>
                </div>
                <div class="timeline-item">
                  <div class="timeline-year">Hoy</div>
                  <p class="timeline-copy">Diseñamos soluciones a medida para amantes de la conducción, SUVs y vehículos comerciales.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-5 position-relative">
        <div class="container">
          <div class="text-center mb-5">
            <span class="sticker sticker-red mb-3">Valores</span>
            <h2 class="section-title display-6">Principios que nos guían en cada instalación</h2>
            <p class="text-muted col-lg-8 mx-auto">
              Cada decisión que tomamos se enfoca en seguridad, eficiencia y una asesoría honesta para que tu inversión rinda al máximo.
            </p>
          </div>
          <div class="row g-4">
            <div class="col-md-4">
              <div class="value-card h-100">
                <div class="value-label">01</div>
                <h3 class="h4">Seguridad comprobada</h3>
                <p class="text-muted mb-0">Protocolos certificados, equipos calibrados y pruebas de calidad en cada llanta que entregamos.</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="value-card h-100">
                <div class="value-label">02</div>
                <h3 class="h4">Stock inteligente</h3>
                <p class="text-muted mb-0">Inventarios dinámicos, entregas express y tecnología para rastrear disponibilidad en tiempo real.</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="value-card h-100">
                <div class="value-label">03</div>
                <h3 class="h4">Asesoría experta</h3>
                <p class="text-muted mb-0">Especialistas que entienden tu estilo de conducción y recomiendan la llanta ideal para cada terreno.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-5 team-section">
        <div class="container">
          <div class="row align-items-center gy-4">
            <div class="col-lg-5">
              <span class="sticker mb-3">Equipo</span>
              <h2 class="section-title display-6">El equipo que pone tracción a tus metas</h2>
              <p class="text-muted">
                Asesores técnicos, ingenieros en desempeño y especialistas en logística trabajando juntos para ofrecer
                un servicio integral antes, durante y después de la venta.
              </p>
              <ul class="list-unstyled text-muted small mb-0">
                <li class="mb-2">• Certificaciones en control de calidad, montaje y balanceo.</li>
                <li class="mb-2">• Capacitación constante en nuevas tecnologías y marcas premium.</li>
                <li>• Vocación por entender las necesidades de cada conductor y flota.</li>
              </ul>
            </div>
            <div class="col-lg-7">
              <div class="row g-4">
                <div class="col-sm-6">
                  <div class="team-card h-100">
                    <div class="ratio ratio-1x1 image-frame team-photo" data-slot="equipo-lider-tecnico">
                      <div class="image-slot">
                        <span class="placeholder-text">Agrega la foto del líder técnico</span>
                      </div>
                    </div>
                    <h4 class="h5 mt-3 mb-1">Nombre del Líder Técnico</h4>
                    <p class="text-muted small mb-0">Director de ingeniería &mdash; Especialista en compuestos y performance.</p>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="team-card h-100">
                    <div class="ratio ratio-1x1 image-frame team-photo" data-slot="equipo-asesor-comercial">
                      <div class="image-slot">
                        <span class="placeholder-text">Añade la imagen del asesor comercial</span>
                      </div>
                    </div>
                    <h4 class="h5 mt-3 mb-1">Nombre del Asesor Comercial</h4>
                    <p class="text-muted small mb-0">Experto en segmentar líneas, garantías y paquetes empresariales.</p>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="team-card h-100">
                    <div class="ratio ratio-1x1 image-frame team-photo" data-slot="equipo-servicio">
                      <div class="image-slot">
                        <span class="placeholder-text">Inserta la foto del especialista en servicio</span>
                      </div>
                    </div>
                    <h4 class="h5 mt-3 mb-1">Nombre del Especialista de Servicio</h4>
                    <p class="text-muted small mb-0">Supervisor de montaje &mdash; Certificado en balanceo y alineación.</p>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="team-card h-100">
                    <div class="ratio ratio-1x1 image-frame team-photo" data-slot="equipo-logistica">
                      <div class="image-slot">
                        <span class="placeholder-text">Suma la imagen del coordinador logístico</span>
                      </div>
                    </div>
                    <h4 class="h5 mt-3 mb-1">Nombre del Coordinador Logístico</h4>
                    <p class="text-muted small mb-0">Gestiona inventarios, rutas y alianzas con proveedores.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="map-section py-5 bg-body">
        <div class="container">
          <div class="row justify-content-center mb-4 mb-lg-5 text-center text-lg-start">
            <div class="col-lg-8">
              <span class="sticker sticker-red mb-3 d-inline-flex align-items-center gap-2">
                <span class="badge-dot"></span>
                Sucursales
              </span>
              <h2 class="section-title display-6 mb-3">Encuentra tu sucursal más cercana</h2>
              <p class="text-muted mb-0">
                Nuestra base de operaciones se localiza al sur de Monterrey con cobertura metropolitana y envíos
                nacionales. Visítanos para asesoría especializada o agenda una cita con nuestros técnicos.
              </p>
            </div>
          </div>
          <div class="map-toolbar rounded-4 shadow-sm mb-3 mb-lg-4">
            <div class="toolbar-location">
              <strong>Av. Eugenio Garza Sada #4446 Las Brisas, Monterrey, N.L.</strong>
              <span class="toolbar-meta">Lunes a sábado · 09:00 a 19:00 h</span>
            </div>
            <div class="toolbar-actions">
              <a class="btn btn-sm btn-outline-secondary" href="tel:+528112345678">Llamar</a>
              <a class="btn btn-sm btn-primary" target="_blank" rel="noopener" href="https://maps.google.com/?q=Av.+Eugenio+Garza+Sada+4446+Las+Brisas,+Monterrey,+NL">
                Abrir en Google Maps
              </a>
            </div>
          </div>
          <div class="map-frame shadow-lg">
            <iframe
              title="Ubicación Roue Performance Monterrey"
              loading="lazy"
              allowfullscreen
              referrerpolicy="no-referrer-when-downgrade"
              src="https://maps.google.com/maps?q=Av.%20Eugenio%20Garza%20Sada%204446%20Las%20Brisas,%20Monterrey%20NL&z=13&output=embed">
            </iframe>
            <div class="map-info-card">
              <h3 class="h6 mb-1 text-uppercase">Roue Performance · Matriz</h3>
              <p class="mb-2 small text-muted">
                Atención personalizada, montaje certificado y almacén con inventario inmediato.
              </p>
              <ul class="list-unstyled mb-3 small text-muted">
                <li>• Estacionamiento y sala de espera climatizada</li>
                <li>• Montaje y balanceo especializado en llantas premium</li>
                <li>• Rutas de entrega express área metropolitana</li>
              </ul>
              <div class="d-flex gap-2 flex-wrap">
                <a class="btn btn-sm btn-outline-primary" target="_blank" rel="noopener" href="https://maps.google.com/?daddr=Av.+Eugenio+Garza+Sada+4446+Las+Brisas,+Monterrey,+NL">
                  Obtener indicaciones
                </a>
                <a class="btn btn-sm btn-light" href="mailto:hola@roue.mx">Agendar visita</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-5">
        <div class="container">
          <div class="cta-banner rounded-4 p-4 p-lg-5 text-white overflow-hidden position-relative">
            <div class="row align-items-center g-4">
              <div class="col-lg-7">
                <h2 class="display-6 mb-3">¿Listo para acelerar con la cobertura ideal?</h2>
                <p class="text-white-50 mb-0">
                  Diseñamos propuestas personalizadas para distribuidores, talleres y pilotos que exigen desempeño.
                  Contáctanos y llevemos tus proyectos al siguiente nivel.
                </p>
              </div>
              <div class="col-lg-5">
                <div class="ratio ratio-16x9 image-frame" data-slot="cta">
                  <div class="image-slot image-slot-light">
                    <span class="placeholder-text">Reserva este espacio para una imagen de vitrina o pista</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="cta-overlay"></div>
          </div>
        </div>
      </section>
    </article>
  `,
  styles: [
    `
    :host { display: block; }

    .nosotros-hero {
      background: var(--brand-primary-dark);
      color: #fff;
    }
    .hero-accent { display: none; }

    .stat-card {
      min-width: 160px;
      padding: 1.25rem;
      border-radius: var(--brand-radius-md);
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.35);
      backdrop-filter: blur(8px);
    }
    .stat-number {
      display: block;
      font-family: var(--font-display);
      font-size: clamp(2rem, 4vw, 2.75rem);
      letter-spacing: 1px;
    }
    .stat-label {
      display: block;
      color: rgba(255, 255, 255, 0.75);
      font-size: 0.9rem;
      line-height: 1.3;
    }

    .image-frame {
      position: relative;
      border-radius: var(--brand-radius-lg);
      background: var(--brand-cloud);
      border: 1px solid var(--brand-border);
      overflow: hidden;
      box-shadow: var(--shadow-soft);
    }
    .image-frame img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .image-slot {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 1.5rem;
      border: 1px dashed var(--brand-primary);
      color: var(--brand-primary);
      background: var(--brand-cloud);
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.08em;
      font-weight: 700;
      border-radius: var(--brand-radius-md);
    }
    .image-slot-light {
      background: var(--surface-subtle);
      border-color: var(--brand-border);
      color: var(--brand-ink-soft);
      border-radius: var(--brand-radius-md);
    }
    .placeholder-text { max-width: 18ch; }

    .image-stack { position: relative; }
    .image-stack-secondary {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .story-timeline {
      position: relative;
      padding-left: 2rem;
      margin-top: 2rem;
    }
    .story-timeline::before {
      content: '';
      position: absolute;
      left: 0.8rem;
      top: 0.2rem;
      bottom: 0.2rem;
      width: 2px;
      background: var(--brand-border);
    }
    .timeline-item { position: relative; padding-bottom: 1.5rem; }
    .timeline-item:last-child { padding-bottom: 0; }
    .timeline-item::before {
      content: '';
      position: absolute;
      left: -1.1rem;
      top: 0.3rem;
      width: 0.8rem;
      height: 0.8rem;
      border-radius: var(--brand-radius-sm);
      background: var(--brand-primary);
    }
    .timeline-year {
      font-family: var(--font-display);
      font-size: 1.1rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--brand-primary);
      margin-bottom: 0.25rem;
    }
    .timeline-copy {
      font-size: 0.95rem;
      color: var(--brand-ink-soft);
      margin-bottom: 0;
    }

    .value-card {
      padding: 1.8rem 1.6rem;
      border-radius: var(--brand-radius-lg);
      border: 1px solid var(--brand-border);
      background: linear-gradient(180deg, #ffffff 0%, #f4f6fb 100%);
      box-shadow: var(--shadow-soft);
    }
    .value-label {
      display: inline-flex;
      width: 44px;
      height: 44px;
      border-radius: var(--brand-radius-sm);
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      background: var(--surface-subtle);
      color: var(--brand-primary);
      font-weight: 700;
      letter-spacing: 0.06em;
    }

    .team-section {
      background: var(--brand-cream);
    }
    .team-card {
      padding: 1.5rem;
      border-radius: var(--brand-radius-lg);
      background: linear-gradient(180deg, #ffffff 0%, #f4f6fb 100%);
      border: 1px solid var(--brand-border);
      box-shadow: var(--shadow-soft);
      transition: border-color var(--transition-base), background var(--transition-base), box-shadow var(--transition-base), transform var(--transition-base);
    }
    .team-card:hover {
      border-color: color-mix(in srgb, var(--brand-primary) 35%, var(--brand-border));
      background: #ffffff;
      box-shadow: var(--shadow-hover);
      transform: translateY(-4px);
    }
    .team-photo {
      border-radius: var(--brand-radius-md);
      border: 1px solid var(--brand-border);
      overflow: hidden;
    }

    .map-section .badge-dot {
      display: inline-flex;
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: #fff;
      box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.35);
    }
    .map-toolbar {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 1.2rem 1.5rem;
      background: linear-gradient(120deg, var(--brand-accent) 0%, color-mix(in srgb, var(--brand-accent) 45%, #ffffff) 92%);
      border: 1px solid color-mix(in srgb, var(--brand-accent) 45%, #000000);
      border-radius: var(--brand-radius-lg);
      color: #fff;
    }
    .map-toolbar .toolbar-location {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .map-toolbar .toolbar-location strong {
      font-size: 1rem;
      letter-spacing: 0.02em;
    }
    .map-toolbar .toolbar-meta {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      opacity: 0.85;
    }
    .map-toolbar .toolbar-actions {
      display: inline-flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .map-toolbar .btn {
      border-radius: var(--brand-radius-sm);
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .map-toolbar .btn-outline-secondary {
      color: #fff;
      border-color: rgba(255, 255, 255, 0.6);
    }
    .map-toolbar .btn-outline-secondary:hover {
      color: var(--brand-primary-dark);
      background: #fff;
      border-color: #fff;
    }

    .map-frame {
      position: relative;
      border-radius: var(--brand-radius-lg);
      overflow: hidden;
      border: 1px solid var(--brand-border);
      background: var(--brand-cloud);
      height: clamp(320px, 55vh, 540px);
    }
    .map-frame iframe {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: 0;
      filter: saturate(1.05);
    }
    .map-info-card {
      position: absolute;
      bottom: clamp(1rem, 3vw, 1.6rem);
      left: clamp(1rem, 3vw, 1.6rem);
      max-width: min(320px, 80%);
      background: rgba(255, 255, 255, 0.94);
      border-radius: var(--brand-radius-md);
      border: 1px solid color-mix(in srgb, var(--brand-border) 65%, transparent);
      box-shadow: 0 22px 48px -26px rgba(12, 22, 40, 0.55);
      padding: 1.1rem 1.2rem;
      backdrop-filter: blur(8px);
    }
    .map-info-card .btn {
      font-weight: 600;
      letter-spacing: 0.04em;
    }

    :host-context([data-bs-theme='dark']) .map-section {
      background: var(--brand-cloud) !important;
    }
    :host-context([data-bs-theme='dark']) .map-toolbar {
      background: linear-gradient(120deg, rgba(31, 67, 115, 0.92) 0%, rgba(13, 32, 60, 0.95) 100%);
      border-color: rgba(19, 46, 86, 0.6);
      color: var(--brand-cream);
    }
    :host-context([data-bs-theme='dark']) .map-toolbar .btn-outline-secondary {
      color: var(--brand-cream);
      border-color: rgba(255, 255, 255, 0.5);
    }
    :host-context([data-bs-theme='dark']) .map-toolbar .btn-outline-secondary:hover {
      color: var(--brand-primary-dark);
      background: #fff;
      border-color: #fff;
    }
    :host-context([data-bs-theme='dark']) .map-frame {
      border-color: rgba(32, 54, 86, 0.8);
      background: rgba(18, 30, 48, 0.95);
    }
    :host-context([data-bs-theme='dark']) .map-info-card {
      background: rgba(17, 26, 42, 0.92);
      color: var(--brand-cream);
      border-color: rgba(74, 93, 124, 0.55);
    }
    :host-context([data-bs-theme='dark']) .map-info-card .btn-light {
      background: rgba(239, 242, 248, 0.92);
      color: var(--brand-primary-dark);
      border: none;
    }

    .cta-banner {
      background: var(--brand-primary-dark);
      color: #fff;
      position: relative;
    }
    .cta-overlay { display: none; }

    @media (max-width: 991.98px) {
      .stat-card { flex: 1 1 150px; }
      .story-timeline { padding-left: 1.6rem; }
      .map-toolbar {
        padding: 1rem 1.25rem;
      }
      .map-toolbar .toolbar-actions {
        width: 100%;
        justify-content: flex-start;
      }
      .map-frame {
        height: clamp(280px, 48vh, 440px);
      }
    }

    @media (max-width: 575.98px) {
      .map-toolbar {
        gap: 0.75rem;
      }
      .map-toolbar .toolbar-actions {
        flex-direction: column;
        align-items: stretch;
      }
      .map-toolbar .btn {
        width: 100%;
        justify-content: center;
      }
      .map-info-card {
        position: static;
        max-width: 100%;
        margin: 0.75rem;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .drift-in { animation: none !important; }
      .team-card:hover { transform: none; }
    }

    :host-context([data-bs-theme="dark"]) .nosotros-hero {
      background: var(--brand-primary-dark);
    }
    :host-context([data-bs-theme="dark"]) .stat-card {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.35);
    }
    :host-context([data-bs-theme="dark"]) .timeline-copy {
      color: var(--brand-ink);
    }
    :host-context([data-bs-theme="dark"]) .story-timeline::before {
      background: var(--brand-border);
    }
    :host-context([data-bs-theme="dark"]) .value-card,
    :host-context([data-bs-theme="dark"]) .team-card,
    :host-context([data-bs-theme="dark"]) .image-frame,
    :host-context([data-bs-theme="dark"]) .image-slot,
    :host-context([data-bs-theme="dark"]) .image-slot-light {
      background: var(--brand-cloud);
      border-color: var(--brand-border);
      color: var(--brand-ink);
    }
    :host-context([data-bs-theme="dark"]) .team-card:hover {
      border-color: var(--brand-primary);
    }
    `
  ]
})
export class NosotrosPage {}
