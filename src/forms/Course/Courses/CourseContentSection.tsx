import React from 'react';
import { Link } from 'react-router-dom';

// Interface for subject data
interface Subject {
  id: string;
  title: string;
  instructor: string;
  description: string;
  coverImage?: string; // ปรับให้สอดคล้องกับ AddCourses.tsx
  coverImageFileId?: string;
}

interface CourseContentSectionProps {
  isLoading: boolean;
  courseData: {
    subjects: string[];
    prerequisites: { subjectId: string; prerequisiteId: string }[];
  };
  availableSubjects: Subject[];
  errors: { subjects: string };
  selectedSubjectsDetails: Subject[];
  handleReorderSubject: (subjectId: string, newIndex: number) => void;
  handleRemoveSubject: (subjectId: string) => void;
  getPrerequisitesForSubject: (subjectId: string) => string[];
  handleRemovePrerequisite: (subjectId: string, prerequisiteId: string) => void;
  setShowSubjectModal: (value: boolean) => void;
  setShowPrerequisiteModal: (value: boolean) => void;
  setSelectedSubjectForPrereq: (value: string | null) => void;
}

const apiURL = import.meta.env.VITE_API_URL;

const CourseContentSection: React.FC<CourseContentSectionProps> = ({
  isLoading,
  courseData,
  availableSubjects,
  errors,
  selectedSubjectsDetails,
  handleReorderSubject,
  handleRemoveSubject,
  getPrerequisitesForSubject,
  handleRemovePrerequisite,
  setShowSubjectModal,
  setShowPrerequisiteModal,
  setSelectedSubjectForPrereq,
}) => {
  // Debug ข้อมูล selectedSubjectsDetails และ prerequisites
  console.log("Selected Subjects Details:", selectedSubjectsDetails);
  console.log("Prerequisites:", courseData.prerequisites);

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">
        <h5 className="card-title mb-3">2. จัดการเนื้อหาหลักสูตร</h5>

        {errors.subjects && <div className="alert alert-danger">{errors.subjects}</div>}

        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <p className="mb-0">เลือกรายวิชาที่ต้องการเพิ่มในหลักสูตร</p>
          <div className="d-flex gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => setShowSubjectModal(true)}
            >
              <i className="fas fa-plus-circle me-2"></i>เพิ่มรายวิชาที่มีอยู่
            </button>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => window.location.href = '/admin-subjects/create-new'}
            >
              <i className="fas fa-file-medical me-2"></i>สร้างรายวิชาใหม่
            </button>
          </div>
        </div>

        {isLoading && availableSubjects.length === 0 ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">กำลังโหลดข้อมูลรายวิชา...</p>
          </div>
        ) : courseData.subjects.length > 0 ? (
          <div className="selected-subjects mt-3">
            <div className="alert alert-info mb-3">
              <i className="fas fa-info-circle me-2"></i>
              คุณสามารถจัดลำดับรายวิชาโดยใช้ปุ่มขึ้น-ลง และกำหนดวิชาก่อนหน้าที่จำเป็นต้องเรียนก่อน
            </div>

            <div className="subject-list" style={{ minHeight: "50px", padding: "10px 0" }}>
              {selectedSubjectsDetails.map((subject, index) => {
                const prerequisites = getPrerequisitesForSubject(subject.id);
                const prerequisiteSubjects = prerequisites
                  .map((id) => availableSubjects.find((s) => s.id === id))
                  .filter((s): s is Subject => s !== undefined);

                return (
                  <div key={subject.id} className="card mb-3 border">
                    <div className="card-body">
                      <div className="d-flex align-items-center flex-wrap gap-2 mb-2 justify-content-between">
                        <div className="d-flex align-items-center flex-wrap gap-2">
                          <div className="d-flex align-items-center flex-wrap gap-2">
                            <h5 className="mb-0 fw-semibold d-flex align-items-center">{index + 1}</h5>
                            <h5 className="mb-0 fw-semibold d-flex align-items-center">{subject.title}</h5>
                            <button
                              type="button"
                              className="btn btn-outline-secondary rounded-pill p-1"
                              style={{ fontSize: "1rem", width: "50px", height: "30px" }}
                              onClick={() => handleReorderSubject(subject.id, index - 1)}
                              disabled={index === 0}
                            >
                              <i className="fas fa-arrow-up"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary rounded-pill p-1"
                              style={{ fontSize: "1rem", width: "50px", height: "30px" }}
                              onClick={() => handleReorderSubject(subject.id, index + 1)}
                              disabled={index === selectedSubjectsDetails.length - 1}
                            >
                              <i className="fas fa-arrow-down"></i>
                            </button>
                          </div>
                        </div>
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => {
                              setSelectedSubjectForPrereq(subject.id);
                              setShowPrerequisiteModal(true);
                            }}
                          >
                            <i className="fas fa-project-diagram me-1"></i>
                            กำหนดวิชาก่อนหน้า
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemoveSubject(subject.id)}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </div>

                      <div className="d-flex align-items-center flex-column flex-md-row text-center text-md-start">
                        <img
                          src={
                            subject.coverImageFileId
                              ? `${apiURL}/api/courses/subjects/image/${subject.coverImageFileId}`
                              : subject.coverImage || "/assets/img/courses/course_thumb01.jpg"
                          }
                          alt={subject.title}
                          className="img-thumbnail me-0 me-md-3 mb-2 mb-md-0"
                          style={{ width: "120px", height: "80px", objectFit: "cover" }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/assets/img/courses/course_thumb01.jpg";
                          }}
                        />

                        <div>
                          <p className="mb-1 small text-muted">ผู้สอน: {subject.instructor}</p>
                          <p className="mb-0 small">{subject.description}</p>
                        </div>
                      </div>

                      {prerequisiteSubjects.length > 0 && (
                        <div className="mt-3 pt-2 border-top">
                          <h6 className="small">วิชาที่ต้องเรียนก่อน:</h6>
                          <div className="d-flex flex-wrap gap-2 mt-2">
                            {prerequisiteSubjects.map((prereq) => (
                              <div
                                key={prereq.id}
                                className="badge bg-light text-dark p-2 d-flex align-items-center"
                                style={{
                                  fontSize: '1.0em',
                                  padding: '0.5em 1.0em',
                                }}
                              >
                                <span style={{ fontSize: '1.2em' }}>{prereq.title}</span>
                                <button
                                  type="button"
                                  className="btn btn-sm text-danger ms-2 p-0 rounded-pill"
                                  onClick={() => handleRemovePrerequisite(subject.id, prereq.id)}
                                  style={{
                                    fontSize: '1.5em',
                                    marginLeft: '0.5em',
                                  }}
                                >
                                  <i className="fas fa-times-circle" style={{ fontSize: '1.2em' }}></i>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-5 bg-light rounded">
            <i className="fas fa-book-open fa-3x text-muted mb-3"></i>
            <h5>ยังไม่มีรายวิชาในหลักสูตร</h5>
            <p className="text-muted">กรุณาเพิ่มรายวิชาอย่างน้อย 1 รายวิชา</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseContentSection;