"use client"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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



const InstructorEnrolledCourseContent = () => {
   const navigate = useNavigate();
   const [isLoop, setIsLoop] = useState(false);
   console.log(isLoop)
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
               `${apiURL}/api/courses/subjects/instructors/courses`, 
               config
            );

            if (response.data.success) {
               console.log("=== INSTRUCTOR SUBJECTS PAGE ===");
               console.log("API Response:", response.data.subjects); // Debug log
               console.log("Number of subjects from API:", response.data.subjects.length);
               
               // Transform the API response to match our component's data structure
               const transformedData: CourseDetail[] = response.data.subjects.map((subject: any) => {
                  // Debug log for each subject
                  console.log("Subject data:", {
                     id: subject.subject_id,
                     name: subject.subject_name,
                     cover_id: subject.cover_image_file_id,
                     cover_image: subject.cover_image
                  });
                  
                  let thumbUrl = "/assets/img/courses/course_thumb01.jpg";
                  
                  // Try to use cover_image_file_id for the API endpoint first
                  if (subject.cover_image_file_id) {
                     thumbUrl = `${apiURL}/api/courses/image/${subject.cover_image_file_id}`;
                     console.log("Using file ID for image URL:", thumbUrl);
                  } 
                  // If no file ID but we have a cover_image URL, use that
                  else if (subject.cover_image) {
                     // Extract the file ID from Google Drive URL if possible
                     const match = subject.cover_image.match(/\/d\/([^\/]+)/);
                     if (match && match[1]) {
                        thumbUrl = `${apiURL}/api/courses/image/${match[1]}`;
                        console.log("Extracted file ID from URL:", match[1]);
                        console.log("Using extracted file ID for image URL:", thumbUrl);
                     } else {
                        // Use the direct URL as fallback
                        thumbUrl = subject.cover_image;
                        console.log("Using direct cover_image URL:", thumbUrl);
                     }
                  }
                  
                  return {
                     id: subject.subject_id,
                     subject_id: subject.subject_id,
                     subject_code: subject.subject_code,
                     title: subject.subject_name,
                     tag: subject.subject_code || "Subject",
                     thumb: thumbUrl,
                     avatar_thumb: "/assets/img/courses/details_instructors01.jpg",
                     avatar_name: "Instructor",
                     review: "4.5",
                     book: "10",
                     time: "23h",
                     mortarboard: subject.enrollment_count || "0",
                     enrollment_count: subject.enrollment_count || 0,
                     completion_count: subject.completion_count || 0
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

    // ฟังก์ชันสำหรับการคลิกการ์ด
    const handleCourseClick = (subjectId: number) => {
       navigate(`/instructor/subject/${subjectId}/overview`);
    };

   return (
      <>
         <style>{`
            .enrollment-stats {
               padding: 20px;
               background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
               border-radius: 12px;
               margin-top: 15px;
               box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
            }

            .stat-item {
               display: flex;
               justify-content: space-between;
               align-items: center;
               margin-bottom: 12px;
               padding: 8px 0;
               border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            }

            .stat-item:last-child {
               margin-bottom: 0;
               border-bottom: none;
            }

            .stat-label {
               font-size: 14px;
               color: rgba(255, 255, 255, 0.9);
               font-weight: 500;
            }

            .stat-value {
               font-size: 16px;
               color: #ffffff;
               font-weight: 700;
               text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }

            .courses__item.courses__item-two {
               cursor: pointer;
               transition: all 0.3s ease;
               border-radius: 15px;
               overflow: hidden;
               box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
               background: #ffffff;
               border: 1px solid #f0f0f0;
            }

            .courses__item.courses__item-two:hover {
               transform: translateY(-8px);
               box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
               border-color: #667eea;
            }

            .courses__item-thumb-two {
               position: relative;
               overflow: hidden;
               border-radius: 15px 15px 0 0;
            }

            .courses__item-thumb-two img {
               width: 100%;
               height: 200px;
               object-fit: cover;
               transition: transform 0.3s ease;
            }

            .courses__item.courses__item-two:hover .courses__item-thumb-two img {
               transform: scale(1.05);
            }

            .courses__item-content-two {
               padding: 25px;
            }

            .courses__item-tag span {
               background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
               color: white;
               padding: 6px 16px;
               border-radius: 25px;
               font-size: 12px;
               font-weight: 600;
               text-transform: uppercase;
               letter-spacing: 0.5px;
               box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
            }

            .courses__item-content-two .title {
               font-size: 18px;
               font-weight: 700;
               color: #2d3748;
               margin: 15px 0 10px 0;
               line-height: 1.4;
               display: -webkit-box;
               -webkit-line-clamp: 2;
               -webkit-box-orient: vertical;
               overflow: hidden;
            }

            .courses__item.courses__item-two:hover .title {
               color: #667eea;
            }

            .progress-item-two {
               margin-top: 15px;
               padding: 15px;
               background: #f8fafc;
               border-radius: 10px;
               border-left: 4px solid #667eea;
            }

            .progress-item-two .title {
               font-size: 12px;
               font-weight: 600;
               color: #4a5568;
               margin-bottom: 8px;
               text-transform: uppercase;
               letter-spacing: 0.5px;
            }

            .progress {
               height: 8px;
               background-color: #e2e8f0;
               border-radius: 4px;
               overflow: hidden;
            }

            .progress-bar {
               height: 100%;
               background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
               border-radius: 4px;
               transition: width 0.3s ease;
            }

            .loading-message, .error-message, .no-courses-message {
               text-align: center;
               padding: 60px 20px;
               font-size: 18px;
               color: #4a5568;
               background: #f7fafc;
               border-radius: 15px;
               margin: 20px 0;
            }

            .error-message {
               color: #e53e3e;
               background: #fed7d7;
               border: 1px solid #feb2b2;
            }

            .dashboard__content-title .title {
               font-size: 28px;
               font-weight: 700;
               color: #2d3748;
               margin-bottom: 30px;
               position: relative;
               padding-bottom: 15px;
            }

            .dashboard__content-title .title::after {
               content: '';
               position: absolute;
               bottom: 0;
               left: 0;
               width: 60px;
               height: 4px;
               background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
               border-radius: 2px;
            }

            @media (max-width: 768px) {
               .enrollment-stats {
                  padding: 15px;
               }
               
               .stat-item {
                  flex-direction: column;
                  align-items: flex-start;
                  gap: 5px;
               }
               
               .courses__item-content-two {
                  padding: 20px;
               }
               
               .courses__item-thumb-two img {
                  height: 160px;
               }
            }
         `}</style>

         <div className="col-lg-9">
            <div className="dashboard__content-wrap dashboard__content-wrap-two">
               <div className="dashboard__content-title">
                  <h4 className="title">รายวิชาทั้งหมด</h4>
               </div>
               <div className="row">
                  <div className="col-12">
                     {loading ? (
                        <div className="loading-message">
                           <div style={{ marginBottom: '20px' }}>
                              <div style={{ 
                                 width: '50px', 
                                 height: '50px', 
                                 border: '4px solid #f3f3f3',
                                 borderTop: '4px solid #667eea',
                                 borderRadius: '50%',
                                 animation: 'spin 1s linear infinite',
                                 margin: '0 auto 20px'
                              }}></div>
                           </div>
                           กำลังโหลดข้อมูล...
                        </div>
                     ) : error ? (
                        <div className="error-message">
                           <i className="fas fa-exclamation-triangle" style={{ fontSize: '24px', marginBottom: '15px' }}></i>
                           <br />
                           เกิดข้อผิดพลาด: {error}
                        </div>
                     ) : courseData.length === 0 ? (
                        <div className="no-courses-message">
                           <i className="fas fa-book-open" style={{ fontSize: '48px', marginBottom: '20px', color: '#cbd5e0' }}></i>
                           <br />
                           ไม่พบรายวิชา
                        </div>
                     ) : (
                     <div className="row">
                     {courseData.map((item) => (
                     <div key={item.id} className="col-lg-6 col-md-6 col-sm-12 mb-4">
                     <div 
                            className="courses__item courses__item-two shine__animate-item" 
                            style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                            onClick={() => handleCourseClick(item.subject_id!)}
                         >
                              <div className="courses__item-thumb courses__item-thumb-two">
                                 <div className="shine__animate-link">
                                 <img 
                                 src={item.thumb}
                              alt={item.title}
                           onError={(e) => {
                           console.log("Image failed to load:", item.thumb);
                        (e.target as HTMLImageElement).src = "/assets/img/courses/course_thumb01.jpg";
                     }}
                     />
                     </div>
                     </div>
                     <div className="courses__item-content courses__item-content-two">
                     <ul className="courses__item-meta list-wrap">
                        <li className="courses__item-tag">
                              <span>{item.tag}</span>
                           </li>
                     </ul>
                     <h5 className="title">
                     {item.title}
                     </h5>
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
                     <div className="enrollment-stats">
                        <div className="stat-item">
                              <span className="stat-label">
                                 <i className="fas fa-users" style={{ marginRight: '8px' }}></i>
                              นักเรียนทั้งหมด
                        </span>
                     <span className="stat-value">{item.enrollment_count || 0} คน</span>
                     </div>
                     <div className="stat-item">
                     <span className="stat-label">
                        <i className="fas fa-graduation-cap" style={{ marginRight: '8px' }}></i>
                           สำเร็จการศึกษา
                        </span>
                     <span className="stat-value">{item.completion_count || 0} คน</span>
                     </div>
                     <div className="stat-item">
                     <span className="stat-label">
                        <i className="fas fa-chart-line" style={{ marginRight: '8px' }}></i>
                           อัตราสำเร็จ
                        </span>
                     <span className="stat-value">
                     {item.enrollment_count && item.enrollment_count > 0 
                        ? Math.round((item.completion_count || 0) / item.enrollment_count * 100)
                           : 0}%
                     </span>
                     </div>
                     </div>
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

         <style>{`
            @keyframes spin {
               0% { transform: rotate(0deg); }
               100% { transform: rotate(360deg); }
            }
            
            .swiper-button-next,
            .swiper-button-prev {
               background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
               width: 45px;
               height: 45px;
               border-radius: 50%;
               box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
               transition: all 0.3s ease;
            }
            
            .swiper-button-next:hover,
            .swiper-button-prev:hover {
               transform: scale(1.1);
               box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
            }
            
            .swiper-button-next::after,
            .swiper-button-prev::after {
               font-size: 16px;
               font-weight: 700;
               color: white;
            }
            
            .dashboard__content-wrap-two {
               background: #ffffff;
               border-radius: 20px;
               padding: 40px;
               box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
               border: 1px solid #f0f0f0;
            }
            
            .shine__animate-item {
               position: relative;
               overflow: hidden;
            }
            
            .shine__animate-item::before {
               content: '';
               position: absolute;
               top: 0;
               left: -100%;
               width: 100%;
               height: 100%;
               background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
               transition: left 0.5s;
               z-index: 1;
            }
            
            .shine__animate-item:hover::before {
               left: 100%;
            }
            
            .courses__item-meta {
               margin: 0 0 15px 0;
               padding: 0;
               list-style: none;
            }
            
            .courses__item-meta li {
               display: inline-block;
            }
            
            .stat-item .fas {
               opacity: 0.8;
               font-size: 14px;
            }
            
            .courses__item-bottom-two {
               padding: 0;
               margin: 0;
            }
            
            .swiper-slide {
               height: auto;
            }
            
            .courses__item {
               height: 100%;
               display: flex;
               flex-direction: column;
            }
            
            .courses__item-content-two {
               flex: 1;
            }
            
            @media (max-width: 992px) {
               .dashboard__content-wrap-two {
                  padding: 25px;
               }
               
               .dashboard__content-title .title {
                  font-size: 24px;
               }
            }
            
            @media (max-width: 576px) {
               .dashboard__content-wrap-two {
                  padding: 20px;
               }
               
               .dashboard__content-title .title {
                  font-size: 20px;
               }
               
               .courses__item-content-two .title {
                  font-size: 16px;
               }
               
               .stat-label {
                  font-size: 12px;
               }
               
               .stat-value {
                  font-size: 14px;
               }
            }
         `}</style>
      </>
   )
}

export default InstructorEnrolledCourseContent
