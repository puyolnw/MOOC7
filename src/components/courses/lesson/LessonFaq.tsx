import { useState, useEffect } from "react";
import axios from "axios";
import './LessonFaq.css';

const API_URL = import.meta.env.VITE_API_URL;

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
}

const LessonFaq = ({ 
  lessonData, 
  onSelectLesson, 
  subjectId 
}: LessonFaqProps) => {
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const [subjectQuizzes, setSubjectQuizzes] = useState<SubjectQuiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ฟังก์ชันเช็คว่าแบบทดสอบก่อนเรียนผ่านแล้วหรือยัง
  // const isPreTestPassed = () => {
  //   const preTest = subjectQuizzes.find(q => q.type === "pre_test");
  //   return preTest?.passed || false;
  // };

  // // ฟังก์ชันเช็คว่าบทเรียนทั้งหมดเสร็จแล้วหรือยัง
  // const areAllLessonsCompleted = () => {
  //   return lessonData.every(section => 
  //     section.items.every(item => item.completed)
  //   );
  // };

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
    // ปลดล็อคทุกอย่าง ยกเว้นแบบทดสอบท้ายบท
    const currentItem = lessonData[sectionIndex]?.items[itemIndex];
    
    // ถ้าเป็นแบบทดสอบท้ายบท ให้ล็อคไว้
    if (currentItem && currentItem.type === "quiz") {
      // ตรวจสอบว่าเป็นแบบทดสอบท้ายบทหรือไม่ (ไม่ใช่ pre/post test)
      const isEndOfChapterQuiz = currentItem.title.includes("แบบทดสอบท้ายบท");
      if (isEndOfChapterQuiz) {
        // ล็อคแบบทดสอบท้ายบทไว้
        return !isPreviousLessonCompleted(sectionIndex, itemIndex);
      }
    }
    
    // ปลดล็อคทุกอย่างอื่น
    return false;
  };

  // ฟังก์ชันโหลดข้อมูลแบบทดสอบ pre/post test
  const fetchSubjectQuizzes = async () => {
    if (!subjectId) {
      return;
    }
    
    try {
      setLoadingQuizzes(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${API_URL}/api/learn/subject/${subjectId}/quizzes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        const quizzes: SubjectQuiz[] = [];
        
        // แบบทดสอบก่อนเรียน
        if (response.data.pre_test) {
          const preTest = response.data.pre_test;
          quizzes.push({
            quiz_id: preTest.quiz_id,
            title: preTest.title || "แบบทดสอบก่อนเรียน",
            description: preTest.description,
            type: "pre_test",
            locked: false,
            completed: preTest.progress?.completed || false,
            passed: preTest.progress?.passed || false,
            status: preTest.progress?.awaiting_review ? "awaiting_review" :
                    preTest.progress?.passed ? "passed" :
                    preTest.progress?.completed ? "failed" : "not_started",
            score: preTest.progress?.score,
            max_score: preTest.progress?.max_score,
          });
        }

          // แบบทดสอบหลังเรียน
  if (response.data.post_test) {
    const postTest = response.data.post_test;
    quizzes.push({
      quiz_id: postTest.quiz_id,
      title: postTest.title || "แบบทดสอบหลังเรียน",
      description: postTest.description,
      type: "post_test",
      locked: false, // ปลดล็อคแบบทดสอบหลังเรียน
      completed: postTest.progress?.completed || false,
      passed: postTest.progress?.passed || false,
      status: postTest.progress?.awaiting_review ? "awaiting_review" :
              postTest.progress?.passed ? "passed" :
              postTest.progress?.completed ? "failed" : "not_started",
      score: postTest.progress?.score,
      max_score: postTest.progress?.max_score,
    });
  }

        setSubjectQuizzes(quizzes);
      } else {
        setError("ไม่สามารถโหลดข้อมูลแบบทดสอบได้");
      }
    } catch (error: any) {
      console.error("Error fetching subject quizzes:", error);
      setError(error.response?.data?.message || "เกิดข้อผิดพลาดในการโหลดแบบทดสอบ");
    } finally {
      setLoadingQuizzes(false);
    }
  };

  // เรียก API เมื่อ subjectId เปลี่ยน
  useEffect(() => {
    if (subjectId) {
      fetchSubjectQuizzes();
    } else {
      setSubjectQuizzes([]);
    }
  }, [subjectId]);

  // อัพเดทสถานะการล็อคของแบบทดสอบหลังเรียนเมื่อข้อมูลเปลี่ยน
  useEffect(() => {
    setSubjectQuizzes(prev => prev.map(quiz => ({
      ...quiz,
      locked: false // ปลดล็อคทุกแบบทดสอบ pre/post
    })));
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

  // เปิดแอคคอร์เดียนแรกที่ยังไม่เสร็จ
  useEffect(() => {
    for (const section of lessonData) {
      for (const item of section.items) {
        if (!item.completed) {
          setActiveAccordion(section.id);
          return;
        }
      }
    }
  }, [lessonData]);

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
            onClick={fetchSubjectQuizzes}
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

      {/* แสดงข้อความเมื่อไม่มีแบบทดสอบ */}
      {!loadingQuizzes && subjectQuizzes.length === 0 && subjectId && !error && (
        <div className="no-quizzes text-center p-3 text-muted">
          <i className="fas fa-info-circle me-2"></i>
          ไม่มีแบบทดสอบก่อนเรียนหรือหลังเรียนสำหรับวิชานี้
        </div>
      )}
    </div>
  );
};

export default LessonFaq;
