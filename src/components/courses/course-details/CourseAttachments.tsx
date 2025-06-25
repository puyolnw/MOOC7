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
  const [selectedFile, setSelectedFile] = useState<Attachment | null>(null);
  const [showFileViewer, setShowFileViewer] = useState(false);
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

      console.log('Downloading attachment - fileId:', fileId, 'fileName:', fileName);

      const response = await axios.get(`${apiURL}/api/courses/attachment/${fileId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        // สร้าง link และ download
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.download = response.data.fileName || fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('ดาวน์โหลดไฟล์สำเร็จ');
      } else {
        toast.error(response.data.message || 'เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์');
      }
    } catch (error: any) {
      console.error('Error downloading attachment:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        toast.error('กรุณาเข้าสู่ระบบก่อนดาวน์โหลด');
      } else if (error.response?.status === 403) {
        toast.error('ไม่มีสิทธิ์ในการดาวน์โหลดไฟล์นี้');
      } else if (error.response?.status === 404) {
        toast.error('ไม่พบไฟล์ที่ต้องการดาวน์โหลด');
      } else {
        toast.error('เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์');
      }
    }
  };

  const handleOpenFile = async (fileId: string, fileName: string, fileType?: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('กรุณาเข้าสู่ระบบก่อนเปิดไฟล์');
        return;
      }

      console.log('Opening file - fileId:', fileId, 'fileName:', fileName, 'fileType:', fileType);

      // ใช้ API ที่มีอยู่แล้วเพื่อดึงข้อมูลไฟล์
      const response = await axios.get(`${apiURL}/api/courses/attachment/${fileId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        const attachment: Attachment = {
          file_id: fileId,
          file_name: fileName,
          file_type: fileType,
          file_size: response.data.fileSize
        };
        
        setSelectedFile(attachment);
        setShowFileViewer(true);
        
        // เปิดไฟล์ในแท็บใหม่โดยใช้ downloadUrl
        if (response.data.downloadUrl) {
          window.open(response.data.downloadUrl, '_blank');
        }
      } else {
        toast.error(response.data.message || 'เกิดข้อผิดพลาดในการเปิดไฟล์');
      }
    } catch (error: any) {
      console.error('Error opening file:', error);
      if (error.response?.status === 401) {
        toast.error('กรุณาเข้าสู่ระบบก่อนเปิดไฟล์');
      } else {
        toast.error('เกิดข้อผิดพลาดในการเปิดไฟล์');
      }
    }
  };

  const canPreviewFile = (fileType?: string): boolean => {
    if (!fileType) return false;
    
    const previewableTypes = [
      'application/pdf',
      'text/plain',
      'text/html',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ];
    
    return previewableTypes.includes(fileType.toLowerCase());
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
                <div className="d-flex gap-2">
                  {canPreviewFile(attachment.file_type) && (
                    <button
                      className="btn btn-outline-success btn-sm"
                      onClick={() => handleOpenFile(attachment.file_id, attachment.file_name, attachment.file_type)}
                      aria-label={`เปิดไฟล์ ${attachment.file_name}`}
                    >
                      <i className="fas fa-eye me-2"></i>
                      เปิดไฟล์
                    </button>
                  )}
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

      {/* File Viewer Modal */}
      {showFileViewer && selectedFile && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.75)' }}
          tabIndex={-1}
          aria-labelledby="fileViewerModalLabel"
          aria-hidden="false"
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header bg-gradient-primary border-0 py-3">
                <h5 className="modal-title text-white fw-bold" id="fileViewerModalLabel">
                  <i className="fas fa-file me-2" />
                  {selectedFile.file_name}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowFileViewer(false);
                    setSelectedFile(null);
                  }}
                  aria-label="ปิด"
                />
              </div>
              <div className="modal-body p-0 bg-light">
                <div className="file-viewer-container" style={{ height: '70vh' }}>
                  <div className="p-3">
                    <div className="alert alert-success mb-3">
                      <i className="fas fa-check-circle me-2"></i>
                      ไฟล์ถูกเปิดในแท็บใหม่แล้ว
                    </div>
                    <div className="text-center">
                      <i className={`${getFileIcon(selectedFile.file_type)} fa-3x text-primary mb-3`}></i>
                      <h5>{selectedFile.file_name}</h5>
                      <p className="text-muted mb-3">ประเภท: {selectedFile.file_type || 'ไม่ระบุ'} - ขนาด: {formatFileSize(selectedFile.file_size)}</p>
                      <p className="text-muted small mb-3">หากแท็บใหม่ไม่เปิดขึ้น กรุณาตรวจสอบ popup blocker</p>
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => handleDownloadAttachment(selectedFile.file_id, selectedFile.file_name)}
                      >
                        <i className="fas fa-download me-2"></i>
                        ดาวน์โหลด
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-3 bg-light">
                <button
                  type="button"
                  className="btn btn-primary btn-sm px-4 py-2 rounded-pill me-2"
                  onClick={() => handleDownloadAttachment(selectedFile.file_id, selectedFile.file_name)}
                  aria-label={`ดาวน์โหลดไฟล์ ${selectedFile.file_name}`}
                >
                  <i className="fas fa-download me-2" />ดาวน์โหลด
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm px-4 py-2 rounded-pill"
                  onClick={() => {
                    setShowFileViewer(false);
                    setSelectedFile(null);
                  }}
                  aria-label="ปิด"
                >
                  <i className="fas fa-times me-2" />ปิด
                </button>
              </div>
            </div>
          </div>
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
          
          .btn-outline-primary, .btn-outline-success {
            transition: all 0.3s ease;
          }
          
          .btn-outline-primary:hover, .btn-outline-success:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(13, 110, 253, 0.2);
          }
          
          .btn-outline-success:hover {
            box-shadow: 0 2px 8px rgba(25, 135, 84, 0.2);
          }
          
          .text-primary {
            color: #0d6efd !important;
          }
          
          .bg-light {
            background-color: #f8f9fa !important;
          }
          
          .modal.fade.show {
            animation: fadeIn 0.3s ease-out;
            z-index: 1050;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .modal-dialog {
            transition: transform 0.3s ease-out;
            transform: translateY(0);
            max-width: 90vw;
            width: 1200px;
          }

          .modal-content {
            border-radius: 12px !important;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }

          .modal-header.bg-gradient-primary {
            background: linear-gradient(90deg, #0d6efd, #6610f2);
            border-bottom: none;
            padding: 1.5rem 2rem;
          }

          .modal-title {
            font-size: 1.25rem;
            font-weight: 600;
            display: flex;
            align-items: center;
          }

          .file-viewer-container {
            background: #f8f9fa;
            border-radius: 8px;
            overflow: hidden;
          }

          .file-viewer-container iframe {
            border: none;
            width: 100%;
            height: 100%;
          }

          .file-viewer-container img {
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
            
            .modal-dialog {
              margin: 1rem;
              max-width: 95vw;
            }
            
            .file-viewer-container {
              height: 50vh !important;
            }
          }
          
          .alert-info {
            background-color: #d1ecf1;
            border-color: #bee5eb;
            color: #0c5460;
          }
          
          .alert-info i {
            color: #0c5460;
          }
          
          .alert-success {
            background-color: #d1e7dd;
            border-color: #badbcc;
            color: #0f5132;
          }
          
          .alert-success i {
            color: #0f5132;
          }
          
          .text-danger {
            color: #dc3545 !important;
          }
          
          .text-success {
            color: #198754 !important;
          }
          
          .btn-outline-primary {
            border-color: #0d6efd;
            color: #0d6efd;
          }
          
          .btn-outline-primary:hover {
            background-color: #0d6efd;
            border-color: #0d6efd;
            color: white;
          }
        `}
      </style>
    </div>
  );
};

export default CourseAttachments;
