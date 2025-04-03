import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../dashboard-common/AdminBanner";

// Define subject type
interface Subject {
  id: number;
  coverImage: string;
  title: string;
  instructor: string;
  students: number;
  category: string;
  status: "active" | "inactive" | "draft";
}

// Sample data for subjects
const sampleSubjects: Subject[] = [
  {
    id: 1,
    coverImage: "/assets/img/courses/course_thumb01.jpg",
    title: "การพัฒนาเว็บแอปพลิเคชันด้วย React",
    instructor: "อาจารย์สมชาย ใจดี",
    students: 120,
    category: "เทคโนโลยีสารสนเทศ",
    status: "active",
  },
  {
    id: 2,
    coverImage: "/assets/img/courses/course_thumb02.jpg",
    title: "การวิเคราะห์ข้อมูลด้วย Python",
    instructor: "ดร.วิชัย นักวิจัย",
    students: 85,
    category: "วิทยาการข้อมูล",
    status: "active",
  },
  {
    id: 3,
    coverImage: "/assets/img/courses/course_thumb03.jpg",
    title: "หลักการตลาดดิจิทัล",
    instructor: "รศ.ดร.มานี ธุรกิจ",
    students: 210,
    category: "บริหารธุรกิจ",
    status: "inactive",
  },
  {
    id: 4,
    coverImage: "/assets/img/courses/course_thumb04.jpg",
    title: "ภาษาอังกฤษเพื่อการสื่อสารธุรกิจ",
    instructor: "อาจารย์แอนนา สมิท",
    students: 150,
    category: "ภาษา",
    status: "active",
  },
  {
    id: 5,
    coverImage: "/assets/img/courses/course_thumb05.jpg",
    title: "การออกแบบกราฟิกสำหรับสื่อดิจิทัล",
    instructor: "อาจารย์ศิลปิน วาดเก่ง",
    students: 95,
    category: "ศิลปะและการออกแบบ",
    status: "draft",
  },
  {
    id: 6,
    coverImage: "/assets/img/courses/course_thumb06.jpg",
    title: "การบริหารโครงการ",
    instructor: "ผศ.ดร.บริหาร จัดการ",
    students: 75,
    category: "บริหารธุรกิจ",
    status: "active",
  },
  {
    id: 7,
    coverImage: "/assets/img/courses/course_thumb07.jpg",
    title: "การเขียนโปรแกรมเชิงวัตถุด้วย Java",
    instructor: "อาจารย์โปรแกรมเมอร์ เก่งมาก",
    students: 110,
    category: "เทคโนโลยีสารสนเทศ",
    status: "active",
  },
  {
    id: 8,
    coverImage: "/assets/img/courses/course_thumb08.jpg",
    title: "การบัญชีเบื้องต้น",
    instructor: "รศ.บัญชี การเงิน",
    students: 65,
    category: "บัญชีและการเงิน",
    status: "inactive",
  },
];

