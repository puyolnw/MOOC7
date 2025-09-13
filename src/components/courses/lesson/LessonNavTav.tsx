import { useState, useEffect } from "react";
import axios from "axios";
import Overview from "../course-details/Overview";
import Instructors from "../course-details/Instructors";
import "./LessonNavTav.css";

const tab_title: string[] = ["ข้อมูลทั่วไป", "ผู้สอน", "ไฟล์ประกอบ"];

interface LessonNavTavProps {
  description: string;
  instructors: Array<{
    instructor_id: number;
    name: string;
    position: string;
    avatar?: string;
    bio?: string;
  }>;
  currentLessonId?: number;
  currentBigLessonId?: number;
}

interface Attachment {
  attachment_id: number;
  title: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  file_id: string;
  created_at?: string;
  updated_at?: string;
  upload_at?: string;
  update_at?: string;
}

const LessonAttachments = ({ currentLessonId, currentBigLessonId }: { currentLessonId?: number; currentBigLessonId?: number }) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLessonAttachments = async (lessonId?: number) => {
    if (!lessonId) return [];
            // console.log("📎 Fetching lesson attachments for lessonId:", lessonId);
    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const response = await axios.get(
        `${apiURL}/api/learn/lessons/${lessonId}/attachments`
      );
              // console.log("📎 Lesson attachments response:", response.data);
      if (response.data.success) {
        // Normalize field names for consistency
        return (response.data.attachments || []).map((a: any) => ({
          ...a,
          created_at: a.upload_at || a.created_at,
          updated_at: a.update_at || a.updated_at,
        }));
      }
      return [];
    } catch (error) {
      console.error("❌ Error fetching lesson attachments:", error);
      return [];
    }
  };

  const fetchBigLessonAttachments = async (bigLessonId?: number) => {
    if (!bigLessonId) return [];
            // console.log("📎 Fetching big lesson attachments for bigLessonId:", bigLessonId);
    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const response = await axios.get(
        `${apiURL}/api/big-lessons/${bigLessonId}/attachments`
      );
              // console.log("📎 Big lesson attachments response:", response.data);
      if (response.data.success) {
        return response.data.attachments || [];
      }
      return [];
    } catch (error) {
      console.error("❌ Error fetching big lesson attachments:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
              // console.log("📎 Fetching all attachments for lessonId:", currentLessonId, "bigLessonId:", currentBigLessonId);
      setLoading(true);
      const [lessonFiles, bigLessonFiles] = await Promise.all([
        fetchLessonAttachments(currentLessonId),
        fetchBigLessonAttachments(currentBigLessonId),
      ]);
      // รวมไฟล์และ sort ตามวันที่ใหม่สุดก่อน
      const allFiles = [...lessonFiles, ...bigLessonFiles].sort((a, b) => {
        const dateA = new Date(a.created_at || a.upload_at || 0).getTime();
        const dateB = new Date(b.created_at || b.upload_at || 0).getTime();
        return dateB - dateA;
      });
              // console.log("📎 Final attachments:", allFiles);
      setAttachments(allFiles);
      setLoading(false);
    };
    fetchAll();
  }, [currentLessonId, currentBigLessonId]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return 'fa-file-pdf text-danger';
    if (fileType.includes('word') || fileType.includes('document')) return 'fa-file-word text-primary';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'fa-file-excel text-success';
    if (fileType.includes('text')) return 'fa-file-alt text-secondary';
    return 'fa-file text-muted';
  };

  if (loading) {
    return (
      <div className="attachments-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>กำลังโหลดไฟล์ประกอบ...</p>
      </div>
    );
  }

  if (attachments.length === 0) {
    return (
      <div className="attachments-empty">
        <i className="fas fa-folder-open"></i>
        <p>ยังไม่มีไฟล์ประกอบในบทเรียนนี้</p>
      </div>
    );
  }

  return (
    <div className="lesson-attachments-container">
      <div className="lesson-attachments-header">
        <h4>ไฟล์ประกอบบทเรียน</h4>
        <p>ไฟล์ที่เกี่ยวข้องกับบทเรียนปัจจุบัน</p>
      </div>
      <div className="lesson-attachments-list">
        {attachments.map((attachment) => (
          <div key={attachment.attachment_id} className="lesson-attachment-item">
            <div className="lesson-attachment-info">
              <div className="lesson-attachment-icon">
                <i className={`fas ${getFileIcon(attachment.file_type)}`}></i>
              </div>
              <div className="lesson-attachment-details">
                <h6 className="lesson-attachment-name">{attachment.title || attachment.file_name}</h6>
                <p className="lesson-attachment-meta">
                  {formatFileSize(attachment.file_size)} • 
                  {attachment.created_at ? new Date(attachment.created_at).toLocaleDateString('th-TH') : ''}
                </p>
              </div>
            </div>
            <div className="lesson-attachment-actions">
              <a 
                href={attachment.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="lesson-attachment-button"
                title="ดูไฟล์"
              >
                <i className="fas fa-external-link-alt"></i>
                ดูไฟล์
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LessonNavTav = ({ description, instructors, currentLessonId, currentBigLessonId }: LessonNavTavProps) => {
   const [activeTab, setActiveTab] = useState(0);
   
           // console.log("🎓 LessonNavTav received instructors:", instructors);

   const handleTabClick = (index: number) => {
      setActiveTab(index);
   };

   return (
      <div className="lesson-nav-tab-container">
         <div className="lesson-nav-tab-header">
            {tab_title.map((tab, index) => (
               <button 
                  key={index}
                  onClick={() => handleTabClick(index)} 
                  className={`lesson-nav-tab-button ${activeTab === index ? "lesson-nav-tab-active" : ""}`}
               >
                  {tab}
               </button>
            ))}
         </div>
         <div className="lesson-nav-tab-content">
            <div className={`lesson-nav-tab-panel ${activeTab === 0 ? 'lesson-nav-tab-show' : ''}`}>
               <Overview description={description} />
            </div>
            <div className={`lesson-nav-tab-panel ${activeTab === 1 ? 'lesson-nav-tab-show' : ''}`}>
               <Instructors instructors={instructors} />
            </div>
            <div className={`lesson-nav-tab-panel ${activeTab === 2 ? 'lesson-nav-tab-show' : ''}`}>
                <LessonAttachments currentLessonId={currentLessonId} currentBigLessonId={currentBigLessonId} />
            </div>
         </div>
      </div>
   )
}

export default LessonNavTav
