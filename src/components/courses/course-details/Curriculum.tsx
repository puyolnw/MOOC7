import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface Prerequisite {
  prerequisite_id: number;
  prerequisite_name: string;
  prerequisite_code: string;
}

interface Subject {
  subject_id: number;
  subject_code: string;
  subject_name: string;
  credits: number;
  order_number: number;
  instructor_count?: number;
  lesson_count?: number;
  cover_image?: string;
  cover_image_file_id?: number;
  prerequisites?: Prerequisite[];
}

interface CurriculumProps {
  subjects: Subject[];
  courseId: number; // Add this line
}

const Curriculum: React.FC<CurriculumProps> = ({ subjects, courseId }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [windowWidth]);

  const getColumnClass = (): string => {
    if (windowWidth <= 768) {
      return "curriculum-col curriculum-col-mobile";
    } else if (windowWidth <= 1200) {
      return "curriculum-col curriculum-col-tablet";
    } else {
      return "curriculum-col curriculum-col-desktop";
    }
  };

  return (
    <div className="courses__curriculum-wrap">
      <h3 className="title">รายวิชาในหลักสูตร</h3>
      <p>
        หลักสูตรนี้ประกอบด้วยรายวิชาทั้งหมด {subjects.length} รายวิชา
        ซึ่งแต่ละรายวิชาจะมีบทเรียนและแบบทดสอบที่ออกแบบมาเพื่อให้ผู้เรียนได้รับความรู้และทักษะอย่างครบถ้วน
      </p>

      {subjects.length > 0 ? (
        <div className="curriculum-grid">
          {subjects.map((subject) => {
            return (
              <div key={subject.subject_id} className={getColumnClass()}>
                <div className="curriculum-card">
                  {/* Order Badge */}
                  <div className="curriculum-order-badge">
                    {subject.order_number || 1}
                  </div>

                  {subject.cover_image ? (
                    <img
                      src={
                        subject.cover_image && subject.cover_image_file_id
                          ? `${apiURL}/api/courses/subjects/image/${subject.cover_image_file_id}`
                          : "/assets/img/courses/course_thumb01.jpg"
                      }
                      alt={subject.subject_name || "รายวิชา"}
                      className="curriculum-card-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/img/courses/course_thumb01.jpg";
                      }}
                    />
                  ) : (
                    <div className="curriculum-placeholder-image">
                      <i className="fas fa-book-open" style={{ marginRight: "8px" }}></i>
                      {subject.subject_code || "ไม่มีรหัสวิชา"}
                    </div>
                  )}

                  <div className="curriculum-card-header">
                    <h4 className="curriculum-card-code">{subject.subject_code || "ไม่มีรหัสวิชา"}</h4>
                    <h5 className="curriculum-card-title">{subject.subject_name || "ไม่มีชื่อวิชา"}</h5>
                  </div>

                  <div className="curriculum-card-body">
                    <ul className="curriculum-info-list">
                      <li className="curriculum-info-item">
                        <i className="fas fa-graduation-cap curriculum-info-icon"></i>
                        <span className="curriculum-info-text">{subject.credits ?? 0} หน่วยกิต</span>
                      </li>
                      <li className="curriculum-info-item">
                        <i className="fas fa-book curriculum-info-icon"></i>
                        <span className="curriculum-info-text">{subject.lesson_count ?? 0} บทเรียน</span>
                      </li>
                      <li className="curriculum-info-item">
                        <i className="fas fa-chalkboard-teacher curriculum-info-icon"></i>
                        <span className="curriculum-info-text">{subject.instructor_count ?? 0} ผู้สอน</span>
                      </li>
                    </ul>

                    {subject.prerequisites && subject.prerequisites.length > 0 ? (
                      <div className="curriculum-prerequisites-container">
                        <h6 className="curriculum-prerequisites-title">
                          <i className="fas fa-project-diagram" style={{ marginRight: "8px" }}></i>
                          วิชาที่ต้องเรียนก่อน:
                        </h6>
                        <div className="curriculum-prerequisites-list">
                          {subject.prerequisites.map((prereq) => (
                            <span
                              key={prereq.prerequisite_id}
                              className="curriculum-prerequisites-badge"
                              title={prereq.prerequisite_name || ""}
                            >
                              {prereq.prerequisite_code || "ไม่มีรหัส"}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="curriculum-card-footer">
                    <Link
                      to={`/subject-details/${courseId}/${subject.subject_id}`}
                      className="curriculum-button"
                    >
                      ดูรายละเอียดรายวิชา
                      <i className="fas fa-arrow-right curriculum-button-icon"></i>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="curriculum-alert">
          <i className="fas fa-info-circle" style={{ marginRight: "8px" }}></i>
          ยังไม่มีรายวิชาในหลักสูตรนี้
        </div>
      )}
    </div>
  );
};

export default Curriculum;