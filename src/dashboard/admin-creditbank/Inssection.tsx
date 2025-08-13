import { useState, useEffect } from 'react';
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
  currentInstructors: Instructor[];
}> = ({ show, onClose, onSubmit, subjectId, currentInstructors }) => {
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      setSelectedInstructors([]);
      setError('');
    }
  }, [show]);

  const handleSubmit = async () => {
    if (selectedInstructors.length === 0) {
      setError('กรุณาเลือกอาจารย์ผู้สอนอย่างน้อย 1 คน');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      // รวมอาจารย์เดิม + ใหม่ที่เลือก
      const existingInstructorIds = currentInstructors.map(inst => inst.instructor_id);
      const newInstructorIds = selectedInstructors.map(id => parseInt(id));
      const allInstructorIds = [...existingInstructorIds, ...newInstructorIds];
      
      const response = await axios.put(
        `${apiURL}/api/courses/subjects/${subjectId}`,
        { instructors: allInstructorIds },
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
          <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
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
              className="btn btn-secondary d-flex align-items-center me-3"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <i className="fas fa-times me-2"></i>
              ยกเลิก
            </button>
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center"
              onClick={handleSubmit}
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
        <i className="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
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
      <div className="instructors-panel">
        {/* Header Section */}
        <div className="instructors-header">
          <div className="header-content">
            <div className="header-text">
              <h2 className="panel-title">
                อาจารย์ผู้สอน
              </h2>
              <p className="panel-subtitle">
                รายชื่ออาจารย์ที่สอนในรายวิชา <span className="subject-name">{currentSubject.subject_name}</span>
              </p>
            </div>
            <button 
              className="add-instructor-btn"
              onClick={handleAddInstructor}
              type="button"
            >
              <i className="fas fa-plus"></i>
              <span>เพิ่มอาจารย์</span>
            </button>
          </div>
        </div>
        
        {/* Content Section */}
        {!currentSubject.instructors || currentSubject.instructors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-chalkboard-teacher"></i>
            </div>
            <h3>ยังไม่มีอาจารย์ผู้สอน</h3>
            <p>ยังไม่มีอาจารย์ที่ได้รับมอบหมายให้สอนในรายวิชานี้</p>
          </div>
        ) : (
          <div className="instructors-grid">
            {currentSubject.instructors.map((instructor) => (
              <div key={instructor.instructor_id} className="instructor-card">
                <div className="instructor-card-header">
                  <div className="instructor-main-info">
                    {renderInstructorAvatar(instructor)}
                    <div className="instructor-basic-info">
                      <h4 className="instructor-name">{instructor.name}</h4>
                      <p className="instructor-position">ตำแหน่ง : {instructor.position}</p>
                    </div>
                  </div>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteInstructor(instructor.instructor_id)}
                    title="ลบอาจารย์ผู้สอน"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="instructor-info">
                  {instructor.bio && (
                    <p className="instructor-bio">{instructor.bio}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Instructor Modal */}
      <AddInstructorModal
        show={showInstructorModal}
        onClose={() => setShowInstructorModal(false)}
        onSubmit={handleInstructorsAdded}
        subjectId={currentSubject.subject_id}
        currentInstructors={currentSubject.instructors || []}
      />

      {/* Custom Styles */}
      <style>{`
        .instructors-panel {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .instructors-header {
          background: #fff;
          padding: 2rem;
          color: #2d3748;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          flex-wrap: nowrap;
          flex-direction: row;
        }

        .header-text {
          flex: 1;
        }

        .panel-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #2d3748;
          flex-direction: column;
        }

        .panel-title i {
          font-size: 1.5rem;
          color: #667eea;
        }

        .panel-subtitle {
          font-size: 1rem;
          margin: 0;
          line-height: 1.5;
          color: #718096;
        }

        .subject-name {
          font-weight: 600;
          color: #667eea;
        }

        .add-instructor-btn {
          background: #69b168ff;
          border: 2px solid #7dcf8bff;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .add-instructor-btn:hover {
          background: #5a67d8;
          border-color: #5a67d8;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .add-instructor-btn i {
          font-size: 1rem;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #6c757d;
        }

        .empty-icon {
          font-size: 4rem;
          color: #dee2e6;
          margin-bottom: 1.5rem;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #495057;
        }

        .empty-state p {
          font-size: 1rem;
          margin-bottom: 2rem;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
          color: #6c757d;
        }

        /* Instructors Grid */
        .instructors-grid {
          padding: 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          max-height: 500px;
          overflow-y: auto;
        }

        .instructor-card {
          background: #fff;
          border: 1px solid #e9ecef;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .instructor-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          border-color: #667eea;
        }

        .instructor-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .instructor-avatar-wrapper {
          position: relative;
        }

        .instructor-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #e9ecef;
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
          display: flex;
          align-items: center;
          justify-content: center;
          background: #667eea;
          color: white;
          font-size: 2rem;
        }

        .instructor-status {
          position: absolute;
          bottom: 0;
          right: 0;
          background: white;
          border-radius: 50%;
          padding: 2px;
        }

        .instructor-main-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }

        .status-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: block;
        }

        .status-dot.active {
          background: #28a745;
        }

        .status-dot.inactive {
          background: #dc3545;
        }

        .delete-btn {
          background: #dc3545;
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          opacity: 0.7;
        }

        .delete-btn:hover {
          opacity: 1;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
        }

        .instructor-basic-info {
          flex: 1;
        }

        .instructor-basic-info .instructor-name {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 0 0.25rem 0;
          color: #2d3748;
          line-height: 1.3;
        }

        .instructor-basic-info .instructor-position {
          font-size: 1rem;
          font-weight: 500;
          color: #667eea;
          margin: 0;
        }

        /* Responsive สำหรับมือถือ */
        @media (max-width: 576px) {
          .instructor-main-info {
            gap: 0.75rem;
          }
          
          .instructor-basic-info .instructor-name {
            font-size: 1.125rem;
          }
          
          .instructor-basic-info .instructor-position {
            font-size: 0.875rem;
          }
        }

        .instructor-info {
          text-align: left;
        }

        .instructor-department {
          font-size: 0.875rem;
          color: #6c757d;
          margin: 0 0 0.75rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .instructor-department i {
          font-size: 0.75rem;
          opacity: 0.7;
        }

        .instructor-bio {
          font-size: 0.875rem;
          color: #6c757d;
          line-height: 1.5;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Modal Styles */
        .bg-gradient-primary {
          background: #667eea !important;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: stretch;
            gap: 1.5rem;
          }

          .add-instructor-btn {
            justify-content: center;
            width: 100%;
          }

          .instructors-grid {
            grid-template-columns: 1fr;
            padding: 1.5rem;
          }

          .instructors-header {
            padding: 1.5rem;
          }

          .panel-title {
            font-size: 1.5rem;
          }

          .empty-state {
            padding: 3rem 1.5rem;
          }
        }

        @media (max-width: 576px) {
          .instructor-card {
            padding: 1rem;
          }

          .instructor-avatar {
            width: 60px;
            height: 60px;
          }

          .instructor-name {
            font-size: 1.125rem;
          }

          .delete-btn {
            width: 28px;
            height: 28px;
          }
        }

        /* Notification Styles */
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          padding: 1rem 1.5rem;
          z-index: 9999;
          transform: translateX(400px);
          transition: all 0.3s ease;
          border-left: 4px solid #28a745;
        }

        .notification.error {
          border-left-color: #dc3545;
        }

        .notification.show {
          transform: translateX(0);
        }

        .notification-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #2d3748;
          font-weight: 500;
        }

        .notification-content i {
          font-size: 1.25rem;
        }

        .notification.success .notification-content i {
          color: #28a745;
        }

        .notification.error .notification-content i {
          color: #dc3545;
        }

        /* Animation */
        .instructor-card {
          animation: fadeInUp 0.5s ease-out;
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

        /* Loading States */
        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default InsSection;