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

interface CourseData {
  title: string;
  department_id: string;
  description: string;
  study_result: string;
  coverImage: File | null;
  coverImagePreview: string;
  video_url: string;
  subjects: string[];
  prerequisites: Prerequisite[];
  attachments: File[];
}

interface Attachment {
  attachment_id: string;
  file_name: string;
  url: string;
}

const EditCourse: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [courseData, setCourseData] = useState<CourseData>({
    title: "",
    department_id: "",
    description: "",
    study_result: "",
    coverImage: null,
    coverImagePreview: "",
    video_url: "",
    subjects: [],
    prerequisites: [],
    attachments: [],
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
  const [errors, setErrors] = useState({
    title: "",
    department_id: "",
    description: "",
    study_result: "",
    subjects: "",
    videoUrl: "",
  });
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);

  // Fetch course and available subjects
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
        // Fetch course data
        const courseRes = await axios.get(`${apiUrl}/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!courseRes.data.success) {
          throw new Error(courseRes.data.message || "ไม่พบข้อมูลคอร์ส");
        }
        const course = courseRes.data.course;
        setCourseData({
          title: course.title || "",
          department_id: course.department_id ? String(course.department_id) : "",
          description: course.description || "",
          study_result: course.study_result || "",
          coverImage: null,
          coverImagePreview: course.cover_image_file_id
            ? `${apiUrl}/api/courses/image/${course.cover_image_file_id}`
            : "",
          video_url: course.video_url || "",
          subjects: course.subjects?.map((s: any) => s.subject_id.toString()) || [],
          prerequisites:
            course.prerequisites?.map((p: any) => ({
              subjectId: p.subject_id.toString(),
              prerequisiteId: p.prerequisite_id.toString(),
            })) || [],
          attachments: [], // ไม่โหลดไฟล์เดิมมา (แนบใหม่เท่านั้น)
        });
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
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "ไม่สามารถโหลดข้อมูลได้";
        setApiError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [courseId, apiUrl, navigate]);

  useEffect(() => {
    const fetchAttachments = async () => {
      const token = localStorage.getItem("token");
      if (!token || !courseId) return;
      try {
        const res = await axios.get(`${apiUrl}/api/courses/${courseId}/attachments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Attachments API response:', res.data); // Debug log
        if (res.data.success && Array.isArray(res.data.attachments)) {
          // Ensure each attachment has the required fields
          const formattedAttachments = res.data.attachments.map((att: any) => ({
            attachment_id: att.attachment_id || att.id || att.file_id, // Prioritize attachment_id
            file_name: att.file_name || att.name || att.filename,
            url: att.url || att.download_url || `${apiUrl}/api/courses/${courseId}/attachment/${att.attachment_id || att.id || att.file_id}`
          }));
          console.log('Formatted attachments:', formattedAttachments); // Debug log
          setExistingAttachments(formattedAttachments);
        }
      } catch (error) {
        console.error('Error fetching attachments:', error);
      }
    };
    fetchAttachments();
  }, [courseId, apiUrl]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (name === "video_url" && value) {
      validateYoutubeUrl(value);
    }
  };

  // Validate YouTube URL
  const validateYoutubeUrl = (url: string) => {
    if (url === "") {
      setErrors((prev) => ({ ...prev, videoUrl: "" }));
      return;
    }
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?!.*&list=.*)(?!.*&index=.*)/;
    if (!youtubeRegex.test(url)) {
      setErrors((prev) => ({ ...prev, videoUrl: "URL วิดีโอไม่ถูกต้อง ต้องเป็น URL ของ YouTube ที่มีรูปแบบถูกต้อง" }));
    } else {
      setErrors((prev) => ({ ...prev, videoUrl: "" }));
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

  // Handle file attachment upload
  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    const maxSize = 10 * 1024 * 1024;
    const validFiles = newFiles.filter(file => {
      if (file.size > maxSize) {
        toast.error(`ไฟล์ ${file.name} มีขนาดเกิน 10MB`);
        return false;
      }
      return true;
    });
    setCourseData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));
  };
  const handleRemoveAttachment = (index: number) => {
    setCourseData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Filter subjects based on search term
  const filteredSubjects = availableSubjects.filter(
    (subject) =>
      subject.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected subjects details
  const selectedSubjectsDetails = courseData.subjects
    .map((id) => availableSubjects.find((subject) => subject.id === id))
    .filter((subject): subject is Subject => subject !== undefined);

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
      setErrors((prev) => ({ ...prev, subjects: "" }));
    }
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
  };

  // Reorder subjects
  const handleReorderSubject = (subjectId: string, newIndex: number) => {
    const currentIndex = courseData.subjects.findIndex((id) => id === subjectId);
    if (newIndex < 0 || newIndex >= courseData.subjects.length) return;
    const newSubjects = [...courseData.subjects];
    newSubjects.splice(currentIndex, 1);
    newSubjects.splice(newIndex, 0, subjectId);
    setCourseData((prev) => ({
      ...prev,
      subjects: newSubjects,
    }));
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
  };

  // Remove prerequisite
  const handleRemovePrerequisite = (subjectId: string, prerequisiteId: string) => {
    setCourseData((prev) => ({
      ...prev,
      prerequisites: prev.prerequisites.filter(
        (p) => !(p.subjectId === subjectId && p.prerequisiteId === prerequisiteId)
      ),
    }));
  };

  // Get prerequisites for a subject
  const getPrerequisitesForSubject = (subjectId: string) => {
    return courseData.prerequisites
      .filter((p) => p.subjectId === subjectId)
      .map((p) => p.prerequisiteId);
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: "",
      department_id: "",
      description: "",
      study_result: "",
      subjects: "",
      videoUrl: "",
    };
    const errorMessages: string[] = [];
    if (!courseData.title.trim()) {
      newErrors.title = "กรุณาระบุชื่อหลักสูตร (ห้ามเป็นช่องว่าง)";
      errorMessages.push("ชื่อหลักสูตร: กรุณาระบุ (ห้ามเป็นช่องว่าง)");
      isValid = false;
    }
    if (!courseData.department_id.trim()) {
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
        /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      if (!youtubeRegex.test(courseData.video_url)) {
        newErrors.videoUrl = "URL วิดีโอไม่ถูกต้อง ต้องเป็น URL ของ YouTube ที่มีรูปแบบถูกต้อง";
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
      toast.error(
        <div>
          <p>กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง:</p>
          <ul>
            {errorMessages.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </div>,
        { autoClose: 5000 }
      );
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
      formData.append("department_id", courseData.department_id);
      formData.append("description", courseData.description);
      formData.append("study_result", courseData.study_result);
      if (courseData.coverImage) {
        formData.append("coverImage", courseData.coverImage);
      }
      const subjectsData = courseData.subjects.map((subjectId, index) => ({
        id: parseInt(subjectId),
        order: index + 1,
      }));
      formData.append("subjects", JSON.stringify(subjectsData));
      if (courseData.video_url) {
        formData.append("video_url", courseData.video_url);
      }
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
        // Upload attachments if any
        if (courseData.attachments.length > 0) {
          for (const attachment of courseData.attachments) {
            const attachmentFormData = new FormData();
            attachmentFormData.append("file", attachment);
            attachmentFormData.append("title", attachment.name);
            attachmentFormData.append("file_name", attachment.name);
            try {
              await axios.post(`${apiUrl}/api/courses/${courseId}/attachments`, attachmentFormData, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
            } catch (attachmentError) {
              toast.warning(`ไม่สามารถอัปโหลดไฟล์ ${attachment.name} ได้`);
            }
          }
        }
        setTimeout(() => {
          navigate("/admin-creditbank");
        }, 1500);
      } else {
        setApiError(response.data.message || "เกิดข้อผิดพลาดในการแก้ไขหลักสูตร");
        toast.error(response.data.message || "เกิดข้อผิดพลาดในการแก้ไขหลักสูตร");
      }
    } catch (error: any) {
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

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (courseData.coverImagePreview && courseData.coverImage) {
        URL.revokeObjectURL(courseData.coverImagePreview);
      }
    };
  }, [courseData.coverImagePreview]);

  const handleDeleteExistingAttachment = async (attachmentId: string) => {
    if (!attachmentId || attachmentId === 'undefined') {
      console.error('Invalid attachment ID:', attachmentId);
      toast.error('ไม่พบรหัสไฟล์แนบ');
      return;
    }
    
    const token = localStorage.getItem("token");
    if (!token || !courseId) return;
    
    try {
      console.log('Deleting attachment:', attachmentId); // Debug log
      const response = await axios.delete(`${apiUrl}/api/courses/${courseId}/attachments/${attachmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setExistingAttachments(prev => prev.filter(att => att.attachment_id !== attachmentId));
        toast.success('ลบไฟล์แนบสำเร็จ');
      } else {
        toast.error(response.data.message || 'ไม่สามารถลบไฟล์แนบได้');
      }
    } catch (error: any) {
      console.error('Error deleting attachment:', error);
      const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบไฟล์แนบ';
      toast.error(errorMessage);
    }
  };

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
          title: courseData.title,
          department_id: courseData.department_id,
          description: courseData.description,
          study_result: courseData.study_result,
        }}
        errors={{
          title: errors.title,
          department_id: errors.department_id,
          description: errors.description,
          study_result: errors.study_result,
        }}
        handleInputChange={handleInputChange}
      />
      <CourseContentSection
        isLoading={isLoading}
        courseData={courseData}
        errors={{ subjects: errors.subjects }}
        availableSubjects={availableSubjects}
        selectedSubjectsDetails={selectedSubjectsDetails}
        setShowSubjectModal={setShowSubjectModal}
        setSelectedSubjectForPrereq={setSelectedSubjectForPrereq}
        setShowPrerequisiteModal={setShowPrerequisiteModal}
        handleRemoveSubject={handleRemoveSubject}
        handleReorderSubject={handleReorderSubject}
        getPrerequisitesForSubject={getPrerequisitesForSubject}
        handleRemovePrerequisite={handleRemovePrerequisite}
      />
      <CourseSettingsSection
        courseData={{
          coverImage: courseData.coverImage,
          coverImagePreview: courseData.coverImagePreview,
          video_url: courseData.video_url,
          study_result: courseData.study_result,
          attachments: courseData.attachments,
        }}
        errors={{ videoUrl: errors.videoUrl }}
        handleInputChange={handleInputChange}
        handleCoverImageUpload={handleCoverImageUpload}
        handleRemoveCoverImage={handleRemoveCoverImage}
        handleAttachmentUpload={handleAttachmentUpload}
        handleRemoveAttachment={handleRemoveAttachment}
        fileInputRef={fileInputRef}
      >
        {existingAttachments.length > 0 && (
          <div className="attachments-list mb-3">
            <h6>ไฟล์แนบเดิม:</h6>
            <div className="list-group">
              {existingAttachments.map((file) => (
                <div key={file.attachment_id} className="list-group-item d-flex justify-content-between align-items-center">
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    <i className="fas fa-file me-2 text-primary"></i>
                    {file.file_name}
                  </a>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteExistingAttachment(file.attachment_id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CourseSettingsSection>
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