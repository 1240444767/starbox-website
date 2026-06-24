import { Component } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink } from "@angular/router";

interface FooterLink {
  name: string;
  url: string;
  icon?: string;
  mdiIcon?: string;
  external?: boolean;
}

interface FooterGroup {
  title: string;
  icon: string;
  links: FooterLink[];
}

@Component({
  selector: "app-footer",
  imports: [RouterLink, MatIconModule],
  template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-grid">
          @for (group of groups; track group.title) {
            <div class="footer-group">
              <h3 class="group-title"><mat-icon>{{ group.icon }}</mat-icon>{{ group.title }}</h3>
              <ul class="group-links">
                @for (link of group.links; track link.name) {
                  <li>
                    @if (link.external) {
                      <a [href]="link.url" target="_blank" rel="noopener noreferrer">
                        @if (link.mdiIcon) {
                          <span [class]="'link-icon mdi mdi-' + link.mdiIcon"></span>
                        } @else if (link.icon) {
                          <mat-icon class="link-icon">{{ link.icon }}</mat-icon>
                        }
                        {{ link.name }}
                      </a>
                    } @else {
                      <a [routerLink]="link.url">
                        @if (link.mdiIcon) {
                          <span [class]="'link-icon mdi mdi-' + link.mdiIcon"></span>
                        } @else if (link.icon) {
                          <mat-icon class="link-icon">{{ link.icon }}</mat-icon>
                        }
                        {{ link.name }}
                      </a>
                    }
                  </li>
                }
              </ul>
            </div>
          }
        </div>

        <div class="footer-bottom">
          <p class="copyright">
            <mat-icon class="copyright-icon">copyright</mat-icon>
            <span>2025-{{ currentYear }} <strong>Xiao Yang</strong> · MIT 许可 · <a href="https://istarbox.app">星盒 StarBox</a></span>
          </p>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      background-color: var(--mat-sys-surface-container);
      padding: 48px 0 24px;
      margin-top: 0;
    }

    .footer-container {
      max-width: 1080px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 48px;
      margin-bottom: 32px;
    }

    .group-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--mat-sys-on-surface);
      margin-bottom: 20px;
    }

    .group-title mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .group-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .group-links li {
      margin-bottom: 12px;
    }

    .group-links a {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--mat-sys-on-surface-variant);
      text-decoration: none;
      font-size: 0.8125rem;
      padding: 6px 12px;
      border-radius: 16px;
      transition: background-color 0.2s, color 0.2s;
    }

    .group-links a:hover {
      color: var(--mat-sys-on-surface);
      background-color: color-mix(in srgb, var(--mat-sys-on-surface) 4%, transparent);
    }

    .link-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .link-icon.mdi {
      font-size: 18px;
      line-height: 1;
    }

    .footer-bottom {
      padding-top: 20px;
      border-top: 1px solid var(--mat-sys-outline-variant);
      text-align: center;
    }

    .copyright {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--mat-sys-on-surface-variant);
      font-size: 0.8125rem;
      margin: 0;
    }

    .copyright-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .copyright a {
      color: var(--mat-sys-on-surface);
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    .copyright a:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .footer {
        padding: 36px 0 20px;
      }

      .footer-container {
        padding: 0 20px;
      }

      .footer-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 24px 32px;
        margin-bottom: 28px;
      }

      .group-title {
        font-size: 0.8125rem;
        margin-bottom: 14px;
      }

      .group-links li {
        margin-bottom: 6px;
      }

      .group-links a {
        font-size: 0.8125rem;
        padding: 4px 10px;
      }
    }

    @media (max-width: 480px) {
      .footer {
        padding: 28px 0 16px;
      }

      .footer-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  `,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  groups: FooterGroup[] = [
    {
      title: "项目",
      icon: "folder",
      links: [
        { name: "下载星盒", url: "/download", icon: "download" },
        { name: "赞赏支持", url: "/admire", icon: "favorite" },
        {
          name: "GitHub",
          url: "https://github.com/1240444767",
          mdiIcon: "github",
          external: true,
        },
      ],
    },
    {
      title: "文档",
      icon: "menu_book",
      links: [
        { name: "隐私政策", url: "/docs/privacy", icon: "policy" },
        { name: "用户协议", url: "/docs/terms", icon: "description" },
        { name: "文档", url: "/tip", icon: "menu_book" },
      ],
    },
    {
      title: "社区",
      icon: "groups",
      links: [
        {
          name: "QQ群",
          url: "https://docs.qq.com/doc/DY1hMdVJGeVZVa1V1",
          mdiIcon: "qqchat",
          external: true,
        },
        {
          name: "问题反馈",
          url: "https://docs.qq.com/form/page/DY2NDakFudFdzWUVF",
          icon: "feedback",
          external: true,
        },
      ],
    },
  ];
}
