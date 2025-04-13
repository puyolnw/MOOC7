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

const sidebar_data: DataType[] = [
   {
      id: 1,
      title: "Welcome, Jone Due",
      sidebar_details: [
         {
            id: 1,
            link: "/admin-dashboard",
            icon: "fas fa-home",
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
            id: 1,
            link: "/admin-creditbank",
            icon: "fas fa-list-ul",    
            title: "คลังหลักสูตร",
            hasSubmenu: true,
            submenu: [
               {
                  id: 1,
                  link: "/admin-creditbank",
                  title: "หลักสูตร",
               },
               {
                  id: 2,
                  link: "/admin-subjects",
                  title: "รายวิชา",
               },
               {
                  id: 3,
                  link: "/admin-lessons",
                  title: "บทเรียน",
               },
               {
                  id: 4,
                  link: "/admin-quizzes",
                  title: "แบบทดสอบ",
               },
               {
                  id: 7,
                  link: "/admin-questions",
                  title: "คำถาม",
               },
            ],
         },
         {
            id: 2,
            link: "/admin-account/instructors",
            icon: "fas fa-list-ul",    
            title: "บัญชีผู้ใช้",
            hasSubmenu: true,
            submenu: [
               {
                  id: 1,
                  link: "/admin-account/instructors",
                  title: "อาจารย์",
               },
               {
                  id: 2,
                  link: "/admin-creditbank/students",
                  title: "นักเรียน",
               }
            ],
         },
      ],
   },
   {
      id: 3,
      title: "แอดมิน",
      class_name: "mt-30",
      sidebar_details: [
         {
            id: 1,
            link: "/admin-setting",
            icon: "skillgro-settings",
            title: "ตั่งค่า",
         },
         {
            id: 2,
            link: "/",
            icon: "skillgro-logout",
            title: "ออกจากระบบ",
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
