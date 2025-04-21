import React from 'react';
import { Subject, CourseData } from './AddCourses';

interface ModalPrerequisiteSelectionProps {
  showPrerequisiteModal: boolean;
  selectedSubjectForPrereq: string | null;
  setShowPrerequisiteModal: React.Dispatch<React.SetStateAction<boolean>>;
  availableSubjects: Subject[];
  selectedSubjectsDetails: Subject[];
  courseData: CourseData;
  handleAddPrerequisite: (prerequisiteId: string) => void;
  handleRemovePrerequisite: (subjectId: string, prerequisiteId: string) => void;
}

const ModalPrerequisiteSelection: React.FC<ModalPrerequisiteSelectionProps> = ({
  showPrerequisiteModal,
  selectedSubjectForPrereq,
  setShowPrerequisiteModal,
  availableSubjects,
  selectedSubjectsDetails,
  courseData,
  handleAddPrerequisite,
  handleRemovePrerequisite
}) => (
  showPrerequisiteModal && selectedSubjectForPrereq && (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              กำหนดวิชาก่อนหน้าสำหรับ: {availableSubjects.find(s => s.id === selectedSubjectForPrereq)?.title}
            </h5>
            <button type="button" className="btn-close" onClick={() => setShowPrerequisiteModal(false)}></button>
          </div>
          <div className="modal-body">
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              เลือกรายวิชาที่ผู้เรียนต้องเรียนให้ผ่านก่อนที่จะสามารถเรียนวิชานี้ได้
            </div>
            
            <div className="subject-list mt-3">
              {selectedSubjectsDetails
                .filter(subject => subject.id !== selectedSubjectForPrereq)
                .map((subject) => {
                  const isPrerequisite = courseData.prerequisites.some(
                    p => p.subjectId === selectedSubjectForPrereq && p.prerequisiteId === subject.id
                  );
                  
                  return (
                    <div key={subject.id} className="card mb-2">
                      <div className="card-body d-flex justify-content-between align-items-center py-2">
                        <div className="d-flex align-items-center">
                          <img
                            src={subject.coverImage}
                            alt={subject.title}
                            className="img-thumbnail me-3"
                            style={{ width: "50px", height: "50px", objectFit: "cover" }}
                            onError={(e) => {
                              // ถ้าโหลดรูปไม่สำเร็จ ใช้รูปเริ่มต้น
                              (e.target as HTMLImageElement).src = "/assets/img/courses/course_thumb01.jpg";
                            }}
                          />
                          <div>
                            <h6 className="mb-0">{subject.title}</h6>
                            <p className="mb-0 small text-muted">ผู้สอน: {subject.instructor}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={`btn btn-sm ${isPrerequisite ? 'btn-success' : 'btn-outline-primary'}`}
                          onClick={() => {
                            if (isPrerequisite) {
                              handleRemovePrerequisite(selectedSubjectForPrereq, subject.id);
                            } else {
                              handleAddPrerequisite(subject.id);
                            }
                          }}
                        >
                          {isPrerequisite ? (
                            <>
                              <i className="fas fa-check me-1"></i>เลือกแล้ว
                            </>
                          ) : (
                            <>
                              <i className="fas fa-plus me-1"></i>เลือกเป็นวิชาก่อนหน้า
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
                
              {selectedSubjectsDetails.filter(subject => subject.id !== selectedSubjectForPrereq).length === 0 && (
                <div className="text-center py-4">
                  <p className="text-muted">ไม่มีรายวิชาอื่นในหลักสูตรที่สามารถกำหนดเป็นวิชาก่อนหน้าได้</p>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={() => setShowPrerequisiteModal(false)}>
              เสร็จสิ้น
            </button>
          </div>
        </div>
      </div>
    </div>
  )
);

export default ModalPrerequisiteSelection;
