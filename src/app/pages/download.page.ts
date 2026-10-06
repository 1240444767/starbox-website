import { Component, computed, inject, signal } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { FooterComponent } from "../features/layout/footer";
import { SeoService } from "../features/seo/seo.service";

// ─── GitHub 下载（对齐星音乐官网的样式与机制）───
// APK 挂在本仓库（已公开）的 GitHub Releases 上，releases.json 与之一一对应；
// 直链 + 多条第三方加速线路（pills 切换，localStorage 记住选择），蓝奏云作为网盘备用。

const GITHUB_RELEASES = "https://github.com/1240444767/starbox-website/releases";

/** GitHub 加速线路（只转发链接，不保存文件；默认 GitHub 直连） */
const GH_MIRRORS: { id: string; label: string; prefix: string }[] = [
  { id: "github", label: "GitHub 直连", prefix: "" },
  { id: "gh-proxy", label: "gh-proxy", prefix: "https://gh-proxy.com/" },
  { id: "llkk", label: "llkk", prefix: "https://gh.llkk.cc/" },
  { id: "ghfast", label: "ghfast", prefix: "https://ghfast.top/" },
  { id: "ghproxy", label: "ghproxy", prefix: "https://ghproxy.net/" },
];

const SOURCE_KEY = "starbox-dl-source";

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

function readStoredSource(): string {
  try {
    return localStorage.getItem(SOURCE_KEY) ?? "github";
  } catch {
    return "github";
  }
}

@Component({
  selector: "app-download",
  imports: [MatIconModule, MatCardModule, FooterComponent],
  template: `
    <div class="download-page">
      <header class="center-head">
        <span class="eyebrow">下载</span>
        <h1>下载星盒工具箱</h1>
        <p class="subtitle">
          APK 直接托管在 GitHub Releases 上，免费下载，不经过任何第三方应用商店。
        </p>
      </header>

      <div class="layout">
        <div class="panel">
          <div class="brand">
            <img src="/logo.png" width="72" height="72" alt="星盒工具箱图标" />
            <div>
              <h3>星盒工具箱</h3>
              <p>
                v{{ latest()?.version ?? "2.7.0" }} · 通用 APK
                @if (latest()?.size) { · {{ latest()!.size }} }
              </p>
            </div>
          </div>

          <dl class="req">
            <div>
              <dt>最新版本</dt>
              <dd>v{{ latest()?.version ?? "2.7.0" }}</dd>
            </div>
            @if (latest()?.size) {
              <div><dt>文件大小</dt><dd>{{ latest()!.size }}</dd></div>
            }
            <div><dt>系统要求</dt><dd>Android 7.0+</dd></div>
            <div><dt>安装包</dt><dd>通用 APK</dd></div>
          </dl>

          @if (githubAsset()) {
            <div class="sources">
              <span class="src-label">下载线路</span>
              <div class="pills">
                @for (s of sources; track s.id) {
                  <button type="button" class="pill" [class.on]="s.id === sourceId()" (click)="pickSource(s.id)">
                    {{ s.label }}
                  </button>
                }
              </div>
              <p class="src-note">加速线路只转发 GitHub 链接、不保存文件；某条不通就换一条或换回直连。</p>
            </div>
          }

          @if (lanzouUrl()) {
            <div class="sources">
              <span class="src-label">网盘备用</span>
              <div class="pills">
                <a class="pill cloud" [href]="lanzouUrl()" target="_blank" rel="noopener noreferrer">
                  蓝奏云 v{{ latest()?.version ?? "2.7.0" }}
                </a>
              </div>
            </div>
          }

          <a class="btn" [href]="downloadHref()" target="_blank" rel="noopener noreferrer">
            下载 APK v{{ latest()?.version ?? "2.7.0" }}
          </a>

          <div class="links">
            <a class="ghost" [href]="GITHUB_RELEASES" target="_blank" rel="noopener noreferrer">
              查看所有版本
            </a>
            <button class="ghost" type="button" [disabled]="!githubAsset()" (click)="copyLink()">
              {{ copied() ? "已复制直链" : "复制直链" }}
            </button>
          </div>
        </div>

        <ol class="steps">
          <li>
            <span class="num">1</span>
            <div>
              <h4>下载 APK</h4>
              <p>点击左侧「下载 APK」按钮；国内网络直连 GitHub 较慢时，先在上方换一条加速线路。</p>
            </div>
          </li>
          <li>
            <span class="num">2</span>
            <div>
              <h4>允许安装</h4>
              <p>首次安装请在系统设置中允许「安装未知来源应用」，或在安装弹窗里授权本应用。</p>
            </div>
          </li>
          <li>
            <span class="num">3</span>
            <div>
              <h4>安装完成</h4>
              <p>覆盖安装不会丢失数据，打开星盒即可继续使用。</p>
            </div>
          </li>
        </ol>
      </div>

      <p class="disclaimer">
        星盒是一款免费的个人开发工具箱，APK 由官方 GitHub Releases 分发，请勿在第三方渠道付费购买。
      </p>

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
        @for (release of releases(); track release.version; let i = $index) {
          <div class="changelog-item">
            <h3 class="changelog-version">
              StarBox v{{ release.version }}
              @if (i === 0) { <span class="changelog-badge">最新</span> }
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

    .center-head {
      text-align: center;
    }

    .eyebrow {
      display: inline-block;
      padding: 4px 14px;
      border-radius: 999px;
      background: var(--mat-sys-secondary-container);
      color: var(--mat-sys-on-secondary-container);
      font-size: 0.8125rem;
      font-weight: 600;
    }

    h1 {
      font-size: 2rem;
      font-weight: 700;
      margin: 14px 0 8px;
      color: var(--mat-sys-on-surface);
    }

    .subtitle {
      font-size: 1rem;
      color: var(--mat-sys-on-surface-variant);
      margin: 0;
    }

    .layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 24px;
      margin-top: 44px;
      align-items: start;
    }

    .panel {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 28px;
      border-radius: 28px;
      background: var(--mat-sys-surface-container-low);
      border: 1px solid var(--mat-sys-outline-variant);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .brand img {
      border-radius: 20px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
    }

    .brand h3 {
      margin: 0;
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--mat-sys-on-surface);
    }

    .brand p {
      margin: 4px 0 0;
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);
    }

    .req {
      margin: 0;
      display: grid;
      gap: 1px;
      border-radius: 14px;
      overflow: hidden;
      background: color-mix(in srgb, var(--mat-sys-outline-variant) 45%, transparent);
    }

    .req > div {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding: 11px 16px;
      background: var(--mat-sys-surface-container);
      font-size: 0.8438rem;
    }

    .req dt {
      color: var(--mat-sys-on-surface-variant);
    }

    .req dd {
      margin: 0;
      font-weight: 600;
      text-align: right;
      color: var(--mat-sys-on-surface);
    }

    .sources {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .src-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--mat-sys-on-surface-variant);
    }

    .pills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .pill {
      padding: 6px 14px;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, var(--mat-sys-outline) 60%, transparent);
      background: transparent;
      color: var(--mat-sys-on-surface-variant);
      font: inherit;
      font-size: 0.7813rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: background-color 0.18s ease, color 0.18s ease, border-color 0.18s ease;
    }

    .pill:hover {
      border-color: var(--mat-sys-primary);
      color: var(--mat-sys-primary);
    }

    .pill.on {
      background: var(--mat-sys-primary);
      border-color: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
    }

    .pill.cloud {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-color: var(--mat-sys-primary);
      color: var(--mat-sys-primary);
      background: color-mix(in srgb, var(--mat-sys-primary) 10%, transparent);
    }

    .pill.cloud:hover {
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
    }

    .src-note {
      margin: 0;
      font-size: 0.7813rem;
      line-height: 1.7;
      color: var(--mat-sys-on-surface-variant);
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 15px 24px;
      border-radius: 999px;
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
      font-size: 0.9375rem;
      font-weight: 600;
      text-decoration: none;
      box-shadow: 0 6px 18px color-mix(in srgb, var(--mat-sys-primary) 30%, transparent);
      transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s ease;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 24px color-mix(in srgb, var(--mat-sys-primary) 38%, transparent);
    }

    .links {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 22px;
      flex-wrap: wrap;
    }

    .ghost {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0;
      border: 0;
      background: transparent;
      font: inherit;
      font-size: 0.8438rem;
      font-weight: 600;
      color: var(--mat-sys-primary);
      cursor: pointer;
    }

    .ghost:hover {
      text-decoration: underline;
    }

    .ghost:disabled {
      opacity: 0.5;
      cursor: default;
      text-decoration: none;
    }

    .steps {
      margin: 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: 16px;
    }

    .steps li {
      display: flex;
      gap: 16px;
      padding: 20px 22px;
      border-radius: 20px;
      background: var(--mat-sys-surface-container-low);
      border: 1px solid var(--mat-sys-outline-variant);
    }

    .num {
      flex: none;
      display: grid;
      place-items: center;
      width: 34px;
      height: 34px;
      border-radius: 12px;
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
      font-size: 0.9375rem;
      font-weight: 700;
    }

    .steps h4 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--mat-sys-on-surface);
    }

    .steps p {
      margin: 6px 0 0;
      font-size: 0.875rem;
      line-height: 1.65;
      color: var(--mat-sys-on-surface-variant);
    }

    .disclaimer {
      max-width: 780px;
      margin: 40px auto 0;
      font-size: 0.8125rem;
      line-height: 1.7;
      color: var(--mat-sys-on-surface-variant);
      text-align: center;
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

    @media (max-width: 900px) {
      .layout {
        grid-template-columns: 1fr;
      }
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

  protected readonly GITHUB_RELEASES = GITHUB_RELEASES;
  protected readonly sources = GH_MIRRORS;

  /** 全部版本（releases.json，第一条即最新） */
  releases = signal<ReleaseEntry[]>([]);
  /** GitHub 资产直链：最新版有 asset 才有 */
  githubAsset = signal<string | null>(null);
  /** 蓝奏云兜底（releases.json 最新版没配 asset 时的主按钮退路） */
  private readonly mainUrl = "https://wwbsh.lanzout.com/i8Y8z44265qd";

  protected readonly sourceId = signal(readStoredSource());

  protected readonly copied = signal(false);

  protected readonly lanzouUrl = computed(() => {
    const lanzou = this.releases()[0]?.lanzou;
    return lanzou ?? null;
  });

  /** 当前线路下的下载地址 */
  protected readonly downloadHref = computed(() => {
    const asset = this.githubAsset();
    if (!asset) return this.mainUrl;
    const source = this.sources.find((s) => s.id === this.sourceId()) ?? this.sources[0];
    return source.prefix ? source.prefix + asset : asset;
  });

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

  latest(): ReleaseEntry | null {
    return this.releases()[0] ?? null;
  }

  pickSource(id: string) {
    this.sourceId.set(id);
    try {
      localStorage.setItem(SOURCE_KEY, id);
    } catch {
      /* 隐私模式下写不了，忽略 */
    }
  }

  async copyLink() {
    try {
      await navigator.clipboard.writeText(this.downloadHref());
    } catch {
      const scratch = document.createElement("textarea");
      scratch.value = this.downloadHref();
      scratch.setAttribute("readonly", "");
      scratch.style.position = "fixed";
      scratch.style.opacity = "0";
      document.body.appendChild(scratch);
      scratch.select();
      try {
        document.execCommand("copy");
      } catch {
        /* 复制不了就算了 */
      }
      scratch.remove();
    }
    this.copied.set(true);
    window.setTimeout(() => this.copied.set(false), 1600);
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
    { q: "Q: GitHub 直连失败？", a: "在「下载线路」里换一条加速线路，或使用「网盘备用」的蓝奏云链接。" },
  ];
}
