import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './personnel.css';

interface InstructorType {
  instructor_id: number;
  first_name: string;
  last_name: string;
  position: string;
  avatar_path: string;
  avatar_file_id: string | null;
  description: string | null;
  ranking_name: string | null;
  department: number | null;
  department_name: string | null;
  subject_count: string;
}

const Personnel: React.FC = () => {
  const [instructors, setInstructors] = useState<InstructorType[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<InstructorType | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [animateCards, setAnimateCards] = useState<boolean>(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  // กำหนดลำดับ ranking ที่ต้องการให้แสดง (จากบนลงล่าง)
  const rankingOrder = ['ศาสตราจารย์', 'รองศาสตราจารย์', 'ผู้ช่วยศาสตราจารย์', 'อาจารย์', 'ไม่มียศ'];

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/accounts/instructors/public`);
        if (response.data.success) {
          setInstructors(response.data.instructors);
        }
      } catch (error) {
        console.error('Error fetching instructors:', error);
      }
    };
    fetchInstructors();
    setAnimateCards(true);
  }, [apiUrl]);

  const filteredInstructors = instructors.filter(instructor => {
    const fullName = `${instructor.first_name} ${instructor.last_name}`.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      fullName.includes(searchTerm.toLowerCase()) ||
      (instructor.position || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (instructor.department_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || 
      instructor.department_name === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  // สร้างรายการคณะที่ไม่ซ้ำ
  const uniqueDepartments = Array.from(new Set(instructors.map(instructor => 
    instructor.department_name || 'ไม่มีภาควิชา'
  ))).sort();

  const groupedByDepartment = filteredInstructors.reduce((acc, instructor) => {
    const deptName = instructor.department_name || 'ไม่มีภาควิชา';
    if (!acc[deptName]) acc[deptName] = {};
    const rankName = instructor.ranking_name || 'ไม่มียศ';
    if (!acc[deptName][rankName]) acc[deptName][rankName] = [];
    acc[deptName][rankName].push(instructor);
    return acc;
  }, {} as { [key: string]: { [key: string]: InstructorType[] } });

  const openModal = (instructor: InstructorType) => {
    setSelectedInstructor(instructor);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
    setTimeout(() => {
      setSelectedInstructor(null);
    }, 300);
  };

  return (
    <>
      <section className="personnel-area section-py-120">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section__title text-center mb-50">
                <span className="sub-title">ทีมงานของเรา</span>
                <h2 className="title">บุคลากรของมหาวิทยาลัย</h2>
                <p className="section-desc">
                  มหาวิทยาลัยของเรามีบุคลากรที่มีความเชี่ยวชาญในสาขาต่างๆ <br />
                  พร้อมให้ความรู้และประสบการณ์แก่นักศึกษา
                </p>
              </div>
            </div>
          </div>

          {/* ส่วนค้นหาและกรองที่ปรับปรุงใหม่ */}
          <div className="row mb-50">
            <div className="col-12">
              <div className="modern-filter-section">
                <div className="row g-4">
                  <div className="col-lg-5 col-md-6">
                    <div className="search-container">
                      <div className="search-input-wrapper">
                        <i className="fas fa-search search-icon"></i>
                        <input 
                          type="text" 
                          placeholder="ค้นหาชื่อ, ตำแหน่ง, หรือภาควิชา..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="modern-search-input"
                        />
                        {searchTerm && (
                          <button 
                            className="clear-search-btn"
                            onClick={() => setSearchTerm('')}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-4 col-md-6">
                    <div className="department-filter">
                      <select 
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="modern-select"
                      >
                        <option value="all">ทุกคณะ</option>
                        {uniqueDepartments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                      <i className="fas fa-chevron-down select-arrow"></i>
                    </div>
                  </div>
                  
                  <div className="col-lg-3 col-md-12">
                    <div className="filter-summary">
                      <div className="result-count">
                        <i className="fas fa-users"></i>
                        <span>พบ {filteredInstructors.length} คน</span>
                      </div>
                      {(searchTerm || selectedDepartment !== 'all') && (
                        <button 
                          className="clear-all-btn"
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedDepartment('all');
                          }}
                        >
                          <i className="fas fa-undo"></i>
                          รีเซ็ต
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ส่วนแสดงผลการ์ดที่ปรับปรุงใหม่ */}
          <div className="personnel-grid">
            {selectedDepartment === 'all' ? (
              // แสดงแบบแยกตามคณะ
              Object.entries(groupedByDepartment).map(([deptName, ranks], deptIndex) => (
                <div key={deptIndex} className="department-section">
                  <div className="department-header">
                    <div className="department-title-wrapper">
                      <h3 className="department-title">
                        <i className="fas fa-building"></i>
                        {deptName}
                      </h3>
                      <div className="department-count">
                        {Object.values(ranks).reduce((total, instructors) => total + instructors.length, 0)} คน
                      </div>
                    </div>
                  </div>
                  
                  <div className="row g-4">
                    {Object.entries(ranks)
                      .sort(([rankA], [rankB]) => {
                        const indexA = rankingOrder.indexOf(rankA);
                        const indexB = rankingOrder.indexOf(rankB);
                        return indexA - indexB;
                      })
                      .map(([_, rankInstructors]) => (
                        rankInstructors.map((instructor, index) => (
                          <div 
                            key={instructor.instructor_id} 
                            className={`col-xl-4 col-lg-6 col-md-6 ${animateCards ? 'animate-in' : ''}`}
                            style={{ animationDelay: `${deptIndex * 0.1 + index * 0.05}s` }}
                          >
                            <div className="modern-personnel-card">
                              <div className="card-image">
                                <img src={instructor.avatar_file_id
                                  ? `${apiUrl}/api/accounts/instructors/avatar/${instructor.avatar_file_id}`
                                  : "/assets/img/userdefault.png"
                                } alt={`${instructor.first_name} ${instructor.last_name}`} />
                                <div className="card-overlay">
                                  <button 
                                    className="view-details-btn"
                                    onClick={() => openModal(instructor)}
                                  >
                                    <i className="fas fa-eye"></i>
                                    ดูรายละเอียด
                                  </button>
                                </div>
                                {instructor.ranking_name && instructor.ranking_name !== 'ไม่มียศ' && (
                                  <div className="rank-badge">
                                    {instructor.ranking_name}
                                  </div>
                                )}
                              </div>
                              
                              <div className="card-content">
                                <h4 className="instructor-name">
                                  {`${instructor.first_name} ${instructor.last_name}`}
                                </h4>
                                <p className="instructor-position">
                                  <i className="fas fa-user-tie"></i>
                                  {instructor.position || 'ไม่มีตำแหน่ง'}
                                </p>
                                <p className="instructor-department">
                                  <i className="fas fa-building"></i>
                                  {instructor.department_name || 'ไม่มีภาควิชา'}
                                </p>
                                
                                <div className="card-footer">
                                  <div className="subject-count">
                                    <i className="fas fa-book"></i>
                                    <span>{instructor.subject_count || 0} วิชา</span>
                                  </div>
                                  <button 
                                    className="info-btn"
                                    onClick={() => openModal(instructor)}
                                  >
                                    <i className="fas fa-info-circle"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ))}
                  </div>
                </div>
              ))
            ) : (
              // แสดงแบบ Grid ธรรมดาเมื่อกรองคณะ
              <div className="row g-4">
                {filteredInstructors.map((instructor, index) => (
                  <div 
                    key={instructor.instructor_id} 
                    className={`col-xl-4 col-lg-6 col-md-6 ${animateCards ? 'animate-in' : ''}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="modern-personnel-card">
                      <div className="card-image">
                        <img src={instructor.avatar_file_id
                          ? `${apiUrl}/api/accounts/instructors/avatar/${instructor.avatar_file_id}`
                          : "/assets/img/userdefault.png"
                        } alt={`${instructor.first_name} ${instructor.last_name}`} />
                        <div className="card-overlay">
                          <button 
                            className="view-details-btn"
                            onClick={() => openModal(instructor)}
                          >
                            <i className="fas fa-eye"></i>
                            ดูรายละเอียด
                          </button>
                        </div>
                        {instructor.ranking_name && instructor.ranking_name !== 'ไม่มียศ' && (
                          <div className="rank-badge">
                            {instructor.ranking_name}
                          </div>
                        )}
                      </div>
                      
                      <div className="card-content">
                        <h4 className="instructor-name">
                          {`${instructor.first_name} ${instructor.last_name}`}
                        </h4>
                        <p className="instructor-position">
                          <i className="fas fa-user-tie"></i>
                          {instructor.position || 'ไม่มีตำแหน่ง'}
                        </p>
                        <p className="instructor-department">
                          <i className="fas fa-building"></i>
                          {instructor.department_name || 'ไม่มีภาควิชา'}
                        </p>
                        
                        <div className="card-footer">
                          <div className="subject-count">
                            <i className="fas fa-book"></i>
                            <span>{instructor.subject_count || 0} วิชา</span>
                          </div>
                          <button 
                            className="info-btn"
                            onClick={() => openModal(instructor)}
                          >
                            <i className="fas fa-info-circle"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {filteredInstructors.length === 0 && (
              <div className="empty-state">
                <div className="empty-illustration">
                  <i className="fas fa-user-friends"></i>
                </div>
                <h3>ไม่พบบุคลากรที่ค้นหา</h3>
                <p>ลองใช้คำค้นหาอื่น หรือเปลี่ยนการกรองคณะ</p>
                <div className="empty-actions">
                  <button 
                    className="btn-reset"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedDepartment('all');
                    }}
                  >
                    <i className="fas fa-undo"></i>
                    รีเซ็ตการค้นหา
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {selectedInstructor && (
        <div className={`personnel-modal-backdrop ${isModalOpen ? 'show' : ''}`} onClick={closeModal}>
          <div 
            className={`personnel-modal ${isModalOpen ? 'show' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="personnel-modal-header">
              <h3 className="modal-title">{`${selectedInstructor.first_name} ${selectedInstructor.last_name}`}</h3>
              <button 
                type="button" 
                className="close-modal" 
                onClick={closeModal}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="personnel-modal-body">
              <div className="row">
                <div className="col-lg-4 col-md-5">
                  <div className="personnel-profile">
                    <div className="profile-image">
                      <img src={selectedInstructor.avatar_file_id
                        ? `${apiUrl}/api/accounts/instructors/avatar/${selectedInstructor.avatar_file_id}`
                        : "public/assets/img/userdefault.png"
                      } alt={`${selectedInstructor.first_name} ${selectedInstructor.last_name}`} />
                    </div>
                    <div className="profile-info">
                      <div className="info-item">
                        <i className="fas fa-user-tie"></i>
                        <div>
                          <h6>ตำแหน่ง</h6>
                          <p>{selectedInstructor.position || 'ไม่มีตำแหน่ง'}</p>
                        </div>
                      </div>
                      <div className="info-item">
                        <i className="fas fa-building"></i>
                        <div>
                          <h6>ภาควิชา</h6>
                          <p>{selectedInstructor.department_name || 'ไม่มีภาควิชา'}</p>
                        </div>
                      </div>
                      <div className="info-item">
                        <i className="fas fa-university"></i>
                        <div>
                          <h6>คณะ</h6>
                          <p>{selectedInstructor.department_name || 'ไม่มีข้อมูลคณะ'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-8 col-md-7">
                  <div className="personnel-details">
                    <div className="details-section">
                      <div className="section-header">
                        <i className="fas fa-user"></i>
                        <h5>ประวัติโดยย่อ</h5>
                      </div>
                      <div className="bio-content">
                        <p>{selectedInstructor.description || 'ไม่มีข้อมูลประวัติ'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="personnel-modal-footer">
              <button 
                type="button" 
                className="btn-close-modal" 
                onClick={closeModal}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Personnel;