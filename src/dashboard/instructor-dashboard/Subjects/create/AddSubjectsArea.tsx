import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardBanner from "../../../dashboard-common/DashboardBanner";
import DashboardSidebar from "../../../dashboard-common/DashboardSidebar";
import AddSubjects from "../../../../forms/Course/Subjects/AddSubjects";

interface AddSubjectsAreaProps {
  isEmbedded?: boolean;
  onSubmit?: (subjectData: any) => void;
}

const AddSubjectsArea: React.FC<AddSubjectsAreaProps> = ({ isEmbedded = false, onSubmit }) => {
  const navigate = useNavigate();
  
  // จัดการเมื่อมีการส่งฟอร์ม
  const handleSubmit = (subjectData: any) => {
    console.log("บันทึกข้อมูล:", subjectData);
    
    if (isEmbedded && onSubmit) {
      onSubmit(subjectData);
      return;
    }
    
    // แสดงข้อความสำเร็จ
    alert("บันทึกข้อมูลสำเร็จ");
    
    // กลับไปยังหน้ารายการรายวิชา (อาจารย์)
    navigate("/ins-creditbank");
  };
  
  // จัดการเมื่อมีการยกเลิก
  const handleCancel = () => {
    navigate("/ins-creditbank");
  };
  
  // ถ้าเป็นแบบ embedded ให้แสดงเฉพาะฟอร์ม
  if (isEmbedded) {
    return (
      <div className="embedded-subject-form">
        <AddSubjects 
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
                  <h2 className="title text-muted">เพิ่มรายวิชาใหม่</h2>
                  <p className="desc">สร้างรายวิชาใหม่สำหรับหลักสูตร</p>
                </div>
                
                <AddSubjects 
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

export default AddSubjectsArea;
