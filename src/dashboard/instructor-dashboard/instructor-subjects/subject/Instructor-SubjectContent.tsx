"use client"
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

// Define interfaces for our data structure
interface SubjectInfo {
  subject_id: number;
  code: string;
  title: string;
  description: string;
  credits: number;
  department_name: string;
}

interface Statistics {
  totalEnrolled: number;
  completedCount: number;
  inProgressCount: number;
  averageProgress: number;
}

interface Enrollment {
  userId: number;
  name: string;
  email: string;
  enrollmentDate: string;
  status: string;
  progressPercentage: number;
}

interface Lesson {
  lessonId: number;
  title: string;
  orderNumber: number;
  studentsCompleted: number;
}

interface SubjectOverview {
  subject: SubjectInfo;
  statistics: Statistics;
  enrollments: Enrollment[];
  lessons: Lesson[];
}

const InstructorSubjectContent = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overviewData, setOverviewData] = useState<SubjectOverview | null>(null);

  useEffect(() => {
    const fetchSubjectOverview = async () => {
      try {
        setLoading(true);
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
        }

        // Get API base URL from environment variables
        const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        // Set up headers with authorization token
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        // Fetch subject overview
        const response = await axios.get(
          `${apiURL}/api/data/instructor/subject/${subjectId}/overview`, 
          config
        );

        if (response.data.success) {
          setOverviewData(response.data);
        } else {
          throw new Error(response.data.message || "ไม่สามารถดึงข้อมูลรายวิชาได้");
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching subject overview:", err);
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการดึงข้อมูล");
        setLoading(false);
      }
    };

    if (subjectId) {
      fetchSubjectOverview();
    }
  }, [subjectId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="badge" style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          fontSize: '0.75rem',
          fontWeight: '500'
        }}>เรียนจบแล้ว</span>;
      case 'in_progress':
        return <span className="badge" style={{
          backgroundColor: '#d1ecf1',
          color: '#0c5460',
          border: '1px solid #bee5eb',
          fontSize: '0.75rem',
          fontWeight: '500'
        }}>กำลังเรียน</span>;
      case 'dropped':
        return <span className="badge" style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          fontSize: '0.75rem',
          fontWeight: '500'
        }}>หยุดเรียน</span>;
      default:
        return <span className="badge" style={{
          backgroundColor: '#e2e3e5',
          color: '#383d41',
          border: '1px solid #d6d8db',
          fontSize: '0.75rem',
          fontWeight: '500'
        }}>ไม่ทราบสถานะ</span>;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return '#28a745';
    if (percentage >= 60) return '#17a2b8';
    if (percentage >= 40) return '#ffc107';
    return '#dc3545';
  };

  if (loading) {
    return (
      <div className="col-lg-9">
        <div className="dashboard__content-wrap dashboard__content-wrap-two">
          <div className="text-center p-5" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: '#5a67d8' }}>
              <span className="visually-hidden">กำลังโหลด...</span>
            </div>
            <p className="mt-3" style={{ color: '#6c757d', fontSize: '1.1rem' }}>กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-lg-9">
        <div className="dashboard__content-wrap dashboard__content-wrap-two">
          <div className="alert" role="alert" style={{
            backgroundColor: '#f8d7da',
            borderColor: '#f5c6cb',
            color: '#721c24',
            borderRadius: '12px',
            border: '1px solid #f5c6cb',
            padding: '1.5rem'
          }}>
            <h4 className="alert-heading" style={{ color: '#721c24', marginBottom: '1rem' }}>
              <i className="fas fa-exclamation-triangle me-2"></i>
              เกิดข้อผิดพลาด!
            </h4>
            <p style={{ marginBottom: '0' }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!overviewData) {
    return (
      <div className="col-lg-9">
        <div className="dashboard__content-wrap dashboard__content-wrap-two">
          <div className="alert" role="alert" style={{
            backgroundColor: '#fff3cd',
            borderColor: '#ffeaa7',
            color: '#856404',
            borderRadius: '12px',
            border: '1px solid #ffeaa7',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <i className="fas fa-info-circle me-2"></i>
            ไม่พบข้อมูลรายวิชา
          </div>
        </div>
      </div>
    );
  }

  const { subject, statistics, enrollments, lessons } = overviewData;

  return (
    <div className="col-lg-9">
      <div className="dashboard__content-wrap dashboard__content-wrap-two">
        {/* Subject Header */}
        <div className="dashboard__content-title mb-4" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '2rem',
          color: 'white',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
        }}>
          <h4 className="title" style={{ 
            color: 'white', 
            fontSize: '1.8rem', 
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            {subject.code} - {subject.title}
          </h4>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.9)', 
            marginBottom: '1rem',
            fontSize: '1.1rem'
          }}>
            {subject.description}
          </p>
          <div className="row">
            <div className="col-md-6">
              <small style={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.95rem'
              }}>
                <i className="fas fa-graduation-cap me-2"></i>
                <strong>หน่วยกิต:</strong> {subject.credits}
              </small>
            </div>
            <div className="col-md-6">
              <small style={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.95rem'
              }}>
                <i className="fas fa-building me-2"></i>
                <strong>ภาควิชา:</strong> {subject.department_name || 'ไม่ระบุ'}
              </small>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card h-100" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
            }}>
              <div className="card-body text-center" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                  <i className="fas fa-users" style={{ color: 'rgba(255, 255, 255, 0.9)' }}></i>
                </div>
                <h3 className="card-title" style={{ color: 'white', fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  {statistics.totalEnrolled}
                </h3>
                <p className="card-text" style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1rem', marginBottom: '0' }}>
                  นักเรียนทั้งหมด
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card h-100" style={{
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 8px 25px rgba(17, 153, 142, 0.3)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(17, 153, 142, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(17, 153, 142, 0.3)';
            }}>
              <div className="card-body text-center" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                  <i className="fas fa-check-circle" style={{ color: 'rgba(255, 255, 255, 0.9)' }}></i>
                </div>
                <h3 className="card-title" style={{ color: 'white', fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  {statistics.completedCount}
                </h3>
                <p className="card-text" style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1rem', marginBottom: '0' }}>
                  เรียนจบแล้ว
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card h-100" style={{
              background: 'linear-gradient(135deg, #3742fa 0%, #2f3542 100%)',
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 8px 25px rgba(55, 66, 250, 0.3)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(55, 66, 250, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(55, 66, 250, 0.3)';
            }}>
              <div className="card-body text-center" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                  <i className="fas fa-clock" style={{ color: 'rgba(255, 255, 255, 0.9)' }}></i>
                </div>
                <h3 className="card-title" style={{ color: 'white', fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  {statistics.inProgressCount}
                </h3>
                <p className="card-text" style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1rem', marginBottom: '0' }}>
                  กำลังเรียน
                </p>
              </div>
            </div>
          </div>
                   <div className="col-md-3 mb-3">
            <div className="card h-100" style={{
              background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 8px 25px rgba(255, 154, 158, 0.3)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(255, 154, 158, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 154, 158, 0.3)';
            }}>
              <div className="card-body text-center" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                  <i className="fas fa-chart-line" style={{ color: 'rgba(255, 255, 255, 0.9)' }}></i>
                </div>
                <h3 className="card-title" style={{ color: 'white', fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  {statistics.averageProgress.toFixed(1)}%
                </h3>
                <p className="card-text" style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1rem', marginBottom: '0' }}>
                  ความคืบหน้าเฉลี่ย
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="row">
          <div className="col-12 mb-4">
            <div className="card" style={{
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }}>
              <div className="card-header" style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                padding: '1.5rem'
              }}>
                <h5 className="card-title mb-0" style={{ 
                  color: 'white', 
                  fontSize: '1.3rem', 
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <i className="fas fa-user-graduate me-2"></i>
                  รายชื่อนักเรียน ({enrollments.length} คน)
                </h5>
              </div>
              <div className="card-body" style={{ padding: '0' }}>
                {enrollments.length === 0 ? (
                  <div className="text-center py-5">
                    <div style={{ fontSize: '4rem', color: '#e9ecef', marginBottom: '1rem' }}>
                      <i className="fas fa-user-slash"></i>
                    </div>
                    <p style={{ 
                      color: '#6c757d', 
                      fontSize: '1.1rem',
                      marginBottom: '0'
                    }}>
                      ยังไม่มีนักเรียนลงทะเบียนเรียนวิชานี้
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0" style={{ fontSize: '0.95rem' }}>
                      <thead style={{ backgroundColor: '#f8f9fa' }}>
                        <tr>
                          <th style={{ 
                            border: 'none', 
                            padding: '1rem 1.5rem',
                            fontWeight: '600',
                            color: '#495057',
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            <i className="fas fa-user me-2"></i>ชื่อ
                          </th>
                          <th style={{ 
                            border: 'none', 
                            padding: '1rem 1.5rem',
                            fontWeight: '600',
                            color: '#495057',
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            <i className="fas fa-envelope me-2"></i>อีเมล
                          </th>
                          <th style={{ 
                            border: 'none', 
                            padding: '1rem 1.5rem',
                            fontWeight: '600',
                            color: '#495057',
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            <i className="fas fa-calendar me-2"></i>วันที่ลงทะเบียน
                          </th>
                          <th style={{ 
                            border: 'none', 
                            padding: '1rem 1.5rem',
                            fontWeight: '600',
                            color: '#495057',
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            <i className="fas fa-info-circle me-2"></i>สถานะ
                          </th>
                          <th style={{ 
                            border: 'none', 
                            padding: '1rem 1.5rem',
                            fontWeight: '600',
                            color: '#495057',
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            <i className="fas fa-chart-bar me-2"></i>ความคืบหน้า
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrollments.map((enrollment, index) => (
                          <tr key={enrollment.userId} style={{
                            borderLeft: `4px solid ${getProgressColor(enrollment.progressPercentage)}`,
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                            e.currentTarget.style.transform = 'translateX(5px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}>
                            <td style={{ 
                              padding: '1rem 1.5rem',
                              borderTop: index === 0 ? 'none' : '1px solid #dee2e6',
                              verticalAlign: 'middle'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginRight: '0.75rem',
                                  color: 'white',
                                  fontWeight: '600',
                                  fontSize: '0.9rem'
                                }}>
                                  {enrollment.name.charAt(0).toUpperCase()}
                                </div>
                                <strong style={{ color: '#2d3748' }}>{enrollment.name}</strong>
                              </div>
                            </td>
                            <td style={{ 
                              padding: '1rem 1.5rem',
                              borderTop: index === 0 ? 'none' : '1px solid #dee2e6',
                              verticalAlign: 'middle',
                              color: '#6c757d'
                            }}>
                              {enrollment.email}
                            </td>
                            <td style={{ 
                              padding: '1rem 1.5rem',
                              borderTop: index === 0 ? 'none' : '1px solid #dee2e6',
                              verticalAlign: 'middle',
                              color: '#6c757d'
                            }}>
                              {new Date(enrollment.enrollmentDate).toLocaleDateString('th-TH')}
                            </td>
                            <td style={{ 
                              padding: '1rem 1.5rem',
                              borderTop: index === 0 ? 'none' : '1px solid #dee2e6',
                              verticalAlign: 'middle'
                            }}>
                              {getStatusBadge(enrollment.status)}
                            </td>
                            <td style={{ 
                              padding: '1rem 1.5rem',
                              borderTop: index === 0 ? 'none' : '1px solid #dee2e6',
                              verticalAlign: 'middle'
                            }}>
                              <div className="d-flex align-items-center">
                                <div className="progress flex-grow-1 me-3" style={{ 
                                  height: '8px',
                                  borderRadius: '10px',
                                  backgroundColor: '#e9ecef'
                                }}>
                                  <div 
                                    className="progress-bar"
                                    role="progressbar" 
                                    style={{ 
                                      width: `${enrollment.progressPercentage}%`,
                                      backgroundColor: getProgressColor(enrollment.progressPercentage),
                                      borderRadius: '10px',
                                      transition: 'width 0.6s ease'
                                    }}
                                    aria-valuenow={enrollment.progressPercentage} 
                                    aria-valuemin={0} 
                                    aria-valuemax={100}
                                  >
                                  </div>
                                </div>
                                <small style={{ 
                                  color: getProgressColor(enrollment.progressPercentage),
                                  fontWeight: '600',
                                  minWidth: '45px'
                                }}>
                                  {enrollment.progressPercentage.toFixed(1)}%
                                </small>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lessons Overview */}
          <div className="col-12">
            <div className="card" style={{
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }}>
              <div className="card-header" style={{
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                border: 'none',
                padding: '1.5rem'
              }}>
                <h5 className="card-title mb-0" style={{ 
                  color: '#2d3748', 
                  fontSize: '1.3rem', 
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <i className="fas fa-book-open me-2"></i>
                  บทเรียนในวิชานี้ ({lessons.length} บทเรียน)
                </h5>
              </div>
              <div className="card-body" style={{ padding: '0' }}>
                {lessons.length === 0 ? (
                  <div className="text-center py-5">
                    <div style={{ fontSize: '4rem', color: '#e9ecef', marginBottom: '1rem' }}>
                      <i className="fas fa-book"></i>
                    </div>
                    <p style={{ 
                      color: '#6c757d', 
                      fontSize: '1.1rem',
                      marginBottom: '0'
                    }}>
                      ยังไม่มีบทเรียนในวิชานี้
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped mb-0" style={{ fontSize: '0.95rem' }}>
                      <thead style={{ backgroundColor: '#f8f9fa' }}>
                        <tr>
                          <th style={{ 
                            border: 'none', 
                            padding: '1rem 1.5rem',
                            fontWeight: '600',
                            color: '#495057',
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            <i className="fas fa-sort-numeric-down me-2"></i>ลำดับ
                          </th>
                          <th style={{ 
                            border: 'none', 
                            padding: '1rem 1.5rem',
                            fontWeight: '600',
                            color: '#495057',
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            <i className="fas fa-play-circle me-2"></i>ชื่อบทเรียน
                          </th>
                          <th style={{ 
                            border: 'none', 
                            padding: '1rem 1.5rem',
                            fontWeight: '600',
                            color: '#495057',
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            <i className="fas fa-users me-2"></i>จำนวนนักเรียนที่เรียนจบ
                          </th>
                          <th style={{ 
                            border: 'none', 
                            padding: '1rem 1.5rem',
                            fontWeight: '600',
                            color: '#495057',
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            <i className="fas fa-percentage me-2"></i>เปอร์เซ็นต์ที่เรียนจบ
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {lessons.map((lesson, index) => {
                                                    const completionRate = statistics.totalEnrolled > 0 
                            ? (lesson.studentsCompleted / statistics.totalEnrolled * 100)
                            : 0;
                          
                          return (
                            <tr key={lesson.lessonId} style={{
                              borderLeft: `4px solid ${getProgressColor(completionRate)}`,
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f8f9fa';
                              e.currentTarget.style.transform = 'translateX(5px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.transform = 'translateX(0)';
                            }}>
                              <td style={{ 
                                padding: '1rem 1.5rem',
                                borderTop: index === 0 ? 'none' : '1px solid #dee2e6',
                                verticalAlign: 'middle'
                              }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '35px',
                                  height: '35px',
                                  borderRadius: '50%',
                                  backgroundColor: getProgressColor(completionRate),
                                  color: 'white',
                                  fontWeight: '600',
                                  fontSize: '0.9rem'
                                }}>
                                  {lesson.orderNumber}
                                </span>
                              </td>
                              <td style={{ 
                                padding: '1rem 1.5rem',
                                borderTop: index === 0 ? 'none' : '1px solid #dee2e6',
                                verticalAlign: 'middle'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: getProgressColor(completionRate),
                                    marginRight: '0.75rem'
                                  }}></div>
                                  <strong style={{ color: '#2d3748' }}>{lesson.title}</strong>
                                </div>
                              </td>
                              <td style={{ 
                                padding: '1rem 1.5rem',
                                borderTop: index === 0 ? 'none' : '1px solid #dee2e6',
                                verticalAlign: 'middle'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <span style={{ 
                                    fontWeight: '600',
                                    color: getProgressColor(completionRate),
                                    marginRight: '0.5rem'
                                  }}>
                                    {lesson.studentsCompleted}
                                  </span>
                                  <span style={{ color: '#6c757d' }}>
                                    / {statistics.totalEnrolled}
                                  </span>
                                </div>
                              </td>
                              <td style={{ 
                                padding: '1rem 1.5rem',
                                borderTop: index === 0 ? 'none' : '1px solid #dee2e6',
                                verticalAlign: 'middle'
                              }}>
                                <div className="d-flex align-items-center">
                                  <div className="progress flex-grow-1 me-3" style={{ 
                                    height: '8px',
                                    borderRadius: '10px',
                                    backgroundColor: '#e9ecef'
                                  }}>
                                    <div 
                                      className="progress-bar"
                                      role="progressbar" 
                                      style={{ 
                                        width: `${completionRate}%`,
                                        backgroundColor: getProgressColor(completionRate),
                                        borderRadius: '10px',
                                        transition: 'width 0.6s ease'
                                      }}
                                      aria-valuenow={completionRate} 
                                      aria-valuemin={0} 
                                      aria-valuemax={100}
                                    >
                                    </div>
                                  </div>
                                  <small style={{ 
                                    color: getProgressColor(completionRate),
                                    fontWeight: '600',
                                    minWidth: '45px'
                                  }}>
                                    {completionRate.toFixed(1)}%
                                  </small>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorSubjectContent;


