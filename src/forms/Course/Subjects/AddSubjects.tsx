import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import Swal from 'sweetalert2';

// ===== INTERFACES =====
export interface SubjectData {
  title: string;
  code: string;
  description: string;
  credits: number;
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

interface AddSubjectsProps {
  onSubmit?: (subjectData: any) => void;
  onCancel?: () => void;
  subjectToEdit?: string;
}

const AddSubjects: React.FC<AddSubjectsProps> = ({ onSubmit, onCancel }) => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course_id');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  // ===== STATES =====
  const [showAllSections, setShowAllSections] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  const [subjectData, setSubjectData] = useState<SubjectData>({
    title: "",
    code: "",
    description: "",
    credits: 3,
    coverImage: null,
    lessons: [],
    preTestId: null,
    postTestId: null,
    instructors: [],
    courses: courseId ? [courseId] : [],
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
  const [relatedCourses, setRelatedCourses] = useState<any[]>([]);

  // ===== EFFECTS =====
  useEffect(() => {
    if (courseId) {
      fetchCourseInfo();
    }
  }, [courseId]);

  // Auto-generate code เมื่อมีข้อมูลหลักสูตรแล้ว
  useEffect(() => {
    if (relatedCourses.length > 0 && !subjectData.code) {
      generateSubjectCode();
    }
  }, [relatedCourses]);

  // ===== API FUNCTIONS =====
  const fetchCourseInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${apiUrl}/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const course = response.data.course;
        setRelatedCourses([{
          id: course.course_id,
          title: course.title,
          department_name: course.department_name,
          faculty: course.faculty,
          department_id: course.department_id,
          department_code: course.department_code
        }]);
      }
    } catch (error) {
      console.error("Error fetching course info:", error);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลหลักสูตร");
    }
  };

  const generateSubjectCode = async () => {
    if (!courseId || relatedCourses.length === 0) return;

    setIsGeneratingCode(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${apiUrl}/api/courses/subjects/generate-code-by-course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSubjectData(prev => ({ ...prev, code: response.data.code }));
        setErrors(prev => ({ ...prev, code: "" }));
      }
    } catch (error) {
      console.error("Error generating code:", error);
      toast.error("เกิดข้อผิดพลาดในการสร้างรหัสรายวิชา");
    } finally {
      setIsGeneratingCode(false);
    }
  };

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

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, coverImage: "กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, GIF)" }));
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, coverImage: "ขนาดไฟล์ต้องไม่เกิน 5MB" }));
        return;
      }

      setSubjectData(prev => ({ ...prev, coverImage: file }));
      setErrors(prev => ({ ...prev, coverImage: "" }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSubjectData(prev => ({ ...prev, coverImage: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ===== VALIDATION =====
  const validateForm = (): boolean => {
    const newErrors = {
      title: "",
      code: "",
      credits: "",
      coverImage: "",
      lessons: "",
      instructors: "",
    };

    // Required fields
    if (!subjectData.title.trim()) {
      newErrors.title = "กรุณาระบุชื่อรายวิชา";
    }

    if (!subjectData.code.trim()) {
      newErrors.code = "กรุณาระบุรหัสรายวิชา";
    }

    if (subjectData.credits < 1 || subjectData.credits > 10) {
      newErrors.credits = "จำนวนหน่วยกิตต้องอยู่ระหว่าง 1-10";
    }

    if (!courseId) {
      toast.error("ไม่พบข้อมูลหลักสูตรที่เกี่ยวข้อง");
      return false;
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== "");
  };

  // ===== SUBMIT HANDLER =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("กรุณาตรวจสอบข้อมูลที่กรอก");
      return;
    }

    setIsSubmitting(true);
    setApiError("");
    setApiSuccess("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("กรุณาเข้าสู่ระบบใหม่");
        return;
      }

      const formData = new FormData();
      formData.append("title", subjectData.title);
      formData.append("code", subjectData.code);
      formData.append("description", subjectData.description);
      formData.append("credits", subjectData.credits.toString());

      if (subjectData.coverImage) {
        formData.append("coverImage", subjectData.coverImage);
      }

      if (subjectData.lessons.length > 0) {
        formData.append("lessons", JSON.stringify(subjectData.lessons));
      }

      if (subjectData.instructors.length > 0) {
        formData.append("instructors", JSON.stringify(subjectData.instructors));
      }

      if (subjectData.courses.length > 0) {
        formData.append("courses", JSON.stringify(subjectData.courses));
      }

      if (courseId) {
        formData.append("courseId", courseId);
      }

      const response = await axios.post(`${apiUrl}/api/courses/subjects`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // แสดง SweetAlert2 popup สำเร็จ
        const result = await Swal.fire({
          icon: 'success',
          title: 'สร้างรายวิชาสำเร็จ!',
          html: `
            <div class="text-start">
              <p><strong>ชื่อรายวิชา:</strong> ${subjectData.title}</p>
              <p><strong>รหัสรายวิชา:</strong> ${response.data.subject.code}</p>
              ${relatedCourses.length > 0 ? `<p><strong>หลักสูตร:</strong> ${relatedCourses[0].title}</p>` : ''}
            </div>
          `,
          confirmButtonText: 'เสร็จสิ้น',
          confirmButtonColor: '#28a745',
          showCancelButton: true,
          cancelButtonText: 'สร้างรายวิชาใหม่',
          cancelButtonColor: '#6c757d',
          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        // ตรวจสอบว่าผู้ใช้กดปุ่มใด
        if (result.isConfirmed) {
          // ผู้ใช้กด 'เสร็จสิ้น'
          if (onSubmit) {
            onSubmit(response.data.subject);
          }
          window.history.back(); // เด้งกลับไปหน้าก่อนหน้า
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // ผู้ใช้กด 'สร้างรายวิชาใหม่'
          // Reset form for new subject
          setSubjectData({
            title: "",
            code: "",
            description: "",
            credits: 3,
            coverImage: null,
            lessons: [],
            preTestId: null,
            postTestId: null,
            instructors: [],
            courses: courseId ? [courseId] : [],
          });
          setImagePreview(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          // Generate new code for next subject
          setTimeout(() => generateSubjectCode(), 500);
        }
      } else {
        toast.error(response.data.message || "เกิดข้อผิดพลาดในการสร้างรายวิชา");
      }
    } catch (error: any) {
      console.error("Error creating subject:", error);

      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: error.response?.data?.message || "เกิดข้อผิดพลาดในการสร้างรายวิชา",
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#dc3545',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      window.history.back();
    }
  };

  // ===== RENDER =====
  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">





          {/* Toggle Button */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">ตัวเลือกการกรอกข้อมูล</h6>
                    <p className="text-muted mb-0 small">
                      {showAllSections
                        ? 'กำลังแสดงข้อมูลทั้งหมด - คุณสามารถกรอกข้อมูลเพิ่มเติมได้'
                        : 'กำลังแสดงเฉพาะข้อมูลที่จำเป็น - คุณสามารถเพิ่มรายละเอียดได้ในภายหลัง'
                      }
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`btn ${showAllSections ? 'btn-outline-primary' : 'btn-primary'}`}
                    onClick={() => setShowAllSections(!showAllSections)}
                  >
                    {showAllSections ? (
                      <>
                        <i className="fas fa-eye-slash me-2"></i>
                        แสดงเฉพาะข้อมูลหลัก
                      </>
                    ) : (
                      <>
                        <i className="fas fa-eye me-2"></i>
                        แสดงข้อมูลทั้งหมด
                      </>
                    )}
                  </button>
                </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* 1. ข้อมูลหลักรายวิชา (จำเป็น) */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <h5 className="card-title mb-3">
                  <i className="fas fa-info-circle me-2 text-primary"></i>
                  ข้อมูลหลักรายวิชา
                </h5>

                <div className="row">
                  {/* ชื่อรายวิชา */}
                  <div className="col-md-8 mb-3">
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

                  {/* หน่วยกิต */}
                  <div className="col-md-4 mb-3">
                    <label htmlFor="credits" className="form-label">
                      หน่วยกิต
                    </label>
                    <input
                      type="number"
                      className={`form-control ${errors.credits ? "is-invalid" : ""}`}
                      id="credits"
                      name="credits"
                      value={subjectData.credits}
                      onChange={handleInputChange}
                      min="1"
                      max="10"
                    />
                    {errors.credits && <div className="invalid-feedback">{errors.credits}</div>}
                  </div>

                  {/* รหัสรายวิชา */}
                  <div className="col-12 mb-3">
                    <label htmlFor="code" className="form-label">
                      รหัสรายวิชา <span className="text-danger">*</span>
                      {relatedCourses.length > 0 && (
                        <small className="text-success ms-2">
                          <i className="fas fa-check-circle me-1"></i>
                          สร้างอัตโนมัติจากหลักสูตร
                        </small>
                      )}
                    </label>
<div className="input-group">
  <input
    type="text"
    className={`form-control ${errors.code ? "is-invalid" : ""} ${relatedCourses.length > 0 ? "border-success" : ""}`}
    id="code"
    name="code"
    value={subjectData.code}
    onChange={handleInputChange}
    placeholder="Subject Code"
    readOnly={isGeneratingCode}
  />
  <button
    type="button"
    className="btn btn-outline-secondary"
    onClick={generateSubjectCode}
    disabled={!courseId || isGeneratingCode}
    title="Generate new subject code"
  >
    {isGeneratingCode ? (
      <div className="spinner-border spinner-border-sm" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    ) : (
      <i className="fas fa-sync-alt"></i>
    )}
  </button>
  {errors.code && <div className="invalid-feedback">{errors.code}</div>}
</div>

                    <small className="text-muted">
                      รหัสจะถูกสร้างอัตโนมัติตามหลักสูตรและลำดับรายวิชา
                    </small>
                  </div>
                </div>

                {/* แสดงหลักสูตรที่เกี่ยวข้อง */}
                {relatedCourses.length > 0 && (
                  <div className="row">
                    <div className="col-12">
                      <div className="alert alert-light border">
                        <h6 className="mb-2">
                          <i className="fas fa-graduation-cap me-2 text-primary"></i>
                          หลักสูตรที่เกี่ยวข้อง
                        </h6>
                        {relatedCourses.map((course) => (
                          <div key={course.id} className="d-flex align-items-center">
                            <div className="badge bg-primary me-2">{course.id}</div>
                            <div>
                              <strong>{course.title}</strong>
                              <br />
                              <small className="text-muted">
                                คณะ {course.faculty} - สาขา {course.department_name}
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ส่วนข้อมูลเพิ่มเติม (แสดงเมื่อกด toggle) */}
            {showAllSections && (
              <>
                {/* 2. คำอธิบายรายวิชา */}
                <div className="card shadow-sm border-0 mb-4">
                  <div className="card-body">
                    <h5 className="card-title mb-3">
                      <i className="fas fa-align-left me-2 text-info"></i>
                      คำอธิบายรายวิชา
                    </h5>
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">
                        รายละเอียดรายวิชา
                      </label>
                      <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        rows={4}
                        value={subjectData.description}
                        onChange={handleInputChange}
                        placeholder="อธิบายเนื้อหา วัตถุประสงค์ และสิ่งที่ผู้เรียนจะได้รับจากรายวิชานี้"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. รูปภาพปก */}
                <div className="card shadow-sm border-0 mb-4">
                  <div className="card-body">
                    <h5 className="card-title mb-3">
                      <i className="fas fa-image me-2 text-success"></i>
                      รูปภาพปกรายวิชา
                    </h5>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="coverImage" className="form-label">
                            เลือกรูปภาพ
                          </label>
                          <input
                            type="file"
                            className={`form-control ${errors.coverImage ? "is-invalid" : ""}`}
                            id="coverImage"
                            name="coverImage"
                            accept="image/*"
                            onChange={handleImageChange}
                            ref={fileInputRef}
                          />
                          {errors.coverImage && (
                            <div className="invalid-feedback">{errors.coverImage}</div>
                          )}
                          <small className="text-muted">
                            รองรับไฟล์ JPG, PNG, GIF ขนาดไม่เกิน 5MB
                          </small>
                        </div>
                      </div>

                      <div className="col-md-6">
                        {imagePreview && (
                          <div className="text-center">
                            <p className="mb-2">ตัวอย่างรูปภาพ:</p>
                            <div className="position-relative d-inline-block">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="img-thumbnail"
                                style={{ maxWidth: "200px", maxHeight: "150px" }}
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm position-absolute top-0 end-0"
                                style={{ transform: "translate(50%, -50%)" }}
                                onClick={handleRemoveImage}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. การตั้งค่าเพิ่มเติม */}
                <div className="card shadow-sm border-0 mb-4">
                  <div className="card-body">
                    <h5 className="card-title mb-3">
                      <i className="fas fa-cogs me-2 text-warning"></i>
                      การตั้งค่าเพิ่มเติม
                    </h5>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="preTestId" className="form-label">
                            แบบทดสอบก่อนเรียน (Pre-test)
                          </label>
                          <select
                            className="form-select"
                            id="preTestId"
                            name="preTestId"
                            value={subjectData.preTestId || ""}
                            onChange={handleInputChange}
                          >
                            <option value="">ไม่มีแบบทดสอบก่อนเรียน</option>
                            {/* TODO: Load available tests */}
                          </select>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="postTestId" className="form-label">
                            แบบทดสอบหลังเรียน (Post-test)
                          </label>
                          <select
                            className="form-select"
                            id="postTestId"
                            name="postTestId"
                            value={subjectData.postTestId || ""}
                            onChange={handleInputChange}
                          >
                            <option value="">ไม่มีแบบทดสอบหลังเรียน</option>
                            {/* TODO: Load available tests */}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="alert alert-info">
                      <i className="fas fa-info-circle me-2"></i>
                      <strong>หมายเหตุ:</strong> คุณสามารถเพิ่มบทเรียน แบบทดสอบ และอาจารย์ผู้สอน
                      ได้ในภายหลังหลังจากสร้างรายวิชาแล้ว
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Submit Buttons */}
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">พร้อมสร้างรายวิชาแล้วใช่หรือไม่?</h6>
                    <p className="text-muted mb-0 small">
                      ตรวจสอบข้อมูลให้ถูกต้องก่อนกดสร้างรายวิชา
                    </p>
                  </div>
                  <div className="d-flex gap-2">
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
                      className="btn btn-success"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          กำลังสร้างรายวิชา...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check me-2"></i>สร้างรายวิชา
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* API Messages */}
          {apiError && (
            <div className="alert alert-danger mt-3">
              <i className="fas fa-exclamation-circle me-2"></i>
              {apiError}
            </div>
          )}

          {apiSuccess && (
            <div className="alert alert-success mt-3">
              <i className="fas fa-check-circle me-2"></i>
              {apiSuccess}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddSubjects;