import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';

interface CourseStats {
  subject_id: number;
  title: string;
  enrollment_count: number;
  completion_rate: number;
  average_rating: number;
}

const AdminReviewTable = () => {
  const [courseStats, setCourseStats] = useState<CourseStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchCourseStats = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`${apiURL}/api/courses/c/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setCourseStats(response.data.stats);
        }
      } catch (error) {
        console.error('Error fetching course stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseStats();
  }, [apiURL]);


  return (
    <div className="card">
      <div className="card-header bg-white">
        <h5 className="card-title mb-0">สถิติหลักสูตรล่าสุด</h5>
      </div>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>ชื่อหลักสูตร</th>
              <th className="text-center">จำนวนผู้เรียน</th>
              <th className="text-center">อัตราการสำเร็จ</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">กำลังโหลด...</span>
                  </div>
                </td>
              </tr>
            ) : courseStats.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-muted">
                  ไม่พบข้อมูลหลักสูตร
                </td>
              </tr>
            ) : (
              courseStats.map((course) => (
                <tr key={course.subject_id}>
                  <td>
                    <Link 
                      to={`/admin-dashboard/course/${course.subject_id}`}
                      className="text-decoration-none"
                    >
                      {course.title}
                    </Link>
                  </td>
                  <td className="text-center">{course.enrollment_count}</td>
                  <td className="text-center">
                    <div className="progress" style={{ height: '6px' }}>
                      <div 
                        className="progress-bar bg-success" 
                        style={{ width: `${course.completion_rate}%` }}
                      ></div>
                    </div>
                    <small className="text-muted">{course.completion_rate}%</small>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReviewTable;
