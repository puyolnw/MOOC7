import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// ข้อมูลรายวิชา
interface SubjectData {
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
interface Quiz {
  id: string;
  title: string;
  question_count: number;
}

// อาจารย์
interface Instructor {
  instructor_id: string;
  name: string;
  position: string;
  avatar: string;
}

// สาขาวิชา
interface Department {
  department_id: string;
  department_name: string;
  description: string;
}

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
  const [imageLoadError, setImageLoadError] = useState(false);

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

  // ฟังก์ชันแปลง webViewLink เป็น URL สำหรับแสดงรูปภาพ
  const getImageUrl = (webViewLink: string | null) => {
    if (!webViewLink) return null;
    const fileIdMatch = webViewLink.match(/\/d\/(.+?)\//);
    if (!fileIdMatch) return null;
    const fileId = fileIdMatch[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  };

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
        } else {
          throw new Error("ไม่สามารถดึงข้อมูลบทเรียนได้");
        }

        // โหลดข้อมูลแบบทดสอบ
        // โหลดข้อมูลแบบทดสอบ
        // โหลดข้อมูลแบบทดสอบ
        const quizzesResponse = await axios.get(`${apiUrl}/api/courses/quizzes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (quizzesResponse.data.success || quizzesResponse.data.message === "ดึงข้อมูลแบบทดสอบสำเร็จ") {
          const formattedQuizzes = quizzesResponse.data.quizzes?.map((quiz: any) => ({
            id: quiz.quiz_id ? quiz.quiz_id.toString() : "",
            title: quiz.title || "",
            question_count: quiz.question_count || 0,
          })) || [];
          setAvailableQuizzes(formattedQuizzes);
        } else {
          throw new Error(quizzesResponse.data.message || "ไม่สามารถดึงข้อมูลแบบทดสอบได้");
        }

        // โหลดข้อมูลหลักสูตร
        const coursesResponse = await axios.get(`${apiUrl}/api/courses`, {
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
        } else {
          throw new Error("ไม่สามารถดึงข้อมูลหลักสูตรได้");
        }

        // โหลดข้อมูลอาจารย์
        const instructorsResponse = await axios.get(`${apiUrl}/api/courses/subjects/instructors/available`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (instructorsResponse.data.success) {
          setAvailableInstructors(instructorsResponse.data.instructors);
        } else {
          throw new Error("ไม่สามารถดึงข้อมูลอาจารย์ได้");
        }

        // โหลดข้อมูลสาขาวิชา
        const departmentsResponse = await axios.get(`${apiUrl}/api/courses/subjects/departments/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (departmentsResponse.data.success) {
          setAvailableDepartments(departmentsResponse.data.departments);
        } else {
          throw new Error("ไม่สามารถดึงข้อมูลสาขาวิชาได้");
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

            // ตั้งค่ารูปภาพที่มีอยู่ (ใช้ URL จาก Google Drive)
            if (subject.cover_image) {
              setExistingImageUrl(subject.cover_image);
            }
          } else {
            throw new Error("ไม่สามารถดึงข้อมูลรายวิชาได้");
          }
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setApiError(error.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
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
      setImageLoadError(false);
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
    setImageLoadError(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // เปลี่ยนแปลงการตั้งค่าการเข้าถึงบทเรียน


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
          onSubmit(response.data);
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
          setImageLoadError(false);

          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      } else {
        throw new Error(response.data.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error: any) {
      console.error("Error submitting subject:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
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
  const findQuizById = (quizId: string | null) => {
    if (!quizId) return null;
    return availableQuizzes.find((quiz) => quiz.id === quizId);
  };

  // หาข้อมูลหลักสูตรจาก ID
  const findCourseById = (courseId: string) => {
    return availableCourses.find((course) => course.id === courseId);
  };

  // หาข้อมูลอาจารย์จาก ID
  const findInstructorById = (instructorId: string) => {
    return availableInstructors.find((instructor) => instructor.instructor_id === instructorId);
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
          {/* ส่วนที่ 1: ข้อมูลรายวิชา */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">1. ข้อมูลรายวิชา</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      ชื่อรายวิชา <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.title ? "is-invalid" : ""}`}
                      id="title"
                      name="title"
                      value={subjectData.title}
                      onChange={handleInputChange}
                      placeholder="ระบุชื่อรายวิชา"
                    />
                    {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="code" className="form-label">
                          รหัสรายวิชา <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.code ? "is-invalid" : ""}`}
                          id="code"
                          name="code"
                          value={subjectData.code}
                          onChange={handleInputChange}
                          placeholder="เช่น CS101"
                        />
                        {errors.code && <div className="invalid-feedback">{errors.code}</div>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="credits" className="form-label">
                          หน่วยกิต <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className={`form-control ${errors.credits ? "is-invalid" : ""}`}
                          id="credits"
                          name="credits"
                          value={subjectData.credits}
                          onChange={handleInputChange}
                          min="1"
                          max="12"
                        />
                        {errors.credits && <div className="invalid-feedback">{errors.credits}</div>}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="department" className="form-label">
                      สาขาวิชา
                    </label>
                    <select
                      className="form-select"
                      id="department"
                      name="department"
                      value={subjectData.department}
                      onChange={handleInputChange}
                    >
                      <option value="">เลือกสาขาวิชา</option>
                      {availableDepartments.map((dept) => (
                        <option key={dept.department_id} value={dept.department_id}>
                          {dept.department_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      คำอธิบายรายวิชา
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      value={subjectData.description}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="ระบุคำอธิบายรายวิชา"
                    ></textarea>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label">รูปภาพปก</label>
                    <div className="cover-image-container">
                      {imagePreview || (existingImageUrl && !imageLoadError) ? (
                        <div className="position-relative">
                          <img
                            src={imagePreview || getImageUrl(existingImageUrl) || ""}
                            alt="รูปภาพปก"
                            className="img-fluid rounded"
                            style={{ maxHeight: "200px", width: "100%", objectFit: "cover" }}
                            onError={() => setImageLoadError(true)}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                            onClick={handleRemoveImage}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ) : imageLoadError ? (
                        <div
                          className="border rounded p-3 text-center bg-light"
                          style={{ cursor: "pointer" }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <i className="fas fa-exclamation-triangle fa-3x text-danger mb-2"></i>
                          <p className="mb-0 text-danger">ไม่สามารถโหลดรูปภาพได้</p>
                          <small className="text-muted">คลิกเพื่ออัปโหลดรูปภาพใหม่</small>
                        </div>
                      ) : (
                        <div
                          className="border rounded p-3 text-center bg-light"
                          style={{ cursor: "pointer" }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <i className="fas fa-image fa-3x text-muted mb-2"></i>
                          <p className="mb-0">คลิกเพื่ออัปโหลดรูปภาพ</p>
                          <small className="text-muted">รองรับไฟล์ JPEG, PNG, WEBP ขนาดไม่เกิน 5MB</small>
                        </div>
                      )}
                      <input
                        type="file"
                        className="d-none"
                        ref={fileInputRef}
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        onChange={handleImageUpload}
                      />
                      {errors.coverImage && <div className="text-danger small mt-2">{errors.coverImage}</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ส่วนที่ 2: บทเรียนในรายวิชา */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">2. บทเรียนในรายวิชา</h5>
              <div>
                <span className="badge bg-primary rounded-pill me-2">
                  {subjectData.lessons.length} / 20 บทเรียน
                </span>
              </div>
            </div>
            <div className="card-body">
              {errors.lessons && (
                <div className="alert alert-danger" role="alert">
                  {errors.lessons}
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center mb-3">
                
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowLessonModal(true)}
                  disabled={subjectData.lessons.length >= 20}
                >
                  <i className="fas fa-plus-circle me-2"></i>เพิ่มบทเรียน
                </button>
              </div>

              {subjectData.lessons.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "60px" }}>ลำดับ</th>
                        <th>ชื่อบทเรียน</th>
                        <th style={{ width: "80px" }}>จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectData.lessons.map((lesson, index) => (
                        <tr key={lesson.id}>
                          <td className="text-center">{index + 1}</td>
                          <td>{lesson.title}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemoveLesson(lesson.id)}
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-info" role="alert">
                  ยังไม่มีบทเรียนในรายวิชานี้ กรุณาเพิ่มบทเรียนอย่างน้อย 1 บทเรียนนะ
                </div>
              )}
            </div>
          </div>

          {/* ส่วนที่ 3: แบบทดสอบ */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">3. แบบทดสอบ</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">แบบทดสอบก่อนเรียน (Pre-test)</label>
                    <div className="d-flex">
                      <div className="flex-grow-1">
                        {subjectData.preTestId ? (
                          <div className="border rounded p-3 bg-light">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="mb-0">{findQuizById(subjectData.preTestId)?.title || "แบบทดสอบที่เลือก"}</h6>
                                <small className="text-muted">
                                  {findQuizById(subjectData.preTestId)?.question_count || 0} คำถาม
                                </small>
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => setSubjectData({ ...subjectData, preTestId: null })}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-outline-primary w-100"
                            onClick={() => handleOpenQuizModal("pre")}
                          >
                            <i className="fas fa-plus-circle me-2"></i>เลือกแบบทดสอบก่อนเรียน
                          </button>
                        )}
                      </div>
                    </div>
                    <small className="text-muted d-block mt-2">
                      แบบทดสอบก่อนเรียนจะให้ผู้เรียนทำก่อนเริ่มเรียนรายวิชา
                    </small>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">แบบทดสอบหลังเรียน (Post-test)</label>
                    <div className="d-flex">
                      <div className="flex-grow-1">
                        {subjectData.postTestId ? (
                          <div className="border rounded p-3 bg-light">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="mb-0">{findQuizById(subjectData.postTestId)?.title || "แบบทดสอบที่เลือก"}</h6>
                                <small className="text-muted">
                                  {findQuizById(subjectData.postTestId)?.question_count || 0} คำถาม
                                </small>
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => setSubjectData({ ...subjectData, postTestId: null })}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-outline-primary w-100"
                            onClick={() => handleOpenQuizModal("post")}
                          >
                            <i className="fas fa-plus-circle me-2"></i>เลือกแบบทดสอบหลังเรียน
                          </button>
                        )}
                      </div>
                    </div>
                    <small className="text-muted d-block mt-2">
                      แบบทดสอบหลังเรียนจะให้ผู้เรียนทำหลังจากเรียนรายวิชาเสร็จสิ้น
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ส่วนที่ 4: อาจารย์ผู้สอน */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">4. อาจารย์ผู้สอน</h5>
            </div>
            <div className="card-body">
              <p className="text-muted mb-3">
                คุณสามารถเลือกอาจารย์ผู้สอนสำหรับรายวิชานี้ได้ (ไม่บังคับ) และสามารถเลือกได้มากกว่า 1 คน
              </p>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  {subjectData.instructors.length > 0 ? (
                    <span className="badge bg-success rounded-pill">
                      เลือกแล้ว {subjectData.instructors.length} อาจารย์
                    </span>
                  ) : (
                    <span className="badge bg-secondary rounded-pill">
                      ยังไม่ได้เลือกอาจารย์
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setShowInstructorModal(true)}
                >
                  <i className="fas fa-user-plus me-2"></i>เลือกอาจารย์
                </button>
              </div>

              {subjectData.instructors.length > 0 && (
                <div className="selected-instructors">
                  <h6 className="mb-2">อาจารย์ที่เลือก:</h6>
                  <div className="row g-2">
                    {subjectData.instructors.map((instructorId) => {
                      const instructor = findInstructorById(instructorId);
                      return instructor ? (
                        <div key={instructor.instructor_id} className="col-md-6">
                          <div className="card border h-100">
                            <div className="card-body py-2 px-3">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <h6 className="mb-1">{instructor.name}</h6>
                                  <p className="mb-0 small text-muted">{instructor.position}</p>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-sm text-danger"
                                  onClick={() => handleToggleInstructor(instructor.instructor_id)}
                                >
                                  <i className="fas fa-times-circle"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ส่วนที่ 5: หลักสูตรที่เกี่ยวข้อง */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">5. หลักสูตรที่เกี่ยวข้อง</h5>
            </div>
            <div className="card-body">
              <p className="text-muted mb-3">
                คุณสามารถเลือกหลักสูตรที่จะใช้รายวิชานี้ได้ (ไม่บังคับ) และสามารถเลือกได้มากกว่า 1 หลักสูตร
              </p>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  {subjectData.courses.length > 0 ? (
                    <span className="badge bg-success rounded-pill">
                      เลือกแล้ว {subjectData.courses.length} หลักสูตร
                    </span>
                  ) : (
                    <span className="badge bg-secondary rounded-pill">
                      ยังไม่ได้เลือกหลักสูตร
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setShowCourseModal(true)}
                >
                  <i className="fas fa-book me-2"></i>เลือกหลักสูตร
                </button>
              </div>

              {subjectData.courses.length > 0 && (
                <div className="selected-courses">
                  <h6 className="mb-2">หลักสูตรที่เลือก:</h6>
                  <div className="row g-2">
                    {subjectData.courses.map((courseId) => {
                      const course = findCourseById(courseId);
                      return course ? (
                        <div key={course.id} className="col-md-6">
                          <div className="card border h-100">
                            <div className="card-body py-2 px-3">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <h6 className="mb-1">{course.title}</h6>
                                  <p className="mb-0 small text-muted">
                                    หมวดหมู่: {course.category} | รายวิชา: {course.subjects} วิชา
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-sm text-danger"
                                  onClick={() => handleToggleCourse(course.id)}
                                >
                                  <i className="fas fa-times-circle"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

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

          {/* Modal เลือกบทเรียน */}
          {showLessonModal && (
            <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog modal-lg modal-dialog-centered modal-slide-down">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">เลือกบทเรียน</h5>
                    <button type="button" className="btn-close" onClick={() => setShowLessonModal(false)}></button>
                  </div>
                  <div className="modal-body modal-body-scrollable">
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="ค้นหาบทเรียน..."
                        value={lessonSearchTerm}
                        onChange={(e) => setLessonSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="lesson-list">
                      {filteredLessons.length > 0 ? (
                        <div className="list-group">
                          {filteredLessons.map((lesson) => {
                            const isSelected = subjectData.lessons.some((l) => l.id === lesson.id);
                            return (
                              <div
                                key={lesson.id}
                                className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${isSelected ? "bg-light" : ""
                                  }`}
                              >
                                <div>
                                  <h6 className="mb-0">{lesson.title}</h6>
                                </div>
                                <button
                                  type="button"
                                  className={`btn btn-sm ${isSelected ? "btn-success disabled" : "btn-outline-primary"}`}
                                  onClick={() => handleAddLesson(lesson.id)}
                                  disabled={isSelected}
                                >
                                  {isSelected ? (
                                    <>
                                      <i className="fas fa-check me-1"></i>เลือกแล้ว
                                    </>
                                  ) : (
                                    <>เลือก</>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted">ไม่พบบทเรียนที่ตรงกับคำค้นหา</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-primary" onClick={() => setShowLessonModal(false)}>
                      เสร็จสิ้น
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal เลือกแบบทดสอบ */}
          {showQuizModal && (
            <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog modal-lg modal-dialog-centered modal-slide-down">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      เลือกแบบทดสอบ{quizType === "pre" ? "ก่อนเรียน" : "หลังเรียน"}
                    </h5>
                    <button type="button" className="btn-close" onClick={() => setShowQuizModal(false)}></button>
                  </div>
                  <div className="modal-body modal-body-scrollable">
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="ค้นหาแบบทดสอบ..."
                        value={quizSearchTerm}
                        onChange={(e) => setQuizSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="quiz-list">
                      {filteredQuizzes.length > 0 ? (
                        <div className="list-group">
                          {filteredQuizzes.map((quiz) => (
                            <div
                              key={quiz.id}
                              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                            >
                              <div>
                                <h6 className="mb-1">{quiz.title}</h6>
                                <p className="mb-0 small text-muted">จำนวนคำถาม: {quiz.question_count} ข้อ</p>
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleSelectQuiz(quiz.id)}
                              >
                                เลือก
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted">ไม่พบแบบทดสอบที่ตรงกับคำค้นหา</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowQuizModal(false)}>
                      ยกเลิก
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal เลือกอาจารย์ */}
          {showInstructorModal && (
            <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog modal-lg modal-dialog-centered modal-slide-down">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">เลือกอาจารย์</h5>
                    <button type="button" className="btn-close" onClick={() => setShowInstructorModal(false)}></button>
                  </div>
                  <div className="modal-body modal-body-scrollable">
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="ค้นหาอาจารย์..."
                        value={instructorSearchTerm}
                        onChange={(e) => setInstructorSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="instructor-list">
                      {filteredInstructors.length > 0 ? (
                        <div className="list-group">
                          {filteredInstructors.map((instructor) => (
                            <div
                              key={instructor.instructor_id}
                              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                            >
                              <div>
                                <h6 className="mb-1">{instructor.name}</h6>
                                <p className="mb-0 small text-muted">{instructor.position}</p>
                              </div>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`select-instructor-${instructor.instructor_id}`}
                                  checked={subjectData.instructors.includes(instructor.instructor_id)}
                                  onChange={() => handleToggleInstructor(instructor.instructor_id)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted">ไม่พบอาจารย์ที่ตรงกับคำค้นหา</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-primary" onClick={() => setShowInstructorModal(false)}>
                      เสร็จสิ้น
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal เลือกหลักสูตร */}
          {showCourseModal && (
            <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog modal-lg modal-dialog-centered modal-slide-down">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">เลือกหลักสูตร</h5>
                    <button type="button" className="btn-close" onClick={() => setShowCourseModal(false)}></button>
                  </div>
                  <div className="modal-body modal-body-scrollable">
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="ค้นหาหลักสูตร..."
                        value={courseSearchTerm}
                        onChange={(e) => setCourseSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="course-list">
                      {filteredCourses.length > 0 ? (
                        <div className="list-group">
                          {filteredCourses.map((course) => (
                            <div
                              key={course.id}
                              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                            >
                              <div>
                                <h6 className="mb-1">{course.title}</h6>
                                <p className="mb-0 small text-muted">
                                  หมวดหมู่: {course.category} | รายวิชา: {course.subjects} วิชา
                                </p>
                              </div>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`select-course-${course.id}`}
                                  checked={subjectData.courses.includes(course.id)}
                                  onChange={() => handleToggleCourse(course.id)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted">ไม่พบหลักสูตรที่ตรงกับคำค้นหา</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-primary" onClick={() => setShowCourseModal(false)}>
                      เสร็จสิ้น
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </form>
  );
};

export default AddSubjects;