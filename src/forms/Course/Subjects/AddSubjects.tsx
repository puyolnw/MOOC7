import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { DragDropContext } from 'react-beautiful-dnd';

// ===== INTERFACES =====
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
  courses: string[];
}

interface SelectedLesson {
  id: string;
  title: string;
  order: number;
  description?: string;
  duration?: string;
  hasQuiz?: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  question_count: number;
  description?: string;
  type?: string;
}

export interface Instructor {
  instructor_id: string | number;
  name: string;
  position: string;
  avatar?: string;
  bio?: string;
}

export interface Department {
  department_id: string;
  department_name: string;
  description: string;
}

interface Course {
  id: string;
  title: string;
  category: string;
  subjects: number;
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  hasQuiz?: boolean;
  quizTitle?: string;
}

interface AddSubjectsProps {
  onSubmit?: (subjectData: any) => void;
  onCancel?: () => void;
  subjectToEdit?: string;
}

const AddSubjects: React.FC<AddSubjectsProps> = ({ onSubmit, onCancel, subjectToEdit }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  // ===== STATES =====
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [showPreview, setShowPreview] = useState(false);

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
    courses: [],
  });

  const [errors, setErrors] = useState({
    title: "",
    code: "",
    credits: "",
    coverImage: "",
    lessons: "",
    instructors: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  // Modal states
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showCreateLessonModal, setShowCreateLessonModal] = useState(false);
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  const [showCreateQuestionModal, setShowCreateQuestionModal] = useState(false);

  // Search states
  const [lessonSearchTerm, setLessonSearchTerm] = useState("");
  const [instructorSearchTerm, setInstructorSearchTerm] = useState("");
  const [courseSearchTerm, setCourseSearchTerm] = useState("");

  // Data states
  const [availableLessons, setAvailableLessons] = useState<Lesson[]>([]);
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [availableInstructors, setAvailableInstructors] = useState<Instructor[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<Department[]>([]);

  // ===== EFFECTS =====
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setApiError("กรุณาเข้าสู่ระบบก่อนใช้งาน");
          return;
        }

        // Load all required data
        const [lessonsRes, quizzesRes, coursesRes, instructorsRes, departmentsRes] = await Promise.all([
          axios.get(`${apiUrl}/api/courses/subjects/lessons/available`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/api/courses/quizzes`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/api/courses/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/api/courses/subjects/instructors/available`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/api/courses/subjects/departments/list`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Process lessons
        if (lessonsRes.data.success) {
          const formattedLessons = lessonsRes.data.lessons.map((lesson: any) => ({
            id: lesson.lesson_id?.toString() || lesson.id?.toString() || "",
            title: lesson.title || "",
            description: lesson.description || "",
            duration: lesson.duration || "ไม่ระบุ",
            hasQuiz: lesson.has_quiz || lesson.hasQuiz || false,
            quizTitle: lesson.quiz_title || lesson.quizTitle || ""
          }));
          setAvailableLessons(formattedLessons);
        }

        // Process quizzes
        if (quizzesRes.data.success) {
          const formattedQuizzes = quizzesRes.data.quizzes.map((quiz: any) => ({
            id: quiz.quiz_id?.toString() || quiz.id?.toString() || "",
            title: quiz.title || "",
            question_count: quiz.question_count || quiz.questions || 0,
            description: quiz.description || "",
            type: quiz.type || ""
          }));
          setAvailableQuizzes(formattedQuizzes);
        }

        // Process courses
        if (coursesRes.data.success) {
          const formattedCourses = coursesRes.data.courses.map((course: any) => ({
            id: course.course_id?.toString() || course.id?.toString() || "",
            title: course.title || "",
            category: course.category || "ไม่ระบุ",
            subjects: course.subject_count || course.subjects || 0,
          }));
          setAvailableCourses(formattedCourses);
        }

        // Process instructors
        if (instructorsRes.data.success) {
          setAvailableInstructors(instructorsRes.data.instructors);
        }

        // Process departments
        if (departmentsRes.data.success) {
          setAvailableDepartments(departmentsRes.data.departments);
        }

        // Load existing subject data if editing
        if (subjectToEdit) {
          const subjectRes = await axios.get(`${apiUrl}/api/courses/subjects/${subjectToEdit}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (subjectRes.data.success) {
            const subject = subjectRes.data.subject;
            setSubjectData({
              title: subject.subject_name || "",
              code: subject.subject_code || "",
              description: subject.description || "",
              credits: subject.credits || 3,
              department: subject.department?.toString() || "",
              coverImage: null,
              lessons: subject.lessons?.map((lesson: any, index: number) => ({
                id: lesson.lesson_id?.toString() || "",
                title: lesson.title || "",
                order: lesson.order_number || index + 1,
                description: lesson.description || "",
                duration: lesson.duration || "",
                hasQuiz: lesson.has_quiz || false
              })) || [],
              preTestId: subject.preTest?.quiz_id?.toString() || null,
              postTestId: subject.postTest?.quiz_id?.toString() || null,
              instructors: subject.instructors?.map((inst: any) => 
                inst.instructor_id?.toString() || ""
              ).filter(Boolean) || [],
              courses: subject.courses?.map((course: any) => 
                course.course_id?.toString() || ""
              ).filter(Boolean) || [],
            });

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

  // ===== FILTERED DATA =====
  const filteredLessons = availableLessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(lessonSearchTerm.toLowerCase())
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

  // ===== EVENT HANDLERS =====
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "credits") {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setSubjectData(prev => ({ ...prev, [name]: numValue }));
      }
    } else {
      setSubjectData(prev => ({ ...prev, [name]: value }));
    }

    if (name in errors) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, coverImage: "ขนาดไฟล์ต้องไม่เกิน 2MB" }));
      return;
    }

    if (!file.type.toLowerCase().startsWith("image/")) {
      setErrors(prev => ({ ...prev, coverImage: "กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น" }));
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);
    setExistingImageUrl(null);
    setSubjectData(prev => ({ ...prev, coverImage: file }));
    setErrors(prev => ({ ...prev, coverImage: "" }));
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setExistingImageUrl(null);
    setSubjectData(prev => ({ ...prev, coverImage: null }));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }

    const items = Array.from(subjectData.lessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedLessons = items.map((lesson, index) => ({
      ...lesson,
      order: index + 1
    }));

    setSubjectData(prev => ({ ...prev, lessons: updatedLessons }));
  };

  const handleAddLesson = (lessonId: string) => {
    const lesson = availableLessons.find((l) => l.id === lessonId);
    if (!lesson || subjectData.lessons.some((l) => l.id === lessonId)) {
      return;
    }

    const newLesson: SelectedLesson = {
      id: lesson.id,
      title: lesson.title,
      order: subjectData.lessons.length + 1,
      description: lesson.description,
      duration: lesson.duration,
      hasQuiz: lesson.hasQuiz
    };

    setSubjectData(prev => ({
      ...prev,
      lessons: [...prev.lessons, newLesson]
    }));
    setErrors(prev => ({ ...prev, lessons: "" }));
  };

  const handleRemoveLesson = (lessonId: string) => {
    const updatedLessons = subjectData.lessons
      .filter((lesson) => lesson.id !== lessonId)
      .map((lesson, index) => ({ ...lesson, order: index + 1 }));

    setSubjectData(prev => ({ ...prev, lessons: updatedLessons }));
  };

  const handleToggleInstructor = (instructorId: string) => {
    if (!instructorId) return;
    
    setSubjectData(prev => ({
      ...prev,
      instructors: prev.instructors.includes(instructorId)
        ? prev.instructors.filter(id => id !== instructorId)
        : [...prev.instructors, instructorId]
    }));
    setErrors(prev => ({ ...prev, instructors: "" }));
  };

  const handleToggleCourse = (courseId: string) => {
    setSubjectData(prev => ({
      ...prev,
      courses: prev.courses.includes(courseId)
        ? prev.courses.filter(id => id !== courseId)
        : [...prev.courses, courseId]
    }));
  };

  const findInstructorById = (instructorId: string) => {
    return availableInstructors.find(instructor => 
      instructor.instructor_id?.toString() === instructorId
    );
  };

  const findCourseById = (courseId: string) => {
    return availableCourses.find(course => course.id === courseId);
  };

  // ===== VALIDATION =====
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: "",
      code: "",
      credits: "",
      coverImage: "",
      lessons: "",
      instructors: "",
    };

    if (!subjectData.title.trim()) {
      newErrors.title = "กรุณาระบุชื่อวิชา";
      isValid = false;
    }

    if (!subjectData.code.trim()) {
      newErrors.code = "กรุณาระบุรหัสวิชา";
      isValid = false;
    }

    if (subjectData.credits < 1 || subjectData.credits > 10) {
      newErrors.credits = "จำนวนหน่วยกิตต้องอยู่ระหว่าง 1-10";
      isValid = false;
    }

    if (subjectData.lessons.length === 0) {
      newErrors.lessons = "กรุณาเลือกบทเรียนอย่างน้อย 1 บทเรียน";
      isValid = false;
    }

    if (subjectData.instructors.length === 0) {
      newErrors.instructors = "กรุณาเลือกอาจารย์ผู้สอนอย่างน้อย 1 คน";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // ===== FORM SUBMISSION =====
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
        return;
      }

      const formData = new FormData();
      formData.append("title", subjectData.title);
      formData.append("code", subjectData.code);
      formData.append("description", subjectData.description);
      formData.append("credits", subjectData.credits.toString());
      formData.append("department", subjectData.department);
      
      if (subjectData.coverImage) {
        formData.append("coverImage", subjectData.coverImage);
      }

      formData.append("lessons", JSON.stringify(subjectData.lessons));
      formData.append("instructors", JSON.stringify(subjectData.instructors));
      formData.append("courses", JSON.stringify(subjectData.courses));
      
      if (subjectData.preTestId) {
        formData.append("preTestId", subjectData.preTestId);
      }
      if (subjectData.postTestId) {
        formData.append("postTestId", subjectData.postTestId);
      }

      const url = subjectToEdit 
        ? `${apiUrl}/api/courses/subjects/${subjectToEdit}`
        : `${apiUrl}/api/courses/subjects`;
      
      const method = subjectToEdit ? 'put' : 'post';
      
      const response = await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setApiSuccess(subjectToEdit ? "แก้ไขวิชาสำเร็จ" : "สร้างวิชาสำเร็จ");
        
        if (onSubmit) {
          onSubmit(response.data.subject);
        }

        // Reset form if creating new
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
            courses: [],
          });
          setImagePreview(null);
          setExistingImageUrl(null);
        }
      }
    } catch (error: any) {
      console.error("Error submitting subject:", error);
      if (error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handlePreview = () => {
    if (validateForm()) {
      setShowPreview(true);
    }
  };

  const handleBackToForm = () => {
    setShowPreview(false);
  };

  // ===== RENDER FUNCTIONS =====
  const renderSubjectInfo = () => (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <i className="fas fa-info-circle me-2"></i>
          ข้อมูลพื้นฐานวิชา
        </h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-8">
            <div className="mb-3">
              <label htmlFor="title" className="form-label">
                ชื่อวิชา <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                id="title"
                name="title"
                value={subjectData.title}
                onChange={handleInputChange}
                placeholder="ระบุชื่อวิชา"
              />
              {errors.title && <div className="invalid-feedback">{errors.title}</div>}
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="code" className="form-label">
                    รหัสวิชา <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.code ? 'is-invalid' : ''}`}
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
                    จำนวนหน่วยกิต <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className={`form-control ${errors.credits ? 'is-invalid' : ''}`}
                    id="credits"
                    name="credits"
                    value={subjectData.credits}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                  />
                  {errors.credits && <div className="invalid-feedback">{errors.credits}</div>}
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="department" className="form-label">
                ภาควิชา
              </label>
              <select
                className="form-select"
                id="department"
                name="department"
                value={subjectData.department}
                onChange={handleInputChange}
              >
                <option value="">เลือกภาควิชา</option>
                {availableDepartments.map((dept) => (
                  <option key={dept.department_id} value={dept.department_id}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                คำอธิบายวิชา
              </label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={subjectData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="ระบุคำอธิบายวิชา วัตถุประสงค์ และเนื้อหาที่จะเรียน"
              />
            </div>
          </div>

          <div className="col-md-4">
            <div className="mb-3">
              <label className="form-label">รูปปกวิชา <span className="text-danger">*</span></label>
              <div className="cover-image-upload">
                {(imagePreview || existingImageUrl) ? (
                  <div className="image-preview-container">
                    <img
                      src={imagePreview || existingImageUrl || ""}
                      alt="รูปปกวิชา"
                      className="img-fluid rounded"
                      style={{ maxHeight: "200px", width: "100%", objectFit: "cover" }}
                      
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                      onClick={handleRemoveImage}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ) : (
                  <div
                    className="upload-placeholder d-flex flex-column align-items-center justify-content-center border border-dashed rounded p-4"
                    style={{ minHeight: "200px", cursor: "pointer" }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <i className="fas fa-cloud-upload-alt fa-3x text-muted mb-2"></i>
                    <p className="text-muted mb-0">คลิกเพื่ออัปโหลดรูปปก</p>
                    <small className="text-muted">รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 2MB</small>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="d-none"
                  required
                />
                {errors.coverImage && (
                  <div className="text-danger small mt-1">{errors.coverImage}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInstructorSection = () => (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-success text-white">
        <h5 className="mb-0">
          <i className="fas fa-chalkboard-teacher me-2"></i>
          อาจารย์ผู้สอน
        </h5>
      </div>
      <div className="card-body">
        <p className="text-muted mb-3">
          เลือกอาจารย์ผู้สอนสำหรับวิชานี้ <span className="text-danger">*</span>
        </p>
        
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            {subjectData.instructors.length > 0 ? (
              <span className="badge bg-success rounded-pill">
                เลือกแล้ว {subjectData.instructors.length} คน
              </span>
            ) : (
              <span className="badge bg-secondary rounded-pill">
                ยังไม่ได้เลือกอาจารย์
              </span>
            )}
          </div>
          <button
            type="button"
            className="btn btn-outline-success btn-sm"
            onClick={() => setShowInstructorModal(true)}
          >
            <i className="fas fa-user-plus me-2"></i>เลือกอาจารย์
          </button>
        </div>

        {errors.instructors && (
          <div className="alert alert-danger py-2">{errors.instructors}</div>
        )}

        {subjectData.instructors.length > 0 && (
          <div className="selected-instructors">
            <h6 className="mb-2">อาจารย์ที่เลือก:</h6>
            <div className="row g-2">
              {subjectData.instructors.map(instructorId => {
                const instructor = findInstructorById(instructorId);
                return instructor ? (
                  <div key={instructor.instructor_id} className="col-md-6">
                    <div className="card border h-100">
                      <div className="card-body py-2 px-3">
                        <div className="d-flex align-items-center">
                          {instructor.avatar && (
                            <img
                              src={instructor.avatar}
                              alt={instructor.name}
                              className="rounded-circle me-2"
                              style={{ width: "40px", height: "40px", objectFit: "cover" }}
                            />
                          )}
                          <div className="flex-grow-1">
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
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderLessonSection = () => (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-info text-white">
        <h5 className="mb-0">
          <i className="fas fa-play-circle me-2"></i>
          บทเรียน
        </h5>
      </div>
      <div className="card-body">
        <p className="text-muted mb-3">
          เลือกบทเรียนสำหรับวิชานี้ และจัดเรียงลำดับการเรียน <span className="text-danger">*</span>
        </p>
        
        <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex gap-2">
            {subjectData.lessons.length > 0 ? (
              <span className="badge bg-info rounded-pill">
                {subjectData.lessons.length} บทเรียน
              </span>
            ) : (
              <span className="badge bg-secondary rounded-pill">
                ยังไม่ได้เลือกบทเรียน
              </span>
            )}
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-info btn-sm"
              onClick={() => setShowLessonModal(true)}
            >
              <i className="fas fa-plus me-2"></i>เลือกบทเรียน
            </button>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() => setShowCreateLessonModal(true)}
            >
              <i className="fas fa-video me-2"></i>สร้างบทเรียนใหม่
            </button>
          </div>
        </div>

        {errors.lessons && (
          <div className="alert alert-danger py-2">{errors.lessons}</div>
        )}

        {subjectData.lessons.length > 0 && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="lessons-list">
              <h6 className="mb-3">บทเรียนที่เลือก (ลากเพื่อเรียงลำดับ):</h6>
              {subjectData.lessons
                .sort((a, b) => a.order - b.order)
                .map((lesson) => (
                  <div key={lesson.id} className="lesson-item card mb-2">
                    <div className="card-body py-2 px-3">
                      <div className="d-flex align-items-center">
                        <div className="drag-handle me-3">
                          <i className="fas fa-grip-vertical text-muted"></i>
                        </div>
                        <div className="lesson-order me-3">
                          <span className="badge bg-primary">{lesson.order}</span>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{lesson.title}</h6>
                          <div className="d-flex gap-3 small text-muted">
                            <span>
                              <i className="fas fa-clock me-1"></i>
                              {lesson.duration || "ไม่ระบุ"}
                            </span>
                            {lesson.hasQuiz && (
                              <span className="text-success">
                                <i className="fas fa-question-circle me-1"></i>
                                มีแบบทดสอบ
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm text-danger"
                          onClick={() => handleRemoveLesson(lesson.id)}
                        >
                          <i className="fas fa-times-circle"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  );

  const renderQuizSection = () => (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-warning text-dark">
        <h5 className="mb-0">
          <i className="fas fa-clipboard-check me-2"></i>
          แบบทดสอบ (ไม่บังคับ)
        </h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="preTestId" className="form-label">
                แบบทดสอบก่อนเรียน
              </label>
              <select
                className="form-select"
                id="preTestId"
                name="preTestId"
                value={subjectData.preTestId || ""}
                onChange={(e) => setSubjectData(prev => ({ 
                  ...prev, 
                  preTestId: e.target.value || null 
                }))}
              >
                <option value="">ไม่มีแบบทดสอบก่อนเรียน</option>
                {availableQuizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.title} ({quiz.question_count} ข้อ)
                  </option>
                ))}
              </select>
              <small className="text-muted">
                แบบทดสอบเพื่อประเมินความรู้พื้นฐานก่อนเรียน
              </small>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="postTestId" className="form-label">
                แบบทดสอบหลังเรียน
              </label>
              <select
                className="form-select"
                id="postTestId"
                name="postTestId"
                value={subjectData.postTestId || ""}
                onChange={(e) => setSubjectData(prev => ({ 
                  ...prev, 
                  postTestId: e.target.value || null 
                }))}
              >
                <option value="">ไม่มีแบบทดสอบหลังเรียน</option>
                {availableQuizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.title} ({quiz.question_count} ข้อ)
                  </option>
                ))}
              </select>
              <small className="text-muted">
                แบบทดสอบเพื่อประเมินผลการเรียนรู้หลังเรียน
              </small>
            </div>
          </div>
        </div>
        
        <div className="d-flex gap-2 mt-3">
          <button
            type="button"
            className="btn btn-outline-warning btn-sm"
            onClick={() => setShowCreateQuizModal(true)}
          >
            <i className="fas fa-plus me-2"></i>สร้างแบบทดสอบใหม่
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setShowCreateQuestionModal(true)}
          >
            <i className="fas fa-question me-2"></i>สร้างคำถามใหม่
          </button>
        </div>
      </div>
    </div>
  );

  const renderCourseSection = () => (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-secondary text-white">
        <h5 className="mb-0">
          <i className="fas fa-graduation-cap me-2"></i>
          หลักสูตร (ไม่บังคับ)
        </h5>
      </div>
      <div className="card-body">
        <p className="text-muted mb-3">
          เลือกหลักสูตรที่วิชานี้จะเป็นส่วนหนึ่ง
        </p>
        
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            {subjectData.courses.length > 0 ? (
              <span className="badge bg-secondary rounded-pill">
                เลือกแล้ว {subjectData.courses.length} หลักสูตร
              </span>
            ) : (
              <span className="badge bg-light text-dark rounded-pill">
                ยังไม่ได้เลือกหลักสูตร
              </span>
            )}
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setShowCourseModal(true)}
          >
            <i className="fas fa-plus me-2"></i>เลือกหลักสูตร
          </button>
        </div>

        {subjectData.courses.length > 0 && (
          <div className="selected-courses">
            <h6 className="mb-2">หลักสูตรที่เลือก:</h6>
            <div className="row g-2">
              {subjectData.courses.map(courseId => {
                const course = findCourseById(courseId);
                return course ? (
                  <div key={course.id} className="col-md-6">
                    <div className="card border h-100">
                      <div className="card-body py-2 px-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">{course.title}</h6>
                            <p className="mb-0 small text-muted">
                              {course.category} • {course.subjects} วิชา
                            </p>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm text-danger"
                            onClick={() => handleToggleCourse(courseId)}
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
  );

  const renderPreview = () => (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-dark text-white">
        <h5 className="mb-0">
          <i className="fas fa-eye me-2"></i>
          ตัวอย่างหน้าวิชา
        </h5>
      </div>
      <div className="card-body p-0">
        <div className="subject-preview bg-light p-4">
          {/* Subject Header */}
          <div className="row mb-4">
            <div className="col-md-8">
              <div className="d-flex align-items-start">
                <div className="flex-grow-1">
                  <h2 className="mb-2">{subjectData.title}</h2>
                  <p className="text-muted mb-2">
                    <span className="badge bg-primary me-2">{subjectData.code}</span>
                    {subjectData.credits} หน่วยกิต
                  </p>
                  <p className="mb-3">{subjectData.description}</p>
                  
                  {/* Instructors */}
                  <div className="instructors mb-3">
                    <h6 className="mb-2">อาจารย์ผู้สอน:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {subjectData.instructors.map(instructorId => {
                        const instructor = findInstructorById(instructorId);
                        return instructor ? (
                          <div key={instructor.instructor_id} className="d-flex align-items-center bg-white rounded px-2 py-1 border">
                            {instructor.avatar && (
                              <img
                                src={instructor.avatar}
                                alt={instructor.name}
                                className="rounded-circle me-2"
                                style={{ width: "24px", height: "24px", objectFit: "cover" }}
                              />
                            )}
                            <span className="small">{instructor.name}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              {(imagePreview || existingImageUrl) && (
                <img
                  src={imagePreview || existingImageUrl || ""}
                  alt="รูปปกวิชา"
                  className="img-fluid rounded shadow-sm"
                  style={{ width: "100%", maxHeight: "200px", objectFit: "cover" }}
                />
              )}
            </div>
          </div>

          {/* Lesson Area Preview */}
          <div className="lesson-area bg-white rounded p-3 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">
                <i className="fas fa-play-circle text-primary me-2"></i>
                บทเรียนทั้งหมด ({subjectData.lessons.length} บทเรียน)
              </h5>
              <div className="lesson-stats">
                <span className="badge bg-info me-2">
                  {subjectData.lessons.filter(l => l.hasQuiz).length} แบบทดสอบ
                </span>
              </div>
            </div>

            <div className="lessons-preview">
              {subjectData.lessons.length > 0 ? (
                subjectData.lessons
                  .sort((a, b) => a.order - b.order)
                  .map((lesson) => (
                    <div key={lesson.id} className="lesson-preview-item border rounded p-3 mb-2">
                      <div className="d-flex align-items-center">
                        <div className="lesson-number me-3">
                          <span className="badge bg-primary rounded-circle" style={{ width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {lesson.order}
                          </span>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{lesson.title}</h6>
                          {lesson.description && (
                            <p className="mb-1 small text-muted">{lesson.description}</p>
                          )}
                          <div className="d-flex gap-3 small text-muted">
                            <span>
                              <i className="fas fa-clock me-1"></i>
                              {lesson.duration || "ไม่ระบุ"}
                            </span>
                            {lesson.hasQuiz && (
                              <span className="text-success">
                                <i className="fas fa-question-circle me-1"></i>
                                มีแบบทดสอบ
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="lesson-actions">
                          <button className="btn btn-outline-primary btn-sm me-2">
                            <i className="fas fa-play me-1"></i>เรียน
                          </button>
                          {lesson.hasQuiz && (
                                                        <button className="btn btn-outline-success btn-sm">
                              <i className="fas fa-clipboard-check me-1"></i>ทดสอบ
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-4 text-muted">
                  <i className="fas fa-video fa-2x mb-2"></i>
                  <p>ยังไม่มีบทเรียน</p>
                </div>
              )}
            </div>

            {/* Pre/Post Tests */}
            {(subjectData.preTestId || subjectData.postTestId) && (
              <div className="tests-section mt-4 pt-3 border-top">
                <h6 className="mb-3">แบบทดสอบเพิ่มเติม</h6>
                <div className="row">
                  {subjectData.preTestId && (
                    <div className="col-md-6">
                      <div className="test-card bg-warning bg-opacity-10 border border-warning rounded p-3">
                        <h6 className="text-warning mb-2">
                          <i className="fas fa-clipboard-list me-2"></i>
                          แบบทดสอบก่อนเรียน
                        </h6>
                        <p className="mb-2 small">
                          {availableQuizzes.find(q => q.id === subjectData.preTestId)?.title}
                        </p>
                        <button className="btn btn-warning btn-sm">
                          <i className="fas fa-play me-1"></i>เริ่มทดสอบ
                        </button>
                      </div>
                    </div>
                  )}
                  {subjectData.postTestId && (
                    <div className="col-md-6">
                      <div className="test-card bg-success bg-opacity-10 border border-success rounded p-3">
                        <h6 className="text-success mb-2">
                          <i className="fas fa-clipboard-check me-2"></i>
                          แบบทดสอบหลังเรียน
                        </h6>
                        <p className="mb-2 small">
                          {availableQuizzes.find(q => q.id === subjectData.postTestId)?.title}
                        </p>
                        <button className="btn btn-success btn-sm">
                          <i className="fas fa-play me-1"></i>เริ่มทดสอบ
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ===== MODALS =====
  const renderLessonModal = () => (
    showLessonModal && (
      <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">เลือกบทเรียน</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowLessonModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="ค้นหาบทเรียน..."
                  value={lessonSearchTerm}
                  onChange={(e) => setLessonSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="lesson-list" style={{ maxHeight: "400px", overflowY: "auto" }}>
                {filteredLessons.length > 0 ? (
                  <div className="list-group">
                    {filteredLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                          subjectData.lessons.some(l => l.id === lesson.id) ? 'active' : ''
                        }`}
                      >
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{lesson.title}</h6>
                          <div className="d-flex gap-3 small text-muted">
                            <span>
                              <i className="fas fa-clock me-1"></i>
                              {lesson.duration}
                            </span>
                            {lesson.hasQuiz && (
                              <span className="text-success">
                                <i className="fas fa-question-circle me-1"></i>
                                มีแบบทดสอบ
                              </span>
                            )}
                          </div>
                          {lesson.description && (
                            <p className="mb-0 small text-muted mt-1">{lesson.description}</p>
                          )}
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={subjectData.lessons.some(l => l.id === lesson.id)}
                            onChange={() => {
                              if (subjectData.lessons.some(l => l.id === lesson.id)) {
                                handleRemoveLesson(lesson.id);
                              } else {
                                handleAddLesson(lesson.id);
                              }
                            }}
                          />
                        </div>
                      </div>
                    ))}
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
                className="btn btn-secondary" 
                onClick={() => setShowLessonModal(false)}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  const renderInstructorModal = () => (
    showInstructorModal && (
      <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">เลือกอาจารย์ผู้สอน</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowInstructorModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="ค้นหาอาจารย์..."
                  value={instructorSearchTerm}
                  onChange={(e) => setInstructorSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="instructor-list" style={{ maxHeight: "400px", overflowY: "auto" }}>
                {filteredInstructors.length > 0 ? (
                  <div className="list-group">
                    {filteredInstructors.map((instructor) => (
                      <div
                        key={instructor.instructor_id}
                        className={`list-group-item list-group-item-action d-flex align-items-center ${
                          subjectData.instructors.includes(instructor.instructor_id.toString()) ? 'active' : ''
                        }`}
                      >
                        <div className="form-check me-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={subjectData.instructors.includes(instructor.instructor_id.toString())}
                            onChange={() => handleToggleInstructor(instructor.instructor_id.toString())}
                          />
                        </div>
                        {instructor.avatar && (
                          <img
                            src={instructor.avatar}
                            alt={instructor.name}
                            className="rounded-circle me-3"
                            style={{ width: "50px", height: "50px", objectFit: "cover" }}
                          />
                        )}
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{instructor.name}</h6>
                          <p className="mb-1 small text-muted">{instructor.position}</p>
                          {instructor.bio && (
                            <p className="mb-0 small text-muted">{instructor.bio}</p>
                          )}
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
                className="btn btn-secondary" 
                onClick={() => setShowInstructorModal(false)}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  const renderCourseModal = () => (
    showCourseModal && (
      <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">เลือกหลักสูตร</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowCourseModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="ค้นหาหลักสูตร..."
                  value={courseSearchTerm}
                  onChange={(e) => setCourseSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="course-list" style={{ maxHeight: "400px", overflowY: "auto" }}>
                {filteredCourses.length > 0 ? (
                  <div className="list-group">
                    {filteredCourses.map((course) => (
                      <div
                        key={course.id}
                        className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                          subjectData.courses.includes(course.id) ? 'active' : ''
                        }`}
                      >
                        <div>
                          <h6 className="mb-1">{course.title}</h6>
                          <p className="mb-0 small text-muted">
                            {course.category} • {course.subjects} วิชา
                          </p>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
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
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowCourseModal(false)}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  // ===== MAIN RENDER =====
  if (isLoading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">กำลังโหลด...</span>
            </div>
            <p className="text-muted">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Success/Error Messages */}
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

      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            {subjectToEdit ? 'แก้ไขวิชา' : 'สร้างวิชาใหม่'}
          </h2>
          <p className="text-muted mb-0">
            {subjectToEdit ? 'แก้ไขข้อมูลวิชาและจัดการเนื้อหา' : 'สร้างวิชาใหม่และจัดการเนื้อหาการเรียน'}
          </p>
        </div>
        <div className="d-flex gap-2">
          {!showPreview && (
            <button
              type="button"
              className="btn btn-outline-info"
              onClick={handlePreview}
                            disabled={!subjectData.title || !subjectData.code || subjectData.lessons.length === 0 || subjectData.instructors.length === 0}
            >
              <i className="fas fa-eye me-2"></i>
              ดูตัวอย่าง
            </button>
          )}
          {showPreview && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleBackToForm}
            >
              <i className="fas fa-edit me-2"></i>
              แก้ไข
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {!showPreview ? (
          <>
            {renderSubjectInfo()}
            {renderInstructorSection()}
            {renderLessonSection()}
            {renderQuizSection()}
            {renderCourseSection()}
          </>
        ) : (
          renderPreview()
        )}

        {/* Action Buttons */}
        <div className="d-flex justify-content-between mt-4">
          <button 
            type="button" 
            className="btn btn-outline-secondary"
            onClick={handleCancel}
          >
            <i className="fas fa-times me-2"></i>
            ยกเลิก
          </button>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                กำลังบันทึก...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                {subjectToEdit ? 'บันทึกการแก้ไข' : 'สร้างวิชา'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Modals */}
      {renderLessonModal()}
      {renderInstructorModal()}
      {renderCourseModal()}

      {/* Create New Content Modals */}
      {showCreateLessonModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">สร้างบทเรียนใหม่</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateLessonModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  ฟีเจอร์นี้จะเปิดหน้าสร้างบทเรียนใหม่ในอนาคต
                </div>
                <p>คุณสามารถ:</p>
                <ul>
                  <li>สร้างบทเรียนวิดีโอ</li>
                  <li>เพิ่มเอกสารประกอบ</li>
                  <li>กำหนดแบบทดสอบในบทเรียน</li>
                  <li>ตั้งค่าระยะเวลาการเรียน</li>
                </ul>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowCreateLessonModal(false)}
                >
                  ปิด
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    setShowCreateLessonModal(false);
                    // TODO: Navigate to lesson creation page
                    toast.info("ฟีเจอร์นี้จะเปิดใช้งานในเร็วๆ นี้");
                  }}
                >
                  เริ่มสร้างบทเรียน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateQuizModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">สร้างแบบทดสอบใหม่</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateQuizModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  ฟีเจอร์นี้จะเปิดหน้าสร้างแบบทดสอบใหม่ในอนาคต
                </div>
                <p>คุณสามารถ:</p>
                <ul>
                  <li>สร้างแบบทดสอบหลายรูปแบบ</li>
                  <li>เพิ่มคำถามปรนัยและอัตนัย</li>
                  <li>กำหนดเวลาทำแบบทดสอบ</li>
                  <li>ตั้งค่าเกณฑ์การผ่าน</li>
                </ul>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowCreateQuizModal(false)}
                >
                  ปิด
                </button>
                <button 
                  type="button" 
                  className="btn btn-warning"
                  onClick={() => {
                    setShowCreateQuizModal(false);
                    // TODO: Navigate to quiz creation page
                    toast.info("ฟีเจอร์นี้จะเปิดใช้งานในเร็วๆ นี้");
                  }}
                >
                  เริ่มสร้างแบบทดสอบ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateQuestionModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">สร้างคำถามใหม่</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateQuestionModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-success">
                  <i className="fas fa-question-circle me-2"></i>
                  ฟีเจอร์นี้จะเปิดหน้าสร้างคำถามใหม่ในอนาคต
                </div>
                <p>คุณสามารถ:</p>
                <ul>
                  <li>สร้างคำถามปรนัย (หลายตัวเลือก, ตัวเลือกเดียว, ถูก/ผิด)</li>
                  <li>สร้างคำถามอัตนัย (เติมคำ, คำตอบสั้น, เรียงความ)</li>
                  <li>เพิ่มรูปภาพและไฟล์แนบ</li>
                  <li>กำหนดคะแนนและเกณฑ์การตรวจ</li>
                </ul>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowCreateQuestionModal(false)}
                >
                  ปิด
                </button>
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={() => {
                    setShowCreateQuestionModal(false);
                    // TODO: Navigate to question creation page
                    toast.info("ฟีเจอร์นี้จะเปิดใช้งานในเร็วๆ นี้");
                  }}
                >
                  เริ่มสร้างคำถาม
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS */}
      <style>{`
        .cover-image-upload {
          position: relative;
        }
        
        .image-preview-container {
          position: relative;
          display: inline-block;
          width: 100%;
        }
        
        .upload-placeholder:hover {
          background-color: #f8f9fa;
          border-color: #0d6efd;
        }
        
        .lesson-item {
          transition: all 0.2s ease;
        }
        
        .lesson-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .drag-handle {
          cursor: grab;
        }
        
        .drag-handle:active {
          cursor: grabbing;
        }
        
        .lesson-preview-item {
          transition: all 0.2s ease;
        }
        
        .lesson-preview-item:hover {
          background-color: #f8f9fa;
        }
        
        .subject-preview {
          font-family: inherit;
        }
        
        .test-card {
          transition: all 0.2s ease;
        }
        
        .test-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .modal-xl {
          max-width: 90%;
        }
        
        @media (max-width: 768px) {
          .modal-xl {
            max-width: 95%;
          }
        }
      `}</style>
    </div>
  );
};

export default AddSubjects;




