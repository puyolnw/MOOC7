import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../../dashboard-common/AdminBanner";
import EditInstuctors from "../../../../forms/Account/EditInstuctors";

interface CreateAccountInstructorsAreaProps {
  isEmbedded?: boolean;
  onSubmit?: (instructorData: any) => void;
}

const EditAccountInstructorsArea: React.FC<CreateAccountInstructorsAreaProps> = ({ isEmbedded = false, onSubmit }) => {
  const navigate = useNavigate();
  
  // จัดการเมื่อมีการส่งฟอร์ม
  const handleSubmit = (instructorData: any) => {
    console.log("บันทึกข้อมูลผู้สอน:", instructorData);
    
    if (isEmbedded && onSubmit) {
      onSubmit(instructorData);
      return;
    }
    
    // กลับไปยังหน้ารายการผู้สอน
    navigate("/admin-account/instructors");
  };
  
  // จัดการเมื่อมีการยกเลิก
  const handleCancel = () => {
    navigate("/admin-account/instructors");
  };
  
  // ถ้าเป็นแบบ embedded ให้แสดงเฉพาะฟอร์ม
  if (isEmbedded) {
    return (
      <div className="embedded-instructor-form">
        <EditInstuctors
          onSubmit={handleSubmit}
          onCancel={() => onSubmit && onSubmit(null)}
        />
      </div>
    );
  }
  
  // แสดงแบบปกติเมื่อใช้งานเป็นหน้าเต็ม
  return (
    <section className="dashboard__area section-pb-120">
      <div className="container">
        <DashboardBanner />
        <div className="dashboard__inner-wrap">
          <div className="row">
            <DashboardSidebar />
            <div className="dashboard__content-area col-lg-9">
              <div className="dashboard__content-main">
                <div className="dashboard__content-header mb-4">
                  <h2 className="title text-muted">แก้ไขผู้สอน</h2>
                  <p className="desc">แก้ไขผู้สอนสำหรับระบบ</p>
                </div>
                
                <EditInstuctors
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditAccountInstructorsArea;
