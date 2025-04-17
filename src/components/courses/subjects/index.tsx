import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import FooterOne from "../../../layouts/footers/FooterOne";
import HeaderOne from "../../../layouts/headers/HeaderOne";
import BreadcrumbTwo from "../../common/breadcrumb/BreadcrumbTwo";
import SubjectDetailsArea from "./SubjectDetailsArea";

const SubjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3301';
  const [subjectDetails, setSubjectDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ฟังก์ชันสำหรับดึงข้อมูลรายวิชา
    const fetchSubjectDetails = async () => {
      try {
        // เริ่มการโหลด
        setIsLoading(true);
        setError(null);
        
        // ตรวจสอบว่ามี id หรือไม่
        if (!id) return;
        
        // URL ที่ถูกต้องตามที่กำหนดใน back_creditbank/index.js
        const url = `${apiURL}/api/courses/subjects/${id}`;
        console.log(`Fetching subject data from: ${url}`);
        
        // เรียก API
        const response = await axios.get(url);
        console.log("API Response:", response.data);
        
        // ตรวจสอบผลลัพธ์
        if (response.data && response.data.success && response.data.subject) {
          console.log("Subject data received successfully:", response.data.subject);
          
          // แปลงค่า file_count และ subject_count จาก string เป็น number
          const subjectData = {
            ...response.data.subject,
            lessons: response.data.subject.lessons.map((lesson: any) => ({
              ...lesson,
              file_count: parseInt(lesson.file_count, 10) || 0
            })),
            courses: response.data.subject.courses.map((course: any) => ({
              ...course,
              subject_count: parseInt(course.subject_count, 10) || 0
            })),
            quiz_count: response.data.subject.quiz_count || 0
          };
          
          console.log("Processed subject data:", subjectData);
          setSubjectDetails(subjectData);
        } else {
          console.error("API returned invalid data:", response.data);
          setError("ไม่สามารถดึงข้อมูลรายวิชาได้");
        }
      } catch (error) {
        // จัดการกับข้อผิดพลาด
        console.error("Error fetching subject details:", error);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูลรายวิชา");
      } finally {
        // สิ้นสุดการโหลด
        setIsLoading(false);
      }
    };
    
    // เรียกใช้ฟังก์ชัน
    fetchSubjectDetails();
  }, [apiURL, id]); // เรียกใช้เมื่อ apiURL หรือ id เปลี่ยนแปลง

  // ตรวจสอบข้อมูลก่อนส่งไปยัง SubjectDetailsArea
  console.log("Before rendering, subjectDetails:", subjectDetails);

  return (
    <>
      <HeaderOne />
      <main className="main-area fix">
        <BreadcrumbTwo 
          title={subjectDetails ? `${subjectDetails.subject_code} - ${subjectDetails.subject_name}` : "รายละเอียดรายวิชา"} 
          sub_title="รายวิชา" 
        />
        {isLoading ? (
          <div className="container py-5 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">กำลังโหลด...</span>
            </div>
            <p className="mt-3">กำลังโหลดข้อมูลรายวิชา...</p>
          </div>
        ) : error ? (
          <div className="container py-5 text-center">
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          </div>
        ) : !subjectDetails ? (
          <div className="container py-5 text-center">
            <div className="alert alert-warning">
              <i className="fas fa-exclamation-triangle me-2"></i>
              ไม่พบข้อมูลรายวิชา
            </div>
          </div>
        ) : (
          <SubjectDetailsArea subject_details={subjectDetails} />
        )}
      </main>
      <FooterOne style={false} style_2={true} />
    </>
  );
};

export default SubjectDetails;
