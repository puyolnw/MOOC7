import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// กำหนด interface สำหรับข้อมูลคอร์ส
interface CourseType {
   id: number;
   title: string;
   thumb: string;
   tag: string;
   department_name: string;
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

// Interface สำหรับข้อมูล progress ที่ได้จาก API


const DashboardCourse = () => {
   const [courses, setCourses] = useState<CourseType[]>([]);
   const [loading, setLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);

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
            // ใช้ API เดียวกับ dashboard ที่มีการคำนวณ progress ที่ถูกต้องแล้ว
            const response = await axios.get(`${API_URL}/api/data/student/dashboard/courses`, {
               headers: {
                  Authorization: `Bearer ${token}`
               }
            });

            console.log("Dashboard API Response:", response.data);

            if (response.data.success) {
               const { courses: apiCourses } = response.data;
               
               console.log("Raw courses data from dashboard API:", apiCourses);
               
               // แปลงข้อมูลจาก API ให้เข้ากับ interface ที่ต้องการ
               const formattedCourses = await Promise.all(apiCourses.map(async (course: any, index: number) => {
                  console.log(`Course ${index + 1} (${course.title}) data:`, course);
                  
                  // ดึงข้อมูลเพิ่มเติมของคอร์ส (รูปภาพ, รายละเอียด)
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
                           cover_image_file_id: detailsResponse.data.course.cover_image_file_id,
                           cover_image: detailsResponse.data.course.cover_image,
                           department_name: detailsResponse.data.course.department_name
                        };
                        console.log(`Course ${index + 1} details fetched:`, courseDetails);
                     }
                  } catch (err) {
                     console.error(`Error fetching details for course ${course.course_id}:`, err);
                  }
                  
                  console.log(`Course ${index + 1} (${courseDetails.title}) final data:`, {
                     progress_percentage: course.progress_percentage,
                     status: course.status,
                     completed: course.completed
                  });
                  
                  return {
                     id: index + 1,
                     course_id: course.course_id,
                     title: course.title,
                     thumb: "/assets/img/courses/course_thumb01.jpg", // รูปภาพเริ่มต้น
                     tag: "หลักสูตร",
                     department_name: courseDetails.department_name || "ไม่ระบุสาขา",
                     review: "4.5", // คะแนนเริ่มต้น
                     progress: course.progress_percentage, // ใช้ progress จาก dashboard API ที่คำนวณถูกต้องแล้ว
                     book: "หลักสูตร",
                     time: course.enrollment_date ? new Date(course.enrollment_date).toLocaleDateString('th-TH') : "-",
                     mortarboard: course.status === "completed" ? "เรียนจบแล้ว" : "กำลังเรียน",
                     status: course.status,
                     enrollment_date: course.enrollment_date,
                     completion_date: course.completion_date,
                     progress_percentage: course.progress_percentage,
                     cover_image_file_id: courseDetails.cover_image_file_id || null,
                     cover_image: courseDetails.cover_image || null,
                     totalLessons: 0, // จะได้จาก dashboard API
                     completedLessons: 0 // จะได้จาก dashboard API
                  };
               }));
               
               console.log("Formatted courses:", formattedCourses);
               
               setCourses(formattedCourses);
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

   // ฟังก์ชันสำหรับสร้าง URL ของรูปภาพ
   const getImageUrl = (course: CourseType) => {
      // ถ้ามี cover_image_file_id ให้ใช้ Google Drive URL โดยตรง
      if (course.cover_image_file_id) {
         // ใช้ URL ที่ปลอดภัยกว่าสำหรับ Google Drive
         // แทนที่จะใช้ uc?export=view ให้ใช้ thumbnail ซึ่งมีโอกาสทำงานได้ดีกว่า
         const directUrl = `https://drive.google.com/thumbnail?id=${course.cover_image_file_id}&sz=w1000`;
         console.log("Generated direct Google Drive thumbnail URL:", directUrl);
         return directUrl;
      }
      
      // ถ้ามี cover_image ที่เป็น URL ของ Google Drive ให้แปลงเป็น URL ที่สามารถแสดงรูปภาพได้
      if (course.cover_image && course.cover_image.includes('drive.google.com')) {
         // แปลง URL จาก https://drive.google.com/file/d/FILE_ID/view?usp=drivesdk
         // เป็น https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000
         const fileId = course.cover_image.split('/d/')[1]?.split('/')[0];
         if (fileId) {
            const directUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
            console.log("Generated direct Google Drive thumbnail URL:", directUrl);
            return directUrl;
         }
      }
      
      // ถ้าไม่มีรูปภาพ ให้ใช้รูปภาพเริ่มต้น
      console.log("Using default image");
      return "/assets/img/courses/course_thumb01.jpg";
   };

   return (
      <div className="progress__courses-wrap">
         <div className="dashboard__content-title">
            <h4 className="title">คอร์สของฉัน</h4>
         </div>
         
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
         ) : courses.length === 0 ? (
            // แสดงข้อความเมื่อไม่มีคอร์ส
            <div className="text-center py-5">
               <div className="alert alert-info" role="alert">
                  <i className="fas fa-info-circle me-2"></i>
                  คุณยังไม่ได้ลงทะเบียนคอร์สใดๆ
               </div>
            </div>
         ) : (
            // แสดงรายการคอร์ส
            <div className="row">
               {courses.map((item) => (
                  <div key={item.id} className="col-xl-4 col-md-6">
                     <div className="courses__item courses__item-two shine__animate-item">
                        <div className="courses__item-thumb courses__item-thumb-two">
                           <Link to={`/course-details/${item.course_id}`} className="shine__animate-link">
                              <img 
                                 src={getImageUrl(item)} 
                                 alt={item.title}
                                 onLoad={() => console.log(`Image loaded successfully for course: ${item.title}`)}
                                 onError={(e) => {
                                    console.error(`Error loading image for course: ${item.title}`, {
                                       fileId: item.cover_image_file_id,
                                       coverImage: item.cover_image,
                                       fallbackSrc: "/assets/img/courses/course_thumb01.jpg"
                                    });
                                    // ถ้าโหลดรูปไม่สำเร็จ ให้ใช้รูปเริ่มต้นแทน
                                    (e.target as HTMLImageElement).src = "/assets/img/courses/course_thumb01.jpg";
                                 }}
                                 style={{ objectFit: "cover", height: "220px" }}
                              />
                           </Link>
                        </div>
                        <div className="courses__item-content courses__item-content-two">
                           <ul className="courses__item-meta list-wrap">
                              <li className="courses__item-tag">
                                 <Link to="/courses">{item.tag}</Link>
                              </li>
                           </ul>
                           <h5 className="title"><Link to={`/course-details/${item.course_id}`}>{item.title}</Link></h5>
                           <div className="courses__item-content-bottom">
                              <div className="author-two">
                                 สาขาวิชา : {item.department_name}
                              </div>
                           </div>
                           <div className="progress-item progress-item-two">
                           <h6 className="title">COMPLETE <span>{Math.round(item.progress || 0)}%</span></h6>
                           <div className="progress">
                           <div 
                                className="progress-bar" 
                                   style={{ 
                                      width: `${Math.round(item.progress || 0)}%`,
                                      backgroundColor: item.progress >= 100 ? '#28a745' : 
                                                       item.progress >= 50 ? '#ffc107' : '#007bff'
                                    }}>
                                  </div>
                               </div>
                               {item.progress >= 100 && (
                                 <div className="completion-badge" style={{color: '#28a745', fontSize: '12px', marginTop: '5px'}}>
                                   ✓ เรียนจบแล้ว
                                 </div>
                               )}
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
   )
}

export default DashboardCourse

