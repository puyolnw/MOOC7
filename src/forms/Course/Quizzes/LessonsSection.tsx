import React from "react";

interface Subject {
  subject_id: string;
  subject_name: string;
  subject_code: string;
}

interface Lesson {
  id: string;
  title: string;
  subject: string | Subject | Subject[];
  duration: string;
}

interface LessonsSectionProps {
  quizData: {
    lessons: string[];
  };
  availableLessons: Lesson[];
  showLessonModal: boolean;
  setShowLessonModal: React.Dispatch<React.SetStateAction<boolean>>;
  lessonSearchTerm: string;
  setLessonSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  filteredLessons: Lesson[];
  handleToggleLesson: (lessonId: string) => void;
}

const LessonsSection: React.FC<LessonsSectionProps> = ({
  quizData,
  availableLessons,
  showLessonModal,
  setShowLessonModal,
  lessonSearchTerm,
  setLessonSearchTerm,
  filteredLessons,
  handleToggleLesson,
}) => {
  // ฟังก์ชันช่วยแปลง subject เป็น string สำหรับแสดงผล
  const renderSubject = (subject: string | Subject | Subject[]): string => {
    if (Array.isArray(subject)) {
      return subject.map((s) => s.subject_name).join(", ") || "ไม่มีวิชา";
    }
    if (typeof subject === "object" && subject?.subject_name) {
      return subject.subject_name;
    }
    return (typeof subject === "string" ? subject : "") || "ไม่มีวิชา";
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-light">
        <h5 className="mb-0">3. เลือกบทเรียนที่จะใช้แบบทดสอบนี้</h5>
      </div>
      <div className="card-body">
        <p className="text-muted mb-3">
          คุณสามารถเลือกบทเรียนที่ต้องการใช้แบบทดสอบนี้ได้ (ไม่บังคับ) และสามารถเลือกได้มากกว่า 1
          บทเรียน
        </p>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            {quizData.lessons.length > 0 ? (
              <span className="badge bg-success rounded-pill">
                เลือกแล้ว {quizData.lessons.length} บทเรียน
              </span>
            ) : (
              <span className="badge bg-secondary rounded-pill">
                ยังไม่ได้เลือกบทเรียน
              </span>
            )}
          </div>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => setShowLessonModal(true)}
            disabled={availableLessons.length === 0}
          >
            <i className="fas fa-book me-2"></i>เลือกบทเรียน
          </button>
        </div>

        {quizData.lessons.length > 0 && (
          <div className="selected-lessons">
            <h6 className="mb-2">บทเรียนที่เลือก:</h6>
            <div className="row g-2">
              {quizData.lessons.map((lessonId) => {
                const lesson = availableLessons.find((l) => l.id === lessonId);
                return lesson ? (
                  <div key={lesson.id} className="col-md-6">
                    <div className="card border h-100">
                      <div className="card-body py-2 px-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">{lesson.title}</h6>
                            <p className="mb-0 small text-muted">
                              วิชา: {renderSubject(lesson.subject)} | ระยะเวลา:{" "}
                              {lesson.duration || "ไม่ระบุ"}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm text-danger"
                            onClick={() => handleToggleLesson(lesson.id)}
                          >
                            <i className="fas fa-times-circle"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>

      {showLessonModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">เลือกบทเรียน</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowLessonModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ค้นหาบทเรียน..."
                      value={lessonSearchTerm}
                      onChange={(e) => setLessonSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-outline-secondary" type="button">
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                </div>

                <div className="list-group">
                  {filteredLessons.length > 0 ? (
                    filteredLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <h6 className="mb-1">{lesson.title}</h6>
                          <p className="mb-0 small text-muted">
                            วิชา: {renderSubject(lesson.subject)} | ระยะเวลา:{" "}
                            {lesson.duration || "ไม่ระบุ"}
                          </p>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`select-lesson-${lesson.id}`}
                            checked={quizData.lessons.includes(lesson.id)}
                            onChange={() => handleToggleLesson(lesson.id)}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">ไม่พบบทเรียนที่ตรงกับคำค้นหา</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowLessonModal(false)}
                >
                  เสร็จสิ้น
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonsSection;
