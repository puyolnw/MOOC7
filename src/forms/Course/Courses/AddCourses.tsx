import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import CourseInfoSection from "./CourseInfoSection";
import CourseContentSection from "./CourseContentSection";
import CourseSettingsSection from "./CourseSettingsSection";
import ModalSubjectSelection from "./ModalSubjectSelection";
import ModalPrerequisiteSelection from "./ModalPrerequisiteSelection";



export interface Subject {
    id: string;
    title: string;
    instructor: string;
    description: string;
    coverImage: string;
  }
  
  export interface Prerequisite {
    subjectId: string;
    prerequisiteId: string;
  }
  
  export interface CourseData {
    title: string;
    description: string;
    department_id: string; // Add this line
    coverImage: File | null;
    coverImagePreview: string;
    videoUrl: string;
    hasCertificate: boolean;
    subjects: string[];
    prerequisites: Prerequisite[];
  }
  
  

interface AddCoursesProps {
  onCancel?: () => void;
}


const AddCourses: React.FC<AddCoursesProps> = ({ onCancel }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL ;
  
  // State for loading and error
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  
  // State for available subjects (will be fetched from API)
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  
  // State for course data
  const [courseData, setCourseData] = useState<CourseData>({
    title: "",
    description: "",
    department_id: "", // Add this line
    coverImage: null,
    coverImagePreview: "",
    videoUrl: "",
    hasCertificate: true,
    subjects: [],
    prerequisites: []
  });
  
  
  // State for search term
  const [searchTerm, setSearchTerm] = useState("");
  
  // State for showing subject selection modal
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  
  // State for showing prerequisite modal
  const [showPrerequisiteModal, setShowPrerequisiteModal] = useState(false);
  const [selectedSubjectForPrereq, setSelectedSubjectForPrereq] = useState<string | null>(null);
  
  // State for validation errors
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    subjects: "",
    videoUrl: "",
    department_id: '', // Add this line
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
          setIsLoading(false);
          return;
        }
        
        const response = await axios.get(`${apiURL}/api/courses/subjects`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          const formattedSubjects = response.data.subjects.map((subject: any) => ({
            id: subject.subject_id.toString(),
            title: subject.subject_name,
            instructor: subject.instructor_count > 0 ? `${subject.instructor_count} อาจารย์` : "ไม่มีอาจารย์",
            description: subject.description || "ไม่มีคำอธิบาย",
            coverImage: subject.cover_image 
              ? `${apiURL}/${subject.cover_image.replace(/\\/g, '/')}` 
              : "/assets/img/courses/course_thumb01.jpg"
          }));
          
          setAvailableSubjects(formattedSubjects);
        } else {
          setApiError("ไม่สามารถดึงข้อมูลรายวิชาได้");
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setApiError("เกิดข้อผิดพลาดในการดึงข้อมูลรายวิชา");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubjects();
    
  }, [apiURL]);
  
  // Get selected subjects details
  const selectedSubjectsDetails = courseData.subjects.map(id => 
    availableSubjects.find(subject => subject.id === id)
  ).filter(subject => subject !== undefined) as Subject[];
  
  // Handle input changes
 // Update the handleInputChange function to include HTMLSelectElement
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setCourseData(prevState => ({
    ...prevState,
    [name]: value
  }));
  
  // Clear error for this field
  if (name in errors) {
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: ""
    }));
  }
  
  // Validate YouTube URL
  if (name === "videoUrl" && value) {
    validateYoutubeUrl(value);
  }
};

const handleSubmissionError = (error: any) => {
  console.error('Error submitting course:', error);
  if (error.response?.data?.message) {
    setApiError(error.response.data.message);
    toast.error(error.response.data.message);
  } else {
    setApiError('เกิดข้อผิดพลาดในการสร้างหลักสูตร');
    toast.error('เกิดข้อผิดพลาดในการสร้างหลักสูตร');
  }
};
  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCourseData(prevState => ({
      ...prevState,
      [name]: checked
    }));
  };
  
  // Validate YouTube URL
  const validateYoutubeUrl = (url: string) => {
    if (url === "") {
      setErrors(prevErrors => ({
        ...prevErrors,
        videoUrl: ""
      }));
      return;
    }
    
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?!.*&list=.*)(?!.*&index=.*)/;
    if (!youtubeRegex.test(url)) {
      setErrors(prevErrors => ({
        ...prevErrors,
        videoUrl: "URL วิดีโอไม่ถูกต้อง ต้องเป็น URL ของ YouTube ที่มีรูปแบบถูกต้อง"
      }));
    } else {
      setErrors(prevErrors => ({
        ...prevErrors,
        videoUrl: ""
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
      alert("ขนาดไฟล์ต้องไม่เกิน 2MB");
      return;
    }
    
    // Validate file type
    const fileType = file.type;
    if (!fileType.match(/^image\/(jpeg|jpg|png|gif)$/)) {
      alert("รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF)");
      return;
    }
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    
    setCourseData(prevState => ({
      ...prevState,
      coverImage: file,
      coverImagePreview: previewUrl
    }));
  };
  
  // Remove cover image
  const handleRemoveCoverImage = () => {
    setCourseData(prevState => ({
      ...prevState,
      coverImage: null,
      coverImagePreview: ""
    }));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  // Filter subjects based on search term
  const filteredSubjects = availableSubjects.filter(subject => 
    subject.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Add subject to course
  const handleAddSubject = (subjectId: string) => {
    if (courseData.subjects.includes(subjectId)) {
      toast.warning("รายวิชานี้ถูกเพิ่มในหลักสูตรแล้ว");
      return;
    }
    
    setCourseData(prevState => ({
      ...prevState,
      subjects: [...prevState.subjects, subjectId]
    }));
    
    // Clear subjects error if any
    if (errors.subjects) {
      setErrors(prevErrors => ({
        ...prevErrors,
        subjects: ""
      }));
    }
  };
  
  // Remove subject from course
  const handleRemoveSubject = (subjectId: string) => {
    // Remove the subject
    setCourseData(prevState => ({
      ...prevState,
      subjects: prevState.subjects.filter(id => id !== subjectId),
      // Also remove any prerequisites involving this subject
      prerequisites: prevState.prerequisites.filter(
        p => p.subjectId !== subjectId && p.prerequisiteId !== subjectId
      )
    }));
  };
  
  // Handle reordering of subjects with up/down buttons
  const handleReorderSubject = (subjectId: string, newIndex: number) => {
    // Find the current index of the subject
    const currentIndex = courseData.subjects.findIndex(id => id === subjectId);
    
    // Check if the new index is valid
    if (newIndex < 0 || newIndex >= courseData.subjects.length) {
      return;
    }
    
    // Create a copy of the subjects array
    const newSubjects = [...courseData.subjects];
    
    // Remove the subject from its current position
    newSubjects.splice(currentIndex, 1);
    
    // Insert the subject at the new position
    newSubjects.splice(newIndex, 0, subjectId);
    
    // Update the state
    setCourseData(prevState => ({
      ...prevState,
      subjects: newSubjects
    }));
  };
  
  // Add prerequisite relationship
  const handleAddPrerequisite = (prerequisiteId: string) => {
    if (!selectedSubjectForPrereq) return;
    
    // Check if this prerequisite already exists
    const exists = courseData.prerequisites.some(
      p => p.subjectId === selectedSubjectForPrereq && p.prerequisiteId === prerequisiteId
    );
    
    if (exists) {
      toast.warning("ความสัมพันธ์นี้มีอยู่แล้ว");
      return;
    }
    
    // Check if this would create a circular dependency
    if (selectedSubjectForPrereq === prerequisiteId) {
      toast.error("รายวิชาไม่สามารถเป็นวิชาก่อนหน้าของตัวเองได้");
      return;
    }
    
    setCourseData(prevState => ({
      ...prevState,
      prerequisites: [
        ...prevState.prerequisites,
        {
          subjectId: selectedSubjectForPrereq,
          prerequisiteId: prerequisiteId
        }
      ]
    }));
  };
  
  // Remove prerequisite relationship
  const handleRemovePrerequisite = (subjectId: string, prerequisiteId: string) => {
    setCourseData(prevState => ({
      ...prevState,
      prerequisites: prevState.prerequisites.filter(
        p => !(p.subjectId === subjectId && p.prerequisiteId === prerequisiteId)
      )
    }));
  };
  
  // Get prerequisites for a subject
  const getPrerequisitesForSubject = (subjectId: string) => {
    return courseData.prerequisites
      .filter(p => p.subjectId === subjectId)
      .map(p => p.prerequisiteId);
  };
  
  // Validate form before submission
 // Update validation in handleSubmit
const validateForm = () => {
  let isValid = true;
  const newErrors = {
    title: "",
    description: "",
    subjects: "",
    videoUrl: "",
    department_id: ""
  };

  if (!courseData.department_id) {
    newErrors.department_id = "กรุณาเลือกสาขาวิชา";
    isValid = false;
  }

  // Add department_id to FormData when submitting
  const formData = new FormData();
  formData.append('department_id', courseData.department_id);

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
        return;
      }
  
      console.log('Course Data before submission:', courseData);
  
      const formData = new FormData();
      formData.append('title', courseData.title);
      formData.append('description', courseData.description);
      formData.append('department_id', courseData.department_id);
  
      if (courseData.coverImage) {
        formData.append('coverImage', courseData.coverImage);
      }
  
      const subjectsData = courseData.subjects.map(subjectId => ({
        id: parseInt(subjectId),
        order: courseData.subjects.indexOf(subjectId) + 1
      }));
  
      console.log('Subjects Data:', subjectsData);
      formData.append('subjects', JSON.stringify(subjectsData));
  
      if (courseData.videoUrl) {
        formData.append('video_url', courseData.videoUrl);
      }
  
      // Log FormData entries
      for (const pair of formData.entries()) {
        console.log('FormData Entry:', pair[0], ':', pair[1]);
      }
  
      const response = await axios.post(`${apiURL}/api/courses`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      console.log('API Response:', response.data);
  
      if (response.data.success) {
        setApiSuccess("สร้างหลักสูตรสำเร็จ");
        toast.success("สร้างหลักสูตรสำเร็จ");
        navigate('/admin-creditbank/');
      }
    } catch (error) {
      console.error('Submission Error:', error);
      handleSubmissionError(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  
  

  // Handle cancel
  const handleCancelForm = () => {
    if (onCancel) {
      onCancel();
    } else {
      // ถ้าไม่มี callback ให้ redirect ไปหน้าจัดการหลักสูตร
      navigate('/admin-creditbank/');
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (courseData.coverImagePreview) {
        URL.revokeObjectURL(courseData.coverImagePreview);
      }
    };
  }, [courseData.coverImagePreview]);

  return (
    <form onSubmit={handleSubmit}>
      {/* แสดงข้อผิดพลาดจาก API ถ้ามี */}
      {apiError && (
        <div className="alert alert-danger mb-4">
          <i className="fas fa-exclamation-circle me-2"></i>
          {apiError}
        </div>
      )}

      {/* แสดงข้อความสำเร็จถ้ามี */}
      {apiSuccess && (
        <div className="alert alert-success mb-4">
          <i className="fas fa-check-circle me-2"></i>
          {apiSuccess}
        </div>
      )}

      {/* ส่วนที่ 1: ข้อมูลหลักสูตร */}
      <CourseInfoSection
        courseData={courseData}
        errors={errors}
        handleInputChange={handleInputChange}
      />

      {/* ส่วนที่ 2: จัดการเนื้อหาหลักสูตร */}
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
        handleRemovePrerequisite={handleRemovePrerequisite} // เพิ่มการส่งผ่าน props นี้
      />

      {/* ส่วนที่ 3: ตั้งค่าหลักสูตร */}
      <CourseSettingsSection
        courseData={courseData}
        errors={errors}
        handleInputChange={handleInputChange}
        handleCheckboxChange={handleCheckboxChange}
        handleCoverImageUpload={handleCoverImageUpload}
        handleRemoveCoverImage={handleRemoveCoverImage}
        fileInputRef={fileInputRef}
      />

      {/* ปุ่มบันทึกและยกเลิก */}
      <div className="d-flex justify-content-end gap-2 mt-4">
        <button 
          type="button" 
          className="btn btn-outline-secondary" 
          onClick={handleCancelForm}
          disabled={isSubmitting}
        >
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
              <i className="fas fa-save me-2"></i>บันทึกหลักสูตร
            </>
          )}
        </button>
      </div>

      {/* Modal เลือกรายวิชา */}
      <ModalSubjectSelection
        showSubjectModal={showSubjectModal}
        setShowSubjectModal={setShowSubjectModal}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredSubjects={filteredSubjects}
        isLoading={isLoading}
        courseData={courseData}
        handleAddSubject={handleAddSubject}
      />

      {/* Modal กำหนดวิชาก่อนหน้า */}
      <ModalPrerequisiteSelection
        showPrerequisiteModal={showPrerequisiteModal}
        selectedSubjectForPrereq={selectedSubjectForPrereq}
        setShowPrerequisiteModal={setShowPrerequisiteModal}
        availableSubjects={availableSubjects}
        selectedSubjectsDetails={selectedSubjectsDetails}
        courseData={courseData}
        handleAddPrerequisite={handleAddPrerequisite}
        handleRemovePrerequisite={handleRemovePrerequisite}
      />
    </form>
  );
};

export default AddCourses;
