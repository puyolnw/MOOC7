import React from 'react';
import AdminIconPanel from '../dashboard/dashboard-common/AdminIconPanel';
import AdminBanner from '../dashboard/dashboard-common/AdminBanner';


interface AdminIconPanelLayoutProps {
  children: React.ReactNode;
}

const AdminIconPanelLayout: React.FC<AdminIconPanelLayoutProps> = ({ children }) => {
  return (
    <>
      <AdminIconPanel isOpen={true} />
      <section className="dashboard__area section-pb-120">
        <div className="container">
          <AdminBanner />
          <div className="dashboard__inner-wrap">
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
    </>
  );
};

export default AdminIconPanelLayout;
