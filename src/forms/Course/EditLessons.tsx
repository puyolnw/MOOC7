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
        setLessonData({
          lesson_id: Number(lesson.id || lesson.lesson_id || lessonId),
          title: lesson.title || "",
          description: lesson.description || "",
          files: [],
          videoUrl: lesson.video_url || "",
          canPreview: lesson.can_preview || false,
          hasQuiz: lesson.has_quiz || false,
          quizId: lesson.quiz_id ? Number(lesson.quiz_id) : null,
          subjects: lesson.subjects?.map((s: Subject) => Number(s.subject_id || s.id)) || [],
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
        const errorMessage = error.message || "ไม่สามารถโหลดข้อมูลได้";
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

  const handleRemoveFile = (index: number) => {
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

      const formData = new FormData();
      formData.append("lessonId", String(lessonData.lesson_id));
      formData.append("title", lessonData.title);
      formData.append("description", lessonData.description);
      lessonData.files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("videoUrl", lessonData.videoUrl);
      formData.append("canPreview", String(lessonData.canPreview));
      formData.append("hasQuiz", String(lessonData.hasQuiz));
      formData.append("quizId", lessonData.quizId ? String(lessonData.quizId) : "");
      formData.append("subjects", JSON.stringify(lessonData.subjects));

      const response = await axios.put(
        `${apiUrl}/api/courses/lessons/${lessonId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

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
            <label htmlFor="lessonId" className="form-label">
              รหัสบทเรียน
            </label>
            <input
              type="text"
              className="form-control"
              id="lessonId"
              value={lessonData.lesson_id}
              readOnly
              disabled
            />
          </div>

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
              placeholder="ระบุชื่อบทเรียน"
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              คำอธิบาย <span className="text-danger">*</span>
            </label>
            <textarea
              className={`form-control ${errors.description ? "is-invalid" : ""}`}
              id="description"
              name="description"
              value={lessonData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="ระบุคำอธิบายเกี่ยวกับบทเรียน"
            />
            {errors.description && (
              <div className="invalid-feedback">{errors.description}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">ไฟล์ประกอบบทเรียน</label>
            <div className="d-flex flex-column gap-2">
              <input
                type="file"
                className="form-control"
                id="files"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                style={{ display: "none" }}
              />
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="fas fa-upload me-2"></i>อัปโหลดไฟล์
              </button>
              <small className="text-muted">
                รองรับไฟล์ PDF, DOC, DOCX, PPT, PPTX (สูงสุด 10MB ต่อไฟล์)
              </small>
              {lessonData.files.length > 0 && (
                <ul className="list-group mt-2">
                  {lessonData.files.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      {file.name}
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="videoUrl" className="form-label">
              URL วิดีโอบทเรียน
            </label>
            <input
              type="text"
              className="form-control"
              id="videoUrl"
              name="videoUrl"
              value={lessonData.videoUrl}
              onChange={handleInputChange}
              placeholder="ระบุ URL วิดีโอบทเรียน (ถ้ามี)"
            />
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">2. ตั้งค่าบทเรียน</h5>

          <div className="mb-3">
            <label className="form-label">วิชาที่เกี่ยวข้อง</label>
            <Select
              isMulti
              options={subjectsOptions}
              value={subjectsOptions.filter((option) =>
                lessonData.subjects.includes(option.value)
              )}
              onChange={handleSubjectsChange}
              placeholder="เลือกวิชาที่เกี่ยวข้อง"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">อนุญาตให้ดูตัวอย่าง</label>
            <div>
              <button
                type="button"
                className={`btn ${
                  lessonData.canPreview ? "btn-success" : "btn-outline-secondary"
                }`}
                onClick={() => handleToggleChange("canPreview")}
              >
                {lessonData.canPreview ? (
                  <>
                    <i className="fas fa-check me-2"></i>เปิดใช้งาน
                  </>
                ) : (
                  <>
                    <i className="fas fa-times me-2"></i>ปิดใช้งาน
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">มีแบบทดสอบ</label>
            <div>
              <button
                type="button"
                className={`btn ${
                  lessonData.hasQuiz ? "btn-success" : "btn-outline-secondary"
                }`}
                onClick={() => handleToggleChange("hasQuiz")}
              >
                {lessonData.hasQuiz ? (
                  <>
                    <i className="fas fa-check me-2"></i>เปิดใช้งาน
                  </>
                ) : (
                  <>
                    <i className="fas fa-times me-2"></i>ปิดใช้งาน
                  </>
                )}
              </button>
            </div>
          </div>

          {lessonData.hasQuiz && (
            <div className="mb-3">
              <label className="form-label">เลือกแบบทดสอบ</label>
              <Select
                options={quizzesOptions}
                value={quizzesOptions.find(
                  (option) => option.value === lessonData.quizId
                )}
                onChange={handleQuizChange}
                isClearable
                placeholder="เลือกแบบทดสอบ"
              />
            </div>
          )}
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
              <i className="fas fa-save me-2"></i>บันทึกบทเรียน
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default EditLesson;