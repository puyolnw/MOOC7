
## Task 1: แก้ไขการ redirect หลังทำข้อสอบ/quiz เสร็จ
- ตรวจสอบ flow การทำข้อสอบและ quiz ในหน้า course-learning
- แก้ไขการ redirect ให้พาไปหน้าแสดงผลคะแนนที่ถูกต้อง
- ตรวจสอบ API response หลังส่งคำตอบข้อสอบ
- แก้ไข routing และ navigation logic หลังทำข้อสอบเสร็จ
- ทดสอบการทำข้อสอบและดูผลคะแนน

## Task 2: แก้ไขการไปยังบทเรียนล่าสุดที่ยังไม่ได้เรียน
- ตรวจสอบ API สำหรับดึงสถานะความคืบหน้าการเรียน
- สร้าง logic สำหรับหาบทเรียนถัดไปที่ยังไม่ได้เรียน
- แก้ไขการ redirect เมื่อเข้าหน้า course-learning ให้ไปยังบทที่ถูกต้อง
- รองรับเนื้อหาย่อย (sub-content) ในการตรวจสอบสถานะ
- ทดสอบการเข้าหน้าเรียนและไปยังตำแหน่งที่ถูกต้อง

## Task 3: แก้ไขการแสดงผลอาจารย์ประจำรายวิชา
- ตรวจสอบ API สำหรับดึงข้อมูลอาจารย์ประจำรายวิชา
- แก้ไข component ที่แสดงข้อมูลอาจารย์ในหน้า course-learning
- ตรวจสอบการแสดงชื่อ รูปภาพ และข้อมูลอาจารย์
- ทดสอบการแสดงผลข้อมูลอาจารย์ที่ถูกต้อง

## Task 4: แก้ไขระบบไฟล์แนบ
- ตรวจสอบ API สำหรับดึงข้อมูลไฟล์แนบในบทเรียน
- แก้ไขการแสดงรายการไฟล์แนบ
- ตรวจสอบการดาวน์โหลดไฟล์แนบ
- แก้ไข URL และ path ของไฟล์แนบให้ถูกต้อง
- ทดสอบการดาวน์โหลดและเปิดไฟล์แนบ

## Task 5: ลบแถบการชำระเงิน
- หาและลบ component หรือ section ที่เกี่ยวข้องกับการชำระเงิน
- ลบการเรียก API ที่เกี่ยวข้องกับการชำระเงิน
- ลบ CSS และ styling ที่เกี่ยวข้อง
- ตรวจสอบไม่ให้มี payment-related elements ในหน้า course-learning
- ทดสอบการแสดงผลหน้าเรียนที่ไม่มีส่วนการชำระเงิน

## Task 6: เพิ่มฟีเจอร์ดูเนื้อหาเก่าและคำตอบที่เคยตอบ
- เพิ่มระบบให้นักเรียนสามารถกลับไปดูบทเรียนที่เรียนแล้วได้
- เพิ่มการแสดงคำตอบที่เคยตอบในข้อสอบ/quiz
- สร้าง UI สำหรับแสดงประวัติการทำข้อสอบครั้งล่าสุด
- เพิ่ม navigation ที่ให้เลือกได้ว่าจะดูเนื้อหาใหม่หรือย้อนกลับ
- ทดสอบการเข้าถึงเนื้อหาเก่าและดูคำตอบที่เคยทำ

## Task 7: แก้ไข bugs ในตัวเล่นวิดีโอ (YouTube Player)
- วิเคราะห์ error logs ที่เกี่ยวข้องกับ YouTube API
- แก้ไขปัญหา ERR_BLOCKED_BY_CLIENT ในการโหลด YouTube resources
- ลบหรือปรับแต่ง unnecessary YouTube API calls
- เพิ่มการจัดการ error handling สำหรับ YouTube player
- ปรับแต่ง LessonVideo.tsx เพื่อลด console errors
- ทดสอบการเล่นวิดีโอและตรวจสอบ console logs

## Task 8: แก้ไขปัญหาการ refresh และ state update
- วิเคราะห์ปัญหาการไม่ refresh หลังทำข้อสอบเสร็จ
- ตรวจสอบ React state management ในหน้า course-learning
- แก้ไข useEffect dependencies และ state updates
- เพิ่มการเรียก API เพื่อ refresh ข้อมูลหลังทำกิจกรรมเสร็จ
- แก้ไขการอัปเดทสถานะต่างๆ (progress, completion status)
- ใช้ React Query หรือ SWR สำหรับ data fetching และ cache management
- เพิ่ม loading states และ optimistic updates
- ทดสอบการ refresh และ state updates หลังทำกิจกรรมต่างๆ

## Task 9: ปรับปรุงประสิทธิภาพการโหลดหน้า
- วิเคราะห์ performance bottlenecks ในหน้า course-learning
- ลด unnecessary API calls และ re-renders
- เพิ่ม skeleton loading และ lazy loading สำหรับ components
- ปรับปรุง data fetching strategy (parallel vs sequential)
- เพิ่ม error boundaries และ fallback components
- ใช้ React.memo และ useMemo สำหรับ optimization
- ทดสอบ loading time และ user experience

---