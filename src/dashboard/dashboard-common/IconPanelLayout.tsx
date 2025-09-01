import React from "react";
import IconPanel from "./IconPanel";
import DashboardBanner from "./DashboardBanner";

interface IconPanelLayoutProps {
   children: React.ReactNode;
}

const IconPanelLayout: React.FC<IconPanelLayoutProps> = ({ children }) => {
   return (
      <section className="dashboard__area section-pb-120">
         <div className="container-fluid" style={{ padding: 0, maxWidth: '100%' }}>
            {/* Icon Panel */}
            <IconPanel
               isOpen={false} // Always false since IconPanel manages its own visibility
            />

            {/* Main Content */}
            <div className="dashboard__inner-wrap" style={{ width: '100%', maxWidth: '100%' }}>
               <div className="container-fluid" style={{ padding: 0, maxWidth: '100%' }}>
                  <DashboardBanner />
                  <div className="row" style={{ margin: 0 }}>
                     <div className="col-12" style={{ padding: 0 }}>
                        {children}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
};

export default IconPanelLayout;


