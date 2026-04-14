# 台灣共好協會官網（Good Together Website）

本專案是台灣共好協會的官方網站，採用現代化單頁體驗與動畫設計，提供協會介紹、主題課程、成果展示與加入申請表單，並整合寄信通知與伺服器本機資料落地。

## 專案目標與完成範圍

- 建立具品牌一致性的現代官網（藍綠與莫蘭迪色系、明暗模式、互動與動效）
- 提供對外唯一聯絡入口（表單），避免公開個資聯絡方式
- 表單送出後：
  - 寫入 EC2 本機 JSONL 檔案（`SUBMISSIONS_FILE`）
  - 寄送 Email 通知管理者
- 網站造訪可觸發 Email 通知（可開關），並含：
  - IP 基礎資訊
  - 大略地理位置（Geo lookup）
  - Bot 可能性判斷
- 完成 AWS EC2（Next standalone + PM2 + Nginx）部署流程

## 技術棧

- `Next.js 16`（App Router）
- `React 19` + `TypeScript`
- `Tailwind CSS v4`
- `framer-motion`（頁面 reveal / 動畫）
- `react-hook-form` + `zod`（表單驗證）
- `nodemailer`（SMTP 寄信，優先）
- `resend`（備援寄信）
- `PM2` + `Nginx`（正式環境）

## 主要功能

- `首頁`：主視覺、協會價值主張、CTA 區塊
- `關於協會`：願景使命、章程摘要、發展歷程（2026）
- `主題與課程`：AI / Web3 / 永續主題卡與內容
- `成果展示`：重點計畫展示（含 AI 會計、AI 會議整合）
- `聯絡表單`：
  - 基本欄位驗證
  - honeypot 防垃圾
  - 基本 rate limit
  - 寫入 `submissions.jsonl`
  - Email 通知
- `造訪通知`：
  - 可由 `VISIT_NOTIFY_ENABLED` 開關
  - 包含 UA、來源、IP、地理資訊與 bot 判斷
  - 通知主旨格式：`[GT協會] <訪客IP> <地理位置>`

## API 一覽

- `POST /api/contact`
  - 驗證並接收表單
  - append 一筆 JSON 到 `SUBMISSIONS_FILE`
  - 發送通知 Email
- `POST /api/visit`
  - 站點造訪通知（可關閉）
  - 提供風險與統計所需技術資訊
- `GET /api/health`
  - 健康檢查 endpoint

## 本機開發

```bash
cp .env.example .env.local
npm install
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)。

## 建置與啟動

```bash
npm run build
npm run start
```

## 環境變數（重點）

完整清單見 [.env.example](./.env.example)。

- `NEXT_PUBLIC_SITE_URL`：網站對外網址
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE`
- `SMTP_USER` / `SMTP_PASS`（Gmail 建議使用 App Password，16 碼）
- `FROM_EMAIL`：寄件者
- `NOTIFY_EMAIL`：通知收件者
- `SUBMISSIONS_FILE`：表單落地檔案（JSONL）
- `VISIT_NOTIFY_ENABLED`：是否啟用造訪通知
- `RESEND_API_KEY`：SMTP 不可用時的備援通道

## 部署現況（EC2）

目前正式部署模式：

- Next.js `standalone` 輸出
- Ubuntu EC2 上以 `pm2` 常駐執行 `gt-site`
- `nginx` 反向代理到 `127.0.0.1:3000`
- 網域：`gtclub.tw`（含 `www.gtclub.tw`）
- HTTPS：Let’s Encrypt（Certbot）已啟用，自動續期
- 表單資料存放於：
  - `/var/www/good-together/data/submissions.jsonl`

部署步驟與範本請見 [DEPLOY.md](./DEPLOY.md)。

## 一鍵部署（本機執行）

已提供 `./deploy.sh`，會自動完成：

- 同步專案檔案到 EC2（排除 `.git`、`.next`、`node_modules`、`.env.local`、`*.pem`）
- 遠端 `npm ci` + `npm run build`
- 複製 `.next/static`、`public` 到 `.next/standalone`
- `pm2 restart gt-site --update-env`（若不存在則自動 start）

使用方式：

```bash
./deploy.sh
```

可覆寫參數（不改腳本）：

```bash
SSH_KEY_PATH=... SSH_USER=ubuntu SSH_HOST=... REMOTE_APP_DIR=/var/www/good-together PM2_APP_NAME=gt-site APP_PORT=3000 ./deploy.sh
```

## 已處理的重要問題紀錄

- 修正主題切換按鈕 hydration mismatch
- 造訪通知加入地理位置與 bot 偵測
- 地理位置查詢改為多來源 fallback（`ipwho.is` 失敗時轉查 `ipapi.co`）
- 補強訪客 IP 解析（支援 Cloudflare/Vercel/Nginx 常見 header，並正規化 IP 格式）
- 改為 SMTP 優先寄信，Resend 作備援
- 表單改為本機 JSONL 落地，降低初期維運成本
- 修正 EC2 資源不足（含 swap）與 Nginx 代理設定問題
- 修正 PM2 環境變數載入問題（更新 `.env.production` 後需 `--update-env`）
- 完成網域 HTTPS 化（`gtclub.tw` / `www.gtclub.tw`）與 HTTP 自動轉址
- 補上 standalone 靜態資源複製流程，避免 `.next/static` 缺失造成 404/502

## 維運建議

- 修改 `.env.production` 後，務必重啟並更新環境變數
- 每次 `npm run build` 後，務必同步 `static/public` 到 `.next/standalone`（詳見 `DEPLOY.md`）
- 定期備份 `submissions.jsonl`
- 定期檢查憑證續期：`systemctl status certbot.timer`
- 若收到「大概位置：未知」，通常為第三方地理 API 暫時失敗，系統已有 fallback
- 若通知信未收到，優先檢查：
  - SMTP 帳密與 App Password 格式
  - PM2 實際載入的 env
  - `/api/contact` 回應是否為 `{"ok":true}`

## 授權與用途

本專案為台灣共好協會網站建置用途，可依協會實際營運需求持續擴充（會員系統、後台、資料分析、課程管理等）。
