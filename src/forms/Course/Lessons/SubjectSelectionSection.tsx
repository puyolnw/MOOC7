import React, { useState, useMemo } from 'react';

interface SubjectSelectionSectionProps {
  lessonData: {
    subjects: string[];
  };
  availableSubjects: { id: string; title: string; subject_code?: string; category?: string }[];
  handleToggleSubject: (subjectId: string) => void;
}

const SubjectSelectionSection: React.FC<SubjectSelectionSectionProps> = ({
  lessonData,
  availableSubjects,
  handleToggleSubject
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // ฟังก์ชันค้นหาอย่างง่าย
  const filteredSubjects = availableSubjects.filter(subject => {
    const term = searchTerm.toLowerCase();
    const title = subject.title?.toLowerCase() || "";
    const code = subject.subject_code?.toLowerCase() || "";
    
    return title.includes(term) || code.includes(term);
  });

  // Pagination วิชา
  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
  const paginatedSubjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSubjects.slice(start, start + itemsPerPage);
  }, [filteredSubjects, currentPage]);

  const handleAddSubject = (subjectId: string) => {
    if (!lessonData.subjects.includes(subjectId)) {
      handleToggleSubject(subjectId);
    }
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-light">
        <h5 className="mb-0">3. เลือกวิชาที่เกี่ยวข้อง</h5>
      </div>
      <div className="card-body">
        <p className="text-muted mb-3">
          คุณสามารถเลือกวิชาที่เกี่ยวข้องกับบทเรียนนี้ได้ (ไม่บังคับ) และสามารถเลือกได้มากกว่า 1 วิชา
        </p>
        
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            {lessonData.subjects.length > 0 ? (
              <span className="badge bg-success rounded-pill">
                เลือกแล้ว {lessonData.subjects.length} วิชา
              </span>
            ) : (
              <span className="badge bg-secondary rounded-pill">
                ยังไม่ได้เลือกวิชา
              </span>
            )}
          </div>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => setShowSubjectModal(true)}
            disabled={availableSubjects.length === 0}
          >
            <i className="fas fa-book me-1"></i>เลือกวิชา
          </button>
        </div>
        
        {lessonData.subjects.length > 0 && (
          <div className="selected-subjects">
            <h6 className="mb-2">วิชาที่เลือก:</h6>
            <div className="row g-2">
              {lessonData.subjects.map(subjectId => {
                const subject = availableSubjects.find(s => s.id === subjectId);
                return subject ? (
                  <div key={subject.id} className="col-md-6">
                    <div className="card border h-100">
                      <div className="card-body py-2 px-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">{subject.title}</h6>
                            <p className="mb-0 small text-muted">
                              {subject.subject_code && `รหัสวิชา: ${subject.subject_code}`}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm text-danger"
                            onClick={() => handleToggleSubject(subject.id)}
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
        
        {showSubjectModal && (
          <div
            className="modal fade show"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
            tabIndex={-1}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-primary">
                  <h5 className="modal-title text-white">เลือกวิชาที่เกี่ยวข้อง</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowSubjectModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ค้นหาวิชา..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                  <div className="subject-list">
                    {paginatedSubjects.length > 0 ? (
                      <>
                        <div className="list-group list-group-flush mb-3">
                          {paginatedSubjects.map((subject) => {
                            const isSelected = lessonData.subjects.includes(subject.id);
                            return (
                              <div
                                key={subject.id}
                                className={`list-group-item d-flex justify-content-between align-items-center ${isSelected ? "bg-light" : ""}`}
                              >
                                <div>
                                  <span>{subject.title}</span>
                                  <p className="mb-0 small text-muted">
                                    {subject.subject_code && `รหัสวิชา: ${subject.subject_code}`}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  className={`btn btn-sm ${isSelected ? "btn-success disabled" : "btn-outline-primary"}`}
                                  onClick={() => handleAddSubject(subject.id)}
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
                          แสดง {paginatedSubjects.length} จากทั้งหมด {filteredSubjects.length} วิชา
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted">ไม่พบวิชาที่ตรงกับคำค้นหา</p>
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
      </div>
    </div>
  );
};

export default SubjectSelectionSection;