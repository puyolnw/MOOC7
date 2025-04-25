import { useEffect, useState } from "react";
import axios from "axios";
import Count from "../../../components/common/Count";
import DashboardBannerTwo from "../../dashboard-common/DashboardBannerTwo";
import DashboardCourse from "../../dashboard-common/DashboardCourse";
import DashboardSidebarTwo from "../../dashboard-common/DashboardSidebarTwo";

// กำหนด interface สำหรับข้อมูลที่จะดึงมาจาก API
interface DashboardStats {
  totalEnrolled: number;
  inProgress: number;
  completed: number;
  isLoading: boolean;
  error: string | null;
}

const StudentDashboardArea = () => {
  // สร้าง state สำหรับเก็บข้อมูลสถิติ
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalEnrolled: 0,
    inProgress: 0,
    completed: 0,
    isLoading: true,
    error: null
  });

  // ดึง API URL จาก environment variable
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3301/api";

  // ฟังก์ชันสำหรับดึงข้อมูลจาก API
  const fetchDashboardData = async () => {
    // ดึง token จาก localStorage
    const token = localStorage.getItem("token");
    
    if (!token) {
      setDashboardStats({
        ...dashboardStats,
        isLoading: false,
        error: "กรุณาเข้าสู่ระบบก่อนใช้งาน"
      });
      return;
    }

    try {
      // ดึงข้อมูลความคืบหน้าของผู้ใช้
      const response = await axios.get(`${API_URL}/api/courses/user/progress`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const { courses } = response.data.progress;
        
        // นับจำนวนคอร์สทั้งหมด คอร์สที่กำลังเรียน และคอร์สที่เรียนจบ
        const totalEnrolled = courses.length;
        const inProgress = courses.filter((course: any) => course.status === 'in_progress').length;
        const completed = courses.filter((course: any) => course.status === 'completed').length;

        // อัพเดท state
        setDashboardStats({
          totalEnrolled,
          inProgress,
          completed,
          isLoading: false,
          error: null
        });
      } else {
        setDashboardStats({
          ...dashboardStats,
          isLoading: false,
          error: "ไม่สามารถดึงข้อมูลได้"
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDashboardStats({
        ...dashboardStats,
        isLoading: false,
        error: "เกิดข้อผิดพลาดในการดึงข้อมูล"
      });
    }
  };

  // ดึงข้อมูลเมื่อคอมโพเนนต์ถูกโหลด
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // สร้างข้อมูลสำหรับแสดงในส่วนของ counter
  const dashboard_count_data = [
    {
      id: 1,
      icon: "fas fa-book-open",
      count: dashboardStats.totalEnrolled,
      title: "หลักสูตรที่ลงทะเบียน"
    },
    {
      id: 2,
      icon: "fas fa-spinner",
      count: dashboardStats.inProgress,
      title: "หลักสูตรที่กำลังดำเนินอยู่"
    },
    {
      id: 3,
      icon: "fas fa-check-circle",
      count: dashboardStats.completed,
      title: "หลักสูตรที่สำเร็จแล้ว"
    }
  ];

  return (
    <section className="dashboard__area section-pb-120">
      <div className="container">
        <DashboardBannerTwo />
        <div className="dashboard__inner-wrap">
          <div className="row">
            <DashboardSidebarTwo />
            <div className="col-lg-9">
              <div className="dashboard__count-wrap">
                <div className="dashboard__content-title">
                  <h4 className="title">แดชบอร์ด</h4>
                </div>
                <div className="row">
                  {dashboardStats.isLoading ? (
                    // แสดง loading state
                    <div className="col-12 text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">กำลังโหลด...</span>
                      </div>
                      <p className="mt-3">กำลังโหลดข้อมูล...</p>
                    </div>
                  ) : dashboardStats.error ? (
                    // แสดงข้อความ error
                    <div className="col-12 text-center py-5">
                      <div className="alert alert-danger" role="alert">
                        <i className="fas fa-exclamation-circle me-2"></i>
                        {dashboardStats.error}
                      </div>
                    </div>
                  ) : (
                    // แสดงข้อมูลสถิติ
                    dashboard_count_data.map((item) => (
                      <div key={item.id} className="col-lg-4 col-md-4 col-sm-6">
                        <div className="dashboard__counter-item">
                          <div className="icon">
                            <i className={item.icon}></i>
                          </div>
                          <div className="content">
                            <span className="count"><Count number={item.count} /></span>
                            <p style={{ marginTop: "14px" }}>{item.title}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <DashboardCourse />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentDashboardArea;
