import { useState, useEffect } from "react";
import axios from "axios";
import './d.css';
import DashboardBannerTwo from "../../dashboard-common/DashboardBannerTwo";
import DashboardSidebarTwo from "../../dashboard-common/DashboardSidebarTwo";

// กำหนด interface สำหรับข้อมูลประวัติการทำแบบทดสอบ
interface QuizAttempt {
  quiz_id: number;
  quiz_title: string;
  score: number;
  max_score: number;
  passed: boolean;
  created_at: string;
  questions_count?: number; // อาจไม่มีในข้อมูลจาก API
}

const StudentAttemptsArea = () => {
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ดึง API URL จาก environment variable
  const API_URL = import.meta.env.VITE_API_URL ;

  useEffect(() => {
    const fetchQuizHistory = async () => {
      // ดึง token จาก localStorage
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("กรุณาเข้าสู่ระบบก่อนใช้งาน");
        setLoading(false);
        return;
      }

      try {
        // เรียกใช้ API /history เพื่อดึงประวัติการทำแบบทดสอบ
        const response = await axios.get(`${API_URL}/api/data/history`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          // ดึงข้อมูลประวัติการทำแบบทดสอบจาก response
          const { quizHistory: apiQuizHistory } = response.data;
          
          // แปลงข้อมูลจาก API ให้เข้ากับ interface ที่ต้องการ
          const formattedQuizHistory = apiQuizHistory.map((attempt: any) => ({
            quiz_id: attempt.quiz_id,
            quiz_title: attempt.quiz_title,
            score: attempt.score,
            max_score: attempt.max_score,
            passed: attempt.passed,
            created_at: attempt.created_at,
            questions_count: attempt.questions_count || Math.round(attempt.max_score / 1) // ประมาณจำนวนคำถามจากคะแนนเต็ม (สมมติว่า 1 ข้อ = 1 คะแนน)
          }));
          
          setQuizHistory(formattedQuizHistory);
        } else {
          setError("ไม่สามารถดึงข้อมูลได้");
        }
      } catch (err) {
        console.error("Error fetching quiz history:", err);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizHistory();
  }, [API_URL]);

  // ฟังก์ชันสำหรับแปลงวันที่เป็นรูปแบบที่อ่านง่าย
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ฟังก์ชันสำหรับคำนวณเปอร์เซ็นต์คะแนน
  const calculatePercentage = (score: number, maxScore: number) => {
    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  };

  return (
    <section className="dashboard__area section-pb-120">
      <div className="container">
        <DashboardBannerTwo />
        <div className="dashboard__inner-wrap">
          <div className="row">
            <DashboardSidebarTwo />
            <div className="col-lg-9">
              <div className="dashboard__content-wrap">
                <div className="dashboard__content-title">
                  <h4 className="title">ประวัติการทำแบบทดสอบ</h4>
                </div>
                <div className="row">
                  <div className="col-12">
                    <div className="dashboard__review-table">
                      {loading ? (
                        // แสดง loading state
                        <div className="text-center py-5">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">กำลังโหลด...</span>
                          </div>
                          <p className="mt-3">กำลังโหลดข้อมูลประวัติการทำแบบทดสอบ...</p>
                        </div>
                      ) : error ? (
                        // แสดงข้อความ error
                        <div className="text-center py-5">
                          <div className="alert alert-danger" role="alert">
                            <i className="fas fa-exclamation-circle me-2"></i>
                            {error}
                          </div>
                        </div>
                      ) : quizHistory.length === 0 ? (
                        // แสดงข้อความเมื่อไม่มีประวัติการทำแบบทดสอบ
                        <div className="text-center py-5">
                          <div className="alert alert-info" role="alert">
                            <i className="fas fa-info-circle me-2"></i>
                            คุณยังไม่มีประวัติการทำแบบทดสอบ
                          </div>
                        </div>
                      ) : (
                        // แสดงตารางประวัติการทำแบบทดสอบ
                        <table className="table table-borderless">
                          <thead>
                            <tr>
                              <th>แบบทดสอบ</th>
                              <th className="text-center">จำนวนคำถาม</th>
                              <th className="text-center">คะแนนเต็ม</th>
                              <th className="text-center">คะแนนที่ได้</th>
                              <th className="text-center">เปอร์เซ็นต์</th>
                              <th className="text-center">ผลลัพธ์</th>
                            </tr>
                          </thead>
                          <tbody>
                            {quizHistory.map((attempt, index) => (
                              <tr key={index}>
                                <td>
                                  <div className="dashboard__quiz-info">
                                    <p>{formatDate(attempt.created_at)}</p>
                                    <h6 className="title">{attempt.quiz_title}</h6>
                                  </div>
                                </td>
                                <td className="text-center">
                                  <p className="color-black">{attempt.questions_count}</p>
                                </td>
                                <td className="text-center">
                                  <p className="color-black">{attempt.max_score}</p>
                                </td>
                                <td className="text-center">
                                  <p className="color-black">{attempt.score}</p>
                                </td>
                                <td className="text-center">
                                  <p className="color-black">{calculatePercentage(attempt.score, attempt.max_score)}%</p>
                                </td>
                                <td className="text-center">
                                  <span className={`dashboard__quiz-result ${attempt.passed ? 'passed' : 'failed'}`}>
                                    {attempt.passed ? 'ผ่าน' : 'ไม่ผ่าน'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentAttemptsArea;
