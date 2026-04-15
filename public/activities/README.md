活動照片請依照下列資料夾放置，每個活動建議先放 4 張：

- `20260401-badminton`（羽你同行）
- `20260402-boardgame`（桌遊）
- `20260320-0321-hualien-run`（花蓮太平洋路跑）
- `20260312-chiayi-lantern`（嘉義燈會）
- `20260224-chimei-museum`（奇美博物館）
- `cnc-event`（C&C 活動）
- `20260129-30-year-end-party`（尾牙）
- `20260120-weiwuying-tour`（衛武營導覽）

建議檔名（方便後續統一串接）：

- `01.jpg`
- `02.jpg`
- `03.jpg`
- `04.jpg`

你可以改用 png/webp，但維持 01~04 的編號會最方便。

如果你先放的是任意檔名（含 jpg/JPG/jpeg/HEIC 等），可在專案根目錄執行：

- `npm run photos:prepare`

會自動把每個活動前 4 張圖片壓縮並輸出成 `01.jpg` ~ `04.jpg`。
若要在轉檔後刪除原始檔，可執行：

- `npm run photos:prepare -- --cleanup`
