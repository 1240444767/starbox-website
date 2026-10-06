import { Component, computed, inject, signal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { FooterComponent } from "../features/layout/footer";
import { SeoService } from "../features/seo/seo.service";

// ─── GitHub 下载（对齐 starbox-website 仓库 Releases）───
// APK 挂在本仓库（已公开）的 GitHub Releases 上，releases.json 与之一一对应；
// 直链 + 多条第三方加速线路，蓝奏云作为备用来源。

const GITHUB_RELEASES = "https://github.com/1240444767/starbox-website/releases";

/** GitHub 加速线路（只转发链接，不保存文件；默认 GitHub 直连） */
const GH_MIRRORS: { name: string; prefix: string }[] = [
  { name: "gh-proxy", prefix: "https://gh-proxy.com/" },
  { name: "llkk", prefix: "https://gh.llkk.cc/" },
  { name: "ghfast", prefix: "https://ghfast.top/" },
  { name: "ghproxy", prefix: "https://ghproxy.net/" },
];

/** releases.json 里的一条版本记录 */
interface ReleaseEntry {
  version: string;
  tag: string;
  date?: string;
  /** Release 里的 APK 资产文件名；没有就没有 GitHub 直链 */
  asset?: string;
  size?: string;
  lanzou?: string;
  notes: string[];
}

@Component({
  selector: "app-download",
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatDialogModule, MatListModule, FooterComponent],
  template: `
    <div class="download-page">
      <h1>下载星盒</h1>
      <p class="subtitle">StarBox 是一款功能强大的全能工具箱，支持 Android 和 Android Pad</p>

      <mat-card appearance="outlined" class="download-card">
        <mat-card-content>
          <div class="download-section">
            <a mat-fab extended [href]="primaryUrl()" target="_blank" rel="noopener noreferrer" class="download-primary">
              <mat-icon>download</mat-icon>
              下载最新版本
            </a>
            <button mat-stroked-button (click)="openMirrors()" class="download-backup">
              <mat-icon>cloud_download</mat-icon>
              备用下载
            </button>
            <p class="version-info">
              当前版本: v{{ latest()?.version ?? "2.7.0" }}
              @if (latest()?.date) { | 更新日期: {{ latest()!.date }} }
              @if (latest()?.size) { | {{ latest()!.size }} }
            </p>
            <p class="host-note">APK 托管在 GitHub Releases，免费直下，另有加速线路与蓝奏云备用。</p>
          </div>

          <div class="requirements">
            <h3 class="section-title">
              <mat-icon>devices</mat-icon>
              系统要求
            </h3>
            <ul>
              <li><strong>Android:</strong> Android 7.0 及以上版本</li>
              <li><strong>Android Pad:</strong> Android 7.0 及以上版本</li>
              <li><strong>存储空间:</strong> 建议预留 30MB 以上空间</li>
            </ul>
          </div>
        </mat-card-content>
      </mat-card>

      <h2 class="screenshots-title">应用截图</h2>
      <div class="screenshot-gallery">
        @for (item of screenshots; track item.alt) {
          <div class="screenshot-item" (click)="previewImage.set(item.src)">
            <img [src]="item.src" [alt]="item.alt" loading="lazy" />
            <p>{{ item.alt }}</p>
          </div>
        }
      </div>

      @if (previewImage()) {
        <div class="preview-overlay" (click)="previewImage.set(null)">
          <div class="preview-container">
            <img [src]="previewImage()" alt="预览" class="preview-img" />
            <button mat-icon-button class="preview-close" (click)="previewImage.set(null)">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>
      }

      <h2 class="screenshots-title">常见问题</h2>
      <mat-card appearance="outlined" class="faq-card">
        <mat-card-content>
          @for (faq of faqs; track faq.q) {
            <div class="faq-item">
              <h3 class="faq-q">{{ faq.q }}</h3>
              <p class="faq-a">{{ faq.a }}</p>
            </div>
          }
        </mat-card-content>
      </mat-card>

      <h2 class="screenshots-title">更新日志</h2>
      <div class="changelog">
        @for (release of releases(); track release.version) {
          <div class="changelog-item">
            <h3 class="changelog-version">
              StarBox v{{ release.version }}
              @if ($index === 0) { <span class="changelog-badge">最新</span> }
              <span class="changelog-date">{{ release.date }}</span>
            </h3>
            <ul>
              @for (line of release.notes; track $index) {
                <li>{{ line }}</li>
              }
            </ul>
          </div>
        }
        <div class="more">
          <a [href]="GITHUB_RELEASES" target="_blank" rel="noopener noreferrer">在 GitHub 上查看全部版本 →</a>
        </div>
      </div>
    </div>

    <app-footer />
  `,
  styles: `
    .download-page {
      max-width: 1080px;
      margin: 0 auto;
      padding: 48px 24px;
    }

    h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 8px;
      color: var(--mat-sys-on-surface);
    }

    .subtitle {
      font-size: 1rem;
      color: var(--mat-sys-on-surface-variant);
      margin-bottom: 32px;
    }

    .download-card {
      border-radius: 28px;
      background: var(--mat-sys-surface-container-low);
      border: none;
      margin-bottom: 48px;
    }

    .download-section {
      text-align: center;
      padding: 16px 0 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .download-primary {
      font-size: 1rem;
      font-weight: 600;
    }

    .download-backup {
      font-size: 0.875rem;
    }

    .version-info {
      color: var(--mat-sys-on-surface-variant);
      font-size: 0.875rem;
      margin-top: 8px;
    }

    .host-note {
      color: var(--mat-sys-on-surface-variant);
      font-size: 0.8125rem;
      margin: 0;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1rem;
      font-weight: 600;
      color: var(--mat-sys-on-surface);
      margin-bottom: 12px;
    }

    .requirements {
      padding: 0 8px;
    }

    .requirements ul {
      color: var(--mat-sys-on-surface-variant);
      font-size: 0.9375rem;
      line-height: 2;
      padding-left: 20px;
    }

    .screenshots-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 48px 0 24px;
      color: var(--mat-sys-on-surface);
    }

    .screenshot-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 20px;
    }

    .screenshot-item {
      text-align: center;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .screenshot-item:hover {
      transform: translateY(-4px);
    }

    .screenshot-item img {
      width: 100%;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .screenshot-item p {
      margin-top: 8px;
      font-size: 0.8125rem;
      color: var(--mat-sys-on-surface-variant);
    }

    .preview-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .preview-container {
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
    }

    .preview-img {
      max-width: 90vw;
      max-height: 90vh;
      border-radius: 16px;
      object-fit: contain;
    }

    .preview-close {
      position: absolute;
      top: -16px;
      right: -16px;
      background: var(--mat-sys-surface);
      color: var(--mat-sys-on-surface);
    }

    .faq-card {
      border-radius: 28px;
      background: var(--mat-sys-surface-container-low);
      border: none;
      margin-bottom: 48px;
    }

    .faq-item {
      padding: 16px 0;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }

    .faq-item:last-child {
      border-bottom: none;
    }

    .faq-q {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--mat-sys-on-surface);
      margin-bottom: 6px;
    }

    .faq-a {
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);
      margin: 0;
      line-height: 1.6;
    }

    .changelog {
      margin-bottom: 48px;
    }

    .changelog-item {
      padding: 24px;
      margin-bottom: 16px;
      background: var(--mat-sys-surface-container-low);
      border-radius: 16px;
    }

    .changelog-version {
      font-size: 1rem;
      font-weight: 700;
      color: var(--mat-sys-primary);
      margin-bottom: 12px;
    }

    .changelog-badge {
      padding: 3px 10px;
      border-radius: 999px;
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
      font-size: 0.6875rem;
      font-weight: 600;
      margin-right: 4px;
    }

    .changelog-date {
      font-weight: 400;
      font-size: 0.8125rem;
      color: var(--mat-sys-on-surface-variant);
      margin-left: 8px;
    }

    .changelog-item ul {
      margin: 0;
      padding-left: 20px;
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);
      line-height: 1.8;
    }

    .more {
      text-align: center;
    }

    .more a {
      color: var(--mat-sys-primary);
      text-decoration: none;
      font-weight: 600;
    }

    .more a:hover {
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .download-page {
        padding: 24px 16px;
      }

      .screenshot-gallery {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `,
})
export default class DownloadComponent {
  previewImage = signal<string | null>(null);
  private dialog = inject(MatDialog);

