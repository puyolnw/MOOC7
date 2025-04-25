import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

interface CourseData {
   id: number;
   name: string;
   enrolled: number;
   completed: number;
}

const DashboardReviewTable = () => {
   const [courses, setCourses] = useState<CourseData[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const fetchInstructorCourses = async () => {
         try {
            setLoading(true);
            
            // Get token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
               throw new Error("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
            }

            // Get API base URL from environment variables
            const API_BASE_URL = import.meta.env.VITE_API_URL;

            // Set up headers with authorization token
            const config = {
               headers: {
                  'Authorization': `Bearer ${token}`
               }
            };

            // Fetch instructor's subjects with enrollment data
            const response = await axios.get(
               `${API_BASE_URL}/api/courses/subjects/instructors/cou`, 
               config
            );

            if (response.data.success) {
               setCourses(response.data.courses.map((course: any) => ({
                  id: course.subject_id,
                  name: course.title || course.subject_name,
                  enrolled: course.enrollment_count || 0,
                  completed: course.completion_count || 0
               })));
            } else {
               throw new Error(response.data.message || "ไม่สามารถดึงข้อมูลรายวิชาได้");
            }

            setLoading(false);
         } catch (err) {
            console.error("Error fetching instructor courses:", err);
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการดึงข้อมูล");
            setLoading(false);
         }
      };

      fetchInstructorCourses();
   }, []);

   if (loading) {
      return <div className="loading">กำลังโหลดข้อมูล...</div>;
   }

   if (error) {
      return <div className="error">เกิดข้อผิดพลาด: {error}</div>;
   }

   if (courses.length === 0) {
      return <div className="no-data">ไม่พบข้อมูลรายวิชา</div>;
   }

   return (
      <table className="table table-borderless">
         <thead>
            <tr>
               <th>ชื่อรายวิชา</th>
               <th>จำนวนลงทะเบียน</th>
               <th>สำเร็จการศึกษา</th>
            </tr>
         </thead>
         <tbody>
            {courses.map((course) => (
               <tr key={course.id}>
                  <td>
                     <Link to={`/course-details/${course.id}`}>{course.name}</Link>
                  </td>
                  <td>
                     <p className="color-black">{course.enrolled}</p>
                  </td>
                  <td>
                     <p className="color-success">{course.completed}</p>
                  </td>
               </tr>
            ))}
         </tbody>
      </table>
   )
}

export default DashboardReviewTable
