import React from 'react';

// Interface for subject data
interface Subject {
  id: string;
  title: string;
  instructor: string;
  description: string;
  coverImage?: string; // ปรับให้สอดคล้องกับ AddCourses.tsx
  coverImageFileId?: string;
}

interface ModalPrerequisiteSelectionProps {
  showPrerequisiteModal: boolean;
  setShowPrerequisiteModal: (value: boolean) => void;
  selectedSubjectForPrereq: string | null;
  courseData: {
    subjects: string[];
    prerequisites: { subjectId: string; prerequisiteId: string }[];
  };
  availableSubjects: Subject[];
  selectedSubjectsDetails: Subject[]; // เพิ่ม selectedSubjectsDetails
  handleAddPrerequisite: (prerequisiteId: string) => void;
  handleRemovePrerequisite: (subjectId: string, prerequisiteId: string) => void;
}

const apiURL = import.meta.env.VITE_API_URL;

const ModalPrerequisiteSelection: React.FC<ModalPrerequisiteSelectionProps> = ({
  showPrerequisiteModal,
  setShowPrerequisiteModal,
  selectedSubjectForPrereq,
  courseData,
  availableSubjects,
  selectedSubjectsDetails,
  handleAddPrerequisite,
  handleRemovePrerequisite,
}) => {
  // Debug ข้อมูล
  console.log("Selected Subject for Prerequisite:", selectedSubjectForPrereq);
  console.log("Selected Subjects Details:", selectedSubjectsDetails);
  console.log("Prerequisites:", courseData.prerequisites);

  // หาชื่อวิชาที่เลือก
  const selectedSubjectTitle = availableSubjects.find((s) => s.id === selectedSubjectForPrereq)?.title || "ไม่ทราบชื่อวิชา";

  // กรองรายวิชาที่สามารถกำหนดเป็นวิชาก่อนหน้าได้ (ไม่รวมวิชาที่เลือกเอง)
  const eligibleSubjects = selectedSubjectsDetails.filter((subject) => subject.id !== selectedSubjectForPrereq);

  return (
    <>
      {showPrerequisiteModal && selectedSubjectForPrereq && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  กำหนดวิชาก่อนหน้าสำหรับ: {selectedSubjectTitle}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPrerequisiteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  เลือกรายวิชาที่ผู้เรียนต้องเรียนให้ผ่านก่อนที่จะสามารถเรียนวิชานี้ได้
                </div>

                <div className="subject-list mt-3">
                  {eligibleSubjects.length > 0 ? (
                    eligibleSubjects.map((subject) => {
                      const isPrerequisite = courseData.prerequisites.some(
                        (p) => p.subjectId === selectedSubjectForPrereq && p.prerequisiteId === subject.id
                      );

                      return (
                        <div key={subject.id} className="card mb-2">
                          <div className="card-body d-flex justify-content-between align-items-center py-2">
                            <div className="d-flex align-items-center">
                              <img
                                src={
                                  subject.coverImageFileId
                                    ? `${apiURL}/api/courses/subjects/image/${subject.coverImageFileId}`
                                    : subject.coverImage || "/assets/img/courses/course_thumb01.jpg"
                                }
                                alt={subject.title}
                                className="img-thumbnail me-3"
                                style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                onError={(e) => {
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
                              className={`btn btn-sm ${isPrerequisite ? "btn-success" : "btn-outline-primary"}`}
                              onClick={() => {
                                if (isPrerequisite) {
                                  handleRemovePrerequisite(selectedSubjectForPrereq, subject.id);
                                  console.log(`Removed prerequisite: ${subject.id} for ${selectedSubjectForPrereq}`); // Debug
                                } else {
                                  handleAddPrerequisite(subject.id);
                                  console.log(`Added prerequisite: ${subject.id} for ${selectedSubjectForPrereq}`); // Debug
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
                    })
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">ไม่มีรายวิชาอื่นในหลักสูตรที่สามารถกำหนดเป็นวิชาก่อนหน้าได้</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowPrerequisiteModal(false)}
                >
                  เสร็จสิ้น
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalPrerequisiteSelection;