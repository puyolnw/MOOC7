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
      title: "Welcome, Emily Hannah",
      sidebar_details: [
         {
            id: 1,
            link: "/student-dashboard",
            icon: "fas fa-home",
            title: "แดชบอร์ด",
         },
         {
            id: 2,
            link: "/student-profile",
            icon: "skillgro-avatar",
            title: "โปรไฟล์",
         },
         {
            id: 3,
            link: "/student-enrolled-courses",
            icon: "skillgro-book",
            title: "หลักสูตรที่ลงทะเบียน",
         },
         {
            id: 4,
            link: "/student-wishlist",
            icon: "skillgro-label",
            title: "ปักหมุด",
         },
         {
            id: 5,
            link: "/student-review",
            icon: "skillgro-book-2",
            title: "รีวิว",
         },
         {
            id: 6,
            link: "/student-attempts",
            icon: "skillgro-question",
            title: "ประวัติการทำแบบทดสอบ",
         },
         {
            id: 7,
            link: "/student-certificate",
            icon: "skillgro-question",
            title: "ใบรับรองของฉัน",
         },
      ],
   },

];

const DashboardSidebarTwo = () => {

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

export default DashboardSidebarTwo