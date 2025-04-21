import React from 'react';
import { Subject, CourseData } from './AddCourses';

interface ModalSubjectSelectionProps {
  showSubjectModal: boolean;
  setShowSubjectModal: React.Dispatch<React.SetStateAction<boolean>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  filteredSubjects: Subject[];
  isLoading: boolean;
  courseData: CourseData;
  handleAddSubject: (subjectId: string) => void;
}

const ModalSubjectSelection: React.FC<ModalSubjectSelectionProps> = ({
  showSubjectModal,
  setShowSubjectModal,
  searchTerm,
  setSearchTerm,
  filteredSubjects,
  isLoading,
  courseData,
  handleAddSubject
}) => (
  showSubjectModal && (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">เลือกรายวิชา</h5>
            <button type="button" className="btn-close" onClick={() => setShowSubjectModal(false)}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="ค้นหารายวิชา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                    <div key={subject.id} className="col-md-6">
                      <div className="card h-100">
                        <div className="row g-0">
                          <div className="col-4">
                            <img 
                              src={subject.coverImage} 
                              alt={subject.title} 
                              className="img-fluid rounded-start"
                              style={{ height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                // ถ้าโหลดรูปไม่สำเร็จ ใช้รูปเริ่มต้น
                                (e.target as HTMLImageElement).src = "/assets/img/courses/course_thumb01.jpg";
                              }}
                            />
                          </div>
                          <div className="col-8">
                            <div className="card-body">
                              <h6 className="card-title">{subject.title}</h6>
                              <p className="card-text small text-muted mb-1">ผู้สอน: {subject.instructor}</p>
                              <p className="card-text small mb-2">{subject.description.substring(0, 60)}...</p>
                              <button
                                type="button"
                                className={`btn btn-sm ${courseData.subjects.includes(subject.id) ? 'btn-success disabled' : 'btn-outline-primary'}`}
                                onClick={() => handleAddSubject(subject.id)}
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
            <button type="button" className="btn btn-secondary" onClick={() => setShowSubjectModal(false)}>
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  )
);

export default ModalSubjectSelection;
