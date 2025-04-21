import axios from "axios";

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

// ฟังก์ชันสำหรับดึงข้อมูลความก้าวหน้าของผู้ใช้
export const fetchUserProgress = async (subjectId: string | undefined, apiURL: string, setCourseCompleted?: (completed: boolean) => void) => {
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
      if (response.data.progress?.progress_percentage === 100 && setCourseCompleted) {
        setCourseCompleted(true);
      }
      
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching user progress:", error);
  }
  return null;
};

// ฟังก์ชันสำหรับประมวลผลแบบทดสอบก่อนเรียน
const processPreTest = (subjectData: any, progressInfo: any = null) => {
  if (!subjectData.preTest && !subjectData.pre_test_id) {
    return null;
  }
  
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
  
  return {
    id: 1,
    title: "แบบทดสอบก่อนเรียน",
    count: preTestCompleted ? "100%" : "0%",
    items: [
      {
        id: 0,
        title: "เริ่มทำแบบทดสอบก่อนเรียน",
        lock: false,
        completed: preTestCompleted,
        type: 'quiz' as const,
        duration: preTestProgress,
        quizId: preTestData.quiz_id
      }
    ]
  };
};

// ฟังก์ชันสำหรับประมวลผลบทเรียน
const processLessons = (subjectData: any, progressInfo: any = null, lessonProgressMap: Map<string, any>) => {
  if (!subjectData.lessons || subjectData.lessons.length === 0) {
    return [];
  }
  
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
  
  const sections: SectionData[] = [];
  
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
          console.log(`Lesson ${lesson.lesson_id} progress:`, lessonProgressData ? JSON.stringify(lessonProgressData) : 'none');
console.log(`Lesson ${lesson.lesson_id} has quiz:`,  lesson.quiz_id);
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
        progressInfo.lessonProgress.forEach((item: any) => {
          if (item.lesson_id) {
            lessonProgressMap.set(String(item.lesson_id), item);
          }
        });
      }
      
      // ใช้ map ที่สร้างขึ้นในการตรวจสอบสถานะ
      const lessonProgressData = lessonProgressMap.get(String(lesson.lesson_id));
      console.log(`Lesson ${lesson.lesson_id} progress:`, lessonProgressData);
console.log(`Lesson ${lesson.lesson_id} has quiz:`,  lesson.quiz_id);
        
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
      processLessonQuiz(lesson, chapterNumber, lessonIndex, lessonLocked, lessonCompleted, progressInfo, chapterItems);
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
  
  return sections;
};

// ฟังก์ชันสำหรับประมวลผลแบบทดสอบท้ายบทเรียน
const processLessonQuiz = (
  lesson: any, 
  chapterNumber: number, 
  lessonIndex: number, 
  lessonLocked: boolean, 
  lessonCompleted: boolean, 
  progressInfo: any,
  chapterItems: LessonItem[]
) => {
  // แก้ไขการตรวจสอบให้ใช้ quiz_id หรือ quiz object โดยตรง ไม่ต้องสนใจ has_quiz
  if (lesson.quiz_id || lesson.quiz) {
    console.log(`Lesson ${lesson.lesson_id} has quiz:`,lesson.quiz_id);
    
    const quizData = lesson.quiz || { quiz_id: lesson.quiz_id };
    const quizTitle = `แบบทดสอบท้ายบท ${chapterNumber}.${lessonIndex + 1} ${lesson.title}`;
    
    let quizCompleted = lesson.quiz_completed || false;
    let quizProgress = "0%";
    
    if (progressInfo?.quizProgress) {
      const quizProgressData = progressInfo.quizProgress.find(
        (p: any) => p.quiz_id === (quizData.quiz_id || lesson.quiz_id)
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
      quizId: quizData.quiz_id || lesson.quiz_id
    });
  } else {
    // เพิ่มการตรวจสอบ quiz จาก quizProgress ที่อาจเกี่ยวข้องกับบทเรียนนี้
    if (progressInfo?.quizProgress) {
      // ตรวจสอบว่ามี quiz ที่เกี่ยวข้องกับบทเรียนนี้หรือไม่
      const relatedQuiz = progressInfo.quizProgress.find(
        (q: any) => q.lesson_id === lesson.lesson_id
      );
      
      if (relatedQuiz) {
        console.log(`Found related quiz for lesson ${lesson.lesson_id}:`, relatedQuiz);
        
        const quizTitle = `แบบทดสอบท้ายบท ${chapterNumber}.${lessonIndex + 1} ${lesson.title}`;
        
        chapterItems.push({
          id: lessonIndex * 2 + 1,
          title: quizTitle,
          lock: lessonLocked || !lessonCompleted,
          completed: relatedQuiz.completed || false,
          type: 'quiz',
          duration: relatedQuiz.completed ? "100%" : (relatedQuiz.progress ? `${relatedQuiz.progress}%` : "0%"),
          quizId: relatedQuiz.quiz_id
        });
      }
    }
  }
};

// ฟังก์ชันสำหรับประมวลผลแบบทดสอบหลังเรียน
const processPostTest = (subjectData: any, progressInfo: any = null, lessonProgressMap: Map<string, any>) => {
  if (!subjectData.postTest && !subjectData.post_test_id) {
    return null;
  }
  
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
  
  return {
    id: 9999,
    title: "แบบทดสอบหลังเรียน",
    count: postTestCompleted ? "100%" : "0%",
    items: [
      {
        id: 0,
        title: "เริ่มทำแบบทดสอบหลังเรียน",
        lock: !allLessonsCompleted,
        completed: postTestCompleted,
        type: 'quiz' as const,
        duration: postTestProgress,
        quizId: postTestData.quiz_id
      }
    ]
  };
};

// ฟังก์ชันสำหรับประมวลผลข้อมูลรายวิชา
export const processSubjectData = (subjectData: any, progressInfo: any = null) => {
  if (!subjectData) return [];
  
  console.log("Processing subject data:", subjectData);
  console.log("With progress info:", progressInfo);
  
  const quizProgress = progressInfo?.quizProgress || [];
  
  const lessonProgressMap = new Map();
  const quizProgressMap = new Map();
  
  quizProgress.forEach((item: any) => {
    if (item.quiz_id) {
      quizProgressMap.set(String(item.quiz_id), item);
    }
  });
    
  try {
    const sections: SectionData[] = [];
    
    // แบบทดสอบก่อนเรียน
    const preTestSection = processPreTest(subjectData, progressInfo);
    if (preTestSection) {
      sections.push(preTestSection);
    }
    
    // บทเรียน
    const lessonSections = processLessons(subjectData, progressInfo, lessonProgressMap);
    sections.push(...lessonSections);
    
    // แบบทดสอบหลังเรียน
    const postTestSection = processPostTest(subjectData, progressInfo, lessonProgressMap);
    if (postTestSection) {
      sections.push(postTestSection);
    }
    
    console.log("Processed sections:", sections);
    return sections;
  } catch (error) {
    console.error("Error processing subject data:", error);
    return [];
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลบทเรียน
export const fetchLessonData = async (
  lessonId: number, 
  apiURL: string, 
  currentLessonId: string, 
  lessonData: SectionData[], 
  setCurrentLessonData: (data: any) => void,
  setCurrentQuizData: (data: any) => void,
  setYoutubeId: (id: string) => void,
  setLessonData: (data: SectionData[]) => void,
  setLessonProgressMap: (callback: (prev: Record<string, any>) => Record<string, any>) => void
) => {
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
      // แก้ไขการตรวจสอบให้ใช้ quiz_id หรือ quiz object โดยตรง ไม่ต้องสนใจ has_quiz
      if (response.data.lesson.quiz_id || response.data.lesson.quiz) {
        console.log("Lesson has quiz:", response.data.lesson.quiz || response.data.lesson.quiz_id);
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
      
      await updateLessonProgress(
        lessonId,
        apiURL,
        currentLessonId,
        lessonData,
        setLessonData,
        setLessonProgressMap
      );
    }
  } catch (error) {
    console.error("Error fetching lesson data:", error);
  }
};

// ฟังก์ชันสำหรับอัปเดตความก้าวหน้าของบทเรียน
const updateLessonProgress = async (
  lessonId: number,
  apiURL: string,
  currentLessonId: string,
  lessonData: SectionData[],
  setLessonData: (data: SectionData[]) => void,
  setLessonProgressMap: (callback: (prev: Record<string, any>) => Record<string, any>) => void
) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;
    
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
};

// ฟังก์ชันสำหรับดึงข้อมูลแบบทดสอบ
export const fetchQuizData = async (
  quizId: number,
  apiURL: string,
  currentLessonId: string,
  lessonData: SectionData[],
  setCurrentQuizData: (data: any) => void,
  setLessonData: (data: SectionData[]) => void,
  setLessonProgressMap: (callback: (prev: Record<string, any>) => Record<string, any>) => void,
  fetchUserProgress: () => Promise<any>,
  setProgressData: (data: any) => void
) => {
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
    
    await updateQuizProgress(
      quizId,
      apiURL,
      currentLessonId,
      lessonData,
      setLessonData,
      setLessonProgressMap,
      fetchUserProgress,
      setProgressData
    );
  } catch (error) {
    console.error("Error fetching quiz data:", error);
  }
};

// ฟังก์ชันสำหรับอัปเดตความก้าวหน้าของแบบทดสอบ
const updateQuizProgress = async (
  quizId: number,
  apiURL: string,
  currentLessonId: string,
  lessonData: SectionData[],
  setLessonData: (data: SectionData[]) => void,
  setLessonProgressMap: (callback: (prev: Record<string, any>) => Record<string, any>) => void,
  fetchUserProgress: () => Promise<any>,
  setProgressData: (data: any) => void
) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;
    
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
          
          // ปลดล็อคตามเงื่อนไขต่างๆ
          handleQuizUnlocking(
            sectionId,
            itemIndex,
            sectionIndex,
            updatedLessonData,
            progressResponse.data.progress.completed
          );
          
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
};

// ฟังก์ชันสำหรับจัดการการปลดล็อคหลังจากทำแบบทดสอบเสร็จ
const handleQuizUnlocking = (
  sectionId: number,
  itemIndex: number,
  sectionIndex: number,
  updatedLessonData: SectionData[],
  isCompleted: boolean
) => {
  if (!isCompleted) return;

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
  // กรณีเป็นแบบทดสอบท้ายบทเรียน
  else if (sectionId !== 9999) {
    // ถ้าเป็นแบบทดสอบท้ายบทสุดท้ายในเซ็กชัน
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
    } 
    // ถ้าเป็นแบบทดสอบท้ายบทที่ไม่ใช่บทสุดท้ายในเซ็กชัน
    else if (itemIndex + 1 < updatedLessonData[sectionIndex].items.length) {
      updatedLessonData[sectionIndex].items[itemIndex + 1] = {
        ...updatedLessonData[sectionIndex].items[itemIndex + 1],
        lock: false
      };
    }
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
};

