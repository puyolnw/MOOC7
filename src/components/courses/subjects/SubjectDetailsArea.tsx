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
  const apiURL = import.meta.env.VITE_API_URL || "http://localhost:3301";

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  // ตรวจสอบว่า subject_details มีค่าหรือไม่
  if (!subject_details || !subject_details.subject_id) {
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
    instructors = [],
    lessons = [],
    preTest,
    postTest,
    quiz_count = 0,
    cover_image_file_id,
    cover_image,
  } = subject_details;

  // Helper function: extract fileId from Google Drive URL
  const extractGoogleDriveFileId = (url: string): string | null => {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
    return match ? match[1] : null;
  };

  const finalCoverImage = cover_image_file_id
    ? `${apiURL}/api/courses/image/${cover_image_file_id}`
    : cover_image && extractGoogleDriveFileId(cover_image)
      ? `${apiURL}/api/courses/image/${extractGoogleDriveFileId(cover_image)}`
      : "/assets/img/courses/courses_details.jpg";



  // คำนวณจำนวนแบบทดสอบทั้งหมด
  const totalQuizCount = (preTest ? 1 : 0) + (postTest ? 1 : 0) + (quiz_count || 0);

  // ปรับการจัดการ avatar ของ instructor
  const instructorAvatar = instructors[0]?.avatar
    ? typeof instructors[0].avatar === "string" && instructors[0].avatar.startsWith("data:image/")
      ? instructors[0].avatar
      : `${apiURL}/${instructors[0].avatar}`
    : "/assets/img/courses/course_author001.png";

  return (
    <section className="courses__details-area section-py-120">
      <div className="container">
        <div className="row">
          <div className="col-xl-9 col-lg-8">
            <div className="courses__details-thumb">
              <img
                src={finalCoverImage}
                alt={subject_name}
                onError={(e) => {
                  console.warn(`Failed to load cover image: ${finalCoverImage}`);
                  (e.target as HTMLImageElement).src = "/assets/img/courses/courses_details.jpg";
                }}
                loading="lazy"
              />
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
              <h2 className="title">
                {subject_code} - {subject_name}
              </h2>
              <div className="courses__details-meta">
                <ul className="list-wrap">
                  {instructors.length > 0 && (
                    <li className="author-two">
                      <img
                        src={instructorAvatar}
                        alt={instructors[0].name}
                        onError={(e) => {
                          console.warn(`Failed to load instructor avatar: ${instructorAvatar}`);
                          (e.target as HTMLImageElement).src =
                            "/assets/img/courses/course_author001.png";
                        }}
                        loading="lazy"
                      />
                      โดย <Link to="#">{instructors[0].name}</Link>
                      {instructors.length > 1 && ` และอีก ${instructors.length - 1} ท่าน`}
                    </li>
                  )}
                  <li>
                    <i className="flaticon-book"></i>
                    {lessons.length} บทเรียน
                  </li>
                  <li>
                    <i className="flaticon-quiz"></i>
                    {totalQuizCount} แบบทดสอบ
                  </li>
                </ul>
              </div>
              <ul className="nav nav-tabs" id="myTab" role="tablist">
                {tab_title.map((tab, index) => (
                  <li
                    key={index}
                    onClick={() => handleTabClick(index)}
                    className="nav-item"
                    role="presentation"
                  >
                    <button className={`nav-link ${activeTab === index ? "active" : ""}`}>
                      {tab}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="tab-content" id="myTabContent">
                <div
                  className={`tab-pane fade ${activeTab === 0 ? "show active" : ""}`}
                  id="overview-tab-pane"
                  role="tabpanel"
                  aria-labelledby="overview-tab"
                >
                  <Overview description={description} preTest={preTest} postTest={postTest} />
                </div>
                <div
                  className={`tab-pane fade ${activeTab === 1 ? "show active" : ""}`}
                  id="curriculum-tab-pane"
                  role="tabpanel"
                  aria-labelledby="curriculum-tab"
                >
                  <Curriculum lessons={lessons} />
                </div>
                <div
                  className={`tab-pane fade ${activeTab === 2 ? "show active" : ""}`}
                  id="instructors-tab-pane"
                  role="tabpanel"
                  aria-labelledby="instructors-tab"
                >
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
            cover_image={finalCoverImage}
          />
        </div>
      </div>
    </section>
  );
};

export default SubjectDetailsArea;