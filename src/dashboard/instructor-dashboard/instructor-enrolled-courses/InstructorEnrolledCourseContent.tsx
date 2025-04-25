"use client"
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from 'swiper/modules';
import axios from "axios";

// Define interfaces for our data structure
interface CourseDetail {
   id: number;
   thumb: string;
   tag: string;
   title: string;
   avatar_thumb: string;
   avatar_name: string;
   review: string;
   progress?: number;
   book: string;
   time: string;
   mortarboard: string;
   subject_id?: number;
   subject_code?: string;
   subject_name?: string;
   enrollment_count?: number;
   completion_count?: number;
}


const setting = {
   slidesPerView: 3,
   spaceBetween: 30,
   observer: true,
   observeParents: true,
   loop: true,
   breakpoints: {
      '1500': {
         slidesPerView: 3,
      },
      '1200': {
         slidesPerView: 3,
      },
      '992': {
         slidesPerView: 2,
         spaceBetween: 24,
      },
      '768': {
         slidesPerView: 2,
         spaceBetween: 24,
      },
      '576': {
         slidesPerView: 1.5,
      },
      '0': {
         slidesPerView: 1,
      },
   },
}

const InstructorEnrolledCourseContent = () => {
   const [isLoop, setIsLoop] = useState(false);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [courseData, setCourseData] = useState<CourseDetail[]>([]);

   useEffect(() => {
      setIsLoop(true);
   }, []);

   useEffect(() => {
      const fetchInstructorCourses = async () => {
         try {
            setLoading(true);
            
            // Get token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
               throw new Error("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
            }

            // Get API base URL from environment variables
            const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            // Set up headers with authorization token
            const config = {
               headers: {
                  'Authorization': `Bearer ${token}`
               }
            };

            // Fetch instructor's subjects
            const response = await axios.get(
               `${apiURL}/api/courses/subjects/instructors/cou`, 
               config
            );

            if (response.data.success) {
               console.log("API Response:", response.data.courses); // Debug log
               
               // Transform the API response to match our component's data structure
               const transformedData: CourseDetail[] = response.data.courses.map((course: any) => {
                  // Debug log for each course
                  console.log("Course data:", {
                     id: course.subject_id,
                     name: course.subject_name,
                     cover_id: course.cover_image_file_id,
                     cover_image: course.cover_image
                  });
                  
                  let thumbUrl = "/assets/img/courses/course_thumb01.jpg";
                  
                  // Try to use cover_image_file_id for the API endpoint first
                  if (course.cover_image_file_id) {
                     thumbUrl = `${apiURL}/api/courses/image/${course.cover_image_file_id}`;
                     console.log("Using file ID for image URL:", thumbUrl);
                  } 
                  // If no file ID but we have a cover_image URL, use that
                  else if (course.cover_image) {
                     // Extract the file ID from Google Drive URL if possible
                     const match = course.cover_image.match(/\/d\/([^\/]+)/);
                     if (match && match[1]) {
                        thumbUrl = `${apiURL}/api/courses/image/${match[1]}`;
                        console.log("Extracted file ID from URL:", match[1]);
                        console.log("Using extracted file ID for image URL:", thumbUrl);
                     } else {
                        // Use the direct URL as fallback
                        thumbUrl = course.cover_image;
                        console.log("Using direct cover_image URL:", thumbUrl);
                     }
                  }
                  
                  return {
                     id: course.subject_id,
                     subject_id: course.subject_id,
                     subject_code: course.subject_code,
                     title: course.subject_name,
                     tag: course.subject_code || "Course",
                     thumb: thumbUrl,
                     avatar_thumb: "/assets/img/courses/details_instructors01.jpg",
                     avatar_name: "Instructor",
                     review: "4.5",
                     book: "10",
                     time: "23h",
                     mortarboard: course.enrollment_count || "0",
                     enrollment_count: course.enrollment_count || 0,
                     completion_count: course.completion_count || 0
                  };
               });

               setCourseData(transformedData);
            } else {
               throw new Error(response.data.message || "ไม่สามารถดึงข้อมูลรายวิชาได้");
            }

            setLoading(false);
         } catch (err) {
            console.error("Error fetching instructor courses:", err);
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการดึงข้อมูล");
            setLoading(false);
         }
      };

      fetchInstructorCourses();
   }, []);

   return (
      <div className="col-lg-9">
         <div className="dashboard__content-wrap dashboard__content-wrap-two">
            <div className="dashboard__content-title">
               <h4 className="title">รายวิชาทั้งหมด</h4>
            </div>
            <div className="row">
               <div className="col-12">
                  {loading ? (
                     <div className="loading-message">กำลังโหลดข้อมูล...</div>
                  ) : error ? (
                     <div className="error-message">เกิดข้อผิดพลาด: {error}</div>
                  ) : courseData.length === 0 ? (
                     <div className="no-courses-message">ไม่พบรายวิชา</div>
                  ) : (
                     <Swiper
                        {...setting}
                        modules={[Navigation]}
                        loop={isLoop && courseData.length > setting.slidesPerView} 
                        className="swiper dashboard-courses-active">
                        {courseData.map((item) => (
                           <SwiperSlide key={item.id} className="swiper-slide">
                              <div className="courses__item courses__item-two shine__animate-item">
                                 <div className="courses__item-thumb courses__item-thumb-two">
                                    <Link to={`/subject-details/${item.subject_id}`} className="shine__animate-link">
                                       <img 
                                          src={item.thumb}
                                          alt={item.title}
                                          onError={(e) => {
                                             console.log("Image failed to load:", item.thumb);
                                             (e.target as HTMLImageElement).src = "/assets/img/courses/course_thumb01.jpg";
                                          }}
                                       />
                                    </Link>
                                 </div>
                                 <div className="courses__item-content courses__item-content-two">
                                    <ul className="courses__item-meta list-wrap">
                                       <li className="courses__item-tag">
                                          <Link to={`/course/${item.subject_id}`}>{item.tag}</Link>
                                       </li>
                                    </ul>
                                    <h5 className="title"><Link to={`/subject-details/${item.subject_id}`}>{item.title}</Link></h5>
                                    <div className="courses__item-content-bottom">
                                       <div className="author-two">
                                          <Link to="/instructor-details"><img src={item.avatar_thumb} alt="img" />{item.avatar_name}</Link>
                                       </div>
                                       <div className="avg-rating">
                                          <i className="fas fa-star"></i> {item.review}
                                       </div>
                                    </div>
                                    {item.progress !== undefined &&
                                       <div className="progress-item progress-item-two">
                                          <h6 className="title">COMPLETE <span>{item.progress}%</span></h6>
                                          <div className="progress">
                                             <div className="progress-bar" style={{ width: `${item.progress}%` }}></div>
                                          </div>
                                       </div>
                                    }
                                 </div>
                                 <div className="courses__item-bottom-two">
                                    <ul className="list-wrap">
                                       <li><i className="flaticon-book"></i>{item.book}</li>
                                       <li><i className="flaticon-clock"></i>{item.time}</li>
                                       <li><i className="flaticon-mortarboard"></i>{item.enrollment_count || item.mortarboard}</li>
                                    </ul>
                                 </div>
                              </div>
                           </SwiperSlide>
                        ))}
                     </Swiper>
                  )}
               </div>
            </div>
         </div>
      </div>
   )
}

export default InstructorEnrolledCourseContent
