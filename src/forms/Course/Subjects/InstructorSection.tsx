import React from "react";
import { SubjectData } from './AddSubjects';
import { Instructor } from './AddSubjects';

interface InstructorSectionProps {
  subjectData: SubjectData;
  findInstructorById: (instructorId: string) => Instructor | undefined;
  handleToggleInstructor: (instructorId: string) => void;
  setShowInstructorModal: (show: boolean) => void;
}

const InstructorSection: React.FC<InstructorSectionProps> = ({
  subjectData,
  findInstructorById,
  handleToggleInstructor,
  setShowInstructorModal,
}) => (
  <div className="card shadow-sm border-0 mb-4">
    <div className="card-header bg-light">
      <h5 className="mb-0">4. อาจารย์ผู้สอน</h5>
    </div>
    <div className="card-body">
      <p className="text-muted mb-3">
        คุณสามารถเลือกอาจารย์ผู้สอนสำหรับรายวิชานี้ได้ (ไม่บังคับ) และสามารถเลือกได้มากกว่า 1 คน
      </p>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          {subjectData.instructors.length > 0 ? (
            <span className="badge bg-success rounded-pill">
              เลือกแล้ว {subjectData.instructors.length} อาจารย์
            </span>
          ) : (
            <span className="badge bg-secondary rounded-pill">
              ยังไม่ได้เลือกอาจารย์
            </span>
          )}
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => setShowInstructorModal(true)}
        >
          <i className="fas fa-user-plus me-2"></i>เลือกอาจารย์
        </button>
      </div>

      {subjectData.instructors.length > 0 && (
        <div className="selected-instructors">
          <h6 className="mb-2">อาจารย์ที่เลือก:</h6>
          <div className="row g-2">
          {subjectData.instructors.map((instructorId) => {
  const instructor = findInstructorById(String(instructorId));
  return instructor ? (
    <div key={instructorId} className="col-md-6">
                  <div className="card border h-100">
                    <div className="card-body py-2 px-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{instructor.name}</h6>
                          <p className="mb-0 small text-muted">{instructor.position}</p>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm text-danger"
                          onClick={() => handleToggleInstructor(instructorId)}
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

export default InstructorSection;
