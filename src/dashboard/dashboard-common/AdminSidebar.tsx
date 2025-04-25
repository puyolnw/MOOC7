import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom"; // Import useLocation
import "./css/CssAdminSidebar.css";

interface SubMenuType {
  id: number;
  link: string;
  title: string;
}

interface SidebarDetailType {
  id: number;
  link: string;
  icon: string;
  title: string;
  hasSubmenu?: boolean;
  submenu?: SubMenuType[];
}

interface DataType {
  id: number;
  title: string;
  class_name?: string;
  sidebar_details: SidebarDetailType[];
}

// Update the sidebar_data array with better icons
const sidebar_data: DataType[] = [
   {
      id: 1,
      title: "Welcome, Jone Due",
      sidebar_details: [
         {
            id: 1,
            link: "/admin-dashboard",
            icon: "fas fa-chart-line", // Changed to analytics icon
            title: "แดชบอร์ด",
         },
      ],
   },
   {
      id: 2,
      title: "การจัดการ",
      class_name: "mt-40",
      sidebar_details: [
         {
            id: 3,
            link: "/admin-creditbank",
            icon: "fas fa-graduation-cap", // Changed to education icon    
            title: "คลังหลักสูตร",
            hasSubmenu: true,
            submenu: [
               {
                  id: 4,
                  link: "/admin-creditbank",
                  title: "หลักสูตร",
               },
               {
                  id: 5,
                  link: "/admin-subjects",
                  title: "รายวิชา",
               },
               {
                  id: 6,
                  link: "/admin-lessons",
                  title: "บทเรียน",
               },
               {
                  id: 7,
                  link: "/admin-quizzes",
                  title: "แบบทดสอบ",
               },
               {
                  id: 8,
                  link: "/admin-questions",
                  title: "คำถาม",
               },
            ],
         },
         {
            id: 9,
            link: "/admin-account/instructors",
            icon: "fas fa-users-cog", // Changed to user management icon    
            title: "บัญชีผู้ใช้",
            hasSubmenu: true,
            submenu: [
               {
                  id: 10,
                  link: "/admin-account/instructors",
                  title: "อาจารย์",
               },
               {
                  id: 11,
                  link: "/admin-account/students",
                  title: "นักเรียน",
               }
            ],
         },
      ],
   },
];


const AdminSidebar = () => {
   const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
   const location = useLocation(); // Get current location
   const currentPath = location.pathname;

   const toggleSubmenu = (id: number) => {
      if (openSubmenu === id) {
         setOpenSubmenu(null);
      } else {
         setOpenSubmenu(id);
      }
   };

   // Check if a menu item is active
   const isActive = (path: string) => {
      return currentPath === path || currentPath.startsWith(path + '/');
   };

   // Check if a submenu item is active
   const isSubmenuActive = (list: SidebarDetailType) => {
      if (!list.submenu) return false;
      return list.submenu.some(item => isActive(item.link));
   };

   // Auto-open submenu if a child is active
   React.useEffect(() => {
      sidebar_data.forEach(category => {
         category.sidebar_details.forEach(item => {
            if (item.hasSubmenu && isSubmenuActive(item)) {
               setOpenSubmenu(item.id);
            }
         });
      });
   }, [currentPath]);

   return (
      <div className="col-lg-3">
         <div className="dashboard__sidebar-wrap">
            {sidebar_data.map((item) => (
               <React.Fragment key={item.id}>
                  <div className={`dashboard__sidebar-title mb-20 ${item.class_name}`}>
                     <h6 className="title">{item.title}</h6>
                  </div>
                  <nav className="dashboard__sidebar-menu">
                     <ul className="list-wrap">
                        {item.sidebar_details.map((list) => (
                           <li key={list.id} className={list.hasSubmenu ? "has-submenu" : ""}>
                              {list.hasSubmenu ? (
                                 <>
                                    <a 
                                       href="#!" 
                                       onClick={(e) => {
                                          e.preventDefault();
                                          toggleSubmenu(list.id);
                                       }}
                                       className={`menu-item ${openSubmenu === list.id ? "active" : ""} ${isSubmenuActive(list) ? "parent-active" : ""}`}
                                    >
                                       <span className="menu-icon">
                                          <i className={list.icon}></i>
                                       </span>
                                       <span className="menu-text">{list.title}</span>
                                       <span className="menu-arrow">
                                          <i className={`fas ${openSubmenu === list.id ? "fa-chevron-down" : "fa-chevron-right"}`}></i>
                                       </span>
                                    </a>
                                    
                                    <ul className={`submenu ${openSubmenu === list.id ? "open" : ""}`}>
                                       {list.submenu?.map((subItem) => (
                                          <li key={subItem.id}>
                                             <Link 
                                                to={subItem.link} 
                                                className={`submenu-link ${isActive(subItem.link) ? "active" : ""}`}
                                             >
                                                <i className="fas fa-circle submenu-icon"></i>
                                                <span>{subItem.title}</span>
                                             </Link>
                                          </li>
                                       ))}
                                    </ul>
                                 </>
                              ) : (
                                 <Link 
                                    to={list.link} 
                                    className={`menu-item ${isActive(list.link) ? "active" : ""}`}
                                 >
                                    <span className="menu-icon">
                                       <i className={list.icon}></i>
                                    </span>
                                    <span className="menu-text">{list.title}</span>
                                 </Link>
                              )}
                           </li>
                        ))}
                     </ul>
                  </nav>
               </React.Fragment>
            ))}
         </div>
      </div>
   );
};

export default AdminSidebar;
