import React from "react";
import { SubjectData } from './AddSubjects';
import { Department } from './AddSubjects';
interface SubjectInfoSectionProps {
  subjectData: SubjectData;
  errors: {
    title: string;
    code: string;
    credits: string;
    coverImage: string;
    lessons: string;
  };
  availableDepartments: Department[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  imagePreview: string | null;
  existingImageUrl: string | null;
}

const SubjectInfoSection: React.FC<SubjectInfoSectionProps> = ({
  subjectData,
  errors,
  availableDepartments,
  handleInputChange,
  handleImageUpload,
  handleRemoveImage,
  fileInputRef,
  imagePreview,
  existingImageUrl,
}) => (
  <div className="card shadow-sm border-0 mb-4">
    <div className="card-header bg-light">
      <h5 className="mb-0">1. ข้อมูลรายวิชา</h5>
    </div>
    <div className="card-body">
      <div className="row">
        <div className="col-md-8">
          <div className="mb-3">
            <label htmlFor="title" className="form-label">
              ชื่อรายวิชา <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.title ? "is-invalid" : ""}`}
              id="title"
              name="title"
              value={subjectData.title}
              onChange={handleInputChange}
              placeholder="ระบุชื่อรายวิชา"
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="code" className="form-label">
                  รหัสรายวิชา <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.code ? "is-invalid" : ""}`}
                  id="code"
                  name="code"
                  value={subjectData.code}
                  onChange={handleInputChange}
                  placeholder="เช่น CS101"
                />
                {errors.code && <div className="invalid-feedback">{errors.code}</div>}
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="credits" className="form-label">
                  หน่วยกิต <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.credits ? "is-invalid" : ""}`}
                  id="credits"
                  name="credits"
                  value={subjectData.credits}
                  onChange={handleInputChange}
                  min="1"
                  max="12"
                />
                {errors.credits && <div className="invalid-feedback">{errors.credits}</div>}
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="department" className="form-label">
              สาขาวิชา
            </label>
            <select
              className="form-select"
              id="department"
              name="department"
              value={subjectData.department}
              onChange={handleInputChange}
            >
              <option value="">เลือกสาขาวิชา</option>
              {availableDepartments.map((dept) => (
                <option key={dept.department_id} value={dept.department_id}>
                  {dept.department_name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              คำอธิบายรายวิชา
            </label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              value={subjectData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="ระบุคำอธิบายรายวิชา"
            ></textarea>
          </div>
        </div>

        <div className="col-md-4">
          <div className="mb-3">
            <label className="form-label">รูปภาพปก</label>
            <div className="cover-image-container">
              {imagePreview || existingImageUrl ? (
                <div className="position-relative">
                  <img
                    src={imagePreview || existingImageUrl || ""}
                    alt="รูปภาพปก"
                    className="img-fluid rounded"
                    style={{ maxHeight: "200px", width: "100%", objectFit: "cover" }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                    onClick={handleRemoveImage}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ) : (
                <div
                  className="border rounded p-3 text-center bg-light"
                  style={{ cursor: "pointer" }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <i className="fas fa-image fa-3x text-muted mb-2"></i>
                  <p className="mb-0">คลิกเพื่ออัปโหลดรูปภาพ</p>
                  <small className="text-muted">รองรับไฟล์ JPEG, PNG, WEBP ขนาดไม่เกิน 5MB</small>
                </div>
              )}
              <input
                type="file"
                className="d-none"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleImageUpload}
              />
              {errors.coverImage && <div className="text-danger small mt-2">{errors.coverImage}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default SubjectInfoSection;
