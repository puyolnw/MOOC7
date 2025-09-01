import { useState, useEffect, useMemo } from "react";
import './LessonFaq.css';


interface LessonItem {
  id: number;
  title: string;
  lock: boolean;
  completed: boolean;
  type: 'video' | 'quiz';
  duration: string;
  status?: 'passed' | 'failed' | 'awaiting_review';
  quiz_id?: number;
}

interface SectionData {
  id: number;
  title: string;
  count: string;
  items: LessonItem[];
}

interface SubjectQuiz {
  quiz_id: number;
  title: string;
  description?: string;
  type: "pre_test" | "big_pre_test" | "post_test";
  locked: boolean;
  completed: boolean;
  passed: boolean;
  status: "passed" | "failed" | "awaiting_review" | "not_started";
  score?: number;
  max_score?: number;
}

interface LessonFaqProps {
  onViewChange: (view: 'video' | 'quiz') => void;
  lessonData: SectionData[];
  onSelectLesson: (sectionId: number, itemId: number, title: string, type: 'video' | 'quiz') => void;
  subjectId?: number;
  subjectQuizzes?: SubjectQuiz[];
  // เพิ่ม prop ใหม่เพื่อให้รู้ว่ากำลังเรียนบทไหนอยู่
  currentLessonId?: string;
  // เพิ่ม prop สำหรับควบคุม activeAccordion จากภายนอก
  activeAccordion?: number | null;
  onAccordionChange?: (accordionId: number | null) => void;
  // ✅ เพิ่ม prop สำหรับ hierarchical data
  hierarchicalData?: any;
  // ✅ Task 5: ลบ payment-related props
  // paymentStatus?: any;
  // onUploadSlip?: (file: File) => Promise<void>;
}

// ✅ Task 5: ลบ BankAccount interface ที่ไม่ใช้แล้ว
// interface BankAccount {
//   bank_name: string;
//   account_name: string;
//   account_number: string;
//   bank_code?: string;
//   branch_name?: string;
//   account_type: string;
//   is_default: boolean;
// }

const LessonFaq = ({ 
  lessonData, 
  onSelectLesson, 
  subjectId,
  subjectQuizzes: externalSubjectQuizzes,
  // เพิ่ม prop ใหม่เพื่อให้รู้ว่ากำลังเรียนบทไหนอยู่
  // currentLessonId,
  // เพิ่ม prop สำหรับควบคุม activeAccordion จากภายนอก
  activeAccordion: externalActiveAccordion,
  onAccordionChange,
  // ✅ เพิ่ม prop สำหรับ hierarchical data
  hierarchicalData,
  // ✅ Task 5: ลบ payment-related parameters
  // paymentStatus,
  // onUploadSlip
}: LessonFaqProps) => {
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  // ✅ Task 5: ลบ bank account related states
  // const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  // const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);
  // const apiURL = import.meta.env.VITE_API_URL;
  const [subjectQuizzes, setSubjectQuizzes] = useState<SubjectQuiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // const navigate = useNavigate();

  // ใช้ controlled accordion ถ้ามีการส่งค่าจากภายนอก
  const currentActiveAccordion = useMemo(() => {
    return externalActiveAccordion !== undefined ? externalActiveAccordion : activeAccordion;
  }, [externalActiveAccordion, activeAccordion]);
  
  // ✅ เพิ่ม debug log เพื่อดูการเปลี่ยนแปลงของ activeAccordion
  useEffect(() => {
            // console.log("🎯 LessonFaq currentActiveAccordion changed:", currentActiveAccordion);
        // console.log("🎯 LessonFaq externalActiveAccordion:", externalActiveAccordion);
        // console.log("🎯 LessonFaq local activeAccordion:", activeAccordion);
        // console.log("🎯 LessonFaq onAccordionChange exists:", !!onAccordionChange);
  }, [currentActiveAccordion, externalActiveAccordion, activeAccordion, onAccordionChange]);
  
  // ✅ เพิ่ม useEffect เพื่อ sync local state กับ external state เมื่อมีการเปลี่ยนแปลงจากภายนอก
  useEffect(() => {
    if (externalActiveAccordion !== undefined && externalActiveAccordion !== activeAccordion) {
                  // console.log("🎯 LessonFaq syncing local state with external state:", externalActiveAccordion);
      setActiveAccordion(externalActiveAccordion);
    }
  }, [externalActiveAccordion, activeAccordion]);

  // ✅ เพิ่ม useEffect เพื่อป้องกัน accordion ถูกปิดโดยไม่ได้ตั้งใจ
  useEffect(() => {
    // ถ้ามี externalActiveAccordion และไม่ใช่ null ให้รักษาไว้
    if (externalActiveAccordion !== undefined && externalActiveAccordion !== null) {
                  // console.log("🎯 LessonFaq preserving accordion state:", externalActiveAccordion);
      
      // ✅ เพิ่มการป้องกัน accordion ปิดโดยไม่ได้ตั้งใจ
      if (activeAccordion !== externalActiveAccordion) {
                    // console.log("🎯 LessonFaq syncing local accordion state with external:", externalActiveAccordion);
        setActiveAccordion(externalActiveAccordion);
      }
    }
  }, [externalActiveAccordion]);

  // ✅ เพิ่ม useEffect เพื่อป้องกัน accordion ปิดเมื่อมีการเปลี่ยนแปลง state อื่นๆ
  useEffect(() => {
    // ถ้ามี externalActiveAccordion และไม่ใช่ null ให้รักษาไว้เสมอ
    if (externalActiveAccordion !== undefined && externalActiveAccordion !== null) {
                  // console.log("🎯 LessonFaq continuously protecting accordion state:", externalActiveAccordion);
      
      // ตรวจสอบว่า accordion state ตรงกับที่ต้องการหรือไม่
      if (activeAccordion !== externalActiveAccordion) {
                    // console.log("🎯 LessonFaq accordion state mismatch detected, restoring...");
        // ✅ ใช้ setTimeout เพื่อป้องกัน infinite loop
        setTimeout(() => {
          setActiveAccordion(externalActiveAccordion);
        }, 0);
      }
    }
  }, [externalActiveAccordion]); // ✅ ลบ activeAccordion ออกจาก dependency array เพื่อป้องกัน infinite loop
  
  // ฟังก์ชันสำหรับอัปเดต accordion
  const updateActiveAccordion = (accordionId: number | null) => {
    console.log("🎯 LessonFaq updateActiveAccordion called with:", accordionId);
    console.log("🎯 LessonFaq onAccordionChange exists:", !!onAccordionChange);
    if (onAccordionChange) {
      console.log("🎯 เรียก onAccordionChange จากภายนอก");
      onAccordionChange(accordionId);
    } else {
      console.log("🎯 ใช้ local state");
      setActiveAccordion(accordionId);
    }
  };



  // ฟังก์ชันเช็คว่าควรล็อคบทเรียนหรือไม่ (รองรับระบบใหม่)
  const shouldLockLesson = (sectionIndex: number, itemIndex: number) => {
    const section = lessonData[sectionIndex];
    const currentItem = section?.items[itemIndex];
    
    console.log(`🔍 ตรวจสอบการล็อค: sectionIndex=${sectionIndex}, itemIndex=${itemIndex}`);
    console.log(`📚 Section: ${section?.title}`);
    console.log(`🎯 Current Item:`, currentItem);
    
    if (currentItem && currentItem.type === "quiz") {
      // ตรวจสอบว่าเป็นแบบทดสอบท้ายบทหรือไม่
      const isEndOfChapterQuiz = currentItem.title.includes("แบบทดสอบท้ายบท") || 
                                 currentItem.title.includes("แบบทดสอบท้ายบทใหญ่") ||
                                 currentItem.title.includes("1.X แบบทดสอบท้ายบทใหญ่") ||
                                 currentItem.title.includes("1.X");
      
      console.log(`🎯 Is End of Chapter Quiz: ${isEndOfChapterQuiz}`);
      console.log(`🎯 Quiz Title: "${currentItem.title}"`);
      
      if (isEndOfChapterQuiz) {
        // ตรวจสอบว่ามี video ใน section นี้หรือไม่
        const videosInSection = section.items.filter(item => item.type === "video");
        const hasVideo = videosInSection.length > 0;
        
        console.log(`📹 Videos in section: ${videosInSection.length}`);
        console.log(`📹 Has video: ${hasVideo}`);
        
        // ถ้าไม่มี video เลย ให้ไม่ล็อค
        if (!hasVideo) {
          console.log(`✅ ไม่ล็อค: ไม่มี video ใน section นี้`);
          return false;
        }
        
        // ตรวจสอบว่า video ทั้งหมดใน section นี้เสร็จแล้วหรือไม่
        const completedVideos = videosInSection.filter(item => item.completed === true);
        const allVideosCompleted = completedVideos.length === videosInSection.length;
        
        console.log(`✅ Completed videos: ${completedVideos.length}/${videosInSection.length}`);
        console.log(`✅ All videos completed: ${allVideosCompleted}`);
        
        // ถ้า video ทั้งหมดเสร็จแล้ว ให้ไม่ล็อค
        if (allVideosCompleted) {
          console.log(`✅ ไม่ล็อค: video ทั้งหมดเสร็จแล้ว`);
          return false;
        }
        
        // ล็อคถ้า video ยังไม่เสร็จ
        console.log(`🔒 Should lock: video ยังไม่เสร็จ`);
        return true;
      }
    }
    
    console.log(`✅ ไม่ล็อค: ไม่ใช่แบบทดสอบท้ายบท`);
    return false;
  };

  // ✅ เพิ่มฟังก์ชันคำนวณ progress จาก hierarchical data
  const calculateHierarchicalProgress = () => {
    if (!hierarchicalData) {
      return { totalItems: 0, completedItems: 0, progress: 0 };
    }

    let totalItems = 0;
    let completedItems = 0;

    // คำนวณจาก Big Lessons
    if (hierarchicalData.big_lessons && Array.isArray(hierarchicalData.big_lessons)) {
      hierarchicalData.big_lessons.forEach((bigLesson: any) => {
        // Big Lesson Quiz
        if (bigLesson.quiz) {
          totalItems++;
          if (bigLesson.quiz.progress?.passed) {
            completedItems++;
          }
        }

        // Lessons ใน Big Lesson
        if (bigLesson.lessons && Array.isArray(bigLesson.lessons)) {
          bigLesson.lessons.forEach((lesson: any) => {
            totalItems++; // Video
            if (lesson.video_completed) {
              completedItems++;
            }

            if (lesson.quiz) {
              totalItems++; // Quiz
              if (lesson.quiz.progress?.passed) {
                completedItems++;
              }
            }
          });
        }
      });
    }

    // Post-test
    if (hierarchicalData.post_test) {
      totalItems++;
      if (hierarchicalData.post_test.progress?.passed) {
        completedItems++;
      }
    }

    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    return { totalItems, completedItems, progress };
  };

  // ✅ ใช้ hierarchical progress แทนการคำนวณแบบเก่า
  const { totalItems, completedItems, progress: overallProgress } = calculateHierarchicalProgress();
  
  // ✅ เพิ่ม debug log
  console.log("🎯 LessonFaq received hierarchicalData:", hierarchicalData);
  console.log("🎯 LessonFaq hierarchicalData type:", typeof hierarchicalData);
  console.log("🎯 LessonFaq hierarchicalData keys:", hierarchicalData ? Object.keys(hierarchicalData) : 'null');
  console.log("🎯 LessonFaq calculated progress:", { totalItems, completedItems, overallProgress });
  
  // ✅ เพิ่ม console.log รายละเอียดเพิ่มเติมตามที่ user ขอ
  if (hierarchicalData) {
    console.log("🔍 4.3 แบบทดสอบประจำบทเรียน:", {
      big_lessons: hierarchicalData.big_lessons?.map((bl: any) => ({
        big_lesson_id: bl.id,
        title: bl.title,
        quiz: bl.quiz ? {
          id: bl.quiz.id,
          title: bl.quiz.title,
          status: bl.quiz.progress?.passed ? 'ผ่าน' : 
                 bl.quiz.progress?.awaiting_review ? 'รอตรวจ' : 
                 bl.quiz.progress?.completed ? 'ไม่ผ่าน' : 'ยังไม่ทำ',
          can_take: bl.lessons?.every((l: any) => l.video_completed) || false
        } : null
      })) || []
    });
    
    console.log("🔍 4.4 บทเรียนย่อยประจำ:", {
      sub_lessons: hierarchicalData.big_lessons?.flatMap((bl: any) => 
        bl.lessons?.map((lesson: any) => ({
          big_lesson_id: bl.id,
          big_lesson_title: bl.title,
          lesson_id: lesson.id,
          lesson_title: lesson.title,
          video_completed: lesson.video_completed === true,
          status: lesson.video_completed ? 'ผ่าน' : 'ไม่ผ่าน'
        })) || []
      ) || []
    });
    
    console.log("🔍 4.5 แบบทดสอบประจำบทเรียนย่อย:", {
      sub_lesson_quizzes: hierarchicalData.big_lessons?.flatMap((bl: any) => 
        bl.lessons?.filter((lesson: any) => lesson.quiz).map((lesson: any) => ({
          big_lesson_id: bl.id,
          big_lesson_title: bl.title,
          lesson_id: lesson.id,
          lesson_title: lesson.title,
          quiz: {
            id: lesson.quiz.id,
            title: lesson.quiz.title,
            status: lesson.quiz.progress?.passed ? 'ผ่าน' : 
                   lesson.quiz.progress?.awaiting_review ? 'รอตรวจ' : 
                   lesson.quiz.progress?.completed ? 'ไม่ผ่าน' : 'ยังไม่ทำ',
            can_take: lesson.video_completed === true
          }
        })) || []
      ) || []
    });
  }

  // ✅ เพิ่ม useEffect เพื่อติดตาม hierarchicalData
  useEffect(() => {
    console.group('📥 LessonFaq: hierarchicalData prop changed');
    console.log('🎯 New hierarchicalData:', hierarchicalData);
    console.log('🎯 Is valid:', !!hierarchicalData);
    console.log('🎯 Has big_lessons:', !!(hierarchicalData && hierarchicalData.big_lessons));
    console.log('🎯 Big lessons count:', hierarchicalData?.big_lessons?.length || 0);
    if (hierarchicalData && hierarchicalData.big_lessons) {
      console.log('🎯 Big lessons structure:', hierarchicalData.big_lessons.map((bl: any) => ({
        id: bl.id,
        title: bl.title,
        lessonsCount: bl.lessons?.length || 0
      })));
    }
    console.groupEnd();
  }, [hierarchicalData]);

  // ใช้ข้อมูลแบบทดสอบจาก parent component
  useEffect(() => {
    if (externalSubjectQuizzes) {
      setSubjectQuizzes(externalSubjectQuizzes);
      setLoadingQuizzes(false);
      setError(null);
      
      // ✅ ป้องกันการ override activeAccordion เมื่อมีการควบคุมจากภายนอก
      // ตรวจสอบว่ามีแบบทดสอบก่อนเรียนหรือไม่ และตั้งค่า activeAccordion
      // แต่ไม่ override ถ้ามีการควบคุมจากภายนอก
      if (!onAccordionChange) {
        const preTest = externalSubjectQuizzes.find(q => q.type === "pre_test" || q.type === "big_pre_test");
        if (preTest) {
          setActiveAccordion(-1000);
        }
      }
    } else {
      setSubjectQuizzes([]);
    }
  }, [externalSubjectQuizzes, onAccordionChange]);

  useEffect(() => {
    // ✅ ลบ useEffect ที่ override locked property เป็น false
    // setSubjectQuizzes(prev => prev.map(quiz => ({
    //   ...quiz,
    //   locked: false // ปลดล็อคทุกแบบทดสอบ pre/post
    // })));
    
    // ✅ Task 5: ลบการเรียก fetchBankAccounts
    // fetchBankAccounts();
  }, [lessonData]);

  const handleItemClick = (sectionId: number, item: LessonItem, sectionIndex: number, itemIndex: number) => {
    console.log(`🎯 handleItemClick called:`, { sectionId, itemId: item.id, title: item.title, type: item.type });
    
    const isLocked = shouldLockLesson(sectionIndex, itemIndex);
    console.log(`🔒 Is locked: ${isLocked}`);
    
    if (isLocked) {
      // แสดงข้อความเฉพาะสำหรับแบบทดสอบท้ายบท
      const section = lessonData[sectionIndex];
      const videosInSection = section.items.filter(item => item.type === "video");
      const completedVideos = videosInSection.filter(item => item.completed === true);
      
      let message = `🔒 แบบทดสอบท้ายบทยังไม่พร้อมใช้งาน\n\n`;
      message += `📚 บทเรียน: ${section.title}\n`;
      message += `🎯 แบบทดสอบ: ${item.title}\n\n`;
      
      // แสดงข้อมูล video
      if (videosInSection.length > 0) {
        message += `📹 วิดีโอในบทเรียนนี้: ${videosInSection.length} วิดีโอ\n`;
        message += `✅ เรียนจบแล้ว: ${completedVideos.length} วิดีโอ\n`;
        message += `❌ ยังไม่จบ: ${videosInSection.length - completedVideos.length} วิดีโอ\n\n`;
        
        // แสดงรายการ video ที่ยังไม่จบ
        const incompleteVideos = videosInSection.filter(item => item.completed !== true);
        if (incompleteVideos.length > 0) {
          message += `📹 วิดีโอที่ต้องเรียนให้จบ:\n`;
          incompleteVideos.forEach((video, index) => {
            message += `   ${index + 1}. ${video.title}\n`;
          });
          message += `\n`;
        }
      }
      
      message += `💡 กรุณาเรียนวิดีโอให้จบก่อนทำแบบทดสอบท้ายบท`;
      
      alert(message);
      return;
    }
    
    // ถ้าไม่ล็อค ให้ดำเนินการตามปกติ
    // อัปเดต activeAccordion ให้ตรงกับ section ที่เลือก
    updateActiveAccordion(sectionId);
    
    // เรียกใช้ onSelectLesson เพื่อส่งข้อมูลไปยัง parent component
    onSelectLesson(sectionId, item.id, item.title, item.type);
  };

  // แปลง SubjectQuiz เป็น LessonItem แล้วเรียก onSelectLesson
  const handleSubjectQuizClick = (quiz: SubjectQuiz) => {
    // ตรวจสอบการล็อคแบบทดสอบ
    if (quiz.locked) {
      if (quiz.type === 'post_test') {
        // ตรวจสอบเงื่อนไขการปลดล็อค post-test
        const preTest = subjectQuizzes.find(q => q.type === 'pre_test' || q.type === 'big_pre_test');
        let message = "แบบทดสอบหลังเรียนยังไม่พร้อมใช้งาน\n\n";
        
        if (preTest && !preTest.completed) {
          message += "• กรุณาทำแบบทดสอบก่อนเรียนให้เสร็จก่อน\n";
        }
        
        // ตรวจสอบ progress ของทุก item ในบทเรียน
        // ✅ ใช้ hierarchical progress แทนการคำนวณแบบเก่า
        if (overallProgress < 90) {
          message += `• กรุณาเรียนบทเรียนให้เสร็จอย่างน้อย 90% (ปัจจุบัน ${overallProgress.toFixed(1)}%)\n`;
        }
        
        // เพิ่มข้อมูลเพิ่มเติม
        message += `\n📊 สรุป:\n`;
        message += `• บทเรียนทั้งหมด: ${hierarchicalData?.big_lessons?.length || 0} บท\n`;
        message += `• เนื้อหาทั้งหมด: ${totalItems} รายการ (เสร็จแล้ว ${completedItems} รายการ)\n`;
        message += `• ความคืบหน้าโดยรวม: ${overallProgress.toFixed(1)}%\n`;
        
        alert(message);
      } else {
        alert("แบบทดสอบนี้ยังไม่พร้อมใช้งาน");
      }
      return;
    }

    // อัปเดต activeAccordion ให้ตรงกับแบบทดสอบที่เลือก
            const specialSectionId = (quiz.type === 'pre_test' || quiz.type === 'big_pre_test') ? -1000 : -2000;
    updateActiveAccordion(specialSectionId);

    // ส่งข้อมูลแบบทดสอบพิเศษไปยัง parent component
    // ใช้ค่าลบเพื่อแยกจากบทเรียนปกติ
    const specialItemId = quiz.quiz_id;
    
    onSelectLesson(specialSectionId, specialItemId, quiz.title, 'quiz');
  };

  const toggleAccordion = (id: number) => {
    console.log("🎯 LessonFaq toggleAccordion called with id:", id);
    console.log("🎯 LessonFaq currentActiveAccordion:", currentActiveAccordion);
    console.log("🎯 LessonFaq externalActiveAccordion:", externalActiveAccordion);
    
    // ✅ ป้องกันการปิด accordion โดยไม่ได้ตั้งใจ
    // ถ้ามีการควบคุมจากภายนอก และ accordion ปัจจุบันเปิดอยู่ ให้ไม่ปิด
    if (onAccordionChange && externalActiveAccordion === id) {
      console.log("🎯 LessonFaq preventing accordion close - controlled by parent");
      return;
    }
    
    // ✅ ถ้ามีการควบคุมจากภายนอก ให้เปิด accordion ใหม่ได้ แต่ไม่ปิด accordion ที่เปิดอยู่
    if (onAccordionChange) {
      console.log("🎯 LessonFaq opening new accordion:", id);
      onAccordionChange(id);
      return;
    }
    
    // ถ้าไม่มีการควบคุมจากภายนอก ให้ทำงานแบบปกติ
    const newState = currentActiveAccordion === id ? null : id;
    console.log("🎯 LessonFaq setting accordion to:", newState);
    updateActiveAccordion(newState);
    
    // ✅ เพิ่มการป้องกัน accordion ปิดโดยไม่ได้ตั้งใจ
    setTimeout(() => {
      if (activeAccordion !== newState && newState !== null) {
        console.log("⚠️ Accordion state was unexpectedly changed, restoring...");
        // ✅ ใช้ setTimeout เพื่อป้องกัน infinite loop
        setTimeout(() => {
          setActiveAccordion(newState);
        }, 0);
      }
    }, 50);
  };

  // ✅ Task 5: ลบ fetchBankAccounts function ที่ไม่ใช้แล้ว
  // const fetchBankAccounts = async () => {
  //   try {
  //     setLoadingBankAccounts(true);
  //     const response = await axios.get(`${apiURL}/api/bank-accounts/active`);
  //     
  //     if (response.data.success) {
  //       setBankAccounts(response.data.bankAccounts);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching bank accounts:", error);
  //   } finally {
  //     setLoadingBankAccounts(false);
  //   }
  // };

  // ฟังก์ชันสำหรับ render แบบทดสอบในรูปแบบ accordion เหมือนบทเรียน
  const renderQuizSection = (quiz: SubjectQuiz, sectionId: number) => {
    // เพิ่มการแสดงสถานะ "รอตรวจ"
    const getQuizStatus = (quiz: SubjectQuiz) => {
      if (quiz.status === 'awaiting_review') {
        return {
          status: 'awaiting_review',
          text: 'รอตรวจ',
          icon: 'fas fa-clock text-warning',
          className: 'status-awaiting',
          description: 'แบบทดสอบถูกส่งแล้ว รออาจารย์ตรวจให้คะแนน'
        };
      } else if (quiz.status === 'passed') {
        return {
          status: 'passed',
          text: 'ผ่าน',
          icon: 'fas fa-check-circle text-success',
          className: 'status-passed',
          description: 'ผ่านการตรวจจากอาจารย์แล้ว'
        };
      } else if (quiz.status === 'failed') {
        return {
          status: 'failed',
          text: 'ไม่ผ่าน',
          icon: 'fas fa-times-circle text-danger',
          className: 'status-not-passed',
          description: 'ไม่ผ่านการตรวจจากอาจารย์'
        };
      } else {
        return {
          status: 'not_started',
          text: 'ยังไม่เริ่ม',
          icon: 'fas fa-circle text-muted',
          className: 'status-not-passed',
          description: 'ยังไม่ได้เริ่มทำแบบทดสอบ'
        };
      }
    };

    const status = getQuizStatus(quiz);
    
    return (
      <div key={`${quiz.type}-${quiz.quiz_id}`} className="accordion-item">
        <h2 className="accordion-header">
          <button 
            className={`accordion-button ${currentActiveAccordion === sectionId ? '' : 'collapsed'}`}
            type="button"
            onClick={() => toggleAccordion(sectionId)}
          >
            <span className="section-title">
              {(quiz.type === 'pre_test' || quiz.type === 'big_pre_test') ? '🎯 ' : '🏁 '}{quiz.title}
            </span>
            <span className={`section-status ${status.className}`}>
              <i className={status.icon}></i>
              {status.text}
            </span>
          </button>
        </h2>
        <div 
          id={`collapse${sectionId}`} 
          className={`accordion-collapse collapse ${currentActiveAccordion === sectionId ? 'show' : ''}`}
        >
          <div className="accordion-body">
            <ul className="list-wrap">
              <li
                className={`course-item ${quiz.completed ? 'completed' : ''} ${quiz.locked ? 'locked' : ''}`}
                onClick={() => handleSubjectQuizClick(quiz)}
                style={{ cursor: quiz.locked ? 'not-allowed' : 'pointer' }}
              >
                <div className="course-item-link">
                  <span className="item-name">
                    {quiz.locked && <i className="fas fa-lock lock-icon me-2"></i>}
                    {quiz.title}
                  </span>
                  <span className={`item-status ${status.className}`}>
                    <i className={status.icon}></i>
                    {status.text}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // ✅ ลบ useEffect ที่ซับซ้อนและขัดแย้งกัน - ให้ parent component ควบคุม accordion state แทน
  // useEffect(() => {
  //   console.log("🎯 LessonFaq useEffect - currentLessonId:", currentLessonId);
  //   
  //   // ✅ ป้องกันการ override accordion state เมื่อมีการควบคุมจากภายนอก
  //   if (onAccordionChange) {
  //     console.log("🎯 มีการควบคุม accordion จากภายนอก - ไม่ override state");
  //     return;
  //   }
  //   
  //   // ถ้ามี currentLessonId ให้เปิด accordion ที่ตรงกับบทเรียนปัจจุบัน
  //   if (currentLessonId) {
  //     const [sectionId] = currentLessonId.split("-").map(Number);
  //     console.log("🎯 แยก sectionId:", sectionId);
  //     
  //     // ตรวจสอบว่าเป็นแบบทดสอบพิเศษหรือไม่
  //     if (sectionId < 0) {
  //       // แบบทดสอบก่อน/หลังเรียน
  //       console.log("🎯 แบบทดสอบพิเศษ - เปิด accordion:", sectionId);
  //       updateActiveAccordion(sectionId);
  //       return;
  //     }
  //     
  //       // บทเรียนปกติ - เปิด accordion ของ section ที่กำลังเรียน
  //       console.log("🎯 บทเรียนปกติ - เปิด accordion:", sectionId);
  //       updateActiveAccordion(sectionId);
  //       return;
  //     }
  //     
  //     // ถ้าไม่มี currentLessonId (กรณีเริ่มต้น) ให้ใช้ logic เดิม
  //     // ตรวจสอบว่ามีแบบทดสอบก่อนเรียนหรือไม่
  //     const preTest = externalSubjectQuizzes?.find(q => q.type === "pre_test" || q.type === "big_pre_test");
  //     
  //     if (preTest) {
  //       // ถ้ามีแบบทดสอบก่อนเรียน ให้เปิดแอคคอร์เดียนของแบบทดสอบก่อนเรียน
  //       console.log("🎯 เริ่มต้น - เปิดแบบทดสอบก่อนเรียน");
  //       updateActiveAccordion(-1000);
  //     } else if (lessonData.length > 0) {
  //       // ถ้าไม่มีแบบทดสอบก่อนเรียน ให้เปิดแอคคอร์เดียนแรกที่ยังไม่เสร็จ
  //       for (const section of lessonData) {
  //         for (const item of section.items) {
  //           if (!item.completed) {
  //             console.log("🎯 เริ่มต้น - เปิดบทเรียนแรกที่ยังไม่เสร็จ:", section.id);
  //             updateActiveAccordion(section.id);
  //             return;
  //           }
  //         }
  //       }
  //       // ถ้าทุกบทเรียนเสร็จแล้ว ให้เปิดแอคคอร์เดียนแรก
  //       console.log("🎯 เริ่มต้น - ทุกบทเรียนเสร็จแล้ว เปิดแอคคอร์เดียนแรก");
  //       updateActiveAccordion(lessonData[0].id);
  //     }
  //   }, [currentLessonId, lessonData, externalSubjectQuizzes, onAccordionChange]);

  return (
    <div className="accordion" id="accordionExample">
      {/* Loading */}
      {loadingQuizzes && (
        <div className="loading-container text-center p-3">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <span className="ms-2">กำลังโหลดแบบทดสอบ...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button 
            type="button" 
            className="btn btn-sm btn-outline-danger ms-2"
            onClick={() => window.location.reload()}
          >
            ลองใหม่
          </button>
        </div>
      )}

      {/* แบบทดสอบก่อนเรียน */}
      {subjectQuizzes
        .filter(quiz => quiz.type === "pre_test" || quiz.type === "big_pre_test")
        .map((quiz) => {
          // ✅ ใช้ hierarchical data เพื่อหาสถานะที่ถูกต้องของ Pre-test
          // Pre-test ไม่มีใน hierarchical structure เพราะไม่นับคะแนน
          // แต่เราสามารถใช้ข้อมูลจาก subjectQuizzes ที่มีอยู่แล้ว
          
          return renderQuizSection(quiz, -1000);
        })}
      {/* บทเรียนปกติ */}
      {lessonData.map((section, sectionIndex) => {
        // ✅ ใช้ hierarchical data เพื่อหาสถานะที่ถูกต้อง
        const bigLesson = hierarchicalData?.big_lessons?.find((bl: any) => bl.id === section.id);
        let sectionStatus = "ไม่ผ่าน";
        let sectionCount = "ไม่ผ่าน";
        
        if (bigLesson) {
          // คำนวณสถานะของ Big Lesson จาก hierarchical data
          let totalItems = 0;
          let completedItems = 0;
          
          // Big Lesson Quiz
          if (bigLesson.quiz) {
            totalItems++;
            if (bigLesson.quiz.progress?.passed) {
              completedItems++;
            }
          }
          
          // Lessons ใน Big Lesson
          if (bigLesson.lessons && Array.isArray(bigLesson.lessons)) {
            bigLesson.lessons.forEach((lesson: any) => {
              totalItems++; // Video
              if (lesson.video_completed) {
                completedItems++;
              }
              
              if (lesson.quiz) {
                totalItems++; // Quiz
                if (lesson.quiz.progress?.passed) {
                  completedItems++;
                }
              }
            });
          }
          
          const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
          
          if (progress === 100) {
            sectionStatus = "ผ่าน";
            sectionCount = "ผ่าน";
          } else if (progress > 0) {
            sectionStatus = "กำลังเรียน";
            sectionCount = `${progress.toFixed(0)}%`;
          }
        }
        
        return (
          <div key={section.id} className="accordion-item">
            <h2 className="accordion-header">
              <button 
                className={`accordion-button ${currentActiveAccordion === section.id ? '' : 'collapsed'}`}
                type="button"
                onClick={() => toggleAccordion(section.id)}
              >
                <span className="section-title">{section.title}</span>
                <span className={`section-status ${
                  sectionStatus === "ผ่าน" ? "status-passed" : 
                  sectionStatus === "กำลังเรียน" ? "status-awaiting" : "status-not-passed"
                }`}>
                  {sectionCount}
                </span>
              </button>
            </h2>
            <div 
              id={`collapseOne${section.id}`} 
              className={`accordion-collapse collapse ${currentActiveAccordion === section.id ? 'show' : ''}`}
            >
              <div className="accordion-body">
                <ul className="list-wrap">
                  {section.items.map((item, itemIndex) => {
                    // ✅ ใช้ hierarchical data เพื่อหาสถานะที่ถูกต้อง
                    const bigLesson = hierarchicalData?.big_lessons?.find((bl: any) => bl.id === section.id);
                    let itemCompleted = item.completed;
                    let itemStatus = item.completed ? "เสร็จสิ้น" : "ยังไม่เสร็จ";
                    
                    if (bigLesson) {
                      if (item.type === "video") {
                        // หา lesson ที่ตรงกับ item
                        const lesson = bigLesson.lessons?.find((l: any) => l.id === item.id);
                        if (lesson) {
                          itemCompleted = lesson.video_completed === true;
                          itemStatus = itemCompleted ? "เสร็จสิ้น" : "ยังไม่เสร็จ";
                        }
                      } else if (item.type === "quiz") {
                        // หา quiz ที่ตรงกับ item
                        const lesson = bigLesson.lessons?.find((l: any) => l.quiz?.id === item.id);
                        if (lesson?.quiz) {
                          itemCompleted = lesson.quiz.progress?.passed === true;
                          itemStatus = itemCompleted ? "ผ่าน" : "ยังไม่ผ่าน";
                        } else if (bigLesson.quiz?.id === item.id) {
                          // Big Lesson Quiz
                          itemCompleted = bigLesson.quiz.progress?.passed === true;
                          itemStatus = itemCompleted ? "ผ่าน" : "ยังไม่ผ่าน";
                        }
                      }
                    }
                    
                    const isLocked = shouldLockLesson(sectionIndex, itemIndex);
                    const isEndOfChapterQuiz = item.type === "quiz" && (
                      item.title.includes("แบบทดสอบท้ายบท") || 
                      item.title.includes("แบบทดสอบท้ายบทใหญ่") ||
                      item.title.includes("1.X แบบทดสอบท้ายบทใหญ่") ||
                      item.title.includes("1.X")
                    );
                    
                    // คำนวณข้อมูลสำหรับแสดงสถานะล็อค
                    let lockReason = "";
                    if (isLocked && isEndOfChapterQuiz) {
                      const videosInSection = section.items.filter(item => item.type === "video");
                      const completedVideos = videosInSection.filter(item => item.completed === true);
                      
                      if (completedVideos.length < videosInSection.length) {
                        lockReason = `📹 ต้องเรียนวิดีโอให้จบก่อน (${completedVideos.length}/${videosInSection.length})`;
                      }
                    }
                    
                    return (
                      <li
                        key={item.id}
                        className={`course-item ${itemCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                        onClick={() => handleItemClick(section.id, item, sectionIndex, itemIndex)}
                        style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
                        title={isLocked ? lockReason : ''}
                      >
                        <div className="item-content">
                          <div className="item-icon">
                            {item.type === "video" && (
                              <i className={`fas fa-play-circle ${itemCompleted ? 'text-success' : 'text-primary'}`}></i>
                            )}
                            {item.type === "quiz" && (
                              <i className={`fas fa-question-circle ${itemCompleted ? 'text-success' : isLocked ? 'text-warning' : 'text-info'}`}></i>
                            )}
                          </div>
                          <div className="item-details">
                            <div className="item-title">
                              {item.title}
                              {isLocked && (
                                <span className="lock-indicator">
                                  <i className="fas fa-lock text-warning ms-2"></i>
                                </span>
                              )}
                            </div>
                            {isLocked && lockReason && (
                              <div className="lock-reason text-warning small">
                                {lockReason}
                              </div>
                            )}
                            {itemCompleted && (
                              <div className="completion-status text-success small">
                                <i className="fas fa-check-circle me-1"></i>
                                {itemStatus}
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        );
      })}

      {/* แบบทดสอบหลังเรียน */}
      {subjectQuizzes
        .filter(quiz => quiz.type === "post_test")
        .map((quiz) => {
          // ✅ ใช้ hierarchical data เพื่อหาสถานะที่ถูกต้องของ Post-test
          const postTest = hierarchicalData?.post_test;
          let quizStatus = quiz.status;
          let quizCompleted = quiz.completed;
          let quizPassed = quiz.passed;
          
          if (postTest) {
            quizCompleted = postTest.progress?.completed === true;
            quizPassed = postTest.progress?.passed === true;
            quizStatus = quizPassed ? "passed" : quizCompleted ? "awaiting_review" : "not_started";
          }
          
          // สร้าง quiz object ใหม่ที่มีข้อมูลจาก hierarchical data
          const updatedQuiz = {
            ...quiz,
            completed: quizCompleted,
            passed: quizPassed,
            status: quizStatus
          };
          
          return renderQuizSection(updatedQuiz, -2000);
        })}

      {/* ✅ Task 5: ลบส่วนการชำระเงินทั้งหมด */}

      {/* แสดงข้อความเมื่อไม่มีแบบทดสอบหรือ error */}
        {!loadingQuizzes && subjectQuizzes?.length === 0 && subjectId && !error && (
          <div className="no-quizzes alert alert-info text-center p-3 mb-0" role="alert">
            <i className="fas fa-info-circle me-2"></i>
            ไม่มีแบบทดสอบก่อนเรียนหรือหลังเรียนสำหรับวิชานี้
          </div>
        )}
        {error && (
          <div className="error-message alert alert-danger text-center p-3 mb-0" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            เกิดข้อผิดพลาด: {typeof error === 'string' ? error : 'ไม่สามารถโหลดข้อมูลได้'}
          </div>
        )}
    </div>
  );
};

export default LessonFaq;
