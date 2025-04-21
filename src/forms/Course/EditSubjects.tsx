import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface SubjectData {
  subjectId: string;
  title: string;
  code: string;
  description: string;
  credits: number;
  departmentId: string;
  departmentName: string;
  coverImage: File | null;
  coverImagePreview: string;
  lessons: SelectedLesson[];
  preTestId: string | null;
  postTestId: string | null;
  instructors: string[];
  allowAllLessons: boolean;
  courses: string[];
  status: string;
}

interface SelectedLesson {
  id: string;
  title: string;
  order: number;
}

interface Quiz {
  quiz_id: string;
  title: string;
  question_count: number;
}

interface Instructor {
  instructor_id: string;
  name: string;
  position: string;
  department_name?: string;
}

interface Course {
  course_id: string;
  title: string;
  category: string;
  subjects: number;
}

interface Department {
  department_id: string;
  department_name: string;
}

const EditSubject: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [subjectData, setSubjectData] = useState<SubjectData>({
    subjectId: "",
    title: "",
    code: "",
    description: "",
    credits: 0,
    departmentId: "",
    departmentName: "",
    coverImage: null,
    coverImagePreview: "",
    lessons: [],
    preTestId: null,
    postTestId: null,
    instructors: [],
    allowAllLessons: false,
    courses: [],
    status: "active",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    title: "",
    code: "",
    description: "",
    credits: "",
    lessons: "",
  });

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [quizType, setQuizType] = useState<"pre" | "post">("pre");

  const [lessonSearchTerm, setLessonSearchTerm] = useState("");
  const [quizSearchTerm, setQuizSearchTerm] = useState("");
  const [instructorSearchTerm, setInstructorSearchTerm] = useState("");
  const [courseSearchTerm, setCourseSearchTerm] = useState("");

  const [availableLessons, setAvailableLessons] = useState<
    { id: string; title: string }[]
  >([]);
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [availableInstructors, setAvailableInstructors] = useState<
    Instructor[]
  >([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<
    Department[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!subjectId) {
        toast.error("ไม่พบรหัสวิชา");
        navigate("/admin-subjects");
        return;
      }
  
      try {
        setIsLoading(true);
        setApiError(null);
  
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
        }
  
        // Fetch subject data
        const subjectResponse = await axios.get(
          `${apiUrl}/api/courses/subjects/${subjectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        if (!subjectResponse.data.success) {
          throw new Error(subjectResponse.data.message || "ไม่พบข้อมูลวิชา");
        }
  
        const subject = subjectResponse.data.subject;
        console.log("Subject data:", subject);
        const newSubjectData: SubjectData = {
          subjectId: String(subject.subject_id) || "",
          title: subject.subject_name || "",
          code: subject.subject_code || "",
          description: subject.description || "",
          credits: subject.credits || 0,
          departmentId: subject.department ? String(subject.department) : "",
          departmentName: subject.department_name || "",
          coverImage: null,
          coverImagePreview: subject.cover_image
            ? subject.cover_image.startsWith("http")
              ? subject.cover_image
              : `${apiUrl}/uploads/subjects/covers/${subject.cover_image
                  .split("\\")
                  .pop()}`
            : "",
          lessons:
            subject.lessons?.map((l: any) => ({
              id: String(l.lesson_id),
              title: l.title,
              order: l.order_number,
            })) || [],
          preTestId: subject.preTest ? String(subject.preTest.quiz_id) : null,
          postTestId: subject.postTest ? String(subject.postTest.quiz_id) : null,
          instructors: [
            ...new Set(
              (subject.instructors?.map((i: { instructor_id: any }) =>
                String(i.instructor_id)
              ) || []) as string[]
            ),
          ], // เพิ่ม type assertion เป็น string[]
          allowAllLessons: subject.allow_all_lessons || false,
          courses: [
            ...new Set(
              (subject.courses?.map((c: { course_id: any }) =>
                String(c.course_id)
              ) || []) as string[]
            ),
          ], // เพิ่ม type assertion เป็น string[]
          status: subject.status || "active",
        };
        console.log("Mapped instructors:", newSubjectData.instructors);
        setSubjectData(newSubjectData);
  
        // Fetch available lessons
        const lessonsResponse = await axios.get(
          `${apiUrl}/api/courses/subjects/lessons/available`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (lessonsResponse.data.success) {
          setAvailableLessons(
            lessonsResponse.data.lessons.map((lesson: any) => ({
              id: String(lesson.lesson_id),
              title: lesson.title || "",
            }))
          );
        }
  
        // Fetch available quizzes
        const quizzesResponse = await axios.get(
          `${apiUrl}/api/courses/quizzes`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (quizzesResponse.data.message === "ดึงข้อมูลแบบทดสอบสำเร็จ") {
          setAvailableQuizzes(
            quizzesResponse.data.quizzes.map((quiz: any) => ({
              quiz_id: String(quiz.quiz_id),
              title: quiz.title || "",
              question_count: quiz.question_count || 0,
            }))
          );
        }
  
        // Fetch available instructors
        const instructorsResponse = await axios.get(
          `${apiUrl}/api/courses/subjects/instructors/available`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        let instructorsList: Instructor[] = [];
        if (instructorsResponse.data.success) {
          console.log("Available instructors:", instructorsResponse.data.instructors);
          instructorsList = instructorsResponse.data.instructors.map((instructor: any) => ({
            ...instructor,
            instructor_id: String(instructor.instructor_id), // Ensure instructor_id is a string
          }));
        }
  
        // Fetch selected instructors for this subject
        const selectedInstructorsResponse = await axios.get(
          `${apiUrl}/api/courses/subjects/instructor/${subjectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (selectedInstructorsResponse.data.success) {
          console.log("Selected instructors:", selectedInstructorsResponse.data.instructors);
          const selectedInstructors = selectedInstructorsResponse.data.instructors.map((instructor: any) => ({
            ...instructor,
            instructor_id: String(instructor.instructor_id), // Ensure instructor_id is a string
          }));
          // Merge selected instructors with available instructors, avoiding duplicates
          const mergedInstructors = [
            ...instructorsList,
            ...selectedInstructors.filter(
              (selected: Instructor) =>
                !instructorsList.some(
                  (avail: Instructor) =>
                    avail.instructor_id === selected.instructor_id
                )
            ),
          ];
          setAvailableInstructors(mergedInstructors);
        } else {
          setAvailableInstructors(instructorsList);
        }
  
        // Fetch available courses
        const coursesResponse = await axios.get(`${apiUrl}/api/courses/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (coursesResponse.data.success) {
          setAvailableCourses(
            coursesResponse.data.courses.map((course: any) => ({
              course_id: String(course.course_id),
              title: course.title || "",
              category: course.category || "ไม่ระบุ",
              subjects: course.subject_count || 0,
            }))
          );
        }
  
        // Fetch available departments
        const departmentsResponse = await axios.get(
          `${apiUrl}/api/courses/subjects/departments/list`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (departmentsResponse.data.success) {
          setAvailableDepartments(
            departmentsResponse.data.departments.map((dept: any) => ({
              department_id: String(dept.department_id),
              department_name: dept.department_name || "",
            }))
          );
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setApiError(error.message || "ไม่สามารถโหลดข้อมูลได้");
        toast.error(error.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [subjectId, apiUrl, navigate]);

  // Filter functions
  const filteredLessons = availableLessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(lessonSearchTerm.toLowerCase())
  );

  const filteredQuizzes = availableQuizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(quizSearchTerm.toLowerCase())
  );

  const filteredInstructors = availableInstructors.filter(
    (instructor) =>
      instructor.name.toLowerCase().includes(instructorSearchTerm.toLowerCase()) ||
      instructor.position.toLowerCase().includes(instructorSearchTerm.toLowerCase())
  );

  const filteredCourses = availableCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(courseSearchTerm.toLowerCase())
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSubjectData((prev) => ({
      ...prev,
      [name]: name === "credits" ? Number(value) : name === "departmentId" ? value : value,
    }));

    if (name in errors) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    if (file.size > 5 * 1024 * 1024) {
      toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return;
    }

    const fileType = file.type;
    if (!fileType.match(/^image\/(jpeg|jpg|png|gif)$/)) {
      toast.error("รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF)");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setSubjectData((prev) => ({
      ...prev,
      coverImage: file,
      coverImagePreview: previewUrl,
    }));
  };

  const handleRemoveCoverImage = () => {
    setSubjectData((prev) => ({
      ...prev,
      coverImage: null,
      coverImagePreview: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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

    setSubjectData((prev) => ({
      ...prev,
      lessons: [...prev.lessons, newLesson],
    }));

    setErrors((prev) => ({
      ...prev,
      lessons: "",
    }));
  };

  const handleRemoveLesson = (lessonId: string) => {
    const updatedLessons = subjectData.lessons.filter(
      (lesson) => lesson.id !== lessonId
    );
    const reorderedLessons = updatedLessons.map((lesson, index) => ({
      ...lesson,
      order: index + 1,
    }));

    setSubjectData((prev) => ({
      ...prev,
      lessons: reorderedLessons,
    }));
  };

  const handleOpenQuizModal = (type: "pre" | "post") => {
    setQuizType(type);
    setShowQuizModal(true);
  };

  const handleSelectQuiz = (quizId: string) => {
    setSubjectData((prev) => ({
      ...prev,
      [quizType === "pre" ? "preTestId" : "postTestId"]: quizId,
    }));
    setShowQuizModal(false);
  };

  const handleToggleInstructor = (instructorId: string) => {
    setSubjectData((prev) => {
      // ตรวจสอบว่ามี instructorId อยู่ใน array หรือไม่
      const isAlreadySelected = prev.instructors.includes(instructorId);
  
      // ถ้ามีอยู่แล้ว ให้ลบออก
      if (isAlreadySelected) {
        return {
          ...prev,
          instructors: prev.instructors.filter((id) => id !== instructorId),
        };
      }
  
      // ถ้ายังไม่มี ให้เพิ่มเข้าไป และใช้ Set เพื่อป้องกันการซ้ำ (เผื่อมีกรณีที่ไม่ได้คาดคิด)
      const updatedInstructors = [...new Set([...prev.instructors, instructorId])];
  
      return {
        ...prev,
        instructors: updatedInstructors,
      };
    });
  };

  const handleToggleCourse = (courseId: string) => {
    setSubjectData((prev) => ({
      ...prev,
      courses: prev.courses.includes(courseId)
        ? prev.courses.filter((id) => id !== courseId)
        : [...prev.courses, courseId],
    }));
  };

  const handleAllowAllLessonsChange = () => {
    setSubjectData((prev) => ({
      ...prev,
      allowAllLessons: !prev.allowAllLessons,
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: "",
      code: "",
      description: "",
      credits: "",
      lessons: "",
    };

    if (!subjectData.title.trim()) {
      newErrors.title = "กรุณาระบุชื่อวิชา";
      isValid = false;
    }

    if (!subjectData.code.trim()) {
      newErrors.code = "กรุณาระบุรหัสวิชา";
      isValid = false;
    }

    if (!subjectData.description.trim()) {
      newErrors.description = "กรุณาระบุคำอธิบายวิชา";
      isValid = false;
    }

    if (subjectData.credits <= 0) {
      newErrors.credits = "กรุณาระบุหน่วยกิตที่มากกว่า 0";
      isValid = false;
    }

    if (subjectData.lessons.length === 0) {
      newErrors.lessons = "กรุณาเพิ่มบทเรียนอย่างน้อย 1 บทเรียน";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validateForm()) {
      return;
    }
  
    try {
      setIsSubmitting(true);
      setApiError(null);
      setApiSuccess(null);
  
      const token = localStorage.getItem("token");
      if (!token) {
        setApiError("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
        toast.error("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
        setIsSubmitting(false);
        return;
      }
  
      // Clean arrays to remove duplicates
      const uniqueInstructors = [...new Set(subjectData.instructors)];
      const uniqueCourses = [...new Set(subjectData.courses)];
      const uniqueLessons = subjectData.lessons.filter(
        (lesson, index, self) =>
          index === self.findIndex((l) => l.id === lesson.id)
      );
  
      const formData = new FormData();
      formData.append("title", subjectData.title);
      formData.append("code", subjectData.code);
      formData.append("description", subjectData.description);
      formData.append("credits", String(subjectData.credits));
      formData.append("department", subjectData.departmentId || "");
      formData.append(
        "lessons",
        JSON.stringify(
          uniqueLessons.map((lesson) => ({
            id: lesson.id,
            order: lesson.order,
          }))
        )
      );
      formData.append("preTestId", subjectData.preTestId || "");
      formData.append("postTestId", subjectData.postTestId || "");
      formData.append("instructors", JSON.stringify(uniqueInstructors));
      formData.append("allowAllLessons", String(subjectData.allowAllLessons));
      formData.append("courses", JSON.stringify(uniqueCourses));
      formData.append("status", subjectData.status);
      if (subjectData.coverImage) {
        formData.append("coverImage", subjectData.coverImage);
      }
  
      const response = await axios.put(
        `${apiUrl}/api/courses/subjects/${subjectId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (response.data.success) {
        setApiSuccess("แก้ไขวิชาสำเร็จ");
        toast.success("แก้ไขวิชาสสำเร็จ");
        setTimeout(() => {
          navigate("/admin-subjects");
        }, 1500);
      } else {
        setApiError(response.data.message || "เกิดข้อผิดพลาดในการแก้ไขวิชา");
        toast.error(response.data.message || "เกิดข้อผิดพลาดในการแก้ไขวิชา");
      }
    } catch (error: any) {
      console.error("Error updating subject:", error);
      const errorMessage =
        error.response?.data?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์";
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin-subjects");
  };

  const findQuizById = (quizId: string | null) => {
    if (!quizId) return null;
    return availableQuizzes.find((quiz) => quiz.quiz_id === quizId);
  };

  const findCourseById = (courseId: string) => {
    return availableCourses.find((course) => course.course_id === courseId);
  };

  const findInstructorById = (instructorId: string) => {
    const instructor = availableInstructors.find(
      (instructor) => String(instructor.instructor_id) === String(instructorId)
    );
    if (!instructor) {
      console.warn(`Instructor with ID ${instructorId} not found in availableInstructors`);
      return { instructor_id: instructorId, name: "ไม่พบข้อมูลอาจารย์", position: "N/A", department_name: "N/A" };
    }
    return instructor;
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (apiError && !isSubmitting && !apiSuccess) {
    return (
      <div className="alert alert-danger mb-4 max-w-3xl mx-auto p-4">
        <i className="fas fa-exclamation-circle me-2"></i>
        {apiError}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4">
      
      {apiSuccess && (
        <div className="alert alert-success mb-4">
          <i className="fas fa-check-circle me-2"></i>
          {apiSuccess}
        </div>
      )}

      {apiError && (
        <div className="alert alert-danger mb-4">
          <i className="fas fa-exclamation-circle me-2"></i>
          {apiError}
        </div>
      )}

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">1. ข้อมูลวิชา</h5>

          <div className="mb-3">
            <label htmlFor="subjectId" className="form-label">
              รหัสวิชา
            </label>
            <input
              type="text"
              className="form-control"
              id="subjectId"
              value={subjectData.subjectId}
              readOnly
              disabled
            />
          </div>

          <div className="mb-3">
            <label htmlFor="title" className="form-label">
              ชื่อวิชา <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.title ? "is-invalid" : ""}`}
              id="title"
              name="title"
              value={subjectData.title}
              onChange={handleInputChange}
              placeholder="ระบุชื่อวิชา"
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="code" className="form-label">
              รหัสวิชา <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.code ? "is-invalid" : ""}`}
              id="code"
              name="code"
              value={subjectData.code}
              onChange={handleInputChange}
              placeholder="ระบุรหัสวิชา"
            />
            {errors.code && <div className="invalid-feedback">{errors.code}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              คำอธิบาย <span className="text-danger">*</span>
            </label>
            <textarea
              className={`form-control ${errors.description ? "is-invalid" : ""}`}
              id="description"
              name="description"
              value={subjectData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="ระบุคำอธิบายเกี่ยวกับวิชา"
            />
            {errors.description && (
              <div className="invalid-feedback">{errors.description}</div>
            )}
          </div>

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
              placeholder="ระบุหน่วยกิต"
              min="0"
            />
            {errors.credits && (
              <div className="invalid-feedback">{errors.credits}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="departmentId" className="form-label">
              ภาควิชา
            </label>
            <select
              className="form-control"
              id="departmentId"
              name="departmentId"
              value={subjectData.departmentId}
              onChange={handleInputChange}
            >
              <option value="">เลือกภาควิชา (ถ้ามี)</option>
              {availableDepartments.map((dept) => (
                <option key={dept.department_id} value={dept.department_id}>
                  {dept.department_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">2. ตั้งค่าวิชา</h5>

          <div className="mb-4">
            <label className="form-label">ภาพหน้าปกวิชา</label>
            <p className="text-muted small mb-2">
              แนะนำขนาด 1200 x 800 พิกเซล (ไม่เกิน 5MB)
            </p>
            <div className="d-flex align-items-center gap-3">
              <div
                className="cover-image-preview rounded border"
                style={{
                  width: "150px",
                  height: "100px",
                  backgroundImage: subjectData.coverImagePreview
                    ? `url(${subjectData.coverImagePreview})`
                    : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f8f9fa",
                }}
              >
                {!subjectData.coverImagePreview && (
                  <i className="fas fa-image fa-2x text-muted"></i>
                )}
              </div>
              <div className="d-flex flex-column gap-2">
                <input
                  type="file"
                  className="form-control"
                  id="coverImage"
                  ref={fileInputRef}
                  onChange={handleCoverImageUpload}
                  accept="image/jpeg,image/png,image/gif"
                  style={{ display: "none" }}
                />
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <i className="fas fa-upload me-2"></i>
                    {subjectData.coverImagePreview ? "เปลี่ยนภาพ" : "อัปโหลดภาพ"}
                  </button>
                  {subjectData.coverImagePreview && (
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={handleRemoveCoverImage}
                    >
                      <i className="fas fa-trash-alt me-2"></i>ลบภาพ
                    </button>
                  )}
                </div>
                <small className="text-muted">รองรับไฟล์ JPEG, PNG, GIF</small>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">
              บทเรียน <span className="text-danger">*</span>
            </label>
            {errors.lessons && (
              <div className="alert alert-danger" role="alert">
                {errors.lessons}
              </div>
            )}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge bg-primary rounded-pill">
                {subjectData.lessons.length} / 20 บทเรียน
              </span>
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
                ยังไม่มีบทเรียนในรายวิชานี้ กรุณาเพิ่มบทเรียนอย่างน้อย 1 บทเรียน
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">แบบทดสอบก่อนเรียน</label>
            <div className="d-flex">
              <div className="flex-grow-1">
                {subjectData.preTestId ? (
                  <div className="border rounded p-3 bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0">
                          {findQuizById(subjectData.preTestId)?.title ||
                            "แบบทดสอบที่เลือก"}
                        </h6>
                        <small className="text-muted">
                          {findQuizById(subjectData.preTestId)?.question_count || 0}{" "}
                          คำถาม
                        </small>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() =>
                          setSubjectData((prev) => ({
                            ...prev,
                            preTestId: null,
                          }))
                        }
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

          <div className="mb-3">
            <label className="form-label">แบบทดสอบหลังเรียน</label>
            <div className="d-flex">
              <div className="flex-grow-1">
                {subjectData.postTestId ? (
                  <div className="border rounded p-3 bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0">
                          {findQuizById(subjectData.postTestId)?.title ||
                            "แบบทดสอบที่เลือก"}
                        </h6>
                        <small className="text-muted">
                          {findQuizById(subjectData.postTestId)?.question_count || 0}{" "}
                          คำถาม
                        </small>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() =>
                          setSubjectData((prev) => ({
                            ...prev,
                            postTestId: null,
                          }))
                        }
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

          <div className="mb-3">
            <label className="form-label">อาจารย์ผู้สอน</label>
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
                    return (
                      <div key={instructor.instructor_id} className="col-md-6">
                        <div className="card border h-100">
                          <div className="card-body py-2 px-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="mb-1">{instructor.name}</h6>
                                <p className="mb-0 small text-muted">
                                  ตำแหน่ง: {instructor.position} | ภาควิชา: {instructor.department_name || "ไม่ระบุ"}
                                </p>
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm text-danger"
                                onClick={() =>
                                  handleToggleInstructor(instructor.instructor_id)
                                }
                              >
                                <i className="fas fa-times-circle"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">คอร์สที่เกี่ยวข้อง</label>
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
                      <div key={course.course_id} className="col-md-6">
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
                                onClick={() => handleToggleCourse(course.course_id)}
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

          <div className="mb-3">
            <label className="form-label">อนุญาตให้เข้าถึงทุกบทเรียน</label>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="allowAllLessons"
                checked={subjectData.allowAllLessons}
                onChange={handleAllowAllLessonsChange}
              />
              <label className="form-check-label" htmlFor="allowAllLessons">
                อนุญาตให้เข้าถึงบทเรียนทั้งหมดได้ทันที (ไม่ต้องเรียนตามลำดับ)
              </label>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="status" className="form-label">
              สถานะ
            </label>
            <select
              className="form-control"
              id="status"
              name="status"
              value={subjectData.status}
              onChange={handleInputChange}
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          <i className="fas fa-times me-2"></i>ยกเลิก
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              กำลังบันทึก...
            </>
          ) : (
            <>
              <i className="fas fa-save me-2"></i>บันทึกวิชา
            </>
          )}
        </button>
      </div>

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
                        const isSelected = subjectData.lessons.some(
                          (l) => l.id === lesson.id
                        );
                        return (
                          <div
                            key={lesson.id}
                            className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                              isSelected ? "bg-light" : ""
                            }`}
                          >
                            <div>
                              <h6 className="mb-0">{lesson.title}</h6>
                            </div>
                            <button
                              type="button"
                              className={`btn btn-sm ${
                                isSelected
                                  ? "btn-success disabled"
                                  : "btn-outline-primary"
                              }`}
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
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowLessonModal(false)}
                >
                  เสร็จสิ้น
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                          key={quiz.quiz_id}
                          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <h6 className="mb-1">{quiz.title}</h6>
                            <p className="mb-0 small text-muted">
                              จำนวนคำถาม: {quiz.question_count} ข้อ
                            </p>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleSelectQuiz(quiz.quiz_id)}
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
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowQuizModal(false)}
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                            <p className="mb-0 small text-muted">
                              ตำแหน่ง: {instructor.position} | ภาควิชา: {instructor.department_name || "ไม่ระบุ"}
                            </p>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`select-instructor-${instructor.instructor_id}`}
                              checked={subjectData.instructors.includes(
                                instructor.instructor_id
                              )}
                              onChange={() =>
                                handleToggleInstructor(instructor.instructor_id)
                              }
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
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowInstructorModal(false)}
                >
                  เสร็จสิ้น
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                          key={course.course_id}
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
                              id={`select-course-${course.course_id}`}
                              checked={subjectData.courses.includes(course.course_id)}
                              onChange={() => handleToggleCourse(course.course_id)}
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
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowCourseModal(false)}
                >
                  เสร็จสิ้น
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default EditSubject;