import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../../dashboard-common/AdminBanner";
import AddQuestions from "../../../../forms/Course/Questions/AddQuestions";

interface AddQuestionsAreaProps {
  isEmbedded?: boolean;
}

const AddQuestionsArea: React.FC<AddQuestionsAreaProps> = ({ isEmbedded = false }) => {
  const navigate = useNavigate();
  
  // จัดการเมื่อมีการส่งฟอร์ม
  const handleSubmit = (questionData: any) => {
    if (!questionData) {
      return;
    }
    
    console.log("บันทึกข้อมูล:", questionData);
    
    // แสดงข้อความสำเร็จ
    alert("บันทึกข้อมูลสำเร็จ");

  };
  
  // จัดการเมื่อมีการยกเลิก
  const handleCancel = () => {
    navigate("/admin-questions");
  };
  
  // ถ้าเป็นแบบ embedded ให้แสดงเฉพาะฟอร์ม
  if (isEmbedded) {
    return (
      <div className="embedded-question-form">
        <AddQuestions 
          onSubmit={handleSubmit}
          onCancel={() => navigate("/admin-questions")}
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
                  <h2 className="title text-muted">เพิ่มคำถามใหม่</h2>
                  <p className="desc">สร้างคำถามใหม่สำหรับแบบทดสอบ</p>
                </div>
                

                  <div className="card-body">
                    <AddQuestions 
                      onSubmit={handleSubmit}
                      onCancel={handleCancel}
                    />

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddQuestionsArea;
