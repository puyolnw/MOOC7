import { useState, useEffect, useMemo, useRef } from "react";
import './LessonFaq.css';
import axios from 'axios';


interface LessonItem {
  id: number;
  lesson_id?: number; // ✅ เพิ่ม lesson_id สำหรับการจับคู่กับ hierarchicalData
  title: string;
  lock: boolean;
  completed: boolean;
  type: 'video' | 'quiz';
  duration: string;
  status?: 'passed' | 'failed' | 'awaiting_review' | 'not_started';
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
  // ✅ เพิ่ม prop สำหรับแสดง modal
  onShowLockedModal?: (data: any) => void;
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
  currentLessonId,
  // เพิ่ม prop สำหรับควบคุม activeAccordion จากภายนอก
  activeAccordion: externalActiveAccordion,
  onAccordionChange,
  // ✅ เพิ่ม prop สำหรับ hierarchical data
  hierarchicalData,
  // ✅ เพิ่ม prop สำหรับแสดง modal
  onShowLockedModal,
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
  // ✅ เพิ่ม state สำหรับจัดเก็บสถานะแบบทดสอบที่เสถียร
  const [stableQuizStatuses, setStableQuizStatuses] = useState<Map<string, string>>(new Map());
  // ✅ เพิ่ม state สำหรับ Special Quiz status
  const [specialQuizStatuses, setSpecialQuizStatuses] = useState<Map<number, string>>(new Map());
  // const navigate = useNavigate();

  // ✅ API base URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3301';

  // ✅ ฟังก์ชันสำหรับตรวจสอบ Special Quiz status
  const checkSpecialQuizStatus = async (quizId: number) => {
    try {
      console.log(`🔍 [LessonFaq] Checking special quiz status for quizId: ${quizId}`);
      const response = await axios.get(
        `${API_URL}/api/special-quiz/attempts/all`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success && response.data.attempts) {
        const attempts = response.data.attempts;
        const quizAttempts = attempts.filter((attempt: any) => attempt.quiz_id === quizId);
        
        if (quizAttempts.length > 0) {
          console.log(`🔍 [LessonFaq] Found ${quizAttempts.length} special quiz attempts for quiz ${quizId}`);
          // API ส่งเฉพาะ awaiting_review status มา
          setSpecialQuizStatuses(prev => {
            const newMap = new Map(prev);
            newMap.set(quizId, 'awaiting_review');
            return newMap;
          });
          console.log(`✅ [LessonFaq] Set quiz ${quizId} to awaiting_review`);
          return 'awaiting_review';
        }
      }
    } catch (error) {
      console.log(`🔍 [LessonFaq] No special quiz attempts found for quiz ${quizId}:`, error);
    }
    return null;
  };

  // ใช้ controlled accordion ถ้ามีการส่งค่าจากภายนอก
  const currentActiveAccordion = useMemo(() => {
    return externalActiveAccordion !== undefined ? externalActiveAccordion : activeAccordion;
  }, [externalActiveAccordion, activeAccordion]);

  // ✅ useEffect สำหรับตรวจสอบ Special Quiz status เมื่อ component mount
  useEffect(() => {
    if (lessonData.length > 0) {
      console.log(`🔍 [LessonFaq] Checking special quiz statuses for all quizzes...`);
      lessonData.forEach(section => {
        section.items.forEach(item => {
          if (item.type === 'quiz' && item.quiz_id) {
            // ตรวจสอบ Special Quiz status
            setTimeout(() => {
              checkSpecialQuizStatus(item.quiz_id!);
            }, 100); // เพิ่ม delay เล็กน้อยเพื่อไม่ให้เรียก API พร้อมกันหมด
          }
        });
      });
    }
  }, [lessonData]);
  
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
    if (onAccordionChange) {
      onAccordionChange(accordionId);
    } else {
      setActiveAccordion(accordionId);
    }
  };



  // ฟังก์ชันแสดง modal สำหรับเนื้อหาที่ล็อค
  const showLockedContentModal = (data: any) => {
    if (onShowLockedModal) {
      onShowLockedModal(data);
    }
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
    // ✅ ใช้ cached status แทนการเรียก shouldLockLesson
    const key = `${sectionId}-${item.id}`;
    const cachedStatus = lessonStatusesRef.current.get(key);
    const isLocked = cachedStatus?.isLocked ?? false;
    
    if (isLocked) {
      // แสดงข้อความเฉพาะสำหรับแบบทดสอบที่ล็อค
      const section = lessonData[sectionIndex];
      const quizTitle = item.title;
      
      // ตรวจสอบประเภทของแบบทดสอบ
      const isSubLessonQuiz = quizTitle.includes("แบบทดสอบย่อย") || quizTitle.includes("แบบทดสอบ -");
      const isBigLessonQuiz = quizTitle.includes("แบบทดสอบท้ายบทใหญ่") || quizTitle.includes("แบบทดสอบประกอบบทเรียน");
      
      let lockedContentData: any = {
        sectionTitle: section.title,
        quizTitle: item.title,
        totalVideos: 0,
        completedVideos: 0,
        incompleteVideos: [],
        requirements: []
      };
      
      if (isSubLessonQuiz) {
        // แบบทดสอบย่อย: แสดงข้อมูลวิดีโอก่อนหน้า
        const currentVideoIndex = itemIndex - 1;
        if (currentVideoIndex >= 0) {
          const previousVideo = section.items[currentVideoIndex];
          if (previousVideo && previousVideo.type === "video") {
            lockedContentData.totalVideos = 1;
            lockedContentData.completedVideos = previousVideo.completed ? 1 : 0;
            if (!previousVideo.completed) {
              lockedContentData.incompleteVideos = [previousVideo];
            }
            lockedContentData.requirements.push("กรุณาดูวิดีโอก่อนหน้าให้เสร็จก่อนทำแบบทดสอบ");
          }
        }
      } else if (isBigLessonQuiz) {
        // แบบทดสอบท้ายบทใหญ่: แสดงข้อมูลวิดีโอและแบบทดสอบย่อยทั้งหมด
        const videosInSection = section.items.filter(item => item.type === "video");
        const subQuizzesInSection = section.items.filter(item => 
          item.type === "quiz" && 
          (item.title.includes("แบบทดสอบย่อย") || item.title.includes("แบบทดสอบ -"))
        );
        
        const completedVideos = videosInSection.filter(item => item.completed === true);
        const completedSubQuizzes = subQuizzesInSection.filter(item => item.completed === true);
        
        lockedContentData.totalVideos = videosInSection.length;
        lockedContentData.completedVideos = completedVideos.length;
        lockedContentData.incompleteVideos = videosInSection.filter(item => !item.completed);
        
        // เพิ่มเงื่อนไขที่ต้องทำ
        if (completedVideos.length < videosInSection.length) {
          lockedContentData.requirements.push(`กรุณาดูวิดีโอให้เสร็จทั้งหมด (${completedVideos.length}/${videosInSection.length} เสร็จแล้ว)`);
        }
        if (completedSubQuizzes.length < subQuizzesInSection.length) {
          lockedContentData.requirements.push(`กรุณาทำแบบทดสอบย่อยให้เสร็จทั้งหมด (${completedSubQuizzes.length}/${subQuizzesInSection.length} เสร็จแล้ว)`);
        }
      }
      
      // แสดง popup
      showLockedContentModal(lockedContentData);
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
    // ✅ Debug: ตรวจสอบสถานะแบบทดสอบหลังเรียน
    console.log(`🔍 Post Test Click: ${quiz.title}`, {
      quiz_locked: quiz.locked,
      quiz_type: quiz.type,
      overall_progress: overallProgress,
      total_items: totalItems,
      completed_items: completedItems
    });
    
    // ✅ ตรวจสอบเงื่อนไขการล็อคแบบทดสอบหลังเรียนใน frontend
    let shouldLockPostTest = false;
    if (quiz.type === 'post_test') {
      const preTest = subjectQuizzes.find(q => q.type === 'pre_test' || q.type === 'big_pre_test');
      
      // เงื่อนไขการล็อคแบบทดสอบหลังเรียน:
      // 1. แบบทดสอบก่อนเรียนยังไม่เสร็จ
      // 2. ความคืบหน้าน้อยกว่า 90%
      shouldLockPostTest = (preTest && !preTest.completed) || overallProgress < 90;
      
      console.log(`🔍 Post Test Lock Check:`, {
        pre_test_completed: preTest?.completed,
        overall_progress: overallProgress,
        should_lock: shouldLockPostTest,
        backend_locked: quiz.locked
      });
    }
    
    // ตรวจสอบการล็อคแบบทดสอบ (backend หรือ frontend)
    if (quiz.locked || shouldLockPostTest) {
      if (quiz.type === 'post_test') {
        // ตรวจสอบเงื่อนไขการปลดล็อค post-test
        const preTest = subjectQuizzes.find(q => q.type === 'pre_test' || q.type === 'big_pre_test');
        
        // สร้างข้อมูลสำหรับ modal
        const lockedContentData: any = {
          sectionTitle: "แบบทดสอบหลังเรียน",
          quizTitle: quiz.title,
          totalVideos: totalItems,
          completedVideos: completedItems,
          incompleteVideos: [], // ไม่มีวิดีโอที่ต้องเรียนให้จบ
          progressPercentage: overallProgress,
          requirements: []
        };
        
        // เพิ่มเงื่อนไขที่ต้องทำ
        if (preTest && !preTest.completed) {
          lockedContentData.requirements.push("กรุณาทำแบบทดสอบก่อนเรียนให้เสร็จก่อน");
        }
        
        if (overallProgress < 90) {
          lockedContentData.requirements.push(`กรุณาเรียนบทเรียนให้เสร็จอย่างน้อย 90% (ปัจจุบัน ${overallProgress.toFixed(1)}%)`);
        }
        
        // แสดง modal
        if (onShowLockedModal) {
          onShowLockedModal(lockedContentData);
        }
      } else {
        // สำหรับแบบทดสอบอื่นๆ ที่ล็อค
        const lockedContentData = {
          sectionTitle: "แบบทดสอบ",
          quizTitle: quiz.title,
          totalVideos: 0,
          completedVideos: 0,
          incompleteVideos: [],
          progressPercentage: 0,
          requirements: ["แบบทดสอบนี้ยังไม่พร้อมใช้งาน"]
        };
        
        if (onShowLockedModal) {
          onShowLockedModal(lockedContentData);
        }
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
    // ✅ ทำงานแบบง่าย - เปิด/ปิด accordion
    const newState = currentActiveAccordion === id ? null : id;
    updateActiveAccordion(newState);
    
    // ✅ ถ้ามีการควบคุมจากภายนอก ให้แจ้ง parent ด้วย
    if (onAccordionChange) {
      onAccordionChange(newState);
    }
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

  // ฟังก์ชันสำหรับ render แบบทดสอบในรูปแบบใหม่
  const renderQuizSection = (quiz: SubjectQuiz) => {
    const getQuizStatus = (quiz: SubjectQuiz) => {
      // ถ้าล็อค ให้แสดงล็อค
      if (quiz.locked) {
        return {
          status: 'locked',
          text: 'ล็อค',
          className: 'status-locked'
        };
      }
      
      // ถ้าไม่ล็อค ให้แสดงสถานะหลัก
      if (quiz.status === 'awaiting_review') {
        return {
          status: 'awaiting_review',
          text: 'รอตรวจ',
          className: 'status-awaiting'
        };
      } else if (quiz.status === 'passed') {
        return {
          status: 'passed',
          text: 'ผ่าน',
          className: 'status-passed'
        };
      } else if (quiz.status === 'failed') {
        return {
          status: 'failed',
          text: 'ไม่ผ่าน',
          className: 'status-not-passed'
        };
      } else {
        return {
          status: 'not_started',
          text: 'ยังไม่ทำ',
          className: 'status-not-passed'
        };
      }
    };

    const status = getQuizStatus(quiz);
    const isPreTest = quiz.type === 'pre_test' || quiz.type === 'big_pre_test';
    
    // ตรวจสอบว่าอยู่ในหน้าปัจจุบันหรือไม่
    const specialSectionId = isPreTest ? -1000 : -2000;
    const isCurrentPage = currentLessonId === `${specialSectionId}-${quiz.quiz_id}`;
    
    return (
      <div 
        key={`${quiz.type}-${quiz.quiz_id}`} 
        className={`special-quiz ${isPreTest ? 'pretest' : 'posttest'} ${isCurrentPage ? 'current-page' : ''}`}
        onClick={() => handleSubjectQuizClick(quiz)}
        style={{ cursor: quiz.locked ? 'not-allowed' : 'pointer' }}
      >
        <div className={`special-quiz-icon ${isPreTest ? 'pretest' : 'posttest'}`}>
          {isPreTest ? '🎯' : '🏁'}
        </div>
        <div className="special-quiz-title">
          {quiz.title}
        </div>
        <div className={`special-quiz-status ${status.className}`}>
          {status.text}
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

  // ✅ Cache lesson statuses to prevent flickering - ใช้ useRef เพื่อเก็บสถานะที่เสถียร
  const lessonStatusesRef = useRef(new Map());
  
  // ✅ อัปเดต statuses เมื่อ hierarchicalData หรือ lessonData เปลี่ยน
  useEffect(() => {
    if (!hierarchicalData?.big_lessons) {
      lessonStatusesRef.current.clear();
      return;
    }
    
    console.log("🔄 LessonFaq: Updating lesson statuses...", { 
      lessonDataLength: lessonData.length, 
      hierarchicalDataLength: hierarchicalData.big_lessons.length 
    });
    
    const statusMap = new Map();
    
    lessonData.forEach((section) => {
      const bigLesson = hierarchicalData.big_lessons.find((bl: any) => bl.id === section.id);
      
      section.items.forEach((item, itemIndex) => {
        const key = `${section.id}-${item.id}`;
        let itemCompleted = item.completed;
        let isLocked = false;
        
        if (bigLesson) {
          if (item.type === "video") {
            // ✅ ใช้ lesson_id แทน id เพราะ ID ไม่ตรงกัน
            const lesson = bigLesson.lessons?.find((l: any) => l.id === item.lesson_id);
            if (lesson) {
              itemCompleted = lesson.video_completed === true;
              // ✅ Debug: ตรวจสอบข้อมูลวิดีโอ
              console.log(`🎥 Video ${item.title}:`, {
                item_id: item.id,
                lesson_id: item.lesson_id,
                video_completed: lesson.video_completed,
                itemCompleted: itemCompleted,
                lesson_data: lesson
              });
            } else {
              console.log(`❌ No lesson found for video lesson_id: ${item.lesson_id}`);
            }
          } else if (item.type === "quiz") {
            // ✅ ใช้ lesson_id แทน id เพราะ ID ไม่ตรงกัน
            const lesson = bigLesson.lessons?.find((l: any) => l.quiz?.id === item.lesson_id);
            if (lesson?.quiz) {
              itemCompleted = lesson.quiz.progress?.passed === true;
              // ✅ Debug: ตรวจสอบข้อมูลแบบทดสอบย่อย
              console.log(`📝 Quiz ${item.title}:`, {
                item_id: item.id,
                lesson_id: item.lesson_id,
                quiz_progress: lesson.quiz.progress,
                itemCompleted: itemCompleted,
                lesson_data: lesson
              });
            } else if (bigLesson.quiz?.id === item.lesson_id) {
              itemCompleted = bigLesson.quiz.progress?.passed === true;
              // ✅ Debug: ตรวจสอบข้อมูลแบบทดสอบท้ายบทใหญ่
              console.log(`🎯 Big Quiz ${item.title}:`, {
                item_id: item.id,
                lesson_id: item.lesson_id,
                quiz_progress: bigLesson.quiz.progress,
                itemCompleted: itemCompleted,
                big_lesson_data: bigLesson
              });
            } else {
              console.log(`❌ No quiz found for lesson_id: ${item.lesson_id}`);
            }
            
            // Check if quiz should be locked
            const quizTitle = item.title;
            // ✅ Debug: ดูชื่อแบบทดสอบจริง
            console.log(`🔍 Quiz Title Check: "${quizTitle}"`);
            
            // ✅ ตรวจสอบแบบทดสอบท้ายบทใหญ่ก่อน เพราะมีคำว่า "แบบทดสอบท้ายบท" เหมือนกัน
            const isBigLessonQuiz = quizTitle.includes("แบบทดสอบท้ายบทใหญ่") || quizTitle.includes("แบบทดสอบประกอบบทเรียน");
            const isSubLessonQuiz = !isBigLessonQuiz && (quizTitle.includes("แบบทดสอบย่อย") || quizTitle.includes("แบบทดสอบ -") || quizTitle.includes("แบบทดสอบท้ายบท"));
            
            console.log(`🔍 Quiz Type Detection:`, {
              title: quizTitle,
              isSubLessonQuiz: isSubLessonQuiz,
              isBigLessonQuiz: isBigLessonQuiz
            });
            
            if (isSubLessonQuiz) {
              console.log(`🔍 Entering Sub Quiz Lock Logic for: ${item.title}`);
              const currentVideoIndex = itemIndex - 1;
              console.log(`🔍 Current Video Index: ${currentVideoIndex}, Item Index: ${itemIndex}`);
              
              if (currentVideoIndex >= 0) {
                const previousVideo = section.items[currentVideoIndex];
                console.log(`🔍 Previous Video Found:`, previousVideo);
                
                if (previousVideo && previousVideo.type === "video") {
                  // ✅ ใช้ lesson_id แทน id เพราะ ID ไม่ตรงกัน
                  const prevLesson = bigLesson.lessons?.find((l: any) => l.id === previousVideo.lesson_id);
                  console.log(`🔍 Previous Lesson Found:`, prevLesson);
                  console.log(`🔍 Looking for lesson_id: ${previousVideo.lesson_id} in lessons:`, bigLesson.lessons?.map((l: any) => l.id));
                  
                  if (prevLesson) {
                    // ✅ แบบทดสอบย่อยจะล็อคเมื่อวิดีโอก่อนหน้ายังไม่เสร็จ
                    isLocked = !prevLesson.video_completed;
                    // ✅ Debug: ตรวจสอบการล็อคแบบทดสอบย่อย
                    console.log(`🔒 Sub Quiz Lock Check ${item.title}:`, {
                      previous_video: previousVideo.title,
                      video_completed: prevLesson.video_completed,
                      isLocked: isLocked,
                      prev_lesson_data: prevLesson
                    });
                  } else {
                    console.log(`❌ No previous lesson found for video ID: ${previousVideo.id}`);
                  }
                } else {
                  console.log(`❌ Previous item is not a video:`, previousVideo);
                }
              } else {
                console.log(`❌ Current video index is negative: ${currentVideoIndex}`);
              }
            } else if (isBigLessonQuiz) {
              console.log(`🔍 Entering Big Quiz Lock Logic for: ${item.title}`);
              
              const videosInSection = section.items.filter(item => item.type === "video");
              const subQuizzesInSection = section.items.filter(item => 
                item.type === "quiz" && 
                (item.title.includes("แบบทดสอบย่อย") || item.title.includes("แบบทดสอบ -") || item.title.includes("แบบทดสอบท้ายบท"))
              );
              
              console.log(`🔍 Videos in section:`, videosInSection.map(v => v.title));
              console.log(`🔍 Sub quizzes in section:`, subQuizzesInSection.map(q => q.title));
              
              let completedVideos = 0;
              if (bigLesson.lessons) {
                completedVideos = bigLesson.lessons.filter((lesson: any) => lesson.video_completed === true).length;
              }
              
              let completedSubQuizzes = 0;
              if (bigLesson.lessons) {
                completedSubQuizzes = bigLesson.lessons.filter((lesson: any) => 
                  lesson.quiz && lesson.quiz.progress?.passed === true
                ).length;
              }
              
              console.log(`🔍 Completion stats:`, {
                completedVideos: completedVideos,
                totalVideos: videosInSection.length,
                completedSubQuizzes: completedSubQuizzes,
                totalSubQuizzes: subQuizzesInSection.length
              });
              
              isLocked = completedVideos < videosInSection.length || completedSubQuizzes < subQuizzesInSection.length;
              
              console.log(`🔒 Big Quiz Lock Check ${item.title}:`, {
                isLocked: isLocked,
                reason: isLocked ? 
                  (completedVideos < videosInSection.length ? 'videos not completed' : 'sub quizzes not completed') : 
                  'all completed'
              });
            }
          }
        }
        
        // ✅ เพิ่มการจัดเก็บสถานะของแบบทดสอบใน cache
        let cachedQuizStatus = null;
        
        if (item.type === "quiz" && bigLesson) {
          const lesson = bigLesson.lessons?.find((l: any) => l.quiz?.id === item.lesson_id);
          if (lesson?.quiz?.progress) {
            const quizProgress = lesson.quiz.progress;
            if (quizProgress.awaiting_review) {
              cachedQuizStatus = 'awaiting_review';
            } else if (quizProgress.passed) {
              cachedQuizStatus = 'passed';
            } else if (quizProgress.completed && !quizProgress.passed) {
              cachedQuizStatus = 'failed';
            }
          } else if (bigLesson.quiz?.id === item.lesson_id && bigLesson.quiz?.progress) {
            const quizProgress = bigLesson.quiz.progress;
            if (quizProgress.awaiting_review) {
              cachedQuizStatus = 'awaiting_review';
            } else if (quizProgress.passed) {
              cachedQuizStatus = 'passed';
            } else if (quizProgress.completed && !quizProgress.passed) {
              cachedQuizStatus = 'failed';
            }
          }
          
          // ✅ ตรวจสอบ Special Quiz status ถ้าไม่มีสถานะจาก hierarchical data
          if (!cachedQuizStatus && item.quiz_id) {
            const specialStatus = specialQuizStatuses.get(item.quiz_id);
            if (specialStatus) {
              cachedQuizStatus = specialStatus;
            } else {
              // เรียกตรวจสอบ Special Quiz status (async)
              checkSpecialQuizStatus(item.quiz_id);
            }
          }
        }
        
        statusMap.set(key, { itemCompleted, isLocked, quizStatus: cachedQuizStatus });
        
        // ✅ อัปเดต stable quiz statuses เมื่อมีสถานะใหม่
        if (item.type === "quiz" && cachedQuizStatus) {
          setStableQuizStatuses(prev => {
            const newMap = new Map(prev);
            const currentStableStatus = newMap.get(key);
            
            // อัปเดตเฉพาะเมื่อสถานะเปลี่ยนจริงๆ
            if (currentStableStatus !== cachedQuizStatus) {
              console.log(`🔄 Stable Status Update: ${item.title}`, {
                old_stable: currentStableStatus,
                new_stable: cachedQuizStatus,
                lesson_id: item.lesson_id
              });
              newMap.set(key, cachedQuizStatus);
            }
            return newMap;
          });
        }
        
        // ✅ Debug: ตรวจสอบผลลัพธ์สุดท้าย
        if (item.type === "quiz") {
          console.log(`📊 Final Status ${item.title}:`, {
            key: key,
            itemCompleted: itemCompleted,
            isLocked: isLocked,
            final_display: isLocked ? "ล็อค" : itemCompleted ? "เสร็จ" : "ยังไม่เสร็จ"
          });
        }
      });
    });
    
    lessonStatusesRef.current = statusMap;
    
    console.log("✅ LessonFaq: Lesson statuses updated", statusMap);
  }, [hierarchicalData, lessonData]); // ✅ เพิ่ม lessonData เป็น dependency // ✅ ใช้เฉพาะ hierarchicalData เป็น dependency

  // ✅ Auto-open accordion when currentLessonId changes
  useEffect(() => {
    // ถ้ามี currentLessonId ให้เปิด accordion ที่ตรงกับบทเรียนปัจจุบัน
    if (currentLessonId) {
      const [sectionId] = currentLessonId.split("-").map(Number);
      
      // ตรวจสอบว่าเป็นแบบทดสอบพิเศษหรือไม่
      if (sectionId < 0) {
        // แบบทดสอบก่อน/หลังเรียน
        updateActiveAccordion(sectionId);
        return;
      }
      
      // บทเรียนปกติ - เปิด accordion ของ section ที่กำลังเรียน
      updateActiveAccordion(sectionId);
      return;
    }
  }, [currentLessonId, updateActiveAccordion]);

  return (
    <div className="accordion" id="accordionExample">
      {/* Loading */}
      {loadingQuizzes && (
        <div className="loading-state">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <span className="ms-2">กำลังโหลดแบบทดสอบ...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-state">
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
          
          return renderQuizSection(quiz);
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
        
        const isOpen = currentActiveAccordion === section.id;
        
        return (
          <div key={section.id}>
            {/* Section Header */}
            <div 
              className={`section-header ${isOpen ? 'active' : ''}`}
              onClick={() => toggleAccordion(section.id)}
            >
              <div className="section-title">{section.title}</div>
              <div className={`section-status ${
                sectionStatus === "ผ่าน" ? "status-passed" : 
                sectionStatus === "กำลังเรียน" ? "status-awaiting" : "status-not-passed"
              }`}>
                {sectionCount}
              </div>
            </div>
            
            {/* Section Content */}
            <div className={`section-content ${isOpen ? 'open' : ''}`}>
              {section.items.map((item, itemIndex) => {
                // ✅ ใช้ cached status เพื่อป้องกันการเปลี่ยนแปลงไปมา
                const key = `${section.id}-${item.id}`;
                const cachedStatus = lessonStatusesRef.current.get(key);
                
                const itemCompleted = cachedStatus?.itemCompleted ?? item.completed;
                const isLocked = cachedStatus?.isLocked ?? false;
                const cachedQuizStatus = cachedStatus?.quizStatus;
                
                // ตรวจสอบว่าอยู่ในหน้าปัจจุบันหรือไม่
                const isCurrentPage = currentLessonId === `${section.id}-${item.id}`;
                
                // ✅ เพิ่มการจัดการสถานะรอตรวจสำหรับแบบทดสอบ
                // ใช้ข้อมูลจาก hierarchical data เพื่อหาสถานะที่ถูกต้อง
                let itemStatus = item.status;
                let statusText = "ยังไม่เสร็จ";
                let statusClass = 'status-not-passed';
                
                // ✅ ใช้ stable status เป็นหลัก แล้วค่อย fallback ไปใช้ cached หรือ fresh data
                if (item.type === "quiz") {
                  const stableStatus = stableQuizStatuses.get(key);
                  const specialStatus = item.quiz_id ? specialQuizStatuses.get(item.quiz_id) : null;
                  
                  if (stableStatus) {
                    // ใช้สถานะที่เสถียรที่สุดก่อน
                    itemStatus = stableStatus;
                  } else if (specialStatus) {
                    // ✅ ใช้ Special Quiz status
                    itemStatus = specialStatus;
                  } else if (cachedQuizStatus) {
                    // ใช้สถานะจาก cache ถัดไป
                    itemStatus = cachedQuizStatus;
                  } else if (bigLesson) {
                    // ถ้าไม่มีใน cache ค่อยดึงจาก hierarchical data
                    const lesson = bigLesson.lessons?.find((l: any) => l.quiz?.id === item.lesson_id);
                    if (lesson?.quiz?.progress) {
                      const quizProgress = lesson.quiz.progress;
                      if (quizProgress.awaiting_review) {
                        itemStatus = 'awaiting_review';
                      } else if (quizProgress.passed) {
                        itemStatus = 'passed';
                      } else if (quizProgress.completed && !quizProgress.passed) {
                        itemStatus = 'failed';
                      }
                    } else if (bigLesson.quiz?.id === item.lesson_id && bigLesson.quiz?.progress) {
                      const quizProgress = bigLesson.quiz.progress;
                      if (quizProgress.awaiting_review) {
                        itemStatus = 'awaiting_review';
                      } else if (quizProgress.passed) {
                        itemStatus = 'passed';
                      } else if (quizProgress.completed && !quizProgress.passed) {
                        itemStatus = 'failed';
                      }
                    }
                  }
                }
                
                if (isLocked) {
                  statusText = "ล็อค";
                  statusClass = 'status-not-passed';
                } else if (item.type === "quiz") {
                  // สำหรับแบบทดสอบ ตรวจสอบสถานะพิเศษ
                  if (itemStatus === 'awaiting_review') {
                    statusText = "รอตรวจ";
                    statusClass = 'status-awaiting';
                  } else if (itemStatus === 'passed') {
                    statusText = "ผ่าน";
                    statusClass = 'status-passed';
                  } else if (itemStatus === 'failed') {
                    statusText = "ไม่ผ่าน";
                    statusClass = 'status-not-passed';
                  } else if (itemCompleted) {
                    statusText = "เสร็จ";
                    statusClass = 'status-passed';
                  }
                } else {
                  // สำหรับวิดีโอ
                  if (itemCompleted) {
                    statusText = "เสร็จ";
                    statusClass = 'status-passed';
                  }
                }
                
                return (
                  <div
                    key={item.id}
                    className={`lesson-item ${itemCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''} ${isCurrentPage ? 'current-page' : ''} ${itemStatus === 'awaiting_review' ? 'awaiting-review' : ''}`}
                    onClick={() => handleItemClick(section.id, item, sectionIndex, itemIndex)}
                    style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
                  >
                    <div className={`lesson-icon ${item.type} ${isLocked ? 'locked' : ''}`}>
                      {item.type === "video" ? "▶️" : 
                       item.type === "quiz" && itemStatus === 'awaiting_review' ? "⏳" : "❓"}
                    </div>
                    <div className={`lesson-title ${isLocked ? 'locked' : ''}`}>
                      {item.title}
                    </div>
                    <div className={`lesson-status ${statusClass}`}>
                      {statusText}
                    </div>
                  </div>
                );
              })}
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
          
          return renderQuizSection(updatedQuiz);
        })}

      {/* ✅ Task 5: ลบส่วนการชำระเงินทั้งหมด */}

      {/* แสดงข้อความเมื่อไม่มีแบบทดสอบหรือ error */}
        {!loadingQuizzes && subjectQuizzes?.length === 0 && subjectId && !error && (
          <div className="empty-state">
            <i className="fas fa-info-circle me-2"></i>
            ไม่มีแบบทดสอบก่อนเรียนหรือหลังเรียนสำหรับวิชานี้
          </div>
        )}

    </div>
  );
};

export default LessonFaq;
