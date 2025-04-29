import { useState } from "react";
import { Link } from "react-router-dom";
import Curriculum from "./Curriculum";
import Overview from "./Overview";
import Instructors from "./Instructors";
import Reviews from "./Reviews";
import Sidebar from "./Sidebar";

interface CourseDetailsAreaProps {
  single_course: any;
  onEnroll: () => void; // เพิ่ม prop นี้
}

const CourseDetailsArea = ({ single_course, onEnroll }: CourseDetailsAreaProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const tab_titles = ["ภาพรวม", "รายวิชา", "อาจารย์ผู้สอน", "รีวิว"];

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
                  <li><i className="flaticon-quiz"></i>{single_course.totalQuizzes} แบบทดสอบก</li>
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
    courseId={single_course.id} // Add courseId prop
  />
</div>
                <div className={`tab-pane fade ${activeTab === 2 ? 'show active' : ''}`} id="instructors-tab-pane" role="tabpanel" aria-labelledby="instructors-tab">
                  <Instructors instructors={single_course.instructors} />
                </div>
                <div className={`tab-pane fade ${activeTab === 3 ? 'show active' : ''}`} id="reviews-tab-pane" role="tabpanel" aria-labelledby="reviews-tab">
                  <Reviews />
                </div>
              </div>
            </div>
          </div>
          <Sidebar 
            subjectCount={single_course.subjectCount}
            totalLessons={single_course.totalLessons}
            totalQuizzes={single_course.totalQuizzes}
            courseId={single_course.id}
            videoUrl={single_course.videoUrl}
            coverImage={single_course.thumb}
            onEnroll={onEnroll}
          />
        </div>
      </div>
    </section>
  );
};

export default CourseDetailsArea;
