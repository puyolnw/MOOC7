import { useState, useEffect } from "react";
import { useParams} from "react-router-dom";
import axios from "axios";
import FooterOne from "../../../layouts/footers/FooterOne";
import HeaderOne from "../../../layouts/headers/HeaderOne";
import LessonArea from "./LessonArea";

const Lesson = () => {
   const { subjectId } = useParams();
   const [isLoading, setIsLoading] = useState(true);
   const [subjectData, setSubjectData] = useState<any>(null);
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
            
            const response = await axios.get(`${apiURL}/api/courses/subjects/${subjectId}`, {
               headers
            });
            
            if (response.data.success) {
               setSubjectData(response.data.subject);
            } else {
               setError("ไม่สามารถโหลดข้อมูลรายวิชาได้");
            }
         } catch (error) {
            console.error("Error fetching subject data:", error);
            setError("เกิดข้อผิดพลาดในการโหลดข้อมูลรายวิชา");
         } finally {
            setIsLoading(false);
         }
      };
      
      fetchSubjectData();
   }, [subjectId, apiURL]);

   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <LessonArea 
               isLoading={isLoading}
               subjectData={subjectData}
               error={error}
               subjectId={subjectId}
            />
         </main>
         <FooterOne style={false} style_2={true} />
      </>
   )
}

export default Lesson
