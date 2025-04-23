import { useState, useEffect } from "react";
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
  refreshProgress?: () => Promise<any>;
}

const LessonArea = ({ isLoading = false, subjectData, error = null, subjectId, progressData: initialProgressData, refreshProgress }: LessonAreaProps) => {
  const [currentView, setCurrentView] = useState<'video' | 'quiz'>('video');
  const [progress, setProgress] = useState<number>(0);
  const [currentLesson, setCurrentLesson] = useState<string>("");
  const [currentLessonId, setCurrentLessonId] = useState<string>("");
  const [currentLessonData, setCurrentLessonData] = useState<any>(null);
  const [currentQuizData, setCurrentQuizData] = useState<any>(null);
  const [youtubeId, setYoutubeId] = useState<string>("");
  const [progressData, setProgressData] = useState<any>(initialProgressData);
  const [courseCompleted, setCourseCompleted] = useState<boolean>(false);

  const apiURL = import.meta.env.VITE_API_URL as string;

  const [lessonData, setLessonData] = useState<SectionData[]>([]);

  // ตั้งค่า progressData เริ่มต้น
  useEffect(() => {
    if (initialProgressData) {
      console.log("Setting initial progress data:", initialProgressData);
      setProgressData(initialProgressData);
      if (initialProgressData.progress?.progress_percentage === 100) {
        setCourseCompleted(true);
      }
      // คำนวณ progress จาก initialProgressData
      const totalProgress = initialProgressData.progress?.progress_percentage || 0;
      setProgress(totalProgress);
    }
  }, [initialProgressData]);

  // ดึงข้อมูลความก้าวหน้าเมื่อ subjectId หรือ apiURL เปลี่ยน
  useEffect(() => {
    if (!subjectId) return;

    fetchUserProgress(subjectId, apiURL, setCourseCompleted).then(data => {
      if (data) {
        setProgressData(data);
        console.log("Progress data updated:", data);
        if (data.progress?.progress_percentage === 100) {
          setCourseCompleted(true);
        }
        // อัปเดต progress จากข้อมูลที่ดึงมา
        const totalProgress = data.progress?.progress_percentage || 0;
        setProgress(totalProgress);
      }
    });
  }, [subjectId, apiURL]);

  // ประมวลผล subjectData และ progressData เพื่อสร้าง lessonData
  useEffect(() => {
    if (subjectData) {
      console.log("Subject Data Structure:", JSON.stringify(subjectData, null, 2));

      fetchUserProgress(subjectId, apiURL).then(progressInfo => {
        console.log("Progress Info Structure:", JSON.stringify(progressInfo, null, 2));

        if (progressInfo) {
          setProgressData(progressInfo);

          // บันทึกข้อมูลความก้าวหน้าลงใน localStorage
          if (subjectId) {
            localStorage.setItem(`progress_${subjectId}`, JSON.stringify(progressInfo));
          }
        } else if (subjectId) {
          // ดึงจาก localStorage หาก fetch ไม่สำเร็จ
          const savedProgress = localStorage.getItem(`progress_${subjectId}`);
          if (savedProgress) {
            try {
              const parsedProgress = JSON.parse(savedProgress);
              setProgressData(parsedProgress);
              console.log("Using saved progress data from localStorage:", parsedProgress);
            } catch (e) {
              console.error("Error parsing saved progress:", e);
            }
          }
        }

        const processedData = processSubjectData(subjectData, progressInfo);
        setLessonData(processedData);

        // อัปเดต progress หลังจากได้ lessonData
        const totalProgress = progressInfo?.progress?.progress_percentage || calculateTotalProgress(processedData);
        setProgress(totalProgress);
        console.log("Initial progress calculated:", totalProgress);

        if (progressInfo?.progress?.progress_percentage === 100) {
          setCourseCompleted(true);
        } else {
          findCurrentLesson(processedData, progressInfo);
        }
      });
    }
  }, [subjectData, subjectId, apiURL]);

  const findCurrentLesson = (lessonData: SectionData[], progressInfo: any) => {
    if (!lessonData || lessonData.length === 0) return;
    console.log("Finding current lesson with progress info:", progressInfo);
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

  const fetchLessonData = async (lessonId: number) => {
    await fetchLessonDataUtil(
      lessonId,
      apiURL,
      currentLessonId,
      lessonData,
      setCurrentLessonData,
      setCurrentQuizData,
      setYoutubeId,
      setLessonData
    );
  };

  const fetchQuizData = async (quizId: number) => {
    await fetchQuizDataUtil(
      quizId,
      apiURL,
      currentLessonId,
      lessonData,
      setCurrentQuizData,
      setLessonData,
      async () => await fetchUserProgress(subjectId, apiURL),
      setProgressData
    );
  };

  // ฟังก์ชันคำนวณความก้าวหน้า
  const calculateTotalProgress = (data: SectionData[] = lessonData) => {
    // ใช้ค่าจาก progressData ถ้ามี
    if (progressData?.progress?.progress_percentage !== undefined) {
      return progressData.progress.progress_percentage;
    }

    // คำนวณจาก lessonData
    let totalItems = 0;
    let completedItems = 0;

    data.forEach(section => {
      section.items.forEach(item => {
        totalItems++;
        if (item.completed) {
          completedItems++;
        }
      });
    });

    // ป้องกันการหารด้วย 0
    const calculatedProgress = totalItems > 0 ? Math.min(100, (completedItems / totalItems) * 100) : 0;
    console.log("Calculated progress:", calculatedProgress, "Total items:", totalItems, "Completed items:", completedItems);
    return calculatedProgress;
  };

  // อัปเดต progress ทุกครั้งที่ lessonData หรือ progressData เปลี่ยน
  useEffect(() => {
    const totalProgress = calculateTotalProgress();
    setProgress(totalProgress);
    console.log("Progress updated due to lessonData or progressData change:", totalProgress);
  }, [lessonData, progressData]);

  const handleLessonComplete = async () => {
    const [sectionId, itemId] = currentLessonId.split('-').map(Number);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      let currentItem: LessonItem | undefined;
      lessonData.forEach(section => {
        if (section.id === sectionId) {
          section.items.forEach(item => {
            if (item.id === itemId) {
              currentItem = item;
            }
          });
        }
      });

      if (!currentItem) return;

      if (!currentItem.completed) {
        if (currentItem.type === 'video' && currentItem.lessonId) {
          const response = await axios.post(`${apiURL}/api/courses/lessons/${currentItem.lessonId}/complete`,
            { subject_id: subjectId },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data.success) {
            console.log("Lesson completed successfully:", response.data);

            // อัปเดตข้อมูลบทเรียนปัจจุบัน
            setCurrentLessonData((prev: any) => ({
              ...prev,
              completed: true
            }));

            // อัปเดตสถานะในข้อมูลบทเรียน
            const updatedLessonData = [...lessonData];
            const sectionIndex = updatedLessonData.findIndex(s => s.id === sectionId);

            if (sectionIndex !== -1) {
              const itemIndex = updatedLessonData[sectionIndex].items.findIndex(i => i.id === itemId);

              if (itemIndex !== -1) {
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

                // อัปเดตความก้าวหน้าของเซ็กชัน
                const totalItems = updatedLessonData[sectionIndex].items.length;
                const completedItems = updatedLessonData[sectionIndex].items.filter(item => item.completed).length;
                const sectionProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

                updatedLessonData[sectionIndex] = {
                  ...updatedLessonData[sectionIndex],
                  count: `${Math.round(sectionProgress)}%`
                };

                setLessonData(updatedLessonData);

                // คำนวณ progress ใหม่หลังจากอัปเดต lessonData
                const totalProgress = calculateTotalProgress(updatedLessonData);
                setProgress(totalProgress);
                console.log("Progress after lesson completion:", totalProgress);
              }
            }
          }
        } else if (currentItem.type === 'quiz' && currentItem.quizId) {
          const response = await axios.post(`${apiURL}/api/courses/quizzes/${currentItem.quizId}/complete`,
            { subject_id: subjectId },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data.success) {
            console.log("Quiz completed successfully:", response.data);

            const updatedLessonData = [...lessonData];
            const sectionIndex = updatedLessonData.findIndex(s => s.id === sectionId);

            if (sectionIndex !== -1) {
              const itemIndex = updatedLessonData[sectionIndex].items.findIndex(i => i.id === itemId);
              if (itemIndex !== -1) {
                updatedLessonData[sectionIndex].items[itemIndex] = {
                  ...updatedLessonData[sectionIndex].items[itemIndex],
                  completed: true,
                  duration: "100%"
                };

                // ปลดล็อคบทเรียนถัดไปตามเงื่อนไข
                if (sectionId === 1) {
                  const firstLessonSectionIndex = updatedLessonData.findIndex(s => s.id > 1 && s.id < 9999);
                  if (firstLessonSectionIndex !== -1 && updatedLessonData[firstLessonSectionIndex].items.length > 0) {
                    updatedLessonData[firstLessonSectionIndex].items[0] = {
                      ...updatedLessonData[firstLessonSectionIndex].items[0],
                      lock: false
                    };
                  }
                } else if (itemIndex === updatedLessonData[sectionIndex].items.length - 1) {
                  const nextSectionIndex = sectionIndex + 1;
                  if (nextSectionIndex < updatedLessonData.length &&
                    updatedLessonData[nextSectionIndex].items.length > 0) {
                    updatedLessonData[nextSectionIndex].items[0] = {
                      ...updatedLessonData[nextSectionIndex].items[0],
                      lock: false
                    };
                  }
                } else if (itemIndex + 1 < updatedLessonData[sectionIndex].items.length) {
                  updatedLessonData[sectionIndex].items[itemIndex + 1] = {
                    ...updatedLessonData[sectionIndex].items[itemIndex + 1],
                    lock: false
                  };
                }

                // ตรวจสอบว่าบทเรียนทั้งหมดเรียนจบแล้วหรือไม่ เพื่อปลดล็อคแบบทดสอบหลังเรียน
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

                // อัปเดตความก้าวหน้าของเซ็กชัน
                const totalItems = updatedLessonData[sectionIndex].items.length;
                const completedItems = updatedLessonData[sectionIndex].items.filter(item => item.completed).length;
                const sectionProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

                updatedLessonData[sectionIndex] = {
                  ...updatedLessonData[sectionIndex],
                  count: `${Math.round(sectionProgress)}%`
                };

                setLessonData(updatedLessonData);

                // คำนวณ progress ใหม่หลังจากอัปเดต lessonData
                const totalProgress = calculateTotalProgress(updatedLessonData);
                setProgress(totalProgress);
                console.log("Progress after quiz completion:", totalProgress);
              }
            }
          }
        }
      }

      // ดึงข้อมูลความก้าวหน้าใหม่หลังจากทำบทเรียนเสร็จ
      if (refreshProgress) {
        console.log("Refreshing progress after lesson completion");
        const newProgressData = await refreshProgress();
        if (newProgressData) {
          console.log("New progress data after completion:", newProgressData);
          setProgressData(newProgressData);

          if (newProgressData.progress?.progress_percentage === 100) {
            setCourseCompleted(true);
            return;
          }
          setProgress(newProgressData.progress?.progress_percentage || 0);
        }
      } else {
        const progressInfo = await fetchUserProgress(subjectId, apiURL);
        if (progressInfo) {
          console.log("Updated progress after completion:", progressInfo);
          setProgressData(progressInfo);

          // บันทึกข้อมูลความก้าวหน้าลงใน localStorage
          if (subjectId) {
            localStorage.setItem(`progress_${subjectId}`, JSON.stringify(progressInfo));
          }

          // อัปเดตข้อมูลบทเรียนตามความก้าวหน้าใหม่
          const processedData = processSubjectData(subjectData, progressInfo);
          setLessonData(processedData);

          if (progressInfo?.progress?.progress_percentage === 100) {
            setCourseCompleted(true);
            return;
          }
          setProgress(progressInfo.progress?.progress_percentage || 0);
        }
      }

      // หาบทเรียนถัดไปที่ควรเรียน
      findNextLesson();

    } catch (error) {
      console.error("Error completing lesson:", error);
    }
  };

  const findNextLesson = () => {
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
  };

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

  const refreshProgressData = async () => {
    try {
      if (!subjectId) return;

      console.log("Manually refreshing progress data...");
      const progressInfo = await fetchUserProgress(subjectId, apiURL);

      if (progressInfo) {
        console.log("Progress refreshed:", progressInfo);
        setProgressData(progressInfo);

        // บันทึกข้อมูลความก้าวหน้าลงใน localStorage
        localStorage.setItem(`progress_${subjectId}`, JSON.stringify(progressInfo));

        // อัปเดต progress
        const totalProgress = progressInfo?.progress?.progress_percentage || calculateTotalProgress();
        setProgress(totalProgress);
        console.log("Progress after refresh:", totalProgress);

        return progressInfo;
      }
    } catch (error) {
      console.error("Error refreshing progress:", error);
    }
    return null;
  };

  useEffect(() => {
    if (!subjectId) return;

    const intervalId = setInterval(() => {
      console.log("Auto-refreshing progress data...");
      refreshProgressData();
    }, 30000); // 30 วินาที

    return () => clearInterval(intervalId);
  }, [subjectId]);

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
              <div className="alert alert-danger" role="alert">
                {error}
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
                            if (currentLessonData.completed || progress >= 90) {
                              setCurrentView('quiz');
                              setCurrentQuizData(currentLessonData.quiz || { quiz_id: currentLessonData.quiz_id });
                            } else {
                              alert("คุณต้องดูวิดีโอให้จบก่อนจึงจะสามารถทำแบบทดสอบได้");
                            }
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