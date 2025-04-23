import React from 'react';
import { Link } from "react-router-dom";
import { Subject, CourseData } from './AddCourses';

interface CourseContentSectionProps {
  availableSubjects: Subject[];
  courseData: CourseData;
  errors: { subjects: string };
  setShowSubjectModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedSubjectsDetails: Subject[];
  handleReorderSubject: (subjectId: string, newIndex: number) => void;
  handleRemoveSubject: (subjectId: string) => void;
  setSelectedSubjectForPrereq: React.Dispatch<React.SetStateAction<string | null>>;
  setShowPrerequisiteModal: React.Dispatch<React.SetStateAction<boolean>>;
  getPrerequisitesForSubject: (subjectId: string) => string[];
  isLoading: boolean; // เพิ่มการประกาศตัวแปร isLoading
  handleRemovePrerequisite: (subjectId: string, prerequisiteId: string) => void; // เพิ่มการประกาศฟังก์ชัน handleRemovePrerequisite
}

const CourseContentSection: React.FC<CourseContentSectionProps> = ({
  availableSubjects,
  courseData,
  errors,
  setShowSubjectModal,
  selectedSubjectsDetails,
  handleReorderSubject,
  handleRemoveSubject,
  setSelectedSubjectForPrereq,
  setShowPrerequisiteModal,
  getPrerequisitesForSubject,
  isLoading, // เพิ่มการใช้ตัวแปร isLoading
  handleRemovePrerequisite // เพิ่มการใช้ฟังก์ชัน handleRemovePrerequisite
}) => (
  <div className="card shadow-sm border-0 mb-4">
    <div className="card-body">
      <h5 className="card-title mb-3">2. จัดการเนื้อหาหลักสูตร</h5>
      
      {errors.subjects && (
        <div className="alert alert-danger">{errors.subjects}</div>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-3">
        <p className="mb-0">เลือกรายวิชาที่ต้องการเพิ่มในหลักสูตร</p>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => setShowSubjectModal(true)}
          >
            <i className="fas fa-plus-circle me-2"></i>เพิ่มรายวิชาที่มีอยู่
          </button>
          <Link to="/admin-lessons/create-new" className="btn btn-outline-success">
            <i className="fas fa-file-medical me-2"></i>สร้างรายวิชาใหม่
          </Link>
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
          
          <div className="subject-list" style={{ minHeight: '50px', padding: '10px 0' }}>
            {selectedSubjectsDetails.map((subject, index) => {
              const prerequisites = getPrerequisitesForSubject(subject.id);
              const prerequisiteSubjects = prerequisites.map(
                id => availableSubjects.find(s => s.id === id)
              ).filter(Boolean) as Subject[];
              
              return (
                <div key={subject.id} className="card mb-3 border">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-2">
                      <div className="d-flex align-items-center me-3">
                        <button
                          type="button"
                          className="btn btn-sm btn-link p-0 me-1"
                          onClick={() => handleReorderSubject(subject.id, index - 1)}
                          disabled={index === 0}
                        >
                          <i className="fas fa-arrow-up"></i>
                        </button>
                        <span className="mx-2">{index + 1}</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-link p-0 ms-1"
                          onClick={() => handleReorderSubject(subject.id, index + 1)}
                          disabled={index === selectedSubjectsDetails.length - 1}
                        >
                          <i className="fas fa-arrow-down"></i>
                        </button>
                      </div>
                      <h6 className="mb-0 flex-grow-1">
                        {subject.title}
                      </h6>
                      <div className="d-flex gap-2">
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
                    
                    <div className="d-flex align-items-center">
                      <img
                        src={subject.coverImage}
                        alt={subject.title}
                        className="img-thumbnail me-3"
                        style={{ width: "60px", height: "60px", objectFit: "cover" }}
                        onError={(e) => {
                          // ถ้าโหลดรูปไม่สำเร็จ ใช้รูปเริ่มต้น
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
                          {prerequisiteSubjects.map(prereq => (
                            <div key={prereq.id} className="badge bg-light text-dark p-2 d-flex align-items-center">
                              <span>{prereq.title}</span>
                              <button
                                type="button"
                                className="btn btn-sm text-danger ms-2 p-0"
                                onClick={() => handleRemovePrerequisite(subject.id, prereq.id)}
                              >
                                <i className="fas fa-times-circle"></i>
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

export default CourseContentSection;
