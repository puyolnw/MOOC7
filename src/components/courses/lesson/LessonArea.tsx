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
         count: "100%",
         items: [
           {
             id: 0,
             title: "เริ่มทำแบบทดสอบก่อนเรียน",
             lock: false,
             completed: true,
             type: 'quiz' as 'video' | 'quiz',
             duration: "100%"
           }
         ]
       },
       {
         id: 2,
         title: "การวิเคราะห์ข้อมูลเบื้องต้น",
         count: "100%",
         items: [
           {
             id: 0,
             title: "1.1 เนื้อหาหลัก",
             lock: false,
             completed: true,
             type: 'video' as 'video' | 'quiz',
             duration: "100%"
           },
           {
             id: 1,
             title: "1.2 แบบฝึกหัดท้ายบท",
             lock: false,
             completed: true,
             type: 'quiz' as 'video' | 'quiz',
             duration: "100%"
           }
         ]
       },
       {
         id: 3,
         title: "การแจกแจงความน่าจะเป็น (Probability Distributions)",
         count: "0%",
         items: [
           {
             id: 0,
             title: "2.1 เนื้อหาหลัก",
             lock: false,
             completed: false,
             type: 'video' as 'video' | 'quiz',
             duration: "0%"
           },
           {
             id: 1,
             title: "2.2 แบบฝึกหัดท้ายบท",
             lock: false,
             completed: false,
             type: 'quiz' as 'video' | 'quiz',
             duration: "0%"
           }
         ]
       },
       {
         id: 4,
         title: "การสุ่มตัวอย่างและการแจกแจงตัวอย่าง (Sampling and Sampling Distributions)",
         count: "0%",
         items: [
           {
             id: 0,
             title: "3.1 เนื้อหาหลัก",
             lock: false,
             completed: false,
             type: 'video' as 'video' | 'quiz',
             duration: "0%"
           },
           {
             id: 1,
             title: "3.2 แบบฝึกหัดท้ายบท",
             lock: false,
             completed: false,
             type: 'quiz' as 'video' | 'quiz',
             duration: "0%"
           }
         ]
       },
       {
         id: 5,
         title: "การประมาณค่า (Estimation)",
         count: "0%",
         items: [
           {
             id: 0,
             title: "4.1 เนื้อหาหลัก",
             lock: false,
             completed: false,
             type: 'video' as 'video' | 'quiz',
             duration: "0%"
           },
           {
             id: 1,
             title: "4.2 แบบฝึกหัดท้ายบท",
             lock: false,
             completed: false,
             type: 'quiz' as 'video' | 'quiz',
             duration: "0%"
           }
         ]
       },
       {
         id: 6,
         title: "แบบทดสอบหลังเรียน",
         count: "0%",
         items: [
           {
             id: 0,
             title: "เริ่มทำแบบทดสอบหลังเรียน",
             lock: false,
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
       const sectionProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
       
       return {
         ...section,
         count: `${Math.round(sectionProgress)}%`
       };
     });
     
     // อัปเดตความคืบหน้ารวม
     const totalProgress = calculateTotalProgress();
     setProgress(totalProgress);
     
     // อัปเดต lessonData โดยไม่ทำให้เกิด loop
     setLessonData(updatedData);
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
   };

   // ฟังก์ชันเมื่อเลือกบทเรียน
   const handleSelectLesson = (sectionId: number, itemId: number, title: string, type: 'video' | 'quiz') => {
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
                     <h2 className="title">เนื้อหาบทเรียน : สถิติประยุกต์</h2>
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
                        <LessonQuiz onComplete={handleLessonComplete} />
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
