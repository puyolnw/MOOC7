

# Task Status Tracking - Course Learning Page

Last Updated: 2025-08-06 17:15

## Progress Overview
- ✅ เคลียแล้ว: 0 tasks
- 🔄 รอเทส: 8 tasks  
- ❌ ยังไม่ทำ: 1 tasks

## Task Status Details

### Navigation & Flow Issues
1. 🔄 รอเทส - แก้ไขการ redirect หลังทำข้อสอบ/quiz เสร็จ (ปรับปรุง handleFinish ให้มี delay, เพิ่มปุ่มดูผลคะแนนทั้งหมด, ปรับปรุง UX การแสดงผล)
2. 🔄 รอเทส - แก้ไขการไปยังบทเรียนล่าสุดที่ยังไม่ได้เรียน (เพิ่ม findNextUncompletedLesson, ปรับปรุง setInitialLesson, อัตโนมัติหาบทเรียนถัดไปหลังเสร็จ)

### Content Display Issues  
3. 🔄 รอเทส - แก้ไขการแสดงผลอาจารย์ประจำรายวิชา (เพิ่ม fetchInstructors API call, อัปเดท LessonArea.tsx ให้เรียก /api/courses/{courseId}/instructors)
4. 🔄 รอเทส - แก้ไขระบบไฟล์แนบ (ลบ authentication headers ใน frontend/backend, เพิ่ม debug logs, อัปเดท Learning.js API endpoints)

### UI/UX Improvements
5. 🔄 รอเทส - ลบแถบการชำระเงิน (ลบ payment-related components, interfaces, functions, API calls, states ใน LessonFaq และ LessonArea)
6. 🔄 รอเทส - เพิ่มฟีเจอร์ดูเนื้อหาเก่าและคำตอบที่เคยตอบ (เพิ่มปุ่ม navigation บทก่อนหน้า/ถัดไป เพื่อให้กลับไปดูบทเรียนที่ผ่านมาได้ง่ายขึ้น)

### Technical Issues
7. 🔄 รอเทส - แก้ไข bugs ในตัวเล่นวิดีโอ (YouTube Player) (เพิ่ม error handling, ลด API calls, ซ่อน console noise, จัดการ ERR_BLOCKED_BY_CLIENT)
8. 🔄 รอเทส - แก้ไขปัญหาการ refresh และ state update (แก้ไข handleLessonComplete, refreshProgress, updateLessonCompletionStatus เพื่อจัดการ async properly)
9. 🔄 รอเทส - ปรับปรุงประสิทธิภาพการโหลดหน้า (เพิ่ม useCallback, useMemo, loading skeleton, parallel API calls, optimized re-renders)

## Priority Tasks
- **Critical Priority**: Task 8, 9 (performance และ state management)
- **High Priority**: Task 1, 2 (core learning flow)
- **Medium Priority**: Task 6, 7 (user experience และ technical stability)
- **Low Priority**: Task 3, 4, 5 (content display และ cleanup)

## Target URL
- หน้าที่ต้องแก้ไข: `http://localhost:5173/course-learning/88/116`
- Component หลัก: Course Learning page และ related components

## Technical Notes
- ต้องตรวจสอบ API endpoints ที่เกี่ยวข้องกับ course progress tracking
- YouTube Player issues เกี่ยวข้องกับ external API calls
- ระบบการแสดงเนื้อหาย่อย (sub-content) ต้องรองรับ
- Navigation flow ต้องสอดคล้องกับสถานะการเรียนของนักเรียน
- **CRITICAL**: ปัญหา state management และ refresh เป็นอุปสรรคหลักต่อ UX
- ต้องใช้ proper React patterns สำหรับ data synchronization
- ควรพิจารณาใช้ state management library (Redux, Zustand) หรือ data fetching library (React Query, SWR)