import { useEffect, useState } from "react";
import axios from "axios";
import Count from "../../../components/common/Count";
import DashboardBannerTwo from "../../dashboard-common/DashboardBannerTwo";
import DashboardCourse from "../../dashboard-common/DashboardCourse";
import DashboardSidebarTwo from "../../dashboard-common/DashboardSidebarTwo";

interface DashboardStats {
  totalEnrolled: number;
  inProgress: number;
  completed: number;
  isLoading: boolean;
  error: string | null;
}

interface CourseData {
  course_id: number;
  title: string;
  completed: boolean | null;
  status: 'completed' | 'in_progress' | 'not_started';
}

const StudentDashboardArea = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalEnrolled: 0,
    inProgress: 0,
    completed: 0,
    isLoading: true,
    error: null
  });

  const [courses, setCourses] = useState<CourseData[]>([]);
  console.log("Courses:", courses);
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchDashboardData = async () => {
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
      const response = await axios.get(`${API_URL}/api/data/student/dashboard/courses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const { overview, courses } = response.data;
        
        setDashboardStats({
          totalEnrolled: overview.totalEnrolled,
          inProgress: overview.inProgress,
          completed: overview.completed,
          isLoading: false,
          error: null
        });

        setCourses(courses);
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
                    <div className="col-12 text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">กำลังโหลด...</span>
                      </div>
                      <p className="mt-3">กำลังโหลดข้อมูล...</p>
                    </div>
                  ) : dashboardStats.error ? (
                    <div className="col-12 text-center py-5">
                      <div className="alert alert-danger" role="alert">
                        <i className="fas fa-exclamation-circle me-2"></i>
                        {dashboardStats.error}
                      </div>
                    </div>
                  ) : (
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
