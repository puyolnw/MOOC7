// $TSX:MOOC7/src/dashboard/admin-account/manager/edit/EditAccountManagersArea.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import DashboardSidebar from "../../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../../dashboard-common/AdminBanner";

interface Manager {
  manager_id: number;
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
}

interface EditManagerForm {
  first_name: string;
  last_name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
}

const EditAccountManagersArea: React.FC = () => {
  const navigate = useNavigate();
  const { managerId } = useParams<{ managerId: string }>();
  const apiURL = import.meta.env.VITE_API_URL;
  const [manager, setManager] = useState<Manager | null>(null);
  const [formData, setFormData] = useState<EditManagerForm>({
    first_name: '',
    last_name: '',
    email: '',
    status: 'active'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<Partial<EditManagerForm>>({});

  useEffect(() => {
    const fetchManager = async () => {
      if (!managerId) return;
      
      try {
        setIsFetching(true);
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('กรุณาเข้าสู่ระบบก่อนใช้งาน');
          navigate('/admin-account/managers');
          return;
        }

        const response = await axios.get(`${apiURL}/api/accounts/managers/${managerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          const managerData = response.data.manager;
          setManager(managerData);
          setFormData({
            first_name: managerData.first_name,
            last_name: managerData.last_name,
            email: managerData.email,
            status: managerData.status
          });
        } else {
          toast.error('ไม่สามารถดึงข้อมูลผู้จัดการได้');
          navigate('/admin-account/managers');
        }
      } catch (error: any) {
        console.error('Error fetching manager:', error);
        toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้จัดการ');
        navigate('/admin-account/managers');
      } finally {
        setIsFetching(false);
      }
    };

    fetchManager();
  }, [managerId, apiURL, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof EditManagerForm]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<EditManagerForm> = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('กรุณาเข้าสู่ระบบก่อนใช้งาน');
        return;
      }

      const response = await axios.put(`${apiURL}/api/accounts/managers/${managerId}`, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        status: formData.status
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success('อัปเดตข้อมูลผู้จัดการสำเร็จ');
        navigate('/admin-account/managers');
      } else {
        toast.error(response.data.message || 'ไม่สามารถอัปเดตข้อมูลผู้จัดการได้');
      }
    } catch (error: any) {
      console.error('Error updating manager:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้จัดการ');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <section className="dashboard__area section-pb-120">
        <div className="container">
          <DashboardBanner />
          <div className="dashboard__inner-wrap">
            <div className="row">
              <DashboardSidebar />
              <div className="dashboard__content-area col-lg-9">
                <div className="dashboard__content-main">
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">กำลังโหลด...</span>
                    </div>
                    <p className="mt-2 text-muted">กำลังโหลดข้อมูลผู้จัดการ...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!manager) {
    return (
      <section className="dashboard__area section-pb-120">
        <div className="container">
          <DashboardBanner />
          <div className="dashboard__inner-wrap">
            <div className="row">
              <DashboardSidebar />
              <div className="dashboard__content-area col-lg-9">
                <div className="dashboard__content-main">
                  <div className="alert alert-danger">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    ไม่พบข้อมูลผู้จัดการ
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

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
                  <h5 className="card-title mb-0">แก้ไขข้อมูลผู้จัดการ</h5>
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
                    <div className="mb-3">
                      <label className="form-label text-muted">ชื่อผู้ใช้</label>
                      <input
                        type="text"
                        className="form-control"
                        value={manager.username}
                        disabled
                      />
                    </div>

                    <form onSubmit={handleSubmit}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
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
                            placeholder="กรอกชื่อ"
                          />
                          {errors.first_name && (
                            <div className="invalid-feedback">{errors.first_name}</div>
                          )}
                        </div>
                        
                        <div className="col-md-6 mb-3">
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
                            placeholder="กรอกนามสกุล"
                          />
                          {errors.last_name && (
                            <div className="invalid-feedback">{errors.last_name}</div>
                          )}
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
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
                            placeholder="กรอกอีเมล"
                          />
                          {errors.email && (
                            <div className="invalid-feedback">{errors.email}</div>
                          )}
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label htmlFor="status" className="form-label">
                            สถานะ <span className="text-danger">*</span>
                          </label>
                          <select
                            className="form-select"
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                          >
                            <option value="active">เปิดใช้งาน</option>
                            <option value="inactive">ปิดใช้งาน</option>
                            <option value="pending">รอการยืนยัน</option>
                          </select>
                        </div>
                      </div>

                      <div className="d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => navigate('/admin-account/managers')}
                          disabled={isLoading}
                        >
                          ยกเลิก
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              กำลังอัปเดต...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save me-2"></i>
                              บันทึกการเปลี่ยนแปลง
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

export default EditAccountManagersArea;
