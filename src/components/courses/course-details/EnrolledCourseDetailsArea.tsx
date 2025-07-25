import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Curriculum from "./Curriculum";
import Overview from "./Overview";
import Instructors from "./Instructors";
import EnrolledSidebar from "./EnrolledSidebar";

interface EnrolledCourseDetailsAreaProps {
  single_course: any;
  enrollmentData: any;
  onStartLearning?: () => void;
}

const EnrolledCourseDetailsArea = ({
  single_course,

}: EnrolledCourseDetailsAreaProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [subjectsProgress, setSubjectsProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseProgressDetail, setCourseProgressDetail] = useState<any>(null);
  
  const API_URL = import.meta.env.VITE_API_URL;

  // ดึงข้อมูลความก้าวหน้าของหลักสูตรแบบละเอียด
  useEffect(() => {
    const fetchCourseProgressDetail = async () => {
      if (!single_course || !single_course.id) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.get(
          `${API_URL}/api/learn/course/${single_course.id}/progress-detail`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (response.data.success) {
          setCourseProgressDetail(response.data);
        }
      } catch (error) {
        console.error("Error fetching course progress detail:", error);
      }
    };
    
    fetchCourseProgressDetail();
  }, [single_course, API_URL]);

  useEffect(() => {
    // ดึงข้อมูลความก้าวหน้าของแต่ละวิชาจาก Learning API
    const fetchSubjectsProgress = async () => {
      if (!single_course || !single_course.subjects) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // ดึงข้อมูลเนื้อหาทั้งหมดของหลักสูตรพร้อมความก้าวหน้า
        const response = await axios.get(
          `${API_URL}/api/learn/course/${single_course.id}/full-content`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (response.data.success) {
          // ดึงข้อมูลความก้าวหน้าของแต่ละวิชา
          const subjectsWithProgress = await Promise.all(
            response.data.course.subjects.map(async (subject: any) => {
              try {
                const progressResponse = await axios.get(
                  `${API_URL}/api/learn/subject/${subject.subject_id}/progress`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`
                    }
                  }
                );
                
                if (progressResponse.data.success) {
                  return {
                    subject_id: subject.subject_id,
                    subject_name: subject.title,
                    progress_percentage: progressResponse.data.progressPercentage || 0,
                    completed_lessons: progressResponse.data.completedLessons || 0,
                    total_lessons: progressResponse.data.totalLessons || 0,
                    subjectPassed: progressResponse.data.subjectPassed || false
                  };
                }
                return null;
              } catch (error) {
                console.error(`Error fetching progress for subject ${subject.subject_id}:`, error);
                return null;
              }
            })
          );
          
          // กรองออกเฉพาะวิชาที่มีข้อมูลความก้าวหน้า
          const validSubjects = subjectsWithProgress.filter(subject => subject !== null);
          setSubjectsProgress(validSubjects);
        }
      } catch (error) {
        console.error("Error fetching subjects progress:", error);
        setError("ไม่สามารถดึงข้อมูลความก้าวหน้าได้");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubjectsProgress();
  }, [single_course, API_URL]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const tab_titles = ["ภาพรวม", "รายวิชา", "อาจารย์ผู้สอน", "ความก้าวหน้า"];

  // ใช้ข้อมูลจาก API progress-detail ถ้ามี (เหมือนกับที่ใช้ใน sidebar)
  const courseProgress = courseProgressDetail?.overallPercentage || 0;
  const courseStatus = courseProgressDetail?.status || 'in_progress';
  const totalLessons = courseProgressDetail?.totalLessons || single_course.totalLessons || 0;

  return (
    <section className="courses__details-area section-py-120">
      <div className="container">
        <div className="row">
          <div className="col-xl-9 col-lg-8">
            <div className="courses__details-thumb">
              <img src={single_course.thumb} alt={single_course.title} />
            </div>
            <div className="courses__details-content">
              <ul className="courses__item-meta list-wrap">
                <li className="courses__item-tag">
                  <Link to="/course">{single_course.category}</Link>
                </li>
                <li className="department">
                  <i className="flaticon-department"></i>{single_course.department}
                </li>
              </ul>
              <h2 className="title">{single_course.title}</h2>
              <div className="courses__details-meta">
                <ul className="list-wrap">
                  {single_course.instructors && single_course.instructors.length > 0 && (
                    <li className="author-two">
                      <img src={single_course.instructors[0].avatar || "/assets/img/courses/course_author001.png"} alt="img" />
                      โดย <Link to="#">{single_course.instructors[0].name}</Link>
                      {single_course.instructors.length > 1 && ` และอีก ${single_course.instructors.length - 1} ท่าน`}
                    </li>
                  )}
                  <li><i className="flaticon-book"></i>{totalLessons} บทเรียน</li>
                  <li><i className="flaticon-quiz"></i>{single_course.totalQuizzes} แบบทดสอบ</li>
                </ul>
              </div>
              <ul className="nav nav-tabs" id="myTab" role="tablist">
                {tab_titles.map((tab, index) => (
                  <li key={index} onClick={() => handleTabClick(index)} className="nav-item" role="presentation">
                    <button className={`nav-link ${activeTab === index ? "active" : ""}`}>{tab}</button>
                  </li>
                ))}
              </ul>
              <div className="tab-content" id="myTabContent">
                <div className={`tab-pane fade ${activeTab === 0 ? 'show active' : ''}`} id="overview-tab-pane" role="tabpanel" aria-labelledby="overview-tab">
                  <Overview description={single_course.description} />
                </div>
                <div className={`tab-pane fade ${activeTab === 1 ? 'show active' : ''}`} id="curriculum-tab-pane" role="tabpanel" aria-labelledby="curriculum-tab">
  <Curriculum 
    subjects={single_course.subjects} 
    courseId={single_course.id}  // Pass the courseId prop
  />
</div>
                <div className={`tab-pane fade ${activeTab === 2 ? 'show active' : ''}`} id="instructors-tab-pane" role="tabpanel" aria-labelledby="instructors-tab">
                  <Instructors instructors={single_course.instructors} />
                </div>
                <div className={`tab-pane fade ${activeTab === 3 ? 'show active' : ''}`} id="progress-tab-pane" role="tabpanel" aria-labelledby="progress-tab">
                  <div className="course-progress-details">
                    <h3 className="mb-4">ความก้าวหน้ารายวิชา</h3>

                    {isLoading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">กำลังโหลด...</span>
                        </div>
                        <p className="mt-2">กำลังโหลดข้อมูลความก้าวหน้า...</p>
                      </div>
                    ) : error ? (
                      <div className="alert alert-danger">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {error}
                      </div>
                    ) : subjectsProgress.length > 0 ? (
                      <div className="subject-progress-list">
                        {subjectsProgress.map((subject) => (
                          <div key={subject.subject_id} className="subject-progress-item mb-4 p-3 border rounded">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h5 className="mb-0">{subject.subject_name}</h5>
                              <span className="badge bg-primary">{typeof subject.progress_percentage === 'number'
                                ? subject.progress_percentage.toFixed(1)
                                : parseFloat(subject.progress_percentage).toFixed(1)}%</span>
                            </div>
                            <div className="progress" style={{ height: "8px" }}>
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${subject.progress_percentage}%` }}
                                aria-valuenow={subject.progress_percentage}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              ></div>
                            </div>
                            <div className="d-flex justify-content-between mt-2">
                              <small>บทเรียนที่เรียนแล้ว: {subject.completed_lessons}/{subject.total_lessons}</small>
                              <Link to={`/subject-details/${subject.subject_id}`} >
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="alert alert-info">
                        <i className="fas fa-info-circle me-2"></i>
                        ยังไม่มีข้อมูลความก้าวหน้าในรายวิชา กรุณาเริ่มเรียนรายวิชาเพื่อบันทึกความก้าวหน้า
                      </div>
                    )}

                
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        <EnrolledSidebar
                                          subjectCount={single_course.subjectCount}
                                          totalLessons={totalLessons}
                                          totalQuizzes={single_course.totalQuizzes}
                                          courseId={single_course.id}
                                          videoUrl={single_course.videoUrl}
                                          coverImage={single_course.thumb}
                                          progress={courseProgress}
                                          enrollmentStatus={courseStatus}
                                          subjects={single_course.subjects}
                                        />
                                      </div>
                                    </div>
                                  </section>
                                );
                              };
                              
                              export default EnrolledCourseDetailsArea;
                              
