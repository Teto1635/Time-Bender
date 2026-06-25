# Time Bender

A tiny offline-first PWA to track **where your hours actually go**. Tap a colored
tile for an activity, hit **Start**, and a full-screen stopwatch runs — even with
the screen off (it's timestamp-based, so locking the phone never loses time). Stop
to save a record. Each activity keeps **day folders** with time ranges (`14:32 – 15:18`)
and totals. Add notes, group activities, get a gentle break reminder.

Works **100% locally** with no account. Add your own free Firebase project to sync
between your devices (e.g. phone ↔ computer) over the same Google login.

> 🇹🇷 **Türkçe hızlı başlangıç** aşağıda → ["Türkçe"](#türkçe) bölümüne bak.

---

## Features

- ⏱️ Timestamp stopwatch that survives screen-off, lock, and reload
- 🎨 Colored activity tiles, custom color picker, named groups
- 📅 Per-day folders with time ranges, durations, and notes
- ✍️ Manual records + edit any record's start/end time and note
- 📊 Reports (daily / weekly / monthly / yearly), each in **two** day-boundary systems: calendar day (00:00–23:59) and personal day (08:00–07:59), ranked by share of tracked time
- 🧘 Break reminder (configurable interval + snooze), per-activity on/off
- 🔆 Optional "keep screen on" while timing (Wake Lock)
- 🌐 TR / EN language toggle
- ☁️ Optional cloud sync across your devices (Firebase Auth + Firestore)
- 📦 Export / import JSON backup
- 📲 Installable PWA, fully offline

---

## Two modes

**Local-only (default):** Just host the files. Data is stored on the device in
`localStorage`. No setup, no account.

**Cloud sync (optional):** Add a free Firebase project and sign in with Google on
each device. Your data lives in one Firestore document and mirrors live across
devices in real time. Still fully offline-capable (writes queue and sync on
reconnect).

---

## Setup (cloud sync)

You only need this if you want sync. Skip it to run local-only.

### 1. Create a Firebase project
- Go to <https://console.firebase.google.com> → **Add project**.

### 2. Enable Google sign-in
- **Build → Authentication → Get started → Sign-in method → Google → Enable** → Save.

### 3. Create Firestore
- **Build → Firestore Database → Create database → Production mode**.
- Pick a region close to you (e.g. `europe-west3` / Frankfurt).

### 4. Add security rules
- **Firestore → Rules**, paste this, then **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      match /sessions/{sessionId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

This makes each user able to read/write **only their own** data.

### 5. Get your web config
- **Project settings (⚙) → Your apps → Web (`</>`) → Register app** → copy the
  `firebaseConfig` object.

### 6. Paste it into the app
- Open **`index.html`**, find the `firebaseConfig` block near the top of the
  `<script type="module">`, and replace the `PASTE_…` placeholders with your values.
- If you leave the placeholders, the app simply runs in local-only mode.

### 7. Authorized domains
- **Authentication → Settings → Authorized domains**.
- Firebase Hosting domains (`*.web.app`, `*.firebaseapp.com`) are added
  automatically. If you deploy to **GitHub Pages**, add `your-name.github.io` here,
  or Google sign-in will be blocked.

---

## Deploy

### Option A — Firebase Hosting (recommended if you use sync)
Auth just works because the hosting domain is auto-authorized.

```bash
npm install -g firebase-tools
firebase login
firebase init hosting      # choose your project; public dir = the app folder; SPA = No
firebase deploy
```

Your app: `https://YOUR-PROJECT.web.app`

### Option B — GitHub Pages (great for local-only / sharing)
1. Push these files to a public repo.
2. **Settings → Pages → Build and deployment → Deploy from a branch → `main` / root**.
3. If using sync, add your `github.io` domain under Authorized domains (step 7).

> ⚠️ Data is **per-origin**. Pick **one** URL as your home and stick to it. To move
> between URLs, use Export → Import.

---

## Install on your phone
- **Android / Chrome:** open the URL → menu → **Install app / Add to Home screen**.
- **iOS / Safari:** open the URL → Share → **Add to Home Screen**. (Notifications and
  persistent storage only work after adding to the home screen.)

Make an **Export backup** now and then — it's your safety net.

---

## Updating
When you change the app, bump the cache name in **`sw.js`** (e.g. `time-bender-v1`
→ `-v2`) so the service worker ships the new version.

---

## Tech
Plain HTML/CSS/JS, no build step, no framework. Firebase SDK is loaded on demand
from the CDN only when a config is present. Service worker caches the app shell for
offline use and never intercepts Firebase/Google backend traffic.

## License
MIT — do whatever you like. Add a `LICENSE` file if you want it explicit.

---

## Türkçe

**Time Bender**, gününün nereye gittiğini takip eden küçük, çevrimdışı çalışan bir
PWA. Bir iş için renkli kutucuğa dokun, **Başla**'ya bas; tam ekran kronometre
çalışır — ekran kapalıyken bile (süre zaman damgasına dayalı, telefonu kilitlemek
süreyi kaybettirmez). Durdurunca kayıt oluşur. Her iş için **gün klasörleri**:
saat aralıkları (`14:32 – 15:18`), süreler, notlar. İşleri grupla, mola hatırlatması al.
Kayıtları **elle ekleyebilir**, başlangıç/bitiş saatini düzeltebilirsin. **📊 Rapor**:
günlük/haftalık/aylık/yıllık — her biri iki gün sistemiyle (takvim günü `00:00–23:59`
ve kişisel gün `08:00–07:59`), işler harcanan zamana ve yüzdeye göre sıralı.

**Hesapsız, tamamen yerel** çalışır. İstersen kendi ücretsiz Firebase projeni ekleyip
aynı Google hesabıyla **telefon ↔ bilgisayar** senkronu yaparsın.

### Senkron istemiyorsan
Dosyaları host et, bitti. Veriler cihazda `localStorage`'da tutulur.

### Senkron istiyorsan (kısa)
1. <https://console.firebase.google.com> → yeni proje.
2. **Authentication → Sign-in method → Google → Enable.**
3. **Firestore Database → Create → Production mode →** bölge: `europe-west3`.
4. **Firestore → Rules** → yukarıdaki kuralları yapıştır → **Publish**.
5. **Project settings → Your apps → Web (`</>`)** → `firebaseConfig`'i kopyala.
6. `index.html` içinde baştaki `firebaseConfig` bloğundaki `PASTE_…` yerlerine yapıştır.
   (Boş bırakırsan uygulama yerel modda çalışır.)
7. **Authentication → Settings → Authorized domains:** Firebase Hosting otomatik
   eklenir; GitHub Pages kullanırsan `kullanıcı-adın.github.io`'yu elle ekle.

### Yayına alma
- **Firebase Hosting (önerilen):** `npm i -g firebase-tools` → `firebase login` →
  `firebase init hosting` → `firebase deploy` → `https://PROJE.web.app`
- **GitHub Pages:** public repo → Settings → Pages → main / root.

> ⚠️ Veriler URL'ye bağlıdır. Tek bir adresi "ev" seç, ona sadık kal. Adres değiştirirken
> Export → Import kullan.

### Telefona kurmak
- **Android / Chrome:** URL → menü → **Uygulamayı yükle**.
- **iOS / Safari:** URL → Paylaş → **Ana Ekrana Ekle**.

Ara sıra **Yedek al** — güvenlik ağın.
