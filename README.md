# 东禾官网

这是东禾官网前端项目，包含首页、作品列表、作品详情、荣誉奖项、报价单和内容管理后台。工作室日常维护主要通过后台完成，不需要改代码。

## 工作室使用入口

- 官网首页：`/#/`
- 作品列表：`/#/works`
- 内容后台：`/#/manager`
- 报价管理：`/#/manager/quotes`

后台支持：

- 新增、编辑、隐藏、删除作品
- 按空间类型和设计风格管理、筛选作品
- 多图上传，第一张自动作为封面
- 新增、编辑、隐藏、删除荣誉奖项
- 管理员邮箱登录
- 图片上传到 Supabase 云端图库
- 创建、编辑和归档客户报价单
- 生成客户专属查看链接，并支持浏览器打印或另存 PDF

## 上线前必须完成

1. 创建 Supabase 项目。
2. 在 Supabase SQL Editor 中先运行 `supabase-design-cases.sql`。
3. 如需导入现有演示内容，再运行 `supabase-seed-static-content.sql`。
4. 在 Supabase Authentication 中创建后台登录账号。
5. 在 `supabase-design-cases.sql` 里把管理员邮箱改成工作室实际邮箱，或在 `design_admins` 表里新增管理员邮箱。
6. 在部署平台配置环境变量。

已有 Supabase 项目在发布报价单功能前，也需要再运行一次 `supabase-design-cases.sql`。脚本会补充报价表、访问权限和客户查看方法，不会删除现有作品、图片、报价或管理员数据。

## 环境变量

参考 `.env.example`：

```env
VUE_APP_SUPABASE_URL=https://your-project.supabase.co
VUE_APP_SUPABASE_ANON_KEY=your-anon-key
VUE_APP_SUPABASE_CASES_TABLE=design_cases
VUE_APP_SUPABASE_AWARDS_TABLE=design_awards
VUE_APP_SUPABASE_QUOTES_TABLE=design_quotes
VUE_APP_SUPABASE_CASE_IMAGES_BUCKET=case-images
```

如果没有配置 Supabase，后台会退回到“本地浏览器模式”。这个模式只适合临时预览，不适合工作室多人长期使用。

## 图片上传建议

- 支持 JPG、PNG、WebP、GIF。
- 原始照片请保留在本地硬盘或工作室归档盘；上传到官网的是展示版本，不建议当作原片备份。
- 作品图会自动处理为最长边约 1920px、单张约 1.5MB 以内的展示图；首张还会生成一张轻量封面，用于首页和项目索引。
- 单张原图请控制在 25MB 以下。GIF 会保留动画效果，但需要先压缩到 9MB 以下。
- 作品的第一张图片为封面来源，也可以在后台调整封面顺序。
- 保存替换、移除图片或删除作品后，系统会自动清理未被其他内容引用的云端旧文件。
- 如图片存放在外部对象存储或 CDN，可在上传区域粘贴公开的 `http` 或 `https` 图片直链；外部链接不会占用 Supabase 图库空间，也不会被系统删除。
- 外部图片地址必须长期有效、允许官网直接访问。不要使用需要登录、会过期或限制外链的网盘分享地址。

## 日常维护流程

1. 打开 `/#/manager`。
2. 使用管理员邮箱和密码登录。
3. 进入“作品管理”或“荣誉奖项”。
4. 选择图片并填写内容。
5. 保存后刷新官网前台确认展示效果。
6. 不想公开的内容用“隐藏”，确认不用后再删除。

## 报价单流程

1. 打开 `/#/manager/quotes`，新建报价并填写客户、项目和报价明细。
2. 保存后点击“复制链接”。草稿会自动调整为“已发送”，客户链接随即生效。
3. 将链接发给客户。客户只能查看这份报价，无法进入后台或查看其他报价。
4. 客户可点击“打印 / 存为 PDF”留档；报价确认后，管理员可将状态改为“已确认”。

## 本地开发

```bash
npm install
npm run serve
```

打包上线：

```bash
npm run build
```

代码检查：

```bash
npm run lint
```

自动化测试：

```bash
npm test
```

## GitHub Pages 部署

项目已包含 `.github/workflows/pages.yml`。推送到 `main` 或 `master` 后会自动打包并发布。

自定义域名必须在 GitHub Pages 设置中启用 `Enforce HTTPS`。后台登录和客户报价包含敏感信息，不应通过 HTTP 使用。

需要在 GitHub 仓库的 Secrets 中配置：

- `VUE_APP_SUPABASE_URL`
- `VUE_APP_SUPABASE_ANON_KEY`

其他表名和图库名默认使用项目内配置。
