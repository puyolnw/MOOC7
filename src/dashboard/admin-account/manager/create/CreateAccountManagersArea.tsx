// $TSX:MOOC7/src/dashboard/admin-account/manager/create/CreateAccountManagersArea.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import DashboardSidebar from "../../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../../dashboard-common/AdminBanner";

// Interface สำหรับข้อมูลแผนก
interface Department {
  department_id: number;
  department_name: string;
}

interface CreateManagerForm {
  username: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  department: string;
  description: string;
  phone: string;
  avatar: File | null;
  avatarPreview: string;
}

const CreateAccountManagersArea: React.FC = () => {
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<CreateManagerForm>({
    username: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    email: '',
    position: '',
    department: '',
    description: '',
    phone: '',
    avatar: null,
    avatarPreview: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [errors, setErrors] = useState<Partial<CreateManagerForm>>({});

  // ดึงข้อมูลแผนกจาก API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          toast.error("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
          setIsLoading(false);
          return;
        }

        const response = await axios.get(`${apiURL}/api/courses/subjects/departments/list`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setDepartments(response.data.departments);
        } else {
          toast.error("ไม่สามารถดึงข้อมูลแผนกได้");
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลแผนก");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, [apiURL]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof CreateManagerForm]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // จัดการการอัปโหลดรูปภาพ
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // ตรวจสอบขนาดไฟล์ (ไม่เกิน 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("ขนาดไฟล์ต้องไม่เกิน 2MB");
      return;
    }

    // ตรวจสอบประเภทไฟล์
    const fileType = file.type;
    if (!fileType.match(/^image\/(jpeg|jpg|png|gif)$/)) {
      toast.error("รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF)");
      return;
    }

    // สร้าง URL สำหรับแสดงตัวอย่างรูปภาพ
    const previewUrl = URL.createObjectURL(file);

    setFormData(prev => ({
      ...prev,
      avatar: file,
      avatarPreview: previewUrl
    }));
  };

  // ลบรูปภาพ
  const handleRemoveAvatar = () => {
    setFormData(prev => ({
      ...prev,
      avatar: null,
      avatarPreview: ""
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateManagerForm> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'กรุณากรอกชื่อผู้ใช้';
    } else if (formData.username.length < 4) {
      newErrors.username = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 4 ตัวอักษร';
    }

    if (!formData.password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (formData.password.length < 6) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'กรุณากรอกชื่อ';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'กรุณากรอกนามสกุล';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'กรุณาระบุตำแหน่ง';
    }

    if (!formData.department) {
      newErrors.department = 'กรุณาเลือกแผนก/สาขาวิชา';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('กรุณาเข้าสู่ระบบก่อนใช้งาน');
        return;
      }

      // สร้าง FormData สำหรับส่งข้อมูลและไฟล์
      const formDataToSend = new FormData();
      formDataToSend.append("username", formData.username);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("firstName", formData.first_name);
      formDataToSend.append("lastName", formData.last_name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("position", formData.position);
      formDataToSend.append("department", formData.department);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("phone", formData.phone);

      if (formData.avatar) {
        formDataToSend.append("avatar", formData.avatar);
      }

      const response = await axios.post(`${apiURL}/api/accounts/managers`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('สร้างบัญชีผู้จัดการสำเร็จ');
        navigate('/admin-account/managers');
      } else {
        toast.error(response.data.message || 'ไม่สามารถสร้างบัญชีผู้จัดการได้');
      }
    } catch (error: any) {
      console.error('Error creating manager:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('เกิดข้อผิดพลาดในการสร้างบัญชีผู้จัดการ');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="dashboard__area section-pb-120">
      <div className="container">
        <DashboardBanner />
        <div className="dashboard__inner-wrap">
          <div className="row">
            <DashboardSidebar />
            <div className="dashboard__content-area col-lg-9">
              <div className="dashboard__content-main">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">สร้างบัญชีผู้จัดการใหม่</h5>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/admin-account/managers')}
                  >
                    <i className="fas fa-arrow-left me-2"></i>กลับ
                  </button>
                </div>
                
                <div className="card">
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      {/* ส่วนที่ 1: ข้อมูลการเข้าสู่ระบบ */}
                      <div className="card shadow-sm border-0 mb-4">
                        <div className="card-body">
                          <h5 className="card-title mb-3">1. ข้อมูลการเข้าสู่ระบบ</h5>
                          
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label htmlFor="username" className="form-label">
                                ชื่อผู้ใช้ <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder="ระบุชื่อผู้ใช้"
                              />
                              {errors.username && (
                                <div className="invalid-feedback">{errors.username}</div>
                              )}
                              <small className="form-text text-muted">ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 4 ตัวอักษร</small>
                            </div>
                            
                            <div className="col-md-6">
                              <label htmlFor="email" className="form-label">
                                อีเมล <span className="text-danger">*</span>
                              </label>
                              <input
                                type="email"
                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="ระบุอีเมล"
                              />
                              {errors.email && (
                                <div className="invalid-feedback">{errors.email}</div>
                              )}
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label htmlFor="password" className="form-label">
                                รหัสผ่าน <span className="text-danger">*</span>
                              </label>
                              <input
                                type="password"
                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="ระบุรหัสผ่าน"
                              />
                              {errors.password && (
                                <div className="invalid-feedback">{errors.password}</div>
                              )}
                              <small className="form-text text-muted">รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร</small>
                            </div>
                            
                            <div className="col-md-6">
                              <label htmlFor="confirmPassword" className="form-label">
                                ยืนยันรหัสผ่าน <span className="text-danger">*</span>
                              </label>
                              <input
                                type="password"
                                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                              />
                              {errors.confirmPassword && (
                                <div className="invalid-feedback">{errors.confirmPassword}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ส่วนที่ 2: ข้อมูลส่วนตัว */}
                      <div className="card shadow-sm border-0 mb-4">
                        <div className="card-body">
                          <h5 className="card-title mb-3">2. ข้อมูลส่วนตัว</h5>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label htmlFor="first_name" className="form-label">
                                ชื่อ <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                                id="first_name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleInputChange}
                                placeholder="ระบุชื่อ"
                              />
                              {errors.first_name && (
                                <div className="invalid-feedback">{errors.first_name}</div>
                              )}
                            </div>
                            
                            <div className="col-md-6">
                              <label htmlFor="last_name" className="form-label">
                                นามสกุล <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                                id="last_name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleInputChange}
                                placeholder="ระบุนามสกุล"
                              />
                              {errors.last_name && (
                                <div className="invalid-feedback">{errors.last_name}</div>
                              )}
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label htmlFor="position" className="form-label">
                                ตำแหน่ง <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                className={`form-control ${errors.position ? 'is-invalid' : ''}`}
                                id="position"
                                name="position"
                                value={formData.position}
                                onChange={handleInputChange}
                                placeholder="ระบุตำแหน่ง เช่น ประธานหลักสูตร, หัวหน้าสาขา"
                              />
                              {errors.position && (
                                <div className="invalid-feedback">{errors.position}</div>
                              )}
                            </div>
                            
                            <div className="col-md-6">
                              <label htmlFor="department" className="form-label">
                                แผนก/สาขาวิชา <span className="text-danger">*</span>
                              </label>
                              {isLoading ? (
                                <div className="d-flex align-items-center mb-2">
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  <span>กำลังโหลดข้อมูลแผนก...</span>
                                </div>
                              ) : (
                                <select
                                  className={`form-select ${errors.department ? 'is-invalid' : ''}`}
                                  id="department"
                                  name="department"
                                  value={formData.department}
                                  onChange={handleInputChange}
                                  disabled={isLoading}
                                >
                                  <option value="">-- เลือกแผนก/สาขาวิชา --</option>
                                  {departments.map((dept) => (
                                    <option key={dept.department_id} value={dept.department_id}>
                                      {dept.department_name}
                                    </option>
                                  ))}
                                </select>
                              )}
                              {errors.department && (
                                <div className="invalid-feedback">{errors.department}</div>
                              )}
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label htmlFor="phone" className="form-label">เบอร์โทรศัพท์</label>
                              <input
                                type="tel"
                                className="form-control"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="ระบุเบอร์โทรศัพท์"
                              />
                            </div>
                          </div>

                          <div className="mb-3">
                            <label htmlFor="description" className="form-label">ประวัติโดยย่อ</label>
                            <textarea
                              className="form-control"
                              id="description"
                              name="description"
                              rows={4}
                              value={formData.description}
                              onChange={handleInputChange}
                              placeholder="ระบุประวัติการศึกษา ความเชี่ยวชาญ หรือข้อมูลอื่นๆ ที่เกี่ยวข้อง"
                            ></textarea>
                          </div>

                          {/* รูปโปรไฟล์ */}
                          <div className="mb-4">
                            <label className="form-label">รูปโปรไฟล์</label>
                            <p className="text-muted small mb-2">แนะนำขนาด 400 x 400 พิกเซล (ไม่เกิน 2MB)</p>

                            <div className="d-flex align-items-center gap-3">
                              <div
                                className="avatar-preview rounded-circle border"
                                style={{
                                  width: "100px",
                                  height: "100px",
                                  backgroundImage: formData.avatarPreview
                                    ? `url(${formData.avatarPreview})`
                                    : "none",
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  backgroundColor: "#f8f9fa",
                                }}
                              >
                                {!formData.avatarPreview && (
                                  <i className="fas fa-user fa-2x text-muted"></i>
                                )}
                              </div>

                              <div className="d-flex flex-column gap-2">
                                <input
                                  type="file"
                                  className="form-control"
                                  id="avatar"
                                  ref={fileInputRef}
                                  onChange={handleAvatarUpload}
                                  accept="image/jpeg,image/png,image/gif"
                                  style={{ display: "none" }}
                                />

                                <div className="d-flex gap-2">
                                  <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={() => fileInputRef.current?.click()}
                                  >
                                    <i className="fas fa-upload me-2"></i>
                                    {formData.avatar ? "เปลี่ยนรูป" : "อัปโหลดรูป"}
                                  </button>

                                  {formData.avatar && (
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger"
                                      onClick={handleRemoveAvatar}
                                    >
                                      <i className="fas fa-trash me-2"></i>
                                      ลบรูป
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => navigate('/admin-account/managers')}
                          disabled={isSubmitting}
                        >
                          ยกเลิก
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              กำลังสร้าง...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save me-2"></i>
                              สร้างบัญชี
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreateAccountManagersArea;
