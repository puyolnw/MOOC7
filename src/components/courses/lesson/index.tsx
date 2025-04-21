import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import FooterOne from "../../../layouts/footers/FooterOne";
import HeaderOne from "../../../layouts/headers/HeaderOne";
import LessonArea from "./LessonArea";

const Lesson = () => {
   const { subjectId } = useParams();
   const [isLoading, setIsLoading] = useState(true);
   const [subjectData, setSubjectData] = useState<any>(null);
   const [progressData, setProgressData] = useState<any>(null);
   const [error, setError] = useState<string | null>(null);
   const apiURL = import.meta.env.VITE_API_URL;

   useEffect(() => {
      const fetchSubjectData = async () => {
         try {
            if (!subjectId) {
               setError("ไม่พบรหัสรายวิชา");
               setIsLoading(false);
               return;
            }
            
       
            
            setIsLoading(true);
            setError(null);
            
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            
            // ดึงข้อมูลรายวิชา
            const response = await axios.get(`${apiURL}/api/courses/subjects/${subjectId}`, {
               headers
            });
            
   
            
            if (response.data.success) {
               setSubjectData(response.data.subject);
               
               if (!response.data.subject) {
                  setError("ไม่พบข้อมูลรายวิชา");
               }
            } else {
               setError(response.data.message || "ไม่สามารถโหลดข้อมูลรายวิชาได้");
            }

            // ดึงข้อมูลความก้าวหน้าของรายวิชา
            if (token) {
               try {
                  const progressResponse = await axios.get(`${apiURL}/api/courses/subjects/${subjectId}/progress`, {
                     headers
                  });
                  
                  console.log("Progress Response:", progressResponse.data);
                  
                  if (progressResponse.data.success) {
                     setProgressData(progressResponse.data); // เซ็ตข้อมูลทั้งหมด ไม่ใช่แค่ progress
                  }
               } catch (progressError) {
                  console.error("Error fetching progress data:", progressError);
                  // ไม่ต้อง set error เพราะไม่ใช่ข้อมูลหลัก
               }
            }
         } catch (error: any) {
            console.error("Error fetching subject data:", error);
            
            if (error.response) {
               console.error("Error response:", error.response.data);
               
               if (error.response.status === 404) {
                  setError("ไม่พบรายวิชาที่ระบุ");
               } else if (error.response.status === 401) {
                  setError("คุณไม่มีสิทธิ์เข้าถึงรายวิชานี้");
               } else {
                  setError(`เกิดข้อผิดพลาด: ${error.response.data.message || "ไม่สามารถโหลดข้อมูลรายวิชาได้"}`);
               }
            } else {
               setError("เกิดข้อผิดพลาดในการโหลดข้อมูลรายวิชา");
            }
         } finally {
            setIsLoading(false);
         }
      };
      
      fetchSubjectData();
   }, [subjectId, apiURL]);

   // เพิ่มฟังก์ชันสำหรับรีเฟรชข้อมูลความก้าวหน้า

   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <LessonArea 
               isLoading={isLoading}
               subjectData={subjectData}
               progressData={progressData}
               error={error}
               subjectId={subjectId}
            />
         </main>
         <FooterOne style={false} style_2={true} />
      </>
   )
}

export default Lesson
