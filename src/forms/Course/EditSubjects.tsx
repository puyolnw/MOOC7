import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select, { MultiValue, SingleValue } from "react-select";

interface SubjectData {
  subjectId: string;
  title: string;
  code: string;
  description: string;
  credits: number;
  department: string;
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
    department: "",
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
  });

  const [lessonsOptions, setLessonsOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [quizzesOptions, setQuizzesOptions] = useState<
    { value: string; label: string; quiz: Quiz }[]
  >([]);
  const [instructorsOptions, setInstructorsOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [coursesOptions, setCoursesOptions] = useState<
    { value: string; label: string }[]
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

        const response = await axios.get(
          `${apiUrl}/api/courses/subjects/${subjectId}`
        );

        if (!response.data.success) {
          throw new Error(response.data.message || "ไม่พบข้อมูลวิชา");
        }

        const subject = response.data.subject;
        const newSubjectData = {
          subjectId: String(subject.subject_id) || "",
          title: subject.subject_name || "",
          code: subject.subject_code || "",
          description: subject.description || "",
          credits: subject.credits || 0,
          department: subject.department_name || "",
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
          instructors:
            subject.instructors?.map((i: any) => String(i.instructor_id)) || [],
          allowAllLessons: subject.allow_all_lessons || false,
          courses: subject.courses?.map((c: any) => String(c.course_id)) || [],
          status: subject.status || "",
        };

        setSubjectData(newSubjectData);

        setLessonsOptions(
          subject.lessons?.map((l: any) => ({
            value: String(l.lesson_id),
            label: l.title,
          })) || []
        );
        setQuizzesOptions(
          [
            subject.preTest && {
              value: String(subject.preTest.quiz_id),
              label: `${subject.preTest.title} (${subject.preTest.question_count} questions)`,
              quiz: {
                quiz_id: String(subject.preTest.quiz_id),
                title: subject.preTest.title,
                question_count: subject.preTest.question_count,
              },
            },
            subject.postTest && {
              value: String(subject.postTest.quiz_id),
              label: `${subject.postTest.title} (${subject.postTest.question_count} questions)`,
              quiz: {
                quiz_id: String(subject.postTest.quiz_id),
                title: subject.postTest.title,
                question_count: subject.postTest.question_count,
              },
            },
          ].filter(Boolean) as { value: string; label: string; quiz: Quiz }[]
        );
        setInstructorsOptions(
          subject.instructors?.map((i: any) => ({
            value: String(i.instructor_id),
            label: i.name,
          })) || []
        );
        setCoursesOptions(
          subject.courses?.map((c: any) => ({
            value: String(c.course_id),
            label: c.title,
          })) || []
        );
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSubjectData((prev) => ({
      ...prev,
      [name]: name === "credits" ? Number(value) : value,
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

    if (file.size > 2 * 1024 * 1024) {
      toast.error("ขนาดไฟล์ต้องไม่เกิน 2MB");
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

  const handleLessonsChange = (
    selected: MultiValue<{ value: string; label: string }>
  ) => {
    setSubjectData((prev) => ({
      ...prev,
      lessons: selected.map((opt, index) => ({
        id: opt.value,
        title: opt.label,
        order: index + 1,
      })),
    }));
  };

  const handleQuizChange = (
    selected: SingleValue<{ value: string; label: string; quiz: Quiz }>,
    field: "preTestId" | "postTestId"
  ) => {
    setSubjectData((prev) => ({
      ...prev,
      [field]: selected ? selected.value : null,
    }));
  };

  const handleInstructorsChange = (
    selected: MultiValue<{ value: string; label: string }>
  ) => {
    setSubjectData((prev) => ({
      ...prev,
      instructors: selected.map((opt) => opt.value),
    }));
  };

  const handleCoursesChange = (
    selected: MultiValue<{ value: string; label: string }>
  ) => {
    setSubjectData((prev) => ({
      ...prev,
      courses: selected.map((opt) => opt.value),
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
      formData.append("title", subjectData.title);
      formData.append("code", subjectData.code);
      formData.append("description", subjectData.description);
      formData.append("credits", String(subjectData.credits));
      formData.append("department", subjectData.department);
      formData.append("lessons", JSON.stringify(subjectData.lessons));
      formData.append("preTestId", subjectData.preTestId || "");
      formData.append("postTestId", subjectData.postTestId || "");
      formData.append("instructors", JSON.stringify(subjectData.instructors));
      formData.append("allowAllLessons", String(subjectData.allowAllLessons));
      formData.append("courses", JSON.stringify(subjectData.courses));
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
        toast.success("แก้ไขวิชาสำเร็จ");
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
            <label htmlFor="department" className="form-label">
              ภาควิชา
            </label>
            <input
              type="text"
              className="form-control"
              id="department"
              name="department"
              value={subjectData.department}
              onChange={handleInputChange}
              placeholder="ระบุภาควิชา (ถ้ามี)"
            />
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">2. ตั้งค่าวิชา</h5>

          <div className="mb-4">
            <label className="form-label">ภาพหน้าปกวิชา</label>
            <p className="text-muted small mb-2">
              แนะนำขนาด 1200 x 800 พิกเซล (ไม่เกิน 2MB)
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
            <label className="form-label">บทเรียน</label>
            <Select
              isMulti
              options={lessonsOptions}
              value={lessonsOptions.filter((option) =>
                subjectData.lessons.some((lesson) => lesson.id === option.value)
              )}
              onChange={handleLessonsChange}
              placeholder="เลือกบทเรียน"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">แบบทดสอบก่อนเรียน</label>
            <Select
              options={quizzesOptions}
              value={quizzesOptions.find(
                (option) => option.value === subjectData.preTestId
              )}
              onChange={(selected: SingleValue<{ value: string; label: string; quiz: Quiz }>) =>
                handleQuizChange(selected, "preTestId")
              }
              isClearable
              placeholder="เลือกแบบทดสอบก่อนเรียน"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">แบบทดสอบหลังเรียน</label>
            <Select
              options={quizzesOptions}
              value={quizzesOptions.find(
                (option) => option.value === subjectData.postTestId
              )}
              onChange={(selected: SingleValue<{ value: string; label: string; quiz: Quiz }>) =>
                handleQuizChange(selected, "postTestId")
              }
              isClearable
              placeholder="เลือกแบบทดสอบหลังเรียน"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">อาจารย์ผู้สอน</label>
            <Select
              isMulti
              options={instructorsOptions}
              value={instructorsOptions.filter((option) =>
                subjectData.instructors.includes(option.value)
              )}
              onChange={handleInstructorsChange}
              placeholder="เลือกอาจารย์ผู้สอน"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">คอร์สที่เกี่ยวข้อง</label>
            <Select
              isMulti
              options={coursesOptions}
              value={coursesOptions.filter((option) =>
                subjectData.courses.includes(option.value)
              )}
              onChange={handleCoursesChange}
              placeholder="เลือกคอร์สที่เกี่ยวข้อง"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">อนุญาตให้เข้าถึงทุกบทเรียน</label>
            <div>
              <button
                type="button"
                className={`btn ${
                  subjectData.allowAllLessons
                    ? "btn-success"
                    : "btn-outline-secondary"
                }`}
                onClick={handleAllowAllLessonsChange}
              >
                {subjectData.allowAllLessons ? (
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
    </form>
  );
};

export default EditSubject;