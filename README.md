# 📺 NeoStream - IPTV Player for Android TV

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-0.82-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Android TV](https://img.shields.io/badge/Android_TV-Leanback-3DDC84?style=for-the-badge&logo=android&logoColor=white)

**A modern, fully-typed IPTV player for Android TV built with React Native and TypeScript**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Documentation](#-documentation)

</div>

---

## ✨ Features

### 🎯 Core Functionality
- **M3U Playlist Support** - Parse and load IPTV channels from M3U playlists
- **Full TypeScript** - Complete type safety throughout the application
- **Android TV Optimized** - Native Leanback support with D-pad navigation
- **Remote Control Ready** - Full TV remote control support
- **Keyboard Input** - On-screen keyboard and laptop-to-TV input

### 🎨 User Interface
- **Modern Neon Theme** - Beautiful cyberpunk-inspired UI
- **Responsive Layout** - Optimized for TV screens
- **Focus Management** - Intuitive navigation between UI elements
- **Loading States** - Clear feedback during operations
- **Error Handling** - User-friendly error messages

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/maous26/neostream.git
cd neostream

# Install dependencies
npm install

# Run on Android TV
npm run android

# Or use helper script
./launch-app.sh
```

---

## 🎮 Usage

### Login with Your IPTV Service

Enter your complete M3U URL:
```
http://server.com/get.php?username=USER&password=PASS&type=m3u
```

### Control from Your Laptop

```bash
# Interactive login
./login-from-laptop.sh

# Send text
./adb-input-text.sh "http://your-url.com/playlist.m3u"

# Test URL
./test-m3u-url.sh
```

---

## 📚 Documentation

- **[LAPTOP_CONTROL_GUIDE.md](./LAPTOP_CONTROL_GUIDE.md)** - Control app from laptop
- **[TV_REMOTE_GUIDE.md](./TV_REMOTE_GUIDE.md)** - TV remote navigation
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Problem solving

---

## 🏗️ Tech Stack

- **React Native 0.82** - Cross-platform mobile framework
- **TypeScript 5.8** - Type-safe JavaScript
- **React Navigation** - Navigation library
- **AsyncStorage** - Data persistence
- **Android TV Leanback** - TV-optimized UI

---

## 🐛 Common Issues

### "Network request failed"
❌ Wrong: `http://server.com`  
✅ Correct: `http://server.com/get.php?username=XXX&password=YYY&type=m3u`

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more help.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

---

<div align="center">

**Made with ❤️ for IPTV enthusiasts**

⭐ Star this repo if you find it helpful!

[Report Bug](https://github.com/maous26/neostream/issues) · [Request Feature](https://github.com/maous26/neostream/issues)

</div>
