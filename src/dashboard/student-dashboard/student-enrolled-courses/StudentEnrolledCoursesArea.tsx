import { useState, useEffect } from "react";
import axios from "axios";
import DashboardBannerTwo from "../../dashboard-common/DashboardBannerTwo";
import DashboardSidebarTwo from "../../dashboard-common/DashboardSidebarTwo";
import './d.css';
// กำหนด interface สำหรับข้อมูลคอร์ส
interface CourseType {
   id: number;
   title: string;
   thumb: string;
   tag: string;
   avatar_thumb: string;
   avatar_name: string;
   review: string;
   progress: number;
   book: string;
   time: string;
   mortarboard: string;
   course_id: number;
   course_title: string;
   status: string;
   enrollment_date: string;
   completion_date: string | null;
   progress_percentage: number;
   cover_image_file_id: string | null;
   cover_image: string | null;
   totalLessons?: number;
   completedLessons?: number;
}

const StudentEnrolledCoursesArea = () => {
   const [courses, setCourses] = useState<CourseType[]>([]);
   const [filteredCourses, setFilteredCourses] = useState<CourseType[]>([]);
   const [loading, setLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);
   const [activeFilter, setActiveFilter] = useState<string>("all");

   // ดึง API URL จาก environment variable
   const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3301/api";

   useEffect(() => {
      const fetchCourses = async () => {
         // ดึง token จาก localStorage
         const token = localStorage.getItem("token");
         
         if (!token) {
            setError("กรุณาเข้าสู่ระบบก่อนใช้งาน");
            setLoading(false);
            return;
         }

         try {
            // ดึงข้อมูลความคืบหน้าของผู้ใช้
            const response = await axios.get(`${API_URL}/api/courses/user/progress`, {
               headers: {
                  Authorization: `Bearer ${token}`
               }
            });

            if (response.data.success) {
               const { courses: apiCourses } = response.data.progress;
               
               // แปลงข้อมูลจาก API ให้เข้ากับ interface ที่ต้องการ
               const formattedCourses = await Promise.all(apiCourses.map(async (course: any, index: number) => {
                  // ดึงข้อมูลเพิ่มเติมของคอร์ส
                  let courseDetails = course;
                  try {
                     const detailsResponse = await axios.get(`${API_URL}/api/courses/${course.course_id}`, {
                        headers: {
                           Authorization: `Bearer ${token}`
                        }
                     });
                     
                     if (detailsResponse.data.success) {
                        courseDetails = {
                           ...course,
                           ...detailsResponse.data.course
                        };
                     }
                  } catch (err) {
                     console.error(`Error fetching details for course ${course.course_id}:`, err);
                  }
                  
                  // ดึงข้อมูล progress จาก API
                  let progressDetails = {
                     overallPercentage: courseDetails.progress_percentage || 0,
                     totalLessons: courseDetails.total_subjects || 0,
                     completedLessons: courseDetails.completed_subjects || 0
                  };
                  
                  try {
                     // เรียกใช้ API /course/:courseId/progress-detail
                     const progressResponse = await axios.get(`${API_URL}/api/learn/course/${course.course_id}/progress-detail`, {
                        headers: {
                           Authorization: `Bearer ${token}`
                        }
                     });
                     
                     if (progressResponse.data.success) {
                        progressDetails = {
                           overallPercentage: progressResponse.data.overallPercentage,
                           totalLessons: progressResponse.data.totalLessons,
                           completedLessons: progressResponse.data.completedLessons
                        };
                     }
                  } catch (err) {
                     console.error(`Error fetching progress details for course ${course.course_id}:`, err);
                  }
                  
                  return {
                     id: index + 1,
                     course_id: courseDetails.course_id,
                     title: courseDetails.title || courseDetails.course_title,
                     thumb: "/assets/img/courses/course_thumb01.jpg", // รูปภาพเริ่มต้น
                     tag: courseDetails.category || "ทั่วไป",
                     avatar_thumb: "/assets/img/courses/course_tutor01.png", // รูปภาพเริ่มต้นของผู้สอน
                     avatar_name: "อาจารย์ผู้สอน", // ชื่อเริ่มต้นของผู้สอน
                     review: "4.5", // คะแนนเริ่มต้น
                     progress: progressDetails.overallPercentage, // ใช้ค่า progress จาก API
                     book: `${progressDetails.totalLessons || 0} วิชา`,
                     time: courseDetails.enrollment_date ? new Date(courseDetails.enrollment_date).toLocaleDateString('th-TH') : "-",
                     mortarboard: `${progressDetails.completedLessons || 0}/${progressDetails.totalLessons || 0}`,
                     status: courseDetails.status,
                     enrollment_date: courseDetails.enrollment_date,
                     completion_date: courseDetails.completion_date,
                     progress_percentage: progressDetails.overallPercentage,
                     cover_image_file_id: courseDetails.cover_image_file_id || null,
                     cover_image: courseDetails.cover_image || null,
                     totalLessons: progressDetails.totalLessons,
                     completedLessons: progressDetails.completedLessons
                  };
               }));
               
               setCourses(formattedCourses);
               setFilteredCourses(formattedCourses); // เริ่มต้นแสดงทั้งหมด
            } else {
               setError("ไม่สามารถดึงข้อมูลได้");
            }
         } catch (err) {
            console.error("Error fetching courses:", err);
            setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
         } finally {
            setLoading(false);
         }
      };

      fetchCourses();
   }, [API_URL]);

   // ฟังก์ชันสำหรับกรองหลักสูตร
   const filterCourses = (filter: string) => {
      setActiveFilter(filter);
      
      if (filter === "all") {
         setFilteredCourses(courses);
      } else if (filter === "in_progress") {
         setFilteredCourses(courses.filter(course => course.progress_percentage < 100));
      } else if (filter === "completed") {
         setFilteredCourses(courses.filter(course => course.progress_percentage === 100));
      }
   };

   // ฟังก์ชันสำหรับสร้าง URL ของรูปภาพ
   const getImageUrl = (course: CourseType) => {
      // ถ้ามี cover_image_file_id ให้ใช้ Google Drive URL โดยตรง
      if (course.cover_image_file_id) {
         const directUrl = `https://drive.google.com/thumbnail?id=${course.cover_image_file_id}&sz=w1000`;
         return directUrl;
      }
      
      // ถ้ามี cover_image ที่เป็น URL ของ Google Drive ให้แปลงเป็น URL ที่สามารถแสดงรูปภาพได้
      if (course.cover_image && course.cover_image.includes('drive.google.com')) {
         const fileId = course.cover_image.split('/d/')[1]?.split('/')[0];
         if (fileId) {
            const directUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
            return directUrl;
         }
      }
      
      // ถ้าไม่มีรูปภาพ ให้ใช้รูปภาพเริ่มต้น
      return "/assets/img/courses/course_thumb01.jpg";
   };

   return (
      <section className="dashboard__area section-pb-120">
         <div className="container">
            <DashboardBannerTwo />
            <div className="dashboard__inner-wrap">
               <div className="row">
                  <DashboardSidebarTwo />
                  <div className="col-lg-9">
                     <div className="dashboard__content-wrap">
                        <div className="dashboard__content-title mb-25">
                           <h4 className="title">หลักสูตรที่ลงทะเบียน</h4>
                        </div>
                        
                        {/* แถบ Filter */}
                        <div className="course-filter-wrap mb-30">
                           <div className="filter-buttons">
                              <button 
                                 className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                                 onClick={() => filterCourses('all')}
                              >
                                 หลักสูตรทั้งหมด
                              </button>
                              <button 
                                 className={`filter-btn ${activeFilter === 'in_progress' ? 'active' : ''}`}
                                 onClick={() => filterCourses('in_progress')}
                              >
                                 กำลังดำเนินอยู่
                              </button>
                              <button 
                                 className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
                                 onClick={() => filterCourses('completed')}
                              >
                                 เรียนจบแล้ว
                              </button>
                           </div>
                        </div>
                        
                        {/* แสดงรายการหลักสูตร */}
                        <div className="progress__courses-wrap">
                           {loading ? (
                              // แสดง loading state
                              <div className="text-center py-5">
                                 <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">กำลังโหลด...</span>
                                 </div>
                                 <p className="mt-3">กำลังโหลดข้อมูลคอร์ส...</p>
                              </div>
                           ) : error ? (
                              // แสดงข้อความ error
                              <div className="text-center py-5">
                                 <div className="alert alert-danger" role="alert">
                                    <i className="fas fa-exclamation-circle me-2"></i>
                                    {error}
                                 </div>
                              </div>
                           ) : filteredCourses.length === 0 ? (
                              // แสดงข้อความเมื่อไม่มีคอร์ส
                              <div className="text-center py-5">
                                 <div className="alert alert-info" role="alert">
                                    <i className="fas fa-info-circle me-2"></i>
                                    {activeFilter === 'all' 
                                       ? 'คุณยังไม่ได้ลงทะเบียนคอร์สใดๆ' 
                                       : activeFilter === 'in_progress' 
                                          ? 'ไม่มีหลักสูตรที่กำลังดำเนินอยู่' 
                                          : 'ไม่มีหลักสูตรที่เรียนจบแล้ว'}
                                 </div>
                              </div>
                           ) : (
                              // แสดงรายการคอร์ส
                              <div className="row">
                                 {filteredCourses.map((item) => (
                                    <div key={item.id} className="col-xl-4 col-md-6">
                                       <div className="courses__item courses__item-two shine__animate-item">
                                          <div className="courses__item-thumb courses__item-thumb-two">
                                             <a href={`/course/${item.course_id}`} className="shine__animate-link">
                                                <img 
                                                   src={getImageUrl(item)} 
                                                   alt={item.title}
                                                   onError={(e) => {
                                                      (e.target as HTMLImageElement).src = "/assets/img/courses/course_thumb01.jpg";
                                                   }}
                                                   style={{ objectFit: "cover", height: "220px" }}
                                                />
                                             </a>
                                          </div>
                                          <div className="courses__item-content courses__item-content-two">
                                             <ul className="courses__item-meta list-wrap">
                                                <li className="courses__item-tag">
                                                   <a href="/courses">{item.tag}</a>
                                                </li>
                                             </ul>
                                             <h5 className="title"><a href={`/course/${item.course_id}`}>{item.title}</a></h5>
                                             <div className="courses__item-content-bottom">
                                                <div className="author-two">
                                                   <a href="/instructor-details"><img src={item.avatar_thumb} alt="img" />{item.avatar_name}</a>
                                                </div>
                                             </div>
                                             <div className="progress-item progress-item-two">
                                                <h6 className="title">COMPLETE <span>{item.progress}%</span></h6>
                                                <div className="progress">
                                                   <div className="progress-bar" style={{ width: `${item.progress}%` }}></div>
                                                </div>
                                             </div>
                                          </div>
                                          <div className="courses__item-bottom-two">
                                             <ul className="list-wrap">
                                                <li><i className="flaticon-book"></i>{item.book}</li>
                                                <li><i className="flaticon-clock"></i>{item.time}</li>
                                                <li><i className="flaticon-mortarboard"></i>{item.mortarboard}</li>
                                             </ul>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
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

export default StudentEnrolledCoursesArea;

