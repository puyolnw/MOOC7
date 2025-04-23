import React, { useState } from 'react';

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
  
  // ฟังก์ชันค้นหาอย่างง่าย
  const filteredSubjects = availableSubjects.filter(subject => {
    const term = searchTerm.toLowerCase();
    const title = subject.title?.toLowerCase() || "";
    const code = subject.subject_code?.toLowerCase() || "";
    
    return title.includes(term) || code.includes(term);
  });

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
            <i className="fas fa-book me-2"></i>เลือกวิชา
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
          <div className="modal fade show"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
            tabIndex={-1}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">เลือกวิชาที่เกี่ยวข้อง</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowSubjectModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="ค้นหาด้วยรหัสวิชาหรือชื่อวิชา..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <button className="btn btn-outline-secondary" type="button">
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="list-group">
                    {filteredSubjects.length > 0 ? (
                      filteredSubjects.map((subject) => (
                        <div
                          key={subject.id}
                          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <h6 className="mb-1">{subject.title}</h6>
                            <p className="mb-0 small text-muted">
                              {subject.subject_code && `รหัสวิชา: ${subject.subject_code}`}
                            </p>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`select-subject-${subject.id}`}
                              checked={lessonData.subjects.includes(subject.id)}
                              onChange={() => handleToggleSubject(subject.id)}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted">ไม่พบวิชาที่ตรงกับคำค้นหา</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-primary" onClick={() => setShowSubjectModal(false)}>
                    เสร็จสิ้น
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
