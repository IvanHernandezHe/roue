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
      border-radius: clamp(26px, 6vw, 44px);
      min-height: clamp(520px, 72vh, 760px);
    }
    .hero-image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: saturate(115%) brightness(0.7);
      transform: scale(1.08);
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(15, 18, 44, 0.92), rgba(15, 82, 186, 0.72));
    }
    .hero-copy { position: relative; z-index: 2; max-width: 620px; }
    .hero-lead { color: rgba(255,255,255,.74); font-size: 1.1rem; }
    .hero-tags { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: 1.5rem; }
    .tag-chip {
      padding: .4rem 1rem;
      border-radius: 999px;
      background: rgba(255,255,255,.16);
      border: 1px solid rgba(255,255,255,.28);
      text-transform: uppercase;
      font-size: .7rem;
      letter-spacing: .14em;
      font-weight: 600;
    }

    .hero-card {
      position: relative;
      border-radius: clamp(20px, 4vw, 28px);
      padding: clamp(1.8rem, 4vw, 2.4rem);
      background: rgba(8, 12, 24, .78);
      border: 1px solid rgba(255,255,255,.18);
      backdrop-filter: blur(18px);
      display: flex;
      flex-direction: column;
      gap: 1rem;
      box-shadow: 0 32px 60px rgba(4, 12, 32, .6);
    }
    .hero-label {
      display: inline-flex;
      align-items: center;
      gap: .4rem;
      padding: .35rem .9rem;
      border-radius: 999px;
      background: rgba(255,255,255,.12);
      letter-spacing: .14em;
      font-size: .64rem;
      text-transform: uppercase;
    }
    .hero-author .author-avatar {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(255,255,255,.4);
    }

    .featured-article {
      border-radius: clamp(22px, 5vw, 32px);
      overflow: hidden;
      background: var(--brand-cloud);
      border: 1.5px solid var(--brand-border);
      box-shadow: var(--shadow-soft);
      display: flex;
      flex-direction: column;
    }
    .featured-body {
      padding: clamp(1.8rem, 4vw, 2.4rem);
      display: grid;
      gap: 1rem;
    }
    .category-badge {
      display: inline-block;
      padding: .4rem .95rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--brand-primary) 18%, #ffffff);
      color: var(--brand-primary-dark);
      text-transform: uppercase;
      font-size: .68rem;
      letter-spacing: .12em;
      font-weight: 700;
    }
    .featured-meta { display: flex; align-items: center; gap: .6rem; }
    .featured-meta .dot { opacity: .45; }

    .story-stack {
      display: grid;
      gap: 1.2rem;
    }
    .story-card {
      display: grid;
      grid-template-columns: 96px 1fr;
      gap: 1rem;
      padding: 1rem;
      border-radius: var(--brand-radius-md);
      border: 1.5px solid var(--brand-border);
      background: var(--brand-cloud);
      box-shadow: var(--shadow-soft);
      transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
    }
    .story-card:hover {
      transform: translateY(-4px);
      border-color: var(--brand-primary);
      box-shadow: var(--shadow-hover);
    }
    .story-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: calc(var(--brand-radius-md) - 6px);
    }
    .category-chip {
      font-size: .72rem;
      text-transform: uppercase;
      letter-spacing: .12em;
      color: var(--brand-primary-dark);
      font-weight: 700;
    }

    .latest-posts {
      background: linear-gradient(180deg, rgba(15,82,186,.04), rgba(244,246,252,.92));
    }
    .filter-chips {
      display: flex;
      flex-wrap: wrap;
      gap: .6rem;
    }
    .filter-chip {
      padding: .52rem 1.2rem;
      border-radius: 999px;
      border: 1.5px solid var(--brand-border);
      background: rgba(255,255,255,.9);
      text-transform: uppercase;
      font-size: .68rem;
      letter-spacing: .14em;
      font-weight: 600;
      color: var(--brand-muted);
      transition: transform .18s ease, border-color .18s ease, background .18s ease, color .18s ease;
    }
    .filter-chip:hover,
    .filter-chip.active {
      border-color: var(--brand-primary);
      background: color-mix(in srgb, var(--brand-primary) 18%, #ffffff);
      color: var(--brand-primary-dark);
      transform: translateY(-2px);
    }

    .post-card {
      border-radius: var(--brand-radius-lg);
      border: 1.5px solid var(--brand-border);
      background: var(--brand-cloud);
      box-shadow: var(--shadow-soft);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
    }
    .post-card:hover {
      transform: translateY(-6px);
      border-color: var(--brand-primary);
      box-shadow: var(--shadow-hover);
    }
    .post-body {
      padding: clamp(1.6rem, 3vw, 2rem);
      display: grid;
      gap: 1rem;
    }
    .post-media img,
    .featured-media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .author-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
    }

    .newsletter {
      background: var(--brand-cream);
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
      border-radius: clamp(20px, 4vw, 28px);
      box-shadow: var(--shadow-hover);
    }

    .knowledge-strip {
      background: linear-gradient(135deg, var(--brand-primary-dark), var(--brand-primary));
      border-radius: clamp(24px, 5vw, 36px);
      padding: clamp(2.4rem, 8vw, 4rem);
      box-shadow: 0 32px 68px rgba(15, 82, 186, .34);
    }
    .resource-grid {
      display: grid;
      gap: 1.4rem;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }
    .resource-card {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 1rem;
      padding: 1.4rem;
      border-radius: var(--brand-radius-md);
      background: rgba(255,255,255,.16);
      backdrop-filter: blur(8px);
    }
    .resource-icon {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: rgba(255,255,255,.22);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-size: 1.05rem;
      letter-spacing: .12em;
    }

    @media (max-width: 991.98px) {
      .blog-hero { border-radius: 18px; }
      .hero-card { margin-top: 2rem; }
      .knowledge-strip { border-radius: 18px; padding: 2.4rem; }
    }
    @media (max-width: 767.98px) {
      .story-card { grid-template-columns: 1fr; }
      .story-thumb img { border-radius: var(--brand-radius-md); }
      .post-body { padding: 1.4rem; }
      .hero-card { padding: 1.6rem; }
    }

    :host-context([data-bs-theme='dark']) .featured-article,
    :host-context([data-bs-theme='dark']) .story-card,
    :host-context([data-bs-theme='dark']) .post-card,
    :host-context([data-bs-theme='dark']) .newsletter {
      background: rgba(10, 16, 32, .92);
      border-color: rgba(92,108,148,.4);
      box-shadow: 0 32px 70px rgba(4, 10, 24, .75);
      color: #e7e9f2;
    }
    :host-context([data-bs-theme='dark']) .story-card:hover,
    :host-context([data-bs-theme='dark']) .post-card:hover {
      border-color: rgba(255,255,255,.45);
    }
    :host-context([data-bs-theme='dark']) .filter-chip {
      background: rgba(12,18,36,.92);
      border-color: rgba(92,108,148,.35);
      color: rgba(231,233,242,.75);
    }
    :host-context([data-bs-theme='dark']) .filter-chip.active,
    :host-context([data-bs-theme='dark']) .filter-chip:hover {
      background: color-mix(in srgb, var(--brand-primary) 28%, rgba(12,18,36,.92));
      border-color: rgba(255,255,255,.4);
      color: #fff;
    }
    :host-context([data-bs-theme='dark']) .newsletter-form .form-control {
      background: rgba(12,18,36,.92);
      border-color: rgba(92,108,148,.4);
      color: #e7e9f2;
    }
    :host-context([data-bs-theme='dark']) .resource-card {
      background: rgba(255,255,255,.18);
      color: #fff;
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
