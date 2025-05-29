import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './InstructorGrading.css';

interface Question {
  question_id: number;
  title: string;
  type: string;
  score: number;
}

interface Attachment {
  attachment_id: number;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
}

interface Answer {
  answer_id: number;
  question_id: number;
  text_answer: string;
  is_correct: boolean;
  score_earned: number;
  question_title: string;
  question_type: string;
  question_max_score: number;
  attachments: Attachment[];
}

interface Attempt {
  attempt_id: number;
  user_id: number;
  quiz_id: number;
  status: string;
  score: number;
  max_score: number;
  passed: boolean;
  created_at: string;
  end_time: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  answers: Answer[];
}

interface InstructorGradingProps {
  isPopup?: boolean;
  selectedAttemptId?: number | null;
  onClose?: () => void;
  onGraded?: (attemptId: number, passed: boolean) => void;
  onOpenGrading?: (attemptId: number) => void; // Add this line
}

const InstructorGrading: React.FC<InstructorGradingProps> = ({ 
  isPopup = false, 
  selectedAttemptId,
  onClose,
  onGraded
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptAnswers, setAttemptAnswers] = useState<Answer[]>([]);
  const [scores, setScores] = useState<{[key: number]: number}>({});
  const [isCorrect, setIsCorrect] = useState<{[key: number]: boolean}>({});
  const [feedback, setFeedback] = useState<{[key: number]: string}>({});
  const [studentInfo, setStudentInfo] = useState<{
    name: string;
    email: string;
    attemptDate: string;
  } | null>(null);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [totalMaxScore, setTotalMaxScore] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [quizTitle, setQuizTitle] = useState<string>("");


  const apiURL = import.meta.env.VITE_API_URL;

  // ฟังก์ชันหาคำถามจาก question_id
  const findQuestion = (questionId: number): Question | undefined => {
    return questions.find(q => q.question_id === questionId);
  };

  // โหลดข้อมูลการทำแบบทดสอบ
  useEffect(() => {
    if (isPopup && selectedAttemptId) {
      const loadAttemptData = async () => {
        try {
          setLoading(true);
          setError(null);
          
          console.log("Loading attempt data for ID:", selectedAttemptId);
          
          const token = localStorage.getItem("token");
          if (!token) {
            toast.error("กรุณาเข้าสู่ระบบ");
            setLoading(false);
            return;
          }
          
          // ดึงข้อมูลการทำแบบทดสอบ
          console.log("Fetching attempt data from:", `${apiURL}/api/special-quiz/attempt/${selectedAttemptId}`);
          
          const response = await axios.get(
            `${apiURL}/api/special-quiz/attempts/all`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          console.log("Attempt response:", response.data);
          
          if (response.data.success) {
            const attempt: Attempt = response.data.attempt;
            
            if (!attempt || !attempt.answers) {
              console.error("Invalid attempt data structure:", attempt);
              setError("ข้อมูลการทำแบบทดสอบไม่ถูกต้อง");
              setLoading(false);
              return;
            }
            
            setAttemptAnswers(attempt.answers);
            
            // ตั้งค่าข้อมูลนักเรียน
            setStudentInfo({
              name: `${attempt.first_name} ${attempt.last_name}`,
              email: attempt.email,
              attemptDate: new Date(attempt.end_time).toLocaleString()
            });
            
            // ดึงข้อมูลแบบทดสอบ
            console.log("Fetching quiz data for ID:", attempt.quiz_id);
            
            const quizResponse = await axios.get(
              `${apiURL}/api/special-quiz/quiz/${attempt.quiz_id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );
            
            console.log("Quiz response:", quizResponse.data);
            
            if (quizResponse.data.success) {
              setQuestions(quizResponse.data.quiz.questions);
              setQuizTitle(quizResponse.data.quiz.title);
              
              // เริ่มต้นคะแนนและสถานะความถูกต้อง
              const initialScores: {[key: number]: number} = {};
              const initialIsCorrect: {[key: number]: boolean} = {};
              const initialFeedback: {[key: number]: string} = {};
              
              attempt.answers.forEach(answer => {
                // ถ้ามีคะแนนอยู่แล้ว ให้ใช้คะแนนนั้น
                initialScores[answer.question_id] = answer.score_earned || 0;
                initialIsCorrect[answer.question_id] = answer.is_correct || false;
                initialFeedback[answer.question_id] = '';
              });
              
              setScores(initialScores);
              setIsCorrect(initialIsCorrect);
              setFeedback(initialFeedback);
              
              // คำนวณคะแนนรวมและคะแนนเต็ม
              let total = 0;
              let maxTotal = 0;
              
              quizResponse.data.quiz.questions.forEach((q: Question) => {
                maxTotal += q.score;
                if (initialScores[q.question_id] !== undefined) {
                  total += initialScores[q.question_id];
                }
              });
              
              setTotalScore(total);
              setTotalMaxScore(maxTotal);
            } else {
              console.error("Failed to fetch quiz data:", quizResponse.data);
              setError("ไม่สามารถโหลดข้อมูลแบบทดสอบได้");
            }
          } else {
            console.error("Failed to fetch attempt data:", response.data);
            setError("ไม่สามารถโหลดข้อมูลการทำแบบทดสอบได้");
          }
        } catch (error) {
          console.error("Error loading attempt data:", error);
          setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        } finally {
          setLoading(false);
        }
      };
      
      loadAttemptData();
      
      // เพิ่ม timeout เพื่อป้องกันการรอไม่สิ้นสุด
      const timeoutId = setTimeout(() => {
        if (loading) {
          setLoading(false);
          setError("การโหลดข้อมูลใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง");
        }
      }, 15000); // 15 วินาที
      
      return () => clearTimeout(timeoutId);
    }
}, [apiURL, isPopup, selectedAttemptId, loading]);

  // ฟังก์ชันจัดการการเปลี่ยนแปลงคะแนน
  const handleScoreChange = (questionId: number, score: number) => {
    const question = findQuestion(questionId);
    if (!question) return;
    
    // ตรวจสอบว่าคะแนนไม่เกินคะแนนเต็ม
    const maxScore = question.score;
    const validScore = Math.min(Math.max(0, score), maxScore);
    
    // อัปเดตคะแนน
    setScores(prev => ({
      ...prev,
      [questionId]: validScore
    }));
    
    // อัปเดตสถานะความถูกต้อง (ถ้าได้คะแนนเต็ม = ถูก, ไม่ได้คะแนนเต็ม = ผิด)
    setIsCorrect(prev => ({
      ...prev,
      [questionId]: validScore === maxScore
    }));
    
    // คำนวณคะแนนรวมใหม่
    let newTotalScore = 0;
    for (const qId in scores) {
      if (parseInt(qId) !== questionId) {
        newTotalScore += scores[parseInt(qId)] || 0;
      }
    }
    newTotalScore += validScore;
    setTotalScore(newTotalScore);
  };

  // ฟังก์ชันจัดการการเปลี่ยนแปลงความคิดเห็น
  const handleFeedbackChange = (questionId: number, text: string) => {
    setFeedback(prev => ({
      ...prev,
      [questionId]: text
    }));
  };

  // ฟังก์ชันบันทึกการให้คะแนน
  const handleSaveGrading = async () => {
    try {
      setIsSaving(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("กรุณาเข้าสู่ระบบ");
        return;
      }
      
      // เตรียมข้อมูลคำตอบที่จะส่งไป
      const answersToSubmit = attemptAnswers.map(answer => ({
        question_id: answer.question_id,
        score_earned: scores[answer.question_id] || 0,
        is_correct: isCorrect[answer.question_id] || false,
        feedback: feedback[answer.question_id] || ''
      }));
      
      console.log("Submitting grading data:", answersToSubmit);
      
      // ส่งข้อมูลไปยัง API
      const response = await axios.post(
        `${apiURL}/api/special-quiz/attempt/${selectedAttemptId}/grade`,
        { answers: answersToSubmit },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log("Grading response:", response.data);
      
      if (response.data.success) {
        toast.success("บันทึกการให้คะแนนเรียบร้อยแล้ว");
        
        // เรียกใช้ callback เมื่อให้คะแนนเสร็จ
       if (onGraded && selectedAttemptId !== null && selectedAttemptId !== undefined) {
  const passed = response.data.attempt.passed;
  onGraded(selectedAttemptId, passed);
}
        
        // ปิดหน้าต่าง popup (ถ้ามี)
        if (onClose) {
          onClose();
        }
      } else {
        toast.error(response.data.message || "ไม่สามารถบันทึกการให้คะแนนได้");
      }
    } catch (error) {
      console.error("Error saving grading:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึกการให้คะแนน");
    } finally {
      setIsSaving(false);
    }
  };

  // แสดงหน้าโหลด
  if (loading) {
    return (
      <div className={`grading-container ${isPopup ? 'popup-mode' : ''}`}>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-3">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // แสดงหน้าข้อผิดพลาด
  if (error) {
    return (
      <div className={`grading-container ${isPopup ? 'popup-mode' : ''}`}>
        <div className="text-center py-5">
          <div className="alert alert-danger" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
          {isPopup && (
            <button className="btn btn-outline-secondary mt-3" onClick={onClose}>
              ปิด
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`grading-container ${isPopup ? 'popup-mode' : ''}`}>
      {isPopup && (
        <div className="popup-header">
          <h4>ตรวจแบบทดสอบ: {quizTitle}</h4>
          <button className="btn-close" onClick={onClose}></button>
        </div>
      )}
      
      <div className="grading-content">
        {studentInfo && (
          <div className="student-info card mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h5 className="card-title">ข้อมูลผู้เรียน</h5>
                  <p className="mb-1"><strong>ชื่อ:</strong> {studentInfo.name}</p>
                  <p className="mb-1"><strong>อีเมล:</strong> {studentInfo.email}</p>
                </div>
                <div className="col-md-6">
                  <h5 className="card-title">ข้อมูลการทำแบบทดสอบ</h5>
                  <p className="mb-1"><strong>วันที่ส่ง:</strong> {studentInfo.attemptDate}</p>
                  <p className="mb-1">
                    <strong>สถานะ:</strong> 
                    <span className="badge bg-warning ms-2">รอการตรวจ</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="score-summary card mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">คะแนนรวม: {totalScore} / {totalMaxScore}</h5>
              <div className="progress w-50">
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ width: `${totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0}%` }}
                  aria-valuenow={totalScore} 
                  aria-valuemin={0} 
                  aria-valuemax={totalMaxScore}
                ></div>
              </div>
            </div>
            <p className="text-muted mt-2 mb-0">
              เกณฑ์ผ่าน: {Math.ceil(totalMaxScore * 0.65)} คะแนน ({totalMaxScore > 0 ? Math.ceil((totalScore / totalMaxScore) * 100) : 0}%)
            </p>
          </div>
        </div>
        
        <div className="questions-container">
          {attemptAnswers.map((answer, index) => {
            const question = findQuestion(answer.question_id);
            if (!question) return null;
            
            return (
              <div key={answer.question_id} className="question-item card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">คำถามที่ {index + 1}</h5>
                  <span className="badge bg-primary">คะแนนเต็ม: {question.score} คะแนน</span>
                </div>
                <div className="card-body">
                  <div className="question-text mb-3">
                    <h6>คำถาม:</h6>
                    <p>{question.title}</p>
                  </div>
                  
                  <div className="answer-text mb-3">
                    <h6>คำตอบของผู้เรียน:</h6>
                    <div className="p-3 bg-light rounded">
                      {answer.text_answer ? (
                        <p className="mb-0">{answer.text_answer}</p>
                      ) : (
                        <p className="text-muted mb-0">ไม่มีคำตอบข้อความ</p>
                      )}
                    </div>
                  </div>
                  
                  {answer.attachments && answer.attachments.length > 0 && (
                    <div className="attachments mb-3">
                      <h6>ไฟล์แนบ:</h6>
                      <ul className="list-group">
                        {answer.attachments.map(attachment => (
                          <li key={attachment.attachment_id} className="list-group-item d-flex justify-content-between align-items-center">
                            <span>
                              <i className="fas fa-file me-2"></i>
                              {attachment.file_name}
                            </span>
                            <div>
                              <a 
                                href={`${apiURL}${attachment.file_url}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn btn-sm btn-outline-primary me-2"
                              >
                                <i className="fas fa-eye me-1"></i>
                                ดู
                              </a>
                              <a 
                                href={`${apiURL}${attachment.file_url}`} 
                                download 
                                className="btn btn-sm btn-outline-success"
                              >
                                <i className="fas fa-download me-1"></i>
                                ดาวน์โหลด
                              </a>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="grading-section">
                    <h6>การให้คะแนน:</h6>
                    <div className="row align-items-center mb-3">
                      <div className="col-md-6">
                        <div className="input-group">
                          <span className="input-group-text">คะแนน</span>
                          <input 
                            type="number" 
                            className="form-control" 
                            min="0" 
                            max={question.score} 
                            value={scores[answer.question_id] || 0}
                            onChange={(e) => handleScoreChange(answer.question_id, parseInt(e.target.value))}
                          />
                          <span className="input-group-text">/ {question.score}</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id={`correct-${answer.question_id}`}
                            checked={isCorrect[answer.question_id] || false}
                            onChange={(e) => {
                              setIsCorrect(prev => ({
                                ...prev,
                                [answer.question_id]: e.target.checked
                              }));
                              if (e.target.checked) {
                                handleScoreChange(answer.question_id, question.score);
                              } else {
                                handleScoreChange(answer.question_id, 0);
                              }
                            }}
                          />
                          <label className="form-check-label" htmlFor={`correct-${answer.question_id}`}>
                            ตอบถูกต้อง (ให้คะแนนเต็ม)
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="feedback-section">
                      <label htmlFor={`feedback-${answer.question_id}`} className="form-label">ความคิดเห็น/ข้อเสนอแนะ:</label>
                      <textarea 
                        id={`feedback-${answer.question_id}`}
                        className="form-control" 
                        rows={3}
                        value={feedback[answer.question_id] || ''}
                        onChange={(e) => handleFeedbackChange(answer.question_id, e.target.value)}
                        placeholder="ให้ข้อเสนอแนะเพิ่มเติม (ถ้ามี)"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="grading-actions d-flex justify-content-between">
          {isPopup && (
            <button 
              className="btn btn-outline-secondary" 
              onClick={onClose}
              disabled={isSaving}
            >
              ยกเลิก
            </button>
          )}
          <button 
            className="btn btn-primary" 
            onClick={handleSaveGrading}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                กำลังบันทึก...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                บันทึกการให้คะแนน
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructorGrading;

