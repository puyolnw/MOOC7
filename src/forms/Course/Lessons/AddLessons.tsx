import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import AddQuizzes from "../Quizzes/AddQuizzes";
import LessonInfoSection from "./LessonInfoSection";
import LessonContentSection from "./LessonContentSection";
import SubjectSelectionSection from "./SubjectSelectionSection";
import QuizSection from "./QuizSection";

// ข้อมูลบทเรียน
interface LessonData {
    title: string;
    description: string;
    files: File[];
    videoUrl: string;
    canPreview: boolean;
    hasQuiz: boolean;
    quizId: string | null;
    subjects: string[]; // หรือ number[] ถ้า subjectId เป็นตัวเลข
    status?: string; // เพิ่มฟิลด์ status
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
  lessonToEdit?: any;
}

const AddLessons: React.FC<AddLessonsProps> = ({ onSubmit, onCancel, lessonToEdit }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>("");
  const [apiSuccess, setApiSuccess] = useState<string>("");
  
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  
  const [lessonData, setLessonData] = useState<LessonData>({
    title: "",
    description: "",
    files: [],
    videoUrl: "",
    canPreview: false,
    hasQuiz: false,
    quizId: null,
    subjects: [],
    status: "active" // เพิ่มค่าเริ่มต้นเป็น active
  });
  
  const [errors, setErrors] = useState({
    title: "",
    content: "",
    videoUrl: "",
    files: "",
    quiz: ""
  });
  
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<any[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);
  
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);

  
  const [subjectSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
          return;
        }
        
        // เรียกใช้ endpoint ที่มีอยู่จริงในระบบ
        try {
          const subjectsResponse = await axios.get(`${apiUrl}/api/courses/lessons/subjects/all`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (subjectsResponse.data.success) {
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
        } catch (error) {
          console.error("Error fetching subjects:", error);
          // ถ้า endpoint แรกไม่ทำงาน ให้ลองใช้ endpoint สำรอง
          try {
            const fallbackResponse = await axios.get(`${apiUrl}/api/courses/subjects/available`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            if (fallbackResponse.data.success) {
              const subjects = fallbackResponse.data.subjects.map((subject: any) => ({
                id: subject.subject_id,
                title: subject.subject_name || subject.title,
                category: subject.department || "ไม่ระบุ",
                credits: subject.credits || 0,
                subject_id: subject.subject_id,
                subject_name: subject.subject_name || subject.title,
                subject_code: subject.subject_code,
                department: subject.department
              }));
              setAvailableSubjects(subjects);
            }
          } catch (fallbackError) {
            console.error("Error fetching subjects from fallback endpoint:", fallbackError);
          }
        }
        
        // ทำแบบเดียวกันกับ quizzes
        try {
          const quizzesResponse = await axios.get(`${apiUrl}/api/courses/lessons/quizzes/all`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (quizzesResponse.data.success) {
            const quizzes = quizzesResponse.data.quizzes.map((quiz: any) => ({
              id: quiz.quiz_id,
              title: quiz.title,
              description: quiz.description,
              questions: quiz.question_count,
              type: quiz.type
            }));
            setAvailableQuizzes(quizzes);
          }
        } catch (error) {
          console.error("Error fetching quizzes:", error);
          // ถ้า endpoint แรกไม่ทำงาน ให้ลองใช้ endpoint สำรอง
          try {
            const fallbackResponse = await axios.get(`${apiUrl}/api/courses/quizzes`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            if (fallbackResponse.data.success) {
              const quizzes = fallbackResponse.data.quizzes.map((quiz: any) => ({
                id: quiz.quiz_id,
                title: quiz.title,
                description: quiz.description,
                questions: quiz.question_count || 0,
                type: quiz.type || "general"
              }));
              setAvailableQuizzes(quizzes);
            }
          } catch (fallbackError) {
            console.error("Error fetching quizzes from fallback endpoint:", fallbackError);
          }
        }
        
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
        
        if (lesson.quiz) {
          setSelectedQuiz({
            id: lesson.quiz.quiz_id,
            title: lesson.quiz.title,
            questions: lesson.quiz.questions,
            description: lesson.quiz.description,
            type: lesson.quiz.type
          });
        }
        
        if (lesson.files && lesson.files.length > 0) {
          setExistingFiles(lesson.files);
        }
        
        setLessonData({
          title: lesson.title || "",
          description: lesson.description || "",
          files: [],
          videoUrl: lesson.video_url || "",
          canPreview: lesson.can_preview || false,
          hasQuiz: lesson.has_quiz || false,
          quizId: lesson.quiz_id || null,
          subjects: lesson.subjects ? lesson.subjects.map((s: any) => s.subject_id) : [],
          status: lesson.status || "active" // เพิ่มการโหลดค่า status
        });
      }
    } catch (error) {
      console.error("Error loading lesson data:", error);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลบทเรียน");
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLessonData({
      ...lessonData,
      [name]: value
    });
    
    if (name === "title" || name === "videoUrl") {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
    
    if (name === "videoUrl" && value) {
      validateYoutubeUrl(value);
    }
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (name === "hasQuiz" && !checked) {
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
  
  const validateYoutubeUrl = (url: string) => {
    if (url === "") {
      setErrors({
        ...errors,
        videoUrl: ""
      });
      return;
    }
    
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
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    if (uploadedFiles.length + existingFiles.length - filesToRemove.length + files.length > 2) {
      setErrors({
        ...errors,
        files: "สามารถอัปโหลดไฟล์ได้สูงสุด 2 ไฟล์"
      });
      return;
    }
    
    const newFiles: File[] = [];
    let hasError = false;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > 2 * 1024 * 1024) {
        setErrors({
          ...errors,
          files: "ขนาดไฟล์ต้องไม่เกิน 2 MB"
        });
        hasError = true;
        break;
      }
      
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
        content: ""
      });
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleRemoveFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    setLessonData({
      ...lessonData,
      files: newFiles
    });
  };
  
  const handleRemoveExistingFile = (fileId: string) => {
    setFilesToRemove([...filesToRemove, fileId]);
    setExistingFiles(existingFiles.filter(file => file.file_id !== fileId));
  };
  
  const handleSelectQuiz = (quizId: string) => {
    // Find the quiz object using the quizId
    const quiz = availableQuizzes.find(q => q.id === quizId);
    
    if (quiz) {
      setSelectedQuiz(quiz);
      setLessonData({
        ...lessonData,
        quizId: quiz.id
      });
      setShowQuizModal(false);
      
      setErrors({
        ...errors,
        quiz: ""
      });
    }
  };
  
  const handleToggleSubject = (subjectId: string) => {
    if (lessonData.subjects.includes(subjectId)) {
      setLessonData({
        ...lessonData,
        subjects: lessonData.subjects.filter(id => id !== subjectId)
      });
    } else {
      setLessonData({
        ...lessonData,
        subjects: [...lessonData.subjects, subjectId]
      });
    }
  };
  
  const filteredSubjects = availableSubjects.filter(subject => 
    subject.title?.toLowerCase().includes(subjectSearchTerm.toLowerCase()) || 
    (subject.category && typeof subject.category === 'string' && subject.category.toLowerCase().includes(subjectSearchTerm.toLowerCase())) ||
    (subject.subject_code && subject.subject_code.toLowerCase().includes(subjectSearchTerm.toLowerCase()))
    
  );
  console.log(filteredSubjects);
  
  const filteredQuizzes = availableQuizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: "",
      content: "",
      videoUrl: "",
      files: "",
      quiz: ""
    };
    
    if (lessonData.title.trim() === "") {
      newErrors.title = "กรุณาระบุชื่อบทเรียน";
      isValid = false;
    }
    
    if (lessonData.videoUrl === "" && uploadedFiles.length === 0 && existingFiles.length - filesToRemove.length === 0) {
      newErrors.content = "กรุณาเพิ่มวิดีโอหรืออัปโหลดไฟล์อย่างน้อย 1 รายการ";
      isValid = false;
    }
    
    if (lessonData.videoUrl !== "") {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?!.*&list=.*)(?!.*&index=.*)/;
      if (!youtubeRegex.test(lessonData.videoUrl)) {
        newErrors.videoUrl = "URL วิดีโอไม่ถูกต้อง ต้องเป็น URL ของ YouTube ที่มีรูปแบบถูกต้อง";
        isValid = false;
      }
    }
    
    if (lessonData.hasQuiz && !lessonData.quizId) {
      newErrors.quiz = "กรุณาเลือกแบบทดสอบ";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
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
        
        const formData = new FormData();
        formData.append("title", lessonData.title);
        formData.append("description", lessonData.description);
        formData.append("videoUrl", lessonData.videoUrl);
        formData.append("status", lessonData.status || "active"); // เพิ่ม status
        
        if (lessonData.hasQuiz && lessonData.quizId) {
          formData.append("quizId", lessonData.quizId);
        }
        
        // แปลงรูปแบบการส่ง subjects ให้ตรงกับที่ backend ต้องการ
        if (lessonData.subjects && lessonData.subjects.length > 0) {
          lessonData.subjects.forEach(subjectId => {
            formData.append("subjects[]", subjectId);
          });
        }
        
        // ไม่ส่งไฟล์ไปยัง backend
        // uploadedFiles.forEach(file => {
        //   formData.append("files", file);
        // });
        
        // ถ้ามีไฟล์ที่ต้องการลบ ให้ส่งเฉพาะ ID ไป
        if (filesToRemove.length > 0) {
          filesToRemove.forEach(fileId => {
            formData.append("filesToRemove[]", fileId);
          });
        }
        
        let response;
        
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
          response = await axios.post(`${apiUrl}/api/courses/lessons`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              "Authorization": `Bearer ${token}`
            }
          });
          
          setApiSuccess("สร้างบทเรียนสำเร็จ");
          toast.success("สร้างบทเรียนสำเร็จ");
        }
        
        if (onSubmit) {
          onSubmit(response.data.lesson);
        } else {
          setLessonData({
            title: "",
            description: "",
            files: [],
            videoUrl: "",
            canPreview: false,
            hasQuiz: false,
            quizId: null,
            subjects: [],
            status: "active"
          });
          setUploadedFiles([]);
          setExistingFiles([]);
          setFilesToRemove([]);
          setSelectedQuiz(null);
        }
      } catch (error) {
        console.error("Error submitting lesson:", error);
        
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
  
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };
  
  const handleCreateQuiz = (quizData: any) => {
    if (quizData && quizData.id) {
      const newQuiz: Quiz = {
        id: quizData.id,
        title: quizData.title,
        questions: quizData.questions?.length || 0,
        description: quizData.description,
        type: quizData.type || "general"
      };
      
      setAvailableQuizzes([...availableQuizzes, newQuiz]);
      
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
          <LessonInfoSection
            lessonData={lessonData}
            errors={errors}
            handleInputChange={handleInputChange}
            handleCheckboxChange={handleCheckboxChange}
          />
          
          {/* เพิ่มส่วนเลือกสถานะ */}
          
          
          <LessonContentSection
            lessonData={lessonData}
            errors={errors}
            handleInputChange={handleInputChange}
            handleFileUpload={handleFileUpload}
            handleRemoveFile={handleRemoveFile}
            handleRemoveExistingFile={handleRemoveExistingFile}
            uploadedFiles={uploadedFiles}
            existingFiles={existingFiles}
            filesToRemove={filesToRemove}
            fileInputRef={fileInputRef}
          />
          
          <SubjectSelectionSection
  lessonData={lessonData}
  availableSubjects={availableSubjects}
  handleToggleSubject={handleToggleSubject}
/>
          
          <QuizSection
            lessonData={lessonData}
            errors={errors}
            selectedQuiz={selectedQuiz}
            handleCheckboxChange={handleCheckboxChange}
            handleSelectQuiz={handleSelectQuiz}
            setShowQuizModal={setShowQuizModal}
            showQuizModal={showQuizModal}
            setShowCreateQuizModal={setShowCreateQuizModal}
            filteredQuizzes={filteredQuizzes}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
          
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
    </form>
  );
};

export default AddLessons;

