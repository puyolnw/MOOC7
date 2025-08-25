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

        // ใช้ API ใหม่ที่ใช้ hierarchical structure
        const response = await axios.get(
          `${apiURL}/api/learn/subject/${subject_id}/scores-hierarchical`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          // คำนวณ progress จาก hierarchical structure
          const hierarchicalData = response.data.scoreStructure;
          
          // ตรวจสอบว่ามีข้อมูล hierarchical structure หรือไม่
          if (!hierarchicalData) {
            console.warn("No hierarchical structure data found");
            setProgress({
              progressPercentage: 0,
              completedBigLessons: 0,
              totalBigLessons: 0,
              subjectPassed: false
            });
            return;
          }

          let totalBigLessons = 0;
          let completedBigLessons = 0;
          let totalPercentage = 0;

          // นับ big lessons และ progress
          if (hierarchicalData.big_lessons && Array.isArray(hierarchicalData.big_lessons)) {
            totalBigLessons = hierarchicalData.big_lessons.length;
            hierarchicalData.big_lessons.forEach((bigLesson: any) => {
              if (bigLesson.lessons && Array.isArray(bigLesson.lessons)) {
                const totalVideos = bigLesson.lessons.length;
                const completedVideos = bigLesson.lessons.filter((lesson: any) => lesson.video_completed).length;
                if (totalVideos > 0 && completedVideos === totalVideos) {
                  completedBigLessons++;
                }
              }
            });
          }

          // คำนวณเปอร์เซ็นต์รวม
          if (totalBigLessons > 0) {
            const bigLessonProgress = (completedBigLessons / totalBigLessons) * 80;
            let testProgress = 0;
            
            // เพิ่ม progress จาก pre-test และ post-test
            if (hierarchicalData.pre_test && hierarchicalData.post_test) {
              if (hierarchicalData.pre_test.progress?.completed) testProgress += 10;
              if (hierarchicalData.post_test.progress?.completed) testProgress += 10;
            } else if (hierarchicalData.post_test && hierarchicalData.post_test.progress?.completed) {
              testProgress += 20;
            } else if (hierarchicalData.pre_test && hierarchicalData.pre_test.progress?.completed) {
              testProgress += 20;
            }
            
            totalPercentage = Math.round(bigLessonProgress + testProgress);
          }

          const progressData = {
            progressPercentage: totalPercentage,
            completedBigLessons: completedBigLessons,
            totalBigLessons: totalBigLessons,
            subjectPassed: totalPercentage >= 100
          };
          setProgress(progressData);
        } else {
          // ถ้า API ไม่สำเร็จ ให้ตั้งค่า default
          setProgress({
            progressPercentage: 0,
            completedBigLessons: 0,
            totalBigLessons: 0,
            subjectPassed: false
          });
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
                  <div>บทเรียนที่เรียนจบ: {progress.completedBigLessons}/{progress.totalBigLessons}</div>
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
              {lesson_count > 0 && (
                <li>
                  <InjectableSvg src="/assets/img/icons/course_icon03.svg" alt="img" className="injectable" />
                  บทเรียน
                  <span>{lesson_count}</span>
                </li>
              )}
              {quiz_count > 0 && (
                <li>
                  <InjectableSvg src="/assets/img/icons/course_icon04.svg" alt="img" className="injectable" />
                  แบบทดสอบ
                  <span>{quiz_count}</span>
                </li>
              )}
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
