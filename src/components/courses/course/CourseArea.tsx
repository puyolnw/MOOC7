import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import CourseSidebar from "./CourseSidebar";
import CourseTop from "./CourseTop";
import UseCourses from "../../../hooks/UseCourses";
import { Link } from "react-router-dom";
import axios from "axios";

interface ApiCourse {
  course_id: number;
  title: string;
  description: string;
  cover_image: string;
  cover_image_file_id: string;
  subject_count: number;
  department_name: string;
  faculty: string;
}

interface CourseExtraInfo {
  description: string;
  departmentName: string;
  faculty: string;
}

const CourseArea = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const { courses, setCourses } = UseCourses();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseExtraInfo, setCourseExtraInfo] = useState<Record<number, CourseExtraInfo>>({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(`${apiURL}/api/courses`);
        
        if (response.data.success) {
          const extraInfo: Record<number, CourseExtraInfo> = {};
          const formattedCourses = response.data.courses.map((course: ApiCourse) => {
            extraInfo[course.course_id] = {
              description: course.description || "",
              departmentName: course.department_name || "ไม่พบข้อมูลสาขา",
              faculty: course.faculty || "ไม่พบข้อมูลคณะ"
            };
            return {
              id: course.course_id,
              title: course.title,
              department_name: course.department_name,
              faculty: course.faculty,
              thumb: course.cover_image_file_id 
                ? `${apiURL}/api/courses/image/${course.cover_image_file_id}`
                : "/assets/img/courses/course_thumb01.jpg",
            };
          });
          
          setCourseExtraInfo(extraInfo);
          setCourses(formattedCourses);
        } else {
          setError("ไม่พบข้อมูลหลักสูตร");
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

  const getExtraInfo = (courseId: number): CourseExtraInfo => {
    return courseExtraInfo[courseId] || { 
      description: "", 
      departmentName: "ไม่พบข้อมูลสาขา",
      faculty: "ไม่พบข้อมูลคณะ"
    };
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
            ) : currentItems.length === 0 ? (
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                ไม่พบหลักสูตรที่ค้นหา
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
                    {currentItems.map((item, index) => (
                      <div key={`course-${item.id || index}`} className="col">
                        <div className="courses__item shine__animate-item">
                          <div className="courses__item-thumb">
                            <Link to={`/course-details/${item.id}`} className="shine__animate-link">
                              <img
                                src={item.thumb}
                                alt={item.title}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "/assets/img/courses/course_thumb01.jpg";
                                }}
                              />
                            </Link>
                          </div>
                          <div className="courses__item-content">
                            <ul className="courses__item-meta list-wrap">
                              <li className="courses__item-tag">
                                <Link to="#">{getExtraInfo(item.id).departmentName}</Link>
                              </li>
                            </ul>
                            <h5 className="title">
                              <Link to={`/course-details/${item.id}`}>{item.title}</Link>
                            </h5>
                            <p className="author text-truncate" style={{ maxWidth: '90%' }}>
                              คณะ <Link to="#">{getExtraInfo(item.id).faculty}</Link>
                            </p>
                            <div className="courses__item-bottom" style={{ justifyContent: 'flex-end' }}>
                              <div className="button">
                                <Link to={`/course-details/${item.id}`}>
                                  <span className="text">เข้าดูหลักสูตร</span>
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
                    {currentItems.map((item, index) => (
                      <div key={`course-list-${item.id || index}`} className="col">
                        <div className="courses__item courses__item-three shine__animate-item">
                          <div className="courses__item-thumb">
                            <Link to={`/course-details/${item.id}`} className="shine__animate-link">
                              <img
                                src={item.thumb}
                                alt={item.title}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "/assets/img/courses/course_thumb01.jpg";
                                }}
                              />
                            </Link>
                          </div>
                          <div className="courses__item-content">
                            <ul className="courses__item-meta list-wrap">
                              <li className="courses__item-tag">
                                <Link to="#">{getExtraInfo(item.id).departmentName}</Link>
                              </li>
                            </ul>
                            <h5 className="title">
                              <Link to={`/course-details/${item.id}`}>{item.title}</Link>
                            </h5>
                            <p className="author text-truncate" style={{ maxWidth: '90%' }}>
                              คณะ <Link to="#">{getExtraInfo(item.id).faculty}</Link>
                            </p>
                            <p className="info">{getExtraInfo(item.id).description}</p>
                            <div className="courses__item-bottom" style={{ justifyContent: 'flex-end' }}>
                              <div className="button">
                                <Link to={`/course-details/${item.id}`}>
                                  <span className="text">เข้าดูหลักสูตร</span>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseArea;
