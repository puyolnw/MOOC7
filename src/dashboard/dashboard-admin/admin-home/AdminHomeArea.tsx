import AdminCounter from "./AdminCounter"
import AdminReviewTable from "./AdminReviewTable"
import { Link } from "react-router-dom"
import BtnArrow from "../../../svg/BtnArrow"

const DashboardHomeArea = () => {

   return (
      <>
         {/* ข้อมูลสถิติหลัก */}
         <div className="dashboard__count-wrap">
            <div className="dashboard__content-title mb-4">
               <h4 className="title d-flex align-items-center">
                  <i className="fas fa-chart-pie me-2 text-primary"></i>
                  ภาพรวมระบบ
               </h4>
            </div>
            <div className="row">
               <AdminCounter />
            </div>
         </div>

         {/* เนื้อหาหลัก */}
         <div className="dashboard__content-wrap mt-4">
            <div className="dashboard__content-title">
               <h4 className="title d-flex align-items-center">
                  <i className="fas fa-graduation-cap me-2 text-success"></i>
                  หลักสูตรยอดนิยม
               </h4>
            </div>
            <div className="row">
               <div className="col-12">
                  <AdminReviewTable />
               </div>
            </div>
         </div>

         {/* ลิงก์ดูเพิ่มเติม */}
         <div className="load-more-btn text-center mt-20">
            <Link to="/admin-creditbank" className="link-btn">
               ดูหลักสูตรทั้งหมด <BtnArrow />
            </Link>
         </div>
      </>
   )
}

export default DashboardHomeArea
