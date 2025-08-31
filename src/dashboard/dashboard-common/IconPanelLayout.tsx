import React from "react";
import IconPanel from "./IconPanel";
import DashboardBanner from "./DashboardBanner";

interface IconPanelLayoutProps {
   children: React.ReactNode;
}

const IconPanelLayout: React.FC<IconPanelLayoutProps> = ({ children }) => {
   return (
      <section className="dashboard__area section-pb-120">
         <div className="container-fluid" style={{ padding: 0 }}>
            {/* Icon Panel */}
            <IconPanel
               isOpen={false} // Always false since IconPanel manages its own visibility
            />

            {/* Main Content */}
            <div className="dashboard__inner-wrap">
               <div className="container">
                  <DashboardBanner />
                  <div className="row">
                     <div className="col-12">
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


