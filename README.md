# QwenFace｜随身造型师

一个支持多提供商的 AI 画像生成与编辑应用（默认 Google GenAI，已适配 Qwen 接口），支持“文生图 / 图生图”两种模式。通过细粒度可视化参数（性别/年龄/种族、面部与发型、服饰、环境、风格、摄影参数等）组合提示词生成高质量写实人像；也可以上传照片并在“保留人物身份”的前提下进行精修与小改动。内置历史记录、对比查看、强制水印、深浅色主题与中英文界面切换。

## 主要特性

- 文生图（Text-to-Image）与图生图（Image-to-Image）双模式
- 细粒度参数面板：
  - 角色：性别、年龄、种族、表情、眼部/面部/耳部细节、发型/发色、胡子、脸型等
  - 风格：艺术风格、画面风格、色彩、光线等
  - 环境：室内/室外、背景、场景元素、季节/天气等
  - 摄影：镜头类型、焦距、光圈、快门、ISO、白平衡、对焦模式等
- “随机选择（Lucky Choice）”一键灵感生成
- 补充提示词输入框，方便加入个性化描述
- 历史记录：自动保存生成结果，点击可一键恢复当时的所有设置
- 对比查看：
  - 移动端：滑块式前后对比
  - 桌面端：并排双栏对比
- 一键下载生成图，自动添加“QWenFace | ALEXLUO”水印（强制）
- 深色/浅色主题切换，界面中英文一键切换

## 快速开始

前置依赖：Node.js 18+

- 安装依赖：
  - 使用 npm：`npm install`
  - 或使用 pnpm：`pnpm install`
- 配置环境变量：在项目根目录创建 `.env.local`
  - Google（默认回退）：`GEMINI_API_KEY=你的Google_GenAI_API_Key`
  - 切换到 Qwen 接口：
    - `IMAGE_PROVIDER=qwen`
    - `QWEN_IMAGE_API_GENERATE=https://api.qwenface.example.com/v1/generate-image`
    - `QWEN_IMAGE_API_EDIT=https://api.qwenface.example.com/v1/edit-image`
    - 可选鉴权：`QWEN_API_KEY=你的_api_key`（设置后将自动携带 `Authorization: Bearer`）
- 启动开发环境：`npm run dev`
- 生产构建：`npm run build`
- 本地预览构建产物：`npm run preview`

提示：本项目使用 Vite。
- 构建时注入：`GEMINI_API_KEY`、`IMAGE_PROVIDER`、`QWEN_IMAGE_API_*`、`QWEN_API_KEY` 等环境变量。
- 本地（dev/preview）内置图片代理 `/api/image-proxy` 以规避直链 CORS；生产需自行提供同等代理能力。

## 使用说明

1) 选择模式：
- 文生图：通过“自定义面板”选择角色/风格/环境/摄影等参数，可选填“补充提示词”，点击“生成”。
- 图生图：上传原图后，选择希望修改的项（仅对所选内容做改动），点击“生成”。若未选择任何改动，将进行轻度质量增强并严格保留人物身份。

2) 查看与对比：
- 文生图：直接显示生成结果，可下载。
- 图生图：移动端可用滑块对比原图与生成图；桌面端并排显示，可下载，且可移除原图重新上传。

3) 历史与恢复：
- 每次生成都会入库到右侧“历史记录”。点击某条历史即可恢复当时的模式、参数与（若有）原图。

4) 国际化与主题：
- 右上角可切换中/英文与深/浅色主题。

## 技术栈与架构

- 技术栈：React 19、Vite 6、TypeScript、Tailwind（CDN 方式）、@google/genai（默认回退）、自定义 Qwen API
- 模型 / 提供商：
  - Google（回退）：文生图 `imagen-4.0-generate-001`；图生图 `gemini-2.5-flash-image-preview`
  - Qwen（新）：通过你方 HTTP API（`/v1/generate-image`、`/v1/edit-image`），返回临时图片 URL；前端转 PNG Base64 后继续流水线
- 目录与职责：
  - `App.tsx`：应用状态与主流程（模式切换、提示词拼装、调用服务、历史记录等）
  - `components/`：UI 组件（参数面板、图片查看/对比、上传器、历史面板、设置栏、模式切换等）
  - `services/geminiService.ts`：服务提供商总入口（基于 `IMAGE_PROVIDER` 切换 Google/Qwen）
  - `utils/imageUtils.ts`：文件转 Base64、水印叠加（强制“QWenFace | ALEXLUO”）
  - `utils/imageFetch.ts`：图片直链转 PNG Base64（本地经 `/api/image-proxy` 代理）
  - `constants.ts`：参数面板所有枚举项
  - `types.ts`：类型定义（语言、主题、模式、历史项等）
  - `vite.config.ts`：环境变量注入、路径别名、图片代理中间件

文件参考（关键实现位置）：
- `App.tsx:1`、`components/ControlPanel.tsx:1`
- `components/ImageViewer.tsx:1`、`components/ImageComparator.tsx:1`
- `components/ImageUploader.tsx:1`、`components/HistoryPanel.tsx:1`
- `services/geminiService.ts:1`
- `utils/imageUtils.ts:1`
- `constants.ts:1`、`types.ts:1`
- `vite.config.ts:1`

## 提示词与生成策略（概要）

- 文生图：
  - 将“角色/环境/风格/摄影参数”等模块化组合成自然语言段落，并追加质量增强关键词（如 8k/UHD/photorealistic 等）。
  - 仅使用英文提示词与模型交互，以提高可控性与稳定性。
- 图生图：
  - 严格要求“保留人物身份与五官结构”，仅应用用户勾选的改动项；若仅做轻度增强，禁止模型进行创作性改动。
  - 为减少身份漂移，图生图模式下会禁用“皮肤细节/纹理”相关选项（在 UI 中自动禁用）。
  - Qwen 尺寸档位（自动匹配最近尺寸）：
    - `1328x1328`(1:1)、`1664x928`(16:9)、`928x1664`(9:16)、`1472x1140`(4:3)、`1140x1472`(3:4)、`1584x1056`(3:2)、`1056x1584`(2:3)
  - 默认参数：`num_inference_steps=50`、`cfg=4.0`、`guidance_scale=7.5`；`seed` 可选且会记录到历史（不在 UI 展示）
  - 负向提示词 `negative_prompt`：UI 不暴露，若为空则不传该字段

## 环境变量与安全说明

- Google 回退：需要 `GEMINI_API_KEY`。
- Qwen：可选 `QWEN_API_KEY`（将自动加到 Authorization 头）。
- 当前为前端直连厂商 API + 本地图片代理；仅供开发/内网或受控环境使用。
- 生产部署建议：
  - 为图片直链提供同等代理（参考 `vite.config.ts` 中的 `/api/image-proxy`）。
  - 如需隐藏 API Key，建议通过后端代理中转 API 请求。

## 脚本命令

- 开发：`npm run dev`
- 构建：`npm run build`
- 预览：`npm run preview`

## 常见问题（FAQ）

- 模型返回了文本而非图片？
  - 图生图模式下若触发安全策略或模型不返回图片，应用会提示“模型返回文本/未返回图像”，请调整改动项或提示词。
- 一直生成失败？
  - 请检查 `GEMINI_API_KEY` 是否有效、配额是否充足、网络是否可用。
- 能否去除或修改水印？
  - 代码强制添加水印。可在 `utils/imageUtils.ts` 中调整，但默认行为为强制启用。

- 图片加载跨域（CORS）失败？
  - 开发/预览环境已通过本地 `/api/image-proxy` 代理规避。
  - 生产需提供等价代理；否则浏览器可能无法直接拉取第三方图片直链。