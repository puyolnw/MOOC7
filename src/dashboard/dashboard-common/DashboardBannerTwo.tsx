//import { Link } from "react-router-dom"
//import BtnArrow from "../../svg/BtnArrow"
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL;

// สร้าง axios instance ที่ไม่ throw error สำหรับ 404
const silentAxios = axios.create();
silentAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    // ถ้าเป็น 404 error หรือ network error ให้ silent
    if (error.response?.status === 404 || !error.response) {
      return Promise.reject({ ...error, silent: true });
    }
    return Promise.reject(error);
  }
);

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const DashboardBannerTwo = () => {
   const [student, setStudent] = useState<{ first_name?: string; last_name?: string } | null>(null);
   const [loading, setLoading] = useState(true);
   const hadCachedRef = useRef(false);

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

   // Load cached banner data first (stale-while-revalidate)
   useEffect(() => {
      try {
         if (!userId) return;
         const cacheKey = `studentBanner:${userId}`;
         const raw = localStorage.getItem(cacheKey);
         if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.student) {
               setStudent(parsed.student);
               hadCachedRef.current = true;
               // If fresh enough, skip showing loading spinner
               if (parsed?.timestamp && Date.now() - parsed.timestamp < CACHE_TTL_MS) {
                  setLoading(false);
               }
            }
         }
      } catch {}
   }, [userId]);

   useEffect(() => {
      if (!userId || !token) {
         setLoading(false);
         return;
      }

      const fetchStudentData = async () => {
         if (!hadCachedRef.current) {
            setLoading(true);
         }

         try {
            // ลอง fetch จาก students ก่อน
            const response = await axios.get(`${apiUrl}/api/accounts/students/${userId}`, {
               headers: { Authorization: `Bearer ${token}` },
            });
            setStudent(response.data.student);
            try {
               localStorage.setItem(
                  `studentBanner:${userId}`,
                  JSON.stringify({ student: response.data.student, timestamp: Date.now() })
               );
            } catch {}
            setLoading(false);
            return;
         } catch (error: any) {
            // ถ้าไม่ใช่ 404 ให้ log error
            if (error.response?.status !== 404) {
               console.error("Error fetching student:", error);
            }
         }

         try {
            // ถ้าไม่เจอใน students ลอง fetch จาก school_students
            const response = await axios.get(`${apiUrl}/api/accounts/school_students/${userId}`, {
               headers: { Authorization: `Bearer ${token}` },
            });
            setStudent(response.data.school_student);
            try {
               localStorage.setItem(
                  `studentBanner:${userId}`,
                  JSON.stringify({ student: response.data.school_student, timestamp: Date.now() })
               );
            } catch {}
         } catch (error: any) {
            // ถ้าไม่ใช่ 404 ให้ log error
            if (error.response?.status !== 404) {
               console.error("Error fetching school student:", error);
            }
            setStudent(null);
         } finally {
            setLoading(false);
         }
      };

      fetchStudentData();
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
