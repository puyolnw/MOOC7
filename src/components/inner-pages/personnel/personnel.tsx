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
    return matchesSearch;
  });

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

          <div className="row mb-50">
            <div className="col-lg-6 col-md-8 mb-4 mb-lg-0">
              <div className="personnel-search">
                <input 
                  type="text" 
                  placeholder="ค้นหาบุคลากร..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control personnel-search-input"
                />
                <button className="search-btn">
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>
            <div className="col-lg-6 col-md-12">
              <div className="personnel-filter">
                <span className="filter-label">กรองตามคณะ:</span>
                <div className="filter-buttons">
                  <button 
                    className={`filter-btn ${'all' === 'all' ? 'active' : ''}`} 
                    onClick={() => {}}
                  >
                    ทั้งหมด
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="row justify-content-center">
            {Object.entries(groupedByDepartment).map(([deptName, ranks], deptIndex) => (
              <React.Fragment key={deptIndex}>
                <div className="col-12">
                  <h3 className="department-title">{deptName}</h3>
                </div>
                {Object.entries(ranks)
                  .sort(([rankA], [rankB]) => {
                    const indexA = rankingOrder.indexOf(rankA);
                    const indexB = rankingOrder.indexOf(rankB);
                    return indexA - indexB;
                  })
                  .map(([_, rankInstructors], rankIndex) => (
                    rankInstructors.map((instructor, index) => (
                      <div 
                        key={instructor.instructor_id} 
                        className={`col-xl-4 col-lg-4 col-md-6 col-sm-10 mb-30 ${animateCards ? 'animate-in' : ''}`}
                        style={{ animationDelay: `${(deptIndex * Object.keys(ranks).length + rankIndex) * 0.1 + index * 0.1}s` }}
                      >
                        <div className="personnel-card">
                          <div className="personnel-card-inner">
                            <div className="personnel-card-front">
                              <div className="personnel-image">
                                <img src={instructor.avatar_file_id
                                  ? `${apiUrl}/api/accounts/instructors/avatar/${instructor.avatar_file_id}`
                                  : "public/assets/img/userdefault.png"
                                } alt={`${instructor.first_name} ${instructor.last_name}`} />
                                <div className="personnel-overlay">
                                  <button 
                                    className="view-profile-btn"
                                    onClick={() => openModal(instructor)}
                                  >
                                    ดูโปรไฟล์
                                  </button>
                                </div>
                              </div>
                              <div className="personnel-info">
                                <h4 className="personnel-name">{`${instructor.first_name} ${instructor.last_name}`}</h4>
                                <p className="personnel-position">{instructor.position || 'ไม่มีตำแหน่ง'}</p>
                                <p className="personnel-department">{instructor.department_name || 'ไม่มีภาควิชา'}</p>
                                <div className="personnel-faculty">
                                  <span>{instructor.department_name || 'ไม่มีข้อมูลคณะ'}</span>
                                </div>
                                <div className="personnel-contact">
                                  <button 
                                    className="contact-icon info-btn"
                                    onClick={() => openModal(instructor)}
                                  >
                                    <i className="fas fa-info-circle"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ))}
              </React.Fragment>
            ))}
            {filteredInstructors.length === 0 && (
              <div className="col-12 text-center mt-5 mb-5">
                <div className="no-results">
                  <i className="fas fa-search fa-3x mb-3"></i>
                  <h3>ไม่พบบุคลากรที่ค้นหา</h3>
                  <p>กรุณาลองค้นหาด้วยคำอื่น</p>
                  <button 
                    className="btn btn-primary mt-3"
                    onClick={() => setSearchTerm('')}
                  >
                    ดูบุคลากรทั้งหมด
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