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

// ปรับปรุง sidebar_data โดยตัดหัวข้อ "ระบบ" ออก
const sidebar_data: DataType[] = [
   {
      id: 1,
      title: "ภาพรวม",
      sidebar_details: [
         {
            id: 1,
            link: "/admin-dashboard",
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
            link: "/admin-creditbank",
            icon: "fas fa-graduation-cap",
            title: "คลังหลักสูตร",
            hasSubmenu: true,
            submenu: [
               {
                  id: 4,
                  link: "/admin-creditbank",
                  title: "เรียกดูหลักสูตร",
               },
               {
                  id: 5,
                  link: "/admin-creditbank/create-new",
                  title: "สร้างหลักสูตรใหม่",
               },
            ],
         },
         {
            id: 6,
            link: "/admin-subjects",
            icon: "fas fa-book-open",
            title: "รายวิชา",
            hasSubmenu: true,
            submenu: [
               {
                  id: 7,
                  link: "/admin-subjects",
                  title: "จัดการรายวิชา",
               },
               {
                  id: 8,
                  link: "/admin-subjects/create-new",
                  title: "สร้างรายวิชาใหม่",
               },
            ],
         },
         {
            id: 9,
            link: "/admin-lessons",
            icon: "fas fa-chalkboard-teacher",
            title: "บทเรียน",
            hasSubmenu: true,
            submenu: [
               {
                  id: 10,
                  link: "/admin-lessons",
                  title: "จัดการบทเรียน",
               },
               {
                  id: 11,
                  link: "/admin-lessons/create-new",
                  title: "สร้างบทเรียนใหม่",
               },
            ],
         },
      ],
   },
   {
      id: 3,
      title: "การประเมินผล",
      class_name: "mt-40",
      sidebar_details: [
         {
            id: 12,
            link: "/admin-quizzes",
            icon: "fas fa-clipboard-list",
            title: "แบบทดสอบ",
            hasSubmenu: true,
            submenu: [
               {
                  id: 13,
                  link: "/admin-quizzes",
                  title: "จัดการแบบทดสอบ",
               },
               {
                  id: 14,
                  link: "/admin-quizzes/create-new",
                  title: "สร้างแบบทดสอบใหม่",
               },
            ],
         },
         {
            id: 15,
            link: "/admin-questions",
            icon: "fas fa-question-circle",
            title: "คำถาม",
            hasSubmenu: true,
            submenu: [
               {
                  id: 16,
                  link: "/admin-questions",
                  title: "จัดการคำถาม",
               },
               {
                  id: 17,
                  link: "/admin-questions/create-new",
                  title: "สร้างคำถามใหม่",
               },
            ],
         },
      ],
   },
   {
      id: 4,
      title: "จัดการผู้ใช้",
      class_name: "mt-40",
      sidebar_details: [
         {
            id: 18,
            link: "/admin-account/instructors",
            icon: "fas fa-chalkboard-teacher",
            title: "อาจารย์",
            hasSubmenu: true,
            submenu: [
               {
                  id: 19,
                  link: "/admin-account/instructors",
                  title: "รายชื่ออาจารย์",
               },
               {
                  id: 20,
                  link: "/admin-account/instructors/create-new",
                  title: "เพิ่มอาจารย์ใหม่",
               },
            ],
         },
         {
            id: 21,
            link: "/admin-account/students",
            icon: "fas fa-user-graduate",
            title: "นักเรียน",
            hasSubmenu: true,
            submenu: [
               {
                  id: 22,
                  link: "/admin-account/students",
                  title: "รายชื่อนักเรียน",
               },
               {
                  id: 23,
                  link: "/admin-account/students/enrollment",
                  title: "การลงทะเบียน",
               },
            ],
         },
      ],
   },
];

const AdminSidebar = () => {
   const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
   const location = useLocation();
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
