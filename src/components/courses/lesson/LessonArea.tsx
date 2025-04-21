import { useState, useEffect, useRef } from "react";
import LessonNavTav from "./LessonNavTav";
import LessonVideo from "./LessonVideo";
import LessonQuiz from "./LessonQuiz";
import LessonSidebar from "./LessonSidebar";
import axios from "axios";
import { Link } from "react-router-dom";
import "./LessonArea.css";
import { fetchUserProgress, processSubjectData, fetchLessonData as fetchLessonDataUtil, fetchQuizData as fetchQuizDataUtil } from "./LessonPixxel";

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
  progressData?: any;
}

const LessonArea = ({ isLoading = false, subjectData, error = null, subjectId, progressData: initialProgressData }: LessonAreaProps) => {
   const [currentView, setCurrentView] = useState<'video' | 'quiz'>('video');
   const [progress, setProgress] = useState<number>(0);
   const [currentLesson, setCurrentLesson] = useState<string>("");
   const [currentLessonId, setCurrentLessonId] = useState<string>("");
   const [completedCount, setCompletedCount] = useState(0);
   const [currentLessonData, setCurrentLessonData] = useState<any>(null);
   const [currentQuizData, setCurrentQuizData] = useState<any>(null);
   const [youtubeId, setYoutubeId] = useState<string>("");
   const [progressData, setProgressData] = useState<any>(initialProgressData);
   const [courseCompleted, setCourseCompleted] = useState<boolean>(false);
   
   const apiURL = import.meta.env.VITE_API_URL as string;
   
   const [lessonData, setLessonData] = useState<SectionData[]>([]);
   const [lessonProgressMap, setLessonProgressMap] = useState<Record<string, any>>({});
   console.error("Error in fetchQuizData:", lessonProgressMap);
   // ดึงข้อมูลความก้าวหน้าของผู้ใช้เมื่อโหลดคอมโพเนนต์
   useEffect(() => {
    if (!subjectId) return;
    
    fetchUserProgress(subjectId, apiURL, setCourseCompleted).then(data => {
      if (data) {
        setProgressData(data);
        if (data.progress && data.progress.progress_percentage === 100) {
          setCourseCompleted(true);
        }
      }
    });
  }, [subjectId, apiURL]);

  // ประมวลผลข้อมูลรายวิชาเมื่อได้รับข้อมูล
  useEffect(() => {
    if (!subjectData || !subjectId) return;
    
    fetchUserProgress(subjectId, apiURL).then(progressInfo => {
      if (progressInfo) {
        setProgressData(progressInfo);
        const processedData = processSubjectData(subjectData, progressInfo);
        setLessonData(processedData);
        
        if (progressInfo?.progress?.progress_percentage === 100) {
          setCourseCompleted(true);
        } else {
          findCurrentLesson(processedData, progressInfo);
        }
      }
    });
  }, [subjectData, subjectId, apiURL]);

  // ค้นหาบทเรียนปัจจุบันที่ผู้ใช้ควรเรียน
  const findCurrentLesson = (lessonData: SectionData[], progressInfo: any) => {
    console.error("Error in fetchQuizData:", progressInfo);
    if (!lessonData || lessonData.length === 0) return;
    
    // ค้นหาบทเรียนแรกที่ยังไม่เรียนจบและไม่ถูกล็อค
    for (const section of lessonData) {
      for (const item of section.items) {
        if (!item.completed && !item.lock) {
          setCurrentLessonId(`${section.id}-${item.id}`);
          setCurrentLesson(item.title);
          setCurrentView(item.type);
          
          if (item.type === 'video' && item.lessonId) {
            fetchLessonData(item.lessonId);
          } else if (item.type === 'quiz' && item.quizId) {
            fetchQuizData(item.quizId);
          }
          
          return;
        }
      }
    }
    
    // ถ้าไม่พบบทเรียนที่ยังไม่เรียนจบ ให้เลือกบทเรียนแรกที่ไม่ถูกล็อค
    for (const section of lessonData) {
      for (const item of section.items) {
        if (!item.lock) {
          setCurrentLessonId(`${section.id}-${item.id}`);
          setCurrentLesson(item.title);
          setCurrentView(item.type);
          
          if (item.type === 'video' && item.lessonId) {
            fetchLessonData(item.lessonId);
          } else if (item.type === 'quiz' && item.quizId) {
            fetchQuizData(item.quizId);
          }
          
          return;
        }
      }
    }
  };

  // ดึงข้อมูลบทเรียน
  const fetchLessonData = async (lessonId: number) => {
    try {
      await fetchLessonDataUtil(
        lessonId,
        apiURL,
        currentLessonId,
        lessonData,
        setCurrentLessonData,
        setCurrentQuizData,
        setYoutubeId,
        setLessonData,
        setLessonProgressMap
      );
    } catch (error) {
      console.error("Error in fetchLessonData:", error);
    }
  };

  // ดึงข้อมูลแบบทดสอบ
  const fetchQuizData = async (quizId: number) => {
    try {
      await fetchQuizDataUtil(
        quizId,
        apiURL,
        currentLessonId,
        lessonData,
        setCurrentQuizData,
        setLessonData,
        setLessonProgressMap,
        async () => await fetchUserProgress(subjectId, apiURL),
        setProgressData
      );
    } catch (error) {
      console.error("Error in fetchQuizData:", error);
    }
  };

  // คำนวณความก้าวหน้าทั้งหมด
  const calculateTotalProgress = () => {
    if (progressData?.progress?.progress_percentage !== undefined) {
      return progressData.progress.progress_percentage;
    }
    
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

  // อัปเดตความก้าวหน้าเมื่อมีการเปลี่ยนแปลง
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    if (!progressData?.progress?.progress_percentage) {
      const updatedData = lessonData.map(section => {
        const totalItems = section.items.length;
        const completedItems = section.items.filter(item => item.completed).length;
        const sectionProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
        
        return {
          ...section,
          count: `${Math.round(sectionProgress)}%`
        };
      });
      
      const totalProgress = calculateTotalProgress();
      setProgress(totalProgress);
      
      setLessonData(updatedData);
    }
  }, [completedCount, progressData, lessonData]);
      
  // จัดการเมื่อบทเรียนเสร็จสิ้น
  const handleLessonComplete = async () => {
    if (!currentLessonId || !subjectId) return;
    
    const [sectionId, itemId] = currentLessonId.split('-').map(Number);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      // ค้นหาข้อมูลบทเรียนปัจจุบัน
      let currentItem: LessonItem | undefined;
      let currentSection: SectionData | undefined;
      console.error("Error in fetchQuizData:", currentSection);
      lessonData.forEach(section => {
        if (section.id === sectionId) {
          currentSection = section;
          section.items.forEach(item => {
            if (item.id === itemId) {
              currentItem = item;
            }
          });
        }
      });
      
      if (!currentItem) return;
      
      // ถ้าบทเรียนยังไม่เสร็จสิ้น
      if (!currentItem.completed) {
        // กรณีเป็นวิดีโอ
        if (currentItem.type === 'video' && currentItem.lessonId) {
          const response = await axios.post(
            `${apiURL}/api/courses/lessons/${currentItem.lessonId}/complete`,
            { subject_id: subjectId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (response.data.success) {
            setCurrentLessonData(response.data.lesson);
            const updatedLessonData = [...lessonData];
            const sectionIndex = updatedLessonData.findIndex(s => s.id === sectionId);
            
            // ตรวจสอบแบบทดสอบท้ายบท
            if (response.data.lesson.quiz_id || response.data.lesson.quiz) {
              setCurrentQuizData(response.data.lesson.quiz || { quiz_id: response.data.lesson.quiz_id });
            }
            
            if (sectionIndex !== -1) {
              const itemIndex = updatedLessonData[sectionIndex].items.findIndex(i => i.id === itemId);
              
              if (itemIndex !== -1) {
                // อัปเดตสถานะบทเรียนเป็นเสร็จสิ้น
                updatedLessonData[sectionIndex].items[itemIndex] = {
                  ...updatedLessonData[sectionIndex].items[itemIndex],
                  completed: true,
                  duration: "100%"
                };
                
                // ปลดล็อคบทเรียนถัดไป
                if (itemIndex + 1 < updatedLessonData[sectionIndex].items.length) {
                  updatedLessonData[sectionIndex].items[itemIndex + 1] = {
                    ...updatedLessonData[sectionIndex].items[itemIndex + 1],
                    lock: false
                  };
                } else if (sectionIndex + 1 < updatedLessonData.length) {
                  const nextSectionIndex = sectionIndex + 1;
                  if (updatedLessonData[nextSectionIndex].items.length > 0) {
                    updatedLessonData[nextSectionIndex].items[0] = {
                      ...updatedLessonData[nextSectionIndex].items[0],
                      lock: false
                    };
                  }
                }
                
                // คำนวณความก้าวหน้าของเซ็กชัน
                const totalItems = updatedLessonData[sectionIndex].items.length;
                const completedItems = updatedLessonData[sectionIndex].items.filter(item => item.completed).length;
                const sectionProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
                
                updatedLessonData[sectionIndex] = {
                  ...updatedLessonData[sectionIndex],
                  count: `${Math.round(sectionProgress)}%`
                };
                
                setLessonData(updatedLessonData);
                setCompletedCount(prev => prev + 1);
              }
            }
          }
        } 
        // กรณีเป็นแบบทดสอบ
        else if (currentItem.type === 'quiz' && currentItem.quizId) {
          const response = await axios.post(
            `${apiURL}/api/courses/quizzes/${currentItem.quizId}/complete`,
            { subject_id: subjectId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (response.data.success) {
            const updatedLessonData = [...lessonData];
            const sectionIndex = updatedLessonData.findIndex(s => s.id === sectionId);
            
            if (sectionIndex !== -1) {
              const itemIndex = updatedLessonData[sectionIndex].items.findIndex(i => i.id === itemId);
              if (itemIndex !== -1) {
                // อัปเดตสถานะแบบทดสอบเป็นเสร็จสิ้น
                updatedLessonData[sectionIndex].items[itemIndex] = {
                  ...updatedLessonData[sectionIndex].items[itemIndex],
                  completed: true,
                  duration: "100%"
                };
                
                                // ปลดล็อคตามเงื่อนไขต่างๆ
                // กรณีเป็นแบบทดสอบก่อนเรียน
                if (sectionId === 1) {
                  const firstLessonSectionIndex = updatedLessonData.findIndex(s => s.id > 1 && s.id < 9999);
                  if (firstLessonSectionIndex !== -1 && updatedLessonData[firstLessonSectionIndex].items.length > 0) {
                    updatedLessonData[firstLessonSectionIndex].items[0] = {
                      ...updatedLessonData[firstLessonSectionIndex].items[0],
                      lock: false
                    };
                  }
                } 
                // กรณีเป็นแบบทดสอบท้ายบทสุดท้ายของเซ็กชัน
                else if (itemIndex === updatedLessonData[sectionIndex].items.length - 1) {
                  const nextSectionIndex = sectionIndex + 1;
                  if (nextSectionIndex < updatedLessonData.length && 
                      updatedLessonData[nextSectionIndex].items.length > 0) {
                    updatedLessonData[nextSectionIndex].items[0] = {
                      ...updatedLessonData[nextSectionIndex].items[0],
                      lock: false
                    };
                  }
                } 
                // กรณีเป็นแบบทดสอบท้ายบทที่ไม่ใช่บทสุดท้าย
                else if (itemIndex + 1 < updatedLessonData[sectionIndex].items.length) {
                  updatedLessonData[sectionIndex].items[itemIndex + 1] = {
                    ...updatedLessonData[sectionIndex].items[itemIndex + 1],
                    lock: false
                  };
                }
                
                // ตรวจสอบว่าทุกบทเรียนเสร็จสิ้นแล้วหรือไม่ เพื่อปลดล็อคแบบทดสอบหลังเรียน
                const allLessonsCompleted = updatedLessonData
                  .filter(section => section.id !== 1 && section.id !== 9999)
                  .every(section => section.items.every(item => item.completed));
                
                if (allLessonsCompleted) {
                  const postTestSectionIndex = updatedLessonData.findIndex(s => s.id === 9999);
                  if (postTestSectionIndex !== -1 && updatedLessonData[postTestSectionIndex].items.length > 0) {
                    updatedLessonData[postTestSectionIndex].items[0] = {
                      ...updatedLessonData[postTestSectionIndex].items[0],
                      lock: false
                    };
                  }
                }
                
                // คำนวณความก้าวหน้าของเซ็กชัน
                const totalItems = updatedLessonData[sectionIndex].items.length;
                const completedItems = updatedLessonData[sectionIndex].items.filter(item => item.completed).length;
                const sectionProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
                
                updatedLessonData[sectionIndex] = {
                  ...updatedLessonData[sectionIndex],
                  count: `${Math.round(sectionProgress)}%`
                };
                
                setLessonData(updatedLessonData);
                setCompletedCount(prev => prev + 1);
              }
            }
          }
        }
      }
      
      // ดึงข้อมูลความก้าวหน้าล่าสุดหลังจากทำบทเรียนเสร็จ
      const progressInfo = await fetchUserProgress(subjectId, apiURL);
      if (progressInfo) {
        setProgressData(progressInfo);
        const processedData = processSubjectData(subjectData, progressInfo);
        setLessonData(processedData);
        
        // ตรวจสอบว่าเรียนจบหลักสูตรแล้วหรือไม่
        if (progressInfo?.progress?.progress_percentage === 100) {
          setCourseCompleted(true);
          return;
        }
      }
      
      // หาบทเรียนถัดไปที่ควรเรียน
      for (const section of lessonData) {
        for (const item of section.items) {
          if (!item.completed && !item.lock) {
            setCurrentLessonId(`${section.id}-${item.id}`);
            setCurrentLesson(item.title);
            setCurrentView(item.type);
            
            if (item.type === 'video' && item.lessonId) {
              fetchLessonData(item.lessonId);
            } else if (item.type === 'quiz' && item.quizId) {
              fetchQuizData(item.quizId);
            }
            
            return;
          }
        }
      }
      
    } catch (error) {
      console.error("Error completing lesson:", error);
    }
  };

  // จัดการเมื่อเลือกบทเรียน
  const handleSelectLesson = async (sectionId: number, itemId: number, title: string, type: 'video' | 'quiz') => {
    const section = lessonData.find(s => s.id === sectionId);
    if (section) {
      const item = section.items.find(i => i.id === itemId);
      if (item && item.lock) {
        alert("บทเรียนนี้ถูกล็อค คุณต้องเรียนบทเรียนก่อนหน้าให้เสร็จก่อน");
        return;
      }
      
      setCurrentLessonId(`${sectionId}-${itemId}`);
      setCurrentLesson(title);
      setCurrentView(type);
      
      if (item) {
        if (type === 'video' && item.lessonId) {
          await fetchLessonData(item.lessonId);
        } else if (type === 'quiz' && item.quizId) {
          await fetchQuizData(item.quizId);
        }
      }
    }
  };

  // แสดงหน้าโหลดข้อมูล
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

  // แสดงหน้าแจ้งเตือนข้อผิดพลาด
  if (error) {
    return (
      <section className="lesson__area section-pb-120">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 text-center py-5">
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // แสดงหน้าบทเรียน
  return (
    <section className="lesson__area section-pb-120">
      <div className="container-fluid">
        <div className="row gx-4">
          <LessonSidebar 
            subjectTitle={subjectData?.title || subjectData?.subject_name || "สถิติประยุกต์"}
            lessonData={lessonData}
            onSelectLesson={handleSelectLesson}
            currentLessonId={currentLessonId}
            onViewChange={setCurrentView}
            progressData={progressData}
            progress={progress}
          />
          <div className="col-xl-9 col-lg-8 lesson__main">
            <div className="lesson__video-wrap">
              {courseCompleted ? (
                <div className="course-completed-container">
                  <div className="course-completed-message">
                    <div className="completion-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <h2>ยินดีด้วย! คุณได้เรียนจบรายวิชานี้แล้ว</h2>
                    <p>คุณได้ทำความเข้าใจเนื้อหาทั้งหมดและผ่านแบบทดสอบเรียบร้อยแล้ว</p>
                    <div className="completion-actions">
                      <Link to="/courses" className="btn btn-primary btn-lg">
                        ไปยังรายวิชาอื่น
                      </Link>
                      <button 
                        className="btn btn-outline-primary btn-lg ms-3"
                        onClick={() => setCourseCompleted(false)}
                      >
                        ทบทวนเนื้อหา
                      </button>
                    </div>
                  </div>
                </div>
              ) : currentView === 'quiz' ? (
                currentQuizData ? (
                  <LessonQuiz
                    onComplete={handleLessonComplete}
                    quizData={currentQuizData}
                    subjectId={subjectId}
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
                currentLessonData && youtubeId ? (
                  <>
                    <LessonVideo
                      onComplete={handleLessonComplete}
                      currentLesson={currentLesson}
                      youtubeId={youtubeId}
                      lessonData={currentLessonData}
                      progressData={progressData}
                      subjectId={subjectId}
                    />
                    {currentLessonData && (currentLessonData.quiz_id || currentLessonData.quiz) && (
                      <div className="lesson-quiz-link mt-3">
                        <button 
                          className="btn btn-primary" 
                          onClick={() => {
                            setCurrentView('quiz');
                            setCurrentQuizData(currentLessonData.quiz || { quiz_id: currentLessonData.quiz_id });
                          }}
                        >
                          ทำแบบทดสอบท้ายบท
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">กำลังโหลดวิดีโอ...</span>
                    </div>
                    <p className="mt-3">กำลังโหลดวิดีโอ...</p>
                  </div>
                )
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
