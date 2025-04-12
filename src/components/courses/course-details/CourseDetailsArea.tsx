import { useState } from "react";
import Overview from "./Overview";
import Sidebar from "./Sidebar";
import Curriculum from "./Curriculum"
import Instructors from "./Instructors"
import { Link } from "react-router-dom";

const tab_title: string[] = ["ข้อมูลทั่วไป", "รายวิชา", "ผู้สอน"];

interface CourseDetailsAreaProps {
  single_course: {
    id: number;
    title: string;
    category: string;
    department: string;
    description: string;
    thumb: string;
    subjects: any[];
    subjectCount: number;
    totalLessons: number;
    totalQuizzes: number;
    instructors: any[];
    isLoading: boolean;
    videoUrl?: string; 
    error: string | null;
  };
}

const CourseDetailsArea = ({ single_course }: CourseDetailsAreaProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  if (single_course.isLoading) {
    return (
      <section className="courses__details-area section-py-120">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">กำลังโหลด...</span>
            </div>
            <p className="mt-3">กำลังโหลดข้อมูลหลักสูตร...</p>
          </div>
        </div>
      </section>
    );
  }

  if (single_course.error) {
    return (
      <section className="courses__details-area section-py-120">
        <div className="container">
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-circle me-2"></i>
            {single_course.error}
          </div>
        </div>
      </section>
    );
  }

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
                  <Link to={`/courses?category=${single_course.category}`}>{single_course.category}</Link>
                </li>
              </ul>
              <h2 className="title">{single_course.title}</h2>
              <div className="courses__details-meta">
                <ul className="list-wrap">
                  
                  <li className="date"><i className="flaticon-calendar"></i>24/07/2024</li>
                  <li><i className="flaticon-mortarboard"></i>{single_course.subjectCount} วิชา</li>
                </ul>
              </div>
              <ul className="nav nav-tabs" id="myTab" role="tablist">
                {tab_title.map((tab, index) => (
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
              </div>
            </div>
          </div>
          <Sidebar 
  subjectCount={single_course.subjectCount} 
  totalLessons={single_course.totalLessons} 
  totalQuizzes={single_course.totalQuizzes}
  courseId={single_course.id}
  videoUrl={single_course.videoUrl} // เพิ่ม videoUrl
  coverImage={single_course.thumb} // เพิ่ม coverImage
/>
        </div>
      </div>
    </section>
  )
}

export default CourseDetailsArea
