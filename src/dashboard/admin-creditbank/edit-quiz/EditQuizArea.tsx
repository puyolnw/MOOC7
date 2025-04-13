import React from "react";
import DashboardSidebar from "../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../dashboard-common/AdminBanner";
import EditQuizzes from "../../../forms/Course/EditQuizzes"; 

const EditQuizzesArea: React.FC = () => {

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
                  <h2 className="title text-muted">แก้ไขรายการแบบทดสอบ</h2>
                </div>
                <EditQuizzes />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditQuizzesArea;