const SubjectsArea = () => {
  const [subjects, setSubjects] = useState<Subject[]>(sampleSubjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const closeModal = () => setModalImage(null);

  const subjectsPerPage = 10;

  // Filter subjects based on search term
  const filteredSubjects = subjects.filter(subject =>
    subject.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastSubject = currentPage * subjectsPerPage;
  const indexOfFirstSubject = indexOfLastSubject - subjectsPerPage;
  const currentSubjects = filteredSubjects.slice(indexOfFirstSubject, indexOfLastSubject);
  const totalPages = Math.ceil(filteredSubjects.length / subjectsPerPage);

  // Handle delete subject
  const handleDeleteSubject = (id: number) => {
    if (window.confirm("คุณต้องการลบรายวิชานี้ใช่หรือไม่?")) {
      setSubjects(subjects.filter(subject => subject.id !== id));
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: Subject["status"] }) => {
    let badgeClass = "";
    let statusText = "";

    switch (status) {
      case "active":
        badgeClass = "badge bg-success-subtle text-success rounded-pill px-3 py-1 small";
        statusText = "เปิดใช้งาน";
        break;
      case "inactive":
        badgeClass = "badge bg-danger-subtle text-danger rounded-pill px-3 py-1 small";
        statusText = "ปิดใช้งาน";
        break;
      case "draft":
        badgeClass = "badge bg-secondary-subtle text-secondary rounded-pill px-3 py-1 small";
        statusText = "ฉบับร่าง";
        break;
    }

    return <span className={badgeClass}>{statusText}</span>;
  };

  // Statistics
  const totalSubjects = subjects.length;
  const countByStatus = {
    active: subjects.filter(s => s.status === "active").length,
    inactive: subjects.filter(s => s.status === "inactive").length,
    draft: subjects.filter(s => s.status === "draft").length,
  };

  return (
    <section className="dashboard__area section-pb-120">
      <div className="container">
        <DashboardBanner />
        <div className="dashboard__inner-wrap">
          <div className="row">
            <DashboardSidebar />
            <div className="dashboard__content-area col-lg-9">
              <div className="dashboard__content-main">
                <div className="dashboard__content-header mb-4">
                  <h2 className="title text-muted">รายการวิชา</h2>
                  <p className="desc">จัดการรายวิชาทั้งหมดในระบบ</p>
                </div>

                {/* Statistics */}
                <div className="mb-4">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <div className="bg-light rounded p-3 text-center">
                        <h6 className="mb-1 text-muted">วิชาทั้งหมด</h6>
                        <h5 className="mb-0">{totalSubjects} วิชา</h5>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="bg-success-subtle rounded p-3 text-center">
                        <h6 className="mb-1 text-success">เปิดใช้งาน</h6>
                        <h5 className="mb-0">{countByStatus.active} วิชา</h5>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="bg-danger-subtle rounded p-3 text-center">
                        <h6 className="mb-1 text-danger">ปิดใช้งาน</h6>
                        <h5 className="mb-0">{countByStatus.inactive} วิชา</h5>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="bg-secondary-subtle rounded p-3 text-center">
                        <h6 className="mb-1 text-secondary">ฉบับร่าง</h6>
                        <h5 className="mb-0">{countByStatus.draft} วิชา</h5>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search and Add button */}
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <div className="input-group w-50">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ค้นหารายวิชา..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                    <button className="btn btn-outline-secondary" type="button">
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                  <Link to="/admin-subjects/add-subject" className="btn btn-primary">
                    <i className="fas fa-plus-circle me-2"></i>เพิ่มรายวิชา
                  </Link>
                </div>

                {/* Subjects table */}
                <div className="card shadow-sm border-0">
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover table-sm mb-0 align-middle table-striped">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: "80px" }}>รูปปก</th>
                            <th>ชื่อวิชา</th>
                            <th>ผู้สอน</th>
                            <th>นักเรียน</th>
                            <th>หมวดหมู่</th>
                            <th>สถานะ</th>
                            <th style={{ width: "100px" }}>จัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentSubjects.length > 0 ? (
                            currentSubjects.map((subject) => (
                              <tr key={subject.id}>
                                <td>
                                  <img
                                    src={subject.coverImage}
                                    alt={subject.title}
                                    className="img-thumbnail"
                                    style={{ width: "70px", height: "50px", objectFit: "cover", cursor: "pointer" }}
                                    onClick={() => setModalImage(subject.coverImage)}
                                  />
                                </td>
                                <td>{subject.title}</td>
                                <td>{subject.instructor}</td>
                                <td>{subject.students}</td>
                                <td>{subject.category}</td>
                                <td><StatusBadge status={subject.status} /></td>
                                <td>
                                  <div className="d-flex justify-content-center gap-3">
                                    <Link to={`/admin-subjects/edit-subject/${subject.id}`} className="text-primary">
                                      <i className="fas fa-edit icon-action"></i>
                                    </Link>
                                    <i
                                      className="fas fa-trash-alt text-danger icon-action"
                                      style={{ cursor: "pointer" }}
                                      onClick={() => handleDeleteSubject(subject.id)}
                                    ></i>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="text-center py-4">ไม่พบข้อมูลรายวิชา</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {totalPages > 1 && (
                    <div className="card-footer bg-light text-center">
                      <nav aria-label="Page navigation">
                        <ul className="pagination justify-content-center mb-0">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              <i className="fas fa-chevron-left"></i>
                            </button>
                          </li>
                          {Array.from({ length: totalPages }).map((_, index) => (
                            <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                              <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
                                {index + 1}
                              </button>
                            </li>
                          ))}
                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              <i className="fas fa-chevron-right"></i>
                            </button>
                          </li>
                        </ul>
                        <p className="mt-2 mb-0 small text-muted">
                          แสดง {indexOfFirstSubject + 1} ถึง {Math.min(indexOfLastSubject, filteredSubjects.length)} จากทั้งหมด {filteredSubjects.length} รายการ
                        </p>
                      </nav>
                    </div>
                  )}
                </div>

                           {/* Modal ภาพ */}
                           {modalImage && (
                  <div
                    className="modal-image"
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      width: "100vw",
                      height: "100vh",
                      backgroundColor: "rgba(0,0,0,0.6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 1050,
                    }}
                    onClick={closeModal}
                  >
                    <img
                      src={modalImage}
                      alt="Subject"
                      style={{
                        maxHeight: "90%",
                        maxWidth: "90%",
                        borderRadius: "10px",
                        boxShadow: "0 0 20px rgba(255,255,255,0.2)",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubjectsArea;

