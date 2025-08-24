# Secure Lens Pro (Chrome Extension)

## 📌 Overview
Secure Lens Pro is a Chrome extension designed to enhance web security and provide real-time threat visualization.  
It analyzes domains, checks blacklists, and alerts users with warnings directly on the web page.

---

## 🚀 Features
- Real-time domain and website analysis  
- Blacklist-based website blocking (see `data/blacklist.txt`)  
- Custom banner and warning modal injected into pages  
- Options page for user configuration  
- Popup interface for quick actions  
- Lightweight and easy to use  

---

## 📂 Project Structure
```
main/
│── manifest.json          # Extension config
│── css/
│   └── content.css        # Styling for banners & warnings
│── data/
│   └── blacklist.txt      # Blocked domains
│── images/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
│── js/
│   ├── background.js      # Background script (extension lifecycle, events)
│   ├── content.js         # Injected into webpages (threat visualization)
│   ├── options.js         # Handles settings page logic
│   └── popup.js           # Controls popup interactions
│── pages/
│   ├── options.html       # Options/settings UI
│   ├── popup.html         # Popup window
│   └── warning.html       # Warning modal
```

---

## ⚙️ How It Works
1. **Content Script (`content.js`)** injects banners and warnings into webpages.  
2. **Background Script (`background.js`)** manages lifecycle events and communication.  
3. **Popup (`popup.js` + `popup.html`)** gives quick user access to extension features.  
4. **Options (`options.js` + `options.html`)** lets users configure settings.  
5. **Blacklist (`data/blacklist.txt`)** blocks known malicious sites.  

---

## 🛠️ Installation (Developer Mode)
1. Download or clone this repository.  
2. Open **Chrome** → `chrome://extensions/`.  
3. Enable **Developer Mode** (top-right).  
4. Click **Load unpacked** and select the `main/` folder.  
5. The extension will now appear in your Chrome toolbar.  

---

## 📸 Screenshots

<img width="1910" height="1043" alt="image" src="https://github.com/user-attachments/assets/4c01e167-1709-4594-b1ec-fe5eb3cd864d" />
<img width="552" height="720" alt="image" src="https://github.com/user-attachments/assets/abf55377-9a1d-4d44-b9b4-94b519659045" />
<img width="1909" height="1037" alt="image" src="https://github.com/user-attachments/assets/715b4470-aee0-47c4-9711-a4b02d3cb637" />

---

## 👥 Contributors

- [Aditya](https://github.com/Aditya-Kumar24) 
- [Sachin](https://github.com/sachinkumar-git) 

---

## 📜 License
This project is open-source and free to use.  
