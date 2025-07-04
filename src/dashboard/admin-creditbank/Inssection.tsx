import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InstructorSelector from '../../components/InstructorSelector';
import '../../components/InstructorSelector.css';

interface Subject {
  subject_id: number;
  subject_name: string;
  instructors: Instructor[];
}

interface Instructor {
  instructor_id: number;
  name: string;
  position: string;
  avatar_path: string | null;
  avatar_file_id: string | null;
  status: string;
  description: string | null;
  department: number;
  ranking_id: number | null;
  ranking_name?: string;
  department_name?: string;
  avatar?: string;
  bio?: string;
}

interface InsSectionProps {
  subject: Subject;
  onSubjectUpdate?: (updatedSubject: Subject) => void;
}

// Add Instructor Modal Component
const AddInstructorModal: React.FC<{
  show: boolean;
  onClose: () => void;
  onSubmit: (instructorIds: string[]) => void;
  subjectId: number;
}> = ({ show, onClose, onSubmit, subjectId }) => {
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      setSelectedInstructors([]);
      setError('');
    }
  }, [show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedInstructors.length === 0) {
      setError('กรุณาเลือกอาจารย์ผู้สอนอย่างน้อย 1 คน');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${apiURL}/api/courses/subjects/${subjectId}`,
        { instructors: selectedInstructors.map(id => parseInt(id)) },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.data.success) {
        onSubmit(selectedInstructors);
        setSelectedInstructors([]);
        onClose();
        showNotification('เพิ่มอาจารย์ผู้สอนสำเร็จ', 'success');
      } else {
        setError(response.data.message || 'เกิดข้อผิดพลาดในการเพิ่มอาจารย์ผู้สอน');
      }
    } catch (error: any) {
      console.error('Error adding instructors:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'เกิดข้อผิดพลาดในการเพิ่มอาจารย์ผู้สอน';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  const handleClose = () => {
    setSelectedInstructors([]);
    setError('');
    onClose();
  };

  if (!show) return null;

  return (
    <div 
      className="modal fade show" 
      style={{ 
        display: 'block', 
        backgroundColor: 'rgba(0,0,0,0.5)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1050
      }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-gradient-primary">
            <h5 className="modal-title text-white d-flex align-items-center">
              <i className="fas fa-user-plus me-2"></i>
              เพิ่มอาจารย์ผู้สอน
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {error && (
                <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <div>{error}</div>
                </div>
              )}
              
              <InstructorSelector
                selectedInstructors={selectedInstructors}
                onInstructorsChange={setSelectedInstructors}
                label="เลือกอาจารย์ผู้สอน"
                placeholder="ค้นหาอาจารย์ด้วยชื่อ ตำแหน่ง หรือสาขาวิชา..."
                error={error}
              />
              
              <div className="alert alert-info mt-4 d-flex align-items-start">
                <i className="fas fa-info-circle me-2 mt-1"></i>
                <div>
                  <strong>คำแนะนำ:</strong> 
                  <ul className="mb-0 mt-2">
                    <li>คุณสามารถเลือกอาจารย์ผู้สอนได้หลายคน</li>
                    <li>ใช้ช่องค้นหาเพื่อหาอาจารย์ที่ต้องการ</li>
                    <li>สามารถค้นหาได้ด้วยชื่อ ตำแหน่ง หรือสาขาวิชา</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="modal-footer bg-light">
              <button
                type="button"
                className="btn btn-secondary d-flex align-items-center"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                <i className="fas fa-times me-2"></i>
                ยกเลิก
              </button>
              <button
                type="submit"
                className="btn btn-primary d-flex align-items-center"
                disabled={isSubmitting || selectedInstructors.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    กำลังเพิ่ม...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus me-2"></i>
                    เพิ่มอาจารย์ผู้สอน ({selectedInstructors.length})
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Instructors Panel Component
const InsSection: React.FC<InsSectionProps> = ({ subject, onSubjectUpdate }) => {
  const apiURL = import.meta.env.VITE_API_URL;
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<Subject>(subject);

  useEffect(() => {
    setCurrentSubject(subject);
  }, [subject]);

  const handleAddInstructor = () => {
    setShowInstructorModal(true);
  };

  const handleInstructorsAdded = async (instructorIds: string[]) => {
    console.log('Instructor IDs:', instructorIds);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${apiURL}/api/courses/subjects/${subject.subject_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const updatedSubject = response.data.subject;
        setCurrentSubject(updatedSubject);
        if (onSubjectUpdate) {
          onSubjectUpdate(updatedSubject);
        }
      }
    } catch (error) {
      console.error('Error refreshing subject data:', error);
    }
  };

  const handleDeleteInstructor = async (instructorId: number) => {
    if (!confirm('คุณต้องการลบอาจารย์ผู้สอนนี้หรือไม่?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const currentInstructors = currentSubject.instructors?.map(inst => inst.instructor_id) || [];
      const updatedInstructors = currentInstructors.filter(id => id !== instructorId);
      
      const response = await axios.put(
        `${apiURL}/api/courses/subjects/${subject.subject_id}`,
        { instructors: updatedInstructors },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const updatedInstructorsList = currentSubject.instructors.filter(
          instructor => instructor.instructor_id !== instructorId
        );
        const updatedSubject = { ...currentSubject, instructors: updatedInstructorsList };
        setCurrentSubject(updatedSubject);
        
        if (onSubjectUpdate) {
          onSubjectUpdate(updatedSubject);
        }
        
        showNotification('ลบอาจารย์ผู้สอนสำเร็จ', 'success');
      }
    } catch (error) {
      console.error('Error deleting instructor:', error);
      showNotification('เกิดข้อผิดพลาดในการลบอาจารย์ผู้สอน', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  const renderInstructorAvatar = (instructor: Instructor) => {
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.target as HTMLImageElement;
      target.style.display = 'none';
      const placeholder = target.nextElementSibling as HTMLElement;
      if (placeholder) {
        placeholder.style.display = 'flex';
      }
    };

    return (
      <div className="instructor-avatar-wrapper">
        <div className="instructor-avatar">
          {instructor.avatar_file_id && (
            <img
              src={`${apiURL}/api/accounts/instructors/avatar/${instructor.avatar_file_id}`}
              alt={instructor.name}
              onError={handleImageError}
              style={{ display: 'block' }}
            />
          )}
          {instructor.avatar && !instructor.avatar_file_id && (
            <img
              src={`data:image/jpeg;base64,${instructor.avatar}`}
              alt={instructor.name}
              onError={handleImageError}
              style={{ display: 'block' }}
            />
          )}
          <div 
            className="avatar-placeholder" 
            style={{ 
              display: (!instructor.avatar_file_id && !instructor.avatar) ? 'flex' : 'none' 
            }}
          >
            <i className="fas fa-user"></i>
          </div>
        </div>
        <div className="instructor-status">
          <span className={`status-dot ${instructor.status}`}></span>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="tab-panel instructors-panel">
        <div className="instructors-header">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="mb-2 d-flex align-items-center">
                <i className="fas fa-chalkboard-teacher me-3 text-primary"></i>
                อาจารย์ผู้สอน
              </h3>
              <p className="text-muted mb-0">
                รายชื่ออาจารย์ที่สอนในรายวิชา <strong>{currentSubject.subject_name}</strong>
              </p>
            </div>
            <button 
              className="btn btn-primary btn-lg d-flex align-items-center"
              onClick={handleAddInstructor}
              type="button"
            >
              <i className="fas fa-plus me-2"></i>
              เพิ่มอาจารย์
            </button>
          </div>
        </div>
        
        {!currentSubject.instructors || currentSubject.instructors.length === 0 ? (
          <div className="empty-state text-center py-5">
            <div className="empty-state-content">
              <div className="empty-state-icon mb-4">
                                <i className="fas fa-chalkboard-teacher text-muted"></i>
              </div>
              <h4 className="text-muted mb-3">ยังไม่มีอาจารย์ผู้สอน</h4>
              <p className="text-muted mb-4">
                ยังไม่มีอาจารย์ที่ได้รับมอบหมายให้สอนในรายวิชานี้
              </p>
              <button 
                className="btn btn-primary btn-lg d-flex align-items-center mx-auto"
                onClick={handleAddInstructor}
                type="button"
              >
                <i className="fas fa-plus me-2"></i>
                เพิ่มอาจารย์ผู้สอนคนแรก
              </button>
            </div>
          </div>
        ) : (
          <div className="instructors-container">
            <div className="instructors-stats mb-4">
              <div className="stats-card">
                <div className="stats-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stats-content">
                  <h5 className="stats-number">{currentSubject.instructors.length}</h5>
                  <p className="stats-label">อาจารย์ผู้สอน</p>
                </div>
              </div>
            </div>

            <div className="instructors-grid">
              {currentSubject.instructors.map((instructor) => (
                <div key={instructor.instructor_id} className="instructor-card">
                  <div className="instructor-card-header">
                    {renderInstructorAvatar(instructor)}
                    <div className="instructor-actions">
                      <div className="dropdown">
                        <button
                          className="btn btn-sm btn-outline-secondary dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i className="fas fa-ellipsis-v"></i>
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <button
                              className="dropdown-item text-danger"
                              onClick={() => handleDeleteInstructor(instructor.instructor_id)}
                            >
                              <i className="fas fa-trash me-2"></i>
                              ลบออกจากรายวิชา
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="instructor-card-body">
                    <h5 className="instructor-name">
                      {instructor.name || `${instructor.instructor_id}`}
                    </h5>
                    <p className="instructor-position">
                      {instructor.position || 'ไม่ระบุตำแหน่ง'}
                    </p>
                    {instructor.ranking_name && (
                      <p className="instructor-ranking">
                        <i className="fas fa-medal me-1"></i>
                        {instructor.ranking_name}
                      </p>
                    )}
                    {instructor.department_name && (
                      <p className="instructor-department">
                        <i className="fas fa-building me-1"></i>
                        {instructor.department_name}
                      </p>
                    )}
                    {instructor.description && (
                      <p className="instructor-description">
                        {instructor.description.length > 100 
                          ? `${instructor.description.substring(0, 100)}...`
                          : instructor.description
                        }
                      </p>
                    )}
                  </div>
                  
                  <div className="instructor-card-footer">
                    <div className="instructor-meta">
                      <span className={`status-badge ${instructor.status}`}>
                        {instructor.status === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Instructor Modal */}
      <AddInstructorModal
        show={showInstructorModal}
        onClose={() => setShowInstructorModal(false)}
        onSubmit={handleInstructorsAdded}
        subjectId={currentSubject.subject_id}
      />

      {/* Custom Styles */}
      <style >{`
        .instructors-panel {
          padding: 2rem;
          background: #f8f9fa;
          border-radius: 12px;
          min-height: 500px;
        }

        .instructors-header h3 {
          color: #2c3e50;
          font-weight: 600;
        }

        .empty-state {
          background: white;
          border-radius: 12px;
          padding: 3rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .empty-state-icon {
          font-size: 4rem;
          opacity: 0.3;
        }

        .instructors-stats {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stats-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border-left: 4px solid #007bff;
        }

        .stats-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #007bff, #0056b3);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
        }

        .stats-content h5 {
          margin: 0;
          font-size: 2rem;
          font-weight: 700;
          color: #2c3e50;
        }

        .stats-content p {
          margin: 0;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .instructors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .instructor-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          border: 1px solid #e9ecef;
        }

        .instructor-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .instructor-card-header {
          padding: 1.5rem;
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .instructor-avatar-wrapper {
          position: relative;
        }

        .instructor-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid white;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          position: relative;
          background: #f8f9fa;
        }

        .instructor-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #6c757d, #495057);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 2rem;
        }

        .instructor-status {
          position: absolute;
          bottom: 5px;
          right: 5px;
        }

        .status-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .status-dot.active {
          background: #28a745;
        }

        .status-dot.inactive {
          background: #dc3545;
        }

        .instructor-actions .dropdown-toggle {
          border: none;
          background: transparent;
          color: #6c757d;
          padding: 0.5rem;
          border-radius: 8px;
        }

        .instructor-actions .dropdown-toggle:hover {
          background: rgba(0,0,0,0.1);
          color: #495057;
        }

        .instructor-card-body {
          padding: 1.5rem;
        }

        .instructor-name {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .instructor-position {
          color: #007bff;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .instructor-ranking {
          color: #ffc107;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .instructor-department {
          color: #6c757d;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .instructor-description {
          color: #495057;
          font-size: 0.9rem;
          line-height: 1.5;
          margin-bottom: 0;
        }

        .instructor-card-footer {
          padding: 1rem 1.5rem;
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
        }

        .instructor-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-badge {
          padding: 0.375rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-badge.active {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.inactive {
          background: #f8d7da;
          color: #721c24;
        }

        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          min-width: 300px;
          padding: 1rem 1.25rem;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          transform: translateX(400px);
          transition: all 0.3s ease;
        }

        .notification.show {
          transform: translateX(0);
        }

        .notification.success {
          background: #d4edda;
          color: #155724;
          border-left: 4px solid #28a745;
        }

        .notification.error {
          background: #f8d7da;
          color: #721c24;
          border-left: 4px solid #dc3545;
        }

        .notification-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .bg-gradient-primary {
          background: linear-gradient(135deg, #007bff, #0056b3) !important;
        }

        @media (max-width: 768px) {
          .instructors-panel {
            padding: 1rem;
          }

          .instructors-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .instructor-card-header {
            padding: 1rem;
          }

          .instructor-card-body {
            padding: 1rem;
          }

          .instructor-avatar {
            width: 60px;
            height: 60px;
          }

          .avatar-placeholder {
            font-size: 1.5rem;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .instructor-card {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default InsSection;

