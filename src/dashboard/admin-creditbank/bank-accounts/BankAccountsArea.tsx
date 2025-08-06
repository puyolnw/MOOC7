import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import DashboardSidebar from "../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../dashboard-common/AdminBanner";

interface BankAccount {
  account_id: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  bank_code?: string;
  branch_name?: string;
  account_type: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

const BankAccountsArea: React.FC = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  const [formData, setFormData] = useState({
    bank_name: '',
    account_name: '',
    account_number: '',
    bank_code: '',
    branch_name: '',
    account_type: 'savings',
    is_active: true,
    is_default: false
  });

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${apiURL}/api/bank-accounts`);

      if (response.data.success) {
        setBankAccounts(response.data.bankAccounts);
      }
    } catch (error: any) {
      console.error("Error fetching bank accounts:", error);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูลบัญชีธนาคาร");
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลบัญชีธนาคาร");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        // Update existing account
        const response = await axios.put(
          `${apiURL}/api/bank-accounts/${editingAccount.account_id}`,
          formData
        );

        if (response.data.success) {
          toast.success("แก้ไขข้อมูลบัญชีธนาคารสำเร็จ");
          fetchBankAccounts();
          resetForm();
        }
      } else {
        // Create new account
        const response = await axios.post(
          `${apiURL}/api/bank-accounts`,
          formData
        );

        if (response.data.success) {
          toast.success("เพิ่มบัญชีธนาคารสำเร็จ");
          fetchBankAccounts();
          resetForm();
        }
      }
    } catch (error: any) {
      console.error("Error saving bank account:", error);
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      bank_name: account.bank_name,
      account_name: account.account_name,
      account_number: account.account_number,
      bank_code: account.bank_code || '',
      branch_name: account.branch_name || '',
      account_type: account.account_type,
      is_active: account.is_active,
      is_default: account.is_default
    });
    setShowForm(true);
  };

  const handleDelete = async (accountId: number) => {
    if (!window.confirm("คุณต้องการลบบัญชีธนาคารนี้ใช่หรือไม่?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${apiURL}/api/bank-accounts/${accountId}`
      );

      if (response.data.success) {
        toast.success("ลบบัญชีธนาคารสำเร็จ");
        fetchBankAccounts();
      }
    } catch (error: any) {
      console.error("Error deleting bank account:", error);
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาดในการลบบัญชี");
    }
  };

  const handleSetDefault = async (accountId: number) => {
    try {
      const response = await axios.post(
        `${apiURL}/api/bank-accounts/${accountId}/set-default`,
        {}
      );

      if (response.data.success) {
        toast.success("ตั้งเป็นบัญชีหลักสำเร็จ");
        fetchBankAccounts();
      }
    } catch (error: any) {
      console.error("Error setting default account:", error);
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาดในการตั้งบัญชีหลัก");
    }
  };

  const resetForm = () => {
    setFormData({
      bank_name: '',
      account_name: '',
      account_number: '',
      bank_code: '',
      branch_name: '',
      account_type: 'savings',
      is_active: true,
      is_default: false
    });
    setEditingAccount(null);
    setShowForm(false);
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
                  <h4 className="title">จัดการบัญชีธนาคาร</h4>
                  <div className="dashboard__nav-wrap">
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowForm(!showForm)}
                    >
                      {showForm ? 'ยกเลิก' : 'เพิ่มบัญชีใหม่'}
                    </button>
                  </div>
                </div>

                {/* Form for adding/editing bank account */}
                {showForm && (
                  <div className="dashboard__form-wrap mb-4">
                    <div className="card">
                      <div className="card-header">
                        <h5>{editingAccount ? 'แก้ไขบัญชีธนาคาร' : 'เพิ่มบัญชีธนาคารใหม่'}</h5>
                      </div>
                      <div className="card-body">
                        <form onSubmit={handleSubmit}>
                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-grp">
                                <label htmlFor="bank_name">ชื่อธนาคาร *</label>
                                <input
                                  type="text"
                                  id="bank_name"
                                  value={formData.bank_name}
                                  onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                                  required
                                  placeholder="เช่น ธนาคารกรุงเทพ"
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-grp">
                                <label htmlFor="account_name">ชื่อบัญชี *</label>
                                <input
                                  type="text"
                                  id="account_name"
                                  value={formData.account_name}
                                  onChange={(e) => setFormData({...formData, account_name: e.target.value})}
                                  required
                                  placeholder="ชื่อเจ้าของบัญชี"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-grp">
                                <label htmlFor="account_number">เลขบัญชี *</label>
                                <input
                                  type="text"
                                  id="account_number"
                                  value={formData.account_number}
                                  onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                                  required
                                  placeholder="123-456-7890"
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-grp">
                                <label htmlFor="bank_code">รหัสธนาคาร</label>
                                <input
                                  type="text"
                                  id="bank_code"
                                  value={formData.bank_code}
                                  onChange={(e) => setFormData({...formData, bank_code: e.target.value})}
                                  placeholder="BBL, SCB, KTB"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-grp">
                                <label htmlFor="branch_name">สาขา</label>
                                <input
                                  type="text"
                                  id="branch_name"
                                  value={formData.branch_name}
                                  onChange={(e) => setFormData({...formData, branch_name: e.target.value})}
                                  placeholder="ชื่อสาขา"
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-grp">
                                <label htmlFor="account_type">ประเภทบัญชี</label>
                                <select
                                  id="account_type"
                                  value={formData.account_type}
                                  onChange={(e) => setFormData({...formData, account_type: e.target.value})}
                                >
                                  <option value="savings">ออมทรัพย์</option>
                                  <option value="current">กระแสรายวัน</option>
                                  <option value="fixed">ประจำ</option>
                                </select>
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-check">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  id="is_active"
                                  checked={formData.is_active}
                                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                />
                                <label className="form-check-label" htmlFor="is_active">
                                  ใช้งาน
                                </label>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-check">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  id="is_default"
                                  checked={formData.is_default}
                                  onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                                />
                                <label className="form-check-label" htmlFor="is_default">
                                  บัญชีหลัก
                                </label>
                              </div>
                            </div>
                          </div>
                          <div className="form-grp mb-0">
                            <button type="submit" className="btn btn-primary me-2">
                              {editingAccount ? 'บันทึกการแก้ไข' : 'เพิ่มบัญชี'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={resetForm}>
                              ยกเลิก
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bank accounts list */}
                <div className="dashboard__table-wrap">
                  {isLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">กำลังโหลด...</span>
                      </div>
                      <p className="mt-2">กำลังโหลดข้อมูลบัญชีธนาคาร...</p>
                    </div>
                  ) : error ? (
                    <div className="alert alert-danger" role="alert">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      {error}
                    </div>
                  ) : bankAccounts.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="alert alert-info" role="alert">
                        <i className="fas fa-info-circle me-2"></i>
                        ยังไม่มีข้อมูลบัญชีธนาคาร
                      </div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>ธนาคาร</th>
                            <th>ชื่อบัญชี</th>
                            <th>เลขบัญชี</th>
                            <th>สาขา</th>
                            <th>ประเภท</th>
                            <th>สถานะ</th>
                            <th>การจัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bankAccounts.map((account) => (
                            <tr key={account.account_id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div>
                                    <strong>{account.bank_name}</strong>
                                    {account.bank_code && (
                                      <div className="text-muted small">({account.bank_code})</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td>{account.account_name}</td>
                              <td className="font-monospace">{account.account_number}</td>
                              <td>{account.branch_name || '-'}</td>
                              <td>
                                <span className="badge bg-secondary">
                                  {account.account_type === 'savings' ? 'ออมทรัพย์' : 
                                   account.account_type === 'current' ? 'กระแสรายวัน' : 'ประจำ'}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex flex-column gap-1">
                                  <span className={`badge ${account.is_active ? 'bg-success' : 'bg-danger'}`}>
                                    {account.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                                  </span>
                                  {account.is_default && (
                                    <span className="badge bg-primary">บัญชีหลัก</span>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleEdit(account)}
                                    title="แก้ไข"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  {!account.is_default && (
                                    <button
                                      className="btn btn-sm btn-outline-success"
                                      onClick={() => handleSetDefault(account.account_id)}
                                      title="ตั้งเป็นบัญชีหลัก"
                                    >
                                      <i className="fas fa-star"></i>
                                    </button>
                                  )}
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDelete(account.account_id)}
                                    title="ลบ"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
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
    </section>
  );
};

export default BankAccountsArea;
