//import { Link } from "react-router-dom"
//import BtnArrow from "../../svg/BtnArrow"
import { useEffect, useState } from "react";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL;

const DashboardBannerTwo = () => {
   const [student, setStudent] = useState<{ first_name?: string; last_name?: string } | null>(null);
   const [loading, setLoading] = useState(true);

   // ดึง userId จาก localStorage
   const userString = localStorage.getItem("user");
   let userId = null;
   if (userString) {
      try {
         const user = JSON.parse(userString);
         userId = user.id || user.user_id;
      } catch {}
   }
   const token = localStorage.getItem("token");

   useEffect(() => {
      if (!userId || !token) {
         setLoading(false);
         return;
      }
      setLoading(true);
      axios
         .get(`${apiUrl}/api/accounts/students/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
         })
         .then((res) => {
            setStudent(res.data.student);
         })
         .catch(() => setStudent(null))
         .finally(() => setLoading(false));
   }, [userId, token]);

   return (
      <div className="dashboard__top-wrap">
         <div className="dashboard__top-bg" style={{ backgroundImage: `url(/assets/img/bg/bg1.png)` }}></div>
         <div className="dashboard__instructor-info">
            <div className="dashboard__instructor-info-left">
               <div className="thumb">
                  <img src="/assets/img/icons/userdefault.png" alt="img" />
               </div>
               <div className="content">
                  <h4 className="title">
                     {loading
                        ? "Loading..."
                        : student && (student.first_name || student.last_name)
                        ? `${student.first_name || ""} ${student.last_name || ""}`.trim()
                        : "ไม่พบข้อมูลผู้ใช้"}
                  </h4>
               </div>
            </div>
            <div className="dashboard__instructor-info-right">

            </div>
         </div>
      </div>
   )
}

export default DashboardBannerTwo
