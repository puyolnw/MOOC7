import DashboardCounter from "./DashboardCounter"
import DashboardReviewTable from "./DashboardReviewTable"
import IconPanelLayout from "../../dashboard-common/IconPanelLayout"

const DashboardHomeArea = () => {
   return (
      <IconPanelLayout>
         <div className="dashboard__count-wrap">
            <div className="dashboard__content-title">
               <h4 className="title">แดชบอร์ด</h4>
            </div>
            <div className="row">
               <DashboardCounter />
            </div>
         </div>
         <div className="dashboard__content-wrap">
            <div className="dashboard__content-title">
               <h4 className="title">วิชาของฉัน</h4>
            </div>
            <div className="row">
               <div className="col-12">
                  <div className="dashboard__review-table">
                     <DashboardReviewTable />
                  </div>
               </div>
            </div>
         </div>
      </IconPanelLayout>
   )
}

export default DashboardHomeArea
