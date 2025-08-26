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

        const response = await axios.get(`${apiURL}/api/courses/c/stats/v2`, {
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
    <div className="card shadow-sm">
      <div className="card-header bg-gradient-primary text-white">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="card-title mb-0">
            <i className="fas fa-chart-line me-2"></i>
            สถิติหลักสูตรยอดนิยม
          </h6>
          <Link to="/admin-creditbank" className="btn btn-outline-light btn-sm">
            ดูทั้งหมด <i className="fas fa-arrow-right ms-1"></i>
          </Link>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th className="border-0">
                <i className="fas fa-book text-primary me-1"></i>
                ชื่อหลักสูตร
              </th>
              <th className="text-center border-0">
                <i className="fas fa-users text-info me-1"></i>
                ผู้เรียน
              </th>
              <th className="text-center border-0">
                <i className="fas fa-star text-warning me-1"></i>
                คะแนนเฉลี่ย
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">กำลังโหลด...</span>
                  </div>
                </td>
              </tr>
            ) : courseStats.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-muted">
                  ไม่พบข้อมูลหลักสูตร
                </td>
              </tr>
            ) : (
              courseStats.slice(0, 8).map((course, index) => (
                <tr key={course.subject_id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                           style={{ width: '24px', height: '24px', fontSize: '11px' }}>
                        {index + 1}
                      </div>
                      <Link 
                        to={`/admin-dashboard/course/${course.subject_id}`}
                        className="text-decoration-none text-dark"
                      >
                        {course.title}
                      </Link>
                    </div>
                  </td>
                  <td className="text-center">
                    <span className="badge bg-info">{course.enrollment_count}</span>
                  </td>
                  <td className="text-center">
                    <div className="d-flex align-items-center justify-content-center">
                      {[1,2,3,4,5].map(star => (
                        <i key={star} className={`fas fa-star ${star <= Math.round(course.average_rating) ? 'text-warning' : 'text-muted'}`} 
                           style={{fontSize: '11px'}}></i>
                      ))}
                      <small className="ms-1 text-muted">({course.average_rating?.toFixed(1) || '0.0'})</small>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {courseStats.length > 0 && (
        <div className="card-footer bg-light border-0">
          <div className="text-center">
            <Link to="/admin-creditbank" className="btn btn-outline-primary btn-sm">
              <i className="fas fa-chart-bar me-2"></i>
              ดูสถิติทั้งหมด
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewTable;
