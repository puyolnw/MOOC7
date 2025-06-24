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

interface ModalSubjectSelectionProps {
  showSubjectModal: boolean;
  setShowSubjectModal: (value: boolean) => void;
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filteredSubjects: Subject[];
  courseData: { subjects: string[] };
  handleAddSubject: (subjectId: string) => void;
}

const apiURL = import.meta.env.VITE_API_URL;

const ModalSubjectSelection: React.FC<ModalSubjectSelectionProps> = ({
  showSubjectModal,
  setShowSubjectModal,
  isLoading,
  searchTerm,
  setSearchTerm,
  filteredSubjects,
  courseData,
  handleAddSubject,
}) => {
  // Debug ข้อมูล
  console.log("Filtered Subjects:", filteredSubjects);
  console.log("Search Term:", searchTerm);
  console.log("Course Subjects:", courseData.subjects);

  return (
    <>
      {showSubjectModal && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">เลือกรายวิชา</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSubjectModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ค้นหารายวิชา..หห."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      console.log("Search term updated:", e.target.value); // Debug
                    }}
                  />
                </div>

                <div className="subject-list">
                  {isLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">กำลังโหลดข้อมูล...</p>
                    </div>
                  ) : filteredSubjects.length > 0 ? (
                    <div className="row g-3">
                      {filteredSubjects.map((subject) => (
                        <div key={subject.id} className="col-md-6 col-12">
                          <div className="card h-100">
                            <div className="row g-0">
                              <div className="col-4" style={{ minHeight: '100px' }}>
                                <img
                                  src={
                                    subject.coverImageFileId
                                      ? `${apiURL}/api/courses/subjects/image/${subject.coverImageFileId}`
                                      : subject.coverImage || "/assets/img/courses/course_thumb01.jpg"
                                  }
                                  alt={subject.title}
                                  className="img-fluid rounded-start"
                                  onError={(e) => {
                                    console.log(`Failed to load image for ${subject.title}`);
                                    (e.target as HTMLImageElement).src =
                                      '/assets/img/courses/course_thumb01.jpg';
                                  }}
                                  style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                                />
                              </div>
                              <div className="col-8">
                                <div className="card-body">
                                  <h6
                                    className="card-title text-truncate"
                                    title={subject.title}
                                    style={{ maxWidth: '100%' }}
                                  >
                                    {subject.title}
                                  </h6>
                                  <p
                                    className="card-text small text-muted mb-1 text-truncate"
                                    title={subject.instructor}
                                    style={{ maxWidth: '100%' }}
                                  >
                                    ผู้สอน: {subject.instructor}
                                  </p>
                                  <p
                                    className="card-text small mb-2"
                                    style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                                    title={subject.description}
                                  >
                                    {subject.description.length > 60
                                      ? `${subject.description.substring(0, 60)}...`
                                      : subject.description}
                                  </p>
                                  <button
                                    type="button"
                                    className={`btn btn-sm w-100 mt-1 ${
                                      courseData.subjects.includes(subject.id)
                                        ? 'btn-success disabled'
                                        : 'btn-outline-primary'
                                    }`}
                                    onClick={() => {
                                      handleAddSubject(subject.id);
                                      console.log(`Added subject: ${subject.id}`); // Debug
                                    }}
                                    disabled={courseData.subjects.includes(subject.id)}
                                  >
                                    {courseData.subjects.includes(subject.id) ? (
                                      <>
                                        <i className="fas fa-check me-1"></i>เพิ่มแล้ว
                                      </>
                                    ) : (
                                      <>
                                        <i className="fas fa-plus me-1"></i>เพิ่มรายวิชา
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">ไม่พบรายวิชาที่ตรงกับคำค้นหา</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSubjectModal(false)}
                >
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

export default ModalSubjectSelection;