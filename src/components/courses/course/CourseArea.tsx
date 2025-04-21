import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import CourseSidebar from "./CourseSidebar";
import CourseTop from "./CourseTop";
import UseCourses from "../../../hooks/UseCourses";
import { Link } from "react-router-dom";
import axios from "axios";

// ประกาศ interface สำหรับข้อมูลหลักสูตรจาก API
interface ApiCourse {
  course_id: number;
  title: string;
  category: string;
  description: string;
  cover_image: string;
  subject_count: number;
  department_name?: string;
}

// ประกาศ interface สำหรับข้อมูลเพิ่มเติม
interface CourseExtraInfo {
  description: string;
  departmentName: string;
}

const CourseArea = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const { courses, setCourses } = UseCourses();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // เก็บข้อมูลเพิ่มเติมแยกต่างหาก
  const [courseExtraInfo, setCourseExtraInfo] = useState<Record<number, CourseExtraInfo>>({});
  // เพิ่ม state เก็บรายการหลักสูตรที่ผู้ใช้ลงทะเบียนแล้ว
  const [enrolledCourses, setEnrolledCourses] = useState<number[]>([]);

  // ดึงข้อมูลหลักสูตรจาก API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.get(`${apiURL}/api/courses`);

        if (response.data.success) {
          // เก็บข้อมูลเพิ่มเติมแยกต่างหาก
          const extraInfo: Record<number, CourseExtraInfo> = {};

          // แปลงข้อมูลให้ตรงกับรูปแบบที่ต้องการ
          const formattedCourses = response.data.courses.map((course: ApiCourse) => {
            // เก็บข้อมูลเพิ่มเติมไว้ใน state แยกต่างหาก
            extraInfo[course.course_id] = {
              description: course.description || "",
              departmentName: course.department_name || "หลักสูตรกลาง",
            };

            return {
              id: course.course_id,
              title: course.title,
              category: course.category || "ทั่วไป",
              // แปลง base64 เป็น URL สำหรับแสดงผล
              thumb: course.cover_image
                ? `data:image/jpeg;base64,${course.cover_image}`
                : "/assets/img/courses/course_thumb01.jpg",
              // เพิ่ม properties อื่นๆ ตามที่ interface Course ต้องการ
              // เช่น price, instructor, rating ฯลฯ
            };
          });

          setCourseExtraInfo(extraInfo);
          setCourses(formattedCourses);
        } else {
          setError("ไม่สามารถดึงข้อมูลหลักสูตรได้");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูลหลักสูตร");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [apiURL, setCourses]);

  // เพิ่ม useEffect ใหม่เพื่อตรวจสอบหลักสูตรที่ผู้ใช้ลงทะเบียนแล้ว
  useEffect(() => {
    const checkEnrolledCourses = async () => {
      try {
        // ตรวจสอบว่ามี token หรือไม่ (user ล็อกอินหรือไม่)
        const token = localStorage.getItem("token");
        if (!token) return;

        // เรียก API เพื่อดึงรายการหลักสูตรที่ลงทะเบียนแล้ว
        const response = await axios.get(`${apiURL}/api/courses/user/enrolled`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success && response.data.courses) {
          // เก็บเฉพาะ ID ของหลักสูตรที่ลงทะเบียนแล้ว
          const enrolledIds = response.data.courses.map((course: any) => course.course_id);
          setEnrolledCourses(enrolledIds);
        }
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        // ไม่ต้องแสดง error เพราะเป็นฟีเจอร์เสริม
      }
    };

    checkEnrolledCourses();
  }, [apiURL]);

  const itemsPerPage = 12;
  const [itemOffset, setItemOffset] = useState(0);
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = courses.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(courses.length / itemsPerPage);

  const startOffset = itemOffset + 1;
  const totalItems = courses.length;

  const handlePageClick = (event: { selected: number }) => {
    const newOffset = (event.selected * itemsPerPage) % courses.length;
    setItemOffset(newOffset);
  };

  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  // ฟังก์ชันสำหรับดึงข้อมูลเพิ่มเติม
  const getExtraInfo = (courseId: number): CourseExtraInfo => {
    return courseExtraInfo[courseId] || { description: "", departmentName: "หลักสูตรกลาง" };
  };

  // ฟังก์ชันตรวจสอบว่าหลักสูตรนี้ลงทะเบียนแล้วหรือไม่
  const isEnrolled = (courseId: number): boolean => {
    return enrolledCourses.includes(courseId);
  };

  return (
    <section className="all-courses-area section-py-120">
      <div className="container">
        <div className="row">
          <CourseSidebar setCourses={setCourses} />
          <div className="col-xl-9 col-lg-8">
            <CourseTop
              startOffset={startOffset}
              endOffset={Math.min(endOffset, totalItems)}
              totalItems={totalItems}
              setCourses={setCourses}
              handleTabClick={handleTabClick}
              activeTab={activeTab}
            />

            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">กำลังโหลด...</span>
                </div>
                <p className="mt-3">กำลังโหลดข้อมูลหลักสูตร...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger">
                <i className="fas fa-exclamation-circle me-2"></i>
                {error}
              </div>
            ) : (
              <div className="tab-content" id="myTabContent">
                <div
                  className={`tab-pane fade ${activeTab === 0 ? "show active" : ""}`}
                  id="grid"
                  role="tabpanel"
                  aria-labelledby="grid-tab"
                >
                  <div className="row courses__grid-wrap row-cols-1 row-cols-xl-3 row-cols-lg-2 row-cols-md-2 row-cols-sm-1">
                    {currentItems.map((item) => (
                      <div key={`course-${item.id}`} className="col">
                        <div className="courses__item shine__animate-item">
                          <div className="courses__item-thumb">
                            <Link to={`/course-details/${item.id}`} className="shine__animate-link">
                              <img
                                src={item.thumb}
                                alt={item.title}
                                onError={(e) => {
                                  // ถ้าโหลดรูปไม่สำเร็จ ใช้รูปเริ่มต้น
                                  (e.target as HTMLImageElement).src =
                                    "/assets/img/courses/course_thumb01.jpg";
                                }}
                              />
                            </Link>
                          </div>
                          <div className="courses__item-content">
                            <ul className="courses__item-meta list-wrap">
                              <li className="courses__item-tag">
                                <Link to="/course">{item.category}</Link>
                              </li>
                              {/* ตัด reviews ออก แต่คงพื้นที่ไว้เพื่อรักษา layout */}
                              <li className="avg-rating" style={{ visibility: "hidden" }}>
                                <i className="fas fa-star"></i>
                              </li>
                            </ul>
                            <h5 className="title">
                              <Link to={`/course-details/${item.id}`}>{item.title}</Link>
                            </h5>
                            <p className="author">
                              By <Link to="#">{getExtraInfo(item.id).departmentName}</Link>
                            </p>
                            <div className="courses__item-bottom">
                              <div className="button">
                                <Link
                                  to={
                                    isEnrolled(item.id)
                                      ? `/student-enrolled-courses/${item.id}`
                                      : `/course-details/${item.id}`
                                  }
                                >
                                  <span className="text">
                                    {isEnrolled(item.id) ? "ตรวจสอบความคืบหน้า" : "ลงทะเบียนตอนนี้"}
                                  </span>
                                  <i className="flaticon-arrow-right"></i>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <nav className="pagination__wrap mt-30">
                    <ReactPaginate
                      breakLabel="..."
                      onPageChange={handlePageClick}
                      pageRangeDisplayed={3}
                      pageCount={pageCount}
                      renderOnZeroPageCount={null}
                      className="list-wrap"
                    />
                  </nav>
                </div>

                <div
                  className={`tab-pane fade ${activeTab === 1 ? "show active" : ""}`}
                  id="list"
                  role="tabpanel"
                  aria-labelledby="list-tab"
                >
                  <div className="row courses__list-wrap row-cols-1">
                    {currentItems.map((item) => (
                      <div key={`course-list-${item.id}`} className="col">
                        <div className="courses__item courses__item-three shine__animate-item">
                          <div className="courses__item-thumb">
                            <Link to={`/course-details/${item.id}`} className="shine__animate-link">
                              <img
                                src={item.thumb}
                                alt={item.title}
                                onError={(e) => {
                                  // ถ้าโหลดรูปไม่สำเร็จ ใช้รูปเริ่มต้น
                                  (e.target as HTMLImageElement).src =
                                    "/assets/img/courses/course_thumb01.jpg";
                                }}
                              />
                            </Link>
                          </div>
                          <div className="courses__item-content">
                            <ul className="courses__item-meta list-wrap">
                              <li className="courses__item-tag">
                                <Link to="/course">{item.category}</Link>
                                {/* ตัด reviews ออก แต่คงพื้นที่ไว้เพื่อรักษา layout */}
                                <div className="avg-rating" style={{ visibility: "hidden" }}>
                                  <i className="fas fa-star"></i>
                                </div>
                              </li>
                            </ul>
                            <h5 className="title">
                              <Link to={`/course-details/${item.id}`}>{item.title}</Link>
                            </h5>
                            <p className="author">
                              By <Link to="#">{getExtraInfo(item.id).departmentName}</Link>
                            </p>
                            <p className="info">{getExtraInfo(item.id).description}</p>
                            <div className="courses__item-bottom">
                              <div className="button">
                                <Link
                                  to={
                                    isEnrolled(item.id)
                                      ? `/student-enrolled-courses/${item.id}`
                                      : `/course-details/${item.id}`
                                  }
                                >
                                  <span className="text">
                                    {isEnrolled(item.id) ? "ตรวจสอบความคืบหน้า" : "ลงทะเบียนตอนนี้"}
                                  </span>
                                  <i className="flaticon-arrow-right"></i>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <nav className="pagination__wrap mt-30">
                    <ul className="list-wrap">
                      <ReactPaginate
                        breakLabel="..."
                        onPageChange={handlePageClick}
                        pageRangeDisplayed={3}
                        pageCount={pageCount}
                        renderOnZeroPageCount={null}
                        className="list-wrap"
                      />
                    </ul>
                  </nav>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
export default CourseArea;