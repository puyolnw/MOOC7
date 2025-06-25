import React, { RefObject } from 'react';

interface CourseSettingsSectionProps {
  courseData: {
    coverImage: File | null;
    coverImagePreview: string;
    video_url: string; // เปลี่ยนจาก videoUrl เป็น video_url เพื่อให้สอดคล้องกับ backend
    study_result: string; // เพิ่ม study_result
    attachments: File[]; // เพิ่ม attachments
  };
  errors: { videoUrl: string };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleCoverImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveCoverImage: () => void;
  handleAttachmentUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; // เพิ่ม
  handleRemoveAttachment: (index: number) => void; // เพิ่ม
  fileInputRef: RefObject<HTMLInputElement>; // เพิ่ม fileInputRef
}

const CourseSettingsSection: React.FC<CourseSettingsSectionProps> = ({
  courseData,
  errors,
  handleInputChange,
  handleCoverImageUpload,
  handleRemoveCoverImage,
  handleAttachmentUpload,
  handleRemoveAttachment,
  fileInputRef,
}) => {
  // Debug ข้อมูล coverImage, coverImagePreview, และ video_url
  console.log("Cover Image:", courseData.coverImage);
  console.log("Cover Image Preview:", courseData.coverImagePreview);
  console.log("Video URL:", courseData.video_url);
  console.log("Study Result:", courseData.study_result);
  console.log("Attachments:", courseData.attachments);

  // ฟังก์ชันสำหรับดึง YouTube video ID จาก URL
  const extractYouTubeId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const videoId = extractYouTubeId(courseData.video_url);

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">
        <h5 className="card-title mb-3">3. ตั้งค่าหลักสูตร</h5>

        <div className="mb-4">
          <label className="form-label">ภาพหน้าปกหลักสูตร</label>
          <p className="text-muted small mb-2">แนะนำขนาด 1200 x 800 พิกเซล (ไม่เกิน 5MB)</p>

          <div className="d-flex align-items-center gap-3">
            <div
              className="cover-image-preview rounded border"
              style={{
                width: "150px",
                height: "100px",
                backgroundImage: courseData.coverImagePreview ? `url(${courseData.coverImagePreview})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f8f9fa",
              }}
            >
              {!courseData.coverImagePreview && <i className="fas fa-image fa-2x text-muted"></i>}
            </div>

            <div className="d-flex flex-column gap-2">
              <input
                type="file"
                className="form-control"
                id="coverImage"
                ref={fileInputRef}
                onChange={(e) => {
                  handleCoverImageUpload(e);
                  console.log("File selected:", e.target.files?.[0]); // Debug
                }}
                accept="image/jpeg,image/png,image/gif,image/webp"
                style={{ display: "none" }}
              />

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <i className="fas fa-upload me-2"></i>
                  {courseData.coverImage ? "เปลี่ยนภาพ" : "อัปโหลดภาพ"}
                </button>

                {courseData.coverImage && (
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => {
                      handleRemoveCoverImage();
                      console.log("Cover image removed"); // Debug
                    }}
                  >
                    <i className="fas fa-trash-alt me-2"></i>ลบภาพ
                  </button>
                )}
              </div>

              <small className="text-muted">รองรับไฟล์ JPEG, PNG, GIF, WEBP</small>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="video_url" className="form-label">
            วิดีโอแนะนำหลักสูตร (YouTube)
          </label>
          <input
            type="text"
            className={`form-control ${errors.videoUrl ? "is-invalid" : ""}`}
            id="video_url"
            name="video_url" // เปลี่ยนจาก videoUrl เป็น video_url
            value={courseData.video_url}
            onChange={(e) => {
              handleInputChange(e);
              console.log("Video URL updated:", e.target.value); // Debug
            }}
            placeholder="เช่น https://www.youtube.com/watch?v=abcdefghijk"
          />
          {errors.videoUrl && <div className="invalid-feedback">{errors.videoUrl}</div>}
          <small className="form-text text-muted">
            ตัวอย่างลิงก์ที่ถูกต้อง: https://www.youtube.com/watch?v=abcdefghijk หรือ https://youtu.be/abcdefghijk
          </small>
        </div>

        {courseData.video_url && !errors.videoUrl && videoId ? (
          <div className="video-preview mb-4">
            <h6>ตัวอย่างวิดีโอ:</h6>
            <div className="ratio ratio-16x9">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        ) : courseData.video_url && !errors.videoUrl ? (
          <div className="alert alert-warning mb-4">
            <i className="fas fa-exclamation-circle me-2"></i>
            ไม่สามารถแสดงตัวอย่างวิดีโอได้ กรุณาตรวจสอบ URL
          </div>
        ) : null}

        <div className="mb-4">
          <label className="form-label">ไฟล์แนบ</label>
          <p className="text-muted small mb-2">อัปโหลดไฟล์แนบสำหรับหลักสูตร (ไม่เกิน 10MB ต่อไฟล์)</p>

          <div className="d-flex gap-2 mb-3">
            <input
              type="file"
              className="form-control"
              id="attachments"
              onChange={handleAttachmentUpload}
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => document.getElementById('attachments')?.click()}
            >
              <i className="fas fa-paperclip me-2"></i>เพิ่มไฟล์แนบ
            </button>
          </div>

          {courseData.attachments.length > 0 && (
            <div className="attachments-list">
              <h6>ไฟล์แนบที่เลือก:</h6>
              <div className="list-group">
                {courseData.attachments.map((file, index) => (
                  <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-file me-2 text-primary"></i>
                      <span>{file.name}</span>
                      <small className="text-muted ms-2">({(file.size / 1024 / 1024).toFixed(2)} MB)</small>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleRemoveAttachment(index)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <small className="text-muted">
            รองรับไฟล์ PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP, RAR
          </small>
        </div>
      </div>
    </div>
  );
};

export default CourseSettingsSection;