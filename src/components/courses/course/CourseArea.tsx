import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import CourseSidebar from "./CourseSidebar";
import CourseTop from "./CourseTop";
import UseCourses from "../../../hooks/UseCourses";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useFaculty } from "../../../hooks/useFaculty";

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
  const [searchParams] = useSearchParams();
  const { selectedFaculty, setSelectedFaculty } = useFaculty();
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || "");
  const [selectedDepartment, setSelectedDepartment] = useState<string>(searchParams.get('department') || "");

  // Debug: Log searchQuery
  console.log("CourseArea: searchQuery:", searchQuery);

  // Sync searchQuery and department with URL
  useEffect(() => {
    const searchFromQuery = searchParams.get('search') || "";
    const departmentFromQuery = searchParams.get('department') || "";
    console.log("URL Search Param:", searchFromQuery);
    console.log("URL Department Param:", departmentFromQuery);
    setSearchQuery(searchFromQuery);
    setSelectedDepartment(departmentFromQuery);
  }, [searchParams]);

  useEffect(() => {
    const facultyFromQuery = searchParams.get('faculty');
    if (facultyFromQuery) {
      setSelectedFaculty(decodeURIComponent(facultyFromQuery));
    } else {
      setSelectedFaculty(null);
    }
  }, [searchParams, setSelectedFaculty]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        const response = await axios.get(`${apiURL}/api/courses${params.toString() ? `?${params}` : ''}`);
        console.log("API Response:", response.data.courses);

        if (response.data.success) {
          const extraInfo: Record<number, CourseExtraInfo> = {};
          let formattedCourses = response.data.courses.map((course: ApiCourse) => {
            extraInfo[course.course_id] = {
              description: course.description || "",
              departmentName: course.department_name || "ไม่พบข้อมูลสาขา",
              faculty: course.faculty || "ไม่พบข้อมูลคณะ",
            };
            return {
              id: course.course_id,
              title: course.title,
              description: course.description || "", // Ensure description for search
              department_name: course.department_name,
              faculty: course.faculty,
              thumb: course.cover_image_file_id
                ? `${apiURL}/api/courses/image/${course.cover_image_file_id}`
                : "/assets/img/courses/course_thumb01.jpg",
            };
          });

          // Filter by selected faculty
          if (selectedFaculty) {
            formattedCourses = formattedCourses.filter(
              (course: any) => course.faculty === selectedFaculty
            );
          }

          // Filter by selected department
          if (selectedDepartment) {
            formattedCourses = formattedCourses.filter(
              (course: any) => course.department_name === selectedDepartment
            );
          }

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
  }, [apiURL, setCourses, selectedFaculty, selectedDepartment, searchQuery]);

  // Reset pagination when courses change
  useEffect(() => {
    console.log("Courses length changed:", courses.length);
    setItemOffset(0); // Reset to first page
  }, [courses.length]);

  // Filter courses by search query
  const filteredCourses = searchQuery
    ? courses.filter((course: any) =>
        (course.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (course.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
      )
    : courses;

  // Debug: Log courses
  console.log("All Courses:", courses.map(c => ({ id: c.id, title: c.title })));
  console.log("Filtered Courses:", filteredCourses.map(c => ({ id: c.id, title: c.title })));

  const itemsPerPage = 12;
  const [itemOffset, setItemOffset] = useState(0);
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = filteredCourses.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(filteredCourses.length / itemsPerPage);
  const startOffset = itemOffset + 1;
  const totalItems = filteredCourses.length;

  const handlePageClick = (event: { selected: number }) => {
    const newOffset = (event.selected * itemsPerPage) % filteredCourses.length;
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
      faculty: "ไม่พบข้อมูลคณะ",
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
              handleTabClick={handleTabClick}
              activeTab={activeTab}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
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
                                alt={item.title || "Course"}
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
                              <Link to={`/course-details/${item.id}`}>{item.title || "Untitled"}</Link>
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
                                alt={item.title || "Course"}
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
                              <Link to={`/course-details/${item.id}`}>{item.title || "Untitled"}</Link>
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