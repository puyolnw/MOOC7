import React from 'react';

interface LessonContentSectionProps {
  lessonData: any;
  errors: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFile: (index: number) => void;
  handleRemoveExistingFile: (fileId: string) => void;
  uploadedFiles: File[];
  existingFiles: any[];
  filesToRemove: string[];
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const LessonContentSection: React.FC<LessonContentSectionProps> = ({
  lessonData,
  errors,
  handleInputChange,
  handleFileUpload,
  handleRemoveFile,
  handleRemoveExistingFile,
  uploadedFiles,
  existingFiles,
  filesToRemove,
  fileInputRef
}) => (
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
      
      <div className="mb-3">
        <label className="form-label">ไฟล์ประกอบบทเรียน</label>
        <div className="input-group mb-3">
          <input
            type="file"
            className={`form-control ${errors.files ? 'is-invalid' : ''}`}
            id="files"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            multiple
          />
          <label className="input-group-text" htmlFor="files">อัปโหลด</label>
          {errors.files && <div className="invalid-feedback">{errors.files}</div>}
        </div>
        <small className="text-muted d-block">
          รองรับไฟล์ PDF, DOC, DOCX, XLS และ XLSX ขนาดไม่เกิน 50 MB
        </small>
        
        {uploadedFiles.length > 0 && (
          <div className="mt-3">
            <h6>ไฟล์ที่อัปโหลด:</h6>
            <ul className="list-group">
              {uploadedFiles.map((file, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <i className={`fas ${file.name.endsWith('.pdf') ? 'fa-file-pdf' : 'fa-file-alt'} me-2 text-danger`}></i>
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
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
        
        {existingFiles.length > 0 && (
          <div className="mt-3">
            <h6>ไฟล์ที่มีอยู่แล้ว:</h6>
            <ul className="list-group">
              {existingFiles.map((file) => {
                if (filesToRemove.includes(file.file_id)) return null;
                return (
                  <li key={file.file_id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <i className={`fas ${file.file_name.endsWith('.pdf') ? 'fa-file-pdf' : 'fa-file-alt'} me-2 text-danger`}></i>
                      {file.file_name} ({(file.file_size / 1024 / 1024).toFixed(2)} MB)
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
);

export default LessonContentSection;