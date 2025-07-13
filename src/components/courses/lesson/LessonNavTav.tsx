import { useState, useEffect } from "react";
import axios from "axios";
import Overview from "../course-details/Overview";
import Instructors from "../course-details/Instructors";

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
    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${apiURL}/api/learn/lessons/${lessonId}/attachments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
      return [];
    }
  };

  const fetchBigLessonAttachments = async (bigLessonId?: number) => {
    if (!bigLessonId) return [];
    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${apiURL}/api/big-lessons/${bigLessonId}/attachments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        return response.data.attachments || [];
      }
      return [];
    } catch (error) {
      return [];
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
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
    <div className="lesson-attachments">
      <div className="attachments-header">
        <h4>ไฟล์ประกอบบทเรียน</h4>
        <p>ไฟล์ที่เกี่ยวข้องกับบทเรียนปัจจุบัน</p>
      </div>
      <div className="attachments-list">
        {attachments.map((attachment) => (
          <div key={attachment.attachment_id} className="attachment-item">
            <div className="attachment-info">
              <div className="attachment-icon">
                <i className={`fas ${getFileIcon(attachment.file_type)}`}></i>
              </div>
              <div className="attachment-details">
                <h6 className="attachment-name">{attachment.title || attachment.file_name}</h6>
                <p className="attachment-meta">
                  {formatFileSize(attachment.file_size)} • 
                  {attachment.created_at ? new Date(attachment.created_at).toLocaleDateString('th-TH') : ''}
                </p>
              </div>
            </div>
            <div className="attachment-actions">
              <a 
                href={attachment.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-primary"
                title="ดูไฟล์"
              >
                <i className="fas fa-external-link-alt me-1"></i>
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

   const handleTabClick = (index: number) => {
      setActiveTab(index);
   };

   return (
      <div className="courses__details-content lesson__details-content">
         <ul className="nav nav-tabs" id="myTab" role="tablist">
            {tab_title.map((tab, index) => (
               <li key={index} onClick={() => handleTabClick(index)} className="nav-item" role="presentation">
                  <button className={`nav-link ${activeTab === index ? "active" : ""}`}>{tab}</button>
               </li>
            ))}
         </ul>
         <div className="tab-content" id="myTabContent">
            <div className={`tab-pane fade ${activeTab === 0 ? 'show active' : ''}`} id="overview-tab-pane" role="tabpanel" aria-labelledby="overview-tab">
               <Overview description={description} />
            </div>
            <div className={`tab-pane fade ${activeTab === 1 ? 'show active' : ''}`} id="instructors-tab-pane" role="tabpanel" aria-labelledby="instructors-tab">
               <Instructors instructors={instructors} />
            </div>
            <div className={`tab-pane fade ${activeTab === 2 ? 'show active' : ''}`} id="attachments-tab-pane" role="tabpanel" aria-labelledby="attachments-tab">
               <LessonAttachments currentLessonId={currentLessonId} currentBigLessonId={currentBigLessonId} />
            </div>
         </div>
      </div>
   )
}

export default LessonNavTav
