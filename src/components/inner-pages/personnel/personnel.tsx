import React, { useState, useEffect } from 'react';

import './personnel.css'; // เราจะสร้างไฟล์ CSS เพิ่มเติม

// Mock data สำหรับบุคลากร
interface PersonnelType {
  id: number;
  name: string;
  position: string;
  department: string;
  faculty: string;
  email: string;
  phone: string;
  image: string;
  education: string[];
  expertise: string[];
  bio: string;
}

const personnelData: PersonnelType[] = [
  {
    id: 1,
    name: "รศ.ดร. สมชาย วิทยาศาสตร์",
    position: "คณบดี",
    department: "ภาควิชาวิทยาการคอมพิวเตอร์",
    faculty: "คณะวิทยาศาสตร์",
    email: "somchai.w@university.ac.th",
    phone: "02-123-4567",
    image: "/assets/img/courses/details_instructors01.jpg",
    education: [
      "ปริญญาเอก วิทยาการคอมพิวเตอร์ มหาวิทยาลัยชั้นนำ, 2545",
      "ปริญญาโท วิทยาการคอมพิวเตอร์ มหาวิทยาลัยชั้นนำ, 2540",
      "ปริญญาตรี วิทยาการคอมพิวเตอร์ มหาวิทยาลัยชั้นนำ, 2538"
    ],
    expertise: ["ปัญญาประดิษฐ์", "การเรียนรู้ของเครื่อง", "วิทยาการข้อมูล"],
    bio: "รศ.ดร. สมชาย เป็นผู้เชี่ยวชาญด้านปัญญาประดิษฐ์และการเรียนรู้ของเครื่อง มีประสบการณ์สอนและวิจัยมากกว่า 20 ปี เคยได้รับรางวัลนักวิจัยดีเด่นระดับชาติ"
  },
  {
    id: 2,
    name: "ผศ.ดร. วิภาดา สุขสันต์",
    position: "รองคณบดีฝ่ายวิชาการ",
    department: "ภาควิชาเทคโนโลยีสารสนเทศ",
    faculty: "คณะเทคโนโลยีสารสนเทศ",
    email: "wipada.s@university.ac.th",
    phone: "02-123-4568",
    image: "/assets/img/courses/details_instructors02.jpg",
    education: [
      "ปริญญาเอก เทคโนโลยีสารสนเทศ มหาวิทยาลัยชั้นนำ, 2548",
      "ปริญญาโท เทคโนโลยีสารสนเทศ มหาวิทยาลัยชั้นนำ, 2543",
      "ปริญญาตรี วิทยาการคอมพิวเตอร์ มหาวิทยาลัยชั้นนำ, 2541"
    ],
    expertise: ["ความมั่นคงปลอดภัยไซเบอร์", "เครือข่ายคอมพิวเตอร์", "การพัฒนาซอฟต์แวร์"],
    bio: "ผศ.ดร. วิภาดา มีความเชี่ยวชาญด้านความมั่นคงปลอดภัยไซเบอร์และเครือข่ายคอมพิวเตอร์ เป็นที่ปรึกษาให้กับหน่วยงานภาครัฐและเอกชนหลายแห่ง"
  },
  {
    id: 3,
    name: "ดร. ธนกฤต บริหารธุรกิจ",
    position: "หัวหน้าภาควิชา",
    department: "ภาควิชาการจัดการ",
    faculty: "คณะบริหารธุรกิจ",
    email: "thanakrit.b@university.ac.th",
    phone: "02-123-4569",
    image: "/assets/img/courses/details_instructors03.jpg",
    education: [
      "ปริญญาเอก บริหารธุรกิจ มหาวิทยาลัยชั้นนำ, 2550",
      "ปริญญาโท บริหารธุรกิจ มหาวิทยาลัยชั้นนำ, 2545",
      "ปริญญาตรี บริหารธุรกิจ มหาวิทยาลัยชั้นนำ, 2543"
    ],
    expertise: ["การจัดการเชิงกลยุทธ์", "การจัดการทรัพยากรมนุษย์", "ภาวะผู้นำ"],
    bio: "ดร. ธนกฤต มีประสบการณ์ทำงานในภาคธุรกิจมากกว่า 15 ปีก่อนเข้าสู่วงการการศึกษา เป็นที่ปรึกษาให้กับบริษัทชั้นนำหลายแห่ง"
  },
  {
    id: 4,
    name: "รศ. นภาพร ศิลปศาสตร์",
    position: "อาจารย์ประจำ",
    department: "ภาควิชาภาษาอังกฤษ",
    faculty: "คณะมนุษยศาสตร์และสังคมศาสตร์",
    email: "napaporn.s@university.ac.th",
    phone: "02-123-4570",
    image: "/assets/img/courses/details_instructors04.jpg",
    education: [
      "ปริญญาโท ภาษาอังกฤษ มหาวิทยาลัยชั้นนำ, 2542",
      "ปริญญาตรี ภาษาอังกฤษ มหาวิทยาลัยชั้นนำ, 2538"
    ],
    expertise: ["ภาษาอังกฤษเพื่อการสื่อสาร", "วรรณคดีอังกฤษ", "การแปล"],
    bio: "รศ. นภาพร เป็นผู้เชี่ยวชาญด้านภาษาอังกฤษและวรรณคดีอังกฤษ มีผลงานแปลที่ได้รับการตีพิมพ์หลายเล่ม"
  },
  {
    id: 5,
    name: "ผศ.ดร. กิตติพงษ์ วิศวกรรม",
    position: "อาจารย์ประจำ",
    department: "ภาควิชาวิศวกรรมไฟฟ้า",
    faculty: "คณะวิศวกรรมศาสตร์",
    email: "kittipong.w@university.ac.th",
    phone: "02-123-4571",
    image: "/assets/img/courses/details_instructors05.jpg",
    education: [
      "ปริญญาเอก วิศวกรรมไฟฟ้า มหาวิทยาลัยชั้นนำ, 2552",
      "ปริญญาโท วิศวกรรมไฟฟ้า มหาวิทยาลัยชั้นนำ, 2547",
      "ปริญญาตรี วิศวกรรมไฟฟ้า มหาวิทยาลัยชั้นนำ, 2545"
    ],
    expertise: ["ระบบควบคุมอัตโนมัติ", "อิเล็กทรอนิกส์กำลัง", "พลังงานทดแทน"],
    bio: "ผศ.ดร. กิตติพงษ์ มีความเชี่ยวชาญด้านระบบควบคุมอัตโนมัติและพลังงานทดแทน มีผลงานวิจัยที่ได้รับการตีพิมพ์ในวารสารระดับนานาชาติมากกว่า 30 บทความ"
  },
  {
    id: 6,
    name: "ดร. พิมพ์ชนก แพทย์ศาสตร์",
    position: "อาจารย์ประจำ",
    department: "ภาควิชาเวชศาสตร์ชุมชน",
    faculty: "คณะแพทยศาสตร์",
    email: "pimchanok.p@university.ac.th",
    phone: "02-123-4572",
    image: "/assets/img/courses/details_instructors06.jpg",
    education: [
      "แพทยศาสตร์บัณฑิต มหาวิทยาลัยชั้นนำ, 2545",
      "ปริญญาเอก สาธารณสุขศาสตร์ มหาวิทยาลัยชั้นนำ, 2553"
    ],
    expertise: ["เวชศาสตร์ชุมชน", "ระบาดวิทยา", "การส่งเสริมสุขภาพ"],
    bio: "ดร. พิมพ์ชนก เป็นแพทย์ผู้เชี่ยวชาญด้านเวชศาสตร์ชุมชนและระบาดวิทยา มีประสบการณ์ทำงานในพื้นที่ชนบทและเขตเมืองมากกว่า 15 ปี"
  }
];

// กำหนดคณะทั้งหมดจาก mock data
const faculties = Array.from(new Set(personnelData.map(person => person.faculty)));

const Personnel: React.FC = () => {
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [selectedPersonnel, setSelectedPersonnel] = useState<PersonnelType | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [animateCards, setAnimateCards] = useState<boolean>(false);

  // Effect สำหรับ animation เมื่อโหลดหน้า
  useEffect(() => {
    setAnimateCards(true);
  }, []);

  // กรองบุคลากรตามคณะที่เลือกและคำค้นหา
  const filteredPersonnel = personnelData.filter(person => {
    const matchesFaculty = selectedFaculty === 'all' || person.faculty === selectedFaculty;
    const matchesSearch = searchTerm === '' || 
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFaculty && matchesSearch;
  });

  // เปิด Modal และตั้งค่า body overflow
  const openModal = (person: PersonnelType) => {
    setSelectedPersonnel(person);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  // ปิด Modal และคืนค่า body overflow
  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
    setTimeout(() => {
      setSelectedPersonnel(null);
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

          {/* ส่วนค้นหาและกรอง */}
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
                    className={`filter-btn ${selectedFaculty === 'all' ? 'active' : ''}`} 
                    onClick={() => setSelectedFaculty('all')}
                  >
                    ทั้งหมด
                  </button>
                  {faculties.map((faculty, index) => (
                    <button 
                      key={index} 
                      className={`filter-btn ${selectedFaculty === faculty ? 'active' : ''}`}
                      onClick={() => setSelectedFaculty(faculty)}
                    >
                      {faculty}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* แสดงรายการบุคลากร */}
          <div className="row justify-content-center">
            {filteredPersonnel.length > 0 ? (
              filteredPersonnel.map((person, index) => (
                <div 
                  key={person.id} 
                  className={`col-xl-4 col-lg-4 col-md-6 col-sm-10 mb-30 ${animateCards ? 'animate-in' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="personnel-card">
                    <div className="personnel-card-inner">
                      <div className="personnel-card-front">
                        <div className="personnel-image">
                          <img src={person.image} alt={person.name} />
                          <div className="personnel-overlay">
                            <button 
                              className="view-profile-btn"
                              onClick={() => openModal(person)}
                            >
                              ดูโปรไฟล์
                            </button>
                          </div>
                        </div>
                        <div className="personnel-info">
                          <h4 className="personnel-name">{person.name}</h4>
                          <p className="personnel-position">{person.position}</p>
                          <p className="personnel-department">{person.department}</p>
                          <div className="personnel-faculty">
                            <span>{person.faculty}</span>
                          </div>
                          <div className="personnel-contact">
                            <a href={`mailto:${person.email}`} className="contact-icon">
                              <i className="fas fa-envelope"></i>
                            </a>
                            <a href={`tel:${person.phone}`} className="contact-icon">
                              <i className="fas fa-phone"></i>
                            </a>
                            <button 
                              className="contact-icon info-btn"
                              onClick={() => openModal(person)}
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
            ) : (
              <div className="col-12 text-center mt-5 mb-5">
                <div className="no-results">
                  <i className="fas fa-search fa-3x mb-3"></i>
                  <h3>ไม่พบบุคลากรที่ค้นหา</h3>
                  <p>กรุณาลองค้นหาด้วยคำอื่น หรือเลือกคณะอื่น</p>
                  <button 
                    className="btn btn-primary mt-3"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedFaculty('all');
                    }}
                  >
                    ดูบุคลากรทั้งหมด
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modal แสดงรายละเอียดบุคลากร */}
      {selectedPersonnel && (
        <div className={`personnel-modal-backdrop ${isModalOpen ? 'show' : ''}`} onClick={closeModal}>
          <div 
            className={`personnel-modal ${isModalOpen ? 'show' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="personnel-modal-header">
              <h3 className="modal-title">{selectedPersonnel.name}</h3>
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
                      <img src={selectedPersonnel.image} alt={selectedPersonnel.name} />
                    </div>
                    <div className="profile-info">
                      <div className="info-item">
                        <i className="fas fa-user-tie"></i>
                        <div>
                          <h6>ตำแหน่ง</h6>
                          <p>{selectedPersonnel.position}</p>
                        </div>
                      </div>
                      <div className="info-item">
                        <i className="fas fa-building"></i>
                        <div>
                          <h6>ภาควิชา</h6>
                          <p>{selectedPersonnel.department}</p>
                        </div>
                      </div>
                      <div className="info-item">
                        <i className="fas fa-university"></i>
                        <div>
                          <h6>คณะ</h6>
                          <p>{selectedPersonnel.faculty}</p>
                        </div>
                      </div>
                      <div className="info-item">
                        <i className="fas fa-envelope"></i>
                        <div>
                          <h6>อีเมล</h6>
                          <p><a href={`mailto:${selectedPersonnel.email}`}>{selectedPersonnel.email}</a></p>
                        </div>
                      </div>
                      <div className="info-item">
                        <i className="fas fa-phone"></i>
                        <div>
                          <h6>โทรศัพท์</h6>
                          <p><a href={`tel:${selectedPersonnel.phone}`}>{selectedPersonnel.phone}</a></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-8 col-md-7">
                  <div className="personnel-details">
                    <div className="details-section">
                      <div className="section-header">
                        <i className="fas fa-graduation-cap"></i>
                        <h5>ประวัติการศึกษา</h5>
                      </div>
                      <ul className="education-list">
                        {selectedPersonnel.education.map((edu, index) => (
                          <li key={index}>
                            <i className="fas fa-check-circle"></i>
                            <span>{edu}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="details-section">
                      <div className="section-header">
                        <i className="fas fa-star"></i>
                        <h5>ความเชี่ยวชาญ</h5>
                      </div>
                      <div className="expertise-tags">
                        {selectedPersonnel.expertise.map((exp, index) => (
                          <span key={index} className="expertise-tag">
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="details-section">
                      <div className="section-header">
                        <i className="fas fa-user"></i>
                        <h5>ประวัติโดยย่อ</h5>
                      </div>
                      <div className="bio-content">
                        <p>{selectedPersonnel.bio}</p>
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

