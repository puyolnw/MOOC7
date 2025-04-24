import React from "react";
import DashboardSidebar from "../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../dashboard-common/AdminBanner";
import EditCourse from "../../../forms/Course/Edit/Courses/EditCourses";

const EditCourseArea: React.FC = () => {

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
                  <h2 className="title text-muted">แก้ไขหลักสูตร</h2>
                  <p className="desc">ปรับปรุงข้อมูลหลักสูตรและรายวิชาที่เกี่ยวข้อง</p>
                </div>
                <EditCourse />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditCourseArea;
