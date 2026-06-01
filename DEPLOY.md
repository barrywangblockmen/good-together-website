# 台灣共好交流協會官網 — AWS EC2 部署說明

本專案使用 Next.js **`output: "standalone"`**，適合在單台 EC2 上以 **Node.js 20 LTS** 執行，前方以 **Nginx** 反向代理並終止 TLS。

## 1. 本機建置

```bash
npm ci
npm run build
```

建置產物主要包含：

- `.next/standalone/`：可執行的 Node 伺服器與精簡依賴
- `.next/static/`：靜態資源（需複製到 standalone 相對位置，見官方文件）
- `public/`：公開靜態檔

請依 [Next.js Standalone 文件](https://nextjs.org/docs/app/building-your-application/deploying#nodejs-server) 將 `standalone` 目錄與 `static`、`public` 一併部署到伺服器（常見做法是於 CI 打包成 tarball 再上傳）。

## 2. EC2 環境

- **AMI**：Ubuntu 22.04 LTS 或更新版本（範例）
- **Node**：20.x（建議使用 [nvm](https://github.com/nvm-sh/nvm) 或 NodeSource）
- **程序管理**：**PM2** 或 **systemd** 常駐 `node server.js`（路徑以你實際解壓 standalone 為準）
- **Security Group**：開放 `80`、`443`；`22` 建議限制來源 IP

## 3. 環境變數

在伺服器上設定（勿提交至 Git），可置於 systemd `EnvironmentFile` 或 PM2 `ecosystem.config.cjs`：

| 變數 | 說明 |
|------|------|
| `NODE_ENV` | `production` |
| `PORT` | 內部監聽埠，例如 `3000` |
| `NEXT_PUBLIC_SITE_URL` | 正式網址，例如 `https://www.example.org`（建置時寫入 OG/sitemap 等） |
| `SITE_URL` | 與上相同，供伺服器執行期使用（電子報退訂連結等；建議與 `NEXT_PUBLIC_SITE_URL` 一致） |
| `RESEND_API_KEY` | Resend API Key（正式站 `@gtclub.tw` 寄信必備） |
| `MAIL_PROVIDER` | 選填：`resend` 強制 Resend；`smtp` 強制 SMTP；未設時 `@gtclub.tw` 寄件人自動走 Resend |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | SMTP 伺服器設定（本機開發用；正式站 `@gtclub.tw` 請改用 Resend） |
| `SMTP_USER` / `SMTP_PASS` | SMTP 帳密 |
| `FROM_EMAIL` | 寄件地址，正式站建議 `台灣共好交流協會 <newsletter@gtclub.tw>` |
| `NOTIFY_EMAIL` | 通知收件信箱（預設可為 `barrywang.blockmen@gmail.com`） |
| `SUBMISSIONS_FILE` | 表單落地檔案路徑，例如 `/var/www/good-together/data/submissions.jsonl` |
| `SUBSCRIBERS_FILE` | 電子報訂閱名單路徑，例如 `/var/www/good-together/data/subscribers.jsonl` |
| `NEWSLETTER_API_SECRET` | 電子報群發 API 的 Bearer token（供 Cowork 或本機腳本呼叫） |
| `VISIT_NOTIFY_ENABLED` | 選填：`false` 時關閉造訪寄信 |

## 4. Nginx 反向代理（安全強化範例）

```nginx
# /etc/nginx/nginx.conf 內的 http {} 區塊（全站共用）
server_tokens off;

# 基礎逾時設定：降低慢速連線拖住 worker 的風險
client_body_timeout 10s;
client_header_timeout 10s;
keepalive_timeout 15s;
send_timeout 10s;

# 連線數與請求速率限制（以 IP 為單位）
limit_conn_zone $binary_remote_addr zone=perip_conn:10m;
limit_req_zone $binary_remote_addr zone=perip_req:10m rate=10r/s;

server {
    listen 80;
    server_name www.example.org;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.example.org;

    ssl_certificate     /etc/letsencrypt/live/www.example.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.example.org/privkey.pem;

    # 請求大小限制：可阻擋異常大 payload（依需求調整）
    client_max_body_size 1m;

    # 強制瀏覽器長時間使用 HTTPS
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # 活動照片牆一次會載入多張圖，由 Nginx 直接提供靜態檔（不經 limit_req）
    location ^~ /activities/ {
        alias /var/www/good-together/public/activities/;
        access_log off;
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    location / {
        limit_conn perip_conn 20;
        limit_req zone=perip_req burst=20 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 反向代理逾時，避免上游卡住連線
        proxy_connect_timeout 5s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
}
```

TLS 建議使用 **Let’s Encrypt（certbot）**。

> 若目前沒有任何子網域，`Strict-Transport-Security` 使用 `includeSubDomains; preload` 通常可接受；若未來新增子網域且尚未啟用 HTTPS，請先調整此策略再上線。

## 5. PM2 範例

```bash
cd /opt/good-together-website
PORT=3000 NODE_ENV=production pm2 start server.js --name gt-site
pm2 save
pm2 startup
```

`server.js` 為 standalone 目錄內之入口檔名（以實際建置輸出為準）。

## 6. 健康檢查

應用提供 `GET /api/health`，可給負載平衡器或監控使用。

## 7. 表單資料落地檔案

`POST /api/contact` 會將每筆表單 append 到 `SUBMISSIONS_FILE`（JSONL，一行一筆）。

建議先建立資料夾並給執行使用者寫入權限（以 ubuntu + PM2 為例）：

```bash
sudo mkdir -p /var/www/good-together/data
sudo chown -R ubuntu:ubuntu /var/www/good-together/data
```

查看最新資料：

```bash
tail -n 20 /var/www/good-together/data/submissions.jsonl
```

## 7.1 電子報訂閱名單

`POST /api/newsletter/subscribe` 會將訂閱者寫入 `SUBSCRIBERS_FILE`（JSONL，一行一筆）。

建議與表單資料共用同一資料夾：

```bash
sudo mkdir -p /var/www/good-together/data
sudo chown -R ubuntu:ubuntu /var/www/good-together/data
```

查看最新訂閱者：

```bash
tail -n 20 /var/www/good-together/data/subscribers.jsonl
```

## 7.2 Cowork 群發電子報

本地 Claude Cowork 生成 HTML 後，可透過腳本呼叫受保護的 Send API：

```bash
NEWSLETTER_API_SECRET=your-secret \
NEWSLETTER_SITE_URL=https://your-domain.org \
node scripts/send-newsletter.mjs \
  --topic btc-daily \
  --subject "GT BTC 日報 2026-05-29" \
  --html-file ./draft.html \
  --dry-run
```

**主題 id**（`--topic` 必填）：

| id | 說明 |
|----|------|
| `btc-daily` | 比特幣行情日報 |
| `crypto-weekly` | 加密社群週報 |
| `activity-monthly` | 每月活動精彩回顧 |
| `course-monthly` | 每月課程回顧 |
| `tw-stock-weekly` | 台股社群週報 |

確認收件數無誤後，移除 `--dry-run` 正式寄送。`NEWSLETTER_API_SECRET` 需與伺服器環境變數一致，且僅保存在伺服器與 Cowork 本機，勿提交至 Git。

## 8. 寄件網域

`FROM_EMAIL` 必須使用已在 **Resend** 完成 **DNS 驗證** 的網域（例如 `newsletter@gtclub.tw`）。

正式站建議：

```bash
MAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxx
FROM_EMAIL=台灣共好交流協會 <newsletter@gtclub.tw>
```

若已設定 `SMTP_*`，本機開發仍可用 Gmail；但 `@gtclub.tw` 寄件人會自動改走 Resend（需有 `RESEND_API_KEY`）。

## 9. Standalone 建置後必做：複製靜態資源

本專案使用 `output: "standalone"`。每次在伺服器執行 `npm run build` 後，請將建置產物複製到 standalone 目錄，否則可能出現靜態檔 404 或異常：

```bash
cd /var/www/good-together
mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static .next/standalone/public
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
```

接著再 `pm2 restart gt-site --update-env`（建議先 `set -a; source .env.production; set +a` 再重啟，確保環境變數載入）。

## 9.1 活動照片牆（`/activities`）常見問題

### 症狀

- 部分格子顯示灰色「活動照片」占位（不是瀏覽器預設破圖 icon）
- 常見於同一活動的下方兩格，或整張活動卡四格皆空
- 直接開圖片網址有時仍為 HTTP 200

### 原因（依發生順序排查）

| 原因 | 說明 | 處理方式 |
|------|------|----------|
| 檔案未上傳 | `public/activities/<活動資料夾>/` 缺少 `01.jpg`～`04.jpg` | 依 `public/activities/README.md` 放置後執行 `npm run photos:prepare` |
| Next.js 圖片品質 | Next.js 16 的 `/_next/image` 只接受 `next.config.ts` 內 `images.qualities` 列出的值（目前為 `75`），其他值會 **400** | 元件使用 `quality={75}`，勿自訂 72、65 等 |
| `/_next/image` 並行逾時 | 活動頁一次載入約 36 張，即時壓縮易造成間歇失敗 | 活動圖改 **直接讀** `/activities/.../*.jpg`（`ActivityPhoto` 元件，`unoptimized` / 原生 `<img>`） |
| **Nginx 限流 503** | 全站 `limit_req`（10r/s）套在 `location /` 時，大量圖片請求經 Node 轉發會被 **503**；前端 `onError` 會顯示占位 | 見下方 Nginx 設定：`/activities/` 由 Nginx **alias 靜態檔**，且 **`limit_req` / `limit_conn` 只放在 `location /`** |

正式站 `gtclub.tw`（2026-06-01）已套用：`location ^~ /activities/` + 限流僅限 API 代理。範例片段見 [`deploy/nginx-gtclub-static.conf.snippet`](./deploy/nginx-gtclub-static.conf.snippet)。

### 上傳與壓縮流程

```bash
# 新照片：任意檔名放入各活動資料夾後
npm run photos:prepare

# 刪除轉檔前的原始檔
npm run photos:prepare -- --cleanup

# 已有 01~04.jpg 需重新壓縮（過大或異常）
npm run photos:prepare -- --recompress
```

建議檔名：`01.jpg`～`04.jpg`（`photos:prepare` 會壓成最長邊 1800px、JPEG quality 75）。

### 部署後檢查

```bash
# 單張應為 200，且由 nginx 直接回傳（有 Cache-Control / expires）
curl -sI https://gtclub.tw/activities/20260312-chiayi-lantern/01.jpg

# 並行多張不應出現 503（修正限流後）
for i in $(seq 1 20); do curl -sL -o /dev/null -w "%{http_code} " \
  "https://gtclub.tw/activities/20260312-chiayi-lantern/01.jpg" & done; wait; echo
```

若占位仍出現：硬重新整理（Cmd+Shift+R），確認 `public/activities` 已複製到 standalone（見上一節 §9）。

## 10. HTTPS（Let’s Encrypt + Certbot + Nginx）

1. **DNS**：將 `A`（與選用的 `www`）指向 EC2 公網 IP；**Security Group** 需開放 `80`、`443`。
2. **Nginx `server_name`**：在 `sites-available` 的站台設定中，將 `server_name` 改為你的網域（例如 `gtclub.tw www.gtclub.tw`），`nginx -t` 後 `reload`。
3. **申請憑證**（首次）：

```bash
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d gtclub.tw -d www.gtclub.tw --redirect \
  --non-interactive --agree-tos -m your-email@example.com
```

Certbot 會自動寫入 `listen 443 ssl`、憑證路徑，並將 HTTP 導向 HTTPS。系統內建的 `certbot.timer` 會負責續期。

4. **站台網址**：將 `.env.production` 的 `NEXT_PUBLIC_SITE_URL` 設為 `https://你的網域`，再重新 `npm run build`（公開網址會寫入建置產物），並依上一節複製 `static`／`public` 後重啟 PM2。
