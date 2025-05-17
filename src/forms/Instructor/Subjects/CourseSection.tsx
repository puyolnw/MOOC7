import React from "react";

// ตรวจสอบว่าการนำเข้า SubjectData ถูกต้อง
// ตรวจสอบว่าเส้นทางไฟล์ถูกต้องและมีการส่งออก SubjectData อย่างถูกต้องในไฟล์ AddSubjects.ts หรือ AddSubjects.tsx
import { SubjectData } from './AddSubjects'; 

interface CourseSectionProps {
  subjectData: SubjectData;
  findCourseById: (courseId: string) => { id: string; title: string; category: string; subjects: number } | undefined;
  handleToggleCourse: (courseId: string) => void;
  setShowCourseModal: (show: boolean) => void;
}

const CourseSection: React.FC<CourseSectionProps> = ({
  subjectData,
  findCourseById,
  handleToggleCourse,
  setShowCourseModal,
}) => (
  <div className="card shadow-sm border-0 mb-4">
    <div className="card-header bg-light">
      <h5 className="mb-0">5. หลักสูตรที่เกี่ยวข้อง</h5>
    </div>
    <div className="card-body">
      <p className="text-muted mb-3">
        คุณสามารถเลือกหลักสูตรที่จะใช้รายวิชานี้ได้ (ไม่บังคับ) และสามารถเลือกได้มากกว่า 1 หลักสูตร
      </p>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          {subjectData.courses.length > 0 ? (
            <span className="badge bg-success rounded-pill">
              เลือกแล้ว {subjectData.courses.length} หลักสูตร
            </span>
          ) : (
            <span className="badge bg-secondary rounded-pill">
              ยังไม่ได้เลือกหลักสูตร
            </span>
          )}
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => setShowCourseModal(true)}
        >
          <i className="fas fa-book me-2"></i>เลือกหลักสูตร
        </button>
      </div>

      {subjectData.courses.length > 0 && (
        <div className="selected-courses">
          <h6 className="mb-2">หลักสูตรที่เลือก:</h6>
          <div className="row g-2">
            {subjectData.courses.map((courseId) => {
              const course = findCourseById(courseId);
              return course ? (
                <div key={course.id} className="col-md-6">
                  <div className="card border h-100">
                    <div className="card-body py-2 px-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{course.title}</h6>
                          <p className="mb-0 small text-muted">
                            หมวดหมู่: {course.category} | รายวิชา: {course.subjects} วิชา
                          </p>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm text-danger"
                          onClick={() => handleToggleCourse(course.id)}
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
  </div>
);

export default CourseSection;
