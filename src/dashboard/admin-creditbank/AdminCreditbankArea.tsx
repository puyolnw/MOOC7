import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../dashboard-common/AdminSidebar";
import DashboardBanner from "../dashboard-common/AdminBanner";
import axios from "axios";

interface Course {
  course_id: number;
  cover_image: string;
  title: string;
  subject_count: number;
  students?: number; // จำนวนผู้ลงทะเบียน (อาจต้องคำนวณจาก API อื่น)
  category: string;
  status: "active" | "inactive" | "draft";
  branch?: string; // อาจไม่มีในข้อมูลจาก API
}

const AdminCreditbankArea = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiURL = import.meta.env.VITE_API_URL;
  const coursesPerPage = 10;

  // ดึงข้อมูลหลักสูตรทั้งหมด
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiURL}/api/courses`);

        if (response.data.success) {
          // แปลงข้อมูลจาก API ให้ตรงกับ interface Course
          const formattedCourses = response.data.courses.map((course: any) => ({
            course_id: course.course_id,
            cover_image: course.cover_image ? `${apiURL}/${course.cover_image.replace(/\\/g, '/')}` : "/assets/img/courses/course_thumb01.jpg",
            title: course.title,
            subject_count: course.subject_count || 0,
            students: 0, // ค่าเริ่มต้น (อาจต้องดึงจาก API อื่น)
            category: course.category || "ไม่ระบุหมวดหมู่",
            status: course.status || "active",
            branch: "ไม่ระบุสาขา" // ค่าเริ่มต้น
          }));

          setCourses(formattedCourses);
        } else {
          setError("ไม่สามารถดึงข้อมูลหลักสูตรได้");
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูลหลักสูตร");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [apiURL]);

  // ลบหลักสูตร
  const handleDeleteCourse = async (id: number) => {
    if (window.confirm("คุณต้องการลบหลักสูตรนี้ใช่หรือไม่?")) {
      try {
        const response = await axios.delete(`${apiURL}/api/courses/${id}`, {
          withCredentials: true // ส่ง cookies สำหรับการยืนยันตัวตน
        });

        if (response.data.success) {
          // อัปเดตรายการหลักสูตรหลังจากลบสำเร็จ
          setCourses(courses.filter((course) => course.course_id !== id));
          alert("ลบหลักสูตรสำเร็จ");
        } else {
          alert(response.data.message || "ไม่สามารถลบหลักสูตรได้");
        }
      } catch (err: any) {
        console.error("Error deleting course:", err);
        alert(err.response?.data?.message || "เกิดข้อผิดพลาดในการลบหลักสูตร");
      }
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

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

  // สถิติรวม
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

                {/* สถิติหลักสูตร */}
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

                {/* Search + เพิ่มหลักสูตร */}
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

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">กำลังโหลดข้อมูล...</p>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                ) : (
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
                                <tr key={course.course_id}>
                                  <td>
                                    <img
                                      src={course.cover_image}
                                      alt={course.title}
                                      className="img-thumbnail"
                                      style={{ width: "60px", height: "60px", objectFit: "cover" }}
                                      onError={(e) => {
                                        // ถ้าโหลดรูปไม่สำเร็จ ใช้รูปเริ่มต้น
                                        (e.target as HTMLImageElement).src = "/assets/img/courses/course_thumb01.jpg";
                                      }}
                                    />
                                  </td>
                                  <td>{course.title}</td>
                                  <td>{course.subject_count} วิชา</td>
                                  <td>{course.students || 0} คน</td>
                                  <td>{course.branch || "ไม่ระบุสาขา"}</td>
                                  <td><StatusBadge status={course.status} /></td>
                                  <td>
                                    <div className="d-flex justify-content-center gap-3">
                                      <Link to={`/admin-creditbank/edit-course/${course.course_id}`} className="text-primary"
                                        style={{ display: "inline-flex", alignItems: "center" }}
                                      >
                                        <i className="fas fa-edit icon-action" style={{ lineHeight: 1 }}></i>
                                      </Link>
                                      <i
                                        className="fas fa-trash-alt text-danger icon-action"
                                        style={{ cursor: "pointer", lineHeight: 1 }}
                                        onClick={() => handleDeleteCourse(course.course_id)}
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminCreditbankArea;