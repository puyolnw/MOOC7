
import { useEffect, useState } from "react";
import axios from "axios";

interface InstructorProfile {
  user_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  instructor_id?: number;
  department_name?: string;
  faculty?: string;
  ranking?: string;
  bio?: string;
  avatar?: string;
  experience_years?: number;
  specialization?: string;
}

const InstructorProfileContent = ({ style }: any) => {
  console.log(style);
  const [instructor, setInstructor] = useState<InstructorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstructorProfile = async () => {
      try {
        setLoading(true);
        
        // Get user from localStorage
        const userString = localStorage.getItem("user");
        if (!userString) {
          throw new Error("ไม่พบข้อมูลผู้ใช้");
        }

        const user = JSON.parse(userString);
        const userId = user?.id;

        if (!userId) {
          throw new Error("ไม่พบ user ID");
        }

        const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        
        // Fetch instructor profile data
        const response = await axios.get(`${apiURL}/api/accounts/instructors/user/${userId}`);
        
        if (response.data.success) {
          setInstructor(response.data.instructor);
        } else {
          throw new Error(response.data.message || "ไม่สามารถดึงข้อมูลอาจารย์ได้");
        }
      } catch (err: any) {
        console.error("Error fetching instructor profile:", err);
        setError(err.message || "เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorProfile();
  }, []);

  if (loading) {
    return (
      <div className="col-lg-9">
        <div className="dashboard__content-wrap">
          <div className="text-center p-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">กำลังโหลด...</span>
            </div>
            <p className="mt-3">กำลังโหลดข้อมูลส่วนตัว...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-lg-9">
        <div className="dashboard__content-wrap">
          <div className="alert alert-danger">
            <h4>เกิดข้อผิดพลาด!</h4>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="col-lg-9">
        <div className="dashboard__content-wrap">
          <div className="alert alert-warning">
            <p>ไม่พบข้อมูลอาจารย์</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="col-lg-9">
      <div className="dashboard__content-wrap">
        <div className="dashboard__content-title">
          <h4 className="title">ข้อมูลส่วนตัว</h4>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <div className="profile__content-wrap">
              <ul className="list-wrap">
                <li><span>วันที่ลงทะเบียน</span> {formatDate(instructor.created_at)}</li>
                <li><span>ชื่อ</span> {instructor.first_name}</li>
                <li><span>นามสกุล</span> {instructor.last_name}</li>
                <li><span>ชื่อผู้ใช้</span> {instructor.username}</li>
                <li><span>อีเมล</span> {instructor.email}</li>
                {instructor.department_name && (
                  <li><span>สาขาวิชา</span> {instructor.department_name}</li>
                )}
                {instructor.faculty && (
                  <li><span>คณะ</span> {instructor.faculty}</li>
                )}
                {instructor.ranking && (
                  <li><span>ตำแหน่งทางวิชาการ</span> {instructor.ranking}</li>
                )}
                {instructor.specialization && (
                  <li><span>ความเชี่ยวชาญ</span> {instructor.specialization}</li>
                )}
                {instructor.experience_years && (
                  <li><span>ประสบการณ์การสอน</span> {instructor.experience_years} ปี</li>
                )}
                {instructor.bio && (
                  <li><span>ประวัติโดยย่อ</span> {instructor.bio}</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstructorProfileContent
