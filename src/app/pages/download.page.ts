import { Component, inject, signal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { FooterComponent } from "../features/layout/footer";
import { SeoService } from "../features/seo/seo.service";

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
            <a mat-fab extended href="https://wwbsh.lanzout.com/iuocq3uqvvbi" target="_blank" rel="noopener noreferrer" class="download-primary">
              <mat-icon>download</mat-icon>
              下载最新版本
            </a>
            <button mat-stroked-button (click)="openMirrors()" class="download-backup">
              <mat-icon>cloud_download</mat-icon>
              备用下载
            </button>
            <p class="version-info">当前版本: v2.5.0 | 更新日期: 2026-08-7</p>
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
        @for (release of changelog; track release.version) {
          <div class="changelog-item">
            <h3 class="changelog-version">{{ release.version }} <span class="changelog-date">{{ release.date }}</span></h3>
            <ul>
              @for (line of release.items; track line) {
                <li>{{ line }}</li>
              }
            </ul>
          </div>
        }
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

  private mainUrl = "https://wwbsh.lanzout.com/i8js940wuphe";

  constructor() {
    inject(SeoService).setDownload();
  }

  openMirrors() {
    this.dialog.open(MirrorDialog, {
      data: this.mainUrl,
      maxWidth: "500px",
    });
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

  changelog = [
    {
      version: "StarBox v2.5.0",
      date: "2026-08-7",
      items: [
        "前言:今天是立秋了,有没有帅哥美女请我喝一杯奶茶呀嘻嘻嘻！(超想喝！！！)",
        "下载链接  -  https://wwbsh.lanzout.com/i8js940wuphe",
        "备用链接  -  https://wwbsh.lanzouy.com/i8js940wuphe",
        "官网更新  -  https://www.istarbox.app",
        "",
        "新增 - BMI指数",
        "新增 - 黄金价格",
        "新增 - 地震数据",
        "新增 - 血型遗传查询",
        "新增 - 梗名生成器",
        "新增 - 随机弱智吧问答",
        "新增 - 随机人设",
        "新增 - 今日诗词",
        "新增 - 今天吃什么",
        "新增 - RSS阅读",
        "新增 - Markdown编辑器",
        "新增 - PDF阅读",
        "新增 - 二维码制作",
        "新增 - QQ头像获取",
        "新增 - 拼豆图纸",
        "新增 - 设备温度",
        "新增 - 反应力测试",
        "新增 - 隐藏启动设置",
        "新增 - 开源软件",
        "",
        "修复 - 音乐大全全屏在平板或电脑上无法显示的问题",
        "",
        "优化 - 多处UI已适配大屏",
        "优化 - 音乐大全的本地歌单支持批量下载",
        "优化 - 音乐大全的最近播放支持清除",
        "",
        "版本:v2.5.0 日期:2026-8-7 作者:Xiao Yang"
      ],
    },{
      version: "StarBox v2.4.0",
      date: "2026-07-6",
      items: [
        "前言:作者大大表示想要一份工作,有工作介绍的联系我. 呜~呜~~呜~",
        "重点:音乐大全全新设计(功能目前很完善)",
        "新增 - IloveDPF",
        "新增 - 证件照制作",
        "新增 - 音乐桌面歌词",
        "修复 - 空文件和安装包清理不干净问题",
        "修复 - 影视播放器新增缓冲功能(减少部分卡顿)",
        "新增 - 影视播放器外部播放",
        "优化 - 软件启动速度",
        "版本:v2.4.0 日期:2026-7-6 作者:Xiao Yang",
      ],
    },
    {
      version: "StarBox v2.3.0",
      date: "2026-06-23",
      items: [
        "前言:牛马天天加班加点赶这个版本的工程,有没有土豪请我喝杯冰冰凉凉的奶茶啊",
        "重点:小说大全已经全面对齐Legado,内置多个书源,需要手动导入",
        "新增 - 主题大全",
        "新增 - Switch520",
        "新增 - 玩机博客",
        "新增 - 小米ROM",
        "新增 - MC版本库",
        "新增 - 解析视频和图集多个源",
        "修复 - Zeep无法刷步问题",
        "修复 - 影视播放器容易触发工具栏的问题",
        "修复 - 启动页部分用户长时间没有反应",
        "修复 - 许许多多的bug",
        "优化 - 软件启动速度",
        "版本:v2.3.0 日期:2026-6-23 作者:Xiao Yang",
      ],
    },
    {
      version: "StarBox v2.2.0",
      date: "2026-06-05",
      items: [
        "前言:这次更新挺多内容,终于可好好休息一下了,有没有人能请我吃一根巧乐兹 ^_^",
        "新增 - 文件闪传",
        "新增 - 壁纸大全(超多资源)",
        "新增 - 影视大全播放源(魔都影视|速播影视|新浪影视|樱花影视|花旗影视|猫眼影视|最大影视|丫丫影视|天涯影视)",
        "新增 - 今日热榜",
        "新增 - 自定义签名设计",
        "新增 - 音乐大全支持播放页全屏播放",
        "新增 - 全网热门图片编辑功能PhotoColors",
        "新增 -还有挺多有点记不住了",
        "修复 - 影视播放器手势动画UI",
        "修复 - 动漫大全资源被墙的问题",
        "修复 - Android10用户下载不了的问题",
        "优化 - 软件启动速度",
        "版本:v2.2.0 日期:2026-6-5 作者:Xiao Yang",
      ],
    },
    {
      version: "StarBox v2.1.0",
      date: "2026-05-12",
      items: [
        "前言:作者最近比较忙，可能更新比较慢，不过大家的建议都会采取的",
        "新增 - AGE动漫",
        "新增 - 小说大全",
        "新增 - 待办事项",
        "新增 - 开发者工具新增13个功能",
        "新增 - 图片相关工具新增7个功能",
        "修复 - 影视大全和动漫大全下载慢的问题",
        "修复 - 播放视频的UI框架更新",
        "修复 - 简易画板支持更多内容",
        "优化 - 工具搜索速度和报错查询记录",
        "版本:v2.1.0 日期:2026-5-12 作者:Xiao Yang",
      ],
    },
    {
      version: "StarBox v2.0.1",
      date: "2026-04-11",
      items: [
        "前言:作者最近在找工作,进厂了可能更新会有点减缓速度,但是我还是对我的作品会积极上心维护更新，也欢迎大家积极反馈谢谢大家！！！",
        "新增-动漫大全(对接Bangumi)",
        "新增-影视大全增添投屏和'热门影视', '影视排行', '新片速递', '甄选好片', '番剧排期'",
        "新增-自己去发现",
        "修复-影视大全无法投屏",
        "修复-音乐大全搜索不能下载",
        "修复-多平台图集解析和短视频解析下载报错",
        "修复-设置崩溃日志无法记录的问题",
        "优化-音乐大全进行全局同步播放",
        "优化-音乐大全播放逻辑和卡顿处理",
        "优化-影视大全的播放UI",
        "版本:v2.0.1 日期:2026-4-11 作者:Xiao Yang",
      ],
    },
    {
      version: "StarBox v2.0.0",
      date: "2026-03-01",
      items: [
        "重新开始",
        "全新星盒2.0,用心打造新一代工具箱",
        "重构项目全部结构,耗费2个月,全新UI设计,完全符合Material You设计",
        "软件整体75%优化性能,审美度97%,符合极简主义的喜欢",
        "现在检查每月进行4次更新",
        "x.y.z: X 代表每年一次的大更新, Y 代表软件重大Bug需要更新, Z 代表每次更新的小问题与修复",
        "希望你从此刻能够喜欢由Xiao Yang 打造的星盒",
      ],
    },
    {
      version: "StarBox v1.4",
      date: "2025-12-01",
      items: [
        "由于失恋导致就修复一些小问题，没有精力维护",
      ],
    },
    {
      version: "StarBox v1.3",
      date: "2025-11-01",
      items: [
        "修复已知bug",
        "修复浏览器下载问题",
        "修复网络不稳定崩溃问题",
        "新增音乐大全，漫画大全(可能不太全),仓库更新为资源合集",
        "新增工具:倒数日、番茄专注、全国油价、白噪音、偷拍检测、防晕车、震动器、支付宝到账语音、今日电影票房排行、邮编查询、垃圾分类查询、电影台词搜索、日期计算器、时间戳转换、复利计算器、油耗计算、历史人物查询",
        "优化代码逻辑，使应用比较流畅",
      ],
    },
    {
      version: "StarBox v1.2",
      date: "2025-10-01",
      items: [
        "优化许多之前存在的bug",
        "修复了IPTV(支持多接口直播)",
        "修复了小霸王游戏机搜索功能",
        "新增了软件库大全",
        "新增了随机白丝、黑丝、热舞、萝莉、吊带、慢摇视频",
        "新增了IP地址查询",
        "新增了骚扰电话查询",
        "新增了重名查询",
        "新增了万年历",
        "新增了秒表、计时器",
        "新增了模拟来电",
        "新增了答案之书、电子木鱼、每日英语",
        "新增空文件夹清理、安装包查询",
        "新增万能搜索、网盘搜索、短剧搜索",
        "新增了经纬度查询、常用号码查询",
        "新增了恋爱话术",
        "新增了男女朋友评分计算",
      ],
    },
    {
      version: "StarBox v1.1",
      date: "2025-09-01",
      items: [
        "新增了仓库模块(提供在线网络功能)",
        "新增计算应用和开发工具分类",
        "计算应用 - 添加工作性价比计算、计算器、单位换算、汇率换算、房贷计算、颜色转换、进制转换",
        "开发工具 - 新增请求测试、正则表达式、SSL证书查询、Ping测试、域名解析查询、网站权重查询、网站收录查询",
        "影视功能全面升级，也单独分离出一个应用出来 - 支持影视解析、影视分类、在线直播、历史记录、下载、投屏、收藏影视、自定义影视接口",
      ],
    },
    {
      version: "StarBox v1.0",
      date: "2025-06-01",
      items: [
        "第一个应用版本",
        "用时3个月开发",
        "采用Android 原生代码开发",
        "使用Material3的标准式布局",
      ],
    },
  ];
}

@Component({
  selector: "app-mirror-dialog",
  imports: [MatButtonModule, MatIconModule, MatDialogModule, MatListModule],
  template: `
    <div class="mirror-dialog">
      <h2 mat-dialog-title>选择备用下载线路</h2>
      <mat-dialog-content>
        <p class="mirror-hint">如主链接无法下载，请尝试以下备用线路：</p>
        <mat-nav-list>
          @for (mirror of mirrors; track mirror.char) {
            <a mat-list-item [href]="mirror.url" target="_blank" rel="noopener noreferrer" (click)="close()">
              <mat-icon matListItemIcon>link</mat-icon>
              <span matListItemTitle>备用线路 {{ mirror.char.toUpperCase() }}</span>
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
    .mirror-dialog { min-width: 380px; }
    .mirror-hint { font-size: 0.875rem; color: var(--mat-sys-on-surface-variant); margin-bottom: 8px; }
    mat-nav-list { max-height: 400px; overflow-y: auto; }
  `,
})
export class MirrorDialog {
  private dialogRef = inject(MatDialogRef);
  data = inject<string>(MAT_DIALOG_DATA);
  mirrors: { char: string; url: string }[] = [];

  constructor() {
    // 从 a 到 z 生成所有备用链接
    for (let i = 0; i < 26; i++) {
      const char = String.fromCharCode(97 + i); // 'a' to 'z'
      if ("tadnrsz".includes(char)) continue;
      const url = this.data.replace(/lanzou\w/, `lanzou${char}`);
      this.mirrors.push({ char, url });
    }
  }

  close() {
    this.dialogRef.close();
  }
}
