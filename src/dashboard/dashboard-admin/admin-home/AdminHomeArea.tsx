import AdminBanner from "../../dashboard-common/AdminBanner"
import AdminCounter from "./AdminCounter"
import AdminReviewTable from "./AdminReviewTable"
import { Link } from "react-router-dom"
import DashboardSidebar from "../../dashboard-common/AdminSidebar"
import BtnArrow from "../../../svg/BtnArrow"

const DashboardHomeArea = () => {
   return (
      <section className="dashboard__area section-pb-120">
         <div className="container">
            <AdminBanner />
            <div className="dashboard__inner-wrap">
               <div className="row">
                  <DashboardSidebar />
                  <div className="col-lg-9">
                     <div className="dashboard__count-wrap">
                        <div className="dashboard__content-title">
                           <h4 className="title">แดชบอร์ด</h4>
                        </div>
                        <div className="row">
                           <AdminCounter />
                        </div>
                     </div>
                     <div className="dashboard__content-wrap">
                        <div className="dashboard__content-title">
                           <h4 className="title">คอร์สทั้งหมด</h4>
                        </div>
                        <div className="row">
                           <div className="col-12">
                              <div className="dashboard__review-table">
                                 <AdminReviewTable />
                              </div>
                           </div>
                        </div>
                        <div className="load-more-btn text-center mt-20">
                           <Link to="/admin-creditbank" className="link-btn">ดูหลักสูตรทั้งหมด <BtnArrow /></Link>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default DashboardHomeArea
