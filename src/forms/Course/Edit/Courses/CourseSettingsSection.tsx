import React, { RefObject } from 'react';

interface CourseSettingsSectionProps {
  courseData: {
    coverImage: File | null;
    coverImagePreview: string;
    video_url: string;
    status: "active" | "inactive" | "draft";
  };
  errors: { video_url: string };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleCoverImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveCoverImage: () => void;
  fileInputRef: RefObject<HTMLInputElement>;
}

const CourseSettingsSection: React.FC<CourseSettingsSectionProps> = ({
  courseData,
  errors,
  handleInputChange,
  handleCoverImageUpload,
  handleRemoveCoverImage,
  fileInputRef,
}) => {
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
                  console.log("File selected:", e.target.files?.[0]);
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
                  {courseData.coverImagePreview ? "เปลี่ยนภาพ" : "อัปโหลดภาพ"}
                </button>

                {courseData.coverImagePreview && (
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => {
                      handleRemoveCoverImage();
                      console.log("Cover image removed");
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
            className={`form-control ${errors.video_url ? "is-invalid" : ""}`}
            id="video_url"
            name="video_url"
            value={courseData.video_url}
            onChange={(e) => {
              handleInputChange(e);
              console.log("Video URL updated:", e.target.value);
            }}
            placeholder="เช่น https://www.youtube.com/watch?v=abcdefghijk"
          />
          {errors.video_url && <div className="invalid-feedback">{errors.video_url}</div>}
          <small className="form-text text-muted">
            ตัวอย่างลิงก์ที่ถูกต้อง: https://www.youtube.com/watch?v=abcdefghijk หรือ https://youtu.be/abcdefghijk
          </small>
        </div>

        {courseData.video_url && !errors.video_url && videoId ? (
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
        ) : courseData.video_url && !errors.video_url ? (
          <div className="alert alert-warning mb-4">
            <i className="fas fa-exclamation-circle me-2"></i>
            ไม่สามารถแสดงตัวอย่างวิดีโอได้ กรุณาตรวจสอบ URL
          </div>
        ) : null}

        <div className="mb-3">
          <label htmlFor="status" className="form-label">
            สถานะ
          </label>
          <select
            className="form-control"
            id="status"
            name="status"
            value={courseData.status}
            onChange={(e) => handleInputChange(e as React.ChangeEvent<HTMLSelectElement>)}
          >
            <option value="active">เปิดใช้งาน</option>
            <option value="inactive">ปิดใช้งาน</option>
            <option value="draft">ฉบับร่าง</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default CourseSettingsSection;