import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Attachment {
  file_id: string;
  file_name: string;
  file_type?: string;
  file_size?: number;
}

interface CourseAttachmentsProps {
  courseId?: string | number;
}

const CourseAttachments: React.FC<CourseAttachmentsProps> = ({ courseId }) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    console.log('CourseAttachments: useEffect triggered with courseId:', courseId);
    console.log('CourseAttachments: courseId type:', typeof courseId);
    console.log('CourseAttachments: courseId value:', courseId);
    
    if (!courseId) {
      console.log('CourseAttachments: No courseId provided');
      return;
    }

    console.log('CourseAttachments: Fetching attachments for courseId:', courseId);

    const fetchAttachments = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('CourseAttachments: No token found');
          setError('กรุณาเข้าสู่ระบบ');
          setAttachments([]);
          return;
        }

        console.log('CourseAttachments: Making API request to:', `${apiURL}/api/courses/${courseId}/attachments`);

        const response = await axios.get(`${apiURL}/api/courses/${courseId}/attachments`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('CourseAttachments: API Response:', response.data);

        if (response.data.success && Array.isArray(response.data.attachments)) {
          console.log('CourseAttachments: Raw attachments data:', response.data.attachments);
          
          const formattedAttachments: Attachment[] = response.data.attachments.map((attachment: any) => ({
            file_id: attachment.file_id || attachment.id || '',
            file_name: attachment.file_name || attachment.title || '',
            file_type: attachment.file_type || attachment.mime_type || '',
            file_size: attachment.file_size || attachment.size || 0,
          }));
          
          console.log('CourseAttachments: Formatted attachments:', formattedAttachments);
          setAttachments(formattedAttachments);
        } else {
          console.log('CourseAttachments: No attachments found or invalid response structure');
          setAttachments([]);
        }
      } catch (error: any) {
        console.error('CourseAttachments: Error fetching attachments:', error);
        console.error('CourseAttachments: Error response:', error.response?.data);
        setError('ไม่สามารถโหลดไฟล์ประกอบได้');
        setAttachments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttachments();
  }, [courseId, apiURL]);

  const handleDownloadAttachment = async (fileId: string, fileName: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('กรุณาเข้าสู่ระบบก่อนดาวน์โหลด');
        return;
      }

      const response = await axios.get(`${apiURL}/api/courses/attachment/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let downloadFileName = fileName;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          downloadFileName = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      link.setAttribute('download', downloadFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('ดาวน์โหลดไฟล์สำเร็จ');
    } catch (error: any) {
      console.error('Error downloading attachment:', error);
      toast.error('เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์');
    }
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return 'fas fa-file';
    
    if (fileType.includes('pdf')) return 'fas fa-file-pdf';
    if (fileType.includes('word') || fileType.includes('doc')) return 'fas fa-file-word';
    if (fileType.includes('excel') || fileType.includes('sheet')) return 'fas fa-file-excel';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'fas fa-file-powerpoint';
    if (fileType.includes('image')) return 'fas fa-file-image';
    if (fileType.includes('video')) return 'fas fa-file-video';
    if (fileType.includes('audio')) return 'fas fa-file-audio';
    if (fileType.includes('zip') || fileType.includes('rar')) return 'fas fa-file-archive';
    if (fileType.includes('text')) return 'fas fa-file-alt';
    
    return 'fas fa-file';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Debug logging for render
  console.log('CourseAttachments: Render state:', {
    courseId,
    isLoading,
    error,
    attachmentsCount: attachments.length,
    attachments
  });

  return (
    <div className="courses__reviews-wrap">
      <h3 className="title">ไฟล์ประกอบหลักสูตร</h3>
      
      {isLoading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลดไฟล์...</span>
          </div>
          <p className="mt-2 text-muted">กำลังโหลดไฟล์ประกอบ...</p>
        </div>
      ) : error ? (
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      ) : attachments.length > 0 ? (
        <div className="attachments-list">
          {attachments.map((attachment, index) => (
            <div key={`attachment-${attachment.file_id}-${index}`} className="attachment-item mb-3 p-3 border rounded bg-light">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center flex-grow-1">
                  <i className={`${getFileIcon(attachment.file_type)} text-primary me-3`} style={{ fontSize: '1.5rem' }}></i>
                  <div className="flex-grow-1">
                    <h6 className="mb-1 fw-medium">{attachment.file_name}</h6>
                    <div className="text-muted small">
                      {attachment.file_type && <span className="me-3">ประเภท: {attachment.file_type}</span>}
                      {attachment.file_size && <span>ขนาด: {formatFileSize(attachment.file_size)}</span>}
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => handleDownloadAttachment(attachment.file_id, attachment.file_name)}
                  aria-label={`ดาวน์โหลดไฟล์ ${attachment.file_name}`}
                >
                  <i className="fas fa-download me-2"></i>
                  ดาวน์โหลด
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <i className="fas fa-file-slash fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">ไม่มีไฟล์ประกอบหลักสูตร</h5>
          <p className="text-muted mb-0">ยังไม่มีไฟล์ประกอบสำหรับหลักสูตรนี้</p>
        </div>
      )}

      <style>
        {`
          .attachments-list {
            max-height: 500px;
            overflow-y: auto;
          }
          
          .attachment-item {
            transition: all 0.3s ease;
            border: 1px solid #e9ecef;
          }
          
          .attachment-item:hover {
            border-color: #0d6efd;
            box-shadow: 0 2px 8px rgba(13, 110, 253, 0.1);
            transform: translateY(-1px);
          }
          
          .btn-outline-primary {
            transition: all 0.3s ease;
          }
          
          .btn-outline-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(13, 110, 253, 0.2);
          }
          
          .text-primary {
            color: #0d6efd !important;
          }
          
          .bg-light {
            background-color: #f8f9fa !important;
          }
          
          @media (max-width: 768px) {
            .attachment-item {
              padding: 1rem !important;
            }
            
            .d-flex {
              flex-direction: column;
              align-items: flex-start !important;
            }
            
            .btn {
              margin-top: 1rem;
              width: 100%;
            }
          }
        `}
      </style>
    </div>
  );
};

export default CourseAttachments;
