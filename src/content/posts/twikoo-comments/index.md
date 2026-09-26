---
title: 博客评论系统配置指南
published: 2026-09-26
pinned: false
image: "api"
slug: /twikoo-comments
tags: ["Twikoo", "Vercel", "MongoDB"]
category: Firefly
draft: false
lang: ""
description: "记录一次 Twikoo 评论系统的配置过程，包含 MongoDB Atlas、Vercel 云函数和主题前端设置。"
descriptionSource: manual
---

Firefly 已经提供了评论系统的配置入口，位置在 `src/config/commentConfig.ts`。要用 Twikoo，先把云函数部署好，再把它的地址填进这个文件。

## 先确认评论类型

把 `type` 设为 `twikoo`，其他配置可以按需填写：

```ts
// src/config/commentConfig.ts
export const commentConfig: CommentConfig = {
	// none / twikoo / waline / giscus / disqus / artalk
	type: "twikoo",
};
```

这里的几个值对应主题支持的评论方案。Twikoo、Waline 和 Artalk 需要自己准备后端；Giscus 使用 GitHub Discussions；Disqus 依赖它自己的海外服务。本文只记录 Twikoo 的配置方法。

## 准备 MongoDB 和 Vercel

需要两个服务：MongoDB Atlas 保存评论，Vercel 运行 Twikoo 云函数。两者都有免费方案，个人博客通常够用。

在 MongoDB Atlas 创建免费 M0 集群和数据库用户。创建完成后点击`Connect`，再点击`Drivers`，就能看到连接字符串，复制连接字符串，数据库名可以直接写成 `twikoo`：

```text
mongodb+srv://<用户名>:<密码>@<集群地址>.mongodb.net/twikoo?retryWrites=true&w=majority
```

连接字符串中包含数据库密码，只能放在 Vercel 的环境变量中。不要把它写进仓库或文章配置。

## 在 Vercel 部署 Twikoo

Twikoo 提供了 Vercel 模板。导入 `templates/vercel-min` 后，按下面的顺序设置：

1. 在 Vercel 中用官方模板创建项目。模板会在 GitHub 账号下新建一个仓库，默认是私有仓库。
2. 打开 `Settings → Environment Variables`，新增 `MONGODB_URI`，值填上一步的连接字符串。
3. 打开 `Settings → Deployment Protection`，将 `Vercel Authentication` 设为 `Disabled`。
4. 到 `Deployments` 页面，点击最近一次部署右侧的 `⋯`，选择 `Redeploy`。

第二步保存后需要重新部署，环境变量才会进入新的构建。第三步也要检查一下，否则前端请求会先被 Vercel 登录页拦截。

部署完成后，直接打开项目域名。如果返回下面的 JSON，云函数已经可以响应请求：

```json
{
	"code": 100,
	"message": "Twikoo 云函数运行正常，请参考 https://twikoo.js.org/frontend.html 完成前端的配置",
	"version": "2.0.9"
}
```

## 设置 MongoDB 网络访问

Vercel 函数没有固定的出口 IP，所以 Atlas 的网络访问列表不能只填本机地址。

进入 `Security → Network Access`，添加 `0.0.0.0/0`。这表示允许任意地址发起连接，数据库安全性就取决于用户名和密码。这个免费集群只存博客评论时可以这样配置；如果数据更重要，建议使用固定出口 IP 的部署方式，并定期更换数据库密码。

## 填写主题中的云函数地址

回到 `src/config/commentConfig.ts`，把 `envId` 改成自己的 Vercel 域名。前端脚本和云函数最好使用相同版本：

```ts
twikoo: {
	envId: "https://your-twikoo.vercel.app",
	lang: "zh-CN",
	jsUrl: "https://cdn.jsdelivr.net/npm/twikoo@2.0.9/dist/twikoo.min.js",
	cssUrl: "/assets/css/twikoo-custom.css",
},
```

如果 jsDelivr 在本地访问较慢，可以换成 npm 镜像：

```text
https://registry.npmmirror.com/twikoo/2.0.9/files/dist/twikoo.min.js
```

提交并推送这次修改后，等网站平台完成一次新的构建，再打开带评论的文章检查效果。

## 第一次登录管理面板

打开一篇有评论框的文章，点击评论区右上角的齿轮图标，按页面提示设置管理员密码。管理员密码用于进入管理面板；给访客使用的“暗号”只负责显示隐藏的管理入口，两者不要设成同一个值。

进入面板后，可以审核或删除评论，也可以配置邮件通知和反垃圾选项。

## 常见问题

- **出现 `ERR_BLOCKED_BY_CLIENT`**：通常是浏览器的广告拦截扩展阻止了 `*.vercel.app` 请求，把评论域名加入白名单后再试。
- **评论一直加载**：先单独打开 `envId`，确认能看到“云函数运行正常”。如果可以，再检查 `commentConfig.ts` 中的地址和脚本版本。
- **提示版本不一致**：升级 Twikoo 时，云函数和前端 `jsUrl` 一起修改。
- **国内访问速度慢**：可以给 Vercel 项目绑定自己的子域名，例如 `comments.example.com`，再把这个地址填入 `envId`。

配置完成后，评论数据会写入自己的 MongoDB Atlas 集群。以后更换部署平台时，只要保留数据库连接串并重新部署云函数，评论也能继续使用。
