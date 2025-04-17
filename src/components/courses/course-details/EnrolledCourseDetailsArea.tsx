import { useState } from "react";
import { Link } from "react-router-dom";
import Curriculum from "./Curriculum";
import Overview from "./Overview";
import Instructors from "./Instructors";
import EnrolledSidebar from "./EnrolledSidebar"; // ต้องสร้างไฟล์นี้เพิ่ม

interface EnrolledCourseDetailsAreaProps {
  single_course: any;
  enrollmentData: any;
}

const EnrolledCourseDetailsArea = ({ single_course, enrollmentData }: EnrolledCourseDetailsAreaProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const tab_titles = ["ภาพรวม", "รายวิชา", "อาจารย์ผู้สอน", "ความก้าวหน้า"];

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
                  <li><i className="flaticon-book"></i>{single_course.totalLessons} บทเรียน</li>
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
                  <Curriculum subjects={single_course.subjects} />
                </div>
                <div className={`tab-pane fade ${activeTab === 2 ? 'show active' : ''}`} id="instructors-tab-pane" role="tabpanel" aria-labelledby="instructors-tab">
                  <Instructors instructors={single_course.instructors} />
                </div>
                <div className={`tab-pane fade ${activeTab === 3 ? 'show active' : ''}`} id="progress-tab-pane" role="tabpanel" aria-labelledby="progress-tab">
                  <div className="course-progress-details">
                    <h3 className="mb-4">ความก้าวหน้ารายวิชา</h3>
                    
                    {enrollmentData?.subjects?.length > 0 ? (
                      <div className="subject-progress-list">
                        {enrollmentData.subjects.map((subject: any) => (
                          <div key={subject.subject_id} className="subject-progress-item mb-4 p-3 border rounded">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h5 className="mb-0">{subject.subject_name}</h5>
                              <span className="badge bg-primary">{typeof subject.progress_percentage === 'number' 
  ? subject.progress_percentage.toFixed(1) 
  : parseFloat(subject.progress_percentage).toFixed(1)}%%</span>
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
                              <Link to={`/subject-details/${subject.subject_id}`} className="btn btn-sm btn-link">
                                เข้าสู่รายวิชา <i className="fas fa-arrow-right"></i>
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
                    
                    <div className="course-completion-info mt-4">
                      <h4>สถานะการเรียน</h4>
                      <div className="card mt-3">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <p className="mb-1">สถานะ:</p>
                              <h5>
                                {enrollmentData?.enrollment?.status === 'completed' && <span className="text-success">เรียนจบแล้ว</span>}
                                {enrollmentData?.enrollment?.status === 'in_progress' && <span className="text-primary">กำลังเรียน</span>}
                                {enrollmentData?.enrollment?.status === 'not_started' && <span className="text-warning">ยังไม่เริ่มเรียน</span>}
                              </h5>
                            </div>
                            <div>
                              <p className="mb-1">ความก้าวหน้ารวม:</p>
                              <h5>{enrollmentData?.enrollment?.progress || 0}%</h5>
                            </div>
                            <div>
                              <p className="mb-1">วันที่ลงทะเบียน:</p>
                              <h5>{new Date(enrollmentData?.enrollment?.enrollment_date).toLocaleDateString('th-TH')}</h5>
                            </div>
                          </div>
                          
                          {enrollmentData?.enrollment?.status === 'completed' && (
                            <div className="mt-3 text-center">
                              <Link to="/certificates" className="btn btn-success">
                                <i className="fas fa-certificate me-2"></i>
                                ดูใบประกาศนียบัตร
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <EnrolledSidebar 
            subjectCount={single_course.subjectCount} 
            totalLessons={single_course.totalLessons} 
            totalQuizzes={single_course.totalQuizzes} 
            courseId={single_course.id}
            videoUrl={single_course.videoUrl}
            coverImage={single_course.thumb}
            progress={enrollmentData?.enrollment?.progress || 0}
            enrollmentStatus={enrollmentData?.enrollment?.status || 'in_progress'}
          />
        </div>
      </div>
    </section>
  );
};

export default EnrolledCourseDetailsArea;
