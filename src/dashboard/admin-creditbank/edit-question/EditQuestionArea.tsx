import React from "react";
import DashboardSidebar from "../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../dashboard-common/AdminBanner";
import EditQuestions from "../../../forms/Course/EditQuestions"; 

const EditQuestionsArea: React.FC = () => {

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
                  <h2 className="title text-muted">แก้ไขคำถาม</h2>
                </div>
                <EditQuestions />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditQuestionsArea;
