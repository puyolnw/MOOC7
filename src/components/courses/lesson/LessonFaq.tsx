import { useState, useEffect } from "react";
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
  type: "pre_test" | "post_test";
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
  subjectQuizzes: externalSubjectQuizzes
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



  // ฟังก์ชันเช็คว่าบทก่อนหน้าเสร็จแล้วหรือยัง
  const isPreviousLessonCompleted = (sectionIndex: number, itemIndex: number) => {
    const allLessons = [];
    for (let i = 0; i < lessonData.length; i++) {
      for (let j = 0; j < lessonData[i].items.length; j++) {
        allLessons.push({
          sectionIndex: i,
          itemIndex: j,
          item: lessonData[i].items[j]
        });
      }
    }

    const currentIndex = allLessons.findIndex(lesson => 
      lesson.sectionIndex === sectionIndex && lesson.itemIndex === itemIndex
    );

    if (currentIndex <= 0) {
      return true;
    }

    const previousLesson = allLessons[currentIndex - 1];
    return previousLesson.item.completed;
  };

  // ฟังก์ชันเช็คว่าควรล็อคบทเรียนหรือไม่
  const shouldLockLesson = (sectionIndex: number, itemIndex: number) => {
    const section = lessonData[sectionIndex];
    const currentItem = section?.items[itemIndex];
    if (currentItem && currentItem.type === "quiz") {
      const isEndOfChapterQuiz = currentItem.title.includes("แบบทดสอบท้ายบท");
      if (isEndOfChapterQuiz) {
        // ถ้า section ไม่มี video เลย ให้ไม่ล็อค
        const hasVideo = section.items.some(item => item.type === "video");
        if (!hasVideo) return false;
        // ถ้ามี video ให้เช็คว่าผ่านหรือยัง
        return !isPreviousLessonCompleted(sectionIndex, itemIndex);
      }
    }
    return false;
  };



  // ใช้ข้อมูลแบบทดสอบจาก parent component
  useEffect(() => {
    if (externalSubjectQuizzes) {
      setSubjectQuizzes(externalSubjectQuizzes);
      setLoadingQuizzes(false);
      setError(null);
      
      // ตรวจสอบว่ามีแบบทดสอบก่อนเรียนหรือไม่ และตั้งค่า activeAccordion
      const preTest = externalSubjectQuizzes.find(q => q.type === "pre_test");
      if (preTest) {
        setActiveAccordion(-1000);
      }
    } else {
      setSubjectQuizzes([]);
    }
  }, [externalSubjectQuizzes]);

  useEffect(() => {
    setSubjectQuizzes(prev => prev.map(quiz => ({
      ...quiz,
      locked: false // ปลดล็อคทุกแบบทดสอบ pre/post
    })));
    
    // ✅ Task 5: ลบการเรียก fetchBankAccounts
    // fetchBankAccounts();
  }, [lessonData]);

  const handleItemClick = (sectionId: number, item: LessonItem, sectionIndex: number, itemIndex: number) => {
    const isLocked = shouldLockLesson(sectionIndex, itemIndex);
    
    if (isLocked) {
      // แสดงข้อความเฉพาะสำหรับแบบทดสอบท้ายบท
      alert("กรุณาเรียนบทก่อนหน้าให้เสร็จก่อนทำแบบทดสอบท้ายบท");
      return;
    }
    
    onSelectLesson(sectionId, item.id, item.title, item.type);
  };

  // แปลง SubjectQuiz เป็น LessonItem แล้วเรียก onSelectLesson
  const handleSubjectQuizClick = (quiz: SubjectQuiz) => {
    // ปลดล็อคทุกแบบทดสอบ pre/post
    if (quiz.locked) {
      alert("แบบทดสอบนี้ยังไม่พร้อมใช้งาน");
      return;
    }

    // ส่งข้อมูลแบบทดสอบพิเศษไปยัง parent component
    // ใช้ค่าลบเพื่อแยกจากบทเรียนปกติ
    const specialSectionId = quiz.type === 'pre_test' ? -1000 : -2000;
    const specialItemId = quiz.quiz_id;
    
    onSelectLesson(specialSectionId, specialItemId, quiz.title, 'quiz');
  };

  const toggleAccordion = (id: number) => {
    setActiveAccordion(activeAccordion === id ? null : id);
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
    const statusText = quiz.status === 'passed' ? 'ผ่าน' : 
                      quiz.status === 'awaiting_review' ? 'รอตรวจ' : 
                      quiz.status === 'failed' ? 'ไม่ผ่าน' : 'ยังไม่ทำ';
    
    return (
      <div key={`${quiz.type}-${quiz.quiz_id}`} className="accordion-item">
        <h2 className="accordion-header">
          <button 
            className={`accordion-button ${activeAccordion === sectionId ? '' : 'collapsed'}`}
            type="button"
            onClick={() => toggleAccordion(sectionId)}
          >
            <span className="section-title">
              {quiz.type === 'pre_test' ? '🎯 ' : '🏁 '}{quiz.title}
            </span>
            <span className={`section-status ${
              quiz.status === 'passed' ? "status-passed" : 
              quiz.status === 'awaiting_review' ? "status-awaiting" : "status-not-passed"
            }`}>
              {statusText}
            </span>
          </button>
        </h2>
        <div 
          id={`collapse${sectionId}`} 
          className={`accordion-collapse collapse ${activeAccordion === sectionId ? 'show' : ''}`}
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
                  <span className={`item-status ${
                    quiz.status === 'passed' ? "status-passed" : 
                    quiz.status === 'awaiting_review' ? "status-awaiting" : "status-not-passed"
                  }`}>
                    {statusText}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // เปิดแอคคอร์เดียนแรกที่ยังไม่เสร็จ หรือแบบทดสอบก่อนเรียน
  useEffect(() => {
    // ตรวจสอบว่ามีแบบทดสอบก่อนเรียนหรือไม่
    const preTest = externalSubjectQuizzes?.find(q => q.type === "pre_test");
    
    if (preTest) {
      // ถ้ามีแบบทดสอบก่อนเรียน ให้เปิดแอคคอร์เดียนของแบบทดสอบก่อนเรียน
      setActiveAccordion(-1000);
    } else if (lessonData.length > 0) {
      // ถ้าไม่มีแบบทดสอบก่อนเรียน ให้เปิดแอคคอร์เดียนแรกที่ยังไม่เสร็จ
      for (const section of lessonData) {
        for (const item of section.items) {
          if (!item.completed) {
            setActiveAccordion(section.id);
            return;
          }
        }
      }
      // ถ้าทุกบทเรียนเสร็จแล้ว ให้เปิดแอคคอร์เดียนแรก
      setActiveAccordion(lessonData[0].id);
    }
  }, [lessonData, externalSubjectQuizzes]);

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
        .filter(quiz => quiz.type === "pre_test")
        .map((quiz) => renderQuizSection(quiz, -1000))}
      {/* บทเรียนปกติ */}
      {lessonData.map((section, sectionIndex) => (
        <div key={section.id} className="accordion-item">
          <h2 className="accordion-header">
            <button 
              className={`accordion-button ${activeAccordion === section.id ? '' : 'collapsed'}`}
              type="button"
              onClick={() => toggleAccordion(section.id)}
            >
              <span className="section-title">{section.title}</span>
              <span className={`section-status ${
                section.count === "ผ่าน" ? "status-passed" : 
                section.count === "รอตรวจ" ? "status-awaiting" : "status-not-passed"
              }`}>
                {section.count}
              </span>
            </button>
          </h2>
          <div 
            id={`collapseOne${section.id}`} 
            className={`accordion-collapse collapse ${activeAccordion === section.id ? 'show' : ''}`}
          >
            <div className="accordion-body">
              <ul className="list-wrap">
                {section.items.map((item, itemIndex) => {
                  const isLocked = shouldLockLesson(sectionIndex, itemIndex);
                  return (
                    <li
                      key={item.id}
                      className={`course-item ${item.completed ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                      onClick={() => handleItemClick(section.id, item, sectionIndex, itemIndex)}
                      style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
                    >
                      <div className="course-item-link">
                        <span className="item-name">
                          {isLocked && <i className="fas fa-lock lock-icon me-2"></i>}
                          {item.title}
                        </span>
                        <span className={`item-status ${
                          item.status === 'passed' ? "status-passed" : 
                          item.status === 'awaiting_review' ? "status-awaiting" : "status-not-passed"
                        }`}>
                          {item.status === 'passed' ? 'ผ่าน' : 
                           item.status === 'awaiting_review' ? 'รอตรวจ' : 'ไม่ผ่าน'}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      ))}

      {/* แบบทดสอบหลังเรียน */}
      {subjectQuizzes
        .filter(quiz => quiz.type === "post_test")
        .map((quiz) => renderQuizSection(quiz, -2000))}

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
