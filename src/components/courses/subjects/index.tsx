import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import FooterOne from "../../../layouts/footers/FooterOne";
import HeaderOne from "../../../layouts/headers/HeaderOne";
import BreadcrumbTwo from "../../common/breadcrumb/BreadcrumbTwo";
import SubjectDetailsArea from "./SubjectDetailsArea";
import { toast } from "react-toastify";

const SubjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const apiURL = import.meta.env.VITE_API_URL || "http://localhost:3301";
  const [subjectDetails, setSubjectDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Extract course_id from location state or query params
  const courseId = location.state?.courseId || new URLSearchParams(location.search).get('courseId');

  useEffect(() => {
    const fetchSubjectDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!id || isNaN(parseInt(id, 10)) || parseInt(id, 10) <= 0) {
          console.error("Invalid subject ID:", id);
          setError("รหัสรายวิชาไม่ถูกต้อง");
          setIsLoading(false);
          navigate("/courses");
          toast.error("รหัสรายวิชาไม่ถูกต้อง");
          return;
        }

        const subjectId = parseInt(id, 10);
        const url = `${apiURL}/api/courses/subjects/${subjectId}`;

        const token = localStorage.getItem("token");
        const response = await axios.get(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (response.data && response.data.success && response.data.subject) {
          const subjectData = {
            ...response.data.subject,
            lessons: response.data.subject.lessons.map((lesson: any) => ({
              ...lesson,
              file_count: parseInt(lesson.file_count, 10) || 0,
            })),
            courses: response.data.subject.courses.map((course: any) => ({
              ...course,
              subject_count: parseInt(course.subject_count, 10) || 0,
            })),
            quiz_count: parseInt(response.data.subject.quiz_count, 10) || 0,
          };

          setSubjectDetails(subjectData);
        } else {
          console.error("API returned invalid data:", response.data);
          setError("ไม่สามารถดึงข้อมูลรายวิชาได้");
          toast.error("ไม่สามารถดึงข้อมูลรายวิชาได้");
        }
      } catch (error: any) {
        console.error("Error fetching subject details:", error);
        let errorMessage = "เกิดข้อผิดพลาดในการดึงข้อมูลรายวิชา";
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          errorMessage = "เซสชันของคุณหมดอายุ กรุณาเข้าสู่ระบบใหม่";
          navigate("/login");
        } else if (error.response?.status === 404) {
          errorMessage = "ไม่พบรายวิชาที่ระบุ";
        } else if (error.response?.status === 400) {
          errorMessage = error.response.data.message || "รหัสรายวิชาไม่ถูกต้อง";
        }
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjectDetails();
  }, [apiURL, id, navigate]);

  return (
    <>
      <HeaderOne />
      <main className="main-area fix">
        <BreadcrumbTwo
          title={
            subjectDetails
              ? `${subjectDetails.subject_code} - ${subjectDetails.subject_name}`
              : "รายละเอียดรายวิชา"
          }
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
          <SubjectDetailsArea 
            subject_details={subjectDetails} 
            course_id={courseId} // Pass course_id to SubjectDetailsArea
          />
        )}
      </main>
      <FooterOne style={false} style_2={true} />
    </>
  );
};

export default SubjectDetails;
