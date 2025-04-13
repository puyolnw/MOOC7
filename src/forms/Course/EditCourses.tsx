import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface CourseData {
  courseId: string;
  title: string;
  category: string;
  description: string;
  coverImage: File | null;
  coverImagePreview: string;
  status: string;
}

const EditCourse: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [courseData, setCourseData] = useState<CourseData>({
    courseId: "",
    title: "",
    category: "",
    description: "",
    coverImage: null,
    coverImagePreview: "",
    status: "active",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) {
        toast.error("ไม่พบรหัสคอร์ส");
        navigate("/admin-creditbank");
        return;
      }

      try {
        setIsLoading(true);
        setApiError(null);

        const courseRes = await axios.get(`${apiUrl}/api/courses/${courseId}`);

        console.log("Course Response:", courseRes.data);

        const course = courseRes.data.course;
        if (!course) {
          throw new Error("ไม่พบข้อมูลคอร์ส");
        }

        const newCourseData = {
          courseId: String(course.course_id) || "",
          title: course.title || "",
          category: course.category || "",
          description: course.description || "",
          coverImage: null,
          coverImagePreview: course.cover_image
            ? course.cover_image.startsWith("http")
              ? course.cover_image
              : `${apiUrl}/uploads/courses/covers/${course.cover_image.split("\\").pop()}`
            : "",
          status: course.status || "",
        };

        console.log("Setting courseData:", newCourseData);
        setCourseData(newCourseData);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setApiError(error.response?.data?.message || "ไม่สามารถโหลดข้อมูลได้");
        toast.error(error.response?.data?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId, apiUrl, navigate]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (name in errors) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle cover image upload
  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("ขนาดไฟล์ต้องไม่เกิน 2MB");
      return;
    }

    // Validate file type
    const fileType = file.type;
    if (!fileType.match(/^image\/(jpeg|jpg|png|gif)$/)) {
      toast.error("รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF)");
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    setCourseData((prev) => ({
      ...prev,
      coverImage: file,
      coverImagePreview: previewUrl,
    }));
  };

  // Remove cover image
  const handleRemoveCoverImage = () => {
    setCourseData((prev) => ({
      ...prev,
      coverImage: null,
      coverImagePreview: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: "",
      description: "",
    };

    if (!courseData.title.trim()) {
      newErrors.title = "กรุณาระบุชื่อหลักสูตร";
      isValid = false;
    }

    if (!courseData.description.trim()) {
      newErrors.description = "กรุณาระบุคำอธิบายหลักสูตร";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
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
      formData.append("title", courseData.title);
      formData.append("category", courseData.category);
      formData.append("description", courseData.description);
      formData.append("status", courseData.status);
      if (courseData.coverImage) {
        formData.append("coverImage", courseData.coverImage);
      }

      const response = await axios.put(`${apiUrl}/api/courses/${courseId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setApiSuccess("แก้ไขหลักสูตรสำเร็จ");
        toast.success("แก้ไขหลักสูตรสำเร็จ");
        setTimeout(() => {
          navigate("/admin-creditbank");
        }, 1500);
      } else {
        setApiError(response.data.message || "เกิดข้อผิดพลาดในการแก้ไขหลักสูตร");
        toast.error(response.data.message || "เกิดข้อผิดพลาดในการแก้ไขหลักสูตร");
      }
    } catch (error: any) {
      console.error("Error updating course:", error);
      const errorMessage = error.response?.data?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์";
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin-creditbank");
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
      {/* แสดงข้อความสำเร็จ */}
      {apiSuccess && (
        <div className="alert alert-success mb-4">
          <i className="fas fa-check-circle me-2"></i>
          {apiSuccess}
        </div>
      )}

      {/* แสดงข้อผิดพลาดจาก API */}
      {apiError && (
        <div className="alert alert-danger mb-4">
          <i className="fas fa-exclamation-circle me-2"></i>
          {apiError}
        </div>
      )}

      {/* ส่วนที่ 1: ข้อมูลหลักสูตร */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">1. ข้อมูลหลักสูตร</h5>

          <div className="mb-3">
            <label htmlFor="courseId" className="form-label">
              รหัสคอร์ส
            </label>
            <input
              type="text"
              className="form-control"
              id="courseId"
              value={courseData.courseId}
              readOnly
              disabled
            />
          </div>

          <div className="mb-3">
            <label htmlFor="title" className="form-label">
              ชื่อคอร์ส <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.title ? "is-invalid" : ""}`}
              id="title"
              name="title"
              value={courseData.title}
              onChange={handleInputChange}
              placeholder="ระบุชื่อหลักสูตร"
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="category" className="form-label">
              หมวดหมู่
            </label>
            <input
              type="text"
              className="form-control"
              id="category"
              name="category"
              value={courseData.category}
              onChange={handleInputChange}
              placeholder="ระบุหมวดหมู่ (ถ้ามี)"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              คำอธิบาย <span className="text-danger">*</span>
            </label>
            <textarea
              className={`form-control ${errors.description ? "is-invalid" : ""}`}
              id="description"
              name="description"
              value={courseData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="ระบุคำอธิบายเกี่ยวกับหลักสูตร"
            />
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
          </div>
        </div>
      </div>

      {/* ส่วนที่ 2: ตั้งค่าหลักสูตร */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">2. ตั้งค่าหลักสูตร</h5>

          <div className="mb-4">
            <label className="form-label">ภาพหน้าปกหลักสูตร</label>
            <p className="text-muted small mb-2">แนะนำขนาด 1200 x 800 พิกเซล (ไม่เกิน 2MB)</p>
            <div className="d-flex align-items-center gap-3">
              <div
                className="cover-image-preview rounded border"
                style={{
                  width: "150px",
                  height: "100px",
                  backgroundImage: courseData.coverImagePreview ? `url(${courseData.coverImagePreview})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f8f9fa",
                }}
              >
                {!courseData.coverImagePreview && <i className="fas fa-image fa-2x text-muted"></i>}
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
                    {courseData.coverImagePreview ? "เปลี่ยนภาพ" : "อัปโหลดภาพ"}
                  </button>
                  {courseData.coverImagePreview && (
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
            <label htmlFor="status" className="form-label">
              สถานะ
            </label>
            <select
              className="form-control"
              id="status"
              name="status"
              value={courseData.status}
              onChange={handleInputChange}
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* ปุ่มบันทึกและยกเลิก */}
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
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              กำลังบันทึก...
            </>
          ) : (
            <>
              <i className="fas fa-save me-2"></i>บันทึกหลักสูตร
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default EditCourse;