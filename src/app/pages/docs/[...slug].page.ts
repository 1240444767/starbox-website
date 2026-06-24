import { Component, inject, signal } from "@angular/core";
import { RouterLink, Router, NavigationEnd } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { FooterComponent } from "../../features/layout/footer";
import fm from "front-matter";
import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import { filter, map } from "rxjs/operators";

marked.use(gfmHeadingId());

// 构建时自动导入所有 markdown 文件（参考 kazumi-website 的做法）
const DOC_CONTENT_FILES = import.meta.glob<string>(
  "/public/content/docs/**/*.md",
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
);

type DocAttributes = { title?: string };

/** 从 URL 中提取文档路径，例如 /docs/privacy → privacy */
function urlToContentPath(url: string): string {
  const prefix = "/docs/";
  if (!url.startsWith(prefix)) return "";
  return url.slice(prefix.length).replace(/\/$/, "") || "";
}

@Component({
  selector: "app-doc",
  imports: [RouterLink, MatButtonModule, MatIconModule, FooterComponent],
  template: `
    <div class="doc-page">
      @if (error()) {
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

    .doc-content h1 { font-size: 1.5rem; font-weight: 700; margin: 24px 0 12px; border-bottom: 1px solid var(--mat-sys-outline-variant); padding-bottom: 8px; }
    .doc-content h2 { font-size: 1.25rem; font-weight: 600; margin: 20px 0 10px; border-bottom: 1px solid var(--mat-sys-outline-variant); padding-bottom: 6px; }
    .doc-content h3 { font-size: 1.1rem; font-weight: 600; margin: 16px 0 8px; }
    .doc-content h4 { font-size: 1rem; font-weight: 600; margin: 12px 0 6px; }
    .doc-content p { margin-bottom: 12px; }
    .doc-content ul, .doc-content ol { padding-left: 24px; margin-bottom: 12px; }
    .doc-content li { margin-bottom: 4px; }
    .doc-content li > ul, .doc-content li > ol { margin-bottom: 0; }
    .doc-content a { color: var(--mat-sys-primary); text-decoration: underline; text-underline-offset: 2px; }
    .doc-content a:hover { opacity: 0.8; }
    .doc-content strong { font-weight: 600; color: var(--mat-sys-on-surface); }
    .doc-content code {
      background: var(--mat-sys-surface-container);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.875em;
      font-family: 'Roboto Mono', 'Courier New', monospace;
    }
    .doc-content pre {
      background: var(--mat-sys-surface-container);
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin-bottom: 12px;
      font-size: 0.875rem;
      line-height: 1.6;
    }
    .doc-content pre code {
      background: none;
      padding: 0;
      border-radius: 0;
    }
    .doc-content blockquote {
      margin: 0 0 12px;
      padding: 8px 16px;
      border-left: 4px solid var(--mat-sys-primary);
      background: color-mix(in srgb, var(--mat-sys-primary) 8%, transparent);
      border-radius: 0 8px 8px 0;
      color: var(--mat-sys-on-surface-variant);
    }
    .doc-content blockquote p { margin-bottom: 4px; }
    .doc-content hr {
      border: none;
      border-top: 1px solid var(--mat-sys-outline-variant);
      margin: 24px 0;
    }
    .doc-content table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }
    .doc-content th, .doc-content td {
      padding: 8px 12px;
      border: 1px solid var(--mat-sys-outline-variant);
      text-align: left;
    }
    .doc-content th {
      background: var(--mat-sys-surface-container);
      font-weight: 600;
    }
    .doc-content img { max-width: 100%; border-radius: 8px; }

    .error-text { text-align: center; padding: 48px; color: var(--mat-sys-on-surface-variant); }

    @media (max-width: 480px) {
      .doc-page { padding: 24px 16px; }
      .doc-content { padding: 24px; }
    }
  `,
})
export default class DocComponent {
  error = signal<string | null>(null);
  title = signal("");
  html = signal("");

  constructor() {
    const router = inject(Router);

    // 首次加载（SSR + 客户端初始渲染）
    this.loadContent(urlToContentPath(router.url));

    // 后续导航切换（如 /docs/privacy ↔ /docs/terms）
    router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map((e) => urlToContentPath(e.urlAfterRedirects || e.url)),
      )
      .subscribe((path) => this.loadContent(path));
  }

  private loadContent(path: string) {
    const filename = `/public/content/docs/${path}.md`;
    const raw = DOC_CONTENT_FILES[filename];

    if (!raw) {
      this.error.set("文档未找到");
      return;
    }

    const { attributes, body } = fm<DocAttributes>(raw);
    this.title.set(attributes.title || path);
    this.html.set(marked.parse(body) as string);
  }
}
