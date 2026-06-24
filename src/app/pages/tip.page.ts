import { Component, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatIconModule } from "@angular/material/icon";
import { ActivatedRoute, RouterLink } from "@angular/router";
import fm from "front-matter";
import { marked } from "marked";
import { gfmHeadingId, resetHeadings } from "marked-gfm-heading-id";
import { TipLayoutComponent } from "../features/tip/tip-layout";
import { TocItem } from "../features/tip/toc";
import { DocFooterComponent } from "../features/tip/doc-footer";
import { SeoService } from "../features/seo/seo.service";

// 确保 marked 扩展在首次 parse 前注册
let markedReady = false;
function ensureMarked() {
  if (!markedReady) {
    marked.use(gfmHeadingId());
    markedReady = true;
  }
}

@Component({
  selector: "app-tip",
  imports: [TipLayoutComponent, MatIconModule, RouterLink, DocFooterComponent],
  template: `
    <app-tip-layout [tocItems]="tocItems()">
      @if (slug()) {
        <div class="doc-detail">
          @if (loading()) { <p class="status">加载中...</p> }
          @else if (error()) { <p class="status">{{ error() }}</p> }
          @else {
            <h1>{{ title() }}</h1>
            @if (date()) { <p class="doc-date">{{ date() }}</p> }
            <div class="markdown-body" [innerHTML]="html()"></div>
            <app-doc-footer [prev]="prevDoc()" [next]="nextDoc()" />
          }
        </div>
      } @else {
        <div class="doc-page">
          <h1>文档</h1>
          <p class="subtitle">星盒使用指南、常见问题与功能介绍</p>

          <div class="doc-grid">
            @for (tip of tips; track tip.slug) {
              <a [routerLink]="[]" [queryParams]="{slug: tip.slug}" class="doc-card">
                <div class="doc-icon-wrap"><mat-icon>{{ getIcon(tip.slug) }}</mat-icon></div>
                <div class="doc-body">
                  <h3>{{ tip.title }}</h3>
                  <p>{{ tip.summary }}</p>
                  <span class="doc-date-inline">{{ tip.date }}</span>
                </div>
                <mat-icon class="doc-arrow">chevron_right</mat-icon>
              </a>
            }
          </div>
        </div>
      }
    </app-tip-layout>
  `,
  styles: `
    .doc-detail { max-width: none; padding: 32px 0; }
    .doc-page { max-width: none; padding: 32px 0; }

    h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 8px; color: var(--mat-sys-on-surface); }
    .subtitle { color: var(--mat-sys-on-surface-variant); margin-bottom: 32px; font-size: 0.9375rem; }
    .doc-date { font-size: 0.8125rem; color: var(--mat-sys-on-surface-variant); margin-bottom: 24px; }
    .status { text-align: center; padding: 48px; color: var(--mat-sys-on-surface-variant); }

    .doc-grid { display: flex; flex-direction: column; gap: 4px; }

    .doc-card {
      display: flex; align-items: center; gap: 16px; padding: 16px 20px;
      border-radius: 16px; text-decoration: none; color: inherit; transition: background-color 0.15s;
    }
    .doc-card:hover { background-color: var(--mat-sys-surface-container-low); }

    .doc-icon-wrap {
      display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;
      border-radius: 12px; background: var(--mat-sys-primary-container); flex-shrink: 0;
    }
    .doc-icon-wrap mat-icon { color: var(--mat-sys-on-primary-container); font-size: 20px; width: 20px; height: 20px; }

    .doc-body { flex: 1; min-width: 0; }
    .doc-body h3 { font-size: 0.9375rem; font-weight: 600; color: var(--mat-sys-on-surface); margin: 0 0 4px; }
    .doc-body p { font-size: 0.8125rem; color: var(--mat-sys-on-surface-variant); margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .doc-date-inline { font-size: 0.75rem; color: var(--mat-sys-on-surface-variant); margin-top: 4px; display: block; }
    .doc-arrow { color: var(--mat-sys-on-surface-variant); flex-shrink: 0; }

    @media (max-width: 768px) {
      .doc-detail, .doc-page { padding: 16px 0; }
    }
  `,
})
export default class TipComponent {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  slug = signal("");
  loading = signal(false);
  error = signal<string | null>(null);
  title = signal("");
  date = signal("");
  html = signal("");
  tocItems = signal<TocItem[]>([]);
  prevDoc = signal<{ slug: string; title: string } | null>(null);
  nextDoc = signal<{ slug: string; title: string } | null>(null);

  constructor() {
    inject(SeoService).setTip();
    this.route.queryParams.subscribe((p) => {
      const s = p["slug"] || "";
      this.slug.set(s);
      if (s) {
        this.updateNav(s);
        this.loadContent(s);
      } else {
        this.loading.set(false);
        this.error.set(null);
        this.tocItems.set([]);
        this.prevDoc.set(null);
        this.nextDoc.set(null);
      }
    });
  }

  private updateNav(slug: string) {
    const slugs = this.tips.map((t) => t.slug);
    const idx = slugs.indexOf(slug);
    if (idx > 0) this.prevDoc.set({ slug: slugs[idx - 1], title: this.tips[idx - 1].title });
    else this.prevDoc.set(null);
    if (idx >= 0 && idx < slugs.length - 1) this.nextDoc.set({ slug: slugs[idx + 1], title: this.tips[idx + 1].title });
    else this.nextDoc.set(null);
  }

  private extractToc(html: string): TocItem[] {
    const items: TocItem[] = [];
    // 优先匹配带 id 的标题
    const withId = /<h([23])\s[^>]*id="([^"]+)"[^>]*>(.+?)<\/h[23]>/gi;
    let m: RegExpExecArray | null;
    while ((m = withId.exec(html)) !== null) {
      items.push({ id: m[2], level: parseInt(m[1]), text: m[3].replace(/<[^>]*>/g, "") });
    }
    // 如果没有找到带 id 的，匹配所有 h2/h3 并自生成 id
    if (items.length === 0) {
      const noId = /<h([23])[^>]*>(.+?)<\/h[23]>/gi;
      let i = 0;
      while ((m = noId.exec(html)) !== null) {
        const text = m[2].replace(/<[^>]*>/g, "");
        items.push({ id: `toc-${i++}`, level: parseInt(m[1]), text });
      }
    }
    return items;
  }

  private loadContent(slug: string) {
    this.loading.set(true);
    this.error.set(null);
    this.http.get(`/content/tip/${slug}.md`, { responseType: "text" }).subscribe({
      next: (raw) => {
        const { attributes, body } = fm<{ title?: string; date?: string }>(raw);
        this.title.set(attributes.title || slug);
        this.date.set(attributes.date || "");
        ensureMarked();
        resetHeadings();
        const rendered = marked.parse(body) as string;
        this.html.set(rendered);
        this.tocItems.set(this.extractToc(rendered));
        this.loading.set(false);
      },
      error: () => {
        this.error.set("加载失败");
        this.loading.set(false);
      },
    });
  }

  getIcon(slug: string) {
    const m: Record<string, string> = { "01": "verified_user", "02": "help", "03": "info" };
    return m[slug] || "article";
  }

  tips = [
    { slug: "01", title: "报毒问题说明", date: "2026-06-20", summary: "关于部分安全软件对星盒报毒的说明与解决方案" },
    { slug: "02", title: "常见问题", date: "2026-06-15", summary: "星盒使用中常见问题及解决方法汇总" },
    { slug: "03", title: "功能介绍", date: "2026-06-10", summary: "全面了解星盒的200+实用工具和10大功能分类" },
  ];
}
