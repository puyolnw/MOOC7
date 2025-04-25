import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./css/CssAdminSidebar.css"; // Assuming you want to use the same CSS

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

const DashboardSidebar = () => {
   const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
   const location = useLocation(); // Get current location
   const currentPath = location.pathname;
   const [userName, setUserName] = useState("Welcome");
   
   // Get user data from localStorage
   useEffect(() => {
      const userData = localStorage.getItem('user');
      if (userData) {
         try {
            const parsedUser = JSON.parse(userData);
            // Set user name based on available fields
            if (parsedUser.first_name && parsedUser.last_name) {
               setUserName(`Welcome, ${parsedUser.first_name} ${parsedUser.last_name}`);
            } else if (parsedUser.name) {
               setUserName(`Welcome, ${parsedUser.name}`);
            } else if (parsedUser.username) {
               setUserName(`Welcome, ${parsedUser.username}`);
            } else if (parsedUser.email) {
               // Use email before @ symbol as name
               const emailName = parsedUser.email.split('@')[0];
               setUserName(`Welcome, ${emailName}`);
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
         ],
      },
      {
         id: 2,
         title: "การจัดการ",
         class_name: "mt-40",
         sidebar_details: [
            {
               id: 10,
               link: "/admin-creditbank",
               icon: "fas fa-list-ul",    
               title: "คลังหลักสูตร",
               hasSubmenu: true,
               submenu: [
                  {
                     id: 11,
                     link: "/instructor-subjects",
                     title: "รายวิชา",
                  },
                  {
                     id: 3,
                     link: "/instructor-lessons",
                     title: "บทเรียน",
                  },
                  {
                     id: 4,
                     link: "/instructor-quizzes",
                     title: "แบบทดสอบ",
                  },
                  {
                     id: 7,
                     link: "/instructor-questions",
                     title: "คำถาม",
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
   useEffect(() => {
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
}

export default DashboardSidebar;
