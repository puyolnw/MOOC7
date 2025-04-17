import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import FooterOne from "../../../layouts/footers/FooterOne";
import HeaderOne from "../../../layouts/headers/HeaderOne";
import LessonArea from "./LessonArea";

interface Lesson {
  lesson_id: number;
  title: string;
  description: string;
  video_url: string;
  duration: string;
  order_number: number;
  can_preview: boolean;
  file_count: number;
}

interface LessonProgress {
  progress_id: number;
  user_id: number;
  lesson_id: number;
  completed: boolean;
  completion_date: string | null;
  duration_seconds: number;
  last_position_seconds: number;
  created_at: string;
  updated_at: string;
}

interface Subject {
  subject_id: number;
  subject_code: string;
  subject_name: string;
  description: string;
  credits: number;
  department: number;
  department_name: string;
  cover_image: string;
  status: string;
  created_at: string;
  updated_at: string;
  pre_test_id: number | null;
  post_test_id: number | null;
  allow_all_lessons: boolean;
  lessons: Lesson[];
  instructors: any[];
  preTest: any | null;
  postTest: any | null;
}

const Lesson = () => {
  const { subjectId, lessonId } = useParams<{ subjectId: string; lessonId: string }>();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchSubjectAndLesson = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!subjectId) {
          setError("ไม่พบรหัสรายวิชา");
          setLoading(false);
          return;
        }
        
        // ดึงข้อมูลรายวิชา
        const response = await axios.get(`${apiURL}/api/courses/subjects/${subjectId}`);
        
        if (response.data.success) {
          setSubject(response.data.subject);
          
          // ถ้ามี lessonId ให้หาบทเรียนที่ตรงกับ lessonId
          if (lessonId && response.data.subject.lessons) {
            const lesson = response.data.subject.lessons.find(
              (l: Lesson) => l.lesson_id === parseInt(lessonId, 10)
            );
            
            if (lesson) {
              setCurrentLesson(lesson);
              
              // ดึงข้อมูลความก้าวหน้าของบทเรียน
              try {
                const token = localStorage.getItem('token');
                if (token) {
                  const progressResponse = await axios.get(
                    `${apiURL}/api/courses/lessons/${lesson.lesson_id}/progress`,
                    {
                      headers: { Authorization: `Bearer ${token}` }
                    }
                  );
                  
                  if (progressResponse.data.success) {
                    setLessonProgress(progressResponse.data.progress);
                  }
                }
              } catch (progressError) {
                console.error("Error fetching lesson progress:", progressError);
                // ไม่ต้อง set error เพราะถือว่าเป็นข้อมูลเสริม
              }
            } else {
              // ถ้าไม่พบบทเรียนที่ตรงกับ lessonId ให้ใช้บทเรียนแรก
              setCurrentLesson(response.data.subject.lessons[0] || null);
            }
          } else if (response.data.subject.lessons && response.data.subject.lessons.length > 0) {
            // ถ้าไม่มี lessonId ให้ใช้บทเรียนแรก
            setCurrentLesson(response.data.subject.lessons[0]);
          }
        } else {
          setError("ไม่สามารถดึงข้อมูลรายวิชาได้");
        }
      } catch (error) {
        console.error("Error fetching subject and lesson:", error);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubjectAndLesson();
  }, [apiURL, subjectId, lessonId]);

  // ฟังก์ชันสำหรับเปลี่ยนบทเรียน
  const handleChangeLesson = async (lesson: Lesson) => {
   setCurrentLesson(lesson);
   
   // ดึงข้อมูลความก้าวหน้าของบทเรียนใหม่
   try {
     const token = localStorage.getItem('token');
     if (token) {
       const progressResponse = await axios.get(
         `${apiURL}/api/lessons/${lesson.lesson_id}/progress`,
         {
           headers: { Authorization: `Bearer ${token}` }
         }
       );
       
       if (progressResponse.data.success) {
         setLessonProgress(progressResponse.data.progress);
       } else {
         setLessonProgress(null);
       }
     }
   } catch (progressError) {
     console.error("Error fetching lesson progress:", progressError);
     setLessonProgress(null);
   }
 };

 // ฟังก์ชันเมื่อเรียนจบบทเรียน
 const handleLessonComplete = async () => {
   // อัพเดตสถานะในหน้าเว็บ
   if (currentLesson && lessonProgress) {
     setLessonProgress({
       ...lessonProgress,
       completed: true,
       completion_date: new Date().toISOString()
     });
   }
   
   // ถ้ามีบทเรียนถัดไป ให้แสดงปุ่มไปบทเรียนถัดไป
   if (subject && currentLesson) {
     const currentIndex = subject.lessons.findIndex(
       lesson => lesson.lesson_id === currentLesson.lesson_id
     );
     
     if (currentIndex < subject.lessons.length - 1) {
       // แสดงปุ่มไปบทเรียนถัดไป
       // (สามารถเพิ่มโค้ดตรงนี้เพื่อแสดงปุ่มหรือแจ้งเตือน)
     } else {
       // แสดงข้อความว่าเรียนจบรายวิชาแล้ว
       // (สามารถเพิ่มโค้ดตรงนี้เพื่อแสดงข้อความหรือแจ้งเตือน)
     }
   }
 };

 return (
   <>
     <HeaderOne />
     <main className="main-area fix">
       {loading ? (
         <div className="text-center py-5">
           <div className="spinner-border text-primary" role="status">
             <span className="visually-hidden">กำลังโหลด...</span>
           </div>
           <p className="mt-2">กำลังโหลดข้อมูลบทเรียน...</p>
         </div>
       ) : error ? (
         <div className="alert alert-danger m-4" role="alert">
           <i className="fas fa-exclamation-triangle me-2"></i>
           {error}
         </div>
       ) : subject && currentLesson ? (
         <LessonArea 
           subject={subject} 
           currentLesson={currentLesson} 
           lessonProgress={lessonProgress}
           onChangeLesson={handleChangeLesson}
           onLessonComplete={handleLessonComplete}
         />
       ) : (
         <div className="alert alert-warning m-4" role="alert">
           <i className="fas fa-exclamation-circle me-2"></i>
           ไม่พบข้อมูลบทเรียน
         </div>
       )}
     </main>
     <FooterOne style={false} style_2={true} />
   </>
 );
};

export default Lesson;
