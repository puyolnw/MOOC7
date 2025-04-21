import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import SubjectInfoSection from "./SubjectInfoSection";
import LessonSection from "./LessonSection";
import QuizSection from "./QuizSection";
import InstructorSection from "./InstructorSection";
import CourseSection from "./CourseSection";
import Modals from "./Modals";

// ข้อมูลรายวิชา
export interface SubjectData {
  title: string;
  code: string;
  description: string;
  credits: number;
  department: string;
  coverImage: File | null;
  lessons: SelectedLesson[];
  preTestId: string | null;
  postTestId: string | null;
  instructors: string[];
  allowAllLessons: boolean;
  courses: string[];
}

// บทเรียนที่เลือก
interface SelectedLesson {
  id: string;
  title: string;
  order: number;
}

// แบบทดสอบ
export interface Quiz {
  id: string;
  title: string;
  question_count: number;
}

// อาจารย์
export interface Instructor {
  id: string;  // เปลี่ยนจาก instructor_id เป็น id
  name: string;
  position: string;
  avatar: string;
}

// สาขาวิชา
// สาขาวิชา
export interface Department {
    department_id: string;
    department_name: string;
    description: string;
  }
  

// ประกาศ interface สำหรับ props ของ QuizSection


interface AddSubjectsProps {
  onSubmit?: (subjectData: any) => void;
  onCancel?: () => void;
  subjectToEdit?: string;
}

const AddSubjects: React.FC<AddSubjectsProps> = ({ onSubmit, onCancel, subjectToEdit }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  // สถานะสำหรับการโหลดข้อมูล
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  // สถานะสำหรับข้อมูลรายวิชา
  const [subjectData, setSubjectData] = useState<SubjectData>({
    title: "",
    code: "",
    description: "",
    credits: 3,
    department: "",
    coverImage: null,
    lessons: [],
    preTestId: null,
    postTestId: null,
    instructors: [],
    allowAllLessons: true,
    courses: [],
  });

  // สถานะสำหรับการตรวจสอบความถูกต้อง
  const [errors, setErrors] = useState({
    title: "",
    code: "",
    credits: "",
    coverImage: "",
    lessons: "",
  });

  // สถานะสำหรับการแสดงตัวอย่างรูปภาพ
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  // สถานะสำหรับ Modal
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [quizType, setQuizType] = useState<"pre" | "post">("pre");

  // สถานะสำหรับการค้นหา
  const [lessonSearchTerm, setLessonSearchTerm] = useState("");
  const [quizSearchTerm, setQuizSearchTerm] = useState("");
  const [courseSearchTerm, setCourseSearchTerm] = useState("");
  const [instructorSearchTerm, setInstructorSearchTerm] = useState("");

  // สถานะสำหรับข้อมูลที่โหลดจาก API
  const [availableLessons, setAvailableLessons] = useState<{ id: string; title: string }[]>([]);
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [availableCourses, setAvailableCourses] = useState<
    { id: string; title: string; category: string; subjects: number }[]
  >([]);
  const [availableInstructors, setAvailableInstructors] = useState<Instructor[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<Department[]>([]);

  // โหลดข้อมูลจาก API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setApiError("กรุณาเข้าสู่ระบบก่อนใช้งาน");
          setIsLoading(false);
          return;
        }

        // โหลดข้อมูลบทเรียน
        const lessonsResponse = await axios.get(`${apiUrl}/api/courses/subjects/lessons/available`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (lessonsResponse.data.success) {
          const formattedLessons = lessonsResponse.data.lessons.map((lesson: any) => ({
            id: lesson.lesson_id ? lesson.lesson_id.toString() : "",
            title: lesson.title || "",
          }));
          setAvailableLessons(formattedLessons);
        }

        // โหลดข้อมูลแบบทดสอบ
        const quizzesResponse = await axios.get(`${apiUrl}/api/courses/quizzes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (quizzesResponse.data.message === "ดึงข้อมูลแบบทดสอบสำเร็จ") {
          const formattedQuizzes = quizzesResponse.data.quizzes.map((quiz: any) => ({
            id: quiz.quiz_id ? quiz.quiz_id.toString() : "",
            title: quiz.title || "",
            question_count: quiz.question_count || 0,
          }));
          setAvailableQuizzes(formattedQuizzes);
        }

        // โหลดข้อมูลหลักสูตร
        const coursesResponse = await axios.get(`${apiUrl}/api/courses/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (coursesResponse.data.success) {
          const formattedCourses = coursesResponse.data.courses.map((course: any) => ({
            id: course.course_id ? course.course_id.toString() : "",
            title: course.title || "",
            category: course.category || "ไม่ระบุ",
            subjects: course.subject_count || 0,
          }));
          setAvailableCourses(formattedCourses);
        }

        // โหลดข้อมูลอาจารย์
        const instructorsResponse = await axios.get(`${apiUrl}/api/courses/subjects/instructors/available`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (instructorsResponse.data.success) {
          setAvailableInstructors(instructorsResponse.data.instructors);
        }

        // โหลดข้อมูลสาขาวิชา
        const departmentsResponse = await axios.get(`${apiUrl}/api/courses/subjects/departments/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (departmentsResponse.data.success) {
          setAvailableDepartments(departmentsResponse.data.departments);
        }

        // ถ้ามีการแก้ไขรายวิชา ให้โหลดข้อมูลรายวิชานั้น
        if (subjectToEdit) {
          const subjectResponse = await axios.get(`${apiUrl}/api/courses/subjects/${subjectToEdit}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (subjectResponse.data.success) {
            const subject = subjectResponse.data.subject;

            // จัดรูปแบบข้อมูลบทเรียน
            const formattedLessons = subject.lessons?.map((lesson: any, index: number) => ({
              id: lesson.lesson_id ? lesson.lesson_id.toString() : "",
              title: lesson.title || "",
              order: lesson.order_number || index + 1,
            })) || [];

            // จัดรูปแบบข้อมูลหลักสูตร
            const formattedCourses = subject.courses
              ?.map((course: any) => (course.course_id ? course.course_id.toString() : ""))
              .filter(Boolean) || [];

            // จัดรูปแบบข้อมูลอาจารย์
            const formattedInstructors = subject.instructors
              ?.map((instructor: any) => (instructor.instructor_id ? instructor.instructor_id.toString() : ""))
              .filter(Boolean) || [];

            // ตั้งค่าข้อมูลรายวิชา
            setSubjectData({
              title: subject.subject_name || "",
              code: subject.subject_code || "",
              description: subject.description || "",
              credits: subject.credits || 3,
              department: subject.department ? subject.department.toString() : "",
              coverImage: null,
              lessons: formattedLessons,
              preTestId: subject.preTest?.quiz_id ? subject.preTest.quiz_id.toString() : null,
              postTestId: subject.postTest?.quiz_id ? subject.postTest.quiz_id.toString() : null,
              instructors: formattedInstructors,
              allowAllLessons: subject.allow_all_lessons !== false,
              courses: formattedCourses,
            });

            // ตั้งค่ารูปภาพที่มีอยู่ (base64)
            if (subject.cover_image) {
              setExistingImageUrl(`data:image/jpeg;base64,${subject.cover_image}`);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setApiError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, subjectToEdit]);

  // กรองบทเรียนตามคำค้นหา
  const filteredLessons = availableLessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(lessonSearchTerm.toLowerCase())
  );

  // กรองแบบทดสอบตามคำค้นหา
  const filteredQuizzes = availableQuizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(quizSearchTerm.toLowerCase())
  );

  // กรองหลักสูตรตามคำค้นหา
  const filteredCourses = availableCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(courseSearchTerm.toLowerCase())
  );

  // กรองอาจารย์ตามคำค้นหา
  const filteredInstructors = availableInstructors.filter(
    (instructor) =>
      instructor.name.toLowerCase().includes(instructorSearchTerm.toLowerCase()) ||
      instructor.position.toLowerCase().includes(instructorSearchTerm.toLowerCase())
  );

  // เปลี่ยนแปลงข้อมูลรายวิชา
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "credits") {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setSubjectData({
          ...subjectData,
          [name]: numValue,
        });
      }
    } else {
      setSubjectData({
        ...subjectData,
        [name]: value,
      });
    }

    if (name in errors) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // อัปโหลดรูปภาพปก
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrors({
        ...errors,
        coverImage: "รองรับเฉพาะไฟล์รูปภาพประเภท JPEG, PNG, และ WEBP เท่านั้น",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({
        ...errors,
        coverImage: "ขนาดไฟล์ต้องไม่เกิน 5MB",
      });
      return;
    }

    setSubjectData({
      ...subjectData,
      coverImage: file,
    });

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setExistingImageUrl(null);
    };
    reader.readAsDataURL(file);

    setErrors({
      ...errors,
      coverImage: "",
    });
  };

  // ลบรูปภาพปก
  const handleRemoveImage = () => {
    setSubjectData({
      ...subjectData,
      coverImage: null,
    });
    setImagePreview(null);
    setExistingImageUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // เปลี่ยนแปลงการตั้งค่าการเข้าถึงบทเรียน
  const handleLessonAccessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubjectData({
      ...subjectData,
      allowAllLessons: e.target.checked,
    });
  };

  // เพิ่มบทเรียน
  const handleAddLesson = (lessonId: string) => {
    const lesson = availableLessons.find((l) => l.id === lessonId);
    if (!lesson) return;

    if (subjectData.lessons.some((l) => l.id === lessonId)) return;

    if (subjectData.lessons.length >= 20) {
      toast.warning("สามารถเพิ่มบทเรียนได้สูงสุด 20 บทเรียนเท่านั้น");
      return;
    }

    const newLesson: SelectedLesson = {
      id: lessonId,
      title: lesson.title,
      order: subjectData.lessons.length + 1,
    };

    setSubjectData({
      ...subjectData,
      lessons: [...subjectData.lessons, newLesson],
    });

    setErrors({
      ...errors,
      lessons: "",
    });
  };

  // ลบบทเรียน
  const handleRemoveLesson = (lessonId: string) => {
    const updatedLessons = subjectData.lessons.filter((lesson) => lesson.id !== lessonId);
    const reorderedLessons = updatedLessons.map((lesson, index) => ({
      ...lesson,
      order: index + 1,
    }));

    setSubjectData({
      ...subjectData,
      lessons: reorderedLessons,
    });
  };

  // เปิด Modal เลือกแบบทดสอบ
  const handleOpenQuizModal = (type: "pre" | "post") => {
    setQuizType(type);
    setShowQuizModal(true);
  };

  // เลือกแบบทดสอบ
  const handleSelectQuiz = (quizId: string) => {
    if (quizType === "pre") {
      setSubjectData({
        ...subjectData,
        preTestId: quizId,
      });
    } else {
      setSubjectData({
        ...subjectData,
        postTestId: quizId,
      });
    }
    setShowQuizModal(false);
  };

  // เลือกหรือยกเลิกการเลือกอาจารย์
  const handleToggleInstructor = (instructorId: string) => {
    if (subjectData.instructors.includes(instructorId)) {
      setSubjectData({
        ...subjectData,
        instructors: subjectData.instructors.filter((id) => id !== instructorId),
      });
    } else {
      setSubjectData({
        ...subjectData,
        instructors: [...subjectData.instructors, instructorId],
      });
    }
  };

  // เลือกหรือยกเลิกการเลือกหลักสูตร
  const handleToggleCourse = (courseId: string) => {
    if (subjectData.courses.includes(courseId)) {
      setSubjectData({
        ...subjectData,
        courses: subjectData.courses.filter((id) => id !== courseId),
      });
    } else {
      setSubjectData({
        ...subjectData,
        courses: [...subjectData.courses, courseId],
      });
    }
  };

  // ตรวจสอบความถูกต้องของข้อมูล
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: "",
      code: "",
      credits: "",
      coverImage: "",
      lessons: "",
    };

    if (subjectData.title.trim() === "") {
      newErrors.title = "กรุณาระบุชื่อรายวิชา";
      isValid = false;
    }

    if (subjectData.code.trim() === "") {
      newErrors.code = "กรุณาระบุรหัสรายวิชา";
      isValid = false;
    }

    if (subjectData.credits <= 0) {
      newErrors.credits = "หน่วยกิตต้องมากกว่า 0";
      isValid = false;
    }

    if (subjectData.lessons.length === 0) {
      newErrors.lessons = "กรุณาเพิ่มบทเรียนอย่างน้อย 1 บทเรียน";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // บันทึกข้อมูล
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    setIsSubmitting(true);
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
        setIsSubmitting(false);
        return;
      }
  
      const formData = new FormData();
      formData.append("title", subjectData.title);
      formData.append("code", subjectData.code);
      formData.append("description", subjectData.description);
      formData.append("credits", subjectData.credits.toString());
  
      if (subjectData.department) {
        formData.append("department", subjectData.department);
      }
  
      formData.append("allowAllLessons", subjectData.allowAllLessons.toString());
  
      if (subjectData.coverImage) {
        formData.append("coverImage", subjectData.coverImage);
      }
  
      formData.append(
        "lessons",
        JSON.stringify(
          subjectData.lessons.map((lesson) => ({
            id: lesson.id,
            order: lesson.order,
          }))
        )
      );
  
      if (subjectData.preTestId) {
        formData.append("preTestId", subjectData.preTestId);
      }
  
      if (subjectData.postTestId) {
        formData.append("postTestId", subjectData.postTestId);
      }
  
      if (subjectData.instructors.length > 0) {
        formData.append("instructors", JSON.stringify(subjectData.instructors));
      }
  
      if (subjectData.courses.length > 0) {
        formData.append("courses", JSON.stringify(subjectData.courses));
      }
  
      let response;
  
      if (subjectToEdit) {
        response = await axios.put(`${apiUrl}/api/courses/subjects/${subjectToEdit}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await axios.post(`${apiUrl}/api/courses/subjects`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }
  
      if (response.data.success) {
        toast.success(subjectToEdit ? "แก้ไขรายวิชาสำเร็จ" : "สร้างรายวิชาสำเร็จ");
  
        if (onSubmit) {
          onSubmit(response.data.subject);
        }
  
        if (!subjectToEdit) {
          setSubjectData({
            title: "",
            code: "",
            description: "",
            credits: 3,
            department: "",
            coverImage: null,
            lessons: [],
            preTestId: null,
            postTestId: null,
            instructors: [],
            allowAllLessons: true,
            courses: [],
          });
          setImagePreview(null);
          setExistingImageUrl(null);
  
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      }
    } catch (error: any) {
      console.error("Error submitting subject:", error);
      const errorMessage =
        error.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  // ยกเลิก
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // หาข้อมูลแบบทดสอบจาก ID
// หาข้อมูลแบบทดสอบจาก ID
const findQuizById = (quizId: string | null): Quiz | null => {
    if (!quizId) return null; // ถ้า quizId เป็น null ให้คืนค่า null ทันที
  
    // ตรวจสอบว่า availableQuizzes มีข้อมูลหรือไม่
    if (!availableQuizzes || availableQuizzes.length === 0) {
      console.warn("ไม่มีข้อมูลแบบทดสอบที่สามารถใช้ได้");
      return null;
    }
  
    // ค้นหาแบบทดสอบจาก availableQuizzes
    const quiz = availableQuizzes.find((quiz) => quiz.id === quizId);
    if (!quiz) {
      console.warn(`ไม่พบแบบทดสอบที่มี ID: ${quizId}`);
      return null;
    }
  
    return quiz;
  };
  

  // หาข้อมูลหลักสูตรจาก ID
  const findCourseById = (courseId: string) => {
    return availableCourses.find((course) => course.id === courseId);
  };

  // หาข้อมูลอาจารย์จาก ID
  const findInstructorById = (instructorId: string) => {
    return availableInstructors.find((instructor) => instructor.id === instructorId);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Inline CSS for modal animation and scrollable body */}
      <style>
        {`
          .modal-body-scrollable {
            max-height: 60vh;
            overflow-y: auto;
          }

          .modal-slide-down {
            animation: slideDown 0.3s ease-out;
          }

          @keyframes slideDown {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          .modal-dialog-centered {
            display: flex;
            align-items: center;
            min-height: calc(100% - 1rem);
          }

          @media (min-width: 576px) {
            .modal-dialog-centered {
              min-height: calc(100% - 3.5rem);
            }
          }
        `}
      </style>

      {/* API Status Messages */}
      {apiSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="fas fa-check-circle me-2"></i>
          {apiSuccess}
          <button
            type="button"
            className="btn-close"
            onClick={() => setApiSuccess("")}
            aria-label="Close"
          ></button>
        </div>
      )}

      {apiError && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {apiError}
          <button
            type="button"
            className="btn-close"
            onClick={() => setApiError("")}
            aria-label="Close"
          ></button>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-3">กำลังโหลดข้อมูล...</p>
        </div>
      ) : (
        <>
          <SubjectInfoSection
            subjectData={subjectData}
            errors={errors}
            availableDepartments={availableDepartments}
            handleInputChange={handleInputChange}
            handleImageUpload={handleImageUpload}
            handleRemoveImage={handleRemoveImage}
            fileInputRef={fileInputRef}
            imagePreview={imagePreview}
            existingImageUrl={existingImageUrl}
          />

          <LessonSection
            subjectData={subjectData}
            errors={errors}
            handleLessonAccessChange={handleLessonAccessChange}
            handleRemoveLesson={handleRemoveLesson}
            setShowLessonModal={setShowLessonModal}
          />

          <QuizSection
            subjectData={subjectData}
            setSubjectData={setSubjectData}
            findQuizById={findQuizById}
            handleOpenQuizModal={handleOpenQuizModal}
          />

          <InstructorSection
            subjectData={subjectData}
            findInstructorById={findInstructorById}
            handleToggleInstructor={handleToggleInstructor}
            setShowInstructorModal={setShowInstructorModal}
          />

          <CourseSection
            subjectData={subjectData}
            findCourseById={findCourseById}
            handleToggleCourse={handleToggleCourse}
            setShowCourseModal={setShowCourseModal}
          />

          {/* ปุ่มบันทึกและยกเลิก */}
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button type="button" className="btn btn-outline-secondary" onClick={handleCancel}>
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>{subjectToEdit ? "บันทึกการแก้ไข" : "บันทึกรายวิชา"}
                </>
              )}
            </button>
          </div>

          <Modals
            showLessonModal={showLessonModal}
            showQuizModal={showQuizModal}
            showInstructorModal={showInstructorModal}
            showCourseModal={showCourseModal}
            setShowLessonModal={setShowLessonModal}
            setShowQuizModal={setShowQuizModal}
            setShowInstructorModal={setShowInstructorModal}
            setShowCourseModal={setShowCourseModal}
            lessonSearchTerm={lessonSearchTerm}
            quizSearchTerm={quizSearchTerm}
            instructorSearchTerm={instructorSearchTerm}
            courseSearchTerm={courseSearchTerm}
            setLessonSearchTerm={setLessonSearchTerm}
            setQuizSearchTerm={setQuizSearchTerm}
            setInstructorSearchTerm={setInstructorSearchTerm}
            setCourseSearchTerm={setCourseSearchTerm}
            filteredLessons={filteredLessons}
            filteredQuizzes={filteredQuizzes}
            filteredInstructors={filteredInstructors}
            filteredCourses={filteredCourses}
            handleAddLesson={handleAddLesson}
            handleSelectQuiz={handleSelectQuiz}
            handleToggleInstructor={handleToggleInstructor}
            handleToggleCourse={handleToggleCourse}
            subjectData={subjectData}
            quizType={quizType}
          />
        </>
      )}
    </form>
  );
};

export default AddSubjects;
