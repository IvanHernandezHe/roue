import { Component } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  standalone: true,
  imports: [NgFor],
  template: `
    <article class="blog-page">
      <section class="blog-hero text-white">
        <img
          class="hero-image"
          src="https://images.unsplash.com/photo-1529429617124-aee66346910f?auto=format&fit=crop&w=2000&q=80"
          alt="Auto deportivo recorriendo una pista al atardecer"
          loading="lazy"
        />
        <div class="hero-overlay"></div>
        <div class="container position-relative py-5">
          <div class="row gy-5 align-items-end">
            <div class="col-lg-7 hero-copy">
              <span class="section-eyebrow text-white-50">Insights Roue</span>
              <h1 class="display-5 fw-bold mb-3">Historias y análisis que aceleran tus decisiones</h1>
              <p class="hero-lead">
                Tendencias en tecnología, guías prácticas de mantenimiento y relatos de quienes llevan sus vehículos al límite con Roue.
              </p>
              <div class="hero-tags">
                <span class="tag-chip">Mantenimiento</span>
                <span class="tag-chip">Performance</span>
                <span class="tag-chip">Flotillas</span>
                <span class="tag-chip">Novedades</span>
              </div>
            </div>
            <div class="col-lg-5">
              <aside class="hero-card">
                <span class="hero-label">Artículo destacado</span>
                <h2 class="h4 mb-3">Cómo elegir la llanta ideal para tu SUV híbrida</h2>
                <p class="text-white-50 mb-4">
                  Comparamos compuestos, patrones de banda y certificaciones clave para mejorar agarre y consumo.
                </p>
                <div class="hero-author d-flex align-items-center gap-3">
                  <img
                    class="author-avatar"
                    src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80"
                    alt="Retrato del autor"
                    loading="lazy"
                  />
                  <div class="small text-white-75">
                    <div class="fw-semibold">Por Laura Méndez</div>
                    <span>6 min de lectura · 02 Jul 2024</span>
                  </div>
                </div>
                <button type="button" class="btn btn-light btn-sm fw-semibold mt-4 align-self-start">Leer ahora</button>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section class="py-5 bg-body">
        <div class="container">
          <div class="row gy-4 align-items-start">
            <div class="col-lg-7">
              <article class="featured-article h-100">
                <figure class="featured-media ratio ratio-16x9">
                  <img
                    src="https://images.unsplash.com/photo-1458063048042-0f265902e64b?auto=format&fit=crop&w=1600&q=80"
                    alt="Auto deportivo compitiendo en pista mojada"
                    loading="lazy"
                  />
                </figure>
                <div class="featured-body">
                  <span class="category-badge">Track Days</span>
                  <h2 class="h3">Setups recomendados para dominar circuitos en temporada de lluvias</h2>
                  <p class="text-muted">
                    Barremos combinaciones de llantas, presiones y ajustes de suspensión para restar segundos sin sacrificar seguridad.
                  </p>
                  <div class="featured-meta text-muted small">
                    <span>Por Marco Vidal</span>
                    <span class="dot">•</span>
                    <span>08 Jul 2024</span>
                    <span class="dot">•</span>
                    <span>8 min de lectura</span>
                  </div>
                </div>
              </article>
            </div>
            <div class="col-lg-5">
              <div class="story-stack">
                <article class="story-card" *ngFor="let post of sidePosts">
                  <div class="story-thumb">
                    <img [src]="post.image" [alt]="post.alt" loading="lazy" />
                  </div>
                  <div class="story-content">
                    <span class="category-chip">{{ post.category }}</span>
                    <h3 class="h5 mb-1">{{ post.title }}</h3>
                    <p class="text-muted small mb-0">{{ post.summary }}</p>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-5 latest-posts">
        <div class="container">
          <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-lg-between mb-4 gap-3">
            <div>
              <span class="section-eyebrow">Últimas entradas</span>
              <h2 class="display-6 mb-0 section-title">Lo más reciente desde nuestra sala de pruebas</h2>
            </div>
            <div class="filter-chips">
              <button type="button" class="filter-chip active">Todos</button>
              <button type="button" class="filter-chip">Tips rápidos</button>
              <button type="button" class="filter-chip">Tecnología</button>
              <button type="button" class="filter-chip">Historias</button>
              <button type="button" class="filter-chip">Noticias</button>
            </div>
          </div>
          <div class="row g-4">
            <div class="col-md-6 col-xl-4" *ngFor="let post of latestPosts">
              <article class="post-card h-100">
                <figure class="post-media ratio ratio-4x3">
                  <img [src]="post.image" [alt]="post.alt" loading="lazy" />
                </figure>
                <div class="post-body">
                  <div class="d-flex align-items-center gap-2 text-muted small">
                    <span class="category-chip">{{ post.category }}</span>
                    <span class="dot">•</span>
                    <span>{{ post.date }}</span>
                  </div>
                  <h3 class="h4 mb-2">{{ post.title }}</h3>
                  <p class="text-muted">{{ post.summary }}</p>
                  <div class="author-row d-flex align-items-center gap-3">
                    <img class="author-avatar" [src]="post.authorAvatar" [alt]="post.author" loading="lazy" />
                    <div class="small text-muted">
                      <div class="fw-semibold text-body">{{ post.author }}</div>
                      <span>{{ post.readTime }} min de lectura</span>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section class="py-5 newsletter">
        <div class="container">
          <div class="row gy-4 align-items-center">
            <div class="col-lg-6">
              <span class="section-eyebrow">Newsletter</span>
              <h2 class="display-6 mb-3 section-title">Recibe comparativas, lanzamientos y consejos exclusivos</h2>
              <p class="text-muted">
                Resúmenes mensuales, invitaciones a track days privados y promociones preferenciales para nuestra comunidad.
              </p>
              <div class="newsletter-form">
                <input type="email" class="form-control form-control-lg" placeholder="tu@email.com" aria-label="Correo electrónico" />
                <button type="button" class="btn btn-primary btn-lg">Suscribirme</button>
              </div>
              <small class="text-muted d-block mt-2">Sin spam. Puedes darte de baja en cualquier momento.</small>
            </div>
            <div class="col-lg-6">
              <div class="newsletter-visual ratio ratio-4x3">
                <img
                  src="https://images.unsplash.com/photo-1519638399535-1b036603ac77?auto=format&fit=crop&w=1600&q=80"
                  alt="Equipo técnico analizando neumáticos en laboratorio"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-5 knowledge-strip text-white">
        <div class="container">
          <div class="row gy-4 align-items-center">
            <div class="col-lg-4">
              <h2 class="display-6 mb-3">Explora nuestras guías técnicas</h2>
              <p class="text-white-75 mb-0">
                Documentos descargables, fichas técnicas y checklists para mejorar tus procesos de mantenimiento y operación.
              </p>
            </div>
            <div class="col-lg-8">
              <div class="resource-grid">
                <article class="resource-card">
                  <div class="resource-icon">DOC</div>
                  <div>
                    <h3 class="h5 mb-1">Manual de presión ideal por carga y clima</h3>
                    <p class="text-white-60 mb-0">Actualizado 2024 · Incluye calculadora y tablas de referencia.</p>
                  </div>
                </article>
                <article class="resource-card">
                  <div class="resource-icon">LAB</div>
                  <div>
                    <h3 class="h5 mb-1">Informe especial: nuevos compuestos de sílice</h3>
                    <p class="text-white-60 mb-0">Impacto en frenado, ruido y durabilidad para uso intensivo.</p>
                  </div>
                </article>
                <article class="resource-card">
                  <div class="resource-icon">PRO</div>
                  <div>
                    <h3 class="h5 mb-1">Checklist previo a track-day</h3>
                    <p class="text-white-60 mb-0">Verificaciones esenciales antes de salir a pista.</p>
                  </div>
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

    .blog-hero {
      position: relative;
      overflow: hidden;
      border: 1px solid var(--brand-border);
      min-height: clamp(520px, 72vh, 760px);
      background: var(--brand-cream);
    }
    .hero-image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(0.75);
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: rgba(11, 15, 32, .6);
    }
    .hero-copy { position: relative; z-index: 2; max-width: 620px; color: var(--brand-cloud); }
    .hero-lead { color: color-mix(in srgb, var(--brand-cloud) 80%, transparent); font-size: 1.05rem; }
    .hero-tags { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: 1.5rem; }
    .tag-chip {
      padding: .35rem .8rem;
      border-radius: var(--brand-radius-sm);
      background: rgba(255,255,255,.15);
      border: 1px solid rgba(255,255,255,.45);
      text-transform: uppercase;
      font-size: .68rem;
      letter-spacing: .12em;
      font-weight: 600;
      color: var(--brand-cloud);
      backdrop-filter: blur(6px);
    }

    .hero-card {
      position: relative;
      border-radius: var(--brand-radius-lg);
      padding: clamp(1.8rem, 4vw, 2.4rem);
      background: linear-gradient(180deg, #ffffff 0%, #f4f6fb 100%);
      border: 1px solid var(--brand-border);
      display: flex;
      flex-direction: column;
      gap: 1rem;
      box-shadow: var(--shadow-soft);
    }
    .hero-label {
      display: inline-flex;
      align-items: center;
      gap: .4rem;
      padding: .3rem .7rem;
      border-radius: var(--brand-radius-sm);
      background: rgba(236, 242, 255, 0.7);
      letter-spacing: .14em;
      font-size: .64rem;
      text-transform: uppercase;
      color: var(--brand-muted);
    }
    .hero-author .author-avatar {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      object-fit: cover;
      border: 1px solid var(--brand-border);
    }

    .featured-article {
      border-radius: var(--brand-radius-lg);
      overflow: hidden;
      background: linear-gradient(180deg, #ffffff 0%, #f4f6fb 100%);
      border: 1px solid var(--brand-border);
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-soft);
    }
    .featured-body {
      padding: clamp(1.6rem, 4vw, 2.2rem);
      display: grid;
      gap: .9rem;
    }
    .category-badge {
      display: inline-block;
      padding: .35rem .8rem;
      border-radius: var(--brand-radius-sm);
      background: rgba(236, 242, 255, 0.7);
      color: var(--brand-ink-soft);
      text-transform: uppercase;
      font-size: .66rem;
      letter-spacing: .1em;
      font-weight: 600;
    }
    .featured-meta { display: flex; align-items: center; gap: .6rem; color: var(--brand-muted); }
    .featured-meta .dot { opacity: .45; }

    .story-stack {
      display: grid;
      gap: 1.1rem;
    }
    .story-card {
      display: grid;
      grid-template-columns: 96px 1fr;
      gap: 1rem;
      padding: 1rem;
      border-radius: var(--brand-radius-md);
      border: 1px solid var(--brand-border);
      background: linear-gradient(180deg, #ffffff 0%, #f4f6fb 100%);
      transition: border-color var(--transition-base), background var(--transition-base), box-shadow var(--transition-base), transform var(--transition-base);
      box-shadow: var(--shadow-soft);
    }
    .story-card:hover {
      border-color: color-mix(in srgb, var(--brand-primary) 35%, var(--brand-border));
      background: #ffffff;
      box-shadow: var(--shadow-hover);
      transform: translateY(-3px);
    }
    .story-thumb {
      overflow: hidden;
      border: 1px solid var(--brand-border);
      border-radius: var(--brand-radius-sm);
      background: var(--brand-cream);
    }
    .story-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .story-content { display: grid; gap: .4rem; }

    .filter-chips {
      display: inline-flex;
      gap: .5rem;
      align-items: center;
      flex-wrap: wrap;
    }
    .filter-chip {
      border: 1px solid var(--brand-border);
      background: #ffffff;
      color: var(--brand-ink);
      padding: .35rem .8rem;
      border-radius: var(--brand-radius-sm);
      font-weight: 600;
      letter-spacing: .04em;
      transition: background var(--transition-base), border-color var(--transition-base), color var(--transition-base), box-shadow var(--transition-base);
      box-shadow: var(--shadow-soft);
    }
    .filter-chip:hover {
      border-color: color-mix(in srgb, var(--brand-primary) 35%, var(--brand-border));
      color: var(--brand-primary);
      box-shadow: var(--shadow-hover);
    }
    .filter-chip.active {
      border-color: color-mix(in srgb, var(--brand-primary) 45%, var(--brand-border));
      background: rgba(236, 242, 255, 0.75);
      color: var(--brand-primary);
    }

    .post-card {
      border-radius: var(--brand-radius-lg);
      border: 1px solid var(--brand-border);
      background: linear-gradient(180deg, #ffffff 0%, #f4f6fb 100%);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: border-color var(--transition-base), background var(--transition-base), box-shadow var(--transition-base), transform var(--transition-base);
      box-shadow: var(--shadow-soft);
    }
    .post-card:hover {
      border-color: color-mix(in srgb, var(--brand-primary) 35%, var(--brand-border));
      background: #ffffff;
      transform: translateY(-4px);
      box-shadow: var(--shadow-hover);
    }
    .post-media {
      overflow: hidden;
      border-bottom: 1px solid var(--brand-border);
      border-radius: var(--brand-radius-md) var(--brand-radius-md) 0 0;
    }
    .post-media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform .25s ease;
    }
    .post-card:hover .post-media img { transform: scale(1.02); }
    .post-body {
      padding: clamp(1.3rem, 3.5vw, 1.8rem);
      display: grid;
      gap: .75rem;
    }
    .author-row .author-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
      border: 1px solid var(--brand-border);
    }

    .newsletter {
      background: linear-gradient(180deg, #ffffff 0%, #f0f4fa 100%);
      border: 1px solid var(--brand-border);
      border-radius: var(--brand-radius-lg);
      padding: 2rem;
      box-shadow: var(--shadow-soft);
    }
    .newsletter-form {
      display: flex;
      flex-direction: column;
      gap: .8rem;
      max-width: 480px;
    }
    @media (min-width: 576px) {
      .newsletter-form { flex-direction: row; align-items: center; }
    }
    .newsletter-visual img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border: 1px solid var(--brand-border);
      border-radius: var(--brand-radius-md);
    }

    .knowledge-strip {
      background: linear-gradient(180deg, #ffffff 0%, #f4f6fb 100%);
      border: 1px solid var(--brand-border);
      border-radius: var(--brand-radius-lg);
      padding: clamp(2rem, 7vw, 3.2rem);
      color: var(--brand-ink);
      box-shadow: var(--shadow-soft);
    }
    .resource-grid {
      display: grid;
      gap: 1.2rem;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }
    .resource-card {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 1rem;
      padding: 1.2rem;
      border-radius: var(--brand-radius-md);
      border: 1px solid var(--brand-border);
      background: linear-gradient(180deg, #ffffff 0%, #f4f6fb 100%);
      box-shadow: var(--shadow-soft);
    }
    .resource-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--brand-radius-sm);
      background: rgba(236, 242, 255, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-size: 1rem;
      letter-spacing: .1em;
      color: var(--brand-ink);
    }

    @media (max-width: 767.98px) {
      .story-card { grid-template-columns: 1fr; }
      .post-body { padding: 1.2rem; }
      .hero-card { margin-top: 2rem; padding: 1.6rem; }
    }

    :host-context([data-bs-theme='dark']) .hero-card,
    :host-context([data-bs-theme='dark']) .featured-article,
    :host-context([data-bs-theme='dark']) .story-card,
    :host-context([data-bs-theme='dark']) .post-card,
    :host-context([data-bs-theme='dark']) .newsletter,
    :host-context([data-bs-theme='dark']) .knowledge-strip,
    :host-context([data-bs-theme='dark']) .resource-card {
      background: var(--brand-cloud);
      border-color: var(--brand-border);
      color: var(--brand-ink);
    }
    :host-context([data-bs-theme='dark']) .filter-chip {
      background: var(--brand-cloud);
      border-color: var(--brand-border);
      color: var(--brand-ink);
    }
    :host-context([data-bs-theme='dark']) .filter-chip.active,
    :host-context([data-bs-theme='dark']) .filter-chip:hover {
      border-color: var(--brand-primary);
      color: var(--brand-primary);
    }
    :host-context([data-bs-theme='dark']) .newsletter-form .form-control {
      background: var(--brand-cloud);
      border-color: var(--brand-border);
      color: var(--brand-ink);
    }
    :host-context([data-bs-theme='dark']) .blog-hero {
      border-color: var(--brand-border);
      background: var(--brand-cream);
    }
  `]
})
export class BlogPage {
  readonly sidePosts = [
    {
      category: 'Flotillas',
      title: 'Reducir 18% los paros por desgaste irregular',
      summary: 'Implementa inspecciones predictivas y rotaciones estratégicas en tu calendario operativo.',
      image: 'https://images.unsplash.com/photo-1529429617124-aee66346910f?auto=format&fit=crop&w=600&q=80',
      alt: 'Supervisor revisando neumáticos de una flotilla comercial'
    },
    {
      category: 'Tecnología',
      title: 'Sensores TPMS que debes conocer en 2024',
      summary: 'Comparamos precisión, compatibilidad y seguridad para el mercado latinoamericano.',
      image: 'https://images.unsplash.com/photo-1582529550960-018487afeca7?auto=format&fit=crop&w=600&q=80',
      alt: 'Close up de sensor TPMS instalado en rin'
    },
    {
      category: 'Tips rápidos',
      title: 'Checklist express antes de salir a carretera',
      summary: 'Cinco puntos clave para asegurar estabilidad, frenado óptimo y mejor consumo.',
      image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=600&q=80',
      alt: 'Persona revisando presión de llantas en gasolinera'
    }
  ];

  readonly latestPosts = [
    {
      category: 'Historias',
      title: 'El equipo Drift MX subió al podio tras ajustar presiones con nuestro laboratorio',
      summary: 'Compartimos la estrategia de neumáticos y telemetría que mejoró el grip en cada curva.',
      image: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1200&q=80',
      alt: 'Auto de drift generando humo en una curva',
      date: '04 Jul 2024',
      author: 'Gabriel Ortiz',
      authorAvatar: 'https://images.unsplash.com/photo-1529933037705-0d537317ae4e?auto=format&fit=crop&w=200&q=80',
      readTime: 7
    },
    {
      category: 'Tecnología',
      title: 'Cómo la inteligencia artificial anticipa el desgaste de tus llantas',
      summary: 'Analizamos casos reales con machine learning para detectar patrones críticos antes del fallo.',
      image: 'https://images.unsplash.com/photo-1580894897200-655b4be94b4b?auto=format&fit=crop&w=1200&q=80',
      alt: 'Pantallas de análisis de datos dentro de un taller automotriz',
      date: '28 Jun 2024',
      author: 'Victoria Salgado',
      authorAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80',
      readTime: 6
    },
    {
      category: 'Noticias',
      title: 'Roue presenta su programa de reciclaje con recompensas para flotillas',
      summary: 'Conoce cómo funciona el plan, qué beneficios financieros entrega y cómo sumarte desde cualquier ciudad.',
      image: 'https://images.unsplash.com/photo-1518552782006-25ef988d57c0?auto=format&fit=crop&w=1200&q=80',
      alt: 'Acopio de llantas listas para reciclaje en almacén',
      date: '21 Jun 2024',
      author: 'Susana Prieto',
      authorAvatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
      readTime: 5
    },
    {
      category: 'Tips rápidos',
      title: 'Tres señales que indican que debes alinear tu vehículo',
      summary: 'Vibraciones, tirones y desgaste irregular: cómo identificarlos y solucionarlos a tiempo.',
      image: 'https://images.unsplash.com/photo-1615914093911-04a482eb8b4e?auto=format&fit=crop&w=1200&q=80',
      alt: 'Técnico midiendo ángulos de alineación',
      date: '17 Jun 2024',
      author: 'Diego Ramírez',
      authorAvatar: 'https://images.unsplash.com/photo-1522098543979-ffc7f79d8c98?auto=format&fit=crop&w=200&q=80',
      readTime: 4
    },
    {
      category: 'Performance',
      title: 'Comparativa: llantas semi-slick vs. ultra high performance',
      summary: 'Evaluamos agarre, temperatura ideal y durabilidad para track days y uso entusiasta en calle.',
      image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80',
      alt: 'Detalle de llantas de alto desempeño en auto deportivo',
      date: '11 Jun 2024',
      author: 'Melissa Castro',
      authorAvatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
      readTime: 6
    },
    {
      category: 'Flotillas',
      title: 'El plan de mantenimiento que redujo 22% los gastos de una empresa logística',
      summary: 'Casos prácticos de rotaciones, telemetría y políticas de conducción adoptadas por clientes Roue.',
      image: 'https://images.unsplash.com/photo-1529429617124-aee66346910f?auto=format&fit=crop&w=1200&q=80',
      alt: 'Camiones de reparto listos para salir a ruta',
      date: '03 Jun 2024',
      author: 'María González',
      authorAvatar: 'https://images.unsplash.com/photo-1529933037705-0d537317ae4e?auto=format&fit=crop&w=200&q=80',
      readTime: 5
    }
  ];
}
