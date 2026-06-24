import { isPlatformBrowser, DOCUMENT } from "@angular/common";
import { Injectable, PLATFORM_ID, inject, signal } from "@angular/core";

export type ThemeMode = "light" | "dark" | "system";

@Injectable({ providedIn: "root" })
export class ThemeService {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  mode = signal<ThemeMode>("system");
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor() {
    if (this.isBrowser) {
      const saved = localStorage.getItem("theme") as ThemeMode | null;
      const initial = saved || "system";
      this.mode.set(initial);
      this.apply(initial);

      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        if (this.mode() === "system") {
          this.apply("system");
        }
      });
    }
  }

  apply(mode: ThemeMode): void {
    this.mode.set(mode);
    if (this.isBrowser) {
      localStorage.setItem("theme", mode);
    }

    const html = this.document.documentElement;
    if (mode === "system") {
      html.removeAttribute("data-theme");
    } else {
      html.setAttribute("data-theme", mode);
    }
  }
}
