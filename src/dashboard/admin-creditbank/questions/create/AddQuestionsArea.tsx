import React from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify"; // Import toast และ ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import CSS ของ react-toastify
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

    // แสดง notification ที่สวยงาม
    toast.success("บันทึกข้อมูลสำเร็จ!", {
      position: "top-center", // กำหนดตำแหน่งให้อยู่ตรงกลางด้านบน
      autoClose: 3000, // ปิดอัตโนมัติใน 3 วินาที
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light", // ใช้ธีม light หรือ dark ได้
    });

    // หากเป็นแบบ embedded ให้ไม่ต้องนำทางไปไหน เพราะคอมโพเนนต์แม่จะจัดการเอง
    if (isEmbedded) {
      // ในกรณี isEmbedded และ onSubmit ถูกส่งมา (ซึ่งใน props นี้ไม่มี onSubmit)
      // คุณอาจจะต้องพิจารณาว่า AddQuestionsArea ที่เป็น embedded ควรทำอะไรต่อ
      // หรือว่าคอมโพเนนต์แม่จะจัดการ logic หลังจาก AddQuestions.onSubmit ถูกเรียก
      return;
    }

    // หน่วงเวลาเล็กน้อยเพื่อให้ Notification แสดงผลก่อนการนำทาง
    setTimeout(() => {
      navigate("/admin-questions");
    }, 3500); // 3.5 วินาที (เผื่อเวลา animation ของ toast)
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
          onCancel={handleCancel} // หรือ onCancel={() => {}} ถ้าไม่อยากให้ปุ่มยกเลิกใน embedded form ทำงาน
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
      {/* เพิ่ม ToastContainer ตรงนี้เพื่อให้ Notification แสดงผลได้ */}
      <ToastContainer />
    </section>
  );
};

export default AddQuestionsArea;