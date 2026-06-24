import { DOCUMENT } from "@angular/common";
import { Injectable, inject } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { SEO_CONFIG } from "./seo.config";

interface SeoMeta {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  image?: string;
  keywords?: string;
  structuredData?: Record<string, unknown>;
}

@Injectable({ providedIn: "root" })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private canonicalLink?: HTMLLinkElement;
  private structuredDataScript?: HTMLScriptElement;

  setHome() {
    this.setMeta({
      title: SEO_CONFIG.defaultTitle,
      description: SEO_CONFIG.defaultDescription,
      path: "/",
      structuredData: {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "星盒 StarBox",
        url: `${SEO_CONFIG.siteUrl}/`,
        applicationCategory: "UtilityApplication",
        operatingSystem: "Android",
        description: SEO_CONFIG.defaultDescription,
        image: this.absoluteUrl(SEO_CONFIG.defaultImage),
        author: {
          "@type": "Person",
          name: "Xiao Yang",
          url: "https://github.com/1240444767",
        },
        downloadUrl: `${SEO_CONFIG.siteUrl}/download`,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "CNY",
        },
      },
    });
  }

  setDownload() {
    this.setMeta({
      title: "下载星盒 - 星盒 StarBox",
      description:
        "下载星盒 StarBox Android 工具箱最新版本，支持 Android 7.0+，APK免费下载",
      path: "/download",
      keywords: `下载星盒,StarBox下载,${SEO_CONFIG.keywords}`,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "星盒 StarBox",
        url: `${SEO_CONFIG.siteUrl}/download`,
        applicationCategory: "UtilityApplication",
        operatingSystem: "Android",
        description: "下载星盒 StarBox Android 工具箱最新版本",
        image: this.absoluteUrl(SEO_CONFIG.defaultImage),
        author: {
          "@type": "Person",
          name: "Xiao Yang",
          url: "https://github.com/1240444767",
        },
        downloadUrl: `${SEO_CONFIG.siteUrl}/download`,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "CNY",
        },
      },
    });
  }

  setAdmire() {
    this.setMeta({
      title: "赞赏支持 - 星盒 StarBox",
      description: "支持星盒持续开发，你的每一份赞赏都是我们前进的动力",
      path: "/admire",
      keywords: `赞赏星盒,支持星盒,${SEO_CONFIG.keywords}`,
    });
  }

  setTip() {
    this.setMeta({
      title: "线报中心 - 星盒 StarBox",
      description: "汇集活动福利、优惠资讯、免费资源等实用线报，第一时间获取有价值的线报",
      path: "/tip",
      keywords: `线报,福利,优惠,${SEO_CONFIG.keywords}`,
    });
  }

  setPrivacy() {
    this.setMeta({
      title: "隐私政策 - 星盒 StarBox",
      description: "星盒用户隐私保护说明，了解我们如何保护你的个人信息",
      path: "/docs/privacy",
      keywords: "隐私政策,星盒隐私",
    });
  }

  setTerms() {
    this.setMeta({
      title: "用户协议 - 星盒 StarBox",
      description: "星盒用户服务协议，使用星盒前请仔细阅读",
      path: "/docs/terms",
      keywords: "用户协议,星盒协议",
    });
  }

  private setMeta({
    title,
    description,
    path,
    type = "website",
    image = SEO_CONFIG.defaultImage,
    keywords = SEO_CONFIG.keywords,
    structuredData,
  }: SeoMeta) {
    const url = this.absoluteUrl(path);
    const imageUrl = this.absoluteUrl(image);

    this.title.setTitle(title);
    this.meta.updateTag({ name: "description", content: description });
    this.meta.updateTag({ name: "keywords", content: keywords });
    this.meta.updateTag({ name: "robots", content: "index, follow" });
    this.meta.updateTag({ name: "application-name", content: SEO_CONFIG.siteName });
    this.meta.updateTag({ property: "og:type", content: type });
    this.meta.updateTag({ property: "og:locale", content: SEO_CONFIG.locale });
    this.meta.updateTag({ property: "og:site_name", content: SEO_CONFIG.siteName });
    this.meta.updateTag({ property: "og:title", content: title });
    this.meta.updateTag({ property: "og:description", content: description });
    this.meta.updateTag({ property: "og:url", content: url });
    this.meta.updateTag({ property: "og:image", content: imageUrl });
    this.meta.updateTag({ name: "twitter:card", content: "summary" });
    this.meta.updateTag({ name: "twitter:title", content: title });
    this.meta.updateTag({ name: "twitter:description", content: description });
    this.meta.updateTag({ name: "twitter:image", content: imageUrl });
    this.updateCanonical(url);
    this.updateStructuredData(structuredData);
  }

  private updateCanonical(url: string) {
    this.canonicalLink ??=
      this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]') ??
      this.document.createElement("link");
    this.canonicalLink.setAttribute("rel", "canonical");
    this.canonicalLink.setAttribute("href", url);
    if (!this.canonicalLink.parentNode) {
      this.document.head.appendChild(this.canonicalLink);
    }
  }

  private updateStructuredData(data?: Record<string, unknown>) {
    if (!data) {
      this.structuredDataScript?.remove();
      this.structuredDataScript = undefined;
      return;
    }

    this.structuredDataScript ??=
      this.document.head.querySelector<HTMLScriptElement>(
        'script[type="application/ld+json"]',
      ) ?? this.document.createElement("script");
    this.structuredDataScript.type = "application/ld+json";
    this.structuredDataScript.textContent = JSON.stringify(data);
    if (!this.structuredDataScript.parentNode) {
      this.document.head.appendChild(this.structuredDataScript);
    }
  }

  private absoluteUrl(path: string) {
    if (/^https?:\/\//.test(path)) return path;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return normalizedPath === "/"
      ? `${SEO_CONFIG.siteUrl}/`
      : `${SEO_CONFIG.siteUrl}${normalizedPath}`;
  }
}
