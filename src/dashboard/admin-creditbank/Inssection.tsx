import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
      console.log('Modal opened, state reset');
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
          <div className="modal-header bg-primary">
            <h5 className="modal-title text-white">
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
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}
              
              <InstructorSelector
                selectedInstructors={selectedInstructors}
                onInstructorsChange={setSelectedInstructors}
                label="เลือกอาจารย์ผู้สอน"
                placeholder="ค้นหาอาจารย์ด้วยชื่อ ตำแหน่ง หรือสาขาวิชา..."
                error={error}
              />
              
              <div className="alert alert-info mt-3 d-flex align-items-center">
                <i className="fas fa-info-circle me-2"></i>
                <div>
                  <strong>คำแนะนำ:</strong> คุณสามารถเลือกอาจารย์ผู้สอนได้หลายคน 
                  และสามารถค้นหาได้ด้วยชื่อ ตำแหน่ง หรือสาขาวิชา
                </div>
              </div>
            </div>
            <div className="modal-footer bg-light">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                <i className="fas fa-times me-2"></i>
                ยกเลิก
              </button>
              <button
                type="submit"
                className="btn btn-primary"
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
    console.log('handleAddInstructor called - WORKING!');
    setShowInstructorModal(true);
  };

  const handleInstructorsAdded = async (instructorIds: string[]) => {
    console.log('handleInstructorsAdded called - WORKING!: ', instructorIds);
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

  return (
    <>
      <div className="tab-panel instructors-panel">
        <div className="instructors-header">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="mb-1">
                <i className="fas fa-chalkboard-teacher me-2 text-primary"></i>
                อาจารย์ผู้สอน
              </h3>
              <p className="text-muted mb-0">
                รายชื่ออาจารย์ที่สอนในรายวิชา {currentSubject.subject_name}
              </p>
            </div>
            {currentSubject.instructors && currentSubject.instructors.length > 0 && (
              <button 
                className="btn btn-primary"
                onClick={handleAddInstructor}
                type="button"
              >
                <i className="fas fa-plus me-2"></i>
                เพิ่มอาจารย์
              </button>
            )}
          </div>
        </div>
        
        {!currentSubject.instructors || currentSubject.instructors.length === 0 ? (
          <div 
            className="empty-state text-center py-5"
            style={{
              position: 'relative',
              zIndex: 1,
              pointerEvents: 'auto'
            }}
          >
            <div className="empty-state-icon mb-4">
              <i className="fas fa-chalkboard-teacher fa-5x text-muted opacity-50"></i>
            </div>
            <h4 className="text-muted mb-3">ไม่มีอาจารย์ผู้สอน</h4>
            <p className="text-muted mb-4 lead">
              ยังไม่มีการกำหนดอาจารย์ผู้สอนสำหรับรายวิชานี้<br/>
              เริ่มต้นด้วยการเพิ่มอาจารย์ผู้สอนคนแรก
            </p>
            

            
            {/* Test Buttons with different approaches */}
            <div className="d-flex flex-column align-items-center gap-3">
              
              {/* Method 1: Direct onClick */}
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => {
                  console.log('Method 1: Direct onClick');
                  handleAddInstructor();
                }}
                type="button"
                style={{ 
                  minWidth: '300px',
                  fontSize: '16px',
                  fontWeight: '600',
                  position: 'relative',
                  zIndex: 10,
                  pointerEvents: 'auto'
                }}
              >
                               <i className="fas fa-user-plus me-2"></i>
                เพิ่มอาจารย์ผู้สอนคนแรก 
              </button>
              
          
            </div>
            
            {/* CSS Override Test */}
            <style >{`
              .empty-state * {
                pointer-events: auto !important;
                position: relative !important;
                z-index: 999 !important;
              }
              .empty-state button {
                pointer-events: auto !important;
                cursor: pointer !important;
              }
              .empty-state button:hover {
                opacity: 0.8 !important;
              }
            `}</style>
            
           
          </div>
        ) : (
          <div className="instructors-grid">
            {currentSubject.instructors.map((instructor) => (
              <div key={`instructor-${instructor.instructor_id}`} className="instructor-card">
                <div className="instructor-card-header">
                  <div className="instructor-avatar-wrapper">
                    <div className="instructor-avatar">
                      {instructor.avatar_file_id ? (
                        <img
                          src={`${apiURL}/api/accounts/instructors/avatar/${instructor.avatar_file_id}`}
                          alt={instructor.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80?text=No+Image';
                          }}
                        />
                      ) : instructor.avatar ? (
                        <img
                          src={`data:image/jpeg;base64,${instructor.avatar}`}
                          alt={instructor.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          <i className="fas fa-user"></i>
                        </div>
                      )}
                    </div>
                    <div className="instructor-status">
                      <span className={`status-dot ${instructor.status}`}></span>
                    </div>
                  </div>
                  
                  <div className="instructor-actions">
                    <Link
                      to={`/admin-instructors/edit/${instructor.instructor_id}`}
                      className="btn btn-sm btn-outline-primary"
                      title="แก้ไขข้อมูลอาจารย์"
                    >
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteInstructor(instructor.instructor_id)}
                      title="ลบออกจากรายวิชา"
                      type="button"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                
                <div className="instructor-card-body">
                  <h5 className="instructor-name">{instructor.name}</h5>
                  <p className="instructor-position">{instructor.position}</p>
                  {instructor.ranking_name && (
                    <span className="instructor-rank badge bg-secondary">
                      {instructor.ranking_name}
                    </span>
                  )}
                  {(instructor.description || instructor.bio) && (
                    <p className="instructor-description">
                      {((instructor.description || instructor.bio) || '').length > 100 
                        ? `${((instructor.description || instructor.bio) || '').substring(0, 100)}...`
                        : (instructor.description || instructor.bio)
                      }
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Instructor Modal */}
      {showInstructorModal && (
        <AddInstructorModal
          show={showInstructorModal}
          onClose={() => {
            console.log('Closing instructor modal');
            setShowInstructorModal(false);
          }}
          onSubmit={handleInstructorsAdded}
          subjectId={currentSubject.subject_id}
        />
      )}
      
      {/* Debug Modal State Indicator */}
      {showInstructorModal && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'green',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          zIndex: 9999,
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          ✅ MODAL IS OPEN!
        </div>
      )}
    </>
  );
};

export default InsSection;
