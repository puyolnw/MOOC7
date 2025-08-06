import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminSidebar from "../../../dashboard-common/AdminSidebar";
import InstructorSidebar from "../../../dashboard-common/DashboardSidebar";
import DashboardBanner from "../../../dashboard-common/AdminBanner";
import AddSubjects from "../../../../forms/Course/Subjects/AddSubjects";

interface AddSubjectsAreaProps {
  isEmbedded?: boolean;
  onSubmit?: (subjectData: any) => void;
}

const AddSubjectsArea: React.FC<AddSubjectsAreaProps> = ({ isEmbedded = false, onSubmit }) => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<number | null>(null);

  // ดึงข้อมูล role ของผู้ใช้จาก localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUserRole(parsedUser.role_id);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // จัดการเมื่อมีการส่งฟอร์ม
  const handleSubmit = (subjectData: any) => {
    console.log("บันทึกข้อมูล:", subjectData);

    // แสดง notification ตรงกลางหน้าจอ
    toast.success("บันทึกข้อมูลสำเร็จ!", {
      position: "top-center", // เปลี่ยนเป็น top-center
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    if (isEmbedded && onSubmit) {
      onSubmit(subjectData);
      return;
    }

    // รอให้ notification แสดงก่อนนำทาง
    setTimeout(() => {
    }, 3500);
  };

  // จัดการเมื่อมีการยกเลิก
  const handleCancel = () => {
    // นำทางกลับไปยังหน้าที่เหมาะสมตาม role
    if (userRole === 2) { // อาจารย์
      navigate("/ins-creditbank");
    } else { // แอดมิน
      navigate("/admin-creditbank");
    }
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

  // เลือก Sidebar ตาม role
  const SidebarComponent = userRole === 2 ? InstructorSidebar : AdminSidebar;

  // แสดงแบบปกติเมื่อใช้งานเป็นหน้าเต็ม
  return (
    <section className="dashboard__area section-pb-120">
      <div className="container">
        <DashboardBanner />
        <div className="dashboard__inner-wrap">
          <div className="row">
            <SidebarComponent />
            <div className="dashboard__content-area col-lg-9">
              <div className="dashboard__content-main">
           
                
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