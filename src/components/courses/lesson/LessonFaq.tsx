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
  quiz_id?: number; // เพิ่มนี้สำหรับ subject quiz
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

  // ฟังก์ชันโหลดข้อมูลแบบทดสอบ pre/post test
  const fetchSubjectQuizzes = async () => {
    if (!subjectId) {
      console.log("No subjectId provided");
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
            locked: preTest.locked || false,
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
            locked: postTest.locked || false,
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

  const handleItemClick = (sectionId: number, item: LessonItem) => {
    if (!item.lock) {
      onSelectLesson(sectionId, item.id, item.title, item.type);
    }
  };

  // แปลง SubjectQuiz เป็น LessonItem แล้วเรียก onSelectLesson ธรรมดา
  const handleSubjectQuizClick = (quiz: SubjectQuiz) => {
    if (quiz.locked) {
      alert("แบบทดสอบนี้ยังไม่สามารถทำได้ กรุณาเรียนให้ครบก่อน");
      return;
    }

    // สร้าง fake LessonItem จาก SubjectQuiz
    const fakeItem: LessonItem = {
      id: quiz.type === 'pre_test' ? -1 : -2, // ใช้ negative id เพื่อแยกจาก lesson จริง
      title: quiz.title,
      lock: quiz.locked,
      completed: quiz.completed,
      type: 'quiz',
      duration: quiz.completed ? '100%' : '0%',
      status: quiz.status as any,
      quiz_id: quiz.quiz_id
    };

    // เรียก onSelectLesson เหมือนปกติ
    onSelectLesson(quiz.quiz_id, fakeItem.id, quiz.title, 'quiz');
  };

  const toggleAccordion = (id: number) => {
    setActiveAccordion(activeAccordion === id ? null : id);
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

      {/* แบบทดสอบก่อนเรียน - ทำให้เหมือนบทเรียนธรรมดา */}
      {subjectQuizzes
        .filter(quiz => quiz.type === "pre_test")
        .map((quiz) => (
          <div key={`pre-test-${quiz.quiz_id}`} className="accordion-item">
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
                      🎯 {quiz.title}
                    </span>
                    <span className={`item-status ${
                      quiz.status === 'passed' ? "status-passed" : 
                      quiz.status === 'awaiting_review' ? "status-awaiting" : "status-not-passed"
                    }`}>
                      {quiz.status === 'passed' ? 'ผ่าน' : 
                       quiz.status === 'awaiting_review' ? 'รอตรวจ' : 
                       quiz.status === 'failed' ? 'ไม่ผ่าน' : 'ยังไม่ทำ'}
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        ))}

      {/* บทเรียนปกติ */}
      {lessonData.map((section) => (
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
                {section.items.map((item) => (
                  <li
                    key={item.id}
                    className={`course-item ${item.completed ? 'completed' : ''} ${item.lock ? 'locked' : ''}`}
                    onClick={() => handleItemClick(section.id, item)}
                    style={{ cursor: item.lock ? 'not-allowed' : 'pointer' }}
                  >
                    <div className="course-item-link">
                      <span className="item-name">
                        {item.lock && <i className="fas fa-lock lock-icon me-2"></i>}
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
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}

      {/* แบบทดสอบหลังเรียน - ทำให้เหมือนบทเรียนธรรมดา */}
      {subjectQuizzes
        .filter(quiz => quiz.type === "post_test")
        .map((quiz) => (
          <div key={`post-test-${quiz.quiz_id}`} className="accordion-item">
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
                      🏁 {quiz.title}
                    </span>
                    <span className={`item-status ${
                      quiz.status === 'passed' ? "status-passed" : 
                      quiz.status === 'awaiting_review' ? "status-awaiting" : "status-not-passed"
                    }`}>
                      {quiz.status === 'passed' ? 'ผ่าน' : 
                       quiz.status === 'awaiting_review' ? 'รอตรวจ' : 
                       quiz.status === 'failed' ? 'ไม่ผ่าน' : 'ยังไม่ทำ'}
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        ))}

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

