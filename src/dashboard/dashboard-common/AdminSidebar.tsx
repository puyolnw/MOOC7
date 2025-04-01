import React from "react";
import { Link } from "react-router-dom";

interface DataType {
   id: number;
   title: string;
   class_name?: string;
   sidebar_details: {
      id: number;
      link: string;
      icon: string;
      title: string;
   }[];
};

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
            link: "/admin-course",
            icon: "fas fa-soild fa-list-ul",    
            title: "หลักสูตรทั้งหมด",
         },
         {
            id: 2,
            link: "/admin-manage-courses",
            icon: "fas fa-solid fa-file",
            title: "จัดการหลักสูตร",
         }
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
                           <li key={list.id}>
                              <Link to={list.link}>
                                 <i className={list.icon}></i>
                                 {list.title}
                              </Link>
                           </li>
                        ))}
                     </ul>
                  </nav>
               </React.Fragment>
            ))}
         </div>
      </div>
   )
}

export default AdminSidebar