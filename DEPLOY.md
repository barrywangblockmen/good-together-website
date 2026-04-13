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
| `NEXT_PUBLIC_SITE_URL` | 正式網址，例如 `https://www.example.org` |
| `RESEND_API_KEY` | Resend API Key |
| `FROM_EMAIL` | 已在 Resend 驗證網域之寄件地址 |
| `NOTIFY_EMAIL` | 通知收件信箱（預設可為 `barrywang.blockmen@gmail.com`） |
| `SUBMISSIONS_FILE` | 表單落地檔案路徑，例如 `/var/www/good-together/data/submissions.jsonl` |
| `VISIT_NOTIFY_ENABLED` | 選填：`false` 時關閉造訪寄信 |

## 4. Nginx 反向代理（範例）

```nginx
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

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

TLS 建議使用 **Let’s Encrypt（certbot）**。

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

## 8. 寄件網域

`FROM_EMAIL` 必須使用已在 **Resend**（或其他 ESP）完成 **DNS 驗證** 的網域，與網站託管於 EC2 或他處無關。
