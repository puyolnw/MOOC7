import React from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify"; // นำเข้า toast และ ToastContainer
import "react-toastify/dist/ReactToastify.css"; // นำเข้า CSS ของ react-toastify

import AdminBanner from "../../../dashboard-common/AdminBanner";
import AddStudents from "../../../../forms/Account/AddStudents";

interface CreateAccountInstructorsAreaProps {
  isEmbedded?: boolean;
  onSubmit?: (instructorData: any) => void;
}

const CreateAccountStudentsArea: React.FC<CreateAccountInstructorsAreaProps> = ({ isEmbedded = false, onSubmit }) => {
  const navigate = useNavigate();

  // จัดการเมื่อมีการส่งฟอร์ม
  const handleSubmit = (instructorData: any) => {
    console.log("บันทึกข้อมูลนักศึกษา:", instructorData);

    if (isEmbedded && onSubmit) {
      onSubmit(instructorData);
      // ในกรณีที่เป็น embedded form คอมโพเนนต์แม่จะจัดการการแจ้งเตือนหรือการตอบสนองอื่นๆ
      return;
    }

    // แสดงการแจ้งเตือนเมื่อบันทึกข้อมูลสำเร็จ
    toast.success("บันทึกข้อมูลนักศึกษาสำเร็จ!", {
      position: "top-center", // กำหนดตำแหน่งให้อยู่ตรงกลางด้านบน
      autoClose: 3000,       // ปิดอัตโนมัติใน 3 วินาที
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",        // สามารถเปลี่ยนเป็น "dark" ได้ตามต้องการ
    });

    // หน่วงเวลาเล็กน้อยเพื่อให้ Notification แสดงผลก่อนการนำทาง
    setTimeout(() => {
      navigate("/admin-account/students");
    }, 3500); // 3.5 วินาที (เพื่อให้ Notification แสดงครบถ้วน)
  };

  // จัดการเมื่อมีการยกเลิก
  const handleCancel = () => {
    navigate("/admin-account/students");
  };

  // ถ้าเป็นแบบ embedded ให้แสดงเฉพาะฟอร์ม
  if (isEmbedded) {
    return (
      <div className="embedded-students-form">
        <AddStudents
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
        <AdminBanner />
        <div className="dashboard__inner-wrap">
          <div className="row">
            <div className="dashboard__content-area col-12">
              <div className="dashboard__content-main">
                <div className="dashboard__content-header mb-4">
                  <h2 className="title text-muted">เพิ่มนักศึกษาใหม่</h2>
                  <p className="desc">สร้างบัญชีนักศึกษาใหม่สำหรับระบบ</p>
                </div>

                <AddStudents
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />
                
                {/* เพิ่ม ToastContainer ที่นี่เพื่อให้ Notification แสดงผลได้ */}
                <ToastContainer />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreateAccountStudentsArea;