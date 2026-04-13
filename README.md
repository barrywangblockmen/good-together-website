# 台灣共好交流協會（GT 俱樂部）官網

Next.js（App Router）+ TypeScript + Tailwind CSS v4。含明暗主題、表單與造訪通知（Resend）、AWS EC2 standalone 部署說明。

## 開發

```bash
cp .env.example .env.local
# 填入 RESEND_API_KEY、FROM_EMAIL 等

npm install
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)。

## 建置

```bash
npm run build
npm start
```

正式環境請設定 `NEXT_PUBLIC_SITE_URL`（建置與執行階段皆建議與實際網域一致），以利 canonical、OG 與 sitemap。

## 部署

請見 [DEPLOY.md](./DEPLOY.md)。

## 環境變數

請見 [.env.example](./.env.example)。
