import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardSidebar from "../../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../../dashboard-common/AdminBanner";
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
    navigate("/admin-creditbank");
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