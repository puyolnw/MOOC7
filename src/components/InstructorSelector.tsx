import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InstructorSelector.css';

interface Instructor {
  instructor_id: number;
  name: string;
  position: string;
  department_name: string;
  avatar_file_id: string | null;
  status: string;
  ranking_name?: string;
}

interface InstructorSelectorProps {
  selectedInstructors: string[];
  onInstructorsChange: (instructors: string[]) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

const InstructorSelector: React.FC<InstructorSelectorProps> = ({
  selectedInstructors,
  onInstructorsChange,
  label = "อาจารย์ผู้สอน",
  placeholder = "ค้นหาและเลือกอาจารย์ผู้สอน",
  error
}) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [availableInstructors, setAvailableInstructors] = useState<Instructor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/accounts/instructors`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setAvailableInstructors(response.data.instructors || []);
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInstructors = availableInstructors.filter(instructor => {
    if (!instructor || !instructor.instructor_id) return false;
    
    if (selectedInstructors.includes(instructor.instructor_id.toString())) return false;
    
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const name = (instructor.name || '').toLowerCase();
    const position = (instructor.position || '').toLowerCase();
    const department = (instructor.department_name || '').toLowerCase();
    
    return name.includes(searchLower) || 
           position.includes(searchLower) || 
           department.includes(searchLower);
  });

  const selectedInstructorObjects = availableInstructors.filter(instructor =>
    instructor && selectedInstructors.includes(instructor.instructor_id.toString())
  );

  const handleSelectInstructor = (instructorId: string) => {
    if (!selectedInstructors.includes(instructorId)) {
      onInstructorsChange([...selectedInstructors, instructorId]);
    }
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleRemoveInstructor = (instructorId: string) => {
    onInstructorsChange(selectedInstructors.filter(id => id !== instructorId));
  };

  return (
    <div className="instructor-selector">
      <label className="form-label fw-bold mb-3">
        <i className="fas fa-users me-2"></i>
        {label}
      </label>
      
      {/* Selected Instructors */}
      {selectedInstructorObjects.length > 0 && (
        <div className="selected-instructors-section mb-4">
          <div className="selected-instructors-header">
            <h6 className="mb-2">
              <i className="fas fa-check-circle me-2 text-success"></i>
              อาจารย์ที่เลือกแล้ว ({selectedInstructorObjects.length} คน)
            </h6>
          </div>
          <div className="selected-instructors-grid">
            {selectedInstructorObjects.map((instructor) => (
              <div key={instructor.instructor_id} className="selected-instructor-card">
                <div className="selected-instructor-avatar">
                  {instructor.avatar_file_id ? (
                    <img
                      src={`${apiUrl}/api/accounts/instructors/avatar/${instructor.avatar_file_id}`}
                      alt={instructor.name || 'อาจารย์'}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50x50?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      <i className="fas fa-user"></i>
                    </div>
                  )}
                </div>
                <div className="selected-instructor-info">
                  <h6 className="instructor-name">{instructor.name || 'ไม่ระบุชื่อ'}</h6>
                  <p className="instructor-position">{instructor.position || 'ไม่ระบุตำแหน่ง'}</p>
                  <small className="instructor-department">{instructor.department_name || 'ไม่ระบุสาขา'}</small>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger remove-btn"
                  onClick={() => handleRemoveInstructor(instructor.instructor_id.toString())}
                  title="ลบออกจากรายการ"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Section */}
      <div className="search-section">
        <h6 className="mb-2">
          <i className="fas fa-search me-2"></i>
          ค้นหาอาจารย์เพิ่มเติม
        </h6>
        <div className="position-relative">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className={`form-control ${error ? 'is-invalid' : ''}`}
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
          </div>
          
          {/* Dropdown */}
          {showDropdown && (
            <div className="instructor-dropdown">
              {loading ? (
                <div className="dropdown-loading">
                  <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                  กำลังโหลดข้อมูลอาจารย์...
                </div>
              ) : filteredInstructors.length > 0 ? (
                <div className="instructor-list">
                  <div className="dropdown-header">
                    <small className="text-muted">
                      พบ {filteredInstructors.length} คน - คลิกเพื่อเลือก
                    </small>
                  </div>
                  {filteredInstructors.map((instructor) => (
                    <div
                      key={instructor.instructor_id}
                      className="instructor-option"
                      onClick={() => handleSelectInstructor(instructor.instructor_id.toString())}
                    >
                      <div className="instructor-option-avatar">
                        {instructor.avatar_file_id ? (
                          <img
                            src={`${apiUrl}/api/accounts/instructors/avatar/${instructor.avatar_file_id}`}
                            alt={instructor.name || 'อาจารย์'}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            <i className="fas fa-user"></i>
                          </div>
                        )}
                      </div>
                      <div className="instructor-option-info">
                        <h6 className="instructor-option-name">{instructor.name || 'ไม่ระบุชื่อ'}</h6>
                        <p className="instructor-option-position">{instructor.position || 'ไม่ระบุตำแหน่ง'}</p>
                        <small className="instructor-option-department">{instructor.department_name || 'ไม่ระบุสาขา'}</small>
                      </div>
                      <div className="instructor-option-status">
                        <span className={`badge ${instructor.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                          {instructor.status === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                        </span>
                      </div>
                      <div className="instructor-option-action">
                        <i className="fas fa-plus-circle text-primary"></i>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <div className="no-results-icon">
                    <i className="fas fa-search"></i>
                  </div>
                  <div className="no-results-text">
                    <h6>ไม่พบอาจารย์ที่ตรงกับการค้นหา</h6>
                    <p>ลองใช้คำค้นหาอื่น หรือตรวจสอบการสะกดคำ</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {error && <div className="invalid-feedback">{error}</div>}
        </div>

        <div className="search-help mt-2">
          <small className="text-muted">
            <i className="fas fa-lightbulb me-1"></i>
            ค้นหาด้วยชื่อ ตำแหน่ง หรือสาขาวิชา
          </small>
        </div>
      </div>
    </div>
  );
};

export default InstructorSelector;
