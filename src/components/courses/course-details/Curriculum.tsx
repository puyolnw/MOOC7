import { useState } from "react";
import { Link } from "react-router-dom";

interface Subject {
  subject_id: number;
  subject_code: string;
  subject_name: string;
  credits: number;
  order_number: number;
  instructor_count: number;
  lesson_count: number;
}

interface CurriculumProps {
  subjects: Subject[];
}

const Curriculum = ({ subjects }: CurriculumProps) => {
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  const toggleAccordion = (id: number) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  return (
    <div className="courses__curriculum-wrap">
      <h3 className="title">รายวิชาในหลักสูตร</h3>
      <p>
        หลักสูตรนี้ประกอบด้วยรายวิชาทั้งหมด {subjects.length} รายวิชา ซึ่งแต่ละรายวิชาจะมีบทเรียนและแบบทดสอบที่ออกแบบมาเพื่อให้ผู้เรียนได้รับความรู้และทักษะอย่างครบถ้วน
      </p>
      
      {subjects.length > 0 ? (
        <div className="accordion" id="accordionExample">
          {subjects.map((subject) => (
            <div key={subject.subject_id} className="accordion-item">
              <h2 className="accordion-header" id={`headingOne${subject.subject_id}`}>
                <button
                  className={`accordion-button ${openAccordion === subject.subject_id ? "" : "collapsed"}`}
                  type="button"
                  onClick={() => toggleAccordion(subject.subject_id)}
                  aria-expanded={openAccordion === subject.subject_id}
                  aria-controls={`collapseOne${subject.subject_id}`}
                >
                  {subject.subject_code} - {subject.subject_name}
                </button>
              </h2>
              <div
                id={`collapseOne${subject.subject_id}`}
                className={`accordion-collapse collapse ${openAccordion === subject.subject_id ? "show" : ""}`}
                aria-labelledby={`headingOne${subject.subject_id}`}
                data-bs-parent="#accordionExample"
              >
                <div className="accordion-body">
                  <ul className="list-wrap">
                    <li className="course-item">
                      <div className="course-item-info">
                        <span className="item-name">รหัสวิชา: {subject.subject_code}</span>
                      </div>
                    </li>
                    <li className="course-item">
                      <div className="course-item-info">
                        <span className="item-name">จำนวนหน่วยกิต: {subject.credits} หน่วยกิต</span>
                      </div>
                    </li>
                    <li className="course-item">
                      <div className="course-item-info">
                        <span className="item-name">จำนวนบทเรียน: {subject.lesson_count} บทเรียน</span>
                      </div>
                    </li>
                    <li className="course-item">
                      <div className="course-item-info">
                        <span className="item-name">จำนวนผู้สอน: {subject.instructor_count} คน</span>
                      </div>
                    </li>
                    <li className="course-item open-item">
                      <Link to={`/subject-details/${subject.subject_id}`} className="course-item-link">
                        <span className="item-name">ดูรายละเอียดรายวิชา</span>
                        <div className="course-item-meta">
                          <i className="fas fa-arrow-right"></i>
                        </div>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          ยังไม่มีรายวิชาในหลักสูตรนี้
        </div>
      )}
    </div>
  );
};

export default Curriculum;
