import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import SubjectInfoSection from "./SubjectInfoSection";
import LessonSection from "./LessonSection";
import QuizSection from "./QuizSection";
import InstructorSection from "./InstructorSection";
import CourseSection from "./CourseSection";
import Modals from "./Modals";
import { DragDropContext } from 'react-beautiful-dnd';
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
  instructor_id: string | number;  // Changed from id to instructor_id
  name: string;
  position: string;
  avatar: string;
  bio?: string;
}

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
// เพิ่มฟังก์ชันนี้ในส่วนของฟังก์ชันอื่นๆ ในคอมโพเนนต์ AddSubjects
const handleDragEnd = (result: any) => {
  // ถ้าไม่มีปลายทาง หรือลากไปยังตำแหน่งเดิม ไม่ต้องทำอะไร
  if (!result.destination || result.destination.index === result.source.index) {
    return;
  }

  // สร้างอาร์เรย์ใหม่จากอาร์เรย์เดิม
  const items = Array.from(subjectData.lessons);
  // ตัดรายการที่ลากออกจากตำแหน่งเดิม
  const [reorderedItem] = items.splice(result.source.index, 1);
  // แทรกรายการที่ลากไปยังตำแหน่งใหม่
  items.splice(result.destination.index, 0, reorderedItem);

  // อัพเดตลำดับ order ของทุกบทเรียน
  const updatedLessons = items.map((lesson, index) => ({
    ...lesson,
    order: index + 1
  }));

  // อัพเดต state
  setSubjectData({
    ...subjectData,
    lessons: updatedLessons
  });
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

    // ตรวจสอบขนาดไฟล์ (ไม่เกิน 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrors({
        ...errors,
        coverImage: "ขนาดไฟล์ต้องไม่เกิน 2MB",
      });
      return;
    }

    // ตรวจสอบประเภทไฟล์
    const fileType = file.type.toLowerCase();
    if (!fileType.startsWith("image/")) {
      setErrors({
        ...errors,
        coverImage: "กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น",
      });
      return;
    }

    // สร้าง URL สำหรับแสดงตัวอย่างรูปภาพ
    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);
    setExistingImageUrl(null);

    setSubjectData({
      ...subjectData,
      coverImage: file,
    });

    setErrors({
      ...errors,
      coverImage: "",
    });
  };

  // เปลี่ยนแปลงการอนุญาตให้เข้าถึงบทเรียนทั้งหมด
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

    // ตรวจสอบว่าบทเรียนนี้มีอยู่แล้วหรือไม่
    if (subjectData.lessons.some((l) => l.id === lessonId)) {
      return;
    }

    const newLesson: SelectedLesson = {
      id: lesson.id,
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
    
    // อัพเดตลำดับของบทเรียนที่เหลือ
    const reorderedLessons = updatedLessons.map((lesson, index) => ({
      ...lesson,
      order: index + 1,
    }));

    setSubjectData({
      ...subjectData,
      lessons: reorderedLessons,
    });
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

  // ลบแบบทดสอบ
  const handleRemoveQuiz = (type: "pre" | "post") => {
    if (type === "pre") {
      setSubjectData({
        ...subjectData,
        preTestId: null,
      });
    } else {
      setSubjectData({
        ...subjectData,
        postTestId: null,
      });
    }
  };

  // เพิ่ม/ลบอาจารย์

  const handleToggleInstructor = (instructorId: string) => {
    // Validate the instructorId
    if (!instructorId) {
      console.error("Invalid instructor ID provided:", instructorId);
      return;
    }
    
    console.log("Toggle instructor called with ID:", instructorId);
    console.log("Current instructors before toggle:", subjectData.instructors);
    
    // Create a new array to avoid direct state mutation
    let newInstructors;
    
    if (subjectData.instructors.includes(instructorId)) {
      // Remove the instructor if already selected
      newInstructors = subjectData.instructors.filter(id => id !== instructorId);
    } else {
      // Add the instructor if not selected
      newInstructors = [...subjectData.instructors, instructorId];
    }
    
    console.log("Updated instructors after toggle:", newInstructors);
    
    // Update the state with the new instructors array
    setSubjectData({
      ...subjectData,
      instructors: newInstructors
    });
  };

  // เพิ่ม/ลบหลักสูตร
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

    if (!subjectData.title.trim()) {
      newErrors.title = "กรุณาระบุชื่อรายวิชา";
      isValid = false;
    }

    if (!subjectData.code.trim()) {
      newErrors.code = "กรุณาระบุรหัสรายวิชา";
      isValid = false;
    }

    if (subjectData.credits <= 0) {
      newErrors.credits = "จำนวนหน่วยกิตต้องมากกว่า 0";
      isValid = false;
    }

    if (subjectData.lessons.length === 0) {
      newErrors.lessons = "กรุณาเพิ่มบทเรียนอย่างน้อย 1 บทเรียน";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // ส่งข้อมูลรายวิชา
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setApiError("");
    setApiSuccess("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setApiError("กรุณาเข้าสู่ระบบก่อนใช้งาน");
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("title", subjectData.title);
      formData.append("code", subjectData.code);
      formData.append("description", subjectData.description);
      formData.append("credits", subjectData.credits.toString());
      formData.append("department", subjectData.department);
      formData.append("allowAllLessons", subjectData.allowAllLessons.toString());

      if (subjectData.coverImage) {
        formData.append("coverImage", subjectData.coverImage);
      }

      // เพิ่มข้อมูลบทเรียน
      formData.append("lessons", JSON.stringify(subjectData.lessons));

      // เพิ่มข้อมูลแบบทดสอบ
      if (subjectData.preTestId) {
        formData.append("preTestId", subjectData.preTestId);
      }
      if (subjectData.postTestId) {
        formData.append("postTestId", subjectData.postTestId);
      }

      // เพิ่มข้อมูลอาจารย์
      formData.append("instructors", JSON.stringify(subjectData.instructors));

      // เพิ่มข้อมูลหลักสูตร
      formData.append("courses", JSON.stringify(subjectData.courses));

      let response;
      if (subjectToEdit) {
        // แก้ไขรายวิชา
        response = await axios.put(`${apiUrl}/api/courses/subjects/${subjectToEdit}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setApiSuccess("แก้ไขรายวิชาสำเร็จ");
      } else {
        // สร้างรายวิชาใหม่
        response = await axios.post(`${apiUrl}/api/courses/subjects`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setApiSuccess("สร้างรายวิชาสำเร็จ");
      }

      if (response.data.success) {
        if (onSubmit) {
          onSubmit(response.data.subject);
        }
        toast.success(subjectToEdit ? "แก้ไขรายวิชาสำเร็จ" : "สร้างรายวิชาสำเร็จ");
      } else {
        setApiError(response.data.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error: any) {
      console.error("Error submitting subject:", error);
      setApiError(error.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleRemoveImage = () => {
    setImagePreview(null);
    setExistingImageUrl(null);
    setSubjectData({
      ...subjectData,
      coverImage: null
    });
  };
  // ยกเลิกการสร้าง/แก้ไขรายวิชา
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // ค้นหาอาจารย์ตาม ID
  // Update the findInstructorById function in AddSubjects.tsx
const findInstructorById = (instructorId: string) => {
  return availableInstructors.find(instructor => 
    instructor.instructor_id && instructor.instructor_id.toString() === instructorId
  );
};

// Then in InstructorSection.tsx, update the rendering of instructors:
{subjectData.instructors.map((instructorId) => {
  const instructor = findInstructorById(instructorId);
  return instructor ? (
    <div key={instructorId} className="col-md-6">
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
              onClick={() => handleToggleInstructor(instructorId)}
            >
              <i className="fas fa-times-circle"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
})}


  // ค้นหาหลักสูตรตาม ID
  const findCourseById = (courseId: string) => {
    return availableCourses.find(course => course.id === courseId);
  };

  return (
    <form onSubmit={handleSubmit}>
      {apiSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="fas fa-check-circle me-2"></i>
          {apiSuccess}
          <button type="button" className="btn-close" onClick={() => setApiSuccess("")} aria-label="Close"></button>
        </div>
      )}

      {apiError && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {apiError}
          <button type="button" className="btn-close" onClick={() => setApiError("")} aria-label="Close"></button>
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
        <DragDropContext onDragEnd={handleDragEnd}>
          <SubjectInfoSection
  subjectData={subjectData}
  errors={errors}
  handleInputChange={handleInputChange}
  handleImageUpload={handleImageUpload}
  handleRemoveImage={handleRemoveImage} // เพิ่มบรรทัดนี้
  imagePreview={imagePreview}
  existingImageUrl={existingImageUrl}
  fileInputRef={fileInputRef}
  availableDepartments={availableDepartments}
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
            availableQuizzes={availableQuizzes}
            handleSelectQuiz={handleSelectQuiz}
            handleRemoveQuiz={handleRemoveQuiz}
            setShowQuizModal={setShowQuizModal}
            setQuizType={setQuizType}
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

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button type="button" className="btn btn-outline-secondary" onClick={handleCancel} disabled={isSubmitting}>
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
                  <i className="fas fa-save me-2"></i>บันทึกรายวิชา
                </>
              )}
            </button>
          </div>

          <Modals
            showLessonModal={showLessonModal}
            setShowLessonModal={setShowLessonModal}
            showQuizModal={showQuizModal}
            setShowQuizModal={setShowQuizModal}
            showCourseModal={showCourseModal}
            setShowCourseModal={setShowCourseModal}
            showInstructorModal={showInstructorModal}
            setShowInstructorModal={setShowInstructorModal}
            quizType={quizType}
            lessonSearchTerm={lessonSearchTerm}
            setLessonSearchTerm={setLessonSearchTerm}
            quizSearchTerm={quizSearchTerm}
            setQuizSearchTerm={setQuizSearchTerm            }
            courseSearchTerm={courseSearchTerm}
            setCourseSearchTerm={setCourseSearchTerm}
            instructorSearchTerm={instructorSearchTerm}
            setInstructorSearchTerm={setInstructorSearchTerm}
            filteredLessons={filteredLessons}
            filteredQuizzes={filteredQuizzes}
            filteredCourses={filteredCourses}
            filteredInstructors={filteredInstructors}
            handleAddLesson={handleAddLesson}
            handleSelectQuiz={handleSelectQuiz}
            handleToggleCourse={handleToggleCourse}
            handleToggleInstructor={handleToggleInstructor}
            subjectData={subjectData}
          />
        </DragDropContext>
      )}
    </form>
  );
};

export default AddSubjects;
