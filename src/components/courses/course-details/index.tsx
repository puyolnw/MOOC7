import { useEffect, useState } from "react";
import axios from "axios";
import FooterOne from "../../../layouts/footers/FooterOne";
import HeaderOne from "../../../layouts/headers/HeaderOne";
import BreadcrumbTwo from "../../common/breadcrumb/BreadcrumbTwo";
import CourseDetailsArea from "./CourseDetailsArea";
import EnrolledCourseDetailsArea from "./EnrolledCourseDetailsArea"; // สร้างไฟล์ใหม่สำหรับแสดงหลักสูตรที่ลงทะเบียนแล้ว

interface CourseDetailsProps {
  single_course: {
    id: number;
    title: string;
    category: string;
    department: string;
    description: string;
    thumb: string;
    videoUrl?: string;
    subjects: any[];
    subjectCount: number;
    totalLessons: number;
    totalQuizzes: number;
    instructors: any[];
    isLoading: boolean;
    onStartLearning?: () => void; // เพิ่มฟังก์ชันนี้
    error: string | null;
  };
}

const CourseDetails = ({ single_course }: CourseDetailsProps) => {
  // Define API_URL at the top of the component
  const API_URL = import.meta.env.VITE_API_URL;
  
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<any>(null);
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(true);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  // ในส่วนของ useEffect ที่ตรวจสอบการลงทะเบียน
  useEffect(() => {
    // ป้องกันการเรียกซ้ำถ้ากำลังตรวจสอบอยู่แล้ว
    if (!single_course || !single_course.id) return;
    
    // ตรวจสอบว่า user ลงทะเบียนหลักสูตรนี้หรือไม่
    const checkEnrollment = async () => {
      try {
        // ตรวจสอบว่ามี token หรือไม่ (user ล็อกอินหรือไม่)
        const token = localStorage.getItem('token');
        if (!token) {
          // ถ้าไม่มี token ให้ถือว่ายังไม่ได้ลงทะเบียน
          setIsEnrolled(false);
          setIsCheckingEnrollment(false);
          return;
        }
        
        // เรียก API เพื่อตรวจสอบการลงทะเบียน
        console.log("API URL:", `${API_URL}/api/courses/${single_course.id}/progress`);
        
        const response = await fetch(`${API_URL}/api/courses/${single_course.id}/progress`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log("Fetch response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          
          // Check if this is the specific constraint error
          if (errorText.includes("course_enrollments_status_check") || 
              errorText.includes("enrollments_status_check")) {
            console.log("Detected enrollment status constraint error - handling as not enrolled");
            setIsEnrolled(false);
            setIsCheckingEnrollment(false);
            return;
          }
          
          // ถ้าเป็น 404 แสดงว่ายังไม่ได้ลงทะเบียน ไม่ถือเป็น error
          if (response.status === 404) {
            setIsEnrolled(false);
            setIsCheckingEnrollment(false);
            return;
          }
          
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          // ถ้าเรียก API สำเร็จและมีข้อมูล แสดงว่าลงทะเบียนแล้ว
          setIsEnrolled(true);
          setEnrollmentData(data);
        } else {
          // ถ้าเรียก API สำเร็จแต่ไม่มีข้อมูล แสดงว่ายังไม่ได้ลงทะเบียน
          setIsEnrolled(false);
        }
      } catch (error) {
        console.error("Error checking enrollment:", error);
        // ในกรณีที่เกิด error ให้ถือว่ายังไม่ได้ลงทะเบียน
        setIsEnrolled(false);
      } finally {
        // ไม่ว่าจะสำเร็จหรือไม่ ให้ตั้งค่า isCheckingEnrollment เป็น false
        setIsCheckingEnrollment(false);
      }
    };
    
    checkEnrollment();
  }, [single_course?.id, API_URL]); // เพิ่ม API_URL เป็น dependency

  // ฟังก์ชันสำหรับลงทะเบียนหลักสูตร
  const handleEnroll = async () => {
    try {
      setEnrollError(null);
      
      // ตรวจสอบว่ามี token หรือไม่ (user ล็อกอินหรือไม่)
      const token = localStorage.getItem('token');
      if (!token) {
        // ถ้าไม่มี token ให้ redirect ไปหน้า login
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        return;
      }
      
      // เรียก API เพื่อลงทะเบียนหลักสูตร
      const response = await axios.post(
        `${API_URL}/api/courses/${single_course.id}/enroll`, 
        {}, // ส่ง empty object เพราะเป็น POST request
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        // ลงทะเบียนสำเร็จ
        setIsEnrolled(true);
        
        // ดึงข้อมูลความก้าวหน้า
        const progressResponse = await axios.get(
          `${API_URL}/api/courses/${single_course.id}/progress`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (progressResponse.data.success) {
          setEnrollmentData(progressResponse.data);
        }
        
        // แสดงข้อความแจ้งเตือนว่าลงทะเบียนสำเร็จ
        alert("ลงทะเบียนหลักสูตรสำเร็จ");
      } else {
        // ลงทะเบียนไม่สำเร็จ
        setEnrollError(response.data.message || "เกิดข้อผิดพลาดในการลงทะเบียนหลักสูตร");
      }
    } catch (error: any) {
      console.error("Error enrolling in course:", error);
      
      // แสดงข้อความ error ที่ได้จาก API
      if (error.response && error.response.data && error.response.data.message) {
        setEnrollError(error.response.data.message);
      } else {
        setEnrollError("เกิดข้อผิดพลาดในการลงทะเบียนหลักสูตร กรุณาลองใหม่อีกครั้ง");
      }
    }
  };
  
  return (
    <>
      <HeaderOne />
      <main className="main-area fix">
        <BreadcrumbTwo title={single_course.title} sub_title="หลักสูตร" />
        
        {single_course.isLoading || isCheckingEnrollment ? (
          // แสดง loading ระหว่างโหลดข้อมูล
          <div className="container py-5 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">กำลังโหลด...</span>
            </div>
            <p className="mt-3">กำลังโหลดข้อมูล...</p>
          </div>
        ) : single_course.error ? (
          // แสดง error ถ้าโหลดข้อมูลหลักสูตรไม่สำเร็จ
          <div className="container py-5">
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {single_course.error}
            </div>
          </div>
        ) : isEnrolled ? (
          // แสดงหน้าสำหรับผู้ที่ลงทะเบียนแล้ว
          <EnrolledCourseDetailsArea 
            single_course={single_course} 
            enrollmentData={enrollmentData} 
            onStartLearning={single_course.onStartLearning} // เพิ่ม prop นี้
          />
        ) : (
          // แสดงหน้าปกติสำหรับผู้ที่ยังไม่ได้ลงทะเบียน
          <>
            {enrollError && (
              <div className="container mt-4">
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {enrollError}
                </div>
              </div>
            )}
            <CourseDetailsArea 
              single_course={single_course} 
              onEnroll={handleEnroll} 
            />
          </>
        )}
      </main>
      <FooterOne style={false} style_2={true} />
    </>
  );
};

export default CourseDetails;
