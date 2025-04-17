import { useState } from "react";
import Overview from "./Subject_Overview";
import Sidebar from "./Subject_Sidebar";
import Curriculum from "./Subject_Curriculum";
import Instructors from "./Subject_Instructors";
import { Link } from "react-router-dom";

const tab_title: string[] = ["ภาพรวม", "บทเรียน", "อาจารย์ผู้สอน"];

interface SubjectDetailsAreaProps {
  subject_details: any;
}

const SubjectDetailsArea = ({ subject_details }: SubjectDetailsAreaProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  // ตรวจสอบว่า subject_details มีค่าหรือไม่
  if (!subject_details) {
    return (
      <section className="courses__details-area section-py-120">
        <div className="container">
          <div className="alert alert-warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            ไม่พบข้อมูลรายวิชา
          </div>
        </div>
      </section>
    );
  }

  // ดึงข้อมูลที่จำเป็นจาก subject_details พร้อมกับตรวจสอบว่ามีค่าหรือไม่
  const {
    subject_id,
    subject_code = "รหัสวิชา",
    subject_name = "ชื่อรายวิชา",
    description = "",
    credits = 0,
    department_name = "ไม่ระบุสาขา",
    cover_image,
    instructors = [],
    lessons = [],
    preTest,
    postTest,
    quiz_count = 0
  } = subject_details;
 console.log('Extracted data:', {
    subject_id,
    subject_code,
    subject_name,
    credits,
    department_name,
    cover_image,
    instructors_length: instructors.length,
    lessons_length: lessons.length,
    has_preTest: !!preTest,
    has_postTest: !!postTest,
    quiz_count
  });
  // สร้าง URL รูปภาพปก
  const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3301';
  const coverImageUrl = cover_image 
    ? `${apiURL}/${cover_image}` 
    : "/assets/img/courses/courses_details.jpg";

  // คำนวณจำนวนแบบทดสอบทั้งหมด (รวมแบบทดสอบก่อนเรียน หลังเรียน และในบทเรียน)
  const totalQuizCount = (preTest ? 1 : 0) + (postTest ? 1 : 0) + (quiz_count || 0);

  return (
    <section className="courses__details-area section-py-120">
      <div className="container">
        <div className="row">
          <div className="col-xl-9 col-lg-8">
            <div className="courses__details-thumb">
              <img src={coverImageUrl} alt={subject_name} />
            </div>
            <div className="courses__details-content">
              <ul className="courses__item-meta list-wrap">
                <li className="courses__item-tag">
                  <Link to="/subjects">{department_name}</Link>
                </li>
                <li className="credits">
                  <i className="fas fa-graduation-cap me-1"></i>
                  {credits} หน่วยกิต
                </li>
              </ul>
              <h2 className="title">{subject_code} - {subject_name}</h2>
              <div className="courses__details-meta">
                <ul className="list-wrap">
                  {instructors.length > 0 && (
                    <li className="author-two">
                      <img 
                        src={instructors[0].avatar ? `${apiURL}/${instructors[0].avatar}` : "/assets/img/courses/course_author001.png"} 
                        alt={instructors[0].name} 
                      />
                      โดย <Link to="#">{instructors[0].name}</Link>
                      {instructors.length > 1 && ` และอีก ${instructors.length - 1} ท่าน`}
                    </li>
                  )}
                  <li><i className="flaticon-book"></i>{lessons.length} บทเรียน</li>
                  <li><i className="flaticon-quiz"></i>{totalQuizCount} แบบทดสอบ</li>
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
                  <Overview description={description} preTest={preTest} postTest={postTest} />
                </div>
                <div className={`tab-pane fade ${activeTab === 1 ? 'show active' : ''}`} id="curriculum-tab-pane" role="tabpanel" aria-labelledby="curriculum-tab">
                  <Curriculum lessons={lessons} />
                </div>
                <div className={`tab-pane fade ${activeTab === 2 ? 'show active' : ''}`} id="instructors-tab-pane" role="tabpanel" aria-labelledby="instructors-tab">
                  <Instructors instructors={instructors} />
                </div>
              </div>
            </div>
          </div>
          <Sidebar 
            subject_id={subject_id}
            subject_code={subject_code}
            subject_name={subject_name}
            credits={credits}
            lesson_count={lessons.length}
            quiz_count={totalQuizCount}
            cover_image={coverImageUrl}
          />
        </div>
      </div>
    </section>
  );
};

export default SubjectDetailsArea;
