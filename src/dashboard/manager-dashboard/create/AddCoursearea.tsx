import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../../dashboard-common/ManagerSidebar";
import DashboardBanner from "../../dashboard-common/AdminBanner";
import AddCourses from "../../../forms/Course/Courses/AddCourses";

const AddCoursearea: React.FC = () => {
  const navigate = useNavigate();
  
  // จัดการเมื่อมีการส่งฟอร์ม
  const handleSubmit = (courseData: any) => {
    console.log("บันทึกข้อมูลหลักสูตร:", courseData,handleSubmit);
    
    // ในแอปพลิเคชันจริง คุณจะส่งข้อมูลนี้ไปยัง backend
    
    alert("บันทึกข้อมูลหลักสูตรสำเร็จ");
    navigate("/manager-creditbank");
  };
  
  // จัดการเมื่อมีการยกเลิก
  const handleCancel = () => {
    navigate("/manager-creditbank");
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
                <div className="dashboard__content-header mb-4">
  
                </div>
                
                <AddCourses 
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

export default AddCoursearea;