  /** 全部版本（releases.json，第一条即最新） */
  releases = signal<ReleaseEntry[]>([]);
  /** GitHub 资产直链：最新版有 asset 才有 */
  githubAsset = signal<string | null>(null);
  /** 蓝奏云兜底（releases.json 里最新版没配 asset/lanzou 时用） */
  private readonly mainUrl = "https://wwbsh.lanzout.com/i8Y8z44265qd";
  protected readonly GITHUB_RELEASES = GITHUB_RELEASES;

  constructor() {
    inject(SeoService).setDownload();
    void this.loadReleases();
  }

  /** 读 releases.json（与站点同源，无需令牌）；失败就保持空态，按钮退回蓝奏云 */
  private async loadReleases(): Promise<void> {
    try {
      const res = await fetch("releases.json", { cache: "no-cache" });
      if (!res.ok) return;
      const data = (await res.json()) as { releases?: ReleaseEntry[] };
      if (Array.isArray(data.releases) && data.releases.length > 0) {
        this.releases.set(data.releases);
        const latest = data.releases[0];
        if (latest.asset) {
          this.githubAsset.set(`${GITHUB_RELEASES}/download/${latest.tag}/${latest.asset}`);
        }
      }
    } catch {
      // 离线或文件缺失：主按钮退回蓝奏云兜底
    }
  }

