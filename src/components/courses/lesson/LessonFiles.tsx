import { useState, useEffect } from 'react';
import axios from 'axios';
import './LessonFiles.css';

interface LessonFile {
  file_id: number;
  lesson_id: number;
  title: string;
  description: string;
  file_path: string;
  file_type: string;
  file_size: number;
  download_count: number;
  created_at: string;
  updated_at: string;
}

interface LessonFilesProps {
  lessonId: number;
}

const LessonFiles = ({ lessonId }: LessonFilesProps) => {
  const [files, setFiles] = useState<LessonFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3301';

  useEffect(() => {
    const fetchLessonFiles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setError('กรุณาเข้าสู่ระบบเพื่อดูไฟล์ประกอบบทเรียน');
          setLoading(false);
          return;
        }
        
        const response = await axios.get(
          `${apiURL}/api/lessons/${lessonId}/files`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data.success) {
          setFiles(response.data.files);
        } else {
          setError('ไม่สามารถดึงข้อมูลไฟล์ประกอบบทเรียนได้');
        }
      } catch (error) {
        console.error('Error fetching lesson files:', error);
        setError('เกิดข้อผิดพลาดในการดึงข้อมูลไฟล์ประกอบบทเรียน');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLessonFiles();
  }, [apiURL, lessonId]);

  const handleDownload = async (file: LessonFile) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('กรุณาเข้าสู่ระบบเพื่อดาวน์โหลดไฟล์');
        return;
      }
      
      // เพิ่มจำนวนการดาวน์โหลด
      await axios.post(
        `${apiURL}/api/lessons/files/${file.file_id}/download`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // ดาวน์โหลดไฟล์
      window.open(`${apiURL}/${file.file_path}`, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
      setError('เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์');
    }
  };

  // ฟังก์ชันแปลงขนาดไฟล์เป็นรูปแบบที่อ่านง่าย
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ฟังก์ชันแสดงไอคอนตามประเภทไฟล์
  const getFileIcon = (fileType: string): string => {
    const type = fileType.toLowerCase();
    
    if (type.includes('pdf')) {
      return 'fas fa-file-pdf';
    } else if (type.includes('word') || type.includes('doc')) {
      return 'fas fa-file-word';
    } else if (type.includes('excel') || type.includes('sheet') || type.includes('xls')) {
      return 'fas fa-file-excel';
    } else if (type.includes('powerpoint') || type.includes('presentation') || type.includes('ppt')) {
      return 'fas fa-file-powerpoint';
    } else if (type.includes('image') || type.includes('jpg') || type.includes('jpeg') || type.includes('png')) {
      return 'fas fa-file-image';
    } else if (type.includes('video')) {
      return 'fas fa-file-video';
    } else if (type.includes('audio')) {
      return 'fas fa-file-audio';
    } else if (type.includes('zip') || type.includes('archive') || type.includes('compressed')) {
      return 'fas fa-file-archive';
    } else if (type.includes('code') || type.includes('html') || type.includes('css') || type.includes('js')) {
      return 'fas fa-file-code';
    } else {
      return 'fas fa-file';
    }
  };

  return (
    <div className="lesson-files-container">
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-2">กำลังโหลดไฟล์ประกอบบทเรียน...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      ) : files.length === 0 ? (
        <div className="alert alert-info" role="alert">
          <i className="fas fa-info-circle me-2"></i>
          ไม่มีไฟล์ประกอบบทเรียนนี้
        </div>
      ) : (
        <>
          <h4 className="mb-3">ไฟล์ประกอบบทเรียน</h4>
          <div className="file-list">
            {files.map((file) => (
              <div key={file.file_id} className="file-item">
                <div className="file-icon">
                  <i className={getFileIcon(file.file_type)}></i>
                </div>
                <div className="file-info">
                  <h5 className="file-title">{file.title}</h5>
                  {file.description && (
                    <p className="file-description">{file.description}</p>
                  )}
                  <div className="file-meta">
                    <span className="file-type">
                      <i className="fas fa-file-alt me-1"></i>
                      {file.file_type}
                    </span>
                    <span className="file-size">
                      <i className="fas fa-weight me-1"></i>
                      {formatFileSize(file.file_size)}
                    </span>
                    <span className="file-downloads">
                      <i className="fas fa-download me-1"></i>
                      {file.download_count} ดาวน์โหลด
                    </span>
                  </div>
                </div>
                <div className="file-actions">
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => handleDownload(file)}
                  >
                    <i className="fas fa-download me-1"></i>
                    ดาวน์โหลด
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LessonFiles;
