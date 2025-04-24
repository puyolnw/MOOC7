import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
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

interface FacultyCount {
  faculty: string;
  count: number;
}

interface CourseProps {
  style: boolean;
}

// slider setting
const setting = {
  slidesPerView: 4,
  loop: true,
  spaceBetween: 30,
  observer: true,
  observeParents: true,
  autoplay: false,
  // Navigation arrows
  navigation: {
    nextEl: '.courses-button-next',
    prevEl: '.courses-button-prev',
  },
  breakpoints: {
    '1500': {
      slidesPerView: 4,
    },
    '1200': {
      slidesPerView: 4,
    },
    '992': {
      slidesPerView: 3,
      spaceBetween: 24,
    },
    '768': {
      slidesPerView: 2,
      spaceBetween: 24,
    },
    '576': {
      slidesPerView: 1,
    },
    '0': {
      slidesPerView: 1,
    },
  },
};

const CourseArea = ({ style }: CourseProps) => {
  const apiURL = import.meta.env.VITE_API_URL;
  const [activeTab, setActiveTab] = useState(0);
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabTitles, setTabTitles] = useState<string[]>(["หลักสูตรทั้งหมด"]);
  const [topFaculties, setTopFaculties] = useState<string[]>([]);
  const [facultyCourses, setFacultyCourses] = useState<Record<string, ApiCourse[]>>({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(`${apiURL}/api/courses`);
        
        if (response.data.success) {
          const allCourses = response.data.courses;
          setCourses(allCourses);
          
          // Count courses by faculty
          const facultyCount: Record<string, number> = {};
          allCourses.forEach((course: ApiCourse) => {
            if (course.faculty) {
              facultyCount[course.faculty] = (facultyCount[course.faculty] || 0) + 1;
            }
          });
          
          // Sort faculties by course count
          const sortedFaculties: FacultyCount[] = Object.entries(facultyCount)
            .map(([faculty, count]) => ({ faculty, count }))
            .sort((a, b) => b.count - a.count);
          
          // Get top 2 faculties
          const top2Faculties = sortedFaculties.slice(0, 2).map(item => item.faculty);
          setTopFaculties(top2Faculties);
          
          // Set tab titles
          setTabTitles(["หลักสูตรทั้งหมด", ...top2Faculties]);
          
          // Group courses by faculty
          const coursesByFaculty: Record<string, ApiCourse[]> = {};
          top2Faculties.forEach(faculty => {
            coursesByFaculty[faculty] = allCourses.filter((course: ApiCourse) => course.faculty === faculty);
          });
          setFacultyCourses(coursesByFaculty);
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
  }, [apiURL]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const getCoursesForTab = (tabIndex: number): ApiCourse[] => {
    if (tabIndex === 0) {
      return courses;
    } else if (tabIndex > 0 && tabIndex <= topFaculties.length) {
      const faculty = topFaculties[tabIndex - 1];
      return facultyCourses[faculty] || [];
    }
    return [];
  };

  return (
    <section className={`courses-area ${style ? "section-py-120" : "section-pt-120 section-pb-90"}`} style={{ backgroundImage: `url(/assets/img/bg/courses_bg.jpg )` }}>
      <div className="container">
        <div className="section__title-wrap">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="section__title text-center mb-40">
                <span className="sub-title">หลักสูตรชั้นยอด</span>
                <h2 className="title">สำรวจหลักสูตรที่ดีที่สุด</h2>
              </div>
              <div className="courses__nav">
                <ul className="nav nav-tabs" id="courseTab" role="tablist">
                  {tabTitles.map((tab, index) => (
                    <li key={index} onClick={() => handleTabClick(index)} className="nav-item" role="presentation">
                      <button className={`nav-link ${activeTab === index ? "active" : ""}`}>{tab}</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

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
          <div className="tab-content" id="courseTabContent">
            {tabTitles.map((_, tabIndex) => (
              <div 
                key={`tab-${tabIndex}`} 
                className={`tab-pane fade ${activeTab === tabIndex ? 'show active' : ''}`} 
                role="tabpanel"
              >
                <Swiper {...setting} modules={[Autoplay, Navigation]} className="swiper courses-swiper-active">
                  {getCoursesForTab(tabIndex).map((course) => (
                    <SwiperSlide key={`course-${course.course_id}`} className="swiper-slide">
                      <div className="courses__item shine__animate-item">
                        <div className="courses__item-thumb">
                          <Link to={`/course-details/${course.course_id}`} className="shine__animate-link">
                            <img 
                              src={course.cover_image_file_id 
                                ? `${apiURL}/api/courses/image/${course.cover_image_file_id}`
                                : "/assets/img/courses/course_thumb01.jpg"
                              } 
                              alt={course.title}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/assets/img/courses/course_thumb01.jpg";
                              }}
                            />
                          </Link>
                        </div>
                        <div className="courses__item-content">
                          <ul className="courses__item-meta list-wrap">
                            <li className="courses__item-tag">
                              <Link to="#">{course.department_name || "ไม่ระบุสาขา"}</Link>
                            </li>
                            <li className="avg-rating">
                              <i className="fas fa-graduation-cap"></i> {course.subject_count || 0} วิชา
                            </li>
                          </ul>
                          <h5 className="title">
                            <Link to={`/course-details/${course.course_id}`}>{course.title}</Link>
                          </h5>
                          <p className="author">
                            คณะ <Link to="#">{course.faculty || "ไม่ระบุคณะ"}</Link>
                          </p>
                          <div className="courses__item-bottom">
                            <div className="button">
                              <Link to={`/course-details/${course.course_id}`}>
                                <span className="text">เข้าดูหลักสูตร</span>
                                <i className="flaticon-arrow-right"></i>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                {!style && (
                  <div className="courses__nav">
                    <div className="courses-button-prev"><i className="flaticon-arrow-right"></i></div>
                    <div className="courses-button-next"><i className="flaticon-arrow-right"></i></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CourseArea;
