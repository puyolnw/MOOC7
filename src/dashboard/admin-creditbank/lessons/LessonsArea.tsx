import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../dashboard-common/AdminBanner";

// Define test type
type TestType = "MC" | "TF" | "SC" | "FB" | null;

// Define lesson type
interface Lesson {
  id: number;
  title: string;
  hasVideo: boolean;
  creator: string;
  courseCode: string;
  courseName: string;
  status: "active" | "inactive" | "draft";
  testType: TestType;
}

// Sample data for lessons
const sampleLessons: Lesson[] = [
  {
    id: 1,
    title: "แนะนำการใช้งาน React Hooks",
    hasVideo: true,
    creator: "อาจารย์สมชาย ใจดี",
    courseCode: "CS101",
    courseName: "การพัฒนาเว็บแอปพลิเคชันด้วย React",
    status: "active",
    testType: "MC",
  },
  {
    id: 2,
    title: "การสร้าง Component ใน React",
    hasVideo: true,
    creator: "อาจารย์สมชาย ใจดี",
    courseCode: "CS101",
    courseName: "การพัฒนาเว็บแอปพลิเคชันด้วย React",
    status: "active",
    testType: "TF",
  },
  {
    id: 3,
    title: "การจัดการ State และ Props",
    hasVideo: true,
    creator: "อาจารย์สมชาย ใจดี",
    courseCode: "CS101",
    courseName: "การพัฒนาเว็บแอปพลิเคชันด้วย React",
    status: "active",
    testType: "SC",
  },
  {
    id: 4,
    title: "การวิเคราะห์ข้อมูลเบื้องต้นด้วย Python",
    hasVideo: true,
    creator: "ดร.วิชัย นักวิจัย",
    courseCode: "DS201",
    courseName: "การวิเคราะห์ข้อมูลด้วย Python",
    status: "active",
    testType: "FB",
  },
  {
    id: 5,
    title: "การใช้งาน Pandas สำหรับจัดการข้อมูล",
    hasVideo: true,
    creator: "ดร.วิชัย นักวิจัย",
    courseCode: "DS201",
    courseName: "การวิเคราะห์ข้อมูลด้วย Python",
    status: "active",
    testType: "MC",
  },
  {
    id: 6,
    title: "การสร้างแบบจำลองด้วย Scikit-learn",
    hasVideo: false,
    creator: "ดร.วิชัย นักวิจัย",
    courseCode: "DS201",
    courseName: "การวิเคราะห์ข้อมูลด้วย Python",
    status: "draft",
    testType: null,
  },
  {
    id: 7,
    title: "หลักการตลาดดิจิทัลเบื้องต้น",
    hasVideo: true,
    creator: "รศ.ดร.มานี ธุรกิจ",
    courseCode: "MK301",
    courseName: "หลักการตลาดดิจิทัล",
    status: "active",
    testType: "TF",
  },
  {
    id: 8,
    title: "การวิเคราะห์พฤติกรรมผู้บริโภคออนไลน์",
    hasVideo: true,
    creator: "รศ.ดร.มานี ธุรกิจ",
    courseCode: "MK301",
    courseName: "หลักการตลาดดิจิทัล",
    status: "active",
    testType: "SC",
  },
  {
    id: 9,
    title: "กลยุทธ์การตลาดบนสื่อสังคมออนไลน์",
    hasVideo: false,
    creator: "รศ.ดร.มานี ธุรกิจ",
    courseCode: "MK301",
    courseName: "หลักการตลาดดิจิทัล",
    status: "inactive",
    testType: "FB",
  },
  {
    id: 10,
    title: "การวางแผนแคมเปญการตลาดดิจิทัล",
    hasVideo: false,
    creator: "รศ.ดร.มานี ธุรกิจ",
    courseCode: "MK301",
    courseName: "หลักการตลาดดิจิทัล",
    status: "draft",
    testType: null,
  },
  {
    id: 11,
    title: "ไวยากรณ์ภาษาอังกฤษสำหรับการสื่อสารธุรกิจ",
    hasVideo: true,
    creator: "อาจารย์แอนนา สมิท",
    courseCode: "EN202",
    courseName: "ภาษาอังกฤษเพื่อการสื่อสารธุรกิจ",
    status: "active",
    testType: "MC",
  },
  {
    id: 12,
    title: "การเขียนอีเมลธุรกิจภาษาอังกฤษ",
    hasVideo: true,
    creator: "อาจารย์แอนนา สมิท",
    courseCode: "EN202",
    courseName: "ภาษาอังกฤษเพื่อการสื่อสารธุรกิจ",
    status: "active",
    testType: "FB",
  },
  {
    id: 13,
    title: "การนำเสนองานเป็นภาษาอังกฤษ",
    hasVideo: false,
    creator: "อาจารย์แอนนา สมิท",
    courseCode: "EN202",
    courseName: "ภาษาอังกฤษเพื่อการสื่อสารธุรกิจ",
    status: "inactive",
    testType: "SC",
  },
  {
    id: 14,
    title: "หลักการออกแบบกราฟิก",
    hasVideo: true,
    creator: "อาจารย์ศิลปิน วาดเก่ง",
    courseCode: "AR105",
    courseName: "การออกแบบกราฟิกสำหรับสื่อดิจิทัล",
    status: "active",
    testType: "TF",
  },
  {
    id: 15,
    title: "การใช้งาน Adobe Photoshop เบื้องต้น",
    hasVideo: true,
    creator: "อาจารย์ศิลปิน วาดเก่ง",
    courseCode: "AR105",
    courseName: "การออกแบบกราฟิกสำหรับสื่อดิจิทัล",
    status: "active",
    testType: "MC",
  },
];

const LessonsArea = () => {
  const [lessons, setLessons] = useState<Lesson[]>(sampleLessons);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const lessonsPerPage = 10;

  // Filter lessons based on search term
  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastLesson = currentPage * lessonsPerPage;
  const indexOfFirstLesson = indexOfLastLesson - lessonsPerPage;
  const currentLessons = filteredLessons.slice(indexOfFirstLesson, indexOfLastLesson);
  const totalPages = Math.ceil(filteredLessons.length / lessonsPerPage);

  // Handle delete lesson
  const handleDeleteLesson = (id: number) => {
    if (window.confirm("คุณต้องการลบบทเรียนนี้ใช่หรือไม่?")) {
      setLessons(lessons.filter(lesson => lesson.id !== id));
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: Lesson["status"] }) => {
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

  // Video badge component
  const VideoBadge = ({ hasVideo }: { hasVideo: boolean }) => {
    return hasVideo ? (
      <span className="badge bg-info-subtle text-info rounded-pill px-3 py-1 small">
        <i className="fas fa-video me-1"></i> มี
      </span>
    ) : (
      <span className="badge bg-warning-subtle text-warning rounded-pill px-3 py-1 small">
        <i className="fas fa-times me-1"></i> ไม่มี
      </span>
    );
  };

  // Test type badge component
  const TestBadge = ({ testType }: { testType: TestType }) => {
    console.log("Test type:", testType); // เพิ่ม log เพื่อตรวจสอบค่าที่ได้รับ
    
    if (testType === null || testType === undefined) {
      return <span className="badge bg-secondary-subtle text-secondary rounded-pill px-3 py-1 small">ไม่มี</span>;
    }
  
    let badgeClass = "";
    let testText = "";
    let tooltipText = "";
  
    switch (testType) {
      case "MC":
        badgeClass = "badge bg-primary-subtle text-primary rounded-pill px-3 py-1 small";
        testText = "MC";
        tooltipText = "Multi Choice";
        break;
      case "TF":
        badgeClass = "badge bg-success-subtle text-success rounded-pill px-3 py-1 small";
        testText = "TF";
        tooltipText = "True or False";
        break;
      case "SC":
        badgeClass = "badge bg-info-subtle text-info rounded-pill px-3 py-1 small";
        testText = "SC";
        tooltipText = "Single Choice";
        break;
      case "FB":
        badgeClass = "badge bg-warning-subtle text-warning rounded-pill px-3 py-1 small";
        testText = "FB";
        tooltipText = "Fill in Blank";
        break;
      default:
        return <span className="badge bg-secondary-subtle text-secondary rounded-pill px-3 py-1 small">ไม่มี</span>;
    }
  
    return (
      <span className={badgeClass} title={tooltipText}>
        {testText}
      </span>
    );
  };

  // Statistics
  const totalLessons = lessons.length;
  const countByStatus = {
    active: lessons.filter(l => l.status === "active").length,
    inactive: lessons.filter(l => l.status === "inactive").length,
    draft: lessons.filter(l => l.status === "draft").length,
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
                  <h2 className="title text-muted">รายการบทเรียน</h2>
                  <p className="desc">จัดการบทเรียนทั้งหมดในระบบ</p>
                </div>

                {/* Statistics */}
                <div className="mb-4">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <div className="bg-light rounded p-3 text-center">
                        <h6 className="mb-1 text-muted">บทเรียนทั้งหมด</h6>
                        <h5 className="mb-0">{totalLessons} บทเรียน</h5>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="bg-success-subtle rounded p-3 text-center">
                        <h6 className="mb-1 text-success">เปิดใช้งาน</h6>
                        <h5 className="mb-0">{countByStatus.active} บทเรียน</h5>
                        </div>
                    </div>
                    <div className="col-md-3">
                      <div className="bg-secondary-subtle rounded p-3 text-center">
                        <h6 className="mb-1 text-secondary">ฉบับร่าง</h6>
                        <h5 className="mb-0">{countByStatus.draft} บทเรียน</h5>
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
                      placeholder="ค้นหาบทเรียน..."
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
                  <Link to="/admin-lessons/create-new" className="btn btn-primary">
                    <i className="fas fa-plus-circle me-2"></i>เพิ่มบทเรียน
                  </Link>
                </div>

                {/* Lessons table */}
                <div className="card shadow-sm border-0">
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover table-sm mb-0 align-middle table-striped">
                        <thead className="table-light">
                          <tr>
                            <th>ชื่อบทเรียน</th>
                            <th className="text-center">วิดีโอการสอน</th>
                            <th className="text-center">แบบทดสอบ</th>
                            <th>ผู้สร้าง</th>
                            <th>รหัสวิชา</th>
                            <th>สถานะ</th>
                            <th style={{ width: "100px" }}>จัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentLessons.length > 0 ? (
                            currentLessons.map((lesson) => (
                              <tr key={lesson.id}>
                                <td>
                                  <div className="d-flex flex-column">
                                    <span className="fw-medium">{lesson.title}</span>
                                    <small className="text-muted">{lesson.courseName}</small>
                                  </div>
                                </td>
                                <td className="text-center">
                                  <VideoBadge hasVideo={lesson.hasVideo} />
                                </td>
                                <td className="text-center">
                                  <TestBadge testType={lesson.testType} />
                                </td>
                                <td>{lesson.creator}</td>
                                <td>{lesson.courseCode}</td>
                                <td><StatusBadge status={lesson.status} /></td>
                                <td>
                                  <div className="d-flex justify-content-center gap-3">
                                    <Link to={`/admin-creditbank/edit-lesson/${lesson.id}`} className="text-primary">
                                      <i className="fas fa-edit icon-action"></i>
                                    </Link>
                                    <i
                                      className="fas fa-trash-alt text-danger icon-action"
                                      style={{ cursor: "pointer" }}
                                      onClick={() => handleDeleteLesson(lesson.id)}
                                    ></i>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="text-center py-4">ไม่พบข้อมูลบทเรียน</td>
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
                          แสดง {indexOfFirstLesson + 1} ถึง {Math.min(indexOfLastLesson, filteredLessons.length)} จากทั้งหมด {filteredLessons.length} รายการ
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

export default LessonsArea;
