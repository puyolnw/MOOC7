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
   const [completedCount, setCompletedCount] = useState(0);
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
      
      console.log("Fetching user progress for subject:", subjectId);
      
      const response = await axios.get(`${apiURL}/api/courses/subjects/${subjectId}/progress`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log("Progress API Response:", response.data);
      
      if (response.data.success) {
        console.log("Progress Percentage:", response.data.progress?.progress_percentage || 0);
        console.log("Completed Lessons:", response.data.progress?.completed_lessons || 0);
        
        if (response.data.progress?.progress_percentage === 100) {
          setCourseCompleted(true);
        }
        
        if (response.data.lessonProgress && Array.isArray(response.data.lessonProgress)) {
          console.log("Lesson Progress Data:", response.data.lessonProgress);
          response.data.lessonProgress.forEach((item: any) => {
            console.log(`Lesson ${item.lesson_id}: Completed=${item.completed}, Progress=${item.progress}%`);
          });
        }
        
        if (response.data.quizProgress && Array.isArray(response.data.quizProgress)) {
          console.log("Quiz Progress Data:", response.data.quizProgress);
          response.data.quizProgress.forEach((item: any) => {
            console.log(`Quiz ${item.quiz_id}: Completed=${item.completed}, Score=${item.score}`);
          });
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
      console.log("Progress Data from API:", data);
      setProgressData(data);
      if (data && data.progress && data.progress.progress_percentage === 100) {
        setCourseCompleted(true);
      }
    });
  }, [subjectId, apiURL]);

  const processSubjectData = (subjectData: any, progressInfo: any = null) => {
    if (!subjectData) return [];
    
    console.log("Processing subject data with progress info:", progressInfo);
    
    const lessonProgress = progressInfo?.lessonProgress || [];
    const quizProgress = progressInfo?.quizProgress || [];
    
    const lessonProgressMap = new Map();
    const quizProgressMap = new Map();
    
    lessonProgress.forEach((item: any) => {
      if (item.lesson_id) {
        lessonProgressMap.set(String(item.lesson_id), item);
        console.log(`Mapped Lesson ID ${item.lesson_id}: Completed=${item.completed}, Progress=${item.progress}%`);
      }
    });
    
    quizProgress.forEach((item: any) => {
      if (item.quiz_id) {
        quizProgressMap.set(String(item.quiz_id), item);
        console.log(`Mapped Quiz ID ${item.quiz_id}: Completed=${item.completed}, Score=${item.score}`);
      }
    });
    
    console.log("Lesson Progress Map:", lessonProgressMap);
      
      try {
        const sections: SectionData[] = [];
        
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
        
        if (subjectData.lessons && subjectData.lessons.length > 0) {
          const sortedLessons = [...subjectData.lessons].sort((a, b) => {
            if (a.order_number !== undefined && b.order_number !== undefined) {
              return a.order_number - b.order_number;
            }
            return a.lesson_id - b.lesson_id;
          });
          
          const lessonsPerChapter = 2;
          
          const preTestCompleted = !subjectData.pre_test_id || subjectData.pre_test_completed || 
            (progressInfo?.quizProgress?.some((p: any) => p.quiz_id === subjectData.pre_test_id && p.completed));
          
          for (let chapterIndex = 0; chapterIndex < Math.ceil(sortedLessons.length / lessonsPerChapter); chapterIndex++) {
            const chapterLessons = sortedLessons.slice(
              chapterIndex * lessonsPerChapter, 
              (chapterIndex + 1) * lessonsPerChapter
            );
            
            const lessonItems: LessonItem[] = [];
            
            const previousChaptersCompleted = chapterIndex === 0 || 
              sections.filter(s => s.id > 1 && s.id < (2 + chapterIndex)).every(s => 
                s.items.every(item => item.completed)
              );
            
            const chapterLocked = !preTestCompleted || !previousChaptersCompleted;
            
            chapterLessons.forEach((lesson, index) => {
              const previousLessonsInChapterCompleted = index === 0 || 
                chapterLessons.slice(0, index).every(l => l.completed);
              
              const lessonLocked = chapterLocked || (index > 0 && !previousLessonsInChapterCompleted);
              
              const formattedTitle = `เนื้อหา ${chapterIndex + 1}.${index + 1} ${lesson.title}`;
              
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
              
              lessonItems.push({
                id: index * 2,
                title: formattedTitle,
                lock: lessonLocked,
                completed: lessonCompleted,
                type: 'video',
                duration: lessonCompleted ? "100%" : `${lessonProgress}%`,
                lessonId: lesson.lesson_id
              });
              
              if (lesson.quiz) {
                const quizTitle = `แบบทดสอบที่ ${chapterIndex + 1}.${index + 1} ${lesson.title}`;
                
                let quizCompleted = lesson.quiz_completed || false;
                let quizProgress = "0%";
                
                if (progressInfo?.quizProgress) {
                  const quizProgressData = progressInfo.quizProgress.find(
                    (p: any) => p.quiz_id === lesson.quiz.quiz_id
                  );
                  
                  if (quizProgressData) {
                    quizCompleted = quizProgressData.completed || quizCompleted;
                    quizProgress = quizCompleted ? "100%" : (quizProgressData.progress ? `${quizProgressData.progress}%` : "0%");
                  }
                }
                
                lessonItems.push({
                  id: index * 2 + 1,
                  title: quizTitle,
                  lock: lessonLocked || !lessonCompleted,
                  completed: quizCompleted,
                  type: 'quiz',
                  duration: quizProgress,
                  quizId: lesson.quiz.quiz_id
                });
              }
            });
            
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
        
        if (subjectData.postTest || (subjectData.post_test_id && subjectData.postTest)) {
          const allLessonsCompleted = sections.filter(s => s.id > 1).every(s => 
            s.items.every(item => item.completed)
          );
          
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
            id: sections.length + 1,
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
        
        return sections;
      } catch (error) {
        console.error("Error processing subject data:", error);
        return [];
      }
   };

   useEffect(() => {
    if (subjectData) {
      fetchUserProgress().then(progressInfo => {
        console.log("Progress Data from API:", progressInfo);
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
    
    // First check for incomplete lessons
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
    
    // If all lessons are completed or locked, select the first unlocked lesson
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
                
                setLessonData(updatedLessonData);
                
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
        
  const refreshSubjectData = async () => {
    try {
      if (!subjectId) return null;
      
      const token = localStorage.getItem("token");
      if (!token) return null;
      
      const response = await axios.get(`${apiURL}/api/courses/subjects/${subjectId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        const progressInfo = await fetchUserProgress();
        const updatedSections = processSubjectData(response.data.subject, progressInfo);
        setLessonData(updatedSections);
        
        return response.data.subject;
      }
    } catch (error) {
      console.error("Error refreshing subject data:", error);
    }
    return null;
  };

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
      
      console.log("Completing item:", currentItem);
      console.log(`Item type: ${currentItem.type}, Current completed status: ${currentItem.completed}`);
      
      if (!currentItem.completed) {
        if (currentItem.type === 'video' && currentItem.lessonId) {
          console.log(`Marking lesson ${currentItem.lessonId} as completed`);
          const response = await axios.post(`${apiURL}/api/courses/lessons/${currentItem.lessonId}/complete`,
            { subject_id: subjectId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("Lesson complete response:", response.data);
        } else if (currentItem.type === 'quiz' && currentItem.quizId) {
          console.log(`Marking quiz ${currentItem.quizId} as completed`);
          const response = await axios.post(`${apiURL}/api/courses/quizzes/${currentItem.quizId}/complete`,
            { subject_id: subjectId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("Quiz complete response:", response.data);
        }
      }
      
      const progressInfo = await fetchUserProgress();
      console.log("Updated progress after completion:", progressInfo);
      setProgressData(progressInfo);
      
      if (progressInfo?.progress?.progress_percentage === 100) {
        setCourseCompleted(true);
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
        console.log("Selected item:", item);
        console.log(`Item type: ${type}, Completed: ${item.completed}, Progress: ${item.duration}`);
        
        if (type === 'video' && item.lessonId) {
          console.log(`Fetching lesson data for lesson ID: ${item.lessonId}`);
          await fetchLessonData(item.lessonId);
        } else if (type === 'quiz' && item.quizId) {
          console.log(`Fetching quiz data for quiz ID: ${item.quizId}`);
          await fetchQuizData(item.quizId);
        }
      }
    }
  };

  useEffect(() => {
    if (!subjectData && !isLoading && lessonData.length === 0) {
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
      setProgress(40);
      
      setCurrentLessonId("2-0");
      setCurrentLesson("1.1 เนื้อหาหลัก");
      setCurrentView('video');
      setYoutubeId("BboMpayJomw");
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
                  <LessonVideo
                    onComplete={handleLessonComplete}
                    currentLesson={currentLesson}
                    youtubeId={youtubeId}
                    lessonData={currentLessonData}
                    progressData={progressData}
                    subjectId={subjectId}
                  />
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

