# YouTube Video Downloader (Self-Hosted API)

ระบบดาวน์โหลดวิดีโอจาก YouTube ที่ทำงานได้จริง พร้อม UI ที่สวยงามและใช้งานง่าย  
**ใช้ API ของตัวเอง (Self-Hosted) ไม่ต้องไปหน้าเว็บอื่น**

## คุณสมบัติ

- ✅ **Self-Hosted API** - ใช้ Node.js server ของตัวเอง ไม่ต้องพึ่งบริการภายนอก
- ✅ **ดึงข้อมูลวิดีโอ** - แสดงภาพตัวอย่าง, ชื่อวิดีโอ, ชื่อช่อง, ความยาว, จำนวนวิว
- ✅ **หลายคุณภาพให้เลือก** - รองรับ 360p, 480p, 720p, 1080p และอื่นๆ
- ✅ **ดาวน์โหลดเสียง** - รองรับ MP4, WebM, M4A
- ✅ **Direct Download** - ดาวน์โหลดโดยตรงจาก server ของคุณ
- ✅ **UI สวยงาม** - ดีไซน์ทันสมัย รองรับ Responsive
- ✅ **Progress Bar** - แสดงความคืบหน้าการดาวน์โหลด
- ✅ **Error Handling** - จัดการข้อผิดพลาดอย่างเหมาะสม

## ไฟล์ที่ใช้

```
youtube-downloader/
├── index.html          # หน้า UI หลัก
├── server.js           # Node.js Backend Server
├── app.js              # Frontend Logic
├── package.json        # Dependencies
└── README.md           # เอกสารนี้
```

## การติดตั้งและใช้งาน

### 1. ติดตั้ง Node.js

ตรวจสอบว่ามี Node.js ติดตั้งอยู่หรือไม่:
```bash
node --version
npm --version
```

หากยังไม่มี ดาวน์โหลดจาก: https://nodejs.org/

### 2. ติดตั้ง Dependencies

เปิด Terminal/Command Prompt แล้วไปที่โฟลเดอร์โปรเจกต์:

```bash
cd c:/xampp/htdocs/youtube-downloader
npm install
```

### 3. เริ่ม Server

```bash
npm start
```

Server จะทำงานที่ `http://localhost:3000`

### 4. เปิดใช้งาน

เปิดเบราว์เซอร์แล้วไปที่:
```
http://localhost:3000
```

## วิธีใช้งาน

### 1. วางลิงก์ YouTube

- รองรับทุกรูปแบบของลิงก์ YouTube:
  - `https://www.youtube.com/watch?v=VIDEO_ID`
  - `https://youtu.be/VIDEO_ID`
  - `https://www.youtube.com/embed/VIDEO_ID`
  - `https://www.youtube.com/shorts/VIDEO_ID`

### 2. กด "ดึงข้อมูล"

ระบบจะแสดง:
- ภาพตัวอย่างวิดีโอ
- ชื่อวิดีโอ
- ชื่อช่อง
- ความยาววิดีโอ
- จำนวนวิว
- ปุ่มเลือกคุณภาพ

### 3. เลือกคุณภาพและดาวน์โหลด

- **วิดีโอ (MP4)**: เลือกคุณภาพ 360p, 480p, 720p, 1080p
- **เสียง (Audio)**: เลือก M4A, WebM

## API Endpoints

### GET `/api/video-info?url=URL`
ดึงข้อมูลวิดีโอ

**Response:**
```json
{
  "videoId": "dQw4w9WgXcQ",
  "title": "Video Title",
  "author": "Channel Name",
  "thumbnail": "https://...",
  "lengthSeconds": 212,
  "viewCount": 1000000,
  "formats": [...]
}
```

### GET `/api/formats?url=URL`
ดึงรูปแบบที่ดาวน์โหลดได้

**Response:**
```json
{
  "video": [
    {
      "itag": 137,
      "quality": "1080p",
      "container": "mp4",
      "url": "/api/download?url=...&itag=137"
    }
  ],
  "audio": [...]
}
```

### GET `/api/download?url=URL&itag=ITAG`
ดาวน์โหลดวิดีโอโดยตรง

### GET `/api/stream?url=URL&itag=ITAG`
Stream วิดีโอสำหรับ preview

### GET `/api/health`
ตรวจสอบสถานะ server

## คุณสมบัติทางเทคนิค

### Backend (`server.js`)
- **Express.js** - Web framework
- **ytdl-core** - YouTube downloader library
- **CORS** - Cross-origin resource sharing

### Frontend (`app.js`)
- **SelfHostedYouTubeDownloader** - Class หลักสำหรับจัดการ UI
- **API Integration** - เรียกใช้ API ของตัวเอง
- **Progress Tracking** - แสดงความคืบหน้า

## การปรับแต่ง

### เปลี่ยน Port

แก้ไข `server.js`:
```javascript
const PORT = 3000; // เปลี่ยนเป็น port ที่ต้องการ
```

และแก้ไข `app.js`:
```javascript
this.apiBaseUrl = 'http://localhost:3000/api'; // เปลี่ยน port ให้ตรงกัน
```

### เปลี่ยนสีธีม

แก้ไข CSS ใน `index.html`:
```css
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## ข้อจำกัด

- บางวิดีโออาจมีการป้องกันการดาวน์โหลด (age-restricted, private)
- ความเร็วในการดาวน์โหลดขึ้นอยู่กับความเร็วอินเทอร์เน็ตของคุณ
- ต้องเชื่อมต่ออินเทอร์เน็ต
- Server ต้องทำงานอยู่เสมอเวลาใช้งาน

## ความปลอดภัย

- ไม่เก็บข้อมูลส่วนตัวของผู้ใช้
- ไม่มี API Key ที่ต้องจัดการ
- ดาวน์โหลดโดยตรงจาก YouTube ผ่าน server ของคุณ
- ไม่มีการส่งข้อมูลไปยังบริการภายนอก

## License

โค้ดนี้เป็น Open Source สามารถนำไปใช้งานได้อย่างอิสระ

## การแจ้งปัญหา

หากพบปัญหาในการใช้งาน สามารถ:
1. ตรวจสอบว่า server ทำงานอยู่ (`npm start`)
2. ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
3. ลองลิงก์ YouTube อื่น
4. ตรวจสอบ Console ในเบราว์เซอร์ (F12)

## Dependencies

- `express` ^4.18.2
- `ytdl-core` ^4.11.5
- `cors` ^2.8.5

---

**สร้างด้วย ❤️ สำหรับการดาวน์โหลดวิดีโอ YouTube ที่ง่ายและรวดเร็ว ด้วย API ของตัวเอง**
