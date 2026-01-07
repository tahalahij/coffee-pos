# ☕ Cafe POS System

[![Latest Release](https://img.shields.io/github/v/release/tahalahij/coffee-pos?style=flat-square)](https://github.com/tahalahij/coffee-pos/releases/latest)
[![License](https://img.shields.io/github/license/tahalahij/coffee-pos?style=flat-square)](LICENSE)
[![Issues](https://img.shields.io/github/issues/tahalahij/coffee-pos?style=flat-square)](https://github.com/tahalahij/coffee-pos/issues)

A modern, easy-to-use point of sale system designed specifically for cafes and coffee shops. Manage your sales, inventory, and customers all in one place - even when you're offline!

> **🆕 NEW: Dual-Screen Support!** Now with customer-facing display for TVs/monitors. [Learn more →](#-dual-screen-customer-display)

---

## 📥 Download & Install

### For Windows Users

Download the latest version and double-click to install:

| **Option** | **Best For** | **Download** |
|-----------|--------------|--------------|
| 🏆 **MSI Installer** | Most users - installs like any Windows program | [Download Installer](https://github.com/tahalahij/coffee-pos/releases/latest/download/Cafe.POS_1.0.0_x64_en-US.msi) |
| 📦 **Alternative Installer** | If MSI doesn't work on your system | [Download Setup](https://github.com/tahalahij/coffee-pos/releases/latest/download/Cafe.POS_1.0.0_x64-setup.exe) |
| 🚀 **Portable Version** | Run without installing (USB drive, etc.) | [Download Portable](https://github.com/tahalahij/coffee-pos/releases/latest/download/Cafe.POS.exe) |

### Installation Steps

1. **Download** the installer (MSI recommended)
2. **Double-click** the downloaded file
3. **Follow** the installation wizard
4. **Launch** Cafe POS from your Start Menu or Desktop
5. **Start using** your POS system!

### System Requirements

- **Operating System:** Windows 10 or Windows 11 (64-bit)
- **RAM:** 4 GB minimum (8 GB recommended)
- **Storage:** 500 MB free space
- **Internet:** Not required after installation (works offline)

---

## 🖥️ Dual-Screen Customer Display

**NEW FEATURE:** Run the POS on your laptop while showing a customer-facing display on a TV or second monitor via HDMI.

### Features
- ✅ **Operator screen**: Full POS interface for cashier
- ✅ **Customer display**: Shows cart items and total in real-time
- ✅ **Automatic setup**: Connect HDMI TV and it just works
- ✅ **Professional look**: Fullscreen, branded display with animations

### Quick Setup
```bash
# Install dependencies
./setup-dual-screen.sh  # Mac/Linux
setup-dual-screen.bat   # Windows

# Then start the app as normal
```

📖 **[Dual-Screen Setup Guide](DUAL-SCREEN-SETUP.md)** | 🚀 **[Quick Start](DUAL-SCREEN-QUICK-START.md)**

---
## ✨ What Can You Do With Cafe POS?

### 🛒 **Sales Management**
- Quick and easy checkout process
- Add items to cart with a single click
- Apply discounts and promotions
- Print professional receipts instantly
- Handle cash and card payments

### 📊 **Business Insights**
- View daily, weekly, and monthly sales reports
- Track your best-selling products
- Monitor revenue and profit margins
- Identify busy hours and slow periods
- Make data-driven decisions

### 📦 **Inventory Control**
- Manage your product catalog
- Organize items by categories
- Track stock levels automatically
- Set low-stock alerts
- Record purchases and suppliers

### 👥 **Customer Management**
- Build customer database
- Track purchase history
- Create loyalty programs
- Send promotions and campaigns
- Reward repeat customers

### 🔄 **Works Offline**
- Keep working even without internet
- All data stored locally
- Never lose a sale due to connectivity
- Sync when connection returns

### 🖨️ **Receipt Printing**
- Print professional receipts
- Customize receipt layout
- Include your logo and business info
- Email receipts to customers

---

## 🚀 Getting Started (For Users)

### First Time Setup

1. **Launch the app** after installation
2. **Create your account** or sign in
3. **Set up your cafe details** (name, address, tax info)
4. **Add your products** and prices
5. **Configure your printer** (optional)
6. **Start selling!**

### Quick Start Guide

- **To Make a Sale:** Click on products → Review cart → Process payment → Print receipt
- **To Add Products:** Go to Products → Add New Product → Enter details → Save
- **To View Reports:** Go to Dashboard → Select date range → View analytics
- **To Manage Inventory:** Go to Inventory → Track stock → Record purchases

---

## ❓ Frequently Asked Questions

### Do I need internet to use this?
No! The POS system works completely offline. Your data is stored on your computer.

### Can I use it on multiple computers?
Currently, the app is designed for single-computer use. Multi-device sync is planned for future updates.

### Will my data be safe?
Yes! All data is stored locally on your computer. Regular backups are recommended.

### Can I print receipts?
Yes! The system supports thermal and regular printers. Configure your printer in Settings.

### Is there a mobile version?
Not yet, but mobile support is on our roadmap for future releases.

### How do I backup my data?
Go to Settings → Backup & Restore → Create Backup. Save the file to a safe location.

### What if I need help?
- Check the built-in Help section
- [Open an issue](https://github.com/tahalahij/coffee-pos/issues) on GitHub
- Email support: [Create an issue with your question]

---

## 🐛 Troubleshooting

### The app won't start
- Make sure you have Windows 10/11 (64-bit)
- Try running as Administrator
- Reinstall the application

### Printer not working
- Check printer is connected and powered on
- Install printer drivers
- Select correct printer in Settings
- Try a test print from Windows

### Data not showing up
- Check if database file exists
- Try restarting the application
- Restore from backup if needed

### App is slow
- Close other programs
- Check available disk space
- Restart your computer

**Still having issues?** [Report a bug](https://github.com/tahalahij/coffee-pos/issues/new)

---

## 🔄 Updates & Releases

Check the [Releases page](https://github.com/tahalahij/coffee-pos/releases) for:
- 📦 Latest versions
- 🆕 New features
- 🐛 Bug fixes
- 📝 Release notes

To update: Download and install the latest version - your data will be preserved.

---

## 🤝 Support & Community

- **Questions?** [Ask in Discussions](https://github.com/tahalahij/coffee-pos/discussions)
- **Found a bug?** [Report an Issue](https://github.com/tahalahij/coffee-pos/issues/new)
- **Feature request?** [Share your ideas](https://github.com/tahalahij/coffee-pos/issues/new?labels=enhancement)

---

## 📄 License

This project is licensed under the MIT License - free to use for your business.

---

<details>
<summary><h2>👨‍💻 For Developers</h2></summary>

### Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, PWA
- **Backend:** NestJS, TypeScript, MongoDB
- **Desktop:** Tauri (Rust)
- **UI Components:** shadcn/ui
- **State Management:** Zustand
- **Charts:** Recharts

### Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, PWA
- **Backend:** NestJS, TypeScript, MongoDB
- **Desktop:** Tauri (Rust)
- **UI Components:** shadcn/ui
- **State Management:** Zustand
- **Charts:** Recharts

### Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/tahalahij/coffee-pos.git
cd coffee-pos
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Set up database**
```bash
npm run db:migrate
npm run db:seed
```

4. **Start development servers**
```bash
npm run dev
```

5. **After updating models**
```bash
cd backend
npx prisma format 
npx prisma generate
npx prisma migrate dev
```

### Project Structure

```
cafe-pos/
├── frontend/          # Next.js frontend application
├── backend/           # NestJS backend API
├── desktop/           # Tauri desktop application
└── docs/              # Documentation
```

### Building for Production

```bash
# Build backend
cd backend && npm run build

# Build frontend
cd frontend && npm run build

# Build desktop app
cd desktop && npm run build
```

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

</details>

---

<div align="center">

**Made with ☕ for cafe owners everywhere**

[Download Now](https://github.com/tahalahij/coffee-pos/releases/latest) • [Report Bug](https://github.com/tahalahij/coffee-pos/issues) • [Request Feature](https://github.com/tahalahij/coffee-pos/issues)

</div>

