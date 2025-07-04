import React, { useState, useEffect} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Wrapper from "../../../layouts/Wrapper";
import CourseContentSection from "./CourseContentSection";

// Interfaces
interface Department {
  department_id: string;
  department_name: string;
  faculty: string;
}

interface Subject {
  id: string;
  title: string;
  instructor: string;
  description: string;
  coverImage?: string;
  coverImageFileId?: string;
}

interface CourseData {
  title: string;
  department_id: string;
  description: string;
  coverImage: File | null;
  coverImagePreview: string;
  video_url: string;
  subjects: string[];
  prerequisites: { subjectId: string; prerequisiteId: string }[];
  study_result: string;
  attachments: File[];
}

interface Errors {
  title: string;
  department_id: string;
  description: string;
  coverImage: string;
  video_url: string;
  subjects: string;
  study_result: string;
}

interface AddCoursesProps {
  onSubmit?: (course: any) => void;
  onCancel?: () => void;
}

// CourseInfoSection Component (ส่วนข้อมูลหลัก)
const CourseInfoSection: React.FC<{
  courseData: {
    title: string;
    department_id: string;
    description: string;
    study_result: string;
  };
  errors: {
    title: string;
    department_id: string;
    description: string;
    study_result: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}> = ({ courseData, errors, handleInputChange }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [departmentError, setDepartmentError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoadingDepartments(true);
        setDepartmentError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          setDepartmentError("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
          return;
        }

        const response = await axios.get(`${apiURL}/api/auth/departments`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          const deptList = response.data.departments.map((d: Department) => ({
            department_id: d.department_id.toString(),
            department_name: d.department_name,
            faculty: d.faculty
          }));
          setDepartments(deptList);
          
          // หาและตั้งค่า department ที่เลือกจาก URL
          if (courseData.department_id) {
            const initialDept = deptList.find((d: Department) => d.department_id === courseData.department_id);
            setSelectedDepartment(initialDept || null);
          }
        } else {
          setDepartmentError(response.data.message || "ไม่สามารถดึงข้อมูลสาขาวิชาได้");
        }
      } catch (error: any) {
        console.error("Error fetching departments:", error);
        setDepartmentError(error.response?.data?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลสาขาวิชา");
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  // อัปเดต selectedDepartment เมื่อ courseData.department_id เปลี่ยน
  useEffect(() => {
    if (departments.length > 0 && courseData.department_id) {
      const dept = departments.find(d => d.department_id === courseData.department_id);
      setSelectedDepartment(dept || null);
    }
  }, [courseData.department_id, departments]);

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">
        <h5 className="card-title mb-3">
          <i className="fas fa-info-circle text-primary me-2"></i>
          ข้อมูลหลักสูตร (จำเป็น)
        </h5>

        {departmentError && (
          <div className="alert alert-danger mb-3">
            <i className="fas fa-exclamation-circle me-2"></i>
            {departmentError}
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            ชื่อหลักสูตร <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.title ? "is-invalid" : ""}`}
            id="title"
            name="title"
            value={courseData.title}
            onChange={handleInputChange}
            placeholder="กรอกชื่อหลักสูตร"
          />
          {errors.title && <div className="invalid-feedback">{errors.title}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="department_id" className="form-label">
            สาขาวิชา <span className="text-danger">*</span>
          </label>
          {isLoadingDepartments ? (
            <div className="text-center py-2">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="ms-2">กำลังโหลดข้อมูลสาขาวิชา...</span>
            </div>
          ) : (
            <select
              className={`form-control ${errors.department_id ? "is-invalid" : ""}`}
              id="department_id"
              name="department_id"
              value={courseData.department_id || ""}
              onChange={handleInputChange}
              disabled={isLoadingDepartments || !!departmentError}
            >
              <option value="">เลือกสาขาวิชา</option>
              {departments.map((dept) => (
                <option key={dept.department_id} value={dept.department_id}>
                  {dept.department_name}
                </option>
              ))}
            </select>
          )}
          {errors.department_id && <div className="invalid-feedback">{errors.department_id}</div>}
        </div>

        {selectedDepartment && (
          <div className="mb-3">
            <label className="form-label">คณะ</label>
            <div className="alert alert-info mb-0">
              <i className="fas fa-university me-2"></i>
              <strong>{selectedDepartment.faculty}</strong>
            </div>
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            คำอธิบายหลักสูตร <span className="text-danger">*</span>
          </label>
          <textarea
            className={`form-control ${errors.description ? "is-invalid" : ""}`}
            id="description"
            name="description"
            value={courseData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder="อธิบายเกี่ยวกับหลักสูตรนี้ เช่น วัตถุประสงค์ เนื้อหาที่สอน กลุ่มเป้าหมาย"
          ></textarea>
          {errors.description && <div className="invalid-feedback">{errors.description}</div>}
        </div>
      </div>
    </div>
  );
};

// ส่วนข้อมูลเพิ่มเติม
const AdditionalInfoSection: React.FC<{
  courseData: {
    study_result: string;
  };
  errors: {
    study_result: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isVisible: boolean;
}> = ({ courseData, handleInputChange, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">
        <h5 className="card-title mb-3">
          <i className="fas fa-plus-circle text-success me-2"></i>
          ข้อมูลเพิ่มเติม (ไม่บังคับ)
        </h5>
        
        <div className="mb-3">
          <label htmlFor="study_result" className="form-label">
            ผลลัพธ์การศึกษา
          </label>
          <textarea
            className="form-control"
            id="study_result"
            name="study_result"
            value={courseData.study_result}
            onChange={handleInputChange}
            rows={3}
            placeholder="ระบุผลลัพธ์การเรียนรู้ที่คาดหวัง เช่น ผู้เรียนสามารถ... สามารถทำ... เข้าใจ..."
          ></textarea>
          <div className="form-text">
            <i className="fas fa-lightbulb me-1"></i>
            ช่วยให้ผู้เรียนเข้าใจว่าจะได้อะไรจากหลักสูตรนี้
          </div>
        </div>
      </div>
    </div>
  );
};

// ส่วนสื่อและเอกสาร
const MediaSection: React.FC<{
  courseData: {
    coverImage: File | null;
    coverImagePreview: string;
    video_url: string;
    attachments: File[];
  };
  errors: {
    coverImage: string;
    video_url: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAttachmentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveAttachment: (index: number) => void;
  isVisible: boolean;
}> = ({
  courseData,
  errors,
  handleInputChange,
  handleImageChange,
  handleAttachmentChange,
  handleRemoveAttachment,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">
        <h5 className="card-title mb-3">
          <i className="fas fa-image text-info me-2"></i>
          สื่อและเอกสารประกอบ (ไม่บังคับ)
        </h5>
        
        <div className="mb-4">
          <label htmlFor="coverImage" className="form-label">
            <i className="fas fa-image me-2"></i>รูปปกหลักสูตร
          </label>
          <input
            type="file"
            className={`form-control ${errors.coverImage ? "is-invalid" : ""}`}
            id="coverImage"
            name="coverImage"
            accept="image/*"
            onChange={handleImageChange}
          />
          {errors.coverImage && <div className="invalid-feedback">{errors.coverImage}</div>}
          <div className="form-text">รองรับไฟล์ JPG, PNG, GIF ขนาดไม่เกิน 5MB</div>

          {courseData.coverImagePreview && (
            <div className="mt-3">
              <img
                src={courseData.coverImagePreview}
                alt="Cover Preview"
                className="img-fluid rounded shadow-sm"
                style={{ maxHeight: "200px", objectFit: "cover" }}
              />
            </div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="video_url" className="form-label">
            <i className="fas fa-video me-2"></i>วิดีโอแนะนำหลักสูตร (URL)
          </label>
          <input
            type="url"
            className={`form-control ${errors.video_url ? "is-invalid" : ""}`}
            id="video_url"
            name="video_url"
            value={courseData.video_url}
            onChange={handleInputChange}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          {errors.video_url && <div className="invalid-feedback">{errors.video_url}</div>}
          <div className="form-text">รองรับ YouTube, Vimeo และลิงก์วิดีโออื่นๆ</div>
        </div>

        <div className="mb-3">
          <label htmlFor="attachments" className="form-label">
            <i className="fas fa-paperclip me-2"></i>เอกสารประกอบ
          </label>
          <input
            type="file"
            className="form-control"
            id="attachments"
            name="attachments"
            multiple
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
            onChange={handleAttachmentChange}
          />
          <div className="form-text">รองรับไฟล์ PDF, Word, PowerPoint, Excel ขนาดไม่เกิน 10MB ต่อไฟล์</div>

          {courseData.attachments.length > 0 && (
            <div className="mt-3">
              <h6>ไฟล์ที่เลือก:</h6>
              <div className="list-group">
                {courseData.attachments.map((file, index) => (
                  <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <i className="fas fa-file me-2"></i>
                      {file.name}
                      <small className="text-muted ms-2">({(file.size / 1024 / 1024).toFixed(2)} MB)</small>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleRemoveAttachment(index)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ส่วนจัดการเนื้อหา
const ContentManagementSection: React.FC<{
  courseData: {
    subjects: string[];
    prerequisites: { subjectId: string; prerequisiteId: string }[];
  };
  availableSubjects: Subject[];
  errors: { subjects: string };
  selectedSubjectsDetails: Subject[];
  handleReorderSubject: (subjectId: string, newIndex: number) => void;
  handleRemoveSubject: (subjectId: string) => void;
  getPrerequisitesForSubject: (subjectId: string) => string[];
  handleRemovePrerequisite: (subjectId: string, prerequisiteId: string) => void;
  setShowSubjectModal: (value: boolean) => void;
  setShowPrerequisiteModal: (value: boolean) => void;
  setSelectedSubjectForPrereq: (value: string | null) => void;
  isLoading: boolean;
  isVisible: boolean;
}> = ({
  courseData,
  availableSubjects,
  errors,
  selectedSubjectsDetails,
  handleReorderSubject,
  handleRemoveSubject,
  getPrerequisitesForSubject,
  handleRemovePrerequisite,
  setShowSubjectModal,
  setShowPrerequisiteModal,
  setSelectedSubjectForPrereq,
  isLoading,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">
        <h5 className="card-title mb-3">
          <i className="fas fa-book text-warning me-2"></i>
          จัดการเนื้อหาหลักสูตร (ไม่บังคับ)
        </h5>
        
        <div className="alert alert-info mb-3">
          <i className="fas fa-info-circle me-2"></i>
          คุณสามารถเพิ่มรายวิชาในหลักสูตรได้ในภายหลัง หรือเพิ่มตอนนี้เลยก็ได้
        </div>
        
        <CourseContentSection
          isLoading={isLoading}
          courseData={courseData}
          availableSubjects={availableSubjects}
          errors={errors}
          selectedSubjectsDetails={selectedSubjectsDetails}
          handleReorderSubject={handleReorderSubject}
          handleRemoveSubject={handleRemoveSubject}
          getPrerequisitesForSubject={getPrerequisitesForSubject}
          handleRemovePrerequisite={handleRemovePrerequisite}
          setShowSubjectModal={setShowSubjectModal}
          setShowPrerequisiteModal={setShowPrerequisiteModal}
          setSelectedSubjectForPrereq={setSelectedSubjectForPrereq}
        />
      </div>
    </div>
  );
};

// Main AddCourses Component
const AddCourses: React.FC<AddCoursesProps> = ({ onSubmit, onCancel }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const apiURL = import.meta.env.VITE_API_URL;

  // อ่าน department_id จาก URL
  const departmentIdFromUrl = searchParams.get('department_id');

  // State สำหรับแสดง/ซ่อนส่วนต่างๆ
  const [showAllSections, setShowAllSections] = useState(false);

  // State management
  const [courseData, setCourseData] = useState<CourseData>({
    title: "",
    department_id: departmentIdFromUrl || "",
    description: "",
    coverImage: null,
    coverImagePreview: "",
    video_url: "",
    subjects: [],
    prerequisites: [],
    study_result: "",
    attachments: [],
  });

  const [errors, setErrors] = useState<Errors>({
    title: "",
    department_id: "",
    description: "",
    coverImage: "",
    video_url: "",
    subjects: "",
    study_result: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subject management states
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [selectedSubjectsDetails, setSelectedSubjectsDetails] = useState<Subject[]>([]);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showPrerequisiteModal, setShowPrerequisiteModal] = useState(false);
  const [selectedSubjectForPrereq, setSelectedSubjectForPrereq] = useState<string | null>(null);

  // เพิ่ม useEffect สำหรับตั้งค่า department_id เมื่อ component โหลด
  useEffect(() => {
    if (departmentIdFromUrl && departmentIdFromUrl !== courseData.department_id) {
      setCourseData(prev => ({
        ...prev,
        department_id: departmentIdFromUrl
      }));
    }
  }, [departmentIdFromUrl]);

  // Load available subjects on component mount
  useEffect(() => {
    fetchAvailableSubjects();
  }, []);

  // Update selected subjects details when subjects change
  useEffect(() => {
    const details = courseData.subjects
      .map((subjectId) => availableSubjects.find((s) => s.id === subjectId))
      .filter((subject): subject is Subject => subject !== undefined);
    setSelectedSubjectsDetails(details);
  }, [courseData.subjects, availableSubjects]);

  // API Functions
  const fetchAvailableSubjects = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
        return;
      }

      const response = await axios.get(`${apiURL}/api/courses/subject/availables`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const subjects = response.data.subjects.map((subject: any) => ({
          id: subject.subject_id.toString(),
          title: subject.subject_name,
          instructor: subject.instructors?.map((i: any) => i.name).join(", ") || "ไม่ระบุ",
          description: subject.description || "ไม่มีคำอธิบาย",
          coverImage: subject.cover_image,
          coverImageFileId: subject.cover_image_file_id,
        }));
        setAvailableSubjects(subjects);
      }
    } catch (error: any) {
      console.error("Error fetching subjects:", error);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลรายวิชา");
    } finally {
      setIsLoading(false);
    }
  };

  // Event Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof Errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, coverImage: "ขนาดไฟล์ต้องไม่เกิน 5MB" }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setCourseData((prev) => ({
          ...prev,
          coverImage: file,
          coverImagePreview: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
      setErrors((prev) => ({ ...prev, coverImage: "" }));
    }
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`ไฟล์ ${file.name} มีขนาดเกิน 10MB`);
        return false;
      }
      return true;
    });

    setCourseData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles],
    }));
  };

  const handleRemoveAttachment = (index: number) => {
    setCourseData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  // Subject Management Functions
  const handleAddSubject = (subjectId: string) => {
    if (!courseData.subjects.includes(subjectId)) {
      setCourseData((prev) => ({
        ...prev,
        subjects: [...prev.subjects, subjectId],
      }));
    }
    setShowSubjectModal(false);
  };

  const handleRemoveSubject = (subjectId: string) => {
    setCourseData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((id) => id !== subjectId),
      prerequisites: prev.prerequisites.filter(
        (prereq) => prereq.subjectId !== subjectId && prereq.prerequisiteId !== subjectId
      ),
    }));
  };

  const handleReorderSubject = (subjectId: string, newIndex: number) => {
    const currentIndex = courseData.subjects.indexOf(subjectId);
    if (currentIndex === -1 || newIndex < 0 || newIndex >= courseData.subjects.length) return;

    const newSubjects = [...courseData.subjects];
    const [removed] = newSubjects.splice(currentIndex, 1);
    newSubjects.splice(newIndex, 0, removed);

    setCourseData((prev) => ({ ...prev, subjects: newSubjects }));
  };

  const handleAddPrerequisite = (subjectId: string, prerequisiteId: string) => {
    const newPrereq = { subjectId, prerequisiteId };
    const exists = courseData.prerequisites.some(
      (prereq) => prereq.subjectId === subjectId && prereq.prerequisiteId === prerequisiteId
    );

    if (!exists) {
      setCourseData((prev) => ({
        ...prev,
        prerequisites: [...prev.prerequisites, newPrereq],
      }));
    }
    setShowPrerequisiteModal(false);
    setSelectedSubjectForPrereq(null);
  };

  const handleRemovePrerequisite = (subjectId: string, prerequisiteId: string) => {
    setCourseData((prev) => ({
      ...prev,
      prerequisites: prev.prerequisites.filter(
        (prereq) => !(prereq.subjectId === subjectId && prereq.prerequisiteId === prerequisiteId)
      ),
    }));
  };

  const getPrerequisitesForSubject = (subjectId: string): string[] => {
    return courseData.prerequisites
      .filter((prereq) => prereq.subjectId === subjectId)
      .map((prereq) => prereq.prerequisiteId);
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Errors = {
      title: "",
      department_id: "",
      description: "",
      coverImage: "",
      video_url: "",
      subjects: "",
      study_result: "",
    };

    if (!courseData.title.trim()) {
      newErrors.title = "กรุณากรอกชื่อหลักสูตร";
    }

    if (!courseData.department_id) {
      newErrors.department_id = "กรุณาเลือกสาขาวิชา";
    }

    if (!courseData.description.trim()) {
      newErrors.description = "กรุณากรอกคำอธิบายหลักสูตร";
    }

    if (courseData.video_url && !isValidUrl(courseData.video_url)) {
      newErrors.video_url = "กรุณากรอก URL ที่ถูกต้อง";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("กรุณาตรวจสอบข้อมูลให้ครบถ้วน");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
        return;
      }

      const formData = new FormData();
      formData.append("title", courseData.title);
      formData.append("department_id", courseData.department_id);
      formData.append("description", courseData.description);
      formData.append("study_result", courseData.study_result);
      formData.append("video_url", courseData.video_url);
      formData.append("subjects", JSON.stringify(courseData.subjects));
      formData.append("prerequisites", JSON.stringify(courseData.prerequisites));

      if (courseData.coverImage) {
        formData.append("coverImage", courseData.coverImage);
      }

      courseData.attachments.forEach((file) => {
        formData.append(`attachments`, file);
      });

      const response = await axios.post(`${apiURL}/api/courses`, formData, {
        headers: {
                   "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // แสดง SweetAlert2 popup สำเร็จ
        await Swal.fire({
          icon: 'success',
          title: 'สร้างหลักสูตรสำเร็จ!',
          html: `
            <div class="text-start">
              <p><strong>ชื่อหลักสูตร:</strong> ${courseData.title}</p>
              <p><strong>รหัสหลักสูตร:</strong> ${response.data.courseCode}</p>
              <p><strong>จำนวนรายวิชา:</strong> ${courseData.subjects.length} รายวิชา</p>
            </div>
          `,
          confirmButtonText: 'ดูรายละเอียดหลักสูตร',
          confirmButtonColor: '#28a745',
          showCancelButton: true,
          cancelButtonText: 'กลับไปหน้าหลัก',
          cancelButtonColor: '#6c757d',
          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        // Redirect ไปหน้ารายละเอียดหลักสูตร
        if (onSubmit) {
          onSubmit(response.data.course);
        } else {
          // สร้าง URL สำหรับไปหน้ารายละเอียดหลักสูตร
          // ต้องไปที่หน้า admin-creditbank และเลือกหลักสูตรที่สร้าง
          navigate(`/admin-creditbank?course_id=${response.data.courseId}`);
        }
      } else {
        toast.error(response.data.message || "เกิดข้อผิดพลาดในการสร้างหลักสูตร");
      }
    } catch (error: any) {
      console.error("Error creating course:", error);
      
      // แสดง SweetAlert2 popup ข้อผิดพลาด
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: error.response?.data?.message || "เกิดข้อผิดพลาดในการสร้างหลักสูตร",
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
      navigate("/admin-creditbank");
    }
  };

  return (
    <Wrapper>
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            {/* Header */}
          
            {/* Toggle Button สำหรับแสดง/ซ่อนส่วนเพิ่มเติม */}
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
              {/* 1. ข้อมูลหลักสูตร (จำเป็น) - แสดงตลอดเวลา */}
              <CourseInfoSection
                courseData={courseData}
                errors={errors}
                handleInputChange={handleInputChange}
              />

              {/* 2. ข้อมูลเพิ่มเติม - แสดงเมื่อ showAllSections = true */}
              <AdditionalInfoSection
                courseData={courseData}
                errors={errors}
                handleInputChange={handleInputChange}
                isVisible={showAllSections}
              />

              {/* 3. สื่อและเอกสาร - แสดงเมื่อ showAllSections = true */}
              <MediaSection
                courseData={courseData}
                errors={errors}
                handleInputChange={handleInputChange}
                handleImageChange={handleImageChange}
                handleAttachmentChange={handleAttachmentChange}
                handleRemoveAttachment={handleRemoveAttachment}
                isVisible={showAllSections}
              />

              {/* 4. จัดการเนื้อหา - แสดงเมื่อ showAllSections = true */}
              <ContentManagementSection
                courseData={courseData}
                availableSubjects={availableSubjects}
                errors={errors}
                selectedSubjectsDetails={selectedSubjectsDetails}
                handleReorderSubject={handleReorderSubject}
                handleRemoveSubject={handleRemoveSubject}
                getPrerequisitesForSubject={getPrerequisitesForSubject}
                handleRemovePrerequisite={handleRemovePrerequisite}
                setShowSubjectModal={setShowSubjectModal}
                setShowPrerequisiteModal={setShowPrerequisiteModal}
                setSelectedSubjectForPrereq={setSelectedSubjectForPrereq}
                isLoading={isLoading}
                isVisible={showAllSections}
              />

              {/* Submit Buttons */}
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-muted">
                      <i className="fas fa-info-circle me-2"></i>
                      {showAllSections 
                        ? 'คุณสามารถแก้ไขข้อมูลหลักสูตรได้ในภายหลัง'
                        : 'คุณสามารถเพิ่มรายละเอียดและรายวิชาได้หลังจากสร้างหลักสูตรแล้ว'
                      }
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
                            กำลังสร้าง...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-plus-circle me-2"></i>สร้างหลักสูตร
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Subject Selection Modal */}
      {showSubjectModal && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">เลือกรายวิชา</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSubjectModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {availableSubjects
                    .filter((subject) => !courseData.subjects.includes(subject.id))
                    .map((subject) => (
                      <div key={subject.id} className="col-md-6 mb-3">
                        <div className="card h-100">
                          <div className="card-body">
                            <h6 className="card-title">{subject.title}</h6>
                            <p className="card-text small text-muted">
                              ผู้สอน: {subject.instructor}
                            </p>
                            <p className="card-text small">{subject.description}</p>
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={() => handleAddSubject(subject.id)}
                            >
                              <i className="fas fa-plus me-1"></i>เลือก
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                {availableSubjects.filter((subject) => !courseData.subjects.includes(subject.id)).length === 0 && (
                  <div className="text-center py-4">
                    <i className="fas fa-info-circle fa-2x text-muted mb-2"></i>
                    <p className="text-muted">ไม่มีรายวิชาที่สามารถเลือกได้</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSubjectModal(false)}
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prerequisite Selection Modal */}
      {showPrerequisiteModal && selectedSubjectForPrereq && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  เลือกวิชาก่อนหน้าสำหรับ{" "}
                  {availableSubjects.find((s) => s.id === selectedSubjectForPrereq)?.title}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowPrerequisiteModal(false);
                    setSelectedSubjectForPrereq(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {courseData.subjects
                    .filter((subjectId) => subjectId !== selectedSubjectForPrereq)
                    .filter((subjectId) => {
                      const existingPrereqs = getPrerequisitesForSubject(selectedSubjectForPrereq);
                      return !existingPrereqs.includes(subjectId);
                    })
                    .map((subjectId) => {
                      const subject = availableSubjects.find((s) => s.id === subjectId);
                      if (!subject) return null;
                      return (
                        <div key={subject.id} className="col-md-6 mb-3">
                          <div className="card h-100">
                            <div className="card-body">
                              <h6 className="card-title">{subject.title}</h6>
                              <p className="card-text small text-muted">
                                ผู้สอน: {subject.instructor}
                              </p>
                              <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                                                onClick={() => handleAddPrerequisite(selectedSubjectForPrereq, subject.id)}
                              >
                                <i className="fas fa-plus me-1"></i>เลือก
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
                {courseData.subjects
                  .filter((subjectId) => subjectId !== selectedSubjectForPrereq)
                  .filter((subjectId) => {
                    const existingPrereqs = getPrerequisitesForSubject(selectedSubjectForPrereq);
                    return !existingPrereqs.includes(subjectId);
                  }).length === 0 && (
                  <div className="text-center py-4">
                    <i className="fas fa-info-circle fa-2x text-muted mb-2"></i>
                    <p className="text-muted">ไม่มีรายวิชาที่สามารถเลือกเป็นวิชาก่อนหน้าได้</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowPrerequisiteModal(false);
                    setSelectedSubjectForPrereq(null);
                  }}
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {(showSubjectModal || showPrerequisiteModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </Wrapper>
  );
};

export default AddCourses;


