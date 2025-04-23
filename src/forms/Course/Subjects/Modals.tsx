import React from "react";
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
  handleSelectQuiz: (quizId: string) => void;
  handleToggleInstructor: (instructorId: string) => void;
  handleToggleCourse: (courseId: string) => void;
  subjectData: SubjectData;
  quizType: "pre" | "post";
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
  handleSelectQuiz,
  handleToggleInstructor,
  handleToggleCourse,
  subjectData,
  quizType,
}) => (
  <>
    {/* Modal เลือกบทเรียน */}
    {showLessonModal && (
      <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-lg modal-dialog-centered modal-slide-down">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">เลือกบทเรียน</h5>
              <button type="button" className="btn-close" onClick={() => setShowLessonModal(false)}></button>
            </div>
            <div className="modal-body modal-body-scrollable">
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="ค้นหาบทเรียน..."
                  value={lessonSearchTerm}
                  onChange={(e) => setLessonSearchTerm(e.target.value)}
                />
              </div>

              <div className="lesson-list">
                {filteredLessons.length > 0 ? (
                  <div className="list-group">
                    {filteredLessons.map((lesson) => {
                      const isSelected = subjectData.lessons.some((l) => l.id === lesson.id);
                      return (
                        <div
                          key={lesson.id}
                          className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                            isSelected ? "bg-light" : ""
                          }`}
                        >
                          <div>
                            <h6 className="mb-0">{lesson.title}</h6>
                          </div>
                          <button
                            type="button"
                            className={`btn btn-sm ${isSelected ? "btn-success disabled" : "btn-outline-primary"}`}
                            onClick={() => handleAddLesson(lesson.id)}
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
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted">ไม่พบบทเรียนที่ตรงกับคำค้นหา</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={() => setShowLessonModal(false)}>
                เสร็จสิ้น
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
              <h5 className="modal-title">
                เลือกแบบทดสอบ{quizType === "pre" ? "ก่อนเรียน" : "หลังเรียน"}
              </h5>
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
                          onClick={() => handleSelectQuiz(quiz.id)}
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


{showInstructorModal && (
  <div className="modal fade show"
    style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
    tabIndex={-1}
  >
    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">เลือกอาจารย์ผู้สอน</h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowInstructorModal(false)}
          ></button>
        </div>
        <div className="modal-body">
          <div className="mb-3">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="ค้นหาอาจารย์..."
                value={instructorSearchTerm}
                onChange={(e) => setInstructorSearchTerm(e.target.value)}
              />
              <button className="btn btn-outline-secondary" type="button">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
          
          <div className="list-group">
            {filteredInstructors.length > 0 ? (
              filteredInstructors.map((instructor) => {
                // Use instructor_id instead of id
                const instructorId = instructor.instructor_id ? instructor.instructor_id.toString() : "";
                return (
                  <div
                    key={instructorId} // Use instructorId for the key
                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h6 className="mb-1">{instructor.name}</h6>
                      <p className="mb-0 small text-muted">{instructor.position}</p>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`select-instructor-${instructorId}`}
                        checked={subjectData.instructors.includes(instructorId)}
                        onChange={() => {
                          if (instructorId) {
                            console.log("Toggling instructor:", instructorId);
                            handleToggleInstructor(instructorId);
                          } else {
                            console.error("Invalid instructor ID:", instructor);
                          }
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div key="no-instructors-found" className="text-center py-4">
                <p className="text-muted">ไม่พบอาจารย์ที่ตรงกับคำค้นหา</p>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={() => setShowInstructorModal(false)}>
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  </div>
)}




    {/* Modal เลือกหลักสูตร */}
    {showCourseModal && (
      <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-lg modal-dialog-centered modal-slide-down">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">เลือกหลักสูตร</h5>
              <button type="button" className="btn-close" onClick={() => setShowCourseModal(false)}></button>
            </div>
            <div className="modal-body modal-body-scrollable">
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="ค้นหาหลักสูตร..."
                  value={courseSearchTerm}
                  onChange={(e) => setCourseSearchTerm(e.target.value)}
                />
              </div>

              <div className="course-list">
                {filteredCourses.length > 0 ? (
                  <div className="list-group">
                    {filteredCourses.map((course) => (
                      <div
                        key={course.id}
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <h6 className="mb-1">{course.title}</h6>
                          <p className="mb-0 small text-muted">
                            หมวดหมู่: {course.category} | รายวิชา: {course.subjects} วิชา
                          </p>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`select-course-${course.id}`}
                            checked={subjectData.courses.includes(course.id)}
                            onChange={() => handleToggleCourse(course.id)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted">ไม่พบหลักสูตรที่ตรงกับคำค้นหา</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={() => setShowCourseModal(false)}>
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
);

export default Modals;
