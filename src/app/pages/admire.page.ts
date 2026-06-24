import { Component, inject, signal, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { FooterComponent } from "../features/layout/footer";
import { SeoService } from "../features/seo/seo.service";

interface Donor {
  name: string;
  amount?: string;
  message?: string;
  avatar?: string;
}

@Component({
  selector: "app-admire",
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatDialogModule, FooterComponent],
  template: `
    <div class="admire-page">
      <h1>赞赏支持</h1>
      <p class="subtitle">感谢你对星盒的支持与喜爱！你的赞赏将帮助我们持续改进，带来更多实用工具</p>

      <!-- 支付方式 -->
      <h2 class="section-title">赞赏方式</h2>
      <div class="pay-section">
        @for (code of payCodes; track code.label) {
          <mat-card appearance="outlined" class="pay-card" (click)="openPay(code)">
            <div class="pay-img-wrap">
              <img [src]="code.src" [alt]="code.label" />
            </div>
            <p>{{ code.label }}</p>
          </mat-card>
        }
      </div>

      <blockquote class="tip-text">
        💡 赞赏后可以在备注中留下你的名字和留言，我们会定期更新到赞赏名单中
      </blockquote>

      <!-- 赞赏名单 -->
      <h2 class="section-title">感谢以下贡献者</h2>
      @if (donors().length > 0) {
        <div class="donor-grid">
          @for (donor of donors(); track donor.name) {
            <div class="donor-card">
              <img [src]="donor.avatar || '/logo.png'" [alt]="donor.name" class="donor-avatar" />
              <div class="donor-info">
                <h3 class="donor-name">{{ donor.name }}</h3>
                @if (donor.amount) {
                  <span class="donor-amount">{{ donor.amount }}</span>
                }
                @if (donor.message) {
                  <p class="donor-message">{{ donor.message }}</p>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <mat-card appearance="outlined" class="empty-card">
          <mat-card-content class="empty-content">
            <mat-icon>groups</mat-icon>
            <p>赞赏名单正在整理中，敬请期待...</p>
            <p class="hint">成为第一个赞赏的人吧！</p>
          </mat-card-content>
        </mat-card>
      }

      <!-- 其他支持方式 -->
      <h2 class="section-title">其他支持方式</h2>
      <div class="other-support">
        <div class="support-item">
          <mat-icon>star</mat-icon>
          <span>在 GitHub 上给项目 Star</span>
        </div>
        <div class="support-item">
          <mat-icon>share</mat-icon>
          <span>向朋友推荐星盒</span>
        </div>
        <div class="support-item">
          <mat-icon>edit_note</mat-icon>
          <span>撰写使用心得和教程</span>
        </div>
        <div class="support-item">
          <mat-icon>bug_report</mat-icon>
          <span>提交 Bug 反馈和功能建议</span>
        </div>
        <div class="support-item">
          <mat-icon>chat</mat-icon>
          <span>加入社区讨论，帮助其他用户</span>
        </div>
      </div>
    </div>

    <app-footer />
  `,
  styles: `
    .admire-page {
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
      margin-bottom: 40px;
      line-height: 1.6;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 48px 0 24px;
      color: var(--mat-sys-on-surface);
    }

    .pay-section {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 24px;
      margin-bottom: 24px;
    }

    .pay-card {
      text-align: center;
      border-radius: 20px;
      background: var(--mat-sys-surface-container-low);
      border: none;
      transition: transform 0.2s;
      width: 220px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
    }

    .pay-card:hover {
      transform: translateY(-4px);
    }

    .pay-img-wrap {
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .pay-card img {
      max-width: 180px;
      max-height: 200px;
      border-radius: 12px;
      object-fit: contain;
    }

    .pay-card p {
      margin-top: 12px;
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);
      padding-bottom: 8px;
    }

    .tip-text {
      background: var(--mat-sys-surface-container-low);
      border-radius: 12px;
      padding: 16px 24px;
      margin: 0 0 24px;
      color: var(--mat-sys-on-surface-variant);
      font-size: 0.9375rem;
      border-left: 4px solid var(--mat-sys-primary);
    }

    /* Donor grid */
    .donor-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .donor-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: var(--mat-sys-surface-container-low);
      border-radius: 16px;
      transition: transform 0.2s;
    }

    .donor-card:hover {
      transform: translateY(-2px);
    }

    .donor-avatar {
      width: 48px;
      height: 48px;
      border-radius: 24px;
      flex-shrink: 0;
    }

    .donor-info {
      min-width: 0;
    }

    .donor-name {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--mat-sys-on-surface);
      margin: 0;
    }

    .donor-amount {
      font-size: 0.8125rem;
      color: var(--mat-sys-primary);
      font-weight: 500;
    }

    .donor-message {
      font-size: 0.8125rem;
      color: var(--mat-sys-on-surface-variant);
      margin: 4px 0 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .empty-card {
      border-radius: 20px;
      background: var(--mat-sys-surface-container-low);
      border: none;
      margin-bottom: 24px;
    }

    .empty-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 24px;
      text-align: center;
    }

    .empty-content mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--mat-sys-on-surface-variant);
      margin-bottom: 16px;
    }

    .empty-content p {
      font-size: 1rem;
      color: var(--mat-sys-on-surface-variant);
      margin: 4px 0;
    }

    .empty-content .hint {
      font-size: 0.875rem;
      color: var(--mat-sys-primary);
      font-weight: 500;
    }

    /* Other support */
    .other-support {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .support-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      background: var(--mat-sys-surface-container-low);
      border-radius: 12px;
      font-size: 0.9375rem;
      color: var(--mat-sys-on-surface-variant);
    }

    .support-item mat-icon {
      color: var(--mat-sys-primary);
    }

    @media (max-width: 480px) {
      .admire-page {
        padding: 24px 16px;
      }

      .pay-section {
        flex-direction: column;
        align-items: center;
      }

      .donor-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export default class AdmireComponent implements OnInit {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  donors = signal<Donor[]>([]);

  payCodes = [
    { src: "/admire/wx.png", label: "微信扫码支付" },
    { src: "/admire/zfb.jpg", label: "支付宝扫码支付" },
    { src: "/admire/qq.png", label: "QQ 扫码支付" },
  ];

  constructor() {
    inject(SeoService).setAdmire();
  }

  ngOnInit() {
    this.http.get<Donor[]>("/donors.json").subscribe({
      next: (data) => this.donors.set(data),
      error: () => {},
    });
  }

  openPay(code: { src: string; label: string }) {
    this.dialog.open(PayDialog, {
      data: code,
      maxWidth: "95vw",
      panelClass: "pay-dialog",
    });
  }
}

@Component({
  selector: "app-pay-dialog",
  imports: [MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div class="pay-dialog-content">
      <button mat-icon-button class="pay-close" (click)="close()">
        <mat-icon>close</mat-icon>
      </button>
      <img [src]="data.src" [alt]="data.label" class="pay-full-img" />
      <p class="pay-label">{{ data.label }}</p>
    </div>
  `,
  styles: `
    .pay-dialog-content {
      text-align: center;
      padding: 24px;
      position: relative;
    }

    .pay-close {
      position: absolute;
      top: 8px;
      right: 8px;
      color: var(--mat-sys-on-surface-variant);
    }

    .pay-full-img {
      max-width: min(320px, 70vw);
      max-height: min(400px, 60vh);
      object-fit: contain;
      border-radius: 12px;
    }

    .pay-label {
      margin-top: 16px;
      font-size: 1rem;
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class PayDialog {
  data = inject<{ src: string; label: string }>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef);
  close() { this.dialogRef.close(); }
}
