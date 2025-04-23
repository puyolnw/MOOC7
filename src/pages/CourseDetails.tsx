import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Wrapper from "../layouts/Wrapper";
import CourseDetailsMain from "../components/courses/course-details";
import SEO from "../components/SEO";

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL || "http://localhost:3301";
  const [courseDetails, setCourseDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instructors, setInstructors] = useState<any[]>([]);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!id) return;

        const response = await axios.get(`${apiURL}/api/courses/${id}`);

        if (response.data.success) {
          setCourseDetails(response.data.course);

          // รวบรวมผู้สอนทั้งหมดจากทุกวิชา (ไม่ซ้ำกัน)
          if (response.data.course.subjects && response.data.course.subjects.length > 0) {
            try {
              const instructorsResponse = await axios.get(`${apiURL}/api/courses/${id}/instructors`);
              if (instructorsResponse.data.success) {
                setInstructors(instructorsResponse.data.instructors);
              }
            } catch (error) {
              console.error("Error fetching instructors:", error);
              // ไม่ต้อง set error เพราะถือว่าเป็นข้อมูลเสริม
            }
          }
        } else {
          setError("ไม่สามารถดึงข้อมูลหลักสูตรได้");
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูลหลักสูตร");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [apiURL, id]);

  // คำนวณจำนวนบทเรียนทั้งหมดในหลักสูตร
  const totalLessons =
    courseDetails?.subjects?.reduce(
      (total: number, subject: any) => total + (parseInt(subject.lesson_count) || 0),
      0
    ) || 0;

  // คำนวณจำนวนแบบทดสอบทั้งหมดในหลักสูตร
  const totalQuizzes =
    courseDetails?.subjects?.reduce(
      (total: number, subject: any) => {
        // รวมแบบทดสอบในบทเรียน
        const lessonQuizCount = parseInt(subject.quiz_count) || 0;
        // รวมแบบทดสอบก่อนเรียนและหลังเรียน
        const subjectQuizCount = parseInt(subject.subject_quiz_count) || 0;
        return total + lessonQuizCount + subjectQuizCount;
      },
      0
    ) || 0;

  // ฟังก์ชันสำหรับเริ่มเรียนคอร์ส
  const handleStartLearning = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // เรียก API เพื่อดึงข้อมูลวิชาที่ลงทะเบียนในคอร์สนี้
      const response = await axios.get(`${apiURL}/api/courses/${id}/enrolled-subjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success && response.data.subjects.length > 0) {
        // ถ้ามีวิชาที่ลงทะเบียน ให้นำทางไปยังวิชาแรก
        const firstSubject = response.data.subjects[0];
        navigate(`/course-learning/${id}/${firstSubject.subject_id}`);
      } else {
        // ถ้าไม่มีวิชาที่ลงทะเบียน ให้แสดงข้อความแจ้งเตือน
        alert("คุณยังไม่ได้ลงทะเบียนวิชาในคอร์สนี้");
      }
    } catch (error: unknown) {
      console.error("Error fetching enrolled subjects:", error);

      // Type narrowing for error
      if (error && typeof error === "object" && "response" in error) {
        // This is likely an Axios error
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response && axiosError.response.status === 403) {
          alert("คุณยังไม่ได้ลงทะเบียนในคอร์สนี้");
        } else {
          alert("เกิดข้อผิดพลาดในการเริ่มเรียน กรุณาลองใหม่อีกครั้ง");
        }
      } else {
        // Generic error handling
        alert("เกิดข้อผิดพลาดในการเริ่มเรียน กรุณาลองใหม่อีกครั้ง");
      }
    }
  };

  // ข้อมูลที่จะส่งไปให้ CourseDetailsMain component
  const single_course = {
    id: courseDetails?.course_id || 0,
    title: courseDetails?.title || "กำลังโหลด...",
    category: courseDetails?.category || "",
    department: courseDetails?.department_name || "หลักสูตรกลาง",
    description: courseDetails?.description || "",
    thumb: courseDetails?.cover_image
      ? `${apiURL}/api/courses/image/${courseDetails.cover_image_file_id}` 
      : "/assets/img/courses/course_thumb01.jpg",
    videoUrl: courseDetails?.video_url || "", // ตรวจสอบว่ามีการส่ง video_url จาก API
    subjects: courseDetails?.subjects || [],
    subjectCount: courseDetails?.subjects?.length || 0,
    totalLessons,
    totalQuizzes,
    instructors: instructors,
    isLoading,
    error,
    onStartLearning: handleStartLearning, // เพิ่มฟังก์ชันสำหรับเริ่มเรียน
  };

  return (
    <Wrapper>
      <SEO pageTitle={courseDetails?.title || "รายละเอียดหลักสูตร"} />
      <CourseDetailsMain single_course={single_course} />
    </Wrapper>
  );
};

export default CourseDetails;