import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../dashboard-common/AdminSidebar";
import DashboardBanner from "../dashboard-common/AdminBanner";

interface Course {
  id: number;
  coverImage: string;
  title: string;
  instructor: string;
  students: number;
  category: string;
  status: "active" | "inactive" | "draft";
  lessonCount: number; // Added lesson count field
  branch: string; // Added branch field
}

const sampleCourses: Course[] = [
    {
      id: 1,
      coverImage: "/assets/img/courses/course_thumb01.jpg",
      title: "การพัฒนาเว็บแอปพลิเคชันด้วย React",
      instructor: "อาจารย์สมชาย ใจดี",
      students: 120,
      category: "เทคโนโลยีสารสนเทศ",
      status: "active",
      lessonCount: 12,
      branch: "วิศวกรรมคอมพิวเตอร์",
    },
    {
      id: 2,
      coverImage: "/assets/img/courses/course_thumb02.jpg",
      title: "การวิเคราะห์ข้อมูลด้วย Python",
      instructor: "ดร.วิชัย นักวิจัย",
      students: 85,
      category: "วิทยาการข้อมูล",
      status: "active",
      lessonCount: 8,
      branch: "วิทยาการคอมพิวเตอร์",
    },
    {
      id: 3,
      coverImage: "/assets/img/courses/course_thumb03.jpg",
      title: "หลักการตลาดดิจิทัล",
      instructor: "รศ.ดร.มานี ธุรกิจ",
      students: 210,
      category: "บริหารธุรกิจ",
      status: "inactive",
      lessonCount: 10,
      branch: "บริหารธุรกิจ",
    },
    {
      id: 4,
      coverImage: "/assets/img/courses/course_thumb04.jpg",
      title: "ภาษาอังกฤษเพื่อการสื่อสารธุรกิจ",
      instructor: "อาจารย์แอนนา สมิท",
      students: 150,
      category: "ภาษา",
      status: "active",
      lessonCount: 15,
      branch: "ภาษาศาสตร์",
    },
    {
      id: 5,
      coverImage: "/assets/img/courses/course_thumb05.jpg",
      title: "การออกแบบกราฟิกสำหรับสื่อดิจิทัล",
      instructor: "อาจารย์ศิลปิน วาดเก่ง",
      students: 95,
      category: "ศิลปะและการออกแบบ",
      status: "draft",
      lessonCount: 9,
      branch: "ศิลปกรรมศาสตร์",
    },
    {
      id: 6,
      coverImage: "/assets/img/courses/course_thumb06.jpg",
      title: "การบริหารโครงการ",
      instructor: "ผศ.ดร.บริหาร จัดการ",
      students: 75,
      category: "บริหารธุรกิจ",
      status: "active",
      lessonCount: 7,
      branch: "บริหารธุรกิจ",
    },
    {
      id: 7,
      coverImage: "/assets/img/courses/course_thumb07.jpg",
      title: "การเขียนโปรแกรมเชิงวัตถุด้วย Java",
      instructor: "อาจารย์โปรแกรมเมอร์ เก่งมาก",
      students: 110,
      category: "เทคโนโลยีสารสนเทศ",
      status: "active",
      lessonCount: 14,
      branch: "วิศวกรรมซอฟต์แวร์",
    },
    {
      id: 8,
      coverImage: "/assets/img/courses/course_thumb08.jpg",
      title: "การบัญชีเบื้องต้น",
      instructor: "รศ.บัญชี การเงิน",
      students: 65,
      category: "บัญชีและการเงิน",
      status: "inactive",
      lessonCount: 11,
      branch: "บัญชี",
    },
  ];


  const AdminCreditbankArea = () => {
    const [courses, setCourses] = useState<Course[]>(sampleCourses);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
  
    const coursesPerPage = 10;
  
    const filteredCourses = courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  
    const handleDeleteCourse = (id: number) => {
      if (window.confirm("คุณต้องการลบหลักสูตรนี้ใช่หรือไม่?")) {
        setCourses(courses.filter((course) => course.id !== id));
      }
    };
  
    const StatusBadge = ({ status }: { status: Course["status"] }) => {
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
  
    // ✅ สถิติรวม
    const totalCourses = courses.length;
    const countByStatus = {
      active: courses.filter(c => c.status === "active").length,
      inactive: courses.filter(c => c.status === "inactive").length,
      draft: courses.filter(c => c.status === "draft").length,
    };
  
    return (
      <section className="dashboard__area section-pb-120 bg-red-1000 min-h-screen">
        <div className="container">
          <DashboardBanner />
          <div className="dashboard__inner-wrap">
            <div className="row">
              <DashboardSidebar />
              <div className="dashboard__content-area col-lg-9">
                <div className="dashboard__content-main">
                  <div className="dashboard__content-header mb-4">
                    <h2 className="title text-muted">รายชื่อหลักสูตร</h2>
                    <p className="desc">จัดการหลักสูตรทั้งหมดในระบบ</p>
                  </div>
  
                  {/* ✅ สถิติหลักสูตร */}
                  <div className="mb-3">
                    <div className="row g-3">
                      <div className="col-md-3">
                        <div className="bg-light rounded p-3 text-center">
                          <h6 className="mb-1 text-muted">จำนวนหลักสูตรทั้งหมด</h6>
                          <h5 className="mb-0">{totalCourses} รายวิชา</h5>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="bg-success-subtle rounded p-3 text-center">
                          <h6 className="mb-1 text-success">เปิดใช้งาน</h6>
                          <h5 className="mb-0">{countByStatus.active} รายวิชา</h5>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="bg-danger-subtle rounded p-3 text-center">
                          <h6 className="mb-1 text-danger">ปิดใช้งาน</h6>
                          <h5 className="mb-0">{countByStatus.inactive} รายวิชา</h5>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="bg-secondary-subtle rounded p-3 text-center">
                          <h6 className="mb-1 text-secondary">ฉบับร่าง</h6>
                          <h5 className="mb-0">{countByStatus.draft} รายวิชา</h5>
                        </div>
                      </div>
                    </div>
                  </div>
  
                  {/* 🔍 Search + เพิ่มหลักสูตร */}
                  <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <div className="input-group w-50">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="ค้นหาหลักสูตร..."
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
                    <Link to="/admin-creditbank/create-new" className="btn btn-primary">
                      <i className="fas fa-plus-circle me-2"></i>เพิ่มหลักสูตร
                    </Link>
                  </div>
  
                  <div className="card shadow-sm border-0">
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover table-sm mb-0 align-middle table-striped">
                          <thead className="table-light">
                            <tr>
                              <th style={{ width: "80px" }}>ภาพปก</th>
                              <th>ชื่อคอร์ส</th>
                              <th>จำนวนรายวิชา</th>
                              <th>ผู้ลงทะเบียน</th>
                              <th>สาขา</th>
                              <th>สถานะ</th>
                              <th style={{ width: "100px" }}>จัดการ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentCourses.length > 0 ? (
                              currentCourses.map((course) => (
                                <tr key={course.id}>
                                  <td>
                                    <img 
                                      src={course.coverImage} 
                                      alt={course.title}
                                      className="img-thumbnail"
                                      style={{ width: "60px", height: "60px", objectFit: "cover" }}
                                    />
                                  </td>
                                  <td>{course.title}</td>
                                  <td>{course.lessonCount} วิชา</td>
                                  <td>{course.students} คน</td>
                                  <td>{course.branch}</td>
                                  <td><StatusBadge status={course.status} /></td>
                                  <td>
                                    <div className="d-flex justify-content-center gap-3">
                                      <Link to={`/admin-creditbank/edit-course/${course.id}`} className="text-primary">
                                        <i className="fas fa-edit icon-action"></i>
                                      </Link>
                                      <i
                                        className="fas fa-trash-alt text-danger icon-action"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleDeleteCourse(course.id)}
                                      ></i>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={7} className="text-center py-4">ไม่พบข้อมูลหลักสูตร</td>
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
                            แสดง {indexOfFirstCourse + 1} ถึง {Math.min(indexOfLastCourse, filteredCourses.length)} จากทั้งหมด {filteredCourses.length} รายการ
                          </p>
                        </nav>
                      </div>
                    )}
                  </div>
  
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };
  
  export default AdminCreditbankArea;

