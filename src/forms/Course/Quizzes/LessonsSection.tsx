import React, { useState, useMemo } from "react";

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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Pagination for lessons
  const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);
  const paginatedLessons = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLessons.slice(start, start + itemsPerPage);
  }, [filteredLessons, currentPage]);

  // Function to render subject as string
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
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary">
                <h5 className="modal-title text-white">เลือกบทเรียน</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowLessonModal(false);
                    setCurrentPage(1);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ค้นหาบทเรียน..."
                    value={lessonSearchTerm}
                    onChange={(e) => {
                      setLessonSearchTerm(e.target.value);
                      setCurrentPage(1); // Reset page when searching
                    }}
                  />
                </div>
                {paginatedLessons.length > 0 ? (
                  <>
                    <div className="list-group list-group-flush mb-3">
                      {paginatedLessons.map((lesson) => {
                        const isSelected = quizData.lessons.includes(lesson.id);
                        return (
                          <div
                            key={lesson.id}
                            className={`list-group-item d-flex justify-content-between align-items-center ${
                              isSelected ? "bg-light" : ""
                            }`}
                          >
                            <div className="d-flex flex-column">
                              <span className="h6 mb-1">{lesson.title}</span>
                              <p className="mb-0 small text-muted">
                                วิชา: {renderSubject(lesson.subject)} | ระยะเวลา:{" "}
                                {lesson.duration || "ไม่ระบุ"}
                              </p>
                            </div>
                            <button
                              type="button"
                              className={`btn btn-sm ${
                                isSelected ? "btn-success disabled" : "btn-outline-primary"
                              }`}
                              onClick={() => handleToggleLesson(lesson.id)}
                              disabled={isSelected}
                            >
                              {isSelected ? (
                                <>
                                  <i className="fas fa-check me-1"></i>เลือกแล้ว
                                </>
                              ) : (
                                <>เลือก</>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {totalPages > 1 && (
                      <nav aria-label="Page navigation" className="mt-4">
                        <ul className="pagination justify-content-center">
                          {Array.from({ length: totalPages }, (_, i) => (
                            <li
                              key={i + 1}
                              className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(i + 1)}
                              >
                                {i + 1}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    )}
                    <div className="text-center text-muted small mt-2">
                      แสดง {paginatedLessons.length} จากทั้งหมด {filteredLessons.length} บทเรียน
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted">ไม่พบบทเรียนที่ตรงกับคำค้นหา</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowLessonModal(false);
                    setCurrentPage(1);
                  }}
                >
                  ปิด
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