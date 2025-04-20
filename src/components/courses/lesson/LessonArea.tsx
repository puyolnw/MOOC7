import { useState, useEffect, useRef } from "react";
import LessonFaq from "./LessonFaq";
import LessonNavTav from "./LessonNavTav";
import LessonVideo from "./LessonVideo";
import LessonQuiz from "./LessonQuiz";
import axios from "axios";
import { Link } from "react-router-dom";
import "./LessonArea.css";

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
   const [completedCount] = useState(0);
   const [currentLessonData, setCurrentLessonData] = useState<any>(null);
   const [currentQuizData, setCurrentQuizData] = useState<any>(null);
   const [youtubeId, setYoutubeId] = useState<string>("");
   const [progressData, setProgressData] = useState<any>(initialProgressData);
   const [courseCompleted, setCourseCompleted] = useState<boolean>(false);
   
   const apiURL = import.meta.env.VITE_API_URL as string;
   
   const [lessonData, setLessonData] = useState<SectionData[]>([]);
   const [lessonProgressMap, setLessonProgressMap] = useState<Record<string, any>>({});

   const fetchUserProgress = async () => {
    try {
      if (!subjectId) return null;
      
      const token = localStorage.getItem("token");
      if (!token) return null;
      
      const response = await axios.get(`${apiURL}/api/courses/subjects/${subjectId}/progress`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        if (response.data.progress?.progress_percentage === 100) {
          setCourseCompleted(true);
        }
        
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching user progress:", error);
    }
    return null;
  };

   useEffect(() => {
    fetchUserProgress().then(data => {
      setProgressData(data);
      if (data && data.progress && data.progress.progress_percentage === 100) {
        setCourseCompleted(true);
      }
    });
  }, [subjectId, apiURL]);

  const processSubjectData = (subjectData: any, progressInfo: any = null) => {
    if (!subjectData) return [];
    
    console.log("Processing subject data:", subjectData);
    console.log("With progress info:", progressInfo);
    
    const lessonProgress = progressInfo?.lessonProgress || [];
    const quizProgress = progressInfo?.quizProgress || [];
    
    const lessonProgressMap = new Map();
    const quizProgressMap = new Map();
    
    lessonProgress.forEach((item: any) => {
      if (item.lesson_id) {
        lessonProgressMap.set(String(item.lesson_id), item);
      }
    });
    
    quizProgress.forEach((item: any) => {
      if (item.quiz_id) {
        quizProgressMap.set(String(item.quiz_id), item);
      }
    });
      
    try {
      const sections: SectionData[] = [];
      
      // แบบทดสอบก่อนเรียน
      if (subjectData.preTest || (subjectData.pre_test_id && subjectData.preTest)) {
        const preTestData = subjectData.preTest || {
          quiz_id: subjectData.pre_test_id
        };
        
        let preTestCompleted = subjectData.pre_test_completed || false;
        let preTestProgress = "0%";
        
        if (progressInfo?.quizProgress) {
          const preTestProgressData = progressInfo.quizProgress.find(
            (p: any) => p.quiz_id === preTestData.quiz_id
          );
          
          if (preTestProgressData) {
            preTestCompleted = preTestProgressData.completed || preTestCompleted;
            preTestProgress = preTestCompleted ? "100%" : (preTestProgressData.progress ? `${preTestProgressData.progress}%` : "0%");
          }
        }
        
        sections.push({
          id: 1,
          title: "แบบทดสอบก่อนเรียน",
          count: preTestCompleted ? "100%" : "0%",
          items: [
            {
              id: 0,
              title: "เริ่มทำแบบทดสอบก่อนเรียน",
              lock: false,
              completed: preTestCompleted,
              type: 'quiz',
              duration: preTestProgress,
              quizId: preTestData.quiz_id
            }
          ]
        });
      }
      
      // บทเรียน
      if (subjectData.lessons && subjectData.lessons.length > 0) {
        // เรียงลำดับบทเรียนตาม chapter และ order_number
        const sortedLessons = [...subjectData.lessons].sort((a, b) => {
          if (a.chapter !== b.chapter) {
            return (a.chapter || 1) - (b.chapter || 1);
          }
          if (a.order_number !== undefined && b.order_number !== undefined) {
            return a.order_number - b.order_number;
          }
          return a.lesson_id - b.lesson_id;
        });
        
        console.log("Sorted lessons:", sortedLessons);
        
        const preTestCompleted = !subjectData.pre_test_id || subjectData.pre_test_completed || 
          (progressInfo?.quizProgress?.some((p: any) => p.quiz_id === subjectData.pre_test_id && p.completed));
        
        // จัดกลุ่มบทเรียนตาม chapter
        const chapterMap = new Map<number, any[]>();
        
        sortedLessons.forEach(lesson => {
          const chapterNumber = lesson.chapter || 1;
          if (!chapterMap.has(chapterNumber)) {
            chapterMap.set(chapterNumber, []);
          }
          chapterMap.get(chapterNumber)?.push(lesson);
        });
        
        console.log("Chapter map:", Array.from(chapterMap.entries()));
        
        // เรียงลำดับ chapter
        const sortedChapters = Array.from(chapterMap.keys()).sort((a, b) => a - b);
        
        console.log("Sorted chapters:", sortedChapters);
        
        // สร้างเซ็กชันสำหรับแต่ละ chapter
        for (let chapterIndex = 0; chapterIndex < sortedChapters.length; chapterIndex++) {
          const chapterNumber = sortedChapters[chapterIndex];
          const chapterLessons = chapterMap.get(chapterNumber) || [];
          
          console.log(`Processing chapter ${chapterNumber} with ${chapterLessons.length} lessons`);
          
          // กำหนด ID และชื่อเซ็กชัน
          const sectionId = 2 + chapterIndex;
          const sectionTitle = `บทที่ ${chapterNumber}`;
          
          // ตรวจสอบว่า chapter ก่อนหน้าเรียนจบแล้วหรือไม่
          const previousChaptersCompleted = chapterIndex === 0 || 
            sortedChapters.slice(0, chapterIndex).every(prevChapter => {
              const prevChapterLessons = chapterMap.get(prevChapter) || [];
              return prevChapterLessons.every(lesson => {
                const lessonProgressData = lessonProgressMap.get(String(lesson.lesson_id));
                return lessonProgressData?.completed || lesson.completed;
              });
            });
          
          // chapter ถูกล็อคถ้าแบบทดสอบก่อนเรียนยังไม่เสร็จหรือ chapter ก่อนหน้ายังไม่เสร็จ
          const chapterLocked = !preTestCompleted || !previousChaptersCompleted;
          
          // สร้างรายการสำหรับ chapter นี้
          const chapterItems: LessonItem[] = [];
          
          // สร้างรายการสำหรับแต่ละบทเรียนใน chapter
          chapterLessons.forEach((lesson, lessonIndex) => {
            console.log(`Processing lesson ${lessonIndex} in chapter ${chapterNumber}:`, lesson);
            
            // ตรวจสอบว่าบทเรียนก่อนหน้าใน chapter นี้เรียนจบแล้วหรือไม่
            const previousLessonsInChapterCompleted = lessonIndex === 0 || 
              chapterLessons.slice(0, lessonIndex).every(l => {
                const lessonProgressData = lessonProgressMap.get(String(l.lesson_id));
                return lessonProgressData?.completed || l.completed;
              });
            
            // บทเรียนถูกล็อคถ้า chapter ถูกล็อคหรือบทเรียนก่อนหน้ายังไม่เสร็จ
            const lessonLocked = chapterLocked || (lessonIndex > 0 && !previousLessonsInChapterCompleted);
            
            // กำหนดชื่อบทเรียน
            const lessonTitle = `เนื้อหา ${chapterNumber}.${lessonIndex + 1} ${lesson.title}`;
            
            // ตรวจสอบสถานะการเรียนจบของบทเรียน
            let lessonCompleted = lesson.completed || false;
            let lessonProgress = lesson.progress || 0;
            
            if (progressInfo?.lessonProgress) {
              const lessonProgressData = progressInfo.lessonProgress.find(
                (p: any) => p.lesson_id === lesson.lesson_id
              );
              
              if (lessonProgressData) {
                lessonCompleted = lessonProgressData.completed || lessonCompleted;
                lessonProgress = lessonProgressData.progress || lessonProgress;
              }
            }
            
            // เพิ่มรายการบทเรียน
            chapterItems.push({
              id: lessonIndex * 2,
              title: lessonTitle,
              lock: lessonLocked,
              completed: lessonCompleted,
              type: 'video',
              duration: lessonCompleted ? "100%" : `${lessonProgress}%`,
              lessonId: lesson.lesson_id
            });
            
            // เพิ่มแบบทดสอบท้ายบทเรียน (ถ้ามี)
            if (lesson.quiz || lesson.quiz_id) {
              console.log(`Lesson ${lesson.lesson_id} has quiz:`, lesson.quiz || lesson.quiz_id);
              
              const quizData = lesson.quiz || { quiz_id: lesson.quiz_id };
              const quizTitle = `แบบทดสอบท้ายบท ${chapterNumber}.${lessonIndex + 1} ${lesson.title}`;
              
              let quizCompleted = lesson.quiz_completed || false;
              let quizProgress = "0%";
              
              if (progressInfo?.quizProgress) {
                const quizProgressData = progressInfo.quizProgress.find(
                  (p: any) => p.quiz_id === quizData.quiz_id
                );
                
                if (quizProgressData) {
                  quizCompleted = quizProgressData.completed || quizCompleted;
                  quizProgress = quizCompleted ? "100%" : (quizProgressData.progress ? `${quizProgressData.progress}%` : "0%");
                }
              }
              
              chapterItems.push({
                id: lessonIndex * 2 + 1,
                title: quizTitle,
                lock: lessonLocked || !lessonCompleted,
                completed: quizCompleted,
                type: 'quiz',
                duration: quizProgress,
                quizId: quizData.quiz_id
              });
            }
          });
          
          // คำนวณความก้าวหน้าของ chapter
          const totalItems = chapterItems.length;
          const completedItems = chapterItems.filter(item => item.completed).length;
          const sectionProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
          
          // เพิ่มเซ็กชันสำหรับ chapter นี้
          sections.push({
            id: sectionId,
            title: sectionTitle,
            count: `${Math.round(sectionProgress)}%`,
            items: chapterItems
          });
        }
      }
      
      // แบบทดสอบหลังเรียน
      if (subjectData.postTest || (subjectData.post_test_id && subjectData.postTest)) {
        const allLessonsCompleted = subjectData.lessons && subjectData.lessons.every((lesson: any) => {
          const lessonProgressData = lessonProgressMap.get(String(lesson.lesson_id));
          return lessonProgressData?.completed || lesson.completed;
        });
        
        const postTestData = subjectData.postTest || {
          quiz_id: subjectData.post_test_id
        };
        
        let postTestCompleted = subjectData.post_test_completed || false;
        let postTestProgress = "0%";
        
        if (progressInfo?.quizProgress) {
          const postTestProgressData = progressInfo.quizProgress.find(
            (p: any) => p.quiz_id === postTestData.quiz_id
          );
          
          if (postTestProgressData) {
            postTestCompleted = postTestProgressData.completed || postTestCompleted;
            postTestProgress = postTestCompleted ? "100%" : (postTestProgressData.progress ? `${postTestProgressData.progress}%` : "0%");
          }
        }
        
        sections.push({
          id: 9999,
          title: "แบบทดสอบหลังเรียน",
          count: postTestCompleted ? "100%" : "0%",
          items: [
            {
              id: 0,
              title: "เริ่มทำแบบทดสอบหลังเรียน",
              lock: !allLessonsCompleted,
              completed: postTestCompleted,
              type: 'quiz',
              duration: postTestProgress,
              quizId: postTestData.quiz_id
            }
          ]
        });
      }
      
      console.log("Processed sections:", sections);
      return sections;
    } catch (error) {
      console.error("Error processing subject data:", error);
      return [];
    }
  };

  useEffect(() => {
    if (subjectData) { console.log("Subject Data Structure:", JSON.stringify(subjectData, null, 2));
      
      fetchUserProgress().then(progressInfo => {
        console.log("Progress Info Structure:", JSON.stringify(progressInfo, null, 2));
        setProgressData(progressInfo);
        const processedData = processSubjectData(subjectData, progressInfo);
        setLessonData(processedData);
        
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
  try {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    const response = await axios.get(`${apiURL}/api/courses/lessons/${lessonId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      console.log("Lesson data fetched:", response.data.lesson);
      setCurrentLessonData(response.data.lesson);
      
      // ตรวจสอบและจัดการกับแบบทดสอบท้ายบท
      if (response.data.lesson.quiz_id || response.data.lesson.quiz) {
        console.log("Lesson has quiz:", response.data.lesson.quiz_id || response.data.lesson.quiz);
        const quizData = response.data.lesson.quiz || { quiz_id: response.data.lesson.quiz_id };
        setCurrentQuizData(quizData);
      }
      
      const youtubeUrl = response.data.lesson.video_url;
      if (youtubeUrl) {
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = youtubeUrl.match(youtubeRegex);
        
        if (match && match[1]) {
          console.log("YouTube ID extracted:", match[1]);
          setYoutubeId(match[1]);
        } else {
          console.error("Could not extract YouTube ID from URL:", youtubeUrl);
          setYoutubeId("BboMpayJomw");
        }
      } else {
        console.warn("No video URL found in lesson data");
        setYoutubeId("BboMpayJomw");
      }
      
      try {
        const progressResponse = await axios.get(`${apiURL}/api/courses/lessons/${lessonId}/progress`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (progressResponse.data.success && progressResponse.data.progress) {
          console.log("Lesson progress data:", progressResponse.data.progress);
          
          const [sectionId, itemId] = currentLessonId.split('-').map(Number);
          const updatedLessonData = [...lessonData];
          const sectionIndex = updatedLessonData.findIndex(s => s.id === sectionId);
          
          if (sectionIndex !== -1) {
            const itemIndex = updatedLessonData[sectionIndex].items.findIndex(i => i.id === itemId);
            
            if (itemIndex !== -1) {
              updatedLessonData[sectionIndex].items[itemIndex] = {
                ...updatedLessonData[sectionIndex].items[itemIndex],
                completed: progressResponse.data.progress.completed || updatedLessonData[sectionIndex].items[itemIndex].completed,
                duration: progressResponse.data.progress.completed ? "100%" : `${progressResponse.data.progress.progress || 0}%`
              };
              
              if (progressResponse.data.progress.completed && itemIndex + 1 < updatedLessonData[sectionIndex].items.length) {
                updatedLessonData[sectionIndex].items[itemIndex + 1] = {
                  ...updatedLessonData[sectionIndex].items[itemIndex + 1],
                  lock: false
                };
              }
              
              if (progressResponse.data.progress.completed && 
                  itemIndex === updatedLessonData[sectionIndex].items.length - 1 && 
                  sectionIndex < updatedLessonData.length - 1) {
                
                const nextSectionIndex = sectionIndex + 1;
                if (nextSectionIndex < updatedLessonData.length && 
                    updatedLessonData[nextSectionIndex].id !== 9999 && 
                    updatedLessonData[nextSectionIndex].items.length > 0) {
                  
                  updatedLessonData[nextSectionIndex].items[0] = {
                    ...updatedLessonData[nextSectionIndex].items[0],
                    lock: false
                  };
                }
              }
              
              const totalItems = updatedLessonData[sectionIndex].items.length;
              const completedItems = updatedLessonData[sectionIndex].items.filter(item => item.completed).length;
              const sectionProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
              
              updatedLessonData[sectionIndex] = {
                ...updatedLessonData[sectionIndex],
                count: `${Math.round(sectionProgress)}%`
              };
              
              setLessonData(updatedLessonData);
            }
          }
          
          setLessonProgressMap(prev => ({
            ...prev,
            [String(lessonId)]: progressResponse.data.progress
          }));
        }
      } catch (progressError) {
        console.error("Error fetching lesson progress:", progressError);
      }
    }
  } catch (error) {
    console.error("Error fetching lesson data:", error);
  }
};

        
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
      
      if (response.data.quiz) {
        setCurrentQuizData(response.data.quiz);
      } else if (response.data.success && response.data.data) {
        setCurrentQuizData(response.data.data);
      } else {
        console.error("Quiz data format not recognized");
      }
      
      try {
        const progressResponse = await axios.get(`${apiURL}/api/courses/quizzes/${quizId}/progress`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (progressResponse.data.success && progressResponse.data.progress) {
          const [sectionId, itemId] = currentLessonId.split('-').map(Number);
          const updatedLessonData = [...lessonData];
          const sectionIndex = updatedLessonData.findIndex(s => s.id === sectionId);
          
          if (sectionIndex !== -1) {
            const itemIndex = updatedLessonData[sectionIndex].items.findIndex(i => i.id === itemId);
            
            if (itemIndex !== -1) {
              updatedLessonData[sectionIndex].items[itemIndex] = {
                ...updatedLessonData[sectionIndex].items[itemIndex],
                completed: progressResponse.data.progress.completed || updatedLessonData[sectionIndex].items[itemIndex].completed,
                duration: progressResponse.data.progress.completed ? "100%" : `${progressResponse.data.progress.progress || 0}%`
              };
              
              if (sectionId === 1 && progressResponse.data.progress.completed) {
                const firstLessonSectionIndex = updatedLessonData.findIndex(s => s.id > 1 && s.id < 9999);
                if (firstLessonSectionIndex !== -1 && updatedLessonData[firstLessonSectionIndex].items.length > 0) {
                  updatedLessonData[firstLessonSectionIndex].items[0] = {
                    ...updatedLessonData[firstLessonSectionIndex].items[0],
                    lock: false
                  };
                }
              }
              
              if (sectionId !== 1 && sectionId !== 9999 && progressResponse.data.progress.completed) {
                if (itemIndex === updatedLessonData[sectionIndex].items.length - 1) {
                  const nextSectionIndex = sectionIndex + 1;
                  if (nextSectionIndex < updatedLessonData.length && 
                      updatedLessonData[nextSectionIndex].id !== 9999 && 
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
              }
              
              if (progressResponse.data.progress.completed) {
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
              }
              
              const totalItems = updatedLessonData[sectionIndex].items.length;
              const completedItems = updatedLessonData[sectionIndex].items.filter(item => item.completed).length;
              const sectionProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
              
              updatedLessonData[sectionIndex] = {
                ...updatedLessonData[sectionIndex],
                count: `${Math.round(sectionProgress)}%`
              };
              
              setLessonData(updatedLessonData);
            }
          }
          
          setLessonProgressMap(prev => ({
            ...prev,
            [`quiz_${quizId}`]: progressResponse.data.progress
          }));
          
          if (progressResponse.data.progress.completed) {
            fetchUserProgress().then(data => {
              setProgressData(data);
            });
          }
        }
      } catch (progressError) {
        console.error("Error fetching quiz progress:", progressError);
      }
    } catch (error) {
      console.error("Error fetching quiz data:", error);
    }
  };

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
  }, [completedCount, progressData]);
        
  const handleLessonComplete = async () => {
    const [sectionId, itemId] = currentLessonId.split('-').map(Number);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      let currentItem: LessonItem | undefined;
      let currentSection: SectionData | undefined;
      
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
      
      if (!currentItem.completed) {
        if (currentItem.type === 'video' && currentItem.lessonId) {
          const response = await axios.post(`${apiURL}/api/courses/lessons/${currentItem.lessonId}/complete`,
            { subject_id: subjectId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (response.data.success) {
            setCurrentLessonData(response.data.lesson);
            const updatedLessonData = [...lessonData];
            const sectionIndex = updatedLessonData.findIndex(s => s.id === sectionId);
            if (response.data.lesson.quiz) {
              setCurrentQuizData(response.data.lesson.quiz);
            }
            if (sectionIndex !== -1) {
              const itemIndex = updatedLessonData[sectionIndex].items.findIndex(i => i.id === itemId);
              
              if (itemIndex !== -1) {
                updatedLessonData[sectionIndex].items[itemIndex] = {
                  ...updatedLessonData[sectionIndex].items[itemIndex],
                  completed: true,
                  duration: "100%"
                };
                
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
                
                const totalItems = updatedLessonData[sectionIndex].items.length;
                const completedItems = updatedLessonData[sectionIndex].items.filter(item => item.completed).length;
                const sectionProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
                
                updatedLessonData[sectionIndex] = {
                  ...updatedLessonData[sectionIndex],
                  count: `${Math.round(sectionProgress)}%`
                };
                
                setLessonData(updatedLessonData);
              }
            }
          }
        } else if (currentItem.type === 'quiz' && currentItem.quizId) {
          const response = await axios.post(`${apiURL}/api/courses/quizzes/${currentItem.quizId}/complete`,
            { subject_id: subjectId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (response.data.success) {
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
                
                const totalItems = updatedLessonData[sectionIndex].items.length;
                const completedItems = updatedLessonData[sectionIndex].items.filter(item => item.completed).length;
                const sectionProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
                
                updatedLessonData[sectionIndex] = {
                  ...updatedLessonData[sectionIndex],
                  count: `${Math.round(sectionProgress)}%`
                };
                
                setLessonData(updatedLessonData);
              }
            }
          }
        }
      }
      
      const progressInfo = await fetchUserProgress();
      setProgressData(progressInfo);
      
      if (progressInfo?.progress?.progress_percentage === 100) {
        setCourseCompleted(true);
      }
      
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
                    <div className="progress-bar" style={{ width: `${progressData?.progress?.progress_percentage || progress}%` }}></div>
                  </div>
                  <div className="progress-percentage">{(progressData?.progress?.progress_percentage || progress).toFixed(0)}%</div>
                </div>
                <div className="progress-status">
                  <span className="status-text">สถานะ: </span>
                  <span className="status-value">
                    {(progressData?.progress?.progress_percentage || progress) < 100 ? 'กำลังเรียน' : 'เรียนจบแล้ว'}
                  </span>
                </div>
                {progressData?.progress && (
                  <div className="progress-details mt-2">
                    <div className="small text-muted">
                      บทเรียนที่เรียนจบแล้ว: {progressData.progress.completed_lessons || 0}/{progressData.progress.total_lessons || 0}
                    </div>
                    {progressData.progress.total_quizzes > 0 && (
                      <div className="small text-muted">
                        แบบทดสอบที่ทำแล้ว: {progressData.progress.completed_quizzes || 0}/{progressData.progress.total_quizzes || 0}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
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
                    {currentLessonData?.quiz && (
                      <div className="lesson-quiz-link mt-3">
                        <button 
                          className="btn btn-primary" 
                          onClick={() => {
                            setCurrentView('quiz');
                            setCurrentQuizData(currentLessonData.quiz);
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


