import { useState, useEffect, useRef } from "react";
import LessonFaq from "./LessonFaq";
import LessonNavTav from "./LessonNavTav";
import LessonVideo from "./LessonVideo";
import LessonQuiz from "./LessonQuiz";
import axios from "axios";
import "./LessonArea.css";

// สร้าง interface สำหรับข้อมูลบทเรียน
interface LessonItem {
  id: number;
  title: string;
  lock: boolean;
  completed: boolean;
  type: 'video' | 'quiz';
  duration: string;
  lessonId?: number;
  quizId?: number;
}

// สร้าง interface สำหรับข้อมูลส่วน (section)
interface SectionData {
  id: number;
  title: string;
  count: string;
  items: LessonItem[];
}

interface LessonAreaProps {
  isLoading?: boolean;
  subjectData?: any;
  error?: string | null;
  subjectId?: string;
}

const LessonArea = ({ isLoading = false, subjectData, error = null, subjectId }: LessonAreaProps) => {
   const [currentView, setCurrentView] = useState<'video' | 'quiz'>('video');
   const [progress, setProgress] = useState<number>(0);
   const [currentLesson, setCurrentLesson] = useState<string>("");
   const [currentLessonId, setCurrentLessonId] = useState<string>(""); // format: "section-item"
   const [completedCount, setCompletedCount] = useState(0);
   const [currentLessonData, setCurrentLessonData] = useState<any>(null);
   const [currentQuizData, setCurrentQuizData] = useState<any>(null);
   const [youtubeId, setYoutubeId] = useState<string>("");
   
   const apiURL = import.meta.env.VITE_API_URL as string;
   
   // สร้าง state เก็บข้อมูลบทเรียนทั้งหมด
   const [lessonData, setLessonData] = useState<SectionData[]>([]);

   // โหลดข้อมูลความคืบหน้าของผู้เรียน
   useEffect(() => {
      const fetchUserProgress = async () => {
         try {
            if (!subjectId) return;
            
            const token = localStorage.getItem("token");
            if (!token) return;
            
            const response = await axios.get(`${apiURL}/api/courses/subjects/${subjectId}/progress`, {
               headers: {
                  Authorization: `Bearer ${token}`
               }
            });
            
            if (response.data.success) {
               // คำนวณความคืบหน้ารวม
               setProgress(response.data.progress?.progress_percentage || 0);
               setCompletedCount(response.data.progress?.completed_lessons || 0);
            }
         } catch (error) {

         }
      };
      
      fetchUserProgress();
   }, [subjectId, apiURL]);

   // แปลงข้อมูลจาก API เป็นรูปแบบที่ใช้ในคอมโพเนนต์
   useEffect(() => {
      if (!subjectData) return;
      
      try {
        const sections: SectionData[] = [];
        
        // เพิ่มแบบทดสอบก่อนเรียน (ถ้ามี)
        if (subjectData.preTest || (subjectData.pre_test_id && subjectData.preTest)) {
          const preTestData = subjectData.preTest || {
            quiz_id: subjectData.pre_test_id
          };
          
          sections.push({
            id: 1,
            title: "แบบทดสอบก่อนเรียน",
            count: subjectData.pre_test_completed ? "100%" : "0%",
            items: [
              {
                id: 0,
                title: "เริ่มทำแบบทดสอบก่อนเรียน",
                lock: false,
                completed: subjectData.pre_test_completed || false,
                type: 'quiz',
                duration: subjectData.pre_test_completed ? "100%" : "0%",
                quizId: preTestData.quiz_id
              }
            ]
          });
        }
        
        // เพิ่มบทเรียนหลัก
        if (subjectData.lessons && subjectData.lessons.length > 0) {
          // เรียงลำดับบทเรียนตาม order_number หรือ lesson_id
          const sortedLessons = [...subjectData.lessons].sort((a, b) => {
            // ถ้ามี order_number ให้เรียงตามนั้น
            if (a.order_number !== undefined && b.order_number !== undefined) {
              return a.order_number - b.order_number;
            }
            // ถ้าไม่มี ให้เรียงตาม lesson_id
            return a.lesson_id - b.lesson_id;
          });
          
          // กำหนดจำนวนบทเรียนต่อบท
          const lessonsPerChapter = 2; // สามารถปรับเปลี่ยนตามความเหมาะสม
          
          // ตรวจสอบว่าทำแบบทดสอบก่อนเรียนแล้วหรือยัง
          const preTestCompleted = !subjectData.pre_test_id || subjectData.pre_test_completed;
          
          // แบ่งบทเรียนเป็นบทๆ
          for (let chapterIndex = 0; chapterIndex < Math.ceil(sortedLessons.length / lessonsPerChapter); chapterIndex++) {
            const chapterLessons = sortedLessons.slice(
              chapterIndex * lessonsPerChapter, 
              (chapterIndex + 1) * lessonsPerChapter
            );
            
            const lessonItems: LessonItem[] = [];
            
            // ตรวจสอบว่าบทก่อนหน้าเรียนจบหรือยัง
            const previousChaptersCompleted = chapterIndex === 0 || 
              sections.filter(s => s.id > 1 && s.id < (2 + chapterIndex)).every(s => 
                s.items.every(item => item.completed)
              );
            
            // ล็อคบทเรียนถ้ายังไม่ได้ทำแบบทดสอบก่อนเรียนหรือยังไม่ได้เรียนบทก่อนหน้าให้จบ
            const chapterLocked = !preTestCompleted || !previousChaptersCompleted;
            
            // เพิ่มบทเรียนในบทนี้
            chapterLessons.forEach((lesson, index) => {
              // ตรวจสอบว่าบทเรียนก่อนหน้าในบทเดียวกันเรียนจบหรือยัง
              const previousLessonsInChapterCompleted = index === 0 || 
                chapterLessons.slice(0, index).every(l => l.completed);
              
              // บทเรียนจะถูกล็อคถ้า: บทถูกล็อค หรือ บทเรียนก่อนหน้าในบทเดียวกันยังไม่เสร็จ
              const lessonLocked = chapterLocked || (index > 0 && !previousLessonsInChapterCompleted);
              
              // สร้างชื่อบทเรียนในรูปแบบ "เนื้อหา X.Y ชื่อบทเรียน"
              const formattedTitle = `เนื้อหา ${chapterIndex + 1}.${index + 1} ${lesson.title}`;
              
              // เพิ่มบทเรียนวิดีโอ
              lessonItems.push({
                id: index * 2,
                title: formattedTitle,
                lock: lessonLocked,
                completed: lesson.completed || false,
                type: 'video',
                duration: lesson.completed ? "100%" : `${lesson.progress || 0}%`,
                lessonId: lesson.lesson_id
              });
              
              // เพิ่มแบบทดสอบท้ายบทเรียน (ถ้ามี)
              if (lesson.quiz) {
                // สร้างชื่อแบบทดสอบในรูปแบบ "แบบทดสอบที่ X.Y ชื่อแบบทดสอบ"
                const quizTitle = `แบบทดสอบที่ ${chapterIndex + 1}.${index + 1} ${lesson.title}`;
                
                lessonItems.push({
                  id: index * 2 + 1,
                  title: quizTitle,
                  lock: lessonLocked || !lesson.completed, // ล็อคถ้ายังไม่เรียนจบบทเรียน
                  completed: lesson.quiz_completed || false,
                  type: 'quiz',
                  duration: lesson.quiz_completed ? "100%" : "0%",
                  quizId: lesson.quiz.quiz_id
                });
              }
            });
            
            // คำนวณความคืบหน้าของบท
            const totalItems = lessonItems.length;
            const completedItems = lessonItems.filter(item => item.completed).length;
            const sectionProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
            
            sections.push({
              id: 2 + chapterIndex,
              title: `บทที่ ${chapterIndex + 1}`,
              count: `${Math.round(sectionProgress)}%`,
              items: lessonItems
            });
          }
        }
        
        // เพิ่มแบบทดสอบหลังเรียน (ถ้ามี)
        if (subjectData.postTest || (subjectData.post_test_id && subjectData.postTest)) {
          // ตรวจสอบว่าเรียนจบทุกบทหรือยัง
          const allLessonsCompleted = sections.filter(s => s.id > 1).every(s => 
            s.items.every(item => item.completed)
          );
          
          const postTestData = subjectData.postTest || {
            quiz_id: subjectData.post_test_id
          };
          
          sections.push({
            id: sections.length + 1,
            title: "แบบทดสอบหลังเรียน",
            count: subjectData.post_test_completed ? "100%" : "0%",
            items: [
              {
                id: 0,
                title: "เริ่มทำแบบทดสอบหลังเรียน",
                lock: !allLessonsCompleted, // ล็อคถ้ายังเรียนไม่จบทุกบท
                completed: subjectData.post_test_completed || false,
                type: 'quiz',
                duration: subjectData.post_test_completed ? "100%" : "0%",
                quizId: postTestData.quiz_id
              }
            ]
          });
        }
        
        setLessonData(sections);
        
        // เลือกบทเรียนแรกโดยอัตโนมัติถ้ายังไม่ได้เลือก
        if (sections.length > 0 && !currentLessonId) {
          const firstSection = sections[0];
          if (firstSection.items.length > 0) {
            const firstItem = firstSection.items[0];
            setCurrentLessonId(`${firstSection.id}-${firstItem.id}`);
            setCurrentLesson(firstItem.title);
            setCurrentView(firstItem.type);
            
            // โหลดข้อมูลบทเรียนหรือแบบทดสอบ
            if (firstItem.type === 'video' && firstItem.lessonId) {
              fetchLessonData(firstItem.lessonId);
            } else if (firstItem.type === 'quiz' && firstItem.quizId) {
              fetchQuizData(firstItem.quizId);
            }
          }
        }
      } catch (error) {
        console.error("Error processing subject data:", error);
      }
   }, [subjectData, currentLessonId, apiURL]);

   // ฟังก์ชันสำหรับดึงข้อมูลบทเรียน
   const fetchLessonData = async (lessonId: number) => {
      try {
         const token = localStorage.getItem("token");
         if (!token) return;
         
         const response = await axios.get(`${apiURL}/api/courses/lessons/${lessonId}`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         });
         
         if (response.data.success) {
            setCurrentLessonData(response.data.lesson);
            
            // ดึง YouTube ID จาก URL
            const youtubeUrl = response.data.lesson.video_url;
            if (youtubeUrl) {
               const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
               const match = youtubeUrl.match(youtubeRegex);
               if (match && match[1]) {
                  setYoutubeId(match[1]);
               }
            }
         }
      } catch (error) {

      }
   };

   // ฟังก์ชันสำหรับดึงข้อมูลแบบทดสอบ
   // ฟังก์ชันสำหรับดึงข้อมูลแบบทดสอบ
const fetchQuizData = async (quizId: number) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {

      return;
    }
    
    const apiEndpoint = `${apiURL}/api/courses/quizzes/${quizId}`;

    
    const response = await axios.get(apiEndpoint, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    

    
    // Check if the response has quiz data (regardless of success field)
    if (response.data.quiz) {
      setCurrentQuizData(response.data.quiz);
    } else if (response.data.success && response.data.data) {
      // Alternative format
      setCurrentQuizData(response.data.data);
    } else {

    }
  } catch (error) {

  }
};


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
 }, [completedCount]);

 // ฟังก์ชันเมื่อบทเรียนเสร็จสิ้น
 const handleLessonComplete = async () => {
   // แยก section ID และ item ID
   const [sectionId, itemId] = currentLessonId.split('-').map(Number);
   
   try {
     const token = localStorage.getItem("token");
     if (!token) return;
     
     // อัปเดตสถานะการเรียนเป็นเสร็จสิ้น
     const updatedData = lessonData.map(section => {
       if (section.id === sectionId) {
         const updatedItems = section.items.map(item => {
           if (item.id === itemId) {
             // ส่งข้อมูลการเรียนจบไปยัง API (ถ้ายังไม่เคยทำเสร็จ)
             if (!item.completed) {
               if (item.type === 'video' && item.lessonId) {
                 axios.post(`${apiURL}/api/courses/lessons/${item.lessonId}/complete`, {}, {
                   headers: { Authorization: `Bearer ${token}` }
                 }).catch(err => console.error("Error marking lesson as complete:", err));
               } else if (item.type === 'quiz' && item.quizId) {
                 axios.post(`${apiURL}/api/courses/quizzes/${item.quizId}/complete`, {}, {
                   headers: { Authorization: `Bearer ${token}` }
                 }).catch(err => console.error("Error marking quiz as complete:", err));
               }
             }
             
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
     
     // ปลดล็อคบทเรียนถัดไป
     const unlockNextLessons = (data: SectionData[]) => {
       let foundCurrent = false;
       let nextItemUnlocked = false;
       
       return data.map(section => {
         const updatedItems = section.items.map(item => {
           // ถ้าเจอบทเรียนปัจจุบัน
           if (section.id === sectionId && item.id === itemId) {
             foundCurrent = true;
             return item;
           }
           
           // ถ้าเป็นบทเรียนถัดไปและยังไม่ได้ปลดล็อค
           if (foundCurrent && item.lock && !nextItemUnlocked) {
             nextItemUnlocked = true;
             return {
               ...item,
               lock: false
             };
           }
           
           return item;
         });
         
         return {
           ...section,
           items: updatedItems
         };
       });
     };
     
     const finalData = unlockNextLessons(updatedData);
     setLessonData(finalData);
     
     // เพิ่มจำนวนบทเรียนที่เรียนจบ
     setCompletedCount(prev => prev + 1);
     
     // อัปเดตความคืบหน้าในหน้าเว็บ
     const newProgress = calculateTotalProgress();
     setProgress(newProgress);
     
   } catch (error) {

   }
 };

 // ฟังก์ชันเมื่อเลือกบทเรียน
 const handleSelectLesson = (sectionId: number, itemId: number, title: string, type: 'video' | 'quiz') => {
   // ตรวจสอบว่าบทเรียนนี้ถูกล็อคหรือไม่
   const section = lessonData.find(s => s.id === sectionId);
   if (section) {
     const item = section.items.find(i => i.id === itemId);
     if (item && item.lock) {
       alert("บทเรียนนี้ถูกล็อค คุณต้องเรียนบทเรียนก่อนหน้าให้เสร็จก่อน");
       return;
     }
   }
   
   setCurrentLessonId(`${sectionId}-${itemId}`);
   setCurrentLesson(title);
   setCurrentView(type);
   
   // หาข้อมูลบทเรียนที่เลือก
   if (section) {
     const item = section.items.find(i => i.id === itemId);
     if (item) {
       if (type === 'video' && item.lessonId) {
         fetchLessonData(item.lessonId);
       } else if (type === 'quiz' && item.quizId) {
         fetchQuizData(item.quizId);
       }
     }
   }
 };

 // ถ้าไม่มีข้อมูลบทเรียน ให้แสดงข้อมูลตัวอย่าง
 useEffect(() => {
   if (!subjectData && !isLoading && lessonData.length === 0) {
     // ข้อมูลตัวอย่างสำหรับการแสดงผล
     const sampleData: SectionData[] = [
       {
         id: 2,
         title: "บทที่ 1 การวิเคราะห์ข้อมูลเบื้องต้น",
         count: "100%",
         items: [
           {
             id: 0,
             title: "1.1 เนื้อหาหลัก",
             lock: false,
             completed: true,
             type: 'video',
             duration: "100%"
           },
           {
             id: 1,
             title: "แบบทดสอบ: 1.1 เนื้อหาหลัก",
             lock: false,
             completed: true,
             type: 'quiz',
             duration: "100%"
           }
         ]
       },
       {
         id: 3,
         title: "บทที่ 2 การแจกแจงความน่าจะเป็น",
         count: "0%",
         items: [
           {
             id: 0,
             title: "2.1 เนื้อหาหลัก",
             lock: false,
             completed: false,
             type: 'video',
             duration: "0%"
           },
           {
             id: 1,
             title: "แบบทดสอบ: 2.1 เนื้อหาหลัก",
             lock: true,
             completed: false,
             type: 'quiz',
             duration: "0%"
           }
         ]
       }
     ];
     
     // เพิ่มแบบทดสอบก่อนเรียน (ตัวอย่าง)
     sampleData.unshift({
       id: 1,
       title: "แบบทดสอบก่อนเรียน",
       count: "100%",
       items: [
         {
           id: 0,
           title: "เริ่มทำแบบทดสอบก่อนเรียน",
           lock: false,
           completed: true,
           type: 'quiz',
           duration: "100%"
         }
       ]
     });
     
     // เพิ่มแบบทดสอบหลังเรียน (ตัวอย่าง)
     sampleData.push({
       id: 4,
       title: "แบบทดสอบหลังเรียน",
       count: "0%",
       items: [
         {
           id: 0,
           title: "เริ่มทำแบบทดสอบหลังเรียน",
           lock: true,
           completed: false,
           type: 'quiz',
           duration: "0%"
         }
       ]
     });
     
     setLessonData(sampleData);
     setProgress(40); // ตัวอย่างความคืบหน้า 40%
     
     // เลือกบทเรียนแรกโดยอัตโนมัติ
     setCurrentLessonId("2-0");
     setCurrentLesson("1.1 เนื้อหาหลัก");
     setCurrentView('video');
     setYoutubeId("BboMpayJomw"); // ตัวอย่าง YouTube ID
   }
 }, [subjectData, isLoading]);

 if (isLoading) {
   return (
     <section className="lesson__area section-pb-120">
       <div className="container-fluid">
         <div className="row">
           <div className="col-12 text-center py-5">
             <div className="spinner-border text-primary" role="status">
               <span className="visually-hidden">Loading...</span>
             </div>
             <p className="mt-3">กำลังโหลดข้อมูลบทเรียน...</p>
           </div>
         </div>
       </div>
     </section>
   );
 }

 if (error) {
   return (
     <section className="lesson__area section-pb-120">
       <div className="container-fluid">
         <div className="row">
           <div className="col-12 text-center py-5">
             <div className="alert alert-danger">
               <i className="fas fa-exclamation-circle me-2"></i>
               {error}
             </div>
             <button 
               className="btn btn-primary mt-3"
               onClick={() => window.location.reload()}
             >
               <i className="fas fa-sync-alt me-2"></i>
               ลองใหม่อีกครั้ง
             </button>
           </div>
         </div>
       </div>
     </section>
   );
 }

 return (
    <section className="lesson__area section-pb-120">
       <div className="container-fluid">
          <div className="row gx-4">
             {/* Sidebar */}
             <div className="col-xl-3 col-lg-4 lesson__sidebar">
                <div className="lesson__content">
                   <h2 className="title">เนื้อหาบทเรียน : {subjectData?.title || subjectData?.subject_name || "สถิติประยุกต์"}</h2>
                   <LessonFaq 
                      onViewChange={setCurrentView} 
                      lessonData={lessonData}
                      onSelectLesson={handleSelectLesson}
                      currentLessonId={currentLessonId}
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
  currentQuizData ? (
    <LessonQuiz 
      onComplete={handleLessonComplete} 
      quizData={currentQuizData}
    />
  ) : (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">กำลังโหลดแบบทดสอบ...</span>
      </div>
      <p className="mt-3">กำลังโหลดแบบทดสอบ...</p>
    </div>
  )
) : (
                      <LessonVideo
                         onComplete={handleLessonComplete}
                         currentLesson={currentLesson}
                         youtubeId={youtubeId}
                         lessonData={currentLessonData}
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
          