  /** 主按钮：GitHub 资产直链优先，没有就退回蓝奏云 */
  primaryUrl(): string {
    return this.githubAsset() ?? this.mainUrl;
  }

  latest(): ReleaseEntry | null {
    return this.releases()[0] ?? null;
  }

  openMirrors() {
    const latest = this.releases()[0];
    const list: { name: string; url: string }[] = [];
    if (this.githubAsset()) {
      GH_MIRRORS.forEach((m) => list.push({ name: m.name, url: m.prefix + this.githubAsset() }));
    }
    if (latest?.lanzou) list.push({ name: "蓝奏云", url: latest.lanzou });
    if (list.length === 0) list.push({ name: "蓝奏云", url: this.mainUrl });
    this.dialog.open(MirrorDialog, { data: list, maxWidth: "560px" });
  }

  screenshots = [
    { src: "/screenshots/01.png", alt: "首页" },
    { src: "/screenshots/02.png", alt: "工具分类" },
    { src: "/screenshots/03.png", alt: "工具搜索" },
    { src: "/screenshots/04.png", alt: "影视大全" },
    { src: "/screenshots/05.png", alt: "音乐大全" },
    { src: "/screenshots/06.png", alt: "壁纸大全" },
    { src: "/screenshots/07.png", alt: "漫画大全" },
    { src: "/screenshots/08.png", alt: "漫画详情" },
    { src: "/screenshots/09.png", alt: "影视解析" },
    { src: "/screenshots/10.png", alt: "小霸王游戏机" },
  ];

  faqs = [
    { q: "Q: 下载后无法安装？", a: '请检查是否开启了「允许安装未知来源应用」权限，可在设置-安全中开启。' },
    { q: "Q: 应用闪退怎么办？", a: "请尝试清除应用缓存或重新下载安装最新版本。" },
    { q: "Q: 如何更新应用？", a: "打开应用会自动检测更新，也可在此页面下载最新版本覆盖安装。" },
    { q: "Q: 是否支持 iOS？", a: "目前仅支持 Android 和 Android Pad，iOS 版本正在开发中。" },
  ];
}

@Component({
  selector: "app-mirror-dialog",
  imports: [MatButtonModule, MatIconModule, MatDialogModule, MatListModule],
  template: `
    <div class="mirror-dialog">
      <h2 mat-dialog-title>备用下载线路</h2>
      <mat-dialog-content>
        <p class="mirror-hint">GitHub 直连不通时按顺序尝试加速线路（只转发链接、不保存文件）；蓝奏云为独立备用源。</p>
        <mat-nav-list>
          @for (mirror of mirrors; track mirror.url) {
            <a mat-list-item [href]="mirror.url" target="_blank" rel="noopener noreferrer" (click)="close()">
              <mat-icon matListItemIcon>link</mat-icon>
              <span matListItemTitle>{{ mirror.name }}</span>
              <span matListItemLine>{{ mirror.url }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="close()">关闭</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: `
    .mirror-dialog { min-width: 420px; }
    .mirror-hint { font-size: 0.875rem; color: var(--mat-sys-on-surface-variant); margin-bottom: 8px; }
    mat-nav-list { max-height: 420px; overflow-y: auto; }
  `,
})
export class MirrorDialog {
  private dialogRef = inject(MatDialogRef);
  data = inject<{ name: string; url: string }[]>(MAT_DIALOG_DATA);

  get mirrors(): { name: string; url: string }[] {
    return this.data ?? [];
  }

  close() {
    this.dialogRef.close();
  }
}
