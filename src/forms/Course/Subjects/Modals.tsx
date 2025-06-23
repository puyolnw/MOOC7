import React, { useState, useMemo } from "react";
import { Instructor } from './AddSubjects';
import { SubjectData } from './AddSubjects';
import { Quiz } from './AddSubjects';

interface ModalProps {
  showLessonModal: boolean;
  showQuizModal: boolean;
  showInstructorModal: boolean;
  showCourseModal: boolean;
  setShowLessonModal: (show: boolean) => void;
  setShowQuizModal: (show: boolean) => void;
  setShowInstructorModal: (show: boolean) => void;
  setShowCourseModal: (show: boolean) => void;
  lessonSearchTerm: string;
  quizSearchTerm: string;
  instructorSearchTerm: string;
  courseSearchTerm: string;
  setLessonSearchTerm: (term: string) => void;
  setQuizSearchTerm: (term: string) => void;
  setInstructorSearchTerm: (term: string) => void;
  setCourseSearchTerm: (term: string) => void;
  filteredLessons: { id: string; title: string }[];
  filteredQuizzes: Quiz[];
  filteredInstructors: Instructor[];
  filteredCourses: { id: string; title: string; category: string; subjects: number }[];
  handleAddLesson: (lessonId: string) => void;
  handleToggleInstructor: (instructorId: string) => void;
  handleToggleCourse: (courseId: string) => void;
  subjectData: SubjectData;
}

const Modals: React.FC<ModalProps> = ({
  showLessonModal,
  showQuizModal,
  showInstructorModal,
  showCourseModal,
  setShowLessonModal,
  setShowQuizModal,
  setShowInstructorModal,
  setShowCourseModal,
  lessonSearchTerm,
  quizSearchTerm,
  instructorSearchTerm,
  courseSearchTerm,
  setLessonSearchTerm,
  setQuizSearchTerm,
  setInstructorSearchTerm,
  setCourseSearchTerm,
  filteredLessons,
  filteredQuizzes,
  filteredInstructors,
  filteredCourses,
  handleAddLesson,
  handleToggleInstructor,
  handleToggleCourse,
  subjectData,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentInstructorPage, setCurrentInstructorPage] = useState<number>(1);
  const [currentCoursePage, setCurrentCoursePage] = useState<number>(1);

  const itemsPerPage = 10; 


  // Pagination บทเรียน
  const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);
  const paginatedLessons = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLessons.slice(start, start + itemsPerPage);
  }, [filteredLessons, currentPage]);

  // Pagination อาจารย์
  const totalInstructorPages = Math.ceil(filteredInstructors.length / itemsPerPage);
  const paginatedInstructors = useMemo(() => {
    const start = (currentInstructorPage - 1) * itemsPerPage;
    return filteredInstructors.slice(start, start + itemsPerPage);
  }, [filteredInstructors, currentInstructorPage]);

  // Pagination หลักสูตร
  const totalCoursePages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = useMemo(() => {
    const start = (currentCoursePage - 1) * itemsPerPage;
    return filteredCourses.slice(start, start + itemsPerPage);
  }, [filteredCourses, currentCoursePage]);

  const handleAddInstructor = (instructorId: string) => {
    if (!subjectData.instructors.includes(instructorId)) {
      handleToggleInstructor(instructorId);
    }
  };

  const handleAddCourse = (courseId: string) => {
    if (!subjectData.courses.includes(courseId)) {
      handleToggleCourse(courseId);
    }
  };

  return (
    <>
      {/* Modal เลือกบทเรียน */}
      {showLessonModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary">
                <h5 className="modal-title text-white">เลือกบทเรียน</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowLessonModal(false)}></button>
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
                      setCurrentPage(1); // reset page when searching
                    }}
                  />
                </div>
                {/* แสดงบทเรียนที่กรองแล้ว */}
                {paginatedLessons.length > 0 ? (
                  <>
                    <div className="list-group list-group-flush mb-3">
                      {paginatedLessons.map((lesson) => {
                        const isSelected = subjectData.lessons.some((l) => l.id === lesson.id);
                        return (
                          <div
                            key={lesson.id}
                            className={`list-group-item d-flex justify-content-between align-items-center ${
                              isSelected ? "bg-light" : ""
                            }`}
                          >
                            <span>{lesson.title}</span>
                            <button
                              type="button"
                              className={`btn btn-sm ${isSelected ? "btn-success disabled" : "btn-outline-primary"}`}
                              onClick={() => handleAddLesson(lesson.id)}
                              disabled={isSelected}
                            >
                              {isSelected ? (
                                <>
                                  <i className="fas fa-check me-1"></i> เลือกแล้ว
                                </>
                              ) : (
                                <>เลือก</>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <nav aria-label="Page navigation" className="mt-4">
                        <ul className="pagination justify-content-center">
                          {Array.from({ length: totalPages }, (_, i) => (
                            <li key={i + 1} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                              <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
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
                <button type="button" className="btn btn-secondary" onClick={() => setShowLessonModal(false)}>
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal เลือกแบบทดสอบ */}
      {showQuizModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-slide-down">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">เลือกแบบทดสอบ</h5>
                <button type="button" className="btn-close" onClick={() => setShowQuizModal(false)}></button>
              </div>
              <div className="modal-body modal-body-scrollable">
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ค้นหาแบบทดสอบ..."
                    value={quizSearchTerm}
                    onChange={(e) => setQuizSearchTerm(e.target.value)}
                  />
                </div>
                <div className="quiz-list">
                  {filteredQuizzes.length > 0 ? (
                    <div className="list-group">
                      {filteredQuizzes.map((quiz) => (
                        <div
                          key={quiz.id}
                          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <h6 className="mb-1">{quiz.title}</h6>
                            <p className="mb-0 small text-muted">จำนวนคำถาม: {quiz.question_count} ข้อ</p>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => {}}
                          >
                            เลือก
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">ไม่พบแบบทดสอบที่ตรงกับคำค้นหา</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowQuizModal(false)}>
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal เลือกอาจารย์ผู้สอน */}
      {showInstructorModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary">
                <h5 className="modal-title text-white">เลือกอาจารย์ผู้สอน</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowInstructorModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ค้นหาอาจารย์..."
                    value={instructorSearchTerm}
                    onChange={(e) => {
                      setInstructorSearchTerm(e.target.value);
                      setCurrentInstructorPage(1); // reset page when searching
                    }}
                  />
                </div>
                {/* แสดงอาจารย์ที่กรองแล้ว */}
                {paginatedInstructors.length > 0 ? (
                  <>
                    <div className="list-group list-group-flush mb-3">
                      {paginatedInstructors.map((instructor) => {
                        const instructorId = instructor.instructor_id ? instructor.instructor_id.toString() : "";
                        const isSelected = subjectData.instructors.includes(instructorId);
                        return (
                          <div
                            key={instructorId}
                            className={`list-group-item d-flex justify-content-between align-items-center ${
                              isSelected ? "bg-light" : ""
                            }`}
                          >
                            <span>{instructor.name}</span>
                            <button
                              type="button"
                              className={`btn btn-sm ${isSelected ? "btn-success disabled" : "btn-outline-primary"}`}
                              onClick={() => handleAddInstructor(instructorId)}
                              disabled={isSelected}
                            >
                              {isSelected ? (
                                <>
                                  <i className="fas fa-check me-1"></i> เลือกแล้ว
                                </>
                              ) : (
                                <>เลือก</>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {/* Pagination */}
                    {totalInstructorPages > 1 && (
                      <nav aria-label="Page navigation" className="mt-4">
                        <ul className="pagination justify-content-center">
                          {Array.from({ length: totalInstructorPages }, (_, i) => (
                            <li key={i + 1} className={`page-item ${currentInstructorPage === i + 1 ? "active" : ""}`}>
                              <button className="page-link" onClick={() => setCurrentInstructorPage(i + 1)}>
                                {i + 1}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    )}
                    <div className="text-center text-muted small mt-2">
                      แสดง {paginatedInstructors.length} จากทั้งหมด {filteredInstructors.length} อาจารย์
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted">ไม่พบอาจารย์ที่ตรงกับคำค้นหา</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInstructorModal(false)}>
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal เลือกหลักสูตร */}
      {showCourseModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary">
                <h5 className="modal-title text-white">เลือกหลักสูตร</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCourseModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ค้นหาหลักสูตร..."
                    value={courseSearchTerm}
                    onChange={(e) => {
                      setCourseSearchTerm(e.target.value);
                      setCurrentCoursePage(1); // reset page when searching
                    }}
                  />
                </div>
                {/* แสดงหลักสูตรที่กรองแล้ว */}
                {paginatedCourses.length > 0 ? (
                  <>
                    <div className="list-group list-group-flush mb-3">
                      {paginatedCourses.map((course) => {
                        const isSelected = subjectData.courses.includes(course.id);
                        return (
                          <div
                            key={course.id}
                            className={`list-group-item d-flex justify-content-between align-items-center ${
                              isSelected ? "bg-light" : ""
                            }`}
                          >
                            <span>{course.title}</span>
                            <button
                              type="button"
                              className={`btn btn-sm ${isSelected ? "btn-success disabled" : "btn-outline-primary"}`}
                              onClick={() => handleAddCourse(course.id)}
                              disabled={isSelected}
                            >
                              {isSelected ? (
                                <>
                                  <i className="fas fa-check me-1"></i> เลือกแล้ว
                                </>
                              ) : (
                                <>เลือก</>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {/* Pagination */}
                    {totalCoursePages > 1 && (
                      <nav aria-label="Page navigation" className="mt-4">
                        <ul className="pagination justify-content-center">
                          {Array.from({ length: totalCoursePages }, (_, i) => (
                            <li key={i + 1} className={`page-item ${currentCoursePage === i + 1 ? "active" : ""}`}>
                              <button className="page-link" onClick={() => setCurrentCoursePage(i + 1)}>
                                {i + 1}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    )}
                    <div className="text-center text-muted small mt-2">
                      แสดง {paginatedCourses.length} จากทั้งหมด {filteredCourses.length} หลักสูตร
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted">ไม่พบหลักสูตรที่ตรงกับคำค้นหา</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCourseModal(false)}>
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default Modals;