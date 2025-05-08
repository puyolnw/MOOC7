import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// ประกาศ interface สำหรับข้อมูลที่จะใช้
interface PendingReview {
  attempt_id: number;
  quiz_id: number;
  quiz_title: string;
  student_name: string;
  submitted_at: string;
}

interface Answer {
  question_id: number;
  text_answer: string;
  file_name?: string;
  file_url?: string;
  uploaded_by?: string;
  upload_time?: string;
}

interface Question {
  question_id: number;
  title: string;
  score: number;
}

interface InstructorGradingProps {
  isPopup: boolean;
  selectedAttemptId?: number | null;
  onClose?: () => void;
  onOpenGrading?: (attemptId: number) => void;
}

const InstructorGrading: React.FC<InstructorGradingProps> = ({ 
  isPopup, 
  selectedAttemptId, 
  onClose, 
  onOpenGrading 
}) => {
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attemptAnswers, setAttemptAnswers] = useState<Answer[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [scores, setScores] = useState<{[key: number]: number}>({});
  const [isCorrect, setIsCorrect] = useState<{[key: number]: boolean}>({});
  const [submitting, setSubmitting] = useState(false);
  
  const apiURL = import.meta.env.VITE_API_URL;

  // โหลดรายการงานที่รอตรวจ
  useEffect(() => {
    if (!isPopup) {
      const fetchPendingReviews = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem("token");
          
          if (!token) {
            setError("กรุณาเข้าสู่ระบบ");
            setLoading(false);
            return;
          }
          
          const response = await axios.get(
            `${apiURL}/api/special-quiz/pending-reviews`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          if (response.data.success) {
            setPendingReviews(response.data.pendingReviews);
          } else {
            setError("ไม่สามารถโหลดข้อมูลได้");
          }
        } catch (error) {
          console.error("Error fetching pending reviews:", error);
          setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        } finally {
          setLoading(false);
        }
      };
      
      fetchPendingReviews();
    }
  }, [apiURL, isPopup]);

  // โหลดข้อมูลคำตอบเมื่อเปิด popup
  useEffect(() => {
    if (isPopup && selectedAttemptId) {
      const loadAttemptData = async () => {
        try {
          setLoading(true);
          
          const token = localStorage.getItem("token");
          if (!token) {
            toast.error("กรุณาเข้าสู่ระบบ");
            return;
          }
          
          // ดึงข้อมูลคำตอบ
          const response = await axios.get(
            `${apiURL}/api/special-quiz/attempt/${selectedAttemptId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          if (response.data.success) {
            setAttemptAnswers(response.data.attempt.answers);
            
            // ดึงข้อมูลคำถาม
            const quizId = response.data.attempt.quiz_id;
            if (quizId) {
              const quizResponse = await axios.get(
                `${apiURL}/api/courses/quizzes/${quizId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              );
              
              if (quizResponse.data.success) {
                setQuestions(quizResponse.data.quiz.questions);
                
                // เริ่มต้นคะแนนเป็น 0 สำหรับทุกข้อ
                const initialScores: {[key: number]: number} = {};
                const initialIsCorrect: {[key: number]: boolean} = {};
                
                response.data.attempt.answers.forEach((answer: Answer) => {
                  initialScores[answer.question_id] = 0;
                  initialIsCorrect[answer.question_id] = false;
                });
                
                setScores(initialScores);
                setIsCorrect(initialIsCorrect);
              }
            }
          } else {
            toast.error("ไม่สามารถโหลดข้อมูลคำตอบได้");
          }
        } catch (error) {
          console.error("Error loading attempt data:", error);
          toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        } finally {
          setLoading(false);
        }
      };
      
      loadAttemptData();
    }
  }, [apiURL, isPopup, selectedAttemptId]);

  // อัปเดตคะแนน
  const handleScoreChange = (questionId: number, score: number) => {
    setScores(prev => ({
      ...prev,
      [questionId]: score
    }));
  };

  // อัปเดตสถานะถูก/ผิด
  const handleCorrectChange = (questionId: number, correct: boolean) => {
    setIsCorrect(prev => ({
      ...prev,
      [questionId]: correct
    }));
  };

  // ส่งผลการตรวจ
  const handleSubmitGrading = async () => {
    try {
      if (!selectedAttemptId) return;
      
      setSubmitting(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("กรุณาเข้าสู่ระบบ");
        setSubmitting(false);
        return;
      }
      
      // เตรียมข้อมูลสำหรับส่ง API
      const answers = attemptAnswers.map(answer => ({
        question_id: answer.question_id,
        score_earned: scores[answer.question_id] || 0,
        is_correct: isCorrect[answer.question_id] || false
      }));
      
      const response = await axios.post(
        `${apiURL}/api/special-quiz/attempt/${selectedAttemptId}/grade`,
        { answers },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        toast.success("บันทึกผลการตรวจเรียบร้อยแล้ว");
        
        // อัปเดตรายการงานที่รอตรวจ
        setPendingReviews(prev => 
          prev.filter(review => review.attempt_id !== selectedAttemptId)
        );
        
        // ปิด Popup
        if (onClose) {
          onClose();
        }
      } else {
        toast.error("ไม่สามารถบันทึกผลการตรวจได้");
      }
    } catch (error) {
      console.error("Error submitting grades:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึกผลการตรวจ");
    } finally {
      setSubmitting(false);
    }
  };

  // หาคำถามจาก ID
  const findQuestion = (questionId: number) => {
    return questions.find(q => q.question_id === questionId);
  };

  // แปลงวันที่เป็นรูปแบบที่อ่านง่าย
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // แสดงหน้าตรวจงาน (ใน Popup)
  if (isPopup) {
    return (
      <div className="grading-content">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">กำลังโหลด...</span>
            </div>
            <p className="mt-3">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            {attemptAnswers.length === 0 ? (
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                ไม่พบข้อมูลคำตอบ
              </div>
            ) : (
              <div>
                {attemptAnswers.map((answer, index) => {
                  const question = findQuestion(answer.question_id);
                  return (
                    <div key={answer.question_id} className="card mb-4">
                      <div className="card-header bg-light">
                        <h5 className="mb-0">
                          คำถามที่ {index + 1}: {question?.title || 'ไม่พบข้อมูลคำถาม'}
                        </h5>
                        <p className="text-muted mb-0">
                          คะแนนเต็ม: {question?.score || 0} คะแนน
                        </p>
                      </div>
                      <div className="card-body">
                        <div className="mb-4">
                          <h6>คำตอบของนักศึกษา:</h6>
                          <div className="p-3 bg-light rounded">
                            {answer.text_answer || <em>ไม่มีคำตอบ</em>}
                          </div>
                        </div>
                        
                        {/* แสดงไฟล์แนบพร้อมข้อมูลเพิ่มเติม */}
                        {answer.file_name && (
                          <div className="mb-4">
                            <h6>ไฟล์แนบ:</h6>
                            <div className="p-3 bg-light rounded">
                              {answer.file_name && (
                                <p><strong>ชื่อไฟล์:</strong> {answer.file_name}</p>
                              )}
                              {answer.uploaded_by && (
                                <p><strong>อัปโหลดโดย:</strong> {answer.uploaded_by}</p>
                              )}
                              {answer.upload_time && (
                                <p><strong>เวลา:</strong> {formatDate(answer.upload_time)}</p>
                              )}
                              {answer.file_url && (
                                <a 
                                  href={`${apiURL}${answer.file_url}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="d-flex align-items-center text-primary"
                                >
                                  <i className="fas fa-file me-2"></i>
                                  เปิดไฟล์
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">ให้คะแนน:</label>
                            <input
                              type="number"
                              className="form-control"
                              min="0"
                              max={question?.score || 0}
                              value={scores[answer.question_id] || 0}
                              onChange={(e) => handleScoreChange(
                                answer.question_id, 
                                Math.min(parseInt(e.target.value) || 0, question?.score || 0)
                              )}
                            />
                            <small className="text-muted">
                              คะแนนเต็ม: {question?.score || 0} คะแนน
                            </small>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">สถานะ:</label>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`correct-${answer.question_id}`}
                                checked={isCorrect[answer.question_id] || false}
                                onChange={(e) => handleCorrectChange(
                                  answer.question_id, 
                                  e.target.checked
                                )}
                              />
                              <label 
                                className="form-check-label" 
                                htmlFor={`correct-${answer.question_id}`}
                              >
                                ตอบถูก
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
  
                <div className="d-flex justify-content-end mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    onClick={onClose}
                    disabled={submitting}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSubmitGrading}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span 
                          className="spinner-border spinner-border-sm me-2" 
                          role="status" 
                          aria-hidden="true"
                        ></span>
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        บันทึกผลการตรวจ
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // แสดงรายการงานที่รอตรวจ (หน้าหลัก)
  return (
    <>
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-3">กำลังโหลดข้อมูล...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
        </div>
      ) : pendingReviews.length === 0 ? (
        <div className="alert alert-info" role="alert">
          <i className="fas fa-info-circle me-2"></i>
          ไม่มีงานที่รอตรวจในขณะนี้
        </div>
      ) : (
        <div className="dashboard__review-table">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>ชื่อแบบทดสอบ</th>
                <th>ชื่อนักศึกษา</th>
                <th>วันที่ส่ง</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {pendingReviews.map((review, index) => (
                <tr key={review.attempt_id}>
                  <td>{index + 1}</td>
                  <td>{review.quiz_title}</td>
                  <td>{review.student_name}</td>
                  <td>{formatDate(review.submitted_at)}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onOpenGrading && onOpenGrading(review.attempt_id)}
                    >
                      <i className="fas fa-check-circle me-1"></i>
                      ตรวจงาน
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default InstructorGrading;