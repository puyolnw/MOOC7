import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CourseInfoSection from "./CourseInfoSection";
import CourseContentSection from "./CourseContentSection";
import CourseSettingsSection from "./CourseSettingsSection";
import ModalSubjectSelection from "./ModalSubjectSelection";
import ModalPrerequisiteSelection from "./ModalPrerequisiteSelection";

interface Subject {
  id: string;
  title: string;
  instructor: string;
  description: string;
  coverImage?: string;
  coverImageFileId?: string;
}

interface Prerequisite {
  subjectId: string;
  prerequisiteId: string;
}

interface Department {
  department_id: string;
  department_name: string;
}

interface CourseData {
  courseId: string;
  title: string;
  category: string;
  department_id: string;
  description: string;
  coverImage: File | null;
  coverImagePreview: string;
  video_url: string;
  status: "active" | "inactive" | "draft";
  subjects: string[];
  prerequisites: Prerequisite[];
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
    department_id: "",
    description: "",
    coverImage: null,
    coverImagePreview: "",
    video_url: "",
    status: "active",
    subjects: [],
    prerequisites: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showPrerequisiteModal, setShowPrerequisiteModal] = useState(false);
  const [selectedSubjectForPrereq, setSelectedSubjectForPrereq] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [errors, setErrors] = useState({
    title: "",
    category: "",
    department_id: "",
    description: "",
    subjects: "",
    video_url: "",
  });

  // Fetch course, departments, and available subjects
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
  
        const token = localStorage.getItem("token");
        if (!token) {
          setApiError("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
          toast.error("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
          return;
        }
  
        // Fetch departments
        const departmentsRes = await axios.get(`${apiUrl}/api/courses/subjects/departments/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (departmentsRes.data.success) {
          setDepartments(departmentsRes.data.departments);
          console.log("Departments fetched:", departmentsRes.data.departments);
        }
  
        // Fetch course data
        const courseRes = await axios.get(`${apiUrl}/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (!courseRes.data.success) {
          throw new Error(courseRes.data.message || "ไม่พบข้อมูลคอร์ส");
        }
  
        const course = courseRes.data.course;
        console.log("Raw course data from API:", course); // Debug
        const newCourseData = {
          courseId: String(course.course_id) || "",
          title: course.title || "",
          category: course.category || "",
          department_id: course.department_id ? String(course.department_id) : "", // แปลงเป็น string
          description: course.description || "",
          coverImage: null,
          coverImagePreview: course.cover_image_file_id
            ? `${apiUrl}/api/courses/image/${course.cover_image_file_id}`
            : "",
          video_url: course.video_url || "",
          status: course.status || "active",
          subjects: course.subjects?.map((s: any) => s.subject_id.toString()) || [],
          prerequisites:
            course.prerequisites?.map((p: any) => ({
              subjectId: p.subject_id.toString(),
              prerequisiteId: p.prerequisite_id.toString(),
            })) || [],
        };
  
        setCourseData(newCourseData);
        console.log("Course data fetched:", newCourseData);
  
        // Fetch available subjects
        const subjectsRes = await axios.get(`${apiUrl}/api/courses/subjects/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (subjectsRes.data.success) {
          const formattedSubjects = subjectsRes.data.subjects.map((subject: any) => ({
            id: subject.subject_id.toString(),
            title: subject.subject_name,
            instructor: subject.instructor_count > 0 ? `${subject.instructor_count} อาจารย์` : "ไม่มีอาจารย์",
            description: subject.description || "ไม่มีคำอธิบาย",
            coverImage: subject.cover_image_file_id
              ? `${apiUrl}/api/courses/subjects/image/${subject.cover_image_file_id}`
              : "/assets/img/courses/course_thumb01.jpg",
            coverImageFileId: subject.cover_image_file_id,
          }));
          setAvailableSubjects(formattedSubjects);
          console.log("Available subjects fetched:", formattedSubjects);
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        const errorMessage = error.response?.data?.message || "ไม่สามารถโหลดข้อมูลได้";
        setApiError(errorMessage);
        toast.error(errorMessage);
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
    setCourseData((prev) => {
      const newState = {
        ...prev,
        [name]: value,
      };
      console.log(`Input Change - ${name}: ${value}`, newState);
      return newState;
    });

    if (name in errors) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (name === "video_url" && value) {
      validateYoutubeUrl(value);
    }
  };

  // Validate YouTube URL
  const validateYoutubeUrl = (url: string) => {
    if (url === "") {
      setErrors((prev) => ({
        ...prev,
        video_url: "",
      }));
      return;
    }

    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?!.*&list=.*)(?!.*&index=.*)/;
    if (!youtubeRegex.test(url)) {
      setErrors((prev) => ({
        ...prev,
        video_url: "URL วิดีโอไม่ถูกต้อง ต้องเป็น URL ของ YouTube ที่มีรูปแบบถูกต้อง",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        video_url: "",
      }));
    }
  };

  // Handle cover image upload
  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    if (file.size > 5 * 1024 * 1024) {
      toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return;
    }

    const fileType = file.type;
    if (!fileType.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
      toast.error("รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF, WEBP)");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setCourseData((prev) => ({
      ...prev,
      coverImage: file,
      coverImagePreview: previewUrl,
    }));
    console.log("Cover image uploaded:", file.name);
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
    console.log("Cover image removed");
  };

  // Filter subjects based on search term
  const filteredSubjects = availableSubjects.filter(
    (subject) =>
      subject.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add subject to course
  const handleAddSubject = (subjectId: string) => {
    if (courseData.subjects.includes(subjectId)) {
      toast.warning("รายวิชานี้ถูกเพิ่มในหลักสูตรแล้ว");
      return;
    }

    setCourseData((prev) => ({
      ...prev,
      subjects: [...prev.subjects, subjectId],
    }));

    if (errors.subjects) {
      setErrors((prev) => ({
        ...prev,
        subjects: "",
      }));
    }
    console.log(`Added subject: ${subjectId}`);
  };

  // Remove subject from course
  const handleRemoveSubject = (subjectId: string) => {
    setCourseData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((id) => id !== subjectId),
      prerequisites: prev.prerequisites.filter(
        (p) => p.subjectId !== subjectId && p.prerequisiteId !== subjectId
      ),
    }));
    console.log(`Removed subject: ${subjectId}`);
  };

  // Reorder subjects
  const handleReorderSubject = (subjectId: string, newIndex: number) => {
    const currentIndex = courseData.subjects.findIndex((id) => id === subjectId);
    if (newIndex < 0 || newIndex >= courseData.subjects.length) {
      return;
    }

    const newSubjects = [...courseData.subjects];
    newSubjects.splice(currentIndex, 1);
    newSubjects.splice(newIndex, 0, subjectId);

    setCourseData((prev) => ({
      ...prev,
      subjects: newSubjects,
    }));
    console.log(`Reordered subject ${subjectId} to position ${newIndex + 1}`);
  };

  // Add prerequisite
  const handleAddPrerequisite = (prerequisiteId: string) => {
    if (!selectedSubjectForPrereq) return;

    const exists = courseData.prerequisites.some(
      (p) => p.subjectId === selectedSubjectForPrereq && p.prerequisiteId === prerequisiteId
    );

    if (exists) {
      toast.warning("ความสัมพันธ์นี้มีอยู่แล้ว");
      return;
    }

    if (selectedSubjectForPrereq === prerequisiteId) {
      toast.error("รายวิชาไม่สามารถเป็นวิชาก่อนหน้าของตัวเองได้");
      return;
    }

    setCourseData((prev) => ({
      ...prev,
      prerequisites: [
        ...prev.prerequisites,
        {
          subjectId: selectedSubjectForPrereq,
          prerequisiteId: prerequisiteId,
        },
      ],
    }));
    console.log(`Added prerequisite: ${prerequisiteId} for subject ${selectedSubjectForPrereq}`);
  };

  // Remove prerequisite
  const handleRemovePrerequisite = (subjectId: string, prerequisiteId: string) => {
    setCourseData((prev) => ({
      ...prev,
      prerequisites: prev.prerequisites.filter(
        (p) => !(p.subjectId === subjectId && p.prerequisiteId === prerequisiteId)
      ),
    }));
    console.log(`Removed prerequisite: ${prerequisiteId} for subject ${subjectId}`);
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: "",
      category: "",
      department_id: "",
      description: "",
      subjects: "",
      video_url: "",
    };
    const errorMessages: string[] = [];
  
    if (!courseData.title.trim()) {
      newErrors.title = "กรุณาระบุชื่อหลักสูตร (ห้ามเป็นช่องว่าง)";
      errorMessages.push("ชื่อหลักสูตร: กรุณาระบุ (ห้ามเป็นช่องว่าง)");
      isValid = false;
    }
  
    if (!courseData.category.trim()) {
      newErrors.category = "กรุณาเลือกหมวดหมู่";
      errorMessages.push("หมวดหมู่: กรุณาเลือก");
      isValid = false;
    }
  
    // ตรวจสอบ department_id
    const departmentIdStr = courseData.department_id ? String(courseData.department_id) : "";
    if (!departmentIdStr.trim()) {
      newErrors.department_id = "กรุณาเลือกสาขาวิชา";
      errorMessages.push("สาขาวิชา: กรุณาเลือก");
      isValid = false;
    }
  
    if (!courseData.description.trim()) {
      newErrors.description = "กรุณาระบุคำอธิบายหลักสูตร (ห้ามเป็นช่องว่าง)";
      errorMessages.push("คำอธิบายหลักสูตร: กรุณาระบุ (ห้ามเป็นช่องว่าง)");
      isValid = false;
    }
  
    if (courseData.subjects.length === 0) {
      newErrors.subjects = "กรุณาเพิ่มอย่างน้อย 1 รายวิชาในหลักสูตร";
      errorMessages.push("รายวิชา: กรุณาเพิ่มอย่างน้อย 1 รายวิชา");
      isValid = false;
    }
  
    if (courseData.video_url) {
      const youtubeRegex =
        /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?!.*&list=.*)(?!.*&index=.*)/;
      if (!youtubeRegex.test(courseData.video_url)) {
        newErrors.video_url = "URL วิดีโอไม่ถูกต้อง ต้องเป็น URL ของ YouTube ที่มีรูปแบบถูกต้อง";
        errorMessages.push("URL วิดีโอ: ไม่ถูกต้อง");
        isValid = false;
      }
    }
  
    setErrors(newErrors);
    return { isValid, errorMessages };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { isValid, errorMessages } = validateForm();
    if (!isValid) {
      const errorMessage = errorMessages.join(", ");
      toast.error(`กรุณากรอกข้อมูลให้ครบถ้วน: ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
      });
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
        return;
      }

      const formData = new FormData();
      formData.append("title", courseData.title);
      formData.append("category", courseData.category);
      formData.append("department_id", courseData.department_id);
      formData.append("description", courseData.description);
      formData.append("status", courseData.status);
      if (courseData.coverImage) {
        formData.append("coverImage", courseData.coverImage);
      }
      if (courseData.video_url) {
        formData.append("video_url", courseData.video_url);
      }

      const subjectsData = courseData.subjects.map((subjectId, index) => ({
        id: subjectId,
        order: index + 1,
      }));
      formData.append("subjects", JSON.stringify(subjectsData));

      if (courseData.prerequisites.length > 0) {
        formData.append("prerequisites", JSON.stringify(courseData.prerequisites));
      }

      const response = await axios.put(`${apiUrl}/api/courses/${courseId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setApiSuccess(response.data.message || "แก้ไขหลักสูตรสำเร็จ");
        toast.success(response.data.message || "แก้ไขหลักสูตรสำเร็จ");
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

  // Handle cancel
  const handleCancel = () => {
    navigate("/admin-creditbank");
  };

  // Get selected subjects details
  const selectedSubjectsDetails = courseData.subjects
    .map((id) => availableSubjects.find((subject) => subject.id === id))
    .filter((subject): subject is Subject => subject !== undefined);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (courseData.coverImagePreview && courseData.coverImage) {
        URL.revokeObjectURL(courseData.coverImagePreview);
      }
    };
  }, [courseData.coverImagePreview]);

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

      <CourseInfoSection
        courseData={{
          courseId: courseData.courseId,
          title: courseData.title,
          category: courseData.category,
          department_id: courseData.department_id,
          description: courseData.description,
        }}
        departments={departments}
        errors={errors}
        handleInputChange={handleInputChange}
      />

      <CourseContentSection
        courseData={courseData}
        errors={errors}
        availableSubjects={availableSubjects}
        selectedSubjectsDetails={selectedSubjectsDetails}
        setShowSubjectModal={setShowSubjectModal}
        setSelectedSubjectForPrereq={setSelectedSubjectForPrereq}
        setShowPrerequisiteModal={setShowPrerequisiteModal}
        handleRemoveSubject={handleRemoveSubject}
        handleReorderSubject={handleReorderSubject}
        getPrerequisitesForSubject={(subjectId: string) =>
          courseData.prerequisites
            .filter((p) => p.subjectId === subjectId)
            .map((p) => p.prerequisiteId)
        }
        handleRemovePrerequisite={handleRemovePrerequisite}
      />

      <CourseSettingsSection
        courseData={{
          coverImage: courseData.coverImage,
          coverImagePreview: courseData.coverImagePreview,
          video_url: courseData.video_url,
          status: courseData.status,
        }}
        errors={errors}
        handleInputChange={handleInputChange}
        handleCoverImageUpload={handleCoverImageUpload}
        handleRemoveCoverImage={handleRemoveCoverImage}
        fileInputRef={fileInputRef}
      />

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          <i className="fas fa-times me-2"></i>ยกเลิก
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
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

      <ModalSubjectSelection
        showSubjectModal={showSubjectModal}
        setShowSubjectModal={setShowSubjectModal}
        isLoading={isLoading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredSubjects={filteredSubjects}
        courseData={courseData}
        handleAddSubject={handleAddSubject}
      />

      <ModalPrerequisiteSelection
        showPrerequisiteModal={showPrerequisiteModal}
        setShowPrerequisiteModal={setShowPrerequisiteModal}
        selectedSubjectForPrereq={selectedSubjectForPrereq}
        courseData={courseData}
        availableSubjects={availableSubjects}
        selectedSubjectsDetails={selectedSubjectsDetails}
        handleAddPrerequisite={handleAddPrerequisite}
        handleRemovePrerequisite={handleRemovePrerequisite}
      />
    </form>
  );
};

export default EditCourse;