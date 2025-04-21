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

   // โหลดข้อมูลทันทีที่เข้าหน้านี้
   useEffect(() => {
      const fetchData = async () => {
         console.log("Fetching data for subject:", subjectId);
         
         if (!subjectId) {
            setError("ไม่พบรหัสรายวิชา");
            setIsLoading(false);
            return;
         }
         
         setIsLoading(true);
         setError(null);
         
         const token = localStorage.getItem("token");
         const headers = token ? { Authorization: `Bearer ${token}` } : {};
         
         try {
            // ดึงข้อมูลรายวิชาและความก้าวหน้าพร้อมกัน
            const [subjectResponse, progressResponse] = await Promise.all([
               // ดึงข้อมูลรายวิชา
               axios.get(`${apiURL}/api/courses/subjects/${subjectId}`, { headers }),
               
               // ดึงข้อมูลความก้าวหน้า (เฉพาะเมื่อมี token)
               token ? axios.get(`${apiURL}/api/courses/subjects/${subjectId}/progress`, { headers }) 
                     : Promise.resolve({ data: { success: false } })
            ]);
            
            // จัดการข้อมูลรายวิชา
            if (subjectResponse.data.success) {
               console.log("Subject data loaded:", subjectResponse.data);
               setSubjectData(subjectResponse.data.subject);
               
               if (!subjectResponse.data.subject) {
                  setError("ไม่พบข้อมูลรายวิชา");
               }
            } else {
               setError(subjectResponse.data.message || "ไม่สามารถโหลดข้อมูลรายวิชาได้");
            }
            
            // จัดการข้อมูลความก้าวหน้า
            if (progressResponse.data.success) {
               console.log("Progress data loaded:", progressResponse.data);
               setProgressData(progressResponse.data);
            }
         } catch (error: any) {
            console.error("Error fetching data:", error);
            
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
      
      fetchData();
      
      // ตั้งเวลาให้รีเฟรชข้อมูลทุก 30 วินาที
      const intervalId = setInterval(() => {
         console.log("Auto-refreshing data...");
         fetchData();
      }, 30000);
      
      return () => {
         clearInterval(intervalId);
      };
   }, [subjectId, apiURL]);

   // ฟังก์ชันสำหรับรีเฟรชข้อมูลความก้าวหน้า (ส่งให้ LessonArea ใช้)
   const refreshProgress = async () => {
      if (!subjectId) return null;
      
      const token = localStorage.getItem("token");
      if (!token) return null;
      
      try {
         console.log("Manually refreshing progress data...");
         const response = await axios.get(`${apiURL}/api/courses/subjects/${subjectId}/progress`, {
            headers: { Authorization: `Bearer ${token}` }
         });
         
         if (response.data.success) {
            console.log("New progress data:", response.data);
            setProgressData(response.data);
            return response.data;
         }
      } catch (error) {
         console.error("Error refreshing progress:", error);
      }
      return null;
   };

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
               refreshProgress={refreshProgress}
            />
         </main>
         <FooterOne style={false} style_2={true} />
      </>
   )
}

export default Lesson
