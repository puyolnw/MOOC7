import React, { useState } from "react";
import { Link } from "react-router-dom";

interface SubMenuType {
   id: number;
   link: string;
   title: string;
}

interface DataType {
   id: number;
   title: string;
   class_name?: string;
   sidebar_details: {
      id: number;
      link: string;
      icon: string;
      title: string;
      hasSubmenu?: boolean;
      submenu?: SubMenuType[];
   }[];
};

const sidebar_data: DataType[] = [
   {
      id: 1,
      title: "Welcome, Jone Due",
      sidebar_details: [
         {
            id: 1,
            link: "/instructor-dashboard",
            icon: "fas fa-home",
            title: "แดชบอร์ด",
         },
         {
            id: 2,
            link: "/instructor-profile",
            icon: "skillgro-avatar",
            title: "โปรไฟล์",
         },
         {
            id: 3,
            link: "/instructor-enrolled-courses",
            icon: "skillgro-book",
            title: "หลักสูตรของฉัน",
         },
         {
            id: 5,
            link: "/instructor-review",
            icon: "skillgro-book-2",
            title: "รีวิว",
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
      ],
   },
   {
      id: 3,
      title: "อาจารย์",
      class_name: "mt-40",
      sidebar_details: [
         {
            id: 1,
            link: "/instructor-courses",
            icon: "skillgro-video-tutorial",
            title: "หลักสูตรของฉัน",
         },
         {
            id: 2,
            link: "/instructor-announcement",
            icon: "skillgro-marketing",
            title: "การแจ้งเตือน",
         },
         {
            id: 4,
            link: "/instructor-assignment",
            icon: "skillgro-list",
            title: "งานประจำบท",
         },

      ],
   },
   {
      id: 4,
      title: "User",
      class_name: "mt-30",
      sidebar_details: [
         {
            id: 1,
            link: "/instructor-setting",
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

const DashboardSidebar = () => {
   const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);

   const toggleSubmenu = (id: number) => {
      if (openSubmenu === id) {
         setOpenSubmenu(null);
      } else {
         setOpenSubmenu(id);
      }
   };

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
                                       className={`menu-item ${openSubmenu === list.id ? "active" : ""}`}
                                    >
                                       <i className={list.icon}></i>
                                       {list.title}
                                       <span className="menu-arrow">
                                          <i className={`fas ${openSubmenu === list.id ? "fa-chevron-down" : "fa-chevron-right"}`}></i>
                                       </span>
                                    </a>
                                    <ul className={`submenu ${openSubmenu === list.id ? "open" : ""}`}>
                                       {list.submenu?.map((subItem) => (
                                          <li key={subItem.id}>
                                             <Link to={subItem.link}>
                                                <i className="fas fa-circle submenu-icon"></i>
                                                {subItem.title}
                                             </Link>
                                          </li>
                                       ))}
                                    </ul>
                                 </>
                              ) : (
                                 <Link to={list.link}>
                                    <i className={list.icon}></i>
                                    {list.title}
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
