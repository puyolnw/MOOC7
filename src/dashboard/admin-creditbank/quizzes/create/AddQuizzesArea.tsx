import React from "react";
import {useNavigate } from "react-router-dom";
import DashboardSidebar from "../../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../../dashboard-common/AdminBanner";
import AddQuizzes from "../../../../forms/Course/Quizzes/AddQuizzes";

interface AddQuizzesAreaProps {
  isEmbedded?: boolean;
  onSubmit?: (quizData: any) => void;
}

const AddQuizzesArea: React.FC<AddQuizzesAreaProps> = ({ isEmbedded = false, onSubmit }) => {
  const navigate = useNavigate();
  
  // จัดการเมื่อมีการส่งฟอร์ม
  const handleSubmit = (quizData: any) => {
    console.log("บันทึกข้อมูล:", quizData);
    
    if (isEmbedded && onSubmit) {
      onSubmit(quizData);
      return;
    }
    
    // แสดงข้อความสำเร็จ
    alert("บันทึกข้อมูลสำเร็จ");
    
    // กลับไปยังหน้ารายการแบบทดสอบ
    navigate("/admin-quizzes");
  };
  
  // จัดการเมื่อมีการยกเลิก
  const handleCancel = () => {
    navigate("/admin-quizzes");
  };
  
  // ถ้าเป็นแบบ embedded ให้แสดงเฉพาะฟอร์ม
  if (isEmbedded) {
    return (
      <div className="embedded-quiz-form">
        <AddQuizzes 
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
                  <h2 className="title text-muted">เพิ่มแบบทดสอบใหม่</h2>
                  <p className="desc">สร้างแบบทดสอบใหม่สำหรับวัดผลการเรียนรู้</p>
                </div>
                
                <AddQuizzes 
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

export default AddQuizzesArea;
