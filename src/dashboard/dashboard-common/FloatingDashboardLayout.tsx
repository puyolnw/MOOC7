import React, { useState, useEffect } from "react";
import FloatingSidebar from "./FloatingSidebar";
import DashboardBanner from "./DashboardBanner";

interface FloatingDashboardLayoutProps {
   children: React.ReactNode;
}

const FloatingDashboardLayout: React.FC<FloatingDashboardLayoutProps> = ({ children }) => {
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
   const [isMobile, setIsMobile] = useState(false);

   // Check if mobile
   useEffect(() => {
      const checkMobile = () => {
         setIsMobile(window.innerWidth <= 768);
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);
      
      return () => window.removeEventListener('resize', checkMobile);
   }, []);

   // Load sidebar state from localStorage
   useEffect(() => {
      const savedState = localStorage.getItem('dashboard-sidebar-state');
      if (savedState) {
         try {
            const state = JSON.parse(savedState);
            setIsSidebarOpen(state.isOpen || false);
            setIsSidebarCollapsed(state.isCollapsed || false);
         } catch (error) {
            console.error("Error loading sidebar state:", error);
         }
      }
   }, []);

   // Save sidebar state to localStorage
   useEffect(() => {
      const state = {
         isOpen: isSidebarOpen,
         isCollapsed: isSidebarCollapsed
      };
      localStorage.setItem('dashboard-sidebar-state', JSON.stringify(state));
   }, [isSidebarOpen, isSidebarCollapsed]);

   const handleToggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
   };

   const handleCollapseSidebar = () => {
      setIsSidebarCollapsed(!isSidebarCollapsed);
      if (isSidebarCollapsed) {
         setIsSidebarOpen(true);
      }
   };

   const handleOverlayClick = () => {
      if (isMobile) {
         setIsSidebarOpen(false);
      }
   };

   const getContentClass = () => {
      if (isMobile) {
         return "dashboard__inner-wrap";
      }
      if (isSidebarCollapsed) return "dashboard__inner-wrap sidebar-collapsed";
      if (isSidebarOpen) return "dashboard__inner-wrap sidebar-open";
      return "dashboard__inner-wrap";
   };

   return (
      <section className="dashboard__area section-pb-120">
         <div className="container-fluid" style={{ padding: 0 }}>
            {/* Floating Sidebar */}
            <FloatingSidebar
               isOpen={isSidebarOpen}
               isCollapsed={isSidebarCollapsed}
               onToggle={handleToggleSidebar}
               onCollapse={handleCollapseSidebar}
            />

            {/* Overlay for mobile */}
            {isSidebarOpen && isMobile && (
               <div 
                  className="sidebar-overlay active"
                  onClick={handleOverlayClick}
               />
            )}

            {/* Main Content */}
            <div className={getContentClass()}>
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

export default FloatingDashboardLayout;


