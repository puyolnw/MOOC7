# Task Status Tracking — Admin & Instructor Management

Last Updated: 2025-08-13 12:29 ICT

## Progress Overview
- ✅ เคลียแล้ว: 0 tasks
- 🔄 รอเทส: 3 tasks
- ❌ ยังไม่ทำ: 0 tasks

---

## Task Status Details

1. 🔄 รอเทส — แก้ไขหน้า `insection.tsx` (เลือกอาจารย์ผู้สอนประจำวิชา)  
   - **การแก้ไข:** ลบปุ่มเพิ่มซ้ำและย้ายไปที่ footer, เพิ่ม scrollbar ใน modal, แก้ไข API backend ให้ replace instructors, แก้ frontend ให้รวมอาจารย์เดิม+ใหม่ก่อนส่ง API  
   - **ไฟล์ที่แก้:** Inssection.tsx (frontend), Subjects.js (backend API)  
   - **ปัญหาที่แก้:** scrollbar ไม่แสดง, ปุ่มเพิ่มซ้ำ, ลบอาจารย์ไม่ได้จริง, เพิ่มอาจารย์แล้วอาจารย์เก่าหายไป

2. 🔄 รอเทส — เพิ่มนักศึกษาในส่วน Admin  
   - **การแก้ไข:** เพิ่มตัวเลือกประเภทผู้ใช้ (tab selector), ปรับแต่งฟิลด์ตาม user type, อัปเดต validation และ API call สำหรับทั้งนักศึกษาและนักเรียน  
   - **ไฟล์ที่แก้:** AddStudents.tsx - เพิ่ม state userType, tab selector UI, conditional fields, updated validation logic

3. 🔄 รอเทส — แก้ไขข้อมูลนักเรียน/นักศึกษาใน Admin  
   - **การแก้ไข:** อัปเดต EditStudents.tsx ให้รองรับทั้งนักศึกษาและนักเรียน - เพิ่มตรวจสอบ user type, conditional UI fields, อัปเดต validation และการโหลดข้อมูล  
   - **ไฟล์ที่แก้:** EditStudents.tsx - เพิ่ม userType detection, school student fields, updated validation logic  
   - **หมายเหตุ:** ปุ่มแก้ไขมีอยู่แล้วใน AccountStudentArea.tsx และ route ทำงานครบถ้วน

---

## Priority
- **High:** Task 1 (Instructor selection fix)  
- **Medium:** Task 2, Task 3

## Notes
- ตรวจสอบการทำงานทั้งฝั่ง UI และ API
- ใช้ pattern เดียวกับฟอร์ม/ปุ่มในระบบปัจจุบันเพื่อความสอดคล้อง
