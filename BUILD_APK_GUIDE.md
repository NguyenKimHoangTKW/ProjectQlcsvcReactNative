# 📱 Hướng dẫn xuất file APK

## ✅ **Debug APK (Đã hoàn thành)**
File APK debug đã được tạo tại: `android/app/build/outputs/apk/debug/app-debug.apk` (115MB)

## 🚀 **Release APK (Đã hoàn thành) ⭐**
File APK release đã được tạo tại: `android/app/build/outputs/apk/release/app-release.apk` (51MB)

### Cách build APK:

#### Debug APK:
```bash
cd android
.\gradlew assembleDebug
```

#### Release APK:
```bash
cd android
.\gradlew assembleRelease
```

## 📍 **Vị trí file APK sau khi build:**

- **Debug APK:** `android/app/build/outputs/apk/debug/app-debug.apk` (115MB)
- **Release APK:** `android/app/build/outputs/apk/release/app-release.apk` (51MB) ⭐

## 🔗 **Cách build nhanh từ React Native CLI:**

### Debug APK:
```bash
npx react-native build-android --mode=debug
```

### Release APK:
```bash
npx react-native build-android --mode=release
```

## 📋 **So sánh Debug vs Release:**

| Loại | Kích thước | Tối ưu hóa | Sử dụng |
|------|------------|------------|---------|
| **Debug** | 115MB | ❌ Không | Test, phát triển |
| **Release** | 51MB | ✅ Có | Phát hành, sản xuất |

## 💡 **Khuyến nghị:**
- **Sử dụng Release APK** để phát hành ứng dụng
- Release APK nhỏ hơn 2x so với Debug APK
- Release APK đã được tối ưu hóa hiệu suất

## 🔄 **Rebuild APK:**
```bash
cd android
.\gradlew clean
.\gradlew assembleRelease
```

## 🔗 **Cách build nhanh từ React Native CLI:**

### Debug APK:
```bash
npx react-native build-android --mode=debug
```

### Release APK:
```bash
npx react-native build-android --mode=release
```

## 📋 **Lưu ý:**
- Debug APK: Dùng để test, file lớn hơn
- Release APK: Dùng để phát hành, được tối ưu hóa, file nhỏ hơn
- Cần signing key để build Release APK
- File APK có thể cài đặt trực tiếp trên Android 