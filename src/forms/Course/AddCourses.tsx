import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify"; // เพิ่ม toast เพื่อแสดงข้อความแจ้งเตือน

// Interface for subject/course data
interface Subject {
  id: string;
  title: string;
  instructor: string;
  description: string;
  coverImage: string;
}

// Interface for prerequisite relationship
interface Prerequisite {
  subjectId: string;
  prerequisiteId: string;
}

// Interface for course data
interface CourseData {
  title: string;
  description: string;
  coverImage: File | null;
  coverImagePreview: string;
  videoUrl: string;
  hasCertificate: boolean;
  subjects: string[]; // IDs of selected subjects
  prerequisites: Prerequisite[]; // Prerequisite relationships
}

interface AddCoursesProps {
  onSubmit?: (courseData: any) => void;
  onCancel?: () => void;
}

const AddCourses: React.FC<AddCoursesProps> = ({ onSubmit, onCancel }) => {
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
    coverImage: null,
    coverImagePreview: "",
    videoUrl: "",
    hasCertificate: true, // Default is true
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
    videoUrl: ""
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: "",
      description: "",
      subjects: "",
      videoUrl: ""
    };
    
    // Validate title
    if (!courseData.title.trim()) {
      newErrors.title = "กรุณาระบุชื่อหลักสูตร";
      isValid = false;
    }
    
    // Validate description
    if (!courseData.description.trim()) {
      newErrors.description = "กรุณาระบุคำอธิบายหลักสูตร";
      isValid = false;
    }
    
    // Validate subjects
    if (courseData.subjects.length === 0) {
      newErrors.subjects = "กรุณาเพิ่มอย่างน้อย 1 รายวิชาในหลักสูตร";
      isValid = false;
    }
    
    // Validate video URL if provided
    if (courseData.videoUrl) {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?!.*&list=.*)(?!.*&index=.*)/;
      if (!youtubeRegex.test(courseData.videoUrl)) {
        newErrors.videoUrl = "URL วิดีโอไม่ถูกต้อง ต้องเป็น URL ของ YouTube ที่มีรูปแบบถูกต้อง";
        isValid = false;
      }
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
        setIsSubmitting(false);
        return;
      }
      
      // สร้าง FormData สำหรับส่งข้อมูลและไฟล์
      const formData = new FormData();
      formData.append('title', courseData.title);
      formData.append('description', courseData.description);
      
      if (courseData.coverImage) {
        formData.append('coverImage', courseData.coverImage);
      }
      
      // แปลงข้อมูล subjects ให้เป็นรูปแบบที่ API ต้องการ
      const subjectsData = courseData.subjects.map((subjectId, index) => ({
        id: subjectId,
        order: index + 1
      }));
      
      formData.append('subjects', JSON.stringify(subjectsData));
      
      // เพิ่มข้อมูลอื่นๆ ที่ต้องการส่งไปยัง API
      if (courseData.videoUrl) {
        formData.append('video_url', courseData.videoUrl)
      }
      
      formData.append('hasCertificate', courseData.hasCertificate.toString());
      
      // ส่งข้อมูล prerequisites ถ้ามี
      if (courseData.prerequisites.length > 0) {
        formData.append('prerequisites', JSON.stringify(courseData.prerequisites));
      }
      
      // ส่งข้อมูลไปยัง API
      const response = await axios.post(`${apiURL}/api/courses`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setApiSuccess("สร้างหลักสูตรสำเร็จ");
        toast.success("สร้างหลักสูตรสำเร็จ");
        
        // ถ้าสำเร็จและมี callback onSubmit ให้เรียกใช้
        if (onSubmit) {
          onSubmit(response.data);
        } else {
          // ถ้าไม่มี callback ให้ redirect ไปหน้าจัดการหลักสูตร หลังจากแสดง toast สักครู่
          setTimeout(() => {
            navigate('/admin-creditbank/courses');
          }, 1500);
        }
      } else {
        setApiError(response.data.message || 'เกิดข้อผิดพลาดในการสร้างหลักสูตร');
        toast.error(response.data.message || 'เกิดข้อผิดพลาดในการสร้างหลักสูตร');
      }
    } catch (error: any) {
      console.error('Error creating course:', error);
      const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์';
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
      // ถ้าไม่มี callback ให้ redirect ไปหน้าจัดการหลักสูตร
      navigate('/admin-creditbank/courses');
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
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">1. ข้อมูลหลักสูตร</h5>
          
          <div className="mb-3">
            <label htmlFor="title" className="form-label">ชื่อหลักสูตร <span className="text-danger">*</span></label>
            <input
              type="text"
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
              id="title"
              name="title"
              value={courseData.title}
              onChange={handleInputChange}
              placeholder="ระบุชื่อหลักสูตร"
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>
          
          <div className="mb-3">
            <label htmlFor="description" className="form-label">คำอธิบายหลักสูตร <span className="text-danger">*</span></label>
            <textarea
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              id="description"
              name="description"
              value={courseData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="ระบุคำอธิบายเกี่ยวกับหลักสูตร"
            ></textarea>
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
          </div>
        </div>
      </div>
      
      {/* ส่วนที่ 2: จัดการเนื้อหาหลักสูตร */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">2. จัดการเนื้อหาหลักสูตร</h5>
          
          {errors.subjects && (
            <div className="alert alert-danger">{errors.subjects}</div>
          )}
          
          <div className="d-flex justify-content-between align-items-center mb-3">
            <p className="mb-0">เลือกรายวิชาที่ต้องการเพิ่มในหลักสูตร</p>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => setShowSubjectModal(true)}
              >
                <i className="fas fa-plus-circle me-2"></i>เพิ่มรายวิชาที่มีอยู่
              </button>
              <Link to="/admin-creditbank/lessons/add" className="btn btn-outline-success">
                <i className="fas fa-file-medical me-2"></i>สร้างรายวิชาใหม่
              </Link>
            </div>
          </div>
          
          {isLoading && availableSubjects.length === 0 ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">กำลังโหลดข้อมูลรายวิชา...</p>
            </div>
          ) : courseData.subjects.length > 0 ? (
            <div className="selected-subjects mt-3">
              <div className="alert alert-info mb-3">
                <i className="fas fa-info-circle me-2"></i>
                คุณสามารถจัดลำดับรายวิชาโดยใช้ปุ่มขึ้น-ลง และกำหนดวิชาก่อนหน้าที่จำเป็นต้องเรียนก่อน
              </div>
              
              <div className="subject-list" style={{ minHeight: '50px', padding: '10px 0' }}>
                {selectedSubjectsDetails.map((subject, index) => {
                  const prerequisites = getPrerequisitesForSubject(subject.id);
                  const prerequisiteSubjects = prerequisites.map(
                    id => availableSubjects.find(s => s.id === id)
                  ).filter(Boolean) as Subject[];
                  
                  return (
                    <div key={subject.id} className="card mb-3 border">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-2">
                          <div className="d-flex align-items-center me-3">
                            <button
                              type="button"
                              className="btn btn-sm btn-link p-0 me-1"
                              onClick={() => handleReorderSubject(subject.id, index - 1)}
                              disabled={index === 0}
                            >
                              <i className="fas fa-arrow-up"></i>
                            </button>
                            <span className="mx-2">{index + 1}</span>
                            <button
                              type="button"
                              className="btn btn-sm btn-link p-0 ms-1"
                              onClick={() => handleReorderSubject(subject.id, index + 1)}
                              disabled={index === selectedSubjectsDetails.length - 1}
                            >
                              <i className="fas fa-arrow-down"></i>
                            </button>
                          </div>
                          <h6 className="mb-0 flex-grow-1">
                            {subject.title}
                          </h6>
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => {
                                setSelectedSubjectForPrereq(subject.id);
                                setShowPrerequisiteModal(true);
                              }}
                            >
                              <i className="fas fa-project-diagram me-1"></i>
                              กำหนดวิชาก่อนหน้า
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemoveSubject(subject.id)}
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                        
                        <div className="d-flex align-items-center">
                          <img
                            src={subject.coverImage}
                            alt={subject.title}
                            className="img-thumbnail me-3"
                            style={{ width: "60px", height: "60px", objectFit: "cover" }}
                            onError={(e) => {
                              // ถ้าโหลดรูปไม่สำเร็จ ใช้รูปเริ่มต้น
                              (e.target as HTMLImageElement).src = "/assets/img/courses/course_thumb01.jpg";
                            }}
                          />
                          <div>
                            <p className="mb-1 small text-muted">ผู้สอน: {subject.instructor}</p>
                            <p className="mb-0 small">{subject.description}</p>
                          </div>
                        </div>
                        
                        {prerequisiteSubjects.length > 0 && (
                          <div className="mt-3 pt-2 border-top">
                            <h6 className="small">วิชาที่ต้องเรียนก่อน:</h6>
                            <div className="d-flex flex-wrap gap-2 mt-2">
                              {prerequisiteSubjects.map(prereq => (
                                <div key={prereq.id} className="badge bg-light text-dark p-2 d-flex align-items-center">
                                  <span>{prereq.title}</span>
                                  <button
                                    type="button"
                                    className="btn btn-sm text-danger ms-2 p-0"
                                    onClick={() => handleRemovePrerequisite(subject.id, prereq.id)}
                                  >
                                    <i className="fas fa-times-circle"></i>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-5 bg-light rounded">
              <i className="fas fa-book-open fa-3x text-muted mb-3"></i>
              <h5>ยังไม่มีรายวิชาในหลักสูตร</h5>
              <p className="text-muted">กรุณาเพิ่มรายวิชาอย่างน้อย 1 รายวิชา</p>
            </div>
          )}
        </div>
      </div>
      
      {/* ส่วนที่ 3: ตั้งค่าหลักสูตร */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">3. ตั้งค่าหลักสูตร</h5>
          
          {/* ภาพหน้าปก */}
          <div className="mb-4">
            <label className="form-label">ภาพหน้าปกหลักสูตร</label>
            <p className="text-muted small mb-2">แนะนำขนาด 1200 x 800 พิกเซล (ไม่เกิน 2MB)</p>
            
            <div className="d-flex align-items-center gap-3">
              <div 
                className="cover-image-preview rounded border"
                style={{ 
                  width: "150px", 
                  height: "100px", 
                  backgroundImage: courseData.coverImagePreview ? `url(${courseData.coverImagePreview})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f8f9fa'
                }}
              >
                {!courseData.coverImagePreview && (
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
                  style={{ display: 'none' }}
                />
                
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <i className="fas fa-upload me-2"></i>
                    {courseData.coverImage ? 'เปลี่ยนภาพ' : 'อัปโหลดภาพ'}
                  </button>
                  
                  {courseData.coverImage && (
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
          
          {/* วิดีโอแนะนำหลักสูตร */}
          <div className="mb-4">
            <label htmlFor="videoUrl" className="form-label">วิดีโอแนะนำหลักสูตร (YouTube)</label>
            <input
              type="text"
              className={`form-control ${errors.videoUrl ? 'is-invalid' : ''}`}
              id="videoUrl"
              name="videoUrl"
              value={courseData.videoUrl}
              onChange={handleInputChange}
              placeholder="เช่น https://www.youtube.com/watch?v=abcdefghijk"
            />
            {errors.videoUrl && <div className="invalid-feedback">{errors.videoUrl}</div>}
            <small className="form-text text-muted">
              ตัวอย่างลิงก์ที่ถูกต้อง: https://www.youtube.com/watch?v=abcdefghijk หรือ https://youtu.be/abcdefghijk
            </small>
          </div>
          
          {/* แสดงตัวอย่างวิดีโอ */}
          {courseData.videoUrl && !errors.videoUrl && (
            <div className="video-preview mb-4">
              <h6>ตัวอย่างวิดีโอ:</h6>
              <div className="ratio ratio-16x9">
                <iframe
                  src={`https://www.youtube.com/embed/${courseData.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
          
          {/* เกียรติบัตร */}
          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="hasCertificate"
              name="hasCertificate"
              checked={courseData.hasCertificate}
              onChange={handleCheckboxChange}
            />
            <label className="form-check-label" htmlFor="hasCertificate">
              มีเกียรติบัตรเมื่อเรียนจบหลักสูตร
            </label>
          </div>
          
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            เกียรติบัตรจะออกให้ผู้เรียนโดยอัตโนมัติเมื่อเรียนจบทุกรายวิชาในหลักสูตรและผ่านเกณฑ์การประเมิน
          </div>
        </div>
      </div>
      
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
      {showSubjectModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">เลือกรายวิชา</h5>
                <button type="button" className="btn-close" onClick={() => setShowSubjectModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ค้นหารายวิชา..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="subject-list">
                  {isLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">กำลังโหลดข้อมูล...</p>
                    </div>
                  ) : filteredSubjects.length > 0 ? (
                    <div className="row g-3">
                      {filteredSubjects.map((subject) => (
                        <div key={subject.id} className="col-md-6">
                          <div className="card h-100">
                            <div className="row g-0">
                              <div className="col-4">
                                <img 
                                  src={subject.coverImage} 
                                  alt={subject.title} 
                                  className="img-fluid rounded-start"
                                  style={{ height: '100%', objectFit: 'cover' }}
                                  onError={(e) => {
                                    // ถ้าโหลดรูปไม่สำเร็จ ใช้รูปเริ่มต้น
                                    (e.target as HTMLImageElement).src = "/assets/img/courses/course_thumb01.jpg";
                                  }}
                                />
                              </div>
                              <div className="col-8">
                                <div className="card-body">
                                  <h6 className="card-title">{subject.title}</h6>
                                  <p className="card-text small text-muted mb-1">ผู้สอน: {subject.instructor}</p>
                                  <p className="card-text small mb-2">{subject.description.substring(0, 60)}...</p>
                                  <button
                                    type="button"
                                    className={`btn btn-sm ${courseData.subjects.includes(subject.id) ? 'btn-success disabled' : 'btn-outline-primary'}`}
                                    onClick={() => handleAddSubject(subject.id)}
                                    disabled={courseData.subjects.includes(subject.id)}
                                  >
                                    {courseData.subjects.includes(subject.id) ? (
                                      <>
                                        <i className="fas fa-check me-1"></i>เพิ่มแล้ว
                                      </>
                                    ) : (
                                      <>
                                        <i className="fas fa-plus me-1"></i>เพิ่มรายวิชา
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">ไม่พบรายวิชาที่ตรงกับคำค้นหา</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSubjectModal(false)}>
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal กำหนดวิชาก่อนหน้า */}
      {showPrerequisiteModal && selectedSubjectForPrereq && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  กำหนดวิชาก่อนหน้าสำหรับ: {availableSubjects.find(s => s.id === selectedSubjectForPrereq)?.title}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowPrerequisiteModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  เลือกรายวิชาที่ผู้เรียนต้องเรียนให้ผ่านก่อนที่จะสามารถเรียนวิชานี้ได้
                </div>
                
                <div className="subject-list mt-3">
                  {selectedSubjectsDetails
                    .filter(subject => subject.id !== selectedSubjectForPrereq)
                    .map((subject) => {
                      const isPrerequisite = courseData.prerequisites.some(
                        p => p.subjectId === selectedSubjectForPrereq && p.prerequisiteId === subject.id
                      );
                      
                      return (
                        <div key={subject.id} className="card mb-2">
                          <div className="card-body d-flex justify-content-between align-items-center py-2">
                            <div className="d-flex align-items-center">
                              <img
                                src={subject.coverImage}
                                alt={subject.title}
                                className="img-thumbnail me-3"
                                style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                onError={(e) => {
                                  // ถ้าโหลดรูปไม่สำเร็จ ใช้รูปเริ่มต้น
                                  (e.target as HTMLImageElement).src = "/assets/img/courses/course_thumb01.jpg";
                                }}
                              />
                              <div>
                                <h6 className="mb-0">{subject.title}</h6>
                                <p className="mb-0 small text-muted">ผู้สอน: {subject.instructor}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              className={`btn btn-sm ${isPrerequisite ? 'btn-success' : 'btn-outline-primary'}`}
                              onClick={() => {
                                if (isPrerequisite) {
                                  handleRemovePrerequisite(selectedSubjectForPrereq, subject.id);
                                } else {
                                  handleAddPrerequisite(subject.id);
                                }
                              }}
                            >
                              {isPrerequisite ? (
                                <>
                                  <i className="fas fa-check me-1"></i>เลือกแล้ว
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-plus me-1"></i>เลือกเป็นวิชาก่อนหน้า
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    
                  {selectedSubjectsDetails.filter(subject => subject.id !== selectedSubjectForPrereq).length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-muted">ไม่มีรายวิชาอื่นในหลักสูตรที่สามารถกำหนดเป็นวิชาก่อนหน้าได้</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={() => setShowPrerequisiteModal(false)}>
                  เสร็จสิ้น
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default AddCourses;


