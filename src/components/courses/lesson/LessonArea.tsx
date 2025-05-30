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
  lesson_id: number;
  title: string;
  lock: boolean;
  completed: boolean;
  type: 'video' | 'quiz';
  duration: string;
  video_url?: string;
  quiz_id?: number;
  status?: 'passed' | 'failed' | 'awaiting_review'; // เพิ่มฟิลด์ status
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
  instructors: Array<{
    instructor_id: number;
    name: string;
    position: string;
    avatar?: string;
    bio?: string;
  }>;
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
  courseId: number;
  subjectId: number; // เพิ่ม subjectId เพื่อรับค่าจาก props
}

const LessonArea = ({ courseId, subjectId }: LessonAreaProps) => {

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
      
      if (response.data.success && response.data.course) {
        setCourseData(response.data.course);
        
        // แปลงข้อมูลจาก API เป็นรูปแบบที่ใช้ใน LessonFaq
        const sections: SectionData[] = [];
        
        // ตรวจสอบว่ามีวิชาหรือไม่
        if (response.data.course.subjects && response.data.course.subjects.length > 0) {
          // ค้นหาวิชาที่ตรงกับ subjectId ที่รับมา
          const subject = response.data.course.subjects.find((s: any) => s.subject_id === subjectId);
          
          if (!subject) {
            console.error(`ไม่พบรายวิชารหัส ${subjectId} ในหลักสูตรรหัส ${courseId}`);
            setLoading(false);
            return;
          }
          
          setCurrentSubjectTitle(subject.title); // เก็บชื่อวิชา
          setCurrentSubjectId(subject.subject_id);
          
          // ตรวจสอบว่ามีบทเรียนหรือไม่
          if (subject.lessons && subject.lessons.length > 0) {
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
                completed: lesson.progress?.video_completed || false,
                type: 'video',
                duration: lesson.progress?.video_completed ? "100%" : "0%",
                video_url: lesson.video_url,
                quiz_id: lesson.quiz ? lesson.quiz.quiz_id : undefined,
                status: lesson.progress?.video_completed ? 'passed' : 'failed'
              });
              
              // เพิ่มรายการแบบทดสอบ (ถ้ามี)
              if (lesson.quiz) {
                // ตรวจสอบสถานะของแบบทดสอบ
                let quizStatus: 'passed' | 'failed' | 'awaiting_review' = 'failed';
                
                if (lesson.quiz.progress?.passed) {
                  quizStatus = 'passed';
                } else if (lesson.quiz.progress?.awaiting_review || 
                          (lesson.quiz.type === 'special_fill_in_blank' && 
                           lesson.quiz.progress?.completed && 
                           !lesson.quiz.progress?.passed)) {
                  quizStatus = 'awaiting_review';
                }
                
                sectionItems.push({
                  id: 1,
                  lesson_id: lesson.lesson_id,
                  title: `${lessonIndex + 1}.2 แบบทดสอบท้ายบท`,
                  lock: !lesson.progress?.video_completed, // ล็อคถ้ายังไม่ดูวิดีโอจบ
                  completed: lesson.quiz.progress?.passed || lesson.quiz.progress?.awaiting_review || false,
                  type: 'quiz',
                  duration: lesson.quiz.progress?.passed ? "100%" : 
                           lesson.quiz.progress?.awaiting_review ? "50%" : "0%",
                  quiz_id: lesson.quiz.quiz_id,
                  status: quizStatus
                });
              }
              
              // เพิ่ม section
              sections.push({
                id: lesson.lesson_id,
                subject_id: subject.subject_id,
                title: `บทที่ ${lessonIndex + 1}: ${lesson.title}`,
                count: lesson.progress?.overall_completed ? "ผ่าน" : 
                       (lesson.quiz && lesson.quiz.progress?.awaiting_review) ? "รอตรวจ" : "ไม่ผ่าน",
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
          } else {
            console.log("ไม่พบบทเรียนในวิชานี้");
          }
        } else {
          console.log("ไม่พบวิชาในหลักสูตรนี้");
        }
      } else {
        console.error("ไม่สามารถโหลดข้อมูลหลักสูตรได้");
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchCourseData();
}, [courseId, subjectId]);




  
  // โหลดความคืบหน้าของวิชาเมื่อมีการเปลี่ยนวิชา
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
  const extractYoutubeId = (url?: string): string | null => {
    if (!url) return null;
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
 // แก้ไขฟังก์ชัน handleLessonComplete
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
  
  // ไม่ต้องเรียก findAndSetNextLesson ทันที
  if (currentView === 'quiz') {
    // ไม่ต้องทำอะไร ปล่อยให้ LessonQuiz จัดการแสดง modal เอง
  } else {

  }
};

  
  // ฟังก์ชันค้นหาและตั้งค่าบทเรียนถัดไป
  const findAndSetNextLesson = (currentSectionId: number, currentItemId: number, updatedData: SectionData[]) => {
    let foundNext = false;
    
    // 1. ค้นหาในส่วนปัจจุบันก่อน (ถ้ามีหลายรายการในส่วนเดียวกัน)
    const currentSection = updatedData.find(s => s.id === currentSectionId);
    if (currentSection) {
      for (let i = 0; i < currentSection.items.length; i++) {
        // ข้ามรายการปัจจุบันและรายการที่เรียนจบแล้ว
        if (i > currentItemId && !currentSection.items[i].lock && !currentSection.items[i].completed) {
          setCurrentLessonId(`${currentSectionId}-${i}`);
          setCurrentLesson(currentSection.items[i].title);
          setCurrentView(currentSection.items[i].type);
          setCurrentLessonData({
            ...currentSection.items[i],
            quiz_id: currentSection.items[i].type === 'quiz' ? currentSection.items[i].quiz_id : currentSection.quiz_id
          });
          
          // ตั้งค่า YouTube ID หรือข้อมูลแบบทดสอบตามประเภท
          if (currentSection.items[i].type === 'video' && 
            currentSection.items[i].video_url && 
            typeof currentSection.items[i].video_url === 'string') {
          const videoId = extractYoutubeId(currentSection.items[i].video_url);
          if (videoId) setYoutubeId(videoId);
        } else if (currentSection.items[i].type === 'quiz' && courseData) {
            const lesson = courseData.subjects[0].lessons.find(l => l.lesson_id === currentSectionId);
            if (lesson && lesson.quiz) {
              setCurrentQuizData(lesson.quiz);
            }
          }
          
          foundNext = true;
          break;
        }
      }
    }
    
    // 2. ถ้าไม่พบในส่วนปัจจุบัน ให้ค้นหาในส่วนถัดไป
    if (!foundNext) {
      for (let s = 0; s < updatedData.length; s++) {
        const section = updatedData[s];
        // ข้ามส่วนปัจจุบันและส่วนที่เรียนจบแล้ว
        if (section.id === currentSectionId || section.count === "ผ่าน") continue;
        
        // ค้นหารายการแรกที่ยังไม่เรียนจบ
        for (let i = 0; i < section.items.length; i++) {
          if (!section.items[i].lock && !section.items[i].completed) {
            setCurrentLessonId(`${section.id}-${i}`);
            setCurrentLesson(section.items[i].title);
            setCurrentView(section.items[i].type);
            setCurrentLessonData({
              ...section.items[i],
              quiz_id: section.items[i].type === 'quiz' ? section.items[i].quiz_id : section.quiz_id
            });
            
            // ตั้งค่า YouTube ID หรือข้อมูลแบบทดสอบตามประเภท
            if (section.items[i].type === 'video' && section.items[i].video_url) {
              const videoId = extractYoutubeId(section.items[i].video_url);
              if (videoId) setYoutubeId(videoId);
            } else if (section.items[i].type === 'quiz' && courseData) {
              const lesson = courseData.subjects[0].lessons.find(l => l.lesson_id === section.id);
              if (lesson && lesson.quiz) {
                setCurrentQuizData(lesson.quiz);
              }
            }
            
            foundNext = true;
            break;
          }
        }
        
        if (foundNext) break;
      }
    }
    
    // 3. ถ้าไม่พบบทเรียนที่ยังไม่เรียนจบ แสดงว่าเรียนจบทั้งหมดแล้ว
    if (!foundNext) {
      alert("คุณได้เรียนจบทุกบทเรียนในวิชานี้แล้ว!");
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

      
        // แก้ไขส่วนการแสดงผลขณะโหลด
if (loading) {
  return (
    <section className="lesson__area section-pb-120">
      <div className="container-fluid">
        <div className="lesson-loading-container">
          <div className="lesson-loading-content">
            <div className="spinner-container">
              <div className="spinner-border-lg"></div>
            </div>
            <h3 className="loading-title">กำลังโหลดบทเรียน</h3>
            <p className="loading-text">กรุณารอสักครู่ ระบบกำลังเตรียมเนื้อหาบทเรียนให้คุณ...</p>
            <div className="loading-progress">
              <div className="loading-bar">
                <div className="loading-bar-progress"></div>
              </div>
            </div>
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
    onNextLesson={findAndSetNextLesson.bind(null, 
      parseInt(currentLessonId.split('-')[0]), 
      parseInt(currentLessonId.split('-')[1]), 
      lessonData
    )}
  />
) : (
  <LessonVideo
    onComplete={handleLessonComplete}
    currentLesson={currentLesson}
    youtubeId={youtubeId}
    lessonId={currentLessonData?.lesson_id || 0}
    onNextLesson={findAndSetNextLesson.bind(null, 
      parseInt(currentLessonId.split('-')[0]), 
      parseInt(currentLessonId.split('-')[1]), 
      lessonData
    )}
  />
)}


                  </div>
               
<div className="lesson__nav-tab fixed-nav-tab">
  <LessonNavTav 
    description={courseData?.description || ""}
    instructors={courseData?.instructors || []}
  />
</div>

                </div>
              </div>
            </div>
          </section>
        );
      };
      
export default LessonArea;
      