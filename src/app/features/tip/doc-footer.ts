import { Component, input } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-doc-footer",
  imports: [MatIconModule, RouterLink],
  template: `
    <nav class="doc-footer">
      @if (prev()) {
        <a class="footer-link prev" [routerLink]="[]" [queryParams]="{slug: prev()!.slug}">
          <mat-icon>chevron_left</mat-icon>
          <div>
            <span class="footer-label">上一篇</span>
            <span class="footer-title">{{ prev()!.title }}</span>
          </div>
        </a>
      } @else {
        <div></div>
      }

      @if (next()) {
        <a class="footer-link next" [routerLink]="[]" [queryParams]="{slug: next()!.slug}">
          <div>
            <span class="footer-label">下一篇</span>
            <span class="footer-title">{{ next()!.title }}</span>
          </div>
          <mat-icon>chevron_right</mat-icon>
        </a>
      } @else {
        <div></div>
      }
    </nav>
  `,
  styles: `
    .doc-footer {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid var(--mat-sys-outline-variant);
    }

    .footer-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-radius: 12px;
      text-decoration: none;
      transition: background-color 0.15s;
      flex: 1;
      max-width: 48%;
    }

    .footer-link:hover {
      background-color: var(--mat-sys-surface-container-low);
    }

    .footer-link.prev { text-align: left; }
    .footer-link.next { text-align: right; justify-content: flex-end; }

    .footer-link mat-icon {
      color: var(--mat-sys-on-surface-variant);
      flex-shrink: 0;
    }

    .footer-label {
      display: block;
      font-size: 0.75rem;
      color: var(--mat-sys-on-surface-variant);
      margin-bottom: 2px;
    }

    .footer-title {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--mat-sys-on-surface);
    }
  `,
})
export class DocFooterComponent {
  prev = input<{ slug: string; title: string } | null>(null);
  next = input<{ slug: string; title: string } | null>(null);
}
