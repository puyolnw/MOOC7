import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import DashboardSidebar from "../../dashboard-common/DashboardSidebarTwo";
import DashboardBanner from "../../dashboard-common/DashboardBannerTwo";

interface CompletedSubject {
  subject_id: number;
  subject_code: string;
  subject_name: string;
  credits: number;
  completion_date: string;
  payment_status: 'not_paid' | 'pending' | 'approved' | 'rejected';
  payment_amount: number;
  payment_slip_id?: number;
  certificate_available: boolean;
}

interface BankAccount {
  account_id: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  bank_code?: string;
  branch_name?: string;
  is_default: boolean;
}

const StudentPaymentArea: React.FC = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // States for completed subjects
  const [completedSubjects, setCompletedSubjects] = useState<CompletedSubject[]>([]);
  
  // States for payment form
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<CompletedSubject | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState<number | null>(null);
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCompletedSubjects();
    fetchBankAccounts();
  }, []);

  const fetchCompletedSubjects = async () => {
    try {
      setIsLoading(true);
      // Get token from localStorage for authentication
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiURL}/api/data/student/completed-subjects`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setCompletedSubjects(response.data.subjects);
      }
    } catch (error: any) {
      console.error("Error fetching completed subjects:", error);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูลรายวิชา");
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลรายวิชา");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const response = await axios.get(`${apiURL}/api/bank-accounts/active`);
      if (response.data.success) {
        setBankAccounts(response.data.bankAccounts);
        // Auto-select default bank account
        const defaultAccount = response.data.bankAccounts.find((acc: BankAccount) => acc.is_default);
        if (defaultAccount) {
          setSelectedBankAccount(defaultAccount.account_id);
        }
      }
    } catch (error: any) {
      console.error("Error fetching bank accounts:", error);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลบัญชีธนาคาร");
    }
  };

  const handlePaymentClick = (subject: CompletedSubject) => {
    setSelectedSubject(subject);
    setShowPaymentForm(true);
  };

  const handleSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("รองรับเฉพาะไฟล์ JPG, PNG และ PDF");
        return;
      }
      
      setPaymentSlip(file);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSubject || !selectedBankAccount || !paymentSlip) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append('subject_id', selectedSubject.subject_id.toString());
      formData.append('bank_account_id', selectedBankAccount.toString());
      formData.append('amount', selectedSubject.payment_amount.toString());
      formData.append('payment_slip', paymentSlip);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiURL}/api/data/student/payment-slips`,
        formData,
        {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success("ส่งข้อมูลการชำระเงินสำเร็จ!");
        setShowPaymentForm(false);
        setSelectedSubject(null);
        setPaymentSlip(null);
        fetchCompletedSubjects(); // Refresh data
      }
    } catch (error: any) {
      console.error("Error submitting payment:", error);
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCertificateDownload = async (subjectId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${apiURL}/api/data/student/certificates/${subjectId}`,
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${subjectId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("ดาวน์โหลดเกียรติบัตรสำเร็จ");
    } catch (error: any) {
      console.error("Error downloading certificate:", error);
      toast.error("เกิดข้อผิดพลาดในการดาวน์โหลดเกียรติบัตร");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'not_paid':
        return <span className="badge bg-warning">ยังไม่ชำระ</span>;
      case 'pending':
        return <span className="badge bg-info">กำลังรออนุมัติ</span>;
      case 'approved':
        return <span className="badge bg-success">อนุมัติแล้ว</span>;
      case 'rejected':
        return <span className="badge bg-danger">ไม่อนุมัติ</span>;
      default:
        return <span className="badge bg-secondary">ไม่ทราบสถานะ</span>;
    }
  };

  const closePaymentForm = () => {
    setShowPaymentForm(false);
    setSelectedSubject(null);
    setPaymentSlip(null);
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
                <div className="dashboard__content-title">
                  <h4 className="title">การชำระเงิน</h4>
                  <p className="text-muted">จัดการการชำระเงินค่าเกียรติบัตรสำหรับรายวิชาที่เรียนจบแล้ว</p>
                </div>

                {/* Completed Subjects List */}
                <div className="dashboard__table-wrap">
                  {isLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">กำลังโหลด...</span>
                      </div>
                      <p className="mt-2">กำลังโหลดข้อมูลรายวิชา...</p>
                    </div>
                  ) : error ? (
                    <div className="alert alert-danger" role="alert">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      {error}
                    </div>
                  ) : completedSubjects.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="alert alert-info" role="alert">
                        <i className="fas fa-info-circle me-2"></i>
                        ยังไม่มีรายวิชาที่เรียนจบ
                      </div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>รหัสวิชา</th>
                            <th>ชื่อรายวิชา</th>
                            <th>หน่วยกิต</th>
                            <th>วันที่เรียนจบ</th>
                            <th>ค่าธรรมเนียม</th>
                            <th>สถานะการชำระ</th>
                            <th>การจัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {completedSubjects.map((subject) => (
                            <tr key={subject.subject_id}>
                              <td className="fw-bold">{subject.subject_code}</td>
                              <td>{subject.subject_name}</td>
                              <td className="text-center">{subject.credits}</td>
                              <td>{new Date(subject.completion_date).toLocaleDateString('th-TH')}</td>
                              <td className="fw-bold text-success">
                                ฿{subject.payment_amount.toLocaleString()}
                              </td>
                              <td>{getStatusBadge(subject.payment_status)}</td>
                              <td>
                                <div className="d-flex gap-1">
                                  {subject.payment_status === 'not_paid' && (
                                    <button
                                      className="btn btn-sm btn-primary"
                                      onClick={() => handlePaymentClick(subject)}
                                      title="ชำระเงิน"
                                    >
                                      <i className="fas fa-credit-card me-1"></i>
                                      ชำระเงิน
                                    </button>
                                  )}
                                  {subject.payment_status === 'approved' && subject.certificate_available && (
                                    <button
                                      className="btn btn-sm btn-success"
                                      onClick={() => handleCertificateDownload(subject.subject_id)}
                                      title="ดาวน์โหลดเกียรติบัตร"
                                    >
                                      <i className="fas fa-download me-1"></i>
                                      เกียรติบัตร
                                    </button>
                                  )}
                                  {subject.payment_status === 'rejected' && (
                                    <button
                                      className="btn btn-sm btn-warning"
                                      onClick={() => handlePaymentClick(subject)}
                                      title="ชำระเงินใหม่"
                                    >
                                      <i className="fas fa-redo me-1"></i>
                                      ชำระใหม่
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && selectedSubject && (
        <div className="modal-overlay" style={{ 
          position: "fixed", 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: "rgba(0,0,0,0.5)", 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          zIndex: 1000 
        }}>
          <div className="modal-content" style={{ 
            backgroundColor: "white", 
            padding: "30px", 
            borderRadius: "10px", 
            width: "90%", 
            maxWidth: "600px", 
            maxHeight: "90vh", 
            overflowY: "auto",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
          }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0">ชำระเงินค่าเกียรติบัตร</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={closePaymentForm}
                aria-label="Close"
              ></button>
            </div>

            <div className="mb-4 p-3 bg-light rounded">
              <h6 className="mb-2">รายละเอียดรายวิชา</h6>
              <p className="mb-1"><strong>รหัสวิชา:</strong> {selectedSubject.subject_code}</p>
              <p className="mb-1"><strong>ชื่อรายวิชา:</strong> {selectedSubject.subject_name}</p>
              <p className="mb-1"><strong>หน่วยกิต:</strong> {selectedSubject.credits}</p>
              <p className="mb-0"><strong>ค่าธรรมเนียม:</strong> <span className="text-success fw-bold">฿{selectedSubject.payment_amount.toLocaleString()}</span></p>
            </div>

            <form onSubmit={handlePaymentSubmit}>
              {/* Bank Account Selection */}
              <div className="mb-3">
                <label htmlFor="bankAccount" className="form-label">
                  <strong>บัญชีปลายทาง</strong>
                </label>
                <select
                  id="bankAccount"
                  className="form-select"
                  value={selectedBankAccount || ''}
                  onChange={(e) => setSelectedBankAccount(Number(e.target.value))}
                  required
                >
                  <option value="">-- เลือกบัญชีที่โอนเงิน --</option>
                  {bankAccounts.map((account) => (
                    <option key={account.account_id} value={account.account_id}>
                      {account.bank_name} - {account.account_name} ({account.account_number})
                      {account.is_default && ' (แนะนำ)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Bank Account Details */}
              {selectedBankAccount && (
                <div className="mb-3 p-3 border rounded bg-primary bg-opacity-10">
                  {(() => {
                    const account = bankAccounts.find(acc => acc.account_id === selectedBankAccount);
                    return account ? (
                      <div>
                        <h6 className="text-primary mb-2">ข้อมูลการโอนเงิน</h6>
                        <p className="mb-1"><strong>ธนาคาร:</strong> {account.bank_name} {account.bank_code && `(${account.bank_code})`}</p>
                        <p className="mb-1"><strong>ชื่อบัญชี:</strong> {account.account_name}</p>
                        <p className="mb-1"><strong>เลขบัญชี:</strong> <span className="fw-bold">{account.account_number}</span></p>
                        {account.branch_name && <p className="mb-1"><strong>สาขา:</strong> {account.branch_name}</p>}
                        <p className="mb-0"><strong>จำนวนเงิน:</strong> <span className="text-success fw-bold">฿{selectedSubject.payment_amount.toLocaleString()}</span></p>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {/* Payment Slip Upload */}
              <div className="mb-3">
                <label htmlFor="paymentSlip" className="form-label">
                  <strong>อัปโหลดสลิปการโอนเงิน</strong> <span className="text-danger">*</span>
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="paymentSlip"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={handleSlipUpload}
                  required
                />
                <div className="form-text">รองรับไฟล์ JPG, PNG, PDF (ขนาดไม่เกิน 5MB)</div>
              </div>

              {/* Preview uploaded file */}
              {paymentSlip && (
                <div className="mb-3">
                  <div className="alert alert-success d-flex align-items-center">
                    <i className="fas fa-check-circle me-2"></i>
                    <span>เลือกไฟล์: {paymentSlip.name}</span>
                  </div>
                </div>
              )}

              {/* Submit buttons */}
              <div className="d-flex justify-content-end gap-2">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={closePaymentForm}
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
                      กำลังส่งข้อมูล...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane me-2"></i>
                      ส่งข้อมูลการชำระเงิน
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default StudentPaymentArea;
