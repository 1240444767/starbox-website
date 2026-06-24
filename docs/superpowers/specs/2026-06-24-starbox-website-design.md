# StarBox 官网重建 — 设计文档

**日期:** 2026-06-24
**状态:** 待审核

---

## 1. 概述

重新搭建 StarBox 官网，参考 [Kazumi 官网](https://github.com/Predidit/Kazumi) 的技术栈和设计风格，提供现代化的产品展示页面。

## 2. 技术栈

| 层 | 选型 | 说明 |
|---|------|------|
| 框架 | Angular 22 + AnalogJS | SSG 模式，输出纯静态文件 |
| UI | Angular Material 3 | Material You 设计语言 |
| 样式 | Sass + MD3 Design Tokens | 亮/暗/系统主题自适应 |
| 图标 | Material Icons | Google Material 图标库 |
| Markdown | marked + front-matter | 文档/线报内容渲染 |
| 代码检查 | Biome | 格式化和 lint |
| 构建 | Vite | AnalogJS 底层使用 Vite |
| 部署 | 静态文件 → phpStudy/Nginx | `dist/analog/public/` |

## 3. 路由和页面

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | Hero + 特性卡片 + 工具分类展示 + 团队信息 |
| `/download` | 下载页 | APK 下载 + 系统要求 + 应用截图 + 常见问题 |
| `/admire` | 赞赏页 | 收款码 + 赞赏名单 |
| `/tip` | 线报中心 | 线报列表 |
| `/tip/:slug` | 线报详情 | 单篇线报 Markdown 内容 |
| `/docs/privacy` | 隐私政策 | Markdown 渲染 |
| `/docs/terms` | 用户协议 | Markdown 渲染 |

## 4. 组件树

```
App
├── Header (Sticky)
│   ├── Logo
│   ├── DesktopNav（首页/下载/文档下拉/关于下拉）
│   ├── ThemeToggle（亮/暗/系统）
│   ├── SocialLinks（GitHub/QQ群）
│   └── MobileSidebar（移动端抽屉菜单）
├── <router-outlet>
│   ├── HomePage
│   │   ├── HeroSection
│   │   ├── FeatureCards（3个核心卖点卡片）
│   │   ├── ToolCategories（工具分类标签展示）
│   │   ├── TeamSection（团队成员+QQ群）
│   │   └── Footer
│   ├── DownloadPage
│   │   ├── DownloadHero（标题+简介）
│   │   ├── DownloadCard（APK下载按钮+版本号+系统要求）
│   │   ├── ScreenshotGallery（应用截图展示）
│   │   ├── FaqSection（常见问题）
│   │   └── Changelog（更新日志时间线）
│   ├── AdmirePage
│   │   ├── AdmireHero（标题+slogan）
│   │   ├── PayCards（微信/支付宝/QQ 收款码）
│   │   ├── OtherSupport（其他支持方式）
│   │   └── DonorList（赞赏名单：头像+名字+留言）
│   ├── TipListPage
│   │   └── TipCardList（线报卡片列表）
│   ├── TipDetailPage
│   │   └── MarkdownRenderer（线报详情内容）
│   └── DocPage
│       └── MarkdownRenderer（隐私政策/用户协议）
└── Footer
    ├── FooterGrid（项目/文档/社区 链接组）
    └── Copyright
```

## 5. 页面详细设计

### 5.1 首页 (`/`)
- **Hero 区**: 左侧产品名"SatarBox" + tagline "全能工具箱" + 副标题 + "立即下载"和"了解更多"两个按钮；右侧显示 Logo 大图
- **特性卡片**: 3列网格，Material surface-container-low 背景色，hover 上浮效果，每张卡片包含图标+标题+描述
- **工具分类展示**: 保持旧站10大分类的标签卡片布局，Material 风格重做
- **团队信息**: Avatar + 名字 + 角色 + 外部链接，小尺寸

### 5.2 下载页 (`/download`)
- **下载区域**: 居中显示下载按钮（filled button），版本号标注，系统要求说明
- **截图展示**: CSS Grid 响应式画廊，点击可放大预览（dialog）
- **常见问题**: 展开/折叠面板
- **更新日志**: 时间线样式，最新3个版本

### 5.3 赞赏页 (`/admire`)
- **支付卡片**: 3列展示微信/支付宝/QQ 收款码图片，Material Card 包裹
- **赞赏名单**: 头像网格 + 名字 + 可选留言，数据来自静态 JSON 文件 `public/donors.json`

### 5.4 线报中心 (`/tip`, `/tip/:slug`)
- **列表页**: 卡片列表，每条线报显示标题、摘要、日期
- **详情页**: Markdown 内容渲染，支持 front-matter 元数据

### 5.5 文档页 (`/docs/:slug`)
- Markdown 文件驱动（`src/content/docs/*.md`）
- marked 渲染 + 代码高亮
- 不需要侧边栏，单页展示即可

## 6. 数据流

```
public/releases.json   → DownloadPage  (版本信息，手动维护)
public/donors.json     → AdmirePage    (赞赏名单，手动维护)
src/content/tip/*.md   → TipDetailPage (线报内容)
src/content/docs/*.md  → DocPage       (法律文档)
```

所有数据在构建时静态注入，运行时无需 API 请求。

## 7. 主题系统

- 支持3种模式：浅色、深色、跟随系统
- 使用 Angular Material 3 的 Design Token 系统
- 主题切换按钮位于 Header 右侧
- 用户选择存储到 localStorage

## 8. 响应式设计

- **Desktop (≥768px)**: 完整导航栏、3列网格、侧边栏
- **Mobile (<768px)**: 汉堡菜单 + 滑动侧边栏、单列网格、隐藏的部分元素

## 9. SEO（搜索收录 — 核心）

### 9.1 全局基础
| 项目 | 配置 |
|------|------|
| 站点名称 | StarBox - 全能工具箱 |
| 默认描述 | StarBox 是一款涵盖200+实用工具的Android全能工具箱，包含日常工具、影音资源、开发者工具等10大分类 |
| 默认关键词 | StarBox,星盒,工具箱,Android工具箱,安卓工具,影视大全,音乐大全,漫画大全 |
| 站点语言 | zh-CN |
| Canonical | https://istarbox.app |
| robots.txt | 允许所有爬虫，指向 sitemap.xml |

### 9.2 每页独立 SEO（通过 SeoService 注入）

| 页面 | title | description |
|------|-------|-------------|
| 首页 | StarBox - 全能工具箱 | 一站式工具集合，200+实用工具，涵盖日常、影音、开发等10大分类，免费使用 |
| 下载 | 下载 StarBox - 最新版本 v2.3.0 | 下载 StarBox Android 工具箱，支持 Android 7.0+，最新版本免费下载 |
| 赞赏 | 赞赏支持 - StarBox | 支持 StarBox 持续开发，你的每一份支持都是我们前进的动力 |
| 线报中心 | 线报中心 - StarBox | 汇集活动福利、优惠资讯、免费资源等实用线报 |
| 隐私政策 | 隐私政策 - StarBox | StarBox 用户隐私保护说明 |
| 用户协议 | 用户协议 - StarBox | StarBox 用户服务协议 |

### 9.3 Meta 标签标准
每个页面注入以下标签：
```html
<title>{{ pageTitle }}</title>
<meta name="description" content="{{ description }}" />
<meta name="keywords" content="{{ keywords }}" />
<link rel="canonical" href="{{ canonicalUrl }}" />

<!-- Open Graph (Facebook/Telegram/QQ) -->
<meta property="og:type" content="website" />
<meta property="og:title" content="{{ ogTitle }}" />
<meta property="og:description" content="{{ description }}" />
<meta property="og:image" content="https://istarbox.app/logo.png" />
<meta property="og:url" content="{{ canonicalUrl }}" />
<meta property="og:site_name" content="StarBox" />
<meta property="og:locale" content="zh_CN" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{{ ogTitle }}" />
<meta name="twitter:description" content="{{ description }}" />
<meta name="twitter:image" content="https://istarbox.app/logo.png" />

<!-- 百度站长验证 -->
<meta name="baidu-site-verification" content="待申请" />
```

### 9.4 结构化数据（JSON-LD）
首页嵌入 WebSite + SoftwareApplication 结构化数据，帮助搜索引擎理解网站内容：
- `@type: WebSite` — 站点名称、URL、搜索功能
- `@type: SoftwareApplication` — 应用名、操作系统(Android)、下载地址、免费属性

### 9.5 站点地图
- `sitemap.xml` — 构建时通过 vite-plugin-sitemap-ts 自动生成
- 包含所有静态路由的 `<url>` 节点，带 `<lastmod>` 和 `<priority>`
- 提交到 Google Search Console 和百度站长平台

### 9.6 HTML 语义化
- 合理使用 `<h1>` ~ `<h6>` 层级（每页只有一个 h1）
- 图片全部加 `alt` 属性
- 链接使用语义化文本，避免 "点击这里"

### 9.7 性能（Core Web Vitals）
- SSG 静态生成 → 首屏秒开
- 图片使用 WebP 格式（截图等）
- 构建时 CSS 内联关键样式

## 10. 迁移对照

| 旧站文件 | 新站目标 |
|---------|---------|
| `docs/index.md` | `src/app/pages/index.page.ts` (Hero + Features + Tools) |
| `docs/download.md` | `src/app/pages/download.page.ts` |
| `docs/admire.md` | `src/app/pages/admire.page.ts` |
| `docs/Tip/index.md` | `src/app/pages/tip.page.ts` |
| `docs/Tip/*.md` | `src/content/tip/*.md` |
| `docs/privacy.md` | `src/content/docs/privacy.md` |
| `docs/terms.md` | `src/content/docs/terms.md` |
| `public/src/logo.png` | `public/logo.png` |
| `public/src/screenshot/*` | `public/screenshots/*` |
| `public/src/admire/*` | `public/admire/*` |
| `public/src/favicon.ico` | `public/favicon.ico` |
