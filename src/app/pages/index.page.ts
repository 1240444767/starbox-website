import { Component, inject, signal, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { HeroComponent } from "../features/home/hero";
import { TeamComponent } from "../features/home/team";
import { FooterComponent } from "../features/layout/footer";
import { SeoService } from "../features/seo/seo.service";

interface ToolItem {
  name: string;
  type: string;
  subtitle: string;
  icon: string;
  id: number;
  state: number;
  link: string | null;
  task: number;
  vip_only: number;
}

interface ToolClassify {
  classify_name: string;
  classify_subtitle: string;
  classify_icon: string;
  list: ToolItem[];
}

interface ToolsData {
  data: {
    hot: { list: ToolItem[] };
    tools: { list: ToolClassify[] };
  };
}

@Component({
  selector: "app-home",
  imports: [HeroComponent, TeamComponent, FooterComponent, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <app-hero />
    <div id="after-hero"></div>

    <app-team />

    @if (hot().length > 0) {
      <section class="hot-section">
        <div class="section-container">
          <h1 class="section-title">热门推荐</h1>
          <p class="section-desc">精选最受欢迎的工具</p>
          <div class="hot-grid">
            @for (item of hot(); track item.id) {
              <div class="hot-card">
                <div class="hot-icon" [innerHTML]="sanitize(item.icon)"></div>
                <div class="hot-info">
                  <h3>{{ item.name }}</h3>
                  <p>{{ item.subtitle }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </section>
    }

    @if (categories().length > 0) {
      <section class="tools-section">
        <div class="section-container">
          <h1 class="section-title">全部工具</h1>
          <p class="section-desc">{{ categories().length }}大分类，{{ totalTools() }}+实用工具，总有一款适合你</p>

          <div class="tools-grid">
            @for (cat of categories(); track cat.classify_name) {
              <div class="tool-card">
                <div class="tool-card-header">
                  <mat-icon class="tool-card-icon">{{ getCategoryIcon(cat.classify_name) }}</mat-icon>
                  <h3 class="tool-card-title">{{ cat.classify_name }}</h3>
                </div>
                <div class="tool-tags">
                  @for (tool of cat.list; track tool.id) {
                    <span class="tool-tag" (click)="openTool(tool, $event)">{{ tool.name }}</span>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </section>
    }

    <app-footer />
  `,
  styles: `
    .section-container {
      max-width: 1080px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .section-title {
      font-size: 1.75rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 8px;
      color: var(--mat-sys-on-surface);
    }

    .section-desc {
      text-align: center;
      color: var(--mat-sys-on-surface-variant);
      margin-bottom: 40px;
      font-size: 1rem;
    }

    /* Hot section */
    .hot-section {
      padding: 60px 0;
      background-color: var(--mat-sys-surface);
    }

    .hot-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 12px;
    }

    .hot-card {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: 16px;
      background: var(--mat-sys-surface-container-low);
      border: 1px solid var(--mat-sys-outline-variant);
      transition: all 0.2s;
    }

    .hot-card:hover {
      border-color: var(--mat-sys-primary);
      background: color-mix(in srgb, var(--mat-sys-primary) 4%, var(--mat-sys-surface-container-low));
    }

    .hot-icon {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background: var(--mat-sys-primary);
      overflow: hidden;
    }

    .hot-icon svg {
      width: 24px;
      height: 24px;
    }

    .hot-icon svg path,
    .hot-icon svg circle,
    .hot-icon svg rect {
      fill: #ffffff !important;
    }

    .hot-info h3 {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--mat-sys-on-surface);
      margin: 0 0 4px;
    }

    .hot-info p {
      font-size: 0.8125rem;
      color: var(--mat-sys-on-surface-variant);
      margin: 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Tools section */
    .tools-section {
      padding: 80px 0;
      background-color: var(--mat-sys-surface);
    }

    .tools-grid {
      column-count: 3;
      column-gap: 12px;
    }

    .tool-card {
      background: var(--mat-sys-surface);
      border-radius: 16px;
      padding: 20px;
      border: 1px solid var(--mat-sys-outline-variant);
      transition: all 0.3s ease;
      break-inside: avoid;
      margin-bottom: 12px;
    }

    .tool-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      border-color: var(--mat-sys-primary);
    }

    .tool-card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .tool-card-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: var(--mat-sys-on-primary-container);
    }

    .tool-card-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--mat-sys-primary);
      margin: 0;
    }

    .tool-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tool-tag {
      display: inline-block;
      padding: 6px 14px;
      background: var(--mat-sys-surface-container-low);
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 20px;
      font-size: 0.8125rem;
      color: var(--mat-sys-on-surface);
      transition: all 0.2s;
      cursor: pointer;
    }

    .tool-tag:hover {
      background: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
      border-color: var(--mat-sys-primary);
    }

    @media (max-width: 1024px) {
      .tools-grid {
        column-count: 2;
      }
    }

    @media (max-width: 768px) {
      .hot-section {
        padding: 40px 0;
      }

      .hot-grid {
        grid-template-columns: 1fr;
      }

      .tools-grid {
        column-count: 1;
      }

      .tools-section {
        padding: 48px 0;
      }

      .section-title {
        font-size: 1.35rem;
      }
    }

    @media (max-width: 480px) {
      .section-container {
        padding: 0 16px;
      }

      .hot-card {
        padding: 12px;
      }

      .tool-card {
        padding: 16px;
      }

      .tool-tag {
        padding: 4px 10px;
        font-size: 0.75rem;
      }
    }
  `,
})
export default class Home implements OnInit {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private dialog = inject(MatDialog);

  hot = signal<ToolItem[]>([]);
  categories = signal<ToolClassify[]>([]);

  constructor() {
    inject(SeoService).setHome();
  }

  ngOnInit() {
    this.http.get<ToolsData>("/tools.json").subscribe({
      next: (data) => {
        if (data?.data) {
          this.hot.set(data.data.hot?.list || []);
          this.categories.set(data.data.tools?.list || []);
        }
      },
    });
  }

  sanitize(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon || "");
  }

  totalTools(): number {
    let count = 0;
    for (const cat of this.categories()) {
      count += cat.list?.length || 0;
    }
    return count;
  }

  getCategoryIcon(name: string): string {
    const icons: Record<string, string> = {
      "日常工具": "build",
      "休闲娱乐": "casino",
      "搜索相关": "search",
      "影音资源": "videocam",
      "资源解析": "extension",
      "图片相关": "image",
      "文本相关": "text_fields",
      "开发者工具": "code",
      "系统工具": "settings",
      "其他工具": "palette",
    };
    return icons[name] || "category";
  }

  openTool(tool: ToolItem, event: Event) {
    event.stopPropagation();
    this.dialog.open(ToolDialog, {
      data: tool,
      panelClass: "tool-dialog",
      maxWidth: "95vw",
      width: "420px",
    });
  }
}

@Component({
  selector: "app-tool-dialog",
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="tool-dialog-content">
      <div class="dialog-icon" [innerHTML]="sanitizeIcon(data.icon)"></div>
      <h2 class="dialog-name">{{ data.name }}</h2>
      <p class="dialog-desc">{{ data.subtitle }}</p>
      <button mat-stroked-button (click)="close()" class="dialog-close-btn">关闭</button>
    </div>
  `,
  styles: `
    .tool-dialog-content {
      text-align: center;
      padding: 24px 16px 16px;
    }

    .dialog-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      margin: 0 auto 16px;
      border-radius: 16px;
      background: var(--mat-sys-primary);
    }

    .dialog-icon svg path,
    .dialog-icon svg circle,
    .dialog-icon svg rect {
      fill: #ffffff !important;
    }

    .dialog-icon svg {
      width: 32px;
      height: 32px;
    }

    .dialog-name {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--mat-sys-on-surface);
      margin: 0 0 8px;
    }

    .dialog-desc {
      font-size: 0.9375rem;
      color: var(--mat-sys-on-surface-variant);
      line-height: 1.6;
      margin: 0 0 20px;
    }

    .dialog-close-btn {
      margin: 0 auto;
    }

    @media (max-width: 480px) {
      .tool-dialog-content {
        padding: 20px 12px 12px;
      }

      .dialog-name {
        font-size: 1.1rem;
      }

      .dialog-desc {
        font-size: 0.875rem;
      }
    }
  `,
})
export class ToolDialog {
  data = inject<{ name: string; subtitle: string; icon: string }>(MAT_DIALOG_DATA);
  private sanitizer = inject(DomSanitizer);
  private dialogRef = inject(MatDialogRef);

  close() {
    this.dialogRef.close();
  }

  sanitizeIcon(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon || "");
  }
}
