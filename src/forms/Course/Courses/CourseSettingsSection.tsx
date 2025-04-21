import React from 'react';
import { CourseData } from "./AddCourses"


interface CourseSettingsSectionProps {
  courseData: CourseData;
  errors: { videoUrl: string; };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCoverImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveCoverImage: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const CourseSettingsSection: React.FC<CourseSettingsSectionProps> = ({
  courseData,
  errors,
  handleInputChange,
  handleCheckboxChange,
  handleCoverImageUpload,
  handleRemoveCoverImage,
  fileInputRef
}) => (
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
);

export default CourseSettingsSection;
