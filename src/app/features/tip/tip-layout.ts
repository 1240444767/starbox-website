import { BreakpointObserver } from "@angular/cdk/layout";
import { Component, inject, input, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSidenavModule } from "@angular/material/sidenav";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { map } from "rxjs/operators";
import { TocComponent, TocItem } from "./toc";

@Component({
  selector: "app-tip-layout",
  imports: [MatSidenavModule, MatButtonModule, MatIconModule, RouterLink, RouterLinkActive, TocComponent],
  template: `
    <mat-sidenav-container class="docs-container">
      <mat-sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile() || sidenavOpen()"
        (openedChange)="sidenavOpen.set($event)"
        class="docs-sidebar"
      >
        <nav class="sidebar-nav">
          <div class="sidebar-section">
            <h4 class="section-title">文档</h4>
            <a class="sidebar-link" routerLink="/tip" routerLinkActive="active-link"
               [routerLinkActiveOptions]="{ exact: true }" [queryParams]="{}" (click)="closeMobile()">
              <mat-icon>menu_book</mat-icon><span>文档首页</span>
            </a>
          </div>
          <div class="sidebar-section">
            <h4 class="section-title">内容</h4>
            @for (item of navItems; track item.slug) {
              <a class="sidebar-link" [routerLink]="[]" [queryParams]="{slug: item.slug}"
                 routerLinkActive="active-link" (click)="closeMobile()">
                <mat-icon>article</mat-icon><span>{{ item.title }}</span>
              </a>
            }
          </div>
        </nav>
      </mat-sidenav>

      <mat-sidenav
        position="end"
        mode="over"
        [opened]="tocOpen()"
        (openedChange)="tocOpen.set($event)"
        class="toc-sidebar"
      >
        <div class="toc-sidebar-content">
          <app-toc [items]="tocItems()" [embedded]="true" (linkClick)="tocOpen.set(false)" />
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="docs-content">
        <div class="content-layout">
          <div class="content-main">
            <ng-content />
          </div>
          <aside class="content-toc">
            <app-toc [items]="tocItems()" />
          </aside>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>

    @if (isMobile()) {
      <div class="mobile-bottom-bar">
        <button type="button" class="bottom-bar-btn" (click)="openDocsNav()">
          <mat-icon>menu_book</mat-icon><span>文档目录</span>
        </button>
        <div class="bottom-bar-divider"></div>
        <button type="button" class="bottom-bar-btn" (click)="openToc()">
          <mat-icon>toc</mat-icon><span>页面导航</span>
        </button>
      </div>
    }
  `,
  styles: `
    .docs-container { height: calc(100vh - 64px); }

    mat-sidenav.docs-sidebar,
    mat-sidenav.toc-sidebar { border-radius: 0; }

    .docs-sidebar {
      width: 260px;
      background: var(--mat-sys-surface-container-low);
      border-right: none;
      padding: 16px 12px;
      overflow-y: auto;
    }

    .sidebar-nav { display: flex; flex-direction: column; gap: 4px; }
    .sidebar-section { margin-bottom: 8px; }

    .section-title {
      padding: 12px 16px 6px; margin: 0;
      font-size: 0.75rem; font-weight: 600;
      color: var(--mat-sys-on-surface-variant);
      text-transform: uppercase; letter-spacing: 0.8px;
    }

    .sidebar-link {
      display: flex; align-items: center; gap: 12px;
      padding: 0 16px; height: 40px; border-radius: 20px;
      text-decoration: none; color: var(--mat-sys-on-surface-variant);
      font-size: 0.875rem; font-weight: 500;
      transition: background-color 0.15s ease;
    }

    .sidebar-link:hover { background-color: color-mix(in srgb, var(--mat-sys-on-surface) 4%, transparent); }
    .sidebar-link mat-icon { font-size: 20px; width: 20px; height: 20px; color: var(--mat-sys-on-surface-variant); }

    .sidebar-link.active-link {
      background-color: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container); font-weight: 600;
    }
    .sidebar-link.active-link mat-icon { color: var(--mat-sys-on-primary-container); }

    .docs-content {
      padding: 0 24px 24px;
      background: var(--mat-sys-surface);
      overflow-y: auto; scroll-behavior: smooth;
    }

    .content-layout { display: flex; gap: 32px; max-width: 1200px; margin: 0 auto; }
    .content-main { flex: 1; min-width: 0; }
    .content-toc { width: 220px; flex-shrink: 0; }

    .toc-sidebar {
      width: min(300px, 86vw);
      background: var(--mat-sys-surface-container-low);
      border-left: none;
    }

    .toc-sidebar-content { padding: 16px; overflow-y: auto; }

    .mobile-bottom-bar {
      display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 999;
      height: 48px; align-items: center;
      background: var(--mat-sys-surface);
      border-top: 1px solid var(--mat-sys-outline-variant);
      padding-bottom: env(safe-area-inset-bottom);
    }

    .bottom-bar-btn {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
      height: 100%; border: none; background: none;
      color: var(--mat-sys-on-surface-variant); font-size: 0.8125rem; font-weight: 500;
      font-family: inherit; cursor: pointer;
    }

    .bottom-bar-btn:hover { background-color: color-mix(in srgb, var(--mat-sys-on-surface) 4%, transparent); }
    .bottom-bar-btn mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .bottom-bar-divider { width: 1px; height: 24px; background: var(--mat-sys-outline-variant); }

    @media (max-width: 1100px) { .content-toc { display: none; } }

    @media (max-width: 768px) {
      .docs-container { height: calc(100vh - 64px - 48px); }
      .docs-sidebar { width: min(320px, 86vw); }
      .docs-content { padding: 0 16px 16px; }
      .content-layout { display: block; max-width: none; width: 100%; }
      .content-main { width: 100%; }
      .mobile-bottom-bar { display: flex; }
    }
  `,
})
export class TipLayoutComponent {
  private breakpointObserver = inject(BreakpointObserver);
  isMobile = toSignal(this.breakpointObserver.observe("(max-width: 768px)").pipe(map((s) => s.matches)), { initialValue: false });
  sidenavOpen = signal(false);
  tocOpen = signal(false);
  tocItems = input<TocItem[]>([]);

  navItems = [
    { slug: "01", title: "报毒问题说明" },
    { slug: "02", title: "常见问题" },
    { slug: "03", title: "功能介绍" },
  ];

  closeMobile() { if (this.isMobile()) this.sidenavOpen.set(false); }
  openDocsNav() { this.tocOpen.set(false); this.sidenavOpen.update(v => !v); }
  openToc() { this.sidenavOpen.set(false); this.tocOpen.update(v => !v); }
}
