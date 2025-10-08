import { Injectable, NgZone, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface PendingEvent {
  page: string;
  elementSelector: string;
  elementText?: string | null;
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
  eventType?: string;
  metadata?: Record<string, unknown>;
}

const HEATMAP_SESSION_KEY = 'roue-heatmap-session';

function ensureSessionId(): string {
  if (typeof window === 'undefined') return crypto.randomUUID();
  let value = localStorage.getItem(HEATMAP_SESSION_KEY);
  if (!value) {
    value = crypto.randomUUID();
    localStorage.setItem(HEATMAP_SESSION_KEY, value);
  }
  return value;
}

@Injectable({ providedIn: 'root' })
export class HeatmapTrackerService {
  #http = inject(HttpClient);
  #zone = inject(NgZone);
  #router = inject(Router);
  #sessionId = ensureSessionId();
  #queue: PendingEvent[] = [];
  #flushScheduled = false;
  #enabled = environment.enableHeatmapTracking;

  constructor() {
    if (!this.#enabled) {
      return;
    }

    this.#zone.runOutsideAngular(() => {
      document.addEventListener('click', this.#handleClick, { capture: true });
    });

    this.#router.events.pipe(filter((evt): evt is NavigationEnd => evt instanceof NavigationEnd)).subscribe(() => {
      // flush queued events when navigation completes
      this.#flushQueue();
    });
  }

  #handleClick = (event: Event) => {
    if (!(event instanceof MouseEvent)) return;
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const elementSelector = this.#buildSelector(target);
    const elementText = target.textContent?.trim().slice(0, 120) || null;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const page = window.location.pathname + window.location.search;

    const eventData: PendingEvent = {
      page,
      elementSelector,
      elementText,
      x: Math.round(event.clientX - rect.left),
      y: Math.round(event.clientY - rect.top),
      viewportWidth,
      viewportHeight,
      eventType: 'click',
      metadata: {
        elementTag: target.tagName,
        elementId: target.id || undefined,
        classes: Array.from(target.classList),
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
      }
    };

    this.#queue.push(eventData);
    this.#scheduleFlush();
  };

  #scheduleFlush() {
    if (this.#flushScheduled) return;
    this.#flushScheduled = true;
    window.setTimeout(() => {
      this.#flushScheduled = false;
      this.#flushQueue();
    }, 1500);
  }

  #flushQueue() {
    if (!this.#queue.length) return;
    const events = this.#queue.splice(0);
    for (const evt of events) {
      this.#http.post(`${environment.apiBaseUrl}/analytics/heatmap/events`, {
        page: evt.page,
        elementSelector: evt.elementSelector,
        elementText: evt.elementText,
        x: evt.x,
        y: evt.y,
        viewportWidth: evt.viewportWidth,
        viewportHeight: evt.viewportHeight,
        eventType: evt.eventType,
        deviceType: this.#deviceType(evt.viewportWidth),
        sessionId: this.#sessionId,
        referrer: document.referrer || undefined,
        metadata: evt.metadata
      }).subscribe({
        error: () => {
          // ignore errors; this is best-effort analytics.
        }
      });
    }
  }

  #deviceType(width: number): string {
    if (width >= 1024) return 'desktop';
    if (width >= 768) return 'tablet';
    return 'mobile';
  }

  #buildSelector(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    const classes = Array.from(element.classList).slice(0, 3).map((c) => `.${c}`).join('');
    const tag = element.tagName.toLowerCase();
    const parent = element.parentElement;
    if (!parent) return `${tag}${classes}`;
    const siblings = Array.from(parent.children).filter((child) => (child as HTMLElement).tagName === element.tagName);
    if (siblings.length <= 1) {
      return `${tag}${classes}`;
    }
    const index = siblings.indexOf(element) + 1;
    return `${tag}${classes}:nth-of-type(${index})`;
  }

}
