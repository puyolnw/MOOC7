import React, { useState, useEffect } from "react";
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

const DashboardSidebarTwo = () => {
   const [userName, setUserName] = useState("ผู้ใช้งาน");
   
   // Get user data from localStorage
   useEffect(() => {
      const userData = localStorage.getItem('user');
      if (userData) {
         try {
            const parsedUser = JSON.parse(userData);
            // Set user name based on available fields
            if (parsedUser.first_name && parsedUser.last_name) {
               setUserName(`ยินดีต้อนรับ, ${parsedUser.first_name} ${parsedUser.last_name}`);
            } else if (parsedUser.name) {
               setUserName(`ยินดีต้อนรับ, ${parsedUser.name}`);
            } else if (parsedUser.username) {
               setUserName(`ยินดีต้อนรับ, ${parsedUser.username}`);
            } else if (parsedUser.email) {
               // Use email before @ symbol as name
               const emailName = parsedUser.email.split('@')[0];
               setUserName(`ยินดีต้อนรับ, ${emailName}`);
            }
         } catch (error) {
            console.error("Error parsing user data:", error);
         }
      }
   }, []);

   const sidebar_data: DataType[] = [
      {
         id: 1,
         title: userName,
         sidebar_details: [
            {
               id: 1,
               link: "/student-dashboard",
               icon: "fas fa-home",
               title: "แดชบอร์ด",
            },
            {
               id: 3,
               link: "/student-enrolled-courses",
               icon: "skillgro-book",
               title: "หลักสูตรที่ลงทะเบียน",
            },
            {
               id: 6,
               link: "/student-attempts",
               icon: "fas fa-tasks",
               title: "ประวัติการทำแบบทดสอบ",
            },
            {
               id: 7,
               link: "/student-certificate",
               icon: "fas fa-certificate",
               title: "ใบรับรองของฉัน",
            },
         ],
      },
   ];

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
