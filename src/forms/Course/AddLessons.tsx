import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import AddQuizzes from "./AddQuizzes";

// ข้อมูลบทเรียน
interface LessonData {
  title: string;
  description: string;
  files: File[];
  videoUrl: string;
  canPreview: boolean;
  hasQuiz: boolean;
  quizId: string | null;
  subjects: string[]; // เพิ่มฟิลด์สำหรับเก็บรายการวิชาที่เลือก
}

// ข้อมูลแบบทดสอบ
interface Quiz {
  id: string;
  title: string;
  questions: number;
  description?: string;
  type?: string;
}

// ข้อมูลวิชา
interface Subject {
  id: string;
  title: string;
  category: string;
  credits: number;
  subject_id?: string;
  subject_name?: string;
  subject_code?: string;
  department?: string;
}

interface AddLessonsProps {
  onSubmit?: (lessonData: any) => void;
  onCancel?: () => void;
  lessonToEdit?: any; // เพิ่ม prop สำหรับการแก้ไขบทเรียน
}

const AddLessons: React.FC<AddLessonsProps> = ({ onSubmit, onCancel, lessonToEdit }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  
  // สถานะสำหรับการโหลดข้อมูล
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>("");
  const [apiSuccess, setApiSuccess] = useState<string>("");
  
  // สถานะสำหรับข้อมูลวิชาและแบบทดสอบ
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  
  // สถานะสำหรับข้อมูลบทเรียน
  const [lessonData, setLessonData] = useState<LessonData>({
    title: "",
    description: "",
    files: [],
    videoUrl: "",
    canPreview: false,
    hasQuiz: false,
    quizId: null,
    subjects: [] // เริ่มต้นด้วยอาร์เรย์ว่าง
  });
  
  // สถานะสำหรับการตรวจสอบความถูกต้อง
  const [errors, setErrors] = useState({
    title: "",
    content: "",
    videoUrl: "",
    files: "",
    quiz: ""
  });
  
  // สถานะสำหรับการแสดงไฟล์ที่อัปโหลด
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<any[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);
  
  // สถานะสำหรับการแสดง Modal เลือกแบบทดสอบ
  const [showQuizModal, setShowQuizModal] = useState(false);
  
  // สถานะสำหรับการแสดง Modal สร้างแบบทดสอบ
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  
  // สถานะสำหรับการแสดง Modal เลือกวิชา
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  
  // สถานะสำหรับการค้นหาวิชา
  const [subjectSearchTerm, setSubjectSearchTerm] = useState("");
  
  // สถานะสำหรับการค้นหาแบบทดสอบ
  const [searchTerm, setSearchTerm] = useState("");
  
  // สถานะสำหรับแบบทดสอบที่เลือก
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  
  // โหลดข้อมูลวิชาและแบบทดสอบเมื่อคอมโพเนนต์ถูกโหลด
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
          return;
        }
        
        // โหลดข้อมูลวิชา
        const subjectsResponse = await axios.get(`${apiUrl}/api/courses/lessons/subjects/all`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (subjectsResponse.data.success) {
          // แปลงข้อมูลให้ตรงกับ interface
          const subjects = subjectsResponse.data.subjects.map((subject: any) => ({
            id: subject.subject_id,
            title: subject.subject_name,
            category: subject.department || "ไม่ระบุ",
            credits: subject.credits || 0,
            subject_id: subject.subject_id,
            subject_name: subject.subject_name,
            subject_code: subject.subject_code,
            department: subject.department
          }));
          setAvailableSubjects(subjects);
        }
        
        // โหลดข้อมูลแบบทดสอบ
        const quizzesResponse = await axios.get(`${apiUrl}/api/courses/lessons/quizzes/all`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (quizzesResponse.data.success) {
          // แปลงข้อมูลให้ตรงกับ interface
          const quizzes = quizzesResponse.data.quizzes.map((quiz: any) => ({
            id: quiz.quiz_id,
            title: quiz.title,
            description: quiz.description,
            questions: quiz.question_count,
            type: quiz.type
          }));
          setAvailableQuizzes(quizzes);
        }
        
        // ถ้ามีข้อมูลบทเรียนที่ต้องการแก้ไข
        if (lessonToEdit) {
          loadLessonData(lessonToEdit);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [apiUrl, lessonToEdit]);
  
  // โหลดข้อมูลบทเรียนที่ต้องการแก้ไข
  const loadLessonData = async (lessonId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
        return;
      }
      
      const response = await axios.get(`${apiUrl}/api/courses/lessons/${lessonId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        const lesson = response.data.lesson;
        
        // ตั้งค่าข้อมูลแบบทดสอบที่เลือก (ถ้ามี)
        if (lesson.quiz) {
          setSelectedQuiz({
            id: lesson.quiz.quiz_id,
            title: lesson.quiz.title,
            questions: lesson.quiz.questions,
            description: lesson.quiz.description,
            type: lesson.quiz.type
          });
        }
        
        // ตั้งค่าไฟล์ที่มีอยู่
        if (lesson.files && lesson.files.length > 0) {
          setExistingFiles(lesson.files);
        }
        
        // ตั้งค่าข้อมูลบทเรียน
        setLessonData({
          title: lesson.title || "",
          description: lesson.description || "",
          files: [],
          videoUrl: lesson.video_url || "",
          canPreview: lesson.can_preview || false,
          hasQuiz: lesson.quiz_id ? true : false,
          quizId: lesson.quiz_id || null,
          subjects: lesson.subjects ? lesson.subjects.map((s: any) => s.subject_id) : []
        });
      }
    } catch (error) {
      console.error("Error loading lesson data:", error);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลบทเรียน");
    }
  };
  
  // เปลี่ยนแปลงข้อมูลบทเรียน
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLessonData({
      ...lessonData,
      [name]: value
    });
    
    // ล้างข้อผิดพลาด
    if (name === "title" || name === "videoUrl") {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
    
    // ตรวจสอบ URL วิดีโอ
    if (name === "videoUrl" && value) {
      validateYoutubeUrl(value);
    }
  };
  
  // เปลี่ยนแปลงการตั้งค่า
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (name === "hasQuiz" && !checked) {
      // ถ้ายกเลิกการมีแบบทดสอบ ให้ล้างข้อมูลแบบทดสอบที่เลือกไว้
      setLessonData({
        ...lessonData,
        hasQuiz: checked,
        quizId: null
      });
      setSelectedQuiz(null);
    } else {
      setLessonData({
        ...lessonData,
        [name]: checked
      });
    }
  };
  
  // ตรวจสอบ URL วิดีโอ YouTube
  const validateYoutubeUrl = (url: string) => {
    if (url === "") {
      setErrors({
        ...errors,
        videoUrl: ""
      });
      return;
    }
    
    // ตรวจสอบรูปแบบ URL ของ YouTube
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?!.*&list=.*)(?!.*&index=.*)/;
    const match = url.match(youtubeRegex);
    
    if (!match) {
      setErrors({
        ...errors,
        videoUrl: "URL วิดีโอไม่ถูกต้อง ต้องเป็น URL ของ YouTube ที่มีรูปแบบถูกต้อง (ไม่มีพารามิเตอร์ list หรือ index)"
      });
    } else {
      setErrors({
        ...errors,
        videoUrl: ""
      });
    }
  };
  
  // อัปโหลดไฟล์
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // ตรวจสอบจำนวนไฟล์
    if (uploadedFiles.length + existingFiles.length - filesToRemove.length + files.length > 2) {
      setErrors({
        ...errors,
        files: "สามารถอัปโหลดไฟล์ได้สูงสุด 2 ไฟล์"
      });
      return;
    }
    
    // ตรวจสอบขนาดและประเภทไฟล์
    const newFiles: File[] = [];
    let hasError = false;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // ตรวจสอบขนาดไฟล์ (2 MB = 2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        setErrors({
          ...errors,
          files: "ขนาดไฟล์ต้องไม่เกิน 2 MB"
        });
        hasError = true;
        break;
      }
      
      // ตรวจสอบประเภทไฟล์
      const fileType = file.name.split('.').pop()?.toLowerCase();
      if (fileType !== 'pdf' && fileType !== 'txt') {
        setErrors({
          ...errors,
          files: "รองรับเฉพาะไฟล์ PDF และ TXT เท่านั้น"
        });
        hasError = true;
        break;
      }
      
      newFiles.push(file);
    }
    
    if (!hasError) {
      setUploadedFiles([...uploadedFiles, ...newFiles]);
      setLessonData({
        ...lessonData,
        files: [...uploadedFiles, ...newFiles]
      });
      setErrors({
        ...errors,
        files: "",
        content: "" // ล้างข้อผิดพลาดเกี่ยวกับเนื้อหา
      });
    }
    
    // รีเซ็ต input file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  // ลบไฟล์ที่อัปโหลด
  const handleRemoveFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    setLessonData({
      ...lessonData,
      files: newFiles
    });
  };
  
  // ลบไฟล์ที่มีอยู่แล้ว
  const handleRemoveExistingFile = (fileId: string) => {
    setFilesToRemove([...filesToRemove, fileId]);
    setExistingFiles(existingFiles.filter(file => file.file_id !== fileId));
  };
  
  // เลือกแบบทดสอบ
  const handleSelectQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setLessonData({
      ...lessonData,
      quizId: quiz.id
    });
    setShowQuizModal(false);
    
    // ล้างข้อผิดพลาด
    setErrors({
      ...errors,
      quiz: ""
    });
  };
  
  // เลือกหรือยกเลิกการเลือกวิชา
  const handleToggleSubject = (subjectId: string) => {
    if (lessonData.subjects.includes(subjectId)) {
      // ถ้ามีอยู่แล้ว ให้ลบออก
      setLessonData({
        ...lessonData,
        subjects: lessonData.subjects.filter(id => id !== subjectId)
      });
    } else {
      // ถ้ายังไม่มี ให้เพิ่มเข้าไป
      setLessonData({
        ...lessonData,
        subjects: [...lessonData.subjects, subjectId]
      });
    }
  };
  
  // กรองวิชาตามคำค้นหา
  const filteredSubjects = availableSubjects.filter(subject => 
    subject.title.toLowerCase().includes(subjectSearchTerm.toLowerCase()) ||
    subject.category.toLowerCase().includes(subjectSearchTerm.toLowerCase()) ||
    (subject.subject_code && subject.subject_code.toLowerCase().includes(subjectSearchTerm.toLowerCase()))
  );
  
  // กรองแบบทดสอบตามคำค้นหา
  const filteredQuizzes = availableQuizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // ตรวจสอบความถูกต้องของข้อมูล
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: "",
      content: "",
      videoUrl: "",
      files: "",
      quiz: ""
    };
    
    // ตรวจสอบชื่อบทเรียน
    if (lessonData.title.trim() === "") {
      newErrors.title = "กรุณาระบุชื่อบทเรียน";
      isValid = false;
    }
    
    // ตรวจสอบเนื้อหา (ต้องมีอย่างน้อยวิดีโอหรือไฟล์)
    if (lessonData.videoUrl === "" && uploadedFiles.length === 0 && existingFiles.length - filesToRemove.length === 0) {
      newErrors.content = "กรุณาเพิ่มวิดีโอหรืออัปโหลดไฟล์อย่างน้อย 1 รายการ";
      isValid = false;
    }
    
    // ตรวจสอบ URL วิดีโอ
    if (lessonData.videoUrl !== "") {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?!.*&list=.*)(?!.*&index=.*)/;
      if (!youtubeRegex.test(lessonData.videoUrl)) {
        newErrors.videoUrl = "URL วิดีโอไม่ถูกต้อง ต้องเป็น URL ของ YouTube ที่มีรูปแบบถูกต้อง";
        isValid = false;
      }
    }
    
    // ตรวจสอบแบบทดสอบ
    if (lessonData.hasQuiz && !lessonData.quizId) {
      newErrors.quiz = "กรุณาเลือกแบบทดสอบ";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // บันทึกข้อมูล
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setApiError("");
      setApiSuccess("");
      
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setApiError("กรุณาเข้าสู่ระบบก่อนใช้งาน");
          setIsSubmitting(false);
          return;
        }
        
        // สร้าง FormData สำหรับส่งไฟล์
        const formData = new FormData();
        formData.append("title", lessonData.title);
        formData.append("description", lessonData.description);
        formData.append("videoUrl", lessonData.videoUrl);
        formData.append("canPreview", lessonData.canPreview.toString());
        formData.append("hasQuiz", lessonData.hasQuiz.toString());
        
        if (lessonData.hasQuiz && lessonData.quizId) {
          formData.append("quizId", lessonData.quizId);
        }
        
        // เพิ่มรายการวิชา
        lessonData.subjects.forEach(subjectId => {
          formData.append("subjects[]", subjectId);
        });
        
        // เพิ่มไฟล์ที่อัปโหลด
        uploadedFiles.forEach(file => {
          formData.append("files", file);
        });
        
        // เพิ่มรายการไฟล์ที่ต้องการลบ (กรณีแก้ไข)
        if (filesToRemove.length > 0) {
          filesToRemove.forEach(fileId => {
            formData.append("filesToRemove[]", fileId);
          });
        }
        
        let response;
        
        // ถ้ามีการแก้ไขบทเรียน
        if (lessonToEdit) {
          response = await axios.put(`${apiUrl}/api/courses/lessons/${lessonToEdit}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              "Authorization": `Bearer ${token}`
            }
          });
          
          setApiSuccess("แก้ไขบทเรียนสำเร็จ");
          toast.success("แก้ไขบทเรียนสำเร็จ");
        } else {
          // สร้างบทเรียนใหม่
          response = await axios.post(`${apiUrl}/api/courses/lessons`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              "Authorization": `Bearer ${token}`
            }
          });
          
          setApiSuccess("สร้างบทเรียนสำเร็จ");
          toast.success("สร้างบทเรียนสำเร็จ");
        }
        
        // ถ้ามีการส่ง onSubmit props มา ให้เรียกใช้ฟังก์ชันนั้น
        if (onSubmit) {
          onSubmit(response.data.lesson);
        } else {
          // รีเซ็ตฟอร์มหลังจากบันทึกสำเร็จ
          setLessonData({
            title: "",
            description: "",
            files: [],
            videoUrl: "",
            canPreview: false,
            hasQuiz: false,
            quizId: null,
            subjects: []
          });
          setUploadedFiles([]);
          setExistingFiles([]);
          setFilesToRemove([]);
          setSelectedQuiz(null);
        }
      } catch (error) {
        console.error("Error submitting lesson:", error);
        
        // จัดการกับข้อผิดพลาดจาก API
        if (axios.isAxiosError(error) && error.response) {
          setApiError(error.response.data.message || "เกิดข้อผิดพลาดในการสร้างบทเรียน");
          toast.error(error.response.data.message || "เกิดข้อผิดพลาดในการสร้างบทเรียน");
        } else {
          setApiError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
          toast.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // ยกเลิก
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };
  
  // จัดการเมื่อสร้างแบบทดสอบใหม่
  const handleCreateQuiz = (quizData: any) => {
    if (quizData && quizData.id) {
      // เพิ่มแบบทดสอบใหม่เข้าไปในรายการ
      const newQuiz: Quiz = {
        id: quizData.id,
        title: quizData.title,
        questions: quizData.questions?.length || 0,
        description: quizData.description,
        type: quizData.type || "general"
      };
      
      setAvailableQuizzes([...availableQuizzes, newQuiz]);
      
      // เลือกแบบทดสอบที่สร้างใหม่
      setSelectedQuiz(newQuiz);
      setLessonData({
        ...lessonData,
        hasQuiz: true,
        quizId: newQuiz.id
      });
    }
    
    setShowCreateQuizModal(false);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* API Status Messages */}
      {apiSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="fas fa-check-circle me-2"></i>
          {apiSuccess}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setApiSuccess("")}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      {apiError && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {apiError}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setApiError("")}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-3">กำลังโหลดข้อมูล...</p>
        </div>
      ) : (
        <>
          {/* ส่วนที่ 1: ข้อมูลบทเรียน */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">1. ข้อมูลบทเรียน</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="title" className="form-label">ชื่อบทเรียน <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  id="title"
                  name="title"
                  value={lessonData.title}
                  onChange={handleInputChange}
                  placeholder="ระบุชื่อบทเรียน"
                />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">คำอธิบายบทเรียน</label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  value={lessonData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="ระบุคำอธิบายเพิ่มเติม (ถ้ามี)"
                ></textarea>
              </div>
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="canPreview"
                  name="canPreview"
                  checked={lessonData.canPreview}
                  onChange={handleCheckboxChange}
                />
                <label className="form-check-label" htmlFor="canPreview">
                  อนุญาตให้ผู้เรียนดูตัวอย่างบทเรียนนี้ได้โดยไม่ต้องลงทะเบียน
                </label>
              </div>
              </div>
          </div>
          
          {/* ส่วนที่ 2: เนื้อหาบทเรียน */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">2. เนื้อหาบทเรียน</h5>
            </div>
            <div className="card-body">
              {errors.content && (
                <div className="alert alert-danger" role="alert">
                  {errors.content}
                </div>
              )}
              
              {/* วิดีโอ */}
              <div className="mb-4">
                <label htmlFor="videoUrl" className="form-label">URL วิดีโอ YouTube</label>
                <input
                  type="text"
                  className={`form-control ${errors.videoUrl ? 'is-invalid' : ''}`}
                  id="videoUrl"
                  name="videoUrl"
                  value={lessonData.videoUrl}
                  onChange={handleInputChange}
                  placeholder="เช่น https://www.youtube.com/watch?v=abcdefghijk"
                />
                {errors.videoUrl && <div className="invalid-feedback">{errors.videoUrl}</div>}
                <small className="text-muted mt-1 d-block">
                  ใส่ URL ของวิดีโอ YouTube ที่ต้องการใช้ในบทเรียน (ถ้ามี)
                </small>
                
                {/* แสดงตัวอย่างวิดีโอ */}
                {lessonData.videoUrl && !errors.videoUrl && (
                  <div className="mt-3">
                    <h6>ตัวอย่างวิดีโอ:</h6>
                    <div className="ratio ratio-16x9">
                      <iframe
                        src={lessonData.videoUrl.replace('watch?v=', 'embed/').split('&')[0]}
                        title="YouTube video"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
              
              {/* อัปโหลดไฟล์ */}
              <div className="mb-3">
                <label className="form-label">ไฟล์ประกอบบทเรียน</label>
                <div className="input-group mb-3">
                  <input
                    type="file"
                    className={`form-control ${errors.files ? 'is-invalid' : ''}`}
                    id="files"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.txt"
                    multiple
                  />
                  <label className="input-group-text" htmlFor="files">อัปโหลด</label>
                  {errors.files && <div className="invalid-feedback">{errors.files}</div>}
                </div>
                <small className="text-muted d-block">
                  รองรับไฟล์ PDF และ TXT ขนาดไม่เกิน 2 MB (สูงสุด 2 ไฟล์)
                </small>
                
                {/* แสดงไฟล์ที่อัปโหลด */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-3">
                    <h6>ไฟล์ที่อัปโหลด:</h6>
                    <ul className="list-group">
                      {uploadedFiles.map((file, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <i className={`fas ${file.name.endsWith('.pdf') ? 'fa-file-pdf' : 'fa-file-alt'} me-2 text-danger`}></i>
                            {file.name} ({(file.size / 1024).toFixed(2)} KB)
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemoveFile(index)}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* แสดงไฟล์ที่มีอยู่แล้ว (กรณีแก้ไข) */}
                {existingFiles.length > 0 && filesToRemove.length < existingFiles.length && (
                  <div className="mt-3">
                    <h6>ไฟล์ที่มีอยู่แล้ว:</h6>
                    <ul className="list-group">
                      {existingFiles.map((file) => {
                        if (filesToRemove.includes(file.file_id)) return null;
                        return (
                          <li key={file.file_id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                              <i className={`fas ${file.file_name.endsWith('.pdf') ? 'fa-file-pdf' : 'fa-file-alt'} me-2 text-danger`}></i>
                              {file.file_name} ({(file.file_size / 1024).toFixed(2)} KB)
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemoveExistingFile(file.file_id)}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* ส่วนที่ 3: เลือกวิชาที่เกี่ยวข้อง */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">3. เลือกวิชาที่เกี่ยวข้อง</h5>
            </div>
            <div className="card-body">
              <p className="text-muted mb-3">
                คุณสามารถเลือกวิชาที่เกี่ยวข้องกับบทเรียนนี้ได้ (ไม่บังคับ) และสามารถเลือกได้มากกว่า 1 วิชา
              </p>
              
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  {lessonData.subjects.length > 0 ? (
                    <span className="badge bg-success rounded-pill">
                      เลือกแล้ว {lessonData.subjects.length} วิชา
                    </span>
                  ) : (
                    <span className="badge bg-secondary rounded-pill">
                      ยังไม่ได้เลือกวิชา
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setShowSubjectModal(true)}
                  disabled={availableSubjects.length === 0}
                >
                  <i className="fas fa-book me-2"></i>เลือกวิชา
                </button>
              </div>
              
              {lessonData.subjects.length > 0 && (
                <div className="selected-subjects">
                  <h6 className="mb-2">วิชาที่เลือก:</h6>
                  <div className="row g-2">
                    {lessonData.subjects.map(subjectId => {
                      const subject = availableSubjects.find(s => s.id === subjectId);
                      return subject ? (
                        <div key={subject.id} className="col-md-6">
                          <div className="card border h-100">
                            <div className="card-body py-2 px-3">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <h6 className="mb-1">{subject.title}</h6>
                                  <p className="mb-0 small text-muted">
                                    {subject.subject_code && `รหัสวิชา: ${subject.subject_code} | `}
                                    ภาควิชา: {subject.category || "ไม่ระบุ"}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-sm text-danger"
                                  onClick={() => handleToggleSubject(subject.id)}
                                >
                                  <i className="fas fa-times-circle"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* ส่วนที่ 4: แบบทดสอบประจำบทเรียน */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">4. แบบทดสอบประจำบทเรียน</h5>
            </div>
            <div className="card-body">
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="hasQuiz"
                  name="hasQuiz"
                  checked={lessonData.hasQuiz}
                  onChange={handleCheckboxChange}
                />
                <label className="form-check-label" htmlFor="hasQuiz">
                  บทเรียนนี้มีแบบทดสอบ
                </label>
              </div>
              
              {lessonData.hasQuiz && (
                <div className="quiz-selection mt-3">
                  {errors.quiz && (
                    <div className="alert alert-danger" role="alert">
                      {errors.quiz}
                    </div>
                  )}
                  
                  {selectedQuiz ? (
                    <div className="selected-quiz">
                      <div className="card border">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{selectedQuiz.title}</h6>
                              <p className="mb-0 small text-muted">
                                จำนวนคำถาม: {selectedQuiz.questions} ข้อ
                                {selectedQuiz.description && ` | ${selectedQuiz.description}`}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm text-danger"
                              onClick={() => {
                                setSelectedQuiz(null);
                                setLessonData({
                                  ...lessonData,
                                  quizId: null
                                });
                              }}
                            >
                              <i className="fas fa-times-circle"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setShowQuizModal(true)}
                      >
                        <i className="fas fa-list-ul me-2"></i>เลือกแบบทดสอบที่มีอยู่
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => setShowCreateQuizModal(true)}
                      >
                        <i className="fas fa-plus-circle me-2"></i>สร้างแบบทดสอบใหม่
                      </button>
                    </div>
                  )}
                </div>
              )}
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
                  <i className="fas fa-save me-2"></i>บันทึกบทเรียน
                </>
              )}
            </button>
          </div>
        </>
      )}
      
      {/* Modal สำหรับเลือกแบบทดสอบ */}
      {showQuizModal && (
        <div className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">เลือกแบบทดสอบ</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowQuizModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* ค้นหาแบบทดสอบ */}
                <div className="mb-3">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ค้นหาแบบทดสอบ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-outline-secondary" type="button">
                      <i className="fas fa-search"></i>
                    </button>
                    </div>
                </div>
                
                {/* รายการแบบทดสอบ */}
                <div className="quiz-list">
                  {filteredQuizzes.length > 0 ? (
                    <div className="list-group">
                      {filteredQuizzes.map((quiz) => (
                        <div
                          key={quiz.id}
                          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                          onClick={() => handleSelectQuiz(quiz)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div>
                            <h6 className="mb-1">{quiz.title}</h6>
                            <p className="mb-0 small text-muted">
                              จำนวนคำถาม: {quiz.questions} ข้อ
                              {quiz.description && ` | ${quiz.description}`}
                            </p>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="selectedQuiz"
                              checked={selectedQuiz?.id === quiz.id}
                              onChange={() => handleSelectQuiz(quiz)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">ไม่พบแบบทดสอบที่ตรงกับคำค้นหา</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowQuizModal(false)}>
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowQuizModal(false)}
                  disabled={!selectedQuiz}
                >
                  เลือกแบบทดสอบนี้
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal สำหรับสร้างแบบทดสอบใหม่ */}
      {showCreateQuizModal && (
        <div className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">สร้างแบบทดสอบใหม่</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateQuizModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <AddQuizzes onSubmit={handleCreateQuiz} onCancel={() => setShowCreateQuizModal(false)} />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal สำหรับเลือกวิชา */}
      {showSubjectModal && (
        <div className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">เลือกวิชาที่เกี่ยวข้อง</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSubjectModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* ค้นหาวิชา */}
                <div className="mb-3">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ค้นหาวิชา..."
                      value={subjectSearchTerm}
                      onChange={(e) => setSubjectSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-outline-secondary" type="button">
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                </div>
                
                {/* รายการวิชา */}
                <div className="list-group">
                  {filteredSubjects.length > 0 ? (
                    filteredSubjects.map((subject) => (
                      <div
                        key={subject.id}
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <h6 className="mb-1">{subject.title}</h6>
                          <p className="mb-0 small text-muted">
                            {subject.subject_code && `รหัสวิชา: ${subject.subject_code} | `}
                            ภาควิชา: {subject.category || "ไม่ระบุ"}
                          </p>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`select-subject-${subject.id}`}
                            checked={lessonData.subjects.includes(subject.id)}
                            onChange={() => handleToggleSubject(subject.id)}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">ไม่พบวิชาที่ตรงกับคำค้นหา</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={() => setShowSubjectModal(false)}>
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

export default AddLessons;
