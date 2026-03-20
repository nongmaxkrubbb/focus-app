# Project: Study Focus (Pomodoro & Gamification Web App)

**Study Focus** คือเว็บแอปพลิเคชันที่ออกแบบมาเพื่อช่วยเพิ่มประสิทธิภาพในการทำงานและการเรียน (Productivity) โดยใช้เทคนิค **Pomodoro** ผสมผสานกับระบบ **Gamification** เพื่อสร้างแรงจูงใจให้ผู้ใช้งานจดจ่อกับสิ่งที่ทำได้นานขึ้นและมีความสนุกไปพร้อมกัน

---

## ✨ ฟีเจอร์ที่สำคัญ (Key Features)

### 1. ระบบจัดการเวลา (Smart Timer & Focus Mode)
*   **Pomodoro Timer**: ระบบจับเวลาแบบ Pomodoro ที่สามารถสลับระหว่างช่วง Focus และ Break ได้อย่างราบรื่น
*   **Visual Progress**: แสดงความคืบหน้าของเวลาผ่านอินเทอร์เฟซที่สะอาดตาและอ่านง่าย
*   **Persistent State**: ข้อมูลเวลาถูกซิงค์ผ่าน Firebase เพื่อให้แน่ใจว่าการโฟกัสจะไม่หลุดหายแม้จะรีเฟรชหน้าเว็บ

### 2. ระบบเกมมิ่งและธีม (Gamification & Immersive Themes)
*   **Leveling System**: ทุกนาทีที่โฟกัสจะถูกเปลี่ยนเป็นค่าประสบการณ์ (EXP) เพื่ออัปเกรดเลเวลของผู้ใช้
*   **Pet Shop & Inventory**: ระบบร้านค้าที่ใช้ Coins (เหรียญที่ได้จากการโฟกัส) เพื่อปลดล็อคสัตว์เลี้ยงคู่ใจ
*   **Customizable Themes**: ระบบธีมที่ปรับแต่งได้หลากหลาย เช่น *Cyberpunk Rain*, *Starry Night*, และธีมเทศกาลไทยอย่าง *Songkran Splash*, *Loy Krathong* และ *Phi Ta Khon* ซึ่งแต่ละธีมจะมีบรรยากาศและโทนสีที่แตกต่างกันเพื่อลดความน่าเบื่อในการอ่านหนังสือ

### 3. การทำงานร่วมกันแบบเรียลไทม์ (Real-time Collaboration)
*   **Multiplayer Focus Rooms**: ห้องเรียนออนไลน์ที่ผู้ใช้สามารถเข้าร่วมกับเพื่อนๆ ได้ เห็นสถานะการโฟกัสและสัตว์เลี้ยงของเพื่อนแบบเรียลไทม์ผ่าน Firestore
*   **To-Do List Synchronization**: รายการสิ่งที่ต้องทำที่ซิงค์แบบเรียลไทม์ ช่วยให้ติดตามความคืบหน้าของงานในแต่ละเซสชันได้ทันที

### 4. ประสบการณ์ผู้ใช้ระดับพรีเมียม (Premium Experience)
*   **Glassmorphism UI**: การออกแบบอินเทอร์เฟซที่ทันสมัย (Modern UI) โดยใช้เทคนิค Glassmorphism ที่เน้นความโปร่งใส (Translucency) และการเบลอพื้นหลัง (Backdrop-blur) ให้ความรู้สึกพรีเมียมและสบายตา
*   **Adaptive Design**: รองรับการใช้งานทุกอุปกรณ์ (Responsive) ด้วย CSS Grid และ Flexbox
*   **Progressive Web App (PWA)**: เว็บแอปที่รองรับการติดตั้งลงบนเครื่อง (Installable) ทำงานได้รวดเร็วเหมือนแอปพลิเคชัน Native
*   **Admin Dashboard**: ระบบจัดการหลังบ้านสำหรับผู้ดูแลระบบในการจัดการข้อมูลผู้ใช้และเพิ่ม Content ใหม่ๆ ได้ทันที

---

## 🛠 เทคโนโลยีที่เลือกใช้ (The Stack)

*   **Frontend**: React.js (Vite) เพื่อประสิทธิภาพที่รวดเร็วและการจัดการ Component ที่เป็นระเบียบ
*   **Styling**: Vanilla CSS (Modern CSS properties) เน้นความเป็นเอกลักษณ์และการควบคุมดีไซน์อย่างละเอียด
*   **Backend/BaaS**: Firebase (Firestore, Authentication, Hosting) เพื่อการจัดการฐานข้อมูลเรียลไทม์และการส่งมอบเว็บที่รวดเร็ว
*   **State Management**: React Context API & Hooks เพื่อการจัดการสถานะภายในแอปที่มีความซับซ้อนแต่ยังคงประสิทธิภาพสูง
*   **Data Visualization**: Recharts สำหรับแสดงสถิติการโฟกัสย้อนหลังให้กับผู้ใช้

---

## 💡 สิ่งที่ได้รับจากโปรเจกต์นี้
โปรเจกต์นี้เป็นการผสานรวมความรู้ด้าน **Real-time Frontend** และ **Backend-as-a-Service (BaaS)** เข้าด้วยกันอย่างสมบูรณ์แบบ ท้าทายทั้งในด้านการออกแบบ UI ที่ต้องดึงดูดใจ (Visual Excellence) และการจัดการ Logic ที่มีความซับซ้อนของระบบ Gamification และ Multiplayer
