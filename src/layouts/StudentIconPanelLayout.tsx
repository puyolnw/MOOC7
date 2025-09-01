import React from 'react';
import StudentIconPanel from '../dashboard/dashboard-common/StudentIconPanel';
import HeaderOne from './headers/HeaderOne';
import FooterOne from './footers/FooterOne';
import DashboardBannerTwo from '../dashboard/dashboard-common/DashboardBannerTwo';

interface StudentIconPanelLayoutProps {
  children: React.ReactNode;
}

const StudentIconPanelLayout: React.FC<StudentIconPanelLayoutProps> = ({ children }) => {
  return (
    <>
      <div style={{ position: 'relative', zIndex: 1001, backgroundColor: '#ffffff' }}>
        <HeaderOne />
      </div>
      <StudentIconPanel isOpen={true} />
      <section className="dashboard__area section-pb-120" style={{ position: 'relative', zIndex: 0 }}>
        <div className="container">
          <DashboardBannerTwo />
          <div className="dashboard__inner-wrap" style={{ marginTop: 20 }}>
            <div className="row">
              <div className="dashboard__content-area col-12">
                <div className="dashboard__content-main">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <FooterOne />
    </>
  );
};

export default StudentIconPanelLayout;
