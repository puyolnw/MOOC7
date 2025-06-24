import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../../dashboard-common/AdminBanner";
import AddLessons from "../../../../forms/Course/Lessons/AddLessons";

interface AddLessonsAreaProps {
  isEmbedded?: boolean;
  onSubmit?: (lessonData: any) => void;
}

const AddLessonsArea: React.FC<AddLessonsAreaProps> = ({ isEmbedded = false, onSubmit }) => {
  const navigate = useNavigate();
  
  // จัดการเมื่อมีการส่งฟอร์ม
  const handleSubmit = (lessonData: any) => {
    console.log("บันทึกข้อมูล:", lessonData);
    
    if (isEmbedded && onSubmit) {
      onSubmit(lessonData);
      return;
    }
    
    // แสดงข้อความสำเร็จ
    alert("บันทึกข้อมูลสำเร็จ");

  };
  
  // จัดการเมื่อมีการยกเลิก
  const handleCancel = () => {
    navigate("/admin-lessons");
  };
  
  // ถ้าเป็นแบบ embedded ให้แสดงเฉพาะฟอร์ม
  if (isEmbedded) {
    return (
      <div className="embedded-lesson-form">
        <AddLessons 
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
                
                <AddLessons 
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

export default AddLessonsArea;
