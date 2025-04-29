import { useState, useEffect } from "react";
import axios from 'axios';
import LessonFaq from "./LessonFaq";
import LessonNavTav from "./LessonNavTav";
import LessonVideo from "./LessonVideo";
import LessonQuiz from "./LessonQuiz";
import "./LessonArea.css";

// เพิ่มการใช้ API URL จาก .env
const API_URL = import.meta.env.VITE_API_URL;

// ปรับปรุง interface ให้ตรงกับข้อมูลจาก API
interface LessonItem {
  id: number;
  lesson_id: number; // เพิ่ม lesson_id จาก API
  title: string;
  lock: boolean;
  completed: boolean;
  type: 'video' | 'quiz';
  duration: string;
  video_url?: string; // เพิ่มสำหรับวิดีโอ
  quiz_id?: number; // เพิ่มสำหรับแบบทดสอบ
}

interface SectionData {
  id: number;
  subject_id: number;
  title: string;
  count: string;
  items: LessonItem[];
  quiz_id?: number; // เพิ่ม quiz_id ในระดับ section
}


interface CourseData {
  course_id: number;
  title: string;
  description: string;
  subjects: {
    subject_id: number;
    title: string;
    description: string;
    lessons: {
      lesson_id: number;
      title: string;
      description: string;
      video_url: string;
      duration: number;
      quiz_id?: number | null;
      quiz?: {
        quiz_id: number;
        title: string;
        description: string;
        questions: any[];
      };
    }[];
  }[];
}

interface LessonAreaProps {
  courseId?: number;
}

const LessonArea = ({ courseId: propsCourseId }: LessonAreaProps) => {
  const [courseId] = useState<number>(propsCourseId || 1); // ใช้ค่าจาก props หรือค่าเริ่มต้น
  const [currentView, setCurrentView] = useState<'video' | 'quiz'>('video');
  const [progress, setProgress] = useState<number>(0);
  const [currentLesson, setCurrentLesson] = useState<string>("");
  const [currentLessonId, setCurrentLessonId] = useState<string>("");
  const [completedCount, setCompletedCount] = useState(0);
  const [currentSubjectId, setCurrentSubjectId] = useState<number | null>(null);
  const [currentSubjectTitle, setCurrentSubjectTitle] = useState<string>(""); // เพิ่ม state เก็บชื่อวิชาปัจจุบัน
  const [currentLessonData, setCurrentLessonData] = useState<any>(null);
  const [currentQuizData, setCurrentQuizData] = useState<any>(null);
  const [youtubeId, setYoutubeId] = useState<string>("");
  
  // สร้าง state เก็บข้อมูลบทเรียนทั้งหมด
  const [lessonData, setLessonData] = useState<SectionData[]>([]);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // โหลดข้อมูลหลักสูตรทั้งหมดเมื่อโหลดหน้า
  // ในส่วนของการแปลงข้อมูลจาก API เป็นรูปแบบที่ใช้ใน LessonFaq
useEffect(() => {
  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/learn/course/${courseId}/full-content`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setCourseData(response.data.course);
        
        // แปลงข้อมูลจาก API เป็นรูปแบบที่ใช้ใน LessonFaq
        const sections: SectionData[] = [];
        
        // สร้าง section สำหรับวิชา (subject)
        const subject = response.data.course.subjects[0]; // เลือกวิชาแรก
        setCurrentSubjectTitle(subject.title); // เก็บชื่อวิชา
        
        // สร้าง section สำหรับแต่ละบทเรียน (lesson)
        subject.lessons.forEach((lesson: any, lessonIndex: number) => {
          // สร้าง section สำหรับบทเรียน
          const sectionItems: LessonItem[] = [];
          
          // เพิ่มรายการวิดีโอ
          sectionItems.push({
            id: 0,
            lesson_id: lesson.lesson_id,
            title: `${lessonIndex + 1}.1 เนื้อหาวิดีโอ`,
            lock: false,
            completed: lesson.progress?.video_completed || false, // ใช้ข้อมูลจาก API
            type: 'video',
            duration: lesson.progress?.video_completed ? "100%" : "0%", // ใช้ข้อมูลจาก API
            video_url: lesson.video_url,
            quiz_id: lesson.quiz ? lesson.quiz.quiz_id : undefined
          });
          
          // เพิ่มรายการแบบทดสอบ (ถ้ามี)
          if (lesson.quiz) {
            sectionItems.push({
              id: 1,
              lesson_id: lesson.lesson_id,
              title: `${lessonIndex + 1}.2 แบบทดสอบท้ายบท`,
              lock: !lesson.progress?.video_completed, // ล็อคถ้ายังไม่ดูวิดีโอจบ
              completed: lesson.quiz.progress?.passed || false, // ใช้ข้อมูลจาก API
              type: 'quiz',
              duration: lesson.quiz.progress?.passed ? "100%" : "0%", // ใช้ข้อมูลจาก API
              quiz_id: lesson.quiz.quiz_id
            });
          }
          
          // เพิ่ม section
          sections.push({
            id: lesson.lesson_id,
            subject_id: subject.subject_id,
            title: `บทที่ ${lessonIndex + 1}: ${lesson.title}`,
            count: lesson.progress?.overall_completed ? "ผ่าน" : "ไม่ผ่าน", // ใช้ข้อมูลจาก API
            items: sectionItems,
            quiz_id: lesson.quiz ? lesson.quiz.quiz_id : undefined
          });
        });
        
        setLessonData(sections);
        
        // ตั้งค่าบทเรียนแรก
        if (sections.length > 0 && sections[0].items.length > 0) {
          const firstSection = sections[0];
          const firstItem = firstSection.items[0];
          
          setCurrentLessonId(`${firstSection.id}-${firstItem.id}`);
          setCurrentLesson(firstItem.title);
          setCurrentView(firstItem.type);
          setCurrentSubjectId(subject.subject_id);
          
          setCurrentLessonData({
            ...firstItem,
            quiz_id: firstSection.quiz_id
          });
          
          // ตั้งค่า YouTube ID จาก URL
          if (firstItem.video_url) {
            const videoId = extractYoutubeId(firstItem.video_url);
            if (videoId) setYoutubeId(videoId);
          }
          
          // ตั้งค่าข้อมูลแบบทดสอบ
          if (firstSection.quiz_id) {
            const firstLesson = subject.lessons[0];
            if (firstLesson.quiz) {
              setCurrentQuizData(firstLesson.quiz);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchCourseData();
}, [courseId]);


  
  // โหลดความคืบหน้าของวิชาเมื่อมีการเปลี่ยนวิชา
  useEffect(() => {
    const fetchSubjectProgress = async () => {
      if (!currentSubjectId) return;
      
      try {
        // แก้ไขการเรียก API โดยใช้ API_URL จาก .env
        const response = await axios.get(`${API_URL}/api/learn/subject/${currentSubjectId}/progress`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.success) {
          const { progressPercentage, completedLessons } = response.data;
          
          setProgress(progressPercentage);
          setCompletedCount(completedLessons);
          
          // อัปเดตสถานะการเรียนจบของแต่ละบทเรียน
          updateLessonCompletionStatus();
        }
      } catch (error) {
        console.error("Error fetching subject progress:", error);
      }
    };
    
    fetchSubjectProgress();
  }, [currentSubjectId, completedCount]);
  
  // ฟังก์ชันสกัด YouTube ID จาก URL
  const extractYoutubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  // ฟังก์ชันค้นหาแบบทดสอบตาม ID

  
  // อัปเดตสถานะการเรียนจบของแต่ละบทเรียน
  const updateLessonCompletionStatus = async () => {
    const updatedLessonData = [...lessonData];
    
    for (const section of updatedLessonData) {
      for (const item of section.items) {
        if (item.type === 'video') {
          try {
            // แก้ไขการเรียก API โดยใช้ API_URL จาก .env
            const response = await axios.get(`${API_URL}/api/learn/lesson/${item.lesson_id}/video-progress`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            });
            
            if (response.data.success && response.data.progress) {
              item.completed = response.data.progress.video_completed;
              
              // อัปเดตสถานะการล็อคของแบบทดสอบถัดไป
              const nextItem = section.items.find(i => i.id === item.id + 1 && i.type === 'quiz');
              if (nextItem) {
                nextItem.lock = !item.completed;
              }
            }
          } catch (error) {
            console.error(`Error fetching progress for lesson ${item.lesson_id}:`, error);
          }
        }
      }
      
      // อัปเดตสถานะของวิชา
      const allCompleted = section.items.every(item => item.completed);
      section.count = allCompleted ? "ผ่าน" : "ไม่ผ่าน";
    }
    
    setLessonData(updatedLessonData);
  };
  
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
    findAndSetNextLesson(sectionId, itemId, updatedData);
  };
  
  // ฟังก์ชันค้นหาและตั้งค่าบทเรียนถัดไป
  const findAndSetNextLesson = (currentSectionId: number, currentItemId: number, updatedData: SectionData[]) => {
    let foundNext = false;
    let nextSectionId = currentSectionId;
    let nextItemId = currentItemId;
    
    // ค้นหาบทเรียนถัดไปในส่วนปัจจุบัน
    const currentSection = updatedData.find(s => s.id === currentSectionId);
    if (currentSection) {
      for (let i = 0; i < currentSection.items.length; i++) {
        if (i > currentItemId && !currentSection.items[i].completed && !currentSection.items[i].lock) {
          nextItemId = i;
          foundNext = true;
          break;
        }
      }
    }
    
    // ถ้าไม่พบในส่วนปัจจุบัน ให้ค้นหาในส่วนถัดไป
    if (!foundNext) {
      for (let s = 0; s < updatedData.length; s++) {
        const section = updatedData[s];
        if (section.id === currentSectionId) continue; // ข้ามส่วนปัจจุบัน
        
               // ค้นหาบทเรียนถัดไปที่ยังไม่เสร็จและไม่ล็อค
               for (let i = 0; i < section.items.length; i++) {
                if (!section.items[i].completed && !section.items[i].lock) {
                  nextSectionId = section.id;
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
              setCurrentSubjectId(nextSection.subject_id);
              
              setCurrentLessonData({
                ...nextItem,
                quiz_id: nextItem.type === 'quiz' ? nextItem.quiz_id : nextSection.quiz_id
              });
              
              // ตั้งค่า YouTube ID จาก URL
              if (nextItem.type === 'video' && nextItem.video_url) {
                const videoId = extractYoutubeId(nextItem.video_url);
                if (videoId) setYoutubeId(videoId);
              }
              
              // ตั้งค่าข้อมูลแบบทดสอบ
              if (courseData && nextItem.type === 'quiz' && nextItem.quiz_id) {
                // หา lesson ที่ตรงกับ nextSectionId (lesson_id)
                const lesson = courseData.subjects[0].lessons.find(l => l.lesson_id === nextSectionId);
                if (lesson && lesson.quiz) {
                  setCurrentQuizData(lesson.quiz);
                }
              }
            }
          }
        };
        
        // ตรวจสอบว่าบทเรียนปัจจุบันเรียนจบแล้วหรือไม่
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
            if (item) {  // เพิ่มการตรวจสอบว่า item ไม่เป็น undefined
              if (item.lock) {
                // ถ้าบทเรียนถูกล็อค ให้แสดงข้อความแจ้งเตือน
                alert("คุณต้องเรียนบทเรียนก่อนหน้าให้เสร็จก่อน");
                return;
              }
              
              // ถ้าบทเรียนไม่ถูกล็อค ให้เลือกบทเรียนนั้น
              setCurrentLessonId(`${sectionId}-${itemId}`);
              setCurrentLesson(title);
              setCurrentView(type);
              setCurrentSubjectId(section.subject_id);
              
              setCurrentLessonData({
                ...item,
                quiz_id: type === 'quiz' ? item.quiz_id : section.quiz_id
              });
              
              // ตั้งค่า YouTube ID จาก URL
              if (type === 'video' && item.video_url) {
                const videoId = extractYoutubeId(item.video_url);
                if (videoId) setYoutubeId(videoId);
              }
              
              // ตั้งค่าข้อมูลแบบทดสอบ
              if (courseData && type === 'quiz' && item.quiz_id) {
                // หา lesson ที่ตรงกับ sectionId (lesson_id)
                const lesson = courseData.subjects[0].lessons.find(l => l.lesson_id === sectionId);
                if (lesson && lesson.quiz) {
                  setCurrentQuizData(lesson.quiz);
                }
              }
            }
          }
        };
      
        // ใช้ useRef เพื่อติดตามการ render ครั้งแรก

      
        if (loading) {
          return <div className="loading">กำลังโหลด...</div>;
        }
      
        return (
          <section className="lesson__area section-pb-120">
            <div className="container-fluid">
              <div className="row gx-4">
                {/* Sidebar */}
                <div className="col-xl-3 col-lg-4 lesson__sidebar">
                  <div className="lesson__content">
                    <h2 className="title">วิชา: {currentSubjectTitle || ""}</h2>
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
                        isCompleted={getCurrentLessonCompleted()}
                        quizId={currentLessonData?.quiz_id || 0}
                        quizData={currentQuizData?.questions || []}
                      />
                    ) : (
                      <LessonVideo
                        onComplete={handleLessonComplete}
                        currentLesson={currentLesson}
                        youtubeId={youtubeId}
                        lessonId={currentLessonData?.lesson_id || 0}
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
      