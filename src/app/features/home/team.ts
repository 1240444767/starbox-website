import { Component } from "@angular/core";

interface CoreMember {
  avatar: string;
  name: string;
  title: string;
  link: string;
}

@Component({
  selector: "app-team",
  imports: [],
  template: `
    <section class="team">
      <div class="team-container">
        <h2 class="section-title">我们的团队</h2>
        <div class="core-team">
          @for (member of coreMembers; track member.name) {
            <a [href]="member.link" target="_blank" rel="noopener noreferrer" class="core-card">
              <img [src]="member.avatar" [alt]="member.name" class="core-avatar" />
              <span class="core-name">{{ member.name }}</span>
              <span class="core-title">{{ member.title }}</span>
            </a>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .team {
      padding: 80px 24px;
      background-color: var(--mat-sys-surface);
    }

    .team-container {
      max-width: 960px;
      margin: 0 auto;
    }

    .section-title {
      text-align: center;
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 40px;
      color: var(--mat-sys-on-surface);
    }

    .core-team {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      max-width: 480px;
      margin: 0 auto;
    }

    .core-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 24px;
      border-radius: 16px;
      background-color: var(--mat-sys-surface-container-low);
      text-decoration: none;
      color: inherit;
      transition: background-color 0.2s;
    }

    .core-card:hover {
      background-color: color-mix(in srgb, var(--mat-sys-on-surface) 4%, transparent);
    }

    .core-avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      margin-bottom: 16px;
    }

    .core-name {
      font-size: 1rem;
      font-weight: 600;
      color: var(--mat-sys-on-surface);
    }

    .core-title {
      font-size: 0.8125rem;
      color: var(--mat-sys-on-surface-variant);
      margin-top: 4px;
    }

    @media (max-width: 768px) {
      .team {
        padding: 56px 16px;
      }

      .core-team {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  `,
})
export class TeamComponent {
  coreMembers: CoreMember[] = [
    {
      avatar: "http://q1.qlogo.cn/g?b=qq&nk=1240444767&s=100",
      name: "Xiao Yang",
      title: "创始人 & 独立开发者",
      link: "https://github.com/1240444767",
    },
    {
      avatar: "/logo.png",
      name: "QQ群",
      title: "反馈建议 & 交流讨论",
      link: "https://qm.qq.com/q/iw76gr1TsQ",
    },
  ];
}
