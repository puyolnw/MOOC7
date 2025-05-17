import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Wrapper from "../../../layouts/Wrapper";
import CourseInfoSection from "./CourseInfoSection";
import CourseContentSection from "./CourseContentSection";
import CourseSettingsSection from "./CourseSettingsSection";
import ModalSubjectSelection from "./ModalSubjectSelection";
import ModalPrerequisiteSelection from "./ModalPrerequisiteSelection";

// Interface for subject data
interface Subject {
  id: string;
  title: string;
  instructor: string;
  description: string;
  coverImage?: string; // ปรับให้เป็น optional
  coverImageFileId?: string;
}

// Interface for prerequisite relationship
interface Prerequisite {
  subjectId: string;
  prerequisiteId: string;
}

// Interface for course data
interface CourseData {
  title: string;
  department_id: string;
  category: string; // เพิ่ม category
  description: string;
  coverImage: File | null;
  coverImagePreview: string;
  video_url: string;
  subjects: string[];
  prerequisites: Prerequisite[];
}

interface AddCoursesProps {
  onSubmit?: (courseData: any) => void;
  onCancel?: () => void;
}

const AddCourses: React.FC<AddCoursesProps> = ({ onSubmit, onCancel }) => {
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL;
  const fileInputRef = useRef<HTMLInputElement>(null); // เพิ่ม fileInputRef

  // State for loading and error
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  // State for available subjects
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);

  // State for course data
  const [courseData, setCourseData] = useState<CourseData>({
    title: "",
    department_id: "",
    category: "", // เพิ่ม category
    description: "",
    coverImage: null,
    coverImagePreview: "",
    video_url: "",
    subjects: [],
    prerequisites: [],
  });

  // State for search term
  const [searchTerm, setSearchTerm] = useState("");

  // State for modals
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showPrerequisiteModal, setShowPrerequisiteModal] = useState(false);
  const [selectedSubjectForPrereq, setSelectedSubjectForPrereq] = useState<string | null>(null);

  // State for validation errors
  const [errors, setErrors] = useState({
    title: "",
    department_id: "",
    category: "", 
    description: "",
    subjects: "",
    videoUrl: "",
  });

  // Fetch available subjects from API
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setIsLoading(true);
        setApiError(null);

        const token = localStorage.getItem("token");

        if (!token) {
          setApiError("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
          return;
        }

        const response = await axios.get(`${apiURL}/api/courses/subjects`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          const formattedSubjects = response.data.subjects.map((subject: any) => ({
            id: subject.subject_id.toString(),
            title: subject.subject_name,
            instructor: subject.instructor_count > 0 ? `${subject.instructor_count} อาจารย์` : "ไม่มีอาจารย์",
            description: subject.description || "ไม่มีคำอธิบาย",
            coverImage: subject.cover_image
              ? `${apiURL}/${subject.cover_image.replace(/\\/g, "/")}`
              : "/assets/img/courses/course_thumb01.jpg",
            coverImageFileId: subject.cover_image_file_id,
          }));

          setAvailableSubjects(formattedSubjects);
        } else {
          setApiError(response.data.message || "ไม่สามารถดึงข้อมูลรายวิชาได้");
        }
      } catch (error: any) {
        console.error("Error fetching subjects:", error);
        setApiError(error.response?.data?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลรายวิชา");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, [apiURL]);

  // Filter subjects based on search term
  const filteredSubjects = availableSubjects.filter(
    (subject) =>
      subject.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected subjects details
  const selectedSubjectsDetails = courseData.subjects
    .map((id) => availableSubjects.find((subject) => subject.id === id))
    .filter((subject) => subject !== undefined) as Subject[];

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    console.log(`Input Change - ${name}: ${value}`); // Debug ข้อมูลที่กรอก
    setCourseData((prevState) => {
      const newState = {
        ...prevState,
        [name]: value,
      };
      console.log("Updated courseData:", newState); // Debug state หลังอัปเดต
      return newState;
    });

    // Clear error for this field
    if (name in errors) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }

    // Validate YouTube URL
    if (name === "videoUrl" && value) {
      validateYoutubeUrl(value);
    }
  };

  // Validate YouTube URL
  const validateYoutubeUrl = (url: string) => {
    if (url === "") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        videoUrl: "",
      }));
      return;
    }

    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?!.*&list=.*)(?!.*&index=.*)/;
    if (!youtubeRegex.test(url)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        videoUrl: "URL วิดีโอไม่ถูกต้อง ต้องเป็น URL ของ YouTube ที่มีรูปแบบถูกต้อง",
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        videoUrl: "",
      }));
    }
  };

  // Handle cover image upload
  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file size (max 5MB to match backend)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return;
    }

    // Validate file type
    const fileType = file.type;
    if (!fileType.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
      toast.error("รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF, WEBP)");
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    setCourseData((prevState) => ({
      ...prevState,
      coverImage: file,
      coverImagePreview: previewUrl,
    }));
  };

  // Remove cover image
  const handleRemoveCoverImage = () => {
    setCourseData((prevState) => ({
      ...prevState,
      coverImage: null,
      coverImagePreview: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Add subject to course
  const handleAddSubject = (subjectId: string) => {
    if (courseData.subjects.includes(subjectId)) {
      toast.warning("รายวิชานี้ถูกเพิ่มในหลักสูตรแล้ว");
      return;
    }

    setCourseData((prevState) => ({
      ...prevState,
      subjects: [...prevState.subjects, subjectId],
    }));

    // Clear subjects error
    if (errors.subjects) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        subjects: "",
      }));
    }
  };

  // Remove subject from course
  const handleRemoveSubject = (subjectId: string) => {
    setCourseData((prevState) => ({
      ...prevState,
      subjects: prevState.subjects.filter((id) => id !== subjectId),
      prerequisites: prevState.prerequisites.filter(
        (p) => p.subjectId !== subjectId && p.prerequisiteId !== subjectId
      ),
    }));
  };

  // Handle reordering of subjects
  const handleReorderSubject = (subjectId: string, newIndex: number) => {
    const currentIndex = courseData.subjects.findIndex((id) => id === subjectId);
    if (newIndex < 0 || newIndex >= courseData.subjects.length) return;

    const newSubjects = [...courseData.subjects];
    newSubjects.splice(currentIndex, 1);
    newSubjects.splice(newIndex, 0, subjectId);

    setCourseData((prevState) => ({
      ...prevState,
      subjects: newSubjects,
    }));
  };

  // Add prerequisite relationship
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

    setCourseData((prevState) => ({
      ...prevState,
      prerequisites: [
        ...prevState.prerequisites,
        {
          subjectId: selectedSubjectForPrereq,
          prerequisiteId: prerequisiteId,
        },
      ],
    }));
  };

  // Remove prerequisite relationship
  const handleRemovePrerequisite = (subjectId: string, prerequisiteId: string) => {
    setCourseData((prevState) => ({
      ...prevState,
      prerequisites: prevState.prerequisites.filter(
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

  // Validate form before submission
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: "",
      department_id: "",
      description: "",
      category: "", 
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

      if (courseData.coverImage) {
        formData.append("coverImage", courseData.coverImage);
      }

      const subjectsData = courseData.subjects.map((subjectId, index) => ({
        id: parseInt(subjectId), // แปลงเป็น integer เพื่อให้สอดคล้องกับ backend
        order: index + 1,
      }));
      formData.append("subjects", JSON.stringify(subjectsData));

      if (courseData.video_url) {
        formData.append("video_url", courseData.video_url); // เปลี่ยนเป็น video_url เพื่อให้สอดคล้องกับ backend
      }

      // Log FormData entries
      console.log("FormData Entries:");
      for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      const response = await axios.post(`${apiURL}/api/courses`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setApiSuccess(response.data.message);
        toast.success(response.data.message);

        if (onSubmit) {
          onSubmit(response.data);
        } else {
          setTimeout(() => {
            navigate("/admin-creditbank");
          }, 1500);
        }
      } else {
        setApiError(response.data.message);
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.error("Error creating course:", error);
      const errorMessage = error.response?.data?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์";
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancelForm = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("/admin-creditbank/courses");
    }
  };

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (courseData.coverImagePreview) {
        URL.revokeObjectURL(courseData.coverImagePreview);
      }
    };
  }, [courseData.coverImagePreview]);

  return (
    <Wrapper>
      <form onSubmit={handleSubmit}>
        {apiError && (
          <div className="alert alert-danger mb-4">
            <i className="fas fa-exclamation-circle me-2"></i>
            {apiError}
          </div>
        )}

        {apiSuccess && (
          <div className="alert alert-success mb-4">
            <i className="fas fa-check-circle me-2"></i>
            {apiSuccess}
          </div>
        )}

        <CourseInfoSection
          courseData={courseData}
          errors={errors}
          handleInputChange={handleInputChange}
        />

        <CourseContentSection
          isLoading={isLoading}
          availableSubjects={availableSubjects}
          courseData={courseData}
          errors={errors}
          setShowSubjectModal={setShowSubjectModal}
          selectedSubjectsDetails={selectedSubjectsDetails}
          handleReorderSubject={handleReorderSubject}
          handleRemoveSubject={handleRemoveSubject}
          setSelectedSubjectForPrereq={setSelectedSubjectForPrereq}
          setShowPrerequisiteModal={setShowPrerequisiteModal}
          getPrerequisitesForSubject={getPrerequisitesForSubject}
          handleRemovePrerequisite={handleRemovePrerequisite}
        />

        <CourseSettingsSection
          courseData={courseData}
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
            onClick={handleCancelForm}
            disabled={isSubmitting}
          >
            ยกเลิก
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
    </Wrapper>
  );
};

export default AddCourses;