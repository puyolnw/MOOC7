import { useState, useEffect } from 'react';
import axios from 'axios';
import './LessonQuestions.css';

interface Question {
  question_id: number;
  lesson_id: number;
  user_id: number;
  user_name: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
  answers: Answer[];
}

interface Answer {
  answer_id: number;
  question_id: number;
  user_id: number;
  user_name: string;
  content: string;
  is_instructor: boolean;
  created_at: string;
  updated_at: string;
}

interface LessonQuestionsProps {
  lessonId: number;
}

const LessonQuestions = ({ lessonId }: LessonQuestionsProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [newAnswers, setNewAnswers] = useState<{[key: number]: string}>({});
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  
  const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3301';

  useEffect(() => {
    const fetchLessonQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setError('กรุณาเข้าสู่ระบบเพื่อดูคำถาม-คำตอบ');
          setLoading(false);
          return;
        }
        
        const response = await axios.get(
          `${apiURL}/api/lessons/${lessonId}/questions`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data.success) {
          setQuestions(response.data.questions);
          
          // ขยายคำถามล่าสุด 3 ข้อ
          const latestQuestions = response.data.questions
            .slice(0, 3)
            .map((q: Question) => q.question_id);
          
          setExpandedQuestions(latestQuestions);
        } else {
          setError('ไม่สามารถดึงข้อมูลคำถาม-คำตอบได้');
        }
      } catch (error) {
        console.error('Error fetching lesson questions:', error);
        setError('เกิดข้อผิดพลาดในการดึงข้อมูลคำถาม-คำตอบ');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLessonQuestions();
  }, [apiURL, lessonId]);

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newQuestion.trim()) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('กรุณาเข้าสู่ระบบเพื่อตั้งคำถาม');
        return;
      }
      
      const response = await axios.post(
        `${apiURL}/api/lessons/${lessonId}/questions`,
        {
          title: newQuestion.trim(),
          content: newQuestion.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        // เพิ่มคำถามใหม่ลงในรายการ
        setQuestions([response.data.question, ...questions]);
        setNewQuestion('');
        
        // ขยายคำถามใหม่
        setExpandedQuestions([response.data.question.question_id, ...expandedQuestions]);
      } else {
        setError('ไม่สามารถบันทึกคำถามได้');
      }
    } catch (error) {
      console.error('Error submitting question:', error);
      setError('เกิดข้อผิดพลาดในการบันทึกคำถาม');
    }
  };

  const handleSubmitAnswer = async (questionId: number) => {
    const answerContent = newAnswers[questionId];
    
    if (!answerContent || !answerContent.trim()) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('กรุณาเข้าสู่ระบบเพื่อตอบคำถาม');
        return;
      }
      
      const response = await axios.post(
        `${apiURL}/api/lessons/questions/${questionId}/answers`,
        {
          content: answerContent.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        // อัพเดตคำตอบในคำถาม
        setQuestions(questions.map(q => {
          if (q.question_id === questionId) {
            return {
              ...q,
              answers: [...q.answers, response.data.answer]
            };
          }
          return q;
        }));
        
        // ล้างฟอร์ม
        setNewAnswers({
          ...newAnswers,
          [questionId]: ''
        });
      } else {
        setError('ไม่สามารถบันทึกคำตอบได้');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError('เกิดข้อผิดพลาดในการบันทึกคำตอบ');
    }
  };

  const toggleQuestion = (questionId: number) => {
    if (expandedQuestions.includes(questionId)) {
      setExpandedQuestions(expandedQuestions.filter(id => id !== questionId));
    } else {
      setExpandedQuestions([...expandedQuestions, questionId]);
    }
  };

  // ฟังก์ชันแปลงวันที่เป็นรูปแบบที่อ่านง่าย
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="lesson-questions-container">
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-2">กำลังโหลดคำถาม-คำตอบ...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      ) : (
        <>
          <h4 className="mb-3">คำถาม-คำตอบ</h4>
          
          {/* ฟอร์มตั้งคำถามใหม่ */}
          <div className="question-form mb-4">
            <form onSubmit={handleSubmitQuestion}>
              <div className="mb-3">
                <label htmlFor="newQuestion" className="form-label">ตั้งคำถามใหม่</label>
                <textarea
                  id="newQuestion"
                  className="form-control"
                  rows={3}
                  placeholder="พิมพ์คำถามของคุณที่นี่..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-question-circle me-2"></i>
                ส่งคำถาม
              </button>
            </form>
          </div>
          
          {/* รายการคำถาม */}
          {questions.length === 0 ? (
            <div className="alert alert-info" role="alert">
              <i className="fas fa-info-circle me-2"></i>
              ยังไม่มีคำถามสำหรับบทเรียนนี้ คุณสามารถเป็นคนแรกที่ตั้งคำถามได้
            </div>
          ) : (
            <div className="question-list">
              {questions.map((question) => (
                <div key={question.question_id} className="question-item">
                  <div 
                    className="question-header"
                    onClick={() => toggleQuestion(question.question_id)}
                  >
                    <div className="question-title">
                      <h5>
                        <i className="fas fa-question-circle me-2 text-primary"></i>
                        {question.title}
                      </h5>
                      <div className="question-meta">
                        <span className="question-author">
                          <i className="fas fa-user me-1"></i>
                          {question.user_name}
                        </span>
                        <span className="question-date">
                          <i className="fas fa-calendar-alt me-1"></i>
                          {formatDate(question.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="question-toggle">
                      <i className={`fas fa-chevron-${expandedQuestions.includes(question.question_id) ? 'up' : 'down'}`}></i>
                    </div>
                  </div>
                  
                  {expandedQuestions.includes(question.question_id) && (
                    <div className="question-content">
                      {/* เนื้อหาคำถาม */}
                      <div className="question-body">
                        <p>{question.content}</p>
                      </div>
                      
                      {/* รายการคำตอบ */}
                      {question.answers.length > 0 && (
                        <div className="answer-list">
                          <h6 className="answer-list-title">
                            <i className="fas fa-comments me-2"></i>
                            คำตอบ ({question.answers.length})
                          </h6>
                          {question.answers.map((answer) => (
                            <div 
                              key={answer.answer_id} 
                              className={`answer-item ${answer.is_instructor ? 'instructor-answer' : ''}`}
                            >
                              <div className="answer-header">
                                <div className="answer-author">
                                  <i className={`fas fa-${answer.is_instructor ? 'chalkboard-teacher' : 'user'} me-1`}></i>
                                  {answer.user_name}
                                  {answer.is_instructor && (
                                    <span className="badge bg-success ms-2">ผู้สอน</span>
                                  )}
                                </div>
                                <div className="answer-date">
                                  <i className="fas fa-calendar-alt me-1"></i>
                                  {formatDate(answer.created_at)}
                                </div>
                              </div>
                              <div className="answer-body">
                                <p>{answer.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* ฟอร์มตอบคำถาม */}
                      <div className="answer-form">
                        <div className="mb-3">
                          <label htmlFor={`answer-${question.question_id}`} className="form-label">ตอบคำถามนี้</label>
                          <textarea
                            id={`answer-${question.question_id}`}
                            className="form-control"
                            rows={2}
                            placeholder="พิมพ์คำตอบของคุณที่นี่..."
                            value={newAnswers[question.question_id] || ''}
                            onChange={(e) => setNewAnswers({
                              ...newAnswers,
                              [question.question_id]: e.target.value
                            })}
                          ></textarea>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleSubmitAnswer(question.question_id)}
                          disabled={!newAnswers[question.question_id]?.trim()}
                        >
                          <i className="fas fa-paper-plane me-1"></i>
                          ส่งคำตอบ
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LessonQuestions;
