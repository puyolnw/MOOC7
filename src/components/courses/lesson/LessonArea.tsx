import { useState, useEffect, useRef } from "react";
import LessonFaq from "./LessonFaq";
import LessonNavTav from "./LessonNavTav";
import LessonVideo from "./LessonVideo";
import LessonQuiz from "./LessonQuiz";
import "./LessonArea.css";

// สร้าง interface สำหรับข้อมูลบทเรียน
interface LessonItem {
  id: number;
  title: string;
  lock: boolean;
  completed: boolean;
  type: 'video' | 'quiz';
  duration: string;
}

// สร้าง interface สำหรับข้อมูลส่วน (section)
interface SectionData {
  id: number;
  title: string;
  count: string;
  items: LessonItem[];
}

const LessonArea = () => {
   const [currentView, setCurrentView] = useState<'video' | 'quiz'>('video');
   const [progress, setProgress] = useState<number>(40); // ตัวอย่างความคืบหน้า 40%
   const [currentLesson, setCurrentLesson] = useState<string>("1.1 เนื้อหาหลัก");
   const [currentLessonId, setCurrentLessonId] = useState<string>("2-0"); // format: "section-item"
   const [completedCount, setCompletedCount] = useState(0); // เพิ่ม state เพื่อติดตามจำนวนบทเรียนที่เรียนจบ
   
   // สร้าง state เก็บข้อมูลบทเรียนทั้งหมด
   const [lessonData, setLessonData] = useState<SectionData[]>(() => {
     // แปลงข้อมูลจาก faq_data ใน LessonFaq.tsx
     const initialData = [
       {
         id: 1,
         title: "แบบทดสอบก่อนเรียน",
         count: "ผ่าน",
         items: [
           {
             id: 0,
             title: "เริ่มทำแบบทดสอบก่อนเรียน",
             lock: false, // บทเรียนแรกไม่ล็อค
             completed: true,
             type: 'quiz' as 'video' | 'quiz',
             duration: "100%"
           }
         ]
       },
       {
         id: 2,
         title: "บทที่ 1 การวิเคราะห์ข้อมูลเบื้องต้น",
         count: "ผ่าน",
         items: [
           {
             id: 0,
             title: "1.1 เนื้อหาหลัก",
             lock: false, // ไม่ล็อคเพราะบทก่อนหน้าเสร็จแล้ว
             completed: true,
             type: 'video' as 'video' | 'quiz',
             duration: "100%"
           },
           {
             id: 1,
             title: "1.2 แบบฝึกหัดท้ายบท",
             lock: false, // ไม่ล็อคเพราะบทก่อนหน้าเสร็จแล้ว
             completed: true,
             type: 'quiz' as 'video' | 'quiz',
             duration: "100%"
           }
         ]
       },
       {
         id: 3,
         title: "บทที่ 2 การแจกแจงความน่าจะเป็น (Probability Distributions)",
         count: "ไม่ผ่าน",
         items: [
           {
             id: 0,
             title: "2.1 เนื้อหาหลัก",
             lock: false, // ไม่ล็อคเพราะบทก่อนหน้าเสร็จแล้ว
             completed: false,
             type: 'video' as 'video' | 'quiz',
             duration: "0%"
           },
           {
             id: 1,
             title: "2.2 แบบฝึกหัดท้ายบท",
             lock: true, // ล็อคเพราะบทก่อนหน้ายังไม่เสร็จ
             completed: false,
             type: 'quiz' as 'video' | 'quiz',
             duration: "0%"
           }
         ]
       },
       {
         id: 4,
         title: "บทที่ 3 การสุ่มตัวอย่างและการแจกแจงตัวอย่าง (Sampling and Sampling Distributions)",
         count: "ไม่ผ่าน",
         items: [
           {
             id: 0,
             title: "3.1 เนื้อหาหลัก",
             lock: true, // ล็อคเพราะบทก่อนหน้ายังไม่เสร็จ
             completed: false,
             type: 'video' as 'video' | 'quiz',
             duration: "0%"
           },
           {
             id: 1,
             title: "3.2 แบบฝึกหัดท้ายบท",
             lock: true, // ล็อคเพราะบทก่อนหน้ายังไม่เสร็จ
             completed: false,
             type: 'quiz' as 'video' | 'quiz',
             duration: "0%"
           }
         ]
       },
       {
         id: 5,
         title: "บทที่ 4 การประมาณค่า (Estimation)",
         count: "ไม่ผ่าน",
         items: [
           {
             id: 0,
             title: "4.1 เนื้อหาหลัก",
             lock: true, // ล็อคเพราะบทก่อนหน้ายังไม่เสร็จ
             completed: false,
             type: 'video' as 'video' | 'quiz',
             duration: "0%"
           },
           {
             id: 1,
             title: "4.2 แบบฝึกหัดท้ายบท",
             lock: true, // ล็อคเพราะบทก่อนหน้ายังไม่เสร็จ
             completed: false,
             type: 'quiz' as 'video' | 'quiz',
             duration: "0%"
           }
         ]
       },
       {
         id: 6,
         title: "แบบทดสอบหลังเรียน",
         count: "ไม่ผ่าน",
         items: [
           {
             id: 0,
             title: "เริ่มทำแบบทดสอบหลังเรียน",
             lock: true, // ล็อคเพราะบทก่อนหน้ายังไม่เสร็จ
             completed: false,
             type: 'quiz' as 'video' | 'quiz',
             duration: "0%"
           }
         ]
       }
     ];
     return initialData;
   });

   // คำนวณความคืบหน้าทั้งหมด
   const calculateTotalProgress = () => {
     let totalItems = 0;
     let completedItems = 0;
     
     lessonData.forEach(section => {
       section.items.forEach(item => {
         totalItems++;
         if (item.completed) {
           completedItems++;
         }
       });
     });
     
     return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
   };

   // ใช้ useRef เพื่อติดตามการ render ครั้งแรก
   const isFirstRender = useRef(true);

   // หาบทเรียนปัจจุบันที่ควรเรียน (บทแรกที่ยังไม่เสร็จ)
   const findCurrentLesson = () => {
     for (const section of lessonData) {
       for (const item of section.items) {
         if (!item.completed) {
           return {
             sectionId: section.id,
             itemId: item.id,
             title: item.title,
             type: item.type
           };
         }
       }
     }
     // ถ้าทุกบทเรียนเสร็จแล้ว ให้กลับไปที่บทสุดท้าย
     const lastSection = lessonData[lessonData.length - 1];
     const lastItem = lastSection.items[lastSection.items.length - 1];
     return {
       sectionId: lastSection.id,
       itemId: lastItem.id,
       title: lastItem.title,
       type: lastItem.type
     };
   };

   // อัปเดตการล็อคบทเรียนตามความคืบหน้า
   const updateLessonLocks = () => {
     let previousCompleted = true; // บทเรียนแรกไม่ล็อค
     let currentSectionIndex = -1;
     let currentItemIndex = -1;
     
     const updatedData = lessonData.map((section, sectionIndex) => {
       const updatedItems = section.items.map((item, itemIndex) => {
         // ถ้าเป็นบทเรียนแรกของส่วนแรก หรือบทเรียนก่อนหน้าเสร็จแล้ว
         const shouldUnlock = (sectionIndex === 0 && itemIndex === 0) || previousCompleted;
         
         // เก็บตำแหน่งของบทเรียนแรกที่ยังไม่เสร็จ
         if (!item.completed && currentSectionIndex === -1) {
           currentSectionIndex = sectionIndex;
           currentItemIndex = itemIndex;
         }
         
         // อัปเดตสถานะการล็อค
         const updatedItem = {
           ...item,
           lock: !shouldUnlock
         };
         
         // อัปเดตสถานะสำหรับบทเรียนถัดไป
         previousCompleted = item.completed;
         
         return updatedItem;
       });
       
       return {
         ...section,
         items: updatedItems
       };
     });
     
     setLessonData(updatedData);
     
     // ถ้าพบบทเรียนปัจจุบัน ให้เลือกบทเรียนนั้น
     if (currentSectionIndex !== -1) {
       const currentItem = updatedData[currentSectionIndex].items[currentItemIndex];
       setCurrentLessonId(`${currentSectionIndex + 1}-${currentItemIndex}`);
       setCurrentLesson(currentItem.title);
       setCurrentView(currentItem.type);
     }
   };

   // เมื่อโหลดหน้าครั้งแรก ให้อัปเดตการล็อคบทเรียนและเลือกบทเรียนปัจจุบัน
   useEffect(() => {
     updateLessonLocks();
     
     // ค้นหาบทเรียนปัจจุบันและเลือก
     const currentLesson = findCurrentLesson();
     setCurrentLessonId(`${currentLesson.sectionId}-${currentLesson.itemId}`);
     setCurrentLesson(currentLesson.title);
     setCurrentView(currentLesson.type);
     
     // คำนวณความคืบหน้ารวม
     const totalProgress = calculateTotalProgress();
     setProgress(totalProgress);
   }, []); // เรียกใช้เฉพาะครั้งแรกที่โหลดหน้า

   // อัปเดตความคืบหน้าของแต่ละส่วนเมื่อ completedCount เปลี่ยนแปลง
   useEffect(() => {
     // ข้ามการทำงานในครั้งแรก
     if (isFirstRender.current) {
       isFirstRender.current = false;
       return;
     }

     const updatedData = lessonData.map(section => {
       const totalItems = section.items.length;
       const completedItems = section.items.filter(item => item.completed).length;
       
       // ตรวจสอบว่าทุกรายการในส่วนนี้เสร็จสิ้นหรือไม่
       const allCompleted = completedItems === totalItems;
       
       return {
         ...section,
         count: allCompleted ? "ผ่าน" : "ไม่ผ่าน"
       };
     });
     
     // อัปเดตความคืบหน้ารวม
     const totalProgress = calculateTotalProgress();
     setProgress(totalProgress);
     
     // อัปเดต lessonData โดยไม่ทำให้เกิด loop
     setLessonData(updatedData);
     
     // อัปเดตการล็อคบทเรียน
     updateLessonLocks();
   }, [completedCount]); // ใช้ completedCount แทน lessonData เพื่อป้องกัน loop

      // ฟังก์ชันเมื่อบทเรียนเสร็จสิ้น
      const handleLessonComplete = () => {
        // แยก section ID และ item ID
        const [sectionId, itemId] = currentLessonId.split('-').map(Number);
        
        // อัปเดตสถานะการเรียนเป็นเสร็จสิ้น
        const updatedData = lessonData.map(section => {
          if (section.id === sectionId) {
            const updatedItems = section.items.map(item => {
              if (item.id === itemId) {
                return {
                  ...item,
                  completed: true,
                  duration: "100%"
                };
              }
              return item;
            });
            
            return {
              ...section,
              items: updatedItems
            };
          }
          return section;
        });
        
        setLessonData(updatedData);
        // เพิ่มจำนวนบทเรียนที่เรียนจบ
        setCompletedCount(prev => prev + 1);
        
        // หาบทเรียนถัดไปที่ควรเรียน
        let foundNext = false;
        let nextSectionId = sectionId;
        let nextItemId = itemId;
        
        // ค้นหาบทเรียนถัดไปในส่วนปัจจุบัน
        const currentSection = updatedData.find(s => s.id === sectionId);
        if (currentSection) {
          for (let i = itemId + 1; i < currentSection.items.length; i++) {
            if (!currentSection.items[i].completed) {
              nextItemId = i;
              foundNext = true;
              break;
            }
          }
        }
        
        // ถ้าไม่พบในส่วนปัจจุบัน ให้ค้นหาในส่วนถัดไป
        if (!foundNext) {
          for (let s = sectionId; s < updatedData.length; s++) {
            if (s === sectionId) continue; // ข้ามส่วนปัจจุบัน
            
            for (let i = 0; i < updatedData[s].items.length; i++) {
              if (!updatedData[s].items[i].completed) {
                nextSectionId = updatedData[s].id;
                nextItemId = i;
                foundNext = true;
                break;
              }
            }
            
            if (foundNext) break;
          }
        }
        
        // ถ้าพบบทเรียนถัดไป ให้เลือกบทเรียนนั้น
        if (foundNext) {
          const nextSection = updatedData.find(s => s.id === nextSectionId);
          if (nextSection) {
            const nextItem = nextSection.items[nextItemId];
            setCurrentLessonId(`${nextSectionId}-${nextItemId}`);
            setCurrentLesson(nextItem.title);
            setCurrentView(nextItem.type);
          }
        }
      };
      const getCurrentLessonCompleted = () => {
        // แยก section ID และ item ID
        const [sectionId, itemId] = currentLessonId.split('-').map(Number);
        
        // หาบทเรียนปัจจุบัน
        const section = lessonData.find(s => s.id === sectionId);
        if (section) {
          const item = section.items.find(i => i.id === itemId);
          return item?.completed || false;
        }
        
        return false;
      };
      // ฟังก์ชันเมื่อเลือกบทเรียน
      const handleSelectLesson = (sectionId: number, itemId: number, title: string, type: 'video' | 'quiz') => {
        // ตรวจสอบว่าบทเรียนนี้ถูกล็อคหรือไม่
        const section = lessonData.find(s => s.id === sectionId);
        if (section) {
          const item = section.items.find(i => i.id === itemId);
          if (item && item.lock) {
            // ถ้าบทเรียนถูกล็อค ให้แสดงข้อความแจ้งเตือน
            alert("คุณต้องเรียนบทเรียนก่อนหน้าให้เสร็จก่อน");
            return;
          }
        }
        
        // ถ้าบทเรียนไม่ถูกล็อค ให้เลือกบทเรียนนั้น
        setCurrentLessonId(`${sectionId}-${itemId}`);
        setCurrentLesson(title);
        setCurrentView(type);
      };
   
      return (
         <section className="lesson__area section-pb-120">
            <div className="container-fluid">
               <div className="row gx-4">
                  {/* Sidebar */}
                  <div className="col-xl-3 col-lg-4 lesson__sidebar">
                     <div className="lesson__content">
                        <h2 className="title">รายวิขา : ภาษาไทยเพื่อการสื่อสาร</h2>
                        <LessonFaq 
                           onViewChange={setCurrentView} 
                           lessonData={lessonData}
                           onSelectLesson={handleSelectLesson}
                        />
                        <div className="lesson__progress">
                           <h4>ความคืบหน้า</h4>
                           <div className="progress-container">
                              <div className="progress-bar-wrapper">
                                 <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                              </div>
                              <div className="progress-percentage">{progress.toFixed(0)}%</div>
                           </div>
                           <div className="progress-status">
                              <span className="status-text">สถานะ: </span>
                              <span className="status-value">
                                 {progress < 100 ? 'กำลังเรียน' : 'เรียนจบแล้ว'}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
                  {/* Main Content */}
                  <div className="col-xl-9 col-lg-8 lesson__main">
                  <div className="lesson__video-wrap">
   {currentView === 'quiz' ? (
      <LessonQuiz 
         onComplete={handleLessonComplete} 
         isCompleted={getCurrentLessonCompleted()} // เพิ่มการส่ง prop isCompleted
      />
   ) : (
      <LessonVideo
         onComplete={handleLessonComplete}
         currentLesson={currentLesson}
      />
   )}
</div>
                     <div className="lesson__nav-tab fixed-nav-tab">
                        <LessonNavTav />
                     </div>
                  </div>
               </div>
            </div>
         </section>
      );
   };
   
   export default LessonArea;
   
