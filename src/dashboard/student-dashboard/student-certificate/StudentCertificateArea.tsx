import { Link } from "react-router-dom";
import DashboardBannerTwo from "../../dashboard-common/DashboardBannerTwo";
import DashboardSidebarTwo from "../../dashboard-common/DashboardSidebarTwo";
import "./StudentCertificate.css"; // ไฟล์ CSS สำหรับตกแต่งหน้า

const StudentCertificateArea = () => {
   // ตัวอย่างข้อมูลหลักสูตรที่เรียนสำเร็จ
   const completedCourses = [
      { id: 1, name: "การพัฒนาเว็บด้วย React", date: "15 มีนาคม 2025" },
      { id: 2, name: "การออกแบบ UX/UI เบื้องต้น", date: "10 กุมภาพันธ์ 2025" },
      { id: 3, name: "การเขียนโปรแกรมด้วย Python", date: "5 มกราคม 2025" },
   ];

   // ฟังก์ชันสำหรับดาวน์โหลดใบรับรอง
   const handleDownload = (courseName: string) => {
      alert(`กำลังดาวน์โหลดใบรับรองสำหรับหลักสูตร: ${courseName}`);
      // ที่นี่คุณสามารถเพิ่ม logic สำหรับการดาวน์โหลดไฟล์จริง
   };

   return (
      <section className="dashboard__area section-pb-120">
         <div className="container">
            <DashboardBannerTwo />
            <div className="dashboard__inner-wrap">
               <div className="row">
                  <DashboardSidebarTwo />
                  <div className="col-lg-9">
                     <div className="dashboard__content-wrap">
                        <div className="dashboard__content-title">
                           <h4 className="title">ใบรับรองความสำเร็จ</h4>
                        </div>
                        <div className="row">
                           <div className="col-12">
                              <div className="dashboard__review-table">
                                 <p className="mb-4">
                                    ด้านล่างนี้คือรายวิชาที่คุณได้เรียนสำเร็จแล้ว คุณสามารถดาวน์โหลดใบรับรองได้โดยคลิกที่ปุ่ม "ดาวน์โหลด"
                                 </p>
                                 <table className="table table-borderless">
                                    <thead>
                                       <tr>
                                          <th>#</th>
                                          <th>ชื่อวิชา</th>
                                          <th>วันที่สำเร็จ</th>
                                          <th>ใบรับรอง</th>
                                       </tr>
                                    </thead>
                                    <tbody>
                                       {completedCourses.map((course, index) => (
                                          <tr key={course.id}>
                                             <td>{index + 1}</td>
                                             <td>
                                                <Link to="/course-details">{course.name}</Link>
                                             </td>
                                             <td>{course.date}</td>
                                             <td>
                                                <div className="dashboard__review-action">
                                                   <button
                                                      className="btn btn-primary btn-sm"
                                                      onClick={() => handleDownload(course.name)}
                                                   >
                                                      ดาวน์โหลด
                                                   </button>
                                                </div>
                                             </td>
                                          </tr>
                                       ))}
                                    </tbody>
                                 </table>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default StudentCertificateArea
