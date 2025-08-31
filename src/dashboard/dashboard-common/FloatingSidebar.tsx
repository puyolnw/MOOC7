import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./css/CssAdminSidebar.css";
import "./css/FloatingSidebar.css";

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

interface FloatingSidebarProps {
   isOpen: boolean;
   isCollapsed: boolean;
   onToggle: () => void;
   onCollapse: () => void;
}

const FloatingSidebar: React.FC<FloatingSidebarProps> = ({ 
   isOpen, 
   isCollapsed, 
   onToggle, 
   onCollapse 
}) => {
   const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
   const location = useLocation();
   const currentPath = location.pathname;
   const [userName, setUserName] = useState("Welcome");
   const [instructorId, setInstructorId] = useState<string | null>(null);
   
   // Get user data from localStorage
   useEffect(() => {
      const userData = localStorage.getItem('user');
      if (userData) {
         try {
            const parsedUser = JSON.parse(userData);
            if (parsedUser.first_name && parsedUser.last_name) {
               setUserName(`Welcome, ${parsedUser.first_name} ${parsedUser.last_name}`);
            } else if (parsedUser.name) {
               setUserName(`Welcome, ${parsedUser.name}`);
            } else if (parsedUser.username) {
               setUserName(`Welcome, ${parsedUser.username}`);
            } else if (parsedUser.email) {
               const emailName = parsedUser.email.split('@')[0];
               setUserName(`Welcome, ${emailName}`);
            }
            
            if (parsedUser.instructor_id) {
               setInstructorId(parsedUser.instructor_id.toString());
            } else if (parsedUser.id) {
               setInstructorId(parsedUser.id.toString());
            }
         } catch (error) {
            console.error("Error parsing user data:", error);
         }
      }
   }, []);

   // Define sidebar data with dynamic user name
   const sidebar_data: DataType[] = [
      {
         id: 1,
         title: userName,
         sidebar_details: [
            {
               id: 1,
               link: "/instructor-dashboard",
               icon: "fas fa-home",
               title: "แดชบอร์ด",
            },
            {
               id: 3,
               link: "/ins-creditbank",
               icon: "fas fa-graduation-cap",
               title: "คลังหลักสูตร",
               hasSubmenu: true,
               submenu: [
                  {
                     id: 4,
                     link: "/ins-creditbank",
                     title: "เรียกดูหลักสูตร",
                  },
               ],
            },
         ],
      },
      {
         id: 9,
         title: "อาจารย์",
         class_name: "mt-40",
         sidebar_details: [
            {
               id: 1,
               link: "/instructor-courses",
               icon: "skillgro-video-tutorial",
               title: "รายวิชาของฉัน",
            },
            {
               id: 2,
               link: "/instructor-grading",
               icon: "skillgro-video-tutorial",
               title: "การตรวจงาน",
            },
         ],
      },
      {
         id: 10,
         title: "ตั้งค่า",
         class_name: "mt-40",
         sidebar_details: [
            {
               id: 1,
               link: instructorId ? `/instructor-setting/${instructorId}` : "/instructor-setting",
               icon: "fas fa-cog",
               title: "ตั้งค่าบัญชี",
            },
         ],
      },
   ];

   const toggleSubmenu = (id: number) => {
      if (openSubmenu === id) {
         setOpenSubmenu(null);
      } else {
         setOpenSubmenu(id);
      }
   };

   const isActive = (path: string) => {
      return currentPath === path || currentPath.startsWith(path + '/');
   };

   const isSubmenuActive = (list: SidebarDetailType) => {
      if (!list.submenu) return false;
      return list.submenu.some(item => isActive(item.link));
   };

   useEffect(() => {
      sidebar_data.forEach(category => {
         category.sidebar_details.forEach(item => {
            if (item.hasSubmenu && isSubmenuActive(item)) {
               setOpenSubmenu(item.id);
            }
         });
      });
   }, [currentPath]);

   const getSidebarClass = () => {
      if (isCollapsed) return "floating-sidebar collapsed";
      if (isOpen) return "floating-sidebar open";
      return "floating-sidebar";
   };

   return (
      <div className="floating-sidebar-container">
         {/* Toggle Button */}
         <button 
            className="sidebar-toggle-btn"
            onClick={onToggle}
            title={isOpen ? "ปิดเมนู" : "เปิดเมนู"}
         >
            <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
         </button>

         {/* Sidebar */}
         <div className={getSidebarClass()}>
            <div className="dashboard__sidebar-wrap">
               {/* Collapse/Expand Button */}
               <div className="sidebar-controls">
                  {!isCollapsed && (
                     <button 
                        onClick={onCollapse}
                        className="btn btn-sm btn-outline-secondary"
                        style={{ fontSize: "12px" }}
                     >
                        <i className="fas fa-compress"></i>
                     </button>
                  )}
                  {isCollapsed && (
                     <button 
                        onClick={onCollapse}
                        className="btn btn-sm btn-outline-secondary"
                        style={{ fontSize: "12px", width: "100%" }}
                     >
                        <i className="fas fa-expand"></i>
                     </button>
                  )}
               </div>

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
                                          title={list.title}
                                       >
                                          <span className="menu-icon">
                                             <i className={list.icon}></i>
                                          </span>
                                          <span className="menu-text">{list.title}</span>
                                          {!isCollapsed && (
                                             <span className="menu-arrow">
                                                <i className={`fas ${openSubmenu === list.id ? "fa-chevron-down" : "fa-chevron-right"}`}></i>
                                             </span>
                                          )}
                                       </a>
                                       {!isCollapsed && (
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
                                       )}
                                    </>
                                 ) : (
                                    <Link 
                                       to={list.link} 
                                       className={`menu-item ${isActive(list.link) ? "active" : ""}`}
                                       title={list.title}
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
      </div>
   );
};

export default FloatingSidebar;


