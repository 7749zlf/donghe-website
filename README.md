# 东禾官网

这是东禾官网前端项目，包含首页、作品列表、作品详情、荣誉奖项和内容管理后台。工作室日常维护主要通过后台完成，不需要改代码。

## 工作室使用入口

- 官网首页：`/#/`
- 作品列表：`/#/works`
- 内容后台：`/#/manager`

后台支持：

- 新增、编辑、隐藏、删除作品
- 多图上传，第一张自动作为封面
- 新增、编辑、隐藏、删除荣誉奖项
- 管理员邮箱登录
- 图片上传到 Supabase 云端图库

## 上线前必须完成

1. 创建 Supabase 项目。
2. 在 Supabase SQL Editor 中先运行 `supabase-design-cases.sql`。
3. 如需导入现有演示内容，再运行 `supabase-seed-static-content.sql`。
4. 在 Supabase Authentication 中创建后台登录账号。
5. 在 `supabase-design-cases.sql` 里把管理员邮箱改成工作室实际邮箱，或在 `design_admins` 表里新增管理员邮箱。
6. 在部署平台配置环境变量。

## 环境变量

参考 `.env.example`：

```env
VUE_APP_SUPABASE_URL=https://your-project.supabase.co
VUE_APP_SUPABASE_ANON_KEY=your-anon-key
VUE_APP_SUPABASE_CASES_TABLE=design_cases
VUE_APP_SUPABASE_AWARDS_TABLE=design_awards
VUE_APP_SUPABASE_CASE_IMAGES_BUCKET=case-images
```

如果没有配置 Supabase，后台会退回到“本地浏览器模式”。这个模式只适合临时预览，不适合工作室多人长期使用。

## 图片上传建议

- 支持 JPG、PNG、WebP、GIF。
- 系统会自动压缩较大的 JPG、PNG、WebP，减少上传失败和页面加载压力。
- Supabase 当前限制单张图片不超过 10MB，建议上传前控制在 3MB 到 8MB。
- 作品图建议宽边 2400px 左右，奖项证书建议保证文字清晰。
- 作品的第一张图片会作为封面，也可以在后台调整封面顺序。

## 日常维护流程

1. 打开 `/#/manager`。
2. 使用管理员邮箱和密码登录。
3. 进入“作品管理”或“荣誉奖项”。
4. 选择图片并填写内容。
5. 保存后刷新官网前台确认展示效果。
6. 不想公开的内容用“隐藏”，确认不用后再删除。

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

## GitHub Pages 部署

项目已包含 `.github/workflows/pages.yml`。推送到 `main` 或 `master` 后会自动打包并发布。

需要在 GitHub 仓库的 Secrets 中配置：

- `VUE_APP_SUPABASE_URL`
- `VUE_APP_SUPABASE_ANON_KEY`

其他表名和图库名默认使用项目内配置。
