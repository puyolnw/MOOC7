import React from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify"; // Import toast และ ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import CSS ของ react-toastify

import DashboardSidebar from "../../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../../dashboard-common/AdminBanner";
import AddInstructors from "../../../../forms/Account/AddInstuctors";

interface CreateAccountInstructorsAreaProps {
  isEmbedded?: boolean;
  onSubmit?: (instructorData: any) => void;
}

const CreateAccountInstructorsArea: React.FC<CreateAccountInstructorsAreaProps> = ({ isEmbedded = false, onSubmit }) => {
  const navigate = useNavigate();

  // จัดการเมื่อมีการส่งฟอร์ม
  const handleSubmit = (instructorData: any) => {
    console.log("บันทึกข้อมูลผู้สอน:", instructorData);

    // แสดง notification เมื่อบันทึกข้อมูลสำเร็จ
    toast.success("บันทึกข้อมูลผู้สอนสำเร็จ!", {
      position: "top-center", // กำหนดตำแหน่งให้อยู่ตรงกลางด้านบน
      autoClose: 3000,       // ปิดอัตโนมัติใน 3 วินาที
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",        // ใช้ธีม light หรือ dark ได้
    });

    if (isEmbedded && onSubmit) {
      onSubmit(instructorData);
      // ในกรณีที่เป็น embedded form คอมโพเนนต์แม่จะจัดการการแจ้งเตือนหรือการตอบสนองอื่นๆ
      return;
    }

    // หน่วงเวลาเล็กน้อยเพื่อให้ Notification แสดงผลก่อนการนำทาง
    setTimeout(() => {
      navigate("/admin-account/instructors");
    }, 3500); // 3.5 วินาที (เพื่อให้ Notification แสดงครบถ้วน)
  };

  // จัดการเมื่อมีการยกเลิก
  const handleCancel = () => {
    navigate("/admin-account/instructors");
  };

  // ถ้าเป็นแบบ embedded ให้แสดงเฉพาะฟอร์ม
  if (isEmbedded) {
    return (
      <div className="embedded-instructor-form">
        <AddInstructors
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
                  <h2 className="title text-muted">เพิ่มผู้สอนใหม่</h2>
                  <p className="desc">สร้างบัญชีผู้สอนใหม่สำหรับระบบ</p>
                </div>

                <AddInstructors
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* เพิ่ม ToastContainer ตรงนี้เพื่อให้ Notification แสดงผลได้ */}
      <ToastContainer />
    </section>
  );
};

export default CreateAccountInstructorsArea;