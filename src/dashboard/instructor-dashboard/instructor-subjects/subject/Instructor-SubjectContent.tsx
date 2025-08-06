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
  institutionName?: string;
  institutionType?: 'school' | 'university' | 'unknown';
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

interface StudentDetail {
  userId: number;
  name: string;
  email: string;
  profileImage?: string;
  totalCoursesEnrolled: number;
  completedCourses: number;
  inProgressCourses: number;
  currentSubjectProgress: number;
  enrollmentDate: string;
  lastActivity: string;
  completedLessons: number;
  totalLessons: number;
  institutionName?: string;
  institutionType?: 'school' | 'university' | 'unknown';
  status?: string;
}

const InstructorSubjectContent = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overviewData, setOverviewData] = useState<SubjectOverview | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [institutionFilter, setInstitutionFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [studentLoading, setStudentLoading] = useState(false);

  useEffect(() => {
    const fetchSubjectOverview = async () => {
      try {
        setLoading(true);
        
        // Get API base URL from environment variables
        const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        // Fetch subject overview
        const response = await axios.get(
          `${apiURL}/api/data/instructor/subject/${subjectId}/overview`
        );

        if (response.data.success) {
          console.log('Subject overview data loaded:', response.data);
          console.log('Enrollments count:', response.data.enrollments?.length || 0);
          
          // Log ความคืบหน้าของนักเรียนแต่ละคน
          response.data.enrollments?.forEach((enrollment: any, index: number) => {
            console.log(`Student ${index + 1}:`, {
              name: enrollment.name,
              progress: enrollment.progressPercentage,
              status: enrollment.status,
              institution: enrollment.institutionName
            });
          });
          
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

  const fetchStudentDetail = async (userId: number) => {
    try {
      setStudentLoading(true);
      
      const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const response = await axios.get(
        `${apiURL}/api/data/instructor/student/${userId}/detail?subjectId=${subjectId}`
      );

      if (response.data.success) {
        console.log('Student detail loaded:', response.data.student);
        setSelectedStudent(response.data.student);
      } else {
        throw new Error(response.data.message || "ไม่สามารถดึงข้อมูลนักเรียนได้");
      }
    } catch (err) {
      console.error("Error fetching student detail:", err);
      setSelectedStudent(null);
    } finally {
      setStudentLoading(false);
    }
  };

  const handleStudentClick = async (userId: number) => {
    setShowStudentModal(true);
    await fetchStudentDetail(userId);
  };

  const closeStudentModal = () => {
    setShowStudentModal(false);
    setSelectedStudent(null);
  };

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

  // Filter enrollments based on active filter and search term
  const getFilteredEnrollments = () => {
    if (!overviewData) {
      console.log('No overview data available for filtering');
      return [];
    }
    
    console.log('Filtering enrollments:', {
      total: overviewData.enrollments?.length || 0,
      activeFilter,
      institutionFilter,
      searchTerm
    });
    
    let filtered = overviewData.enrollments || [];
    
    // Apply status filter
    switch (activeFilter) {
      case 'completed':
        filtered = filtered.filter(enrollment => enrollment.status === 'completed');
        break;
      case 'in_progress':
        filtered = filtered.filter(enrollment => enrollment.status === 'in_progress');
        break;
      case 'high_progress':
        filtered = filtered.filter(enrollment => enrollment.progressPercentage >= 80);
        break;
      case 'all':
      default:
        // No additional filtering needed
        break;
    }
    
    console.log('After status filter:', filtered.length);
    
    // Apply institution filter
    switch (institutionFilter) {
      case 'school':
        filtered = filtered.filter(enrollment => enrollment.institutionType === 'school');
        break;
      case 'university':
        filtered = filtered.filter(enrollment => enrollment.institutionType === 'university');
        break;
      case 'all':
      default:
        // No additional filtering needed
        break;
    }
    
    console.log('After institution filter:', filtered.length);
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(enrollment => 
        enrollment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (enrollment.institutionName && enrollment.institutionName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    console.log('After search filter:', filtered.length);
    
    return filtered;
  };

  const handleFilterClick = (filterType: string) => {
    setActiveFilter(filterType);
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

  const { subject, statistics, lessons } = overviewData;
  const filteredEnrollments = getFilteredEnrollments();

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
            <div 
              className="card h-100" 
              style={{
                background: activeFilter === 'all' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: activeFilter === 'all' ? '3px solid #fff' : 'none',
                borderRadius: '16px',
                boxShadow: activeFilter === 'all' 
                  ? '0 15px 35px rgba(102, 126, 234, 0.5)' 
                  : '0 8px 25px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                transform: activeFilter === 'all' ? 'translateY(-5px)' : 'translateY(0)'
              }}
              onClick={() => handleFilterClick('all')}
              onMouseEnter={(e) => {
                if (activeFilter !== 'all') {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeFilter !== 'all') {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                }
              }}
            >
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
            <div 
              className="card h-100" 
              style={{
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                border: activeFilter === 'completed' ? '3px solid #fff' : 'none',
                borderRadius: '16px',
                boxShadow: activeFilter === 'completed' 
                  ? '0 15px 35px rgba(17, 153, 142, 0.5)' 
                  : '0 8px 25px rgba(17, 153, 142, 0.3)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                transform: activeFilter === 'completed' ? 'translateY(-5px)' : 'translateY(0)'
              }}
              onClick={() => handleFilterClick('completed')}
              onMouseEnter={(e) => {
                if (activeFilter !== 'completed') {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(17, 153, 142, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeFilter !== 'completed') {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(17, 153, 142, 0.3)';
                }
              }}
            >
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
            <div 
              className="card h-100" 
              style={{
                background: 'linear-gradient(135deg, #3742fa 0%, #2f3542 100%)',
                border: activeFilter === 'in_progress' ? '3px solid #fff' : 'none',
                borderRadius: '16px',
                boxShadow: activeFilter === 'in_progress' 
                  ? '0 15px 35px rgba(55, 66, 250, 0.5)' 
                  : '0 8px 25px rgba(55, 66, 250, 0.3)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                transform: activeFilter === 'in_progress' ? 'translateY(-5px)' : 'translateY(0)'
              }}
              onClick={() => handleFilterClick('in_progress')}
              onMouseEnter={(e) => {
                if (activeFilter !== 'in_progress') {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(55, 66, 250, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeFilter !== 'in_progress') {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(55, 66, 250, 0.3)';
                }
              }}
            >
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
            <div 
              className="card h-100" 
              style={{
                background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                border: activeFilter === 'high_progress' ? '3px solid #fff' : 'none',
                borderRadius: '16px',
                boxShadow: activeFilter === 'high_progress' 
                  ? '0 15px 35px rgba(255, 154, 158, 0.5)' 
                  : '0 8px 25px rgba(255, 154, 158, 0.3)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                transform: activeFilter === 'high_progress' ? 'translateY(-5px)' : 'translateY(0)'
              }}
              onClick={() => handleFilterClick('high_progress')}
              onMouseEnter={(e) => {
                if (activeFilter !== 'high_progress') {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(255, 154, 158, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeFilter !== 'high_progress') {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 154, 158, 0.3)';
                }
              }}
            >
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

        {/* Filters Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card" style={{
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
              background: 'white'
            }}>
              <div className="card-body" style={{ padding: '1.5rem' }}>
                <div className="row align-items-center">
                  <div className="col-md-4 mb-3 mb-md-0">
                    <label className="form-label" style={{ 
                      fontWeight: '600', 
                      color: '#2d3748',
                      marginBottom: '0.5rem',
                      fontSize: '0.95rem'
                    }}>
                      <i className="fas fa-school me-2" style={{ color: '#667eea' }}></i>
                      กรองตามประเภทสถาบัน
                    </label>
                    <select 
                      className="form-select"
                      value={institutionFilter}
                      onChange={(e) => setInstitutionFilter(e.target.value)}
                      style={{
                        borderRadius: '10px',
                        border: '2px solid #e9ecef',
                        padding: '0.75rem 1rem',
                        fontSize: '0.95rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 0 0 0.2rem rgba(102, 126, 234, 0.25)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e9ecef';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="all">ทุกประเภท</option>
                      <option value="school">โรงเรียน</option>
                      <option value="university">มหาวิทยาลัย</option>
                    </select>
                  </div>
                  
                  <div className="col-md-8">
                    <label className="form-label" style={{ 
                      fontWeight: '600', 
                      color: '#2d3748',
                      marginBottom: '0.5rem',
                      fontSize: '0.95rem'
                    }}>
                      <i className="fas fa-search me-2" style={{ color: '#667eea' }}></i>
                      ค้นหานักเรียน
                    </label>
                    <div className="input-group">
                      <span className="input-group-text" style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '10px 0 0 10px'
                      }}>
                        <i className="fas fa-search" style={{ color: 'white' }}></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="ค้นหาด้วยชื่อ, อีเมล หรือชื่อสถาบัน..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                          border: '2px solid #e9ecef',
                          borderLeft: 'none',
                          borderRadius: '0 10px 10px 0',
                          padding: '0.75rem 1rem',
                          fontSize: '0.95rem',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea';
                          e.target.style.boxShadow = '0 0 0 0.2rem rgba(102, 126, 234, 0.25)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e9ecef';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                {(institutionFilter !== 'all' || searchTerm.trim()) && (
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid #e9ecef' }}>
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                      <span style={{ fontSize: '0.9rem', color: '#6c757d', fontWeight: '500' }}>
                        ตัวกรองที่ใช้:
                      </span>
                      {institutionFilter !== 'all' && (
                        <span className="badge" style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '500'
                        }}>
                          {institutionFilter === 'school' ? 'โรงเรียน' : 'มหาวิทยาลัย'}
                          <button
                            type="button"
                            className="btn-close btn-close-white ms-2"
                            style={{ fontSize: '0.7rem' }}
                            onClick={() => setInstitutionFilter('all')}
                          />
                        </span>
                      )}
                      {searchTerm.trim() && (
                        <span className="badge" style={{
                          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '500'
                        }}>
                          "{searchTerm}"
                          <button
                            type="button"
                            className="btn-close btn-close-white ms-2"
                            style={{ fontSize: '0.7rem' }}
                            onClick={() => setSearchTerm('')}
                          />
                        </span>
                      )}
                    </div>
                  </div>
                )}
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
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0" style={{ 
                    color: 'white', 
                    fontSize: '1.3rem', 
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <i className="fas fa-user-graduate me-2"></i>
                    รายชื่อนักเรียน ({filteredEnrollments.length} คน)
                    {activeFilter !== 'all' && (
                      <span style={{ 
                        marginLeft: '0.5rem',
                        fontSize: '0.9rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px'
                      }}>
                        {activeFilter === 'completed' && 'เรียนจบแล้ว'}
                        {activeFilter === 'in_progress' && 'กำลังเรียน'}
                        {activeFilter === 'high_progress' && 'ความคืบหน้าสูง (≥80%)'}
                      </span>
                    )}
                  </h5>
                  <div className="d-flex align-items-center">
                    <div className="input-group" style={{ width: '300px' }}>
                      <span className="input-group-text" style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        color: 'white'
                      }}>
                        <i className="fas fa-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="ค้นหาชื่อหรืออีเมล..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          border: 'none',
                          color: 'white',
                          fontSize: '0.9rem'
                        }}
                      />
                      {searchTerm && (
                        <button
                          className="btn btn-outline-light"
                          type="button"
                          onClick={() => setSearchTerm('')}
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            fontSize: '0.8rem'
                          }}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-body" style={{ padding: '0' }}>
                {filteredEnrollments.length === 0 ? (
                  <div className="text-center py-5">
                    <div style={{ fontSize: '4rem', color: '#e9ecef', marginBottom: '1rem' }}>
                      <i className="fas fa-user-slash"></i>
                    </div>
                    <p style={{ 
                      color: '#6c757d', 
                      fontSize: '1.1rem',
                      marginBottom: '0'
                    }}>
                      {activeFilter === 'all' 
                        ? 'ยังไม่มีนักเรียนลงทะเบียนเรียนวิชานี้'
                        : 'ไม่พบนักเรียนที่ตรงกับเงื่อนไขที่เลือก'
                      }
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
                             <i className="fas fa-school me-2"></i>สถาบัน
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
                        {filteredEnrollments.map((enrollment, index) => (
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
                              <div 
                                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                onClick={() => handleStudentClick(enrollment.userId)}
                              >
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
                                <strong style={{ 
                                  color: '#2d3748',
                                  textDecoration: 'underline',
                                  textDecorationColor: 'transparent',
                                  transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.textDecorationColor = '#667eea';
                                  e.currentTarget.style.color = '#667eea';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.textDecorationColor = 'transparent';
                                  e.currentTarget.style.color = '#2d3748';
                                }}>
                                  {enrollment.name}
                                </strong>
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
                               verticalAlign: 'middle'
                             }}>
                               <div className="d-flex align-items-center">
                                 <span className="badge me-2" style={{
                                   backgroundColor: enrollment.institutionType === 'school' ? '#e3f2fd' : '#f3e5f5',
                                   color: enrollment.institutionType === 'school' ? '#1976d2' : '#7b1fa2',
                                   fontSize: '0.7rem',
                                   fontWeight: '500',
                                   padding: '0.25rem 0.5rem'
                                 }}>
                                   {enrollment.institutionType === 'school' ? 'โรงเรียน' : 
                                    enrollment.institutionType === 'university' ? 'มหาวิทยาลัย' : 'ไม่ระบุ'}
                                 </span>
  
                               </div>
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

        {/* Student Detail Modal */}
        {showStudentModal && (
          <div 
            className="modal fade show" 
            style={{ 
              display: 'block', 
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1050
            }}
            onClick={closeStudentModal}
          >
            <div 
              className="modal-dialog modal-lg modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content" style={{
                border: 'none',
                borderRadius: '20px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                overflow: 'hidden'
              }}>
                <div className="modal-header" style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  padding: '2rem'
                }}>
                  <h5 className="modal-title" style={{ 
                    color: 'white', 
                    fontSize: '1.5rem', 
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <i className="fas fa-user-circle me-3" style={{ fontSize: '2rem' }}></i>
                    ข้อมูลนักเรียน
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={closeStudentModal}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <i className="fas fa-times" style={{ color: 'white', fontSize: '1.2rem' }}></i>
                  </button>
                </div>
                <div className="modal-body" style={{ padding: '0' }}>
                  {studentLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: '#667eea' }}>
                        <span className="visually-hidden">กำลังโหลด...</span>
                      </div>
                      <p className="mt-3" style={{ color: '#6c757d', fontSize: '1.1rem' }}>กำลังโหลดข้อมูลนักเรียน...</p>
                    </div>
                  ) : selectedStudent ? (
                    <div style={{ padding: '2rem' }}>
                      {/* Student Profile Section */}
                      <div className="row mb-4">
                        <div className="col-md-4 text-center">
                          <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem',
                            color: 'white',
                            fontSize: '3rem',
                            fontWeight: '600',
                            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                          }}>
                            {selectedStudent.name.charAt(0).toUpperCase()}
                          </div>
                          <h4 style={{ color: '#2d3748', fontWeight: '600', marginBottom: '0.5rem' }}>
                            {selectedStudent.name}
                          </h4>
                          <p style={{ color: '#6c757d', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                          {selectedStudent.email}
                          </p>
                           {selectedStudent.institutionName && (
                             <div className="d-flex align-items-center justify-content-center">
                               <span className="badge me-2" style={{
                                 backgroundColor: selectedStudent.institutionType === 'school' ? '#e3f2fd' : '#f3e5f5',
                                 color: selectedStudent.institutionType === 'school' ? '#1976d2' : '#7b1fa2',
                                 fontSize: '0.7rem',
                                 fontWeight: '500',
                                 padding: '0.25rem 0.5rem'
                               }}>
                                 {selectedStudent.institutionType === 'school' ? 'โรงเรียน' : 
                                  selectedStudent.institutionType === 'university' ? 'มหาวิทยาลัย' : 'ไม่ระบุ'}
                               </span>
                               <span style={{ color: '#6c757d', fontSize: '0.85rem' }}>
                                 {selectedStudent.institutionName}
                               </span>
                             </div>
                           )}
                        </div>
                        <div className="col-md-8">
                          <div className="row">
                            <div className="col-6 mb-3">
                              <div className="card h-100" style={{
                                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white'
                              }}>
                                <div className="card-body text-center" style={{ padding: '1.5rem' }}>
                                  <i className="fas fa-book-open" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></i>
                                  <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                                    {selectedStudent.totalCoursesEnrolled}
                                  </h3>
                                  <p style={{ fontSize: '0.9rem', marginBottom: '0', opacity: '0.9' }}>
                                    หลักสูตรทั้งหมด
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="col-6 mb-3">
                              <div className="card h-100" style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white'
                              }}>
                                <div className="card-body text-center" style={{ padding: '1.5rem' }}>
                                  <i className="fas fa-trophy" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></i>
                                  <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                                    {selectedStudent.completedCourses}
                                  </h3>
                                  <p style={{ fontSize: '0.9rem', marginBottom: '0', opacity: '0.9' }}>
                                    เรียนจบแล้ว
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="col-6 mb-3">
                              <div className="card h-100" style={{
                                background: 'linear-gradient(135deg, #3742fa 0%, #2f3542 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white'
                              }}>
                                <div className="card-body text-center" style={{ padding: '1.5rem' }}>
                                  <i className="fas fa-clock" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></i>
                                  <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                                    {selectedStudent.inProgressCourses}
                                  </h3>
                                  <p style={{ fontSize: '0.9rem', marginBottom: '0', opacity: '0.9' }}>
                                    กำลังเรียน
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="col-6 mb-3">
                              <div className="card h-100" style={{
                                background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white'
                              }}>
                                <div className="card-body text-center" style={{ padding: '1.5rem' }}>
                                  <i className="fas fa-calendar-check" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></i>
                                  <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                                    {Math.floor((Date.now() - new Date(selectedStudent.enrollmentDate).getTime()) / (1000 * 60 * 60 * 24))}
                                  </h3>
                                  <p style={{ fontSize: '0.9rem', marginBottom: '0', opacity: '0.9' }}>
                                    วันที่เรียน
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Current Subject Progress */}
                      <div className="card mb-4" style={{
                        border: '1px solid #e9ecef',
                        borderRadius: '12px',
                        overflow: 'hidden'
                      }}>
                        <div className="card-header" style={{
                          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                          border: 'none',
                          padding: '1.5rem'
                        }}>
                          <h6 className="card-title mb-0" style={{ 
                            color: '#2d3748', 
                            fontSize: '1.2rem', 
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <i className="fas fa-chart-line me-2"></i>
                            ความคืบหน้าในวิชานี้
                          </h6>
                        </div>
                        <div className="card-body" style={{ padding: '2rem' }}>
                          <div className="row align-items-center">
                            <div className="col-md-8">
                              <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <span style={{ fontWeight: '600', color: '#2d3748' }}>
                                    ความคืบหน้าโดยรวม
                                  </span>
                                  <span style={{ 
                                    fontWeight: '700', 
                                    color: getProgressColor(selectedStudent.currentSubjectProgress),
                                    fontSize: '1.1rem'
                                  }}>
                                    {selectedStudent.currentSubjectProgress.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="progress" style={{ 
                                  height: '12px',
                                  borderRadius: '10px',
                                  backgroundColor: '#e9ecef'
                                }}>
                                  <div 
                                    className="progress-bar"
                                    role="progressbar" 
                                    style={{ 
                                      width: `${selectedStudent.currentSubjectProgress}%`,
                                      backgroundColor: getProgressColor(selectedStudent.currentSubjectProgress),
                                      borderRadius: '10px',
                                      transition: 'width 0.6s ease'
                                    }}
                                    aria-valuenow={selectedStudent.currentSubjectProgress} 
                                    aria-valuemin={0} 
                                    aria-valuemax={100}
                                  >
                                  </div>
                                </div>
                              </div>
                              <div className="row">
                                <div className="col-6">
                                  <div style={{ 
                                    padding: '1rem',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '8px',
                                    textAlign: 'center'
                                  }}>
                                    <div style={{ 
                                      fontSize: '1.5rem', 
                                      fontWeight: '700', 
                                      color: getProgressColor(selectedStudent.currentSubjectProgress),
                                      marginBottom: '0.25rem'
                                    }}>
                                      {selectedStudent.completedLessons}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                                      บทเรียนที่เรียนจบ
                                    </div>
                                  </div>
                                </div>
                                <div className="col-6">
                                  <div style={{ 
                                    padding: '1rem',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '8px',
                                    textAlign: 'center'
                                  }}>
                                    <div style={{ 
                                      fontSize: '1.5rem', 
                                      fontWeight: '700', 
                                      color: '#6c757d',
                                      marginBottom: '0.25rem'
                                    }}>
                                      {selectedStudent.totalLessons}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                                      บทเรียนทั้งหมด
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-4 text-center">
                              <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                background: `conic-gradient(${getProgressColor(selectedStudent.currentSubjectProgress)} ${selectedStudent.currentSubjectProgress * 3.6}deg, #e9ecef 0deg)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto',
                                position: 'relative'
                              }}>
                                <div style={{
                                  width: '90px',
                                  height: '90px',
                                  borderRadius: '50%',
                                  backgroundColor: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexDirection: 'column'
                                }}>
                                  <div style={{ 
                                    fontSize: '1.5rem', 
                                    fontWeight: '700', 
                                    color: getProgressColor(selectedStudent.currentSubjectProgress)
                                  }}>
                                    {selectedStudent.currentSubjectProgress.toFixed(0)}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Information */}
                      <div className="row">
                        <div className="col-md-6">
                          <div className="card h-100" style={{
                            border: '1px solid #e9ecef',
                            borderRadius: '12px'
                          }}>
                            <div className="card-body" style={{ padding: '1.5rem' }}>
                              <h6 style={{ 
                                color: '#2d3748', 
                                fontWeight: '600', 
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                <i className="fas fa-info-circle me-2" style={{ color: '#667eea' }}></i>
                                ข้อมูลการลงทะเบียน
                              </h6>
                              <div className="mb-3">
                                <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>วันที่ลงทะเบียน</small>
                                <div style={{ fontWeight: '600', color: '#2d3748' }}>
                                  {new Date(selectedStudent.enrollmentDate).toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                              </div>
                              <div>
                                <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>กิจกรรมล่าสุด</small>
                                <div style={{ fontWeight: '600', color: '#2d3748' }}>
                                  {new Date(selectedStudent.lastActivity).toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="card h-100" style={{
                            border: '1px solid #e9ecef',
                            borderRadius: '12px'
                          }}>
                            <div className="card-body" style={{ padding: '1.5rem' }}>
                              <h6 style={{ 
                                color: '#2d3748', 
                                fontWeight: '600', 
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                <i className="fas fa-graduation-cap me-2" style={{ color: '#667eea' }}></i>
                                สถิติการเรียน
                              </h6>
                              <div className="mb-3">
                                <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>อัตราการเรียนจบ</small>
                                <div style={{ fontWeight: '600', color: '#2d3748' }}>
                                  {selectedStudent.totalCoursesEnrolled > 0 
                                    ? ((selectedStudent.completedCourses / selectedStudent.totalCoursesEnrolled) * 100).toFixed(1)
                                    : 0
                                  }%
                                </div>
                              </div>
                              <div>
                                <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>สถานะในวิชานี้</small>
                                <div style={{ marginTop: '0.25rem' }}>
                                {selectedStudent.status ? getStatusBadge(selectedStudent.status) : 'ไม่ทราบสถานะ'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <div style={{ fontSize: '4rem', color: '#e9ecef', marginBottom: '1rem' }}>
                        <i className="fas fa-user-times"></i>
                      </div>
                      <p style={{ 
                        color: '#6c757d', 
                        fontSize: '1.1rem',
                        marginBottom: '0'
                      }}>
                        ไม่สามารถโหลดข้อมูลนักเรียนได้
                      </p>
                    </div>
                  )}
                </div>
                <div className="modal-footer" style={{
                  border: 'none',
                  padding: '1.5rem 2rem',
                  backgroundColor: '#f8f9fa'
                }}>
                  <button 
                    type="button" 
                    className="btn"
                    onClick={closeStudentModal}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: '25px',
                      padding: '0.75rem 2rem',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <i className="fas fa-times me-2"></i>
                    ปิด
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorSubjectContent;


