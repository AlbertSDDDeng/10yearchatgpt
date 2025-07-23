# 我的人生藍圖 (Life Blueprint)

這是一個使用 Vue.js 3 和 Tailwind CSS 打造的互動式人生規劃工具。它能引導使用者設定十年、五年及一年的目標，並以視覺化的方式分配時間與精力。

這個專案被設計成一個純前端的靜態網站，所有資料都儲存在使用者的瀏覽器中，無需後端或資料庫。

## ✨ 專案特色

- **引導式流程**: 分為十年、五年、一年三個階段，層層遞進。
- **互動式操作**: 透過拖曳排序目標，使用滑桿分配精力。
- **精美 UI**: 使用 Tailwind CSS 打造現代化、美觀且響應式的介面。
- **零後端**: 純靜態網站，易於部署，所有資料都在本地處理。
- **一鍵部署**: 完整支援 GitHub Pages，輕鬆發布您的網站。

---

## 🚀 如何在本機預覽與開發

在將專案部署到網路上之前，您可以在自己的電腦上先運行起來，進行預覽或修改。

### **前置需求**

請確保您的電腦已安裝 [Node.js](https://nodejs.org/ ) (建議選擇 LTS 版本)。安裝 Node.js 會同時安裝 `npm`，這是我們需要的套件管理工具。

您可以打開終端機（在 Windows 上是 `Command Prompt` 或 `PowerShell`，在 Mac 上是 `Terminal`）輸入以下指令來檢查：

```bash
node -v
npm -v
```

如果能看到版本號，代表您已準備就緒。

### **安裝與啟動**

1.  **進入專案目錄**:
    打開終-端機，使用 `cd` 指令進入您解壓縮後的 `life-blueprint-project` 資料夾。

    ```bash
    cd path/to/your/life-blueprint-project
    ```

2.  **安裝專案依賴**:
    這個指令會讀取 `package.json` 檔案，並自動下載所有專案需要的套件。

    ```bash
    npm install
    ```

3.  **啟動開發伺服器**:
    這個指令會啟動一個本地的伺服器，讓您可以即時預覽網站。

    ```bash
    npm run dev
    ```

4.  **開啟瀏覽器**:
    終端機將會顯示一個本地網址，通常是 `http://localhost:5173` 。將此網址複製到您的瀏覽器中，就可以看到運作中的網站了！在開發模式下，您對程式碼的任何修改都會即時反應在瀏覽器上。

---

## 🌐 如何部署到 GitHub Pages

跟著以下步驟，您可以將這個專案發布成一個**公開的網站**，讓任何人都可以透過連結瀏覽。

### **步驟 1: 建立 GitHub 倉庫 (Repository)**

1.  登入您的 [GitHub](https://github.com/ ) 帳號。
2.  點擊右上角的 `+` 號，選擇 `New repository`。
3.  為您的倉庫命名，例如 `life-blueprint`。
4.  確保倉庫是 `Public` (公開的)。
5.  點擊 `Create repository`。

### **步驟 2: 上傳您的專案檔案**

1.  在您剛剛建立的 GitHub 倉庫頁面，點擊 `uploading an existing file`。
2.  將您電腦上 `life-blueprint-project` 資料夾中的**所有檔案和資料夾**拖曳到上傳區域。
3.  在下方的 `Commit changes` 區域，輸入一段描述 (例如 "Initial commit")，然後點擊 `Commit changes` 按鈕。

### **步驟 3: 設定 GitHub Pages**

1.  在您的 GitHub 倉庫頁面，點擊上方的 `Settings` 標籤。
2.  在左側選單中，點擊 `Pages`。
3.  在 `Build and deployment` 下的 `Source` 選項，選擇 `Deploy from a branch`。
4.  在 `Branch` 選項中，確保分支是 `main` (或 `master`)，資料夾是 `/ (root)`，然後點擊 `Save`。

### **步驟 4: 進行專案建置 (Build)**

這是最關鍵的一步，它會將您的 Vue.js 程式碼轉換成瀏覽器看得懂的純靜態 HTML, CSS, JavaScript 檔案，並放到一個名為 `dist` 的資料夾中。

1.  回到您的**本地終端機** (確保您還在專案資料夾內)。
2.  執行建置指令：

    ```bash
    npm run build
    ```

    執行完畢後，您會發現專案中多了一個 `dist` 資料夾。

### **步驟 5: 部署 `dist` 資料夾的內容**

我們需要將 `dist` 資料夾中的內容部署到一個特殊的分支 `gh-pages` 上，GitHub Pages 會自動讀取這個分支來展示您的網站。

1.  **安裝 `gh-pages` 工具**:
    在終端機中執行以下指令，這是一個能幫我們輕鬆部署到 GitHub Pages 的小工具。

    ```bash
    npm install gh-pages --save-dev
    ```

2.  **執行部署指令**:
    `package.json` 中已經為您設定好了一個名為 `deploy` 的快捷指令。直接執行它：

    ```bash
    npm run deploy
    ```

    這個指令會自動將 `dist` 資料夾的內容推送到您 GitHub 倉庫的 `gh-pages` 分支。

### **步驟 6: 瀏覽您的網站！**

1.  再次回到 GitHub 倉庫的 `Settings` > `Pages` 頁面。
2.  頁面頂部會顯示 "Your site is live at `https://<你的GitHub用戶名>.github.io/<你的倉庫名>/`" 。
3.  點擊這個連結，就可以看到您成功上線的網站了！

> **注意**: 第一次部署後，網站可能需要等待 1-5 分鐘才會生效。如果看到 404 錯誤，請稍後再重新整理頁面。

---

## 🔄 未來如何更新網站

當您在本地修改了程式碼後，只需要重複以下步驟即可更新線上的網站：

1.  **儲存您的原始碼變更**:
    ```bash
    git add .
    git commit -m "在這裡描述你做了什麼更新"
    git push origin main
    ```

2.  **重新建置並部署**:
    ```bash
    npm run build
    npm run deploy
    ```

這樣線上的網站就會在幾分鐘內更新為您的最新版本。
