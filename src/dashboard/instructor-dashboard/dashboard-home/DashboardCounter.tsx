import { useEffect, useState } from "react";
import Count from "../../../components/common/Count";
import axios from "axios";

interface CounterItem {
   id: number;
   icon: string;
   count: number;
   title: string;
}

interface DashboardSummary {
   subjectCount: number;
   studentCount: number;
}

const DashboardCounter = () => {
   const [countData, setCountData] = useState<CounterItem[]>([
      {
         id: 1,
         icon: "fas fa-book",
         count: 0,
         title: "รายวิชาของฉัน"
      },
      {
         id: 2,
         icon: "fas fa-users",
         count: 0,
         title: "นักเรียนของฉัน"
      }
   ]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const fetchDashboardSummary = async () => {
         try {
            setLoading(true);
            
            // Get token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
               throw new Error("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
            }

            // Get API base URL from environment variables
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

            // Set up headers with authorization token
            const config = {
               headers: {
                  'Authorization': `Bearer ${token}`
               }
            };

            // เรียกใช้ API endpoint ใหม่ที่สร้างขึ้น
            const response = await axios.get<{success: boolean, summary: DashboardSummary}>(
               `${API_BASE_URL}/api/courses/subjects/dashboard/summary`, 
               config
            );

            if (response.data.success) {
               const { subjectCount, studentCount } = response.data.summary;
               
               // Update the count data
               setCountData(prevData => [
                  {
                     ...prevData[0],
                     count: subjectCount
                  },
                  {
                     ...prevData[1],
                     count: studentCount
                  }
               ]);
            }

            setLoading(false);
         } catch (err) {
            console.error("Error fetching dashboard summary:", err);
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการดึงข้อมูล");
            setLoading(false);
         }
      };

      fetchDashboardSummary();
   }, []);

   if (loading) {
      return (
         <div className="dashboard__counter-loading">
            <p>กำลังโหลดข้อมูล...</p>
         </div>
      );
   }

   if (error) {
      return (
         <div className="dashboard__counter-error">
            <p>เกิดข้อผิดพลาด: {error}</p>
         </div>
      );
   }

   return (
      <>
         {countData.map((item) => (
            <div key={item.id} className="col-lg-6 col-md-6 col-sm-6">
               <div className="dashboard__counter-item">
                  <div className="icon">
                     <i className={item.icon}></i>
                  </div>
                  <div className="content">
                     <span className="count"><Count number={item.count} /></span>
                     <p style={{marginTop:"5px"}}>{item.title}</p>
                  </div>
               </div>
            </div>
         ))}
      </>
   )
}

export default DashboardCounter;
