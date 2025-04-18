import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

const LessonNavTav = () => {
   const { subjectId } = useParams();
   const [subjectData, setSubjectData] = useState<any>(null);
   const [isLoading, setIsLoading] = useState(true);
   const apiURL = import.meta.env.VITE_API_URL;

   useEffect(() => {
      const fetchSubjectData = async () => {
         try {
            if (!subjectId) return;
            
            setIsLoading(true);
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            
            const response = await axios.get(`${apiURL}/api/courses/subjects/${subjectId}`, {
               headers
            });
            
            if (response.data.success) {
               setSubjectData(response.data.subject);
            }
         } catch (error) {
            console.error("Error fetching subject data:", error);
         } finally {
            setIsLoading(false);
         }
      };
      
      fetchSubjectData();
   }, [subjectId, apiURL]);

   return (
      <div className="lesson__nav-tab-content">
         <div className="tab-content" id="lessonTabContent">
            <div className="tab-pane fade show active" id="overview" role="tabpanel">
               <div className="lesson__overview">
                  <div className="lesson__overview-content">
                     <h4 className="title">รายละเอียดรายวิชา</h4>
                     {isLoading ? (
                        <p>กำลังโหลดข้อมูล...</p>
                     ) : (
                        <>
                           <h5>{subjectData?.title || "รายวิชา"}</h5>
                           <p>{subjectData?.description || "ไม่มีคำอธิบายรายวิชา"}</p>
                           
                           {subjectData?.instructors && subjectData.instructors.length > 0 && (
                              <div className="mt-4">
                                 <h5>ผู้สอน</h5>
                                 <ul className="list-unstyled">
                                    {subjectData.instructors.map((instructor: any) => (
                                       <li key={instructor.instructor_id} className="mb-2">
                                          <div className="d-flex align-items-center">
                                             <img 
                                                src={instructor.avatar || "/assets/img/instructor/instructor_01.jpg"} 
                                                alt={instructor.name}
                                                className="rounded-circle me-2"
                                                style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                             />
                                             <div>
                                                <strong>{instructor.name}</strong>
                                                {instructor.position && (
                                                   <p className="mb-0 small text-muted">{instructor.position}</p>
                                                )}
                                             </div>
                                          </div>
                                       </li>
                                    ))}
                                 </ul>
                              </div>
                           )}
                           
                           {subjectData?.credits && (
                              <div className="mt-3">
                                 <h5>หน่วยกิต</h5>
                                 <p>{subjectData.credits} หน่วยกิต</p>
                              </div>
                           )}
                        </>
                     )}
                  </div>
               </div>
            </div>
         </div>
         
         <div className="lesson__nav-actions">
            <Link to={`/courses`} className="lesson__nav-link">
               <i className="fas fa-th-large me-2"></i>
               กลับไปหน้าหลักสูตร
            </Link>
         </div>
      </div>
   );
};

export default LessonNavTav;
