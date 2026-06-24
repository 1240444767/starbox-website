import { ViewportScroller, isPlatformBrowser } from "@angular/common";
import { Component, inject, PLATFORM_ID, ElementRef, Renderer2, afterNextRender } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink } from "@angular/router";

interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: "app-hero",
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <section class="hero" #heroSection>
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">星盒</h1>
          <p class="hero-subtitle">StarBox · 全能工具箱</p>
          <p class="hero-tagline">
            涵盖200+实用工具，10大分类，从日常计算到专业开发，应有尽有
          </p>
          <div class="hero-actions">
            <a mat-fab extended routerLink="/download" class="fab-primary">
              <mat-icon>download</mat-icon>
              立即下载
            </a>
            <a mat-stroked-button routerLink="/admire" class="fab-secondary">
              <mat-icon>favorite</mat-icon>
              赞赏作者
            </a>
          </div>
        </div>
        <div class="hero-visual">
          <img src="/logo.png" alt="星盒 StarBox" class="hero-logo" />
        </div>
      </div>

      <div class="features-grid">
        @for (feature of features; track feature.title) {
          <div class="feature-card">
            <div class="icon-wrapper">
              <mat-icon>{{ feature.icon }}</mat-icon>
            </div>
            <h2 class="feature-title">{{ feature.title }}</h2>
            <p class="feature-desc">{{ feature.description }}</p>
          </div>
        }
      </div>

      <div class="scroll-hint" (click)="scrollDown()">
        <mat-icon>expand_more</mat-icon>
      </div>
    </section>
    <div id="after-hero"></div>
  `,
  styles: `
    .hero {
      position: relative;
      min-height: calc(100vh - 64px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 80px 48px;
      background-color: var(--mat-sys-surface);
    }

    .hero-container {
      width: 100%;
      max-width: 1080px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 64px;
    }

    .hero-content {
      flex: 1;
      min-width: 0;
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: 800;
      margin-bottom: 8px;
      color: var(--mat-sys-on-surface);
      letter-spacing: -1px;
      line-height: 1.1;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      font-weight: 500;
      color: var(--mat-sys-primary);
      margin-bottom: 8px;
    }

    .hero-tagline {
      font-size: 1rem;
      color: var(--mat-sys-on-surface-variant);
      margin-bottom: 40px;
      line-height: 1.6;
    }

    .hero-actions {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .fab-primary {
      --md-fab-container-color: var(--mat-sys-primary);
      --md-fab-icon-color: var(--mat-sys-on-primary);
    }

    .fab-secondary {
      height: 56px;
      padding: 0 24px;
      border-radius: 16px;
      font-size: 0.875rem;
      font-weight: 500;
      letter-spacing: 0.1px;
      color: var(--mat-sys-primary);
    }

    .hero-visual {
      flex-shrink: 0;
    }

    .hero-logo {
      width: 220px;
      height: 220px;
      border-radius: 32px;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      width: 100%;
      max-width: 1080px;
      margin: 64px auto 0;
    }

    .feature-card {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
      padding: 32px 24px;
      border-radius: 16px;
      background-color: var(--mat-sys-surface-container-low);
      transition: background-color 0.2s, transform 0.2s;
    }

    .feature-card:hover {
      background-color: color-mix(in srgb, var(--mat-sys-on-surface) 4%, transparent);
      transform: translateY(-2px);
    }

    .icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background-color: var(--mat-sys-primary-container);
      margin-bottom: 16px;
    }

    .icon-wrapper mat-icon {
      color: var(--mat-sys-on-primary-container);
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .feature-title {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 6px;
      color: var(--mat-sys-on-surface);
    }

    .feature-desc {
      font-size: 0.8125rem;
      color: var(--mat-sys-on-surface-variant);
      margin: 0;
      line-height: 1.6;
    }

    .scroll-hint {
      position: absolute;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      color: var(--mat-sys-on-surface-variant);
      cursor: pointer;
      animation: bounce 2s ease-in-out infinite;
      transition: color 0.2s;
    }

    .scroll-hint:hover {
      color: var(--mat-sys-on-surface);
    }

    .scroll-hint mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    @keyframes bounce {
      0%, 100% { transform: translateX(-50%) translateY(0); }
      50% { transform: translateX(-50%) translateY(8px); }
    }

    @media (max-width: 768px) {
      .hero {
        min-height: auto;
        padding: 48px 20px 64px;
      }

      .hero-container {
        flex-direction: column-reverse;
        align-items: center;
        gap: 24px;
        text-align: center;
      }

      .hero-logo {
        width: 140px;
        height: 140px;
        border-radius: 28px;
      }

      .hero-title {
        font-size: 2.25rem;
      }

      .hero-tagline {
        margin-bottom: 28px;
      }

      .hero-actions {
        justify-content: center;
      }

      .features-grid {
        grid-template-columns: 1fr;
        gap: 12px;
        margin-top: 40px;
      }

      .feature-card {
        padding: 24px 20px;
        border-radius: 14px;
      }

      .scroll-hint {
        display: none;
      }

      #after-hero {
        display: none;
      }
    }
  `,
})
export class HeroComponent {
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private scrollLocked = false;
  private wheelCleanup: (() => void) | null = null;

  features: Feature[] = [
    {
      icon: "apps",
      title: "200+实用工具",
      description: "涵盖日常工具、影音资源、图片处理、文本工具、开发者工具等10大分类，满足各种需求",
    },
    {
      icon: "bolt",
      title: "极速流畅",
      description: "采用最新技术架构，即点即用，无需等待，所有工具本地运行保护隐私安全",
    },
    {
      icon: "favorite",
      title: "完全免费",
      description: "所有基础功能免费使用，社区驱动开发，每周持续更新，让工具箱越来越强大",
    },
  ];

  constructor() {
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.setupWheelListener();
      }
    });
  }

  private setupWheelListener(): void {
    const section = this.el.nativeElement.querySelector(".hero");
    if (!section) return;

    this.wheelCleanup = this.renderer.listen(section, "wheel", (event: WheelEvent) => {
      if (this.scrollLocked || event.deltaY <= 0) return;

      const rect = section.getBoundingClientRect();
      const isHeroBottomVisible = rect.bottom <= window.innerHeight + 10;
      if (!isHeroBottomVisible) return;

      event.preventDefault();
      this.scrollLocked = true;
      this.scrollDown();
      setTimeout(() => {
        this.scrollLocked = false;
      }, 1000);
    }, { passive: false });
  }

  scrollDown() {
    this.viewportScroller.scrollToAnchor("after-hero");
  }
}
