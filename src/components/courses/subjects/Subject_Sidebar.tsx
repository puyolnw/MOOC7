import { useState, useEffect } from "react";
import InjectableSvg from "../../../hooks/InjectableSvg";
import { Link, useNavigate } from "react-router-dom";
import VideoPopup from "../../../modals/VideoPopup";
import axios from "axios";
import BtnArrow from "../../../svg/BtnArrow";

interface SidebarProps {
  subject_id: number;
  subject_code: string;
  subject_name: string;
  credits: number;
  lesson_count: number;
  quiz_count: number;
  cover_image?: string;
  course_id: number; // Add course_id prop
  isEnrolled?: boolean; // สถานะการลงทะเบียนจากคอร์ส
  isAdmin?: boolean; // สถานะ admin
}

const Sidebar = ({
  subject_id,
  subject_code,
  subject_name,
  credits,
  lesson_count,
  quiz_count,
  cover_image,
  course_id,
  isEnrolled = false,
  isAdmin = false
}: SidebarProps) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [progress, setProgress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchSubjectProgress = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(
          `${apiURL}/api/learn/subject/${subject_id}/progress`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          const progressData = {
            progressPercentage: response.data.progressPercentage || 0,
            completedLessons: response.data.completedLessons || 0,
            totalLessons: response.data.totalLessons || 0,
            subjectPassed: response.data.subjectPassed || false
          };
          setProgress(progressData);
        }
      } catch (error) {
        console.error("Error fetching subject progress:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjectProgress();
  }, [subject_id, apiURL]);

  const handleStartLearning = () => {
    const courseId = new URLSearchParams(window.location.search).get('courseId');
    const pathParts = window.location.pathname.split('/');
    const courseIdFromPath = pathParts[2]; // Get courseId from URL path
    
    const finalCourseId = course_id || courseIdFromPath || courseId;
    
    if (finalCourseId) {
      navigate(`/course-learning/${finalCourseId}/${subject_id}`);
    } else {
      console.warn('Course ID not found');
      // Optionally redirect to courses page or show error
    }
  };

  // ตรวจสอบว่าสามารถเริ่มเรียนได้หรือไม่
  const canStartLearning = isAdmin || isEnrolled;



  return (
    <>
      <div className="col-xl-3 col-lg-4">
        <div className="courses__details-sidebar">
          <div className="courses__details-video">
            <img
              src={cover_image || "/assets/img/courses/course_thumb02.jpg"}
              alt={subject_name}
              onError={(e) => {
                console.log("Failed to load cover image in Sidebar, using default");
                (e.target as HTMLImageElement).src = "/assets/img/courses/course_thumb02.jpg";
              }}
              loading="lazy"
            />
          </div>

          {/* Add Progress Section */}
          <div className="course-progress-wrap p-3 bg-light rounded mb-4">
            <h5 className="title mb-3">ความคืบหน้าของคุณ</h5>
            {isLoading ? (
              <div className="text-center py-2">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">กำลังโหลด...</span>
                </div>
              </div>
            ) : progress ? (
              <>
                <div className="progress mb-2" style={{ height: "10px" }}>
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: `${progress.progressPercentage}%` }}
                    aria-valuenow={progress.progressPercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
                <div className="d-flex justify-content-between">
                  <span>{Math.round(progress.progressPercentage)}% เสร็จสิ้น</span>
                  <span>
                    {progress.subjectPassed ? (
                      <span className="text-success">เรียนจบแล้ว</span>
                    ) : (
                      <span className="text-primary">กำลังเรียน</span>
                    )}
                  </span>
                </div>
                <div className="mt-2 small">
                  <div>บทเรียนที่เรียนจบ: {progress.completedLessons}/{progress.totalLessons}</div>
                </div>
              </>
            ) : null}
          </div>

          <div className="courses__information-wrap">
            <h5 className="title">ข้อมูลรายวิชา:</h5>
            <ul className="list-wrap">
              <li>
                <InjectableSvg src="/assets/img/icons/course_icon01.svg" alt="img" className="injectable" />
                รหัสวิชา
                <span>{subject_code}</span>
              </li>
              <li>
                <InjectableSvg src="/assets/img/icons/course_icon02.svg" alt="img" className="injectable" />
                หน่วยกิต
                <span>{credits} หน่วยกิต</span>
              </li>
              <li>
                <InjectableSvg src="/assets/img/icons/course_icon03.svg" alt="img" className="injectable" />
                บทเรียน
                <span>{lesson_count}</span>
              </li>
              <li>
                <InjectableSvg src="/assets/img/icons/course_icon04.svg" alt="img" className="injectable" />
                แบบทดสอบ
                <span>{quiz_count}</span>
              </li>
            </ul>
          </div>
          <div className="courses__details-social">
            <h5 className="title">แชร์รายวิชานี้:</h5>
            <ul className="list-wrap">
              <li><Link to="#"><i className="fab fa-facebook-f"></i></Link></li>
              <li><Link to="#"><i className="fab fa-twitter"></i></Link></li>
              <li><Link to="#"><i className="fab fa-whatsapp"></i></Link></li>
              <li><Link to="#"><i className="fab fa-instagram"></i></Link></li>
              <li><Link to="#"><i className="fab fa-youtube"></i></Link></li>
            </ul>
          </div>
          {/* Add Start Learning Button */}
          <div className="sidebar-action mt-4">
            {canStartLearning ? (
              <button
                onClick={handleStartLearning}
                className="btn btn-primary w-100 mb-3"
              >
                เริ่มเรียน
                <BtnArrow />
              </button>
            ) : (
              <div className="alert alert-warning small">
                <i className="fas fa-exclamation-triangle me-1"></i>
                กรุณาลงทะเบียนเรียนที่หน้าหลักสูตรก่อนเริ่มเรียน
              </div>
            )}
          </div>

         
        </div>
      </div>
      <VideoPopup
        isVideoOpen={isVideoOpen}
        setIsVideoOpen={setIsVideoOpen}
        videoId={"Ml4XCF-JS0k"}
      />
    </>
  );
};

export default Sidebar;
