import { Injectable, inject, signal } from '@angular/core';
import { ThemeService } from './theme.service';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface Preferences {
  themeMode: ThemeMode;
  notifications: {
    marketingEmails: boolean;
    orderSms: boolean;
    whatsappUpdates: boolean;
    backInStock: boolean;
  };
  personalization: {
    preferredCategories: string[];
    favoriteVehicle?: string | null;
    tireSize?: string | null;
    rimSize?: string | null;
  };
  locale: { language: 'es' | 'en'; currency: 'MXN' | 'USD' };
  checkout: { express: boolean };
}

const DEFAULTS: Preferences = {
  themeMode: 'auto',
  notifications: {
    marketingEmails: false,
    orderSms: true,
    whatsappUpdates: false,
    backInStock: true,
  },
  personalization: {
    preferredCategories: [],
    favoriteVehicle: null,
    tireSize: null,
    rimSize: null,
  },
  locale: { language: 'es', currency: 'MXN' },
  checkout: { express: true },
};

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  #storageKey = 'roue_prefs_v1';
  #theme = inject(ThemeService);
  #prefs = signal<Preferences>(this.#rehydrate());
  readonly prefs = this.#prefs.asReadonly();

  setThemeMode(mode: ThemeMode) {
    const next = { ...this.#prefs(), themeMode: mode };
    this.#prefs.set(next);
    this.#persist(next);
    this.#theme.setMode(mode);
  }

  update(updater: (p: Preferences) => Preferences) {
    const next = updater(this.#prefs());
    this.#prefs.set(next);
    this.#persist(next);
    if (next.themeMode) this.#theme.setMode(next.themeMode);
  }

  reset() {
    this.#prefs.set({ ...DEFAULTS });
    this.#persist(this.#prefs());
    this.#theme.setMode(this.#prefs().themeMode);
  }

  #rehydrate(): Preferences {
    try {
      const raw = localStorage.getItem(this.#storageKey);
      if (!raw) return { ...DEFAULTS };
      const parsed = JSON.parse(raw) as Preferences;
      return this.#merge(DEFAULTS, parsed);
    } catch {
      return { ...DEFAULTS };
    }
  }

  #persist(p: Preferences) {
    try { localStorage.setItem(this.#storageKey, JSON.stringify(p)); } catch {}
  }

  #merge<T>(base: T, override: Partial<T>): T {
    const result: any = Array.isArray(base) ? [...(base as any)] : { ...base as any };
    for (const k in override) {
      const b: any = (base as any)[k];
      const o: any = (override as any)[k];
      if (o === undefined) continue;
      if (o && typeof o === 'object' && !Array.isArray(o)) result[k] = this.#merge(b || {}, o);
      else result[k] = o;
    }
    return result as T;
  }
}

