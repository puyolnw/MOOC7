import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select, { MultiValue, SingleValue } from "react-select";

// Define test type
type TestType = "MC" | "TF" | "SC" | "FB" | null;

interface LessonData {
  lesson_id: number;
  title: string;
  description: string;
  files: File[];
  videoUrl: string;
  canPreview: boolean;
  hasQuiz: boolean;
  quizId: number | null;
  subjects: number[];
  testType: TestType;
}

interface Quiz {
  id: number;
  title: string;
  questions: number;
  description?: string;
  type?: TestType;
}

interface Subject {
  id: number;
  title: string;
  category: string;
  credits: number;
  subject_id?: number;
  subject_name?: string;
  subject_code?: string;
  department?: string;
}

interface AddLessonsProps {
  onSubmit?: (lessonData: LessonData) => void;
  onCancel?: () => void;
  lessonToEdit?: LessonData;
}

const EditLesson: React.FC<AddLessonsProps> = ({ onCancel }) => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const fileInputRef = useRef<HTMLInputElement>(null);
  console.log("handleRemoveFile called with index:", fileInputRef);
  const [lessonData, setLessonData] = useState<LessonData>({
    lesson_id: 0,
    title: "",
    description: "",
    files: [],
    videoUrl: "",
    canPreview: false,
    hasQuiz: false,
    quizId: null,
    subjects: [],
    testType: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    title: "",
    description: "",
  });

  const [subjectsOptions, setSubjectsOptions] = useState<
    { value: number; label: string }[]
  >([]);
  const [quizzesOptions, setQuizzesOptions] = useState<
    { value: number; label: string }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      // เพิ่มการ log เพื่อ debug
      console.log("Current lessonId from useParams:", lessonId);
      console.log("Current URL:", window.location.href);

      // ตรวจสอบ lessonId
      if (!lessonId || isNaN(Number(lessonId))) {
        const errorMessage = `รหัสบทเรียนไม่ถูกต้อง (lessonId: ${lessonId}) ที่ URL: ${window.location.href}`;
        setApiError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      try {
        setIsLoading(true);
        setApiError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
        }

        // โหลดข้อมูลบทเรียน
        console.log("Fetching lesson data for lessonId:", lessonId);
        const lessonResponse = await axios.get(
          `${apiUrl}/api/courses/lessons/${lessonId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Lesson API response:", lessonResponse.data);

        if (!lessonResponse.data.success) {
          throw new Error(
            lessonResponse.data.message || "ไม่พบข้อมูลบทเรียน"
          );
        }

        const lesson = lessonResponse.data.lesson;
        
        // แปลงข้อมูลให้ตรงกับโครงสร้างที่ต้องการ
        setLessonData({
          lesson_id: Number(lesson.lesson_id),
          title: lesson.title || "",
          description: lesson.description || "",
          files: [], // ไม่โหลดไฟล์เดิม
          videoUrl: lesson.video_url || "",
          canPreview: Boolean(lesson.can_preview),
          hasQuiz: Boolean(lesson.quiz_id),
          quizId: lesson.quiz_id ? Number(lesson.quiz_id) : null,
          subjects: Array.isArray(lesson.subjects) 
            ? lesson.subjects.map((s: any) => Number(s.subject_id)) 
            : [],
          testType: lesson.quiz_type || null,
        });

        // โหลดข้อมูลวิชา
        const subjectsResponse = await axios.get(
          `${apiUrl}/api/courses/lessons/subjects/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (subjectsResponse.data.success) {
          setSubjectsOptions(
            subjectsResponse.data.subjects.map((s: Subject) => ({
              value: Number(s.id || s.subject_id),
              label: s.title || s.subject_name || "ไม่มีชื่อ",
            }))
          );
        }

        // โหลดข้อมูลแบบทดสอบ
        const quizzesResponse = await axios.get(
          `${apiUrl}/api/courses/lessons/quizzes/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (quizzesResponse.data.success) {
          setQuizzesOptions(
            quizzesResponse.data.quizzes.map((q: Quiz) => ({
              value: Number(q.id),
              label: `${q.title} (${q.questions} questions)`,
            }))
          );
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        console.error("Error response:", error.response?.data);
        const errorMessage = error.response?.data?.message || error.message || "ไม่สามารถโหลดข้อมูลได้";
        setApiError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [lessonId, apiUrl, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setLessonData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name in errors) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleRemoveFile called with index:", handleFileUpload);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const maxSize = 10 * 1024 * 1024;
    const invalidFiles = newFiles.filter((file) => file.size > maxSize);
    if (invalidFiles.length > 0) {
      toast.error("ไฟล์บางไฟล์มีขนาดเกิน 10MB");
      return;
    }

    setLessonData((prev) => ({
      ...prev,
      files: [...prev.files, ...newFiles],
    }));
  };

  const handleRemoveFile = (index: number) => { console.log("handleRemoveFile called with index:", handleRemoveFile);
    setLessonData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };
  
  const handleSubjectsChange = (
    selected: MultiValue<{ value: number; label: string }>
  ) => {
    setLessonData((prev) => ({
      ...prev,
      subjects: selected.map((opt) => opt.value),
    }));
  };

  const handleQuizChange = (
    selected: SingleValue<{ value: number; label: string }>
  ) => {
    setLessonData((prev) => ({
      ...prev,
      quizId: selected ? selected.value : null,
    }));
  };

  const handleToggleChange = (field: "canPreview" | "hasQuiz") => {
    setLessonData((prev) => ({
      ...prev,
      [field]: !prev[field],
      ...(field === "hasQuiz" && !prev[field] === false && { quizId: null }),
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: "",
      description: "",
    };

    if (!lessonData.title.trim()) {
      newErrors.title = "กรุณาระบุชื่อบทเรียน";
      isValid = false;
    }

    if (!lessonData.description.trim()) {
      newErrors.description = "กรุณาระบุคำอธิบายบทเรียน";
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

      // สร้างข้อมูลที่จะส่งไป API โดยไม่รวมไฟล์
      const requestData = {
        lessonId: lessonData.lesson_id,
        title: lessonData.title,
        description: lessonData.description,
        videoUrl: lessonData.videoUrl,
        canPreview: lessonData.canPreview,
        hasQuiz: lessonData.hasQuiz,
        quizId: lessonData.quizId || null,
        subjects: lessonData.subjects
      };

      console.log("Sending update request with data:", requestData);

      const response = await axios.put(
        `${apiUrl}/api/courses/lessons/${lessonId}`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Update response:", response.data);

      if (response.data.success) {
        setApiSuccess("แก้ไขบทเรียนสำเร็จ");
        toast.success("แก้ไขบทเรียนสำเร็จ");
        setTimeout(() => {
          navigate("/admin-lessons");
        }, 1500);
      } else {
        setApiError(response.data.message || "เกิดข้อผิดพลาดในการแก้ไขบทเรียน");
        toast.error(response.data.message || "เกิดข้อผิดพลาดในการแก้ไขบทเรียน");
      }
    } catch (error: any) {
      console.error("Error updating lesson:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage =
        error.response?.data?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์";
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("/admin-lessons");
    }
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
        <div className="mt-3">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate("/admin-lessons")}
          >
            กลับไปยังรายการบทเรียน
          </button>
        </div>
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
          <h5 className="card-title mb-3">1. ข้อมูลบทเรียน</h5>

          <div className="mb-3">
            <label htmlFor="title" className="form-label">
              ชื่อบทเรียน <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.title ? "is-invalid" : ""}`}
              id="title"
              name="title"
              value={lessonData.title}
              onChange={handleInputChange}
              required
            />
            {errors.title && (
              <div className="invalid-feedback">{errors.title}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              คำอธิบายบทเรียน <span className="text-danger">*</span>
            </label>
            <textarea
              className={`form-control ${errors.description ? "is-invalid" : ""}`}
              id="description"
              name="description"
              rows={3}
              value={lessonData.description}
              onChange={handleInputChange}
              required
            ></textarea>
            {errors.description && (
              <div className="invalid-feedback">{errors.description}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="videoUrl" className="form-label">
              URL วิดีโอ (YouTube)
            </label>
            <input
              type="text"
              className="form-control"
              id="videoUrl"
              name="videoUrl"
              value={lessonData.videoUrl}
              onChange={handleInputChange}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <small className="form-text text-muted">
              ใส่ URL ของวิดีโอ YouTube ที่ต้องการแสดงในบทเรียน
            </small>
          </div>

          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="canPreview"
              checked={lessonData.canPreview}
              onChange={() => handleToggleChange("canPreview")}
            />
            <label className="form-check-label" htmlFor="canPreview">
              อนุญาตให้ดูตัวอย่างบทเรียนได้โดยไม่ต้องลงทะเบียน
            </label>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">2. วิชาที่เกี่ยวข้อง</h5>
          <div className="mb-3">
            <label htmlFor="subjects" className="form-label">
              เลือกวิชาที่เกี่ยวข้อง
            </label>
            <Select
              isMulti
              name="subjects"
              options={subjectsOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder="เลือกวิชาที่เกี่ยวข้อง..."
              value={subjectsOptions.filter(option => 
                lessonData.subjects.includes(option.value)
              )}
              onChange={handleSubjectsChange}
            />
            <small className="form-text text-muted">
              เลือกวิชาที่เกี่ยวข้องกับบทเรียนนี้ (สามารถเลือกได้หลายวิชา)
            </small>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">3. แบบทดสอบ</h5>
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="hasQuiz"
              checked={lessonData.hasQuiz}
              onChange={() => handleToggleChange("hasQuiz")}
            />
            <label className="form-check-label" htmlFor="hasQuiz">
              มีแบบทดสอบท้ายบทเรียน
            </label>
          </div>

          {lessonData.hasQuiz && (
            <div className="mb-3">
              <label htmlFor="quizId" className="form-label">
                เลือกแบบทดสอบ
              </label>
              <Select
                name="quizId"
                options={quizzesOptions}
                className="basic-select"
                classNamePrefix="select"
                placeholder="เลือกแบบทดสอบ..."
                value={quizzesOptions.find(
                  option => option.value === lessonData.quizId
                ) || null}
                onChange={handleQuizChange}
                isClearable
              />
              <small className="form-text text-muted">
                เลือกแบบทดสอบที่ต้องการใช้สำหรับบทเรียนนี้
              </small>
            </div>
          )}
        </div>
      </div>

      <div className="d-flex justify-content-between mt-4">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          <i className="fas fa-arrow-left me-2"></i>
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
              บันทึกการแก้ไข
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default EditLesson;
