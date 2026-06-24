import { Component, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { RouterLink, ActivatedRoute } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { FooterComponent } from "../../features/layout/footer";
import fm from "front-matter";
import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";

marked.use(gfmHeadingId());

@Component({
  selector: "app-doc",
  imports: [RouterLink, MatButtonModule, MatIconModule, FooterComponent],
  template: `
    <div class="doc-page">
      @if (loading()) {
        <p class="loading-text">加载中...</p>
      } @else if (error()) {
        <p class="error-text">{{ error() }}</p>
      } @else {
        <div class="doc-header">
          <a mat-button routerLink="/" class="back-link">
            <mat-icon>arrow_back</mat-icon>
            返回首页
          </a>
          <h1>{{ title() }}</h1>
        </div>
        <div class="doc-content" [innerHTML]="html()"></div>
      }
    </div>
    <app-footer />
  `,
  styles: `
    .doc-page {
      max-width: 800px;
      margin: 0 auto;
      padding: 48px 24px;
    }

    .doc-header { margin-bottom: 32px; }
    .back-link { margin-bottom: 24px; margin-left: -8px; }

    h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--mat-sys-on-surface);
      margin-bottom: 8px;
    }

    .doc-content {
      background: var(--mat-sys-surface-container-low);
      border-radius: 16px;
      padding: 32px;
      font-size: 1rem;
      line-height: 1.8;
      color: var(--mat-sys-on-surface);
    }

    .doc-content h1 { font-size: 1.5rem; margin-top: 24px; margin-bottom: 12px; }
    .doc-content h2 { font-size: 1.25rem; margin-top: 20px; margin-bottom: 10px; }
    .doc-content p { margin-bottom: 12px; }
    .doc-content ul { padding-left: 20px; margin-bottom: 12px; }
    .doc-content a { color: var(--mat-sys-primary); }

    .loading-text, .error-text { text-align: center; padding: 48px; color: var(--mat-sys-on-surface-variant); }

    @media (max-width: 480px) {
      .doc-page { padding: 24px 16px; }
      .doc-content { padding: 24px; }
    }
  `,
})
export default class DocComponent {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  loading = signal(true);
  error = signal<string | null>(null);
  title = signal("");
  html = signal("");

  constructor() {
    this.route.params.subscribe((params) => {
      const slug = params["slug"];
      this.loadContent(slug);
    });
  }

  private loadContent(slug: string) {
    this.loading.set(true);
    this.error.set(null);

    this.http.get(`/content/docs/${slug}.md`, { responseType: "text" }).subscribe({
      next: (raw) => {
        const { attributes, body } = fm<{ title?: string }>(raw);
        this.title.set(attributes.title || slug);
        this.html.set(marked.parse(body) as string);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("文档加载失败");
        this.loading.set(false);
      },
    });
  }
}
