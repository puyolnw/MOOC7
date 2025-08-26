import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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

// Manager sidebar data - only course management, no user management
const sidebar_data: DataType[] = [
   {
      id: 1,
      title: "ภาพรวม",
      sidebar_details: [
         {
            id: 1,
            link: "/manager-creditbank",
            icon: "fas fa-chart-pie",
            title: "แดชบอร์ด",
         },
      ],
   },
   {
      id: 2,
      title: "จัดการหลักสูตร",
      class_name: "mt-40",
      sidebar_details: [
         {
            id: 3,
            link: "/manager-creditbank",
            icon: "fas fa-graduation-cap",
            title: "คลังหลักสูตร",
            hasSubmenu: true,
            submenu: [
               {
                  id: 4,
                  link: "/manager-creditbank",
                  title: "เรียกดูหลักสูตร",
               },
               {
                  id: 5,
                  link: "/manager-creditbank/create-new",
                  title: "สร้างหลักสูตรใหม่",
               },
            ],
         },
      ],
   },
   {
      id: 6,
      title: "รายงาน",
      class_name: "mt-40",
      sidebar_details: [
         {
            id: 7,
            link: "/manager-reports/students",
            icon: "fas fa-chart-bar",
            title: "รายงานนักศึกษาและนักเรียน",
         },
      ],
   },
];

const ManagerSidebar = () => {
   const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
   const location = useLocation();
   const currentPath = location.pathname;

   const toggleSubmenu = (id: number) => {
      setOpenSubmenu(openSubmenu === id ? null : id);
   };

   // Check if a menu item is active
   const isActive = (path: string) => {
      return currentPath === path;
   };

   // ฟังก์ชันใหม่สำหรับตรวจสอบ parent menu (ใช้ startsWith เฉพาะกรณีที่ไม่มี submenu)
   const isParentActive = (path: string, hasSubmenu: boolean = false) => {
      if (hasSubmenu) {
         // ถ้ามี submenu ให้ตรวจสอบแค่ว่า path ตรงกันหรือไม่
         return currentPath === path;
      } else {
         // ถ้าไม่มี submenu ให้ใช้ startsWith เหมือนเดิม
         return currentPath === path || currentPath.startsWith(path + '/');
      }
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
                                    className={`menu-item ${isParentActive(list.link, list.hasSubmenu) ? "active" : ""}`}
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

export default ManagerSidebar;
