import { useState, useEffect, useRef } from "react";
import InjectableSvg from "../../../hooks/InjectableSvg";
import { Link, useNavigate } from "react-router-dom";
import BtnArrow from "../../../svg/BtnArrow";
import VideoPopup from "../../../modals/VideoPopup";
import axios from "axios";

interface EnrolledSidebarProps {
  subjectCount: number;
  totalLessons: number;
  totalQuizzes: number;
  courseId: number;
  videoUrl?: string;
  coverImage?: string;
  progress: number;
  enrollmentStatus: string;
  subjects?: any[];
}

const EnrolledSidebar = ({
  subjectCount,
  totalLessons,

  courseId,
  videoUrl,
  coverImage,
  progress: initialProgress,
 
  
}: EnrolledSidebarProps) => {
  const navigate = useNavigate();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);
  const apiURL = import.meta.env.VITE_API_URL;


  const [courseProgress, setCourseProgress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullContent, setFullContent] = useState<any>(null);

  // ดึงข้อมูลความก้าวหน้าของหลักสูตรแบบละเอียด
  useEffect(() => {
    const fetchCourseProgressDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        setIsLoading(true);
        setError(null);

        const response = await axios.get(
          `${apiURL}/api/learn/course/${courseId}/progress-detail`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          setCourseProgress(response.data);
          console.log("Course progress detail:", response.data);
        }
      } catch (error) {
        console.error("Error fetching course progress detail:", error);
        setError("ไม่สามารถดึงข้อมูลความก้าวหน้าได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseProgressDetail();
  }, [courseId, apiURL]);

  // ดึงข้อมูลเนื้อหาทั้งหมดของหลักสูตร
  useEffect(() => {
    const fetchFullContent = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        setIsLoading(true);
        setError(null);

        const response = await axios.get(
          `${apiURL}/api/learn/course/${courseId}/full-content`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          setFullContent(response.data.course);
          console.log("Full course content:", response.data.course);
          
          // อัปเดตจำนวนบทเรียนและแบบทดสอบจากข้อมูลที่ได้
          let lessonCount = 0;
          let quizCount = 0;
          
          response.data.course.subjects.forEach((subject: any) => {
            subject.lessons.forEach((lesson: any) => {
              lessonCount++;
              if (lesson.quiz) quizCount++;
            });
          });
          
          console.log(`Updated counts: ${lessonCount} lessons, ${quizCount} quizzes`);
        }
      } catch (error) {
        console.error("Error fetching full course content:", error);
        setError("ไม่สามารถดึงข้อมูลเนื้อหาหลักสูตรได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFullContent();
  }, [courseId, apiURL]);

  // คำนวณความก้าวหน้าจากข้อมูลที่ได้จาก API
  const calculatedProgress = courseProgress 
    ? courseProgress.overallPercentage 
    : initialProgress;

  const calculatedEnrollmentStatus =
    courseProgress?.overallPercentage === 100
      ? "completed"
      : courseProgress?.overallPercentage > 0
      ? "in_progress"
      : "not_started";

  console.log("EnrolledSidebar values:", {
    courseProgress,
    calculatedProgress,
    calculatedEnrollmentStatus,
  });

  const handleStartLearning = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // ถ้ามีข้อมูล fullContent แล้ว ให้หาบทเรียนแรกที่ยังไม่เรียนจบ
      if (fullContent && fullContent.subjects && fullContent.subjects.length > 0) {
        // ดึงข้อมูลความก้าวหน้าของแต่ละวิชา
        for (const subject of fullContent.subjects) {
          try {
            const progressResponse = await axios.get(
              `${apiURL}/api/learn/subject/${subject.subject_id}/progress`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            
            // ถ้าวิชานี้ยังเรียนไม่จบ
            if (progressResponse.data.success && 
                progressResponse.data.progressPercentage < 100) {
              
              // หาบทเรียนแรกที่ยังไม่เรียนจบ
              for (const lesson of subject.lessons) {
                const lessonProgressResponse = await axios.get(
                  `${apiURL}/api/learn/lesson/${lesson.lesson_id}/video-progress`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
                
                // ถ้าไม่มีข้อมูลความก้าวหน้า หรือยังเรียนไม่จบ
                if (!lessonProgressResponse.data.progress || 
                    !lessonProgressResponse.data.progress.overall_completed) {
                  navigate(`/course-learning/${courseId}/${subject.subject_id}`);
                  return;
                }
              }
            }
          } catch (error) {
            console.error(`Error checking subject ${subject.subject_id} progress:`, error);
          }
        }
        
        // ถ้าไม่พบบทเรียนที่ยังไม่เรียนจบ ให้ไปที่วิชาแรก
        navigate(`/course-learning/${courseId}/${fullContent.subjects[0].subject_id}`);
        return;
      }

      // ถ้ายังไม่มีข้อมูล fullContent ให้ใช้วิธีเดิม
      const response = await axios.get(
        `${apiURL}/api/courses/${courseId}/enrolled-subjects`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success && response.data.subjects.length > 0) {
        const firstSubject = response.data.subjects[0];
        navigate(`/course-learning/${courseId}/${firstSubject.subject_id}`);
      } else {
        alert("คุณยังไม่ได้ลงทะเบียนวิชาในคอร์สนี้");
      }
    } catch (error) {
      console.error("Error fetching enrolled subjects:", error);
      alert("เกิดข้อผิดพลาดในการเริ่มเรียน กรุณาลองใหม่อีกครั้ง");
    }
  };

  const getYoutubeVideoId = (url?: string) => {
    if (!url) return "Ml4XCF-JS0k";

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return match && match[2].length === 11 ? match[2] : "Ml4XCF-JS0k";
  };

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      const videoId = getYoutubeVideoId(videoUrl);

      while (videoRef.current.firstChild) {
        videoRef.current.removeChild(videoRef.current.firstChild);
      }

      const iframe = document.createElement("iframe");
      iframe.width = "100%";
      iframe.height = "100%";
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&showinfo=0&rel=0`;
      iframe.frameBorder = "0";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;

      videoRef.current.appendChild(iframe);
    }
  }, [videoUrl]);

  // จำนวนบทเรียนและแบบทดสอบจาก API
  const apiTotalLessons = courseProgress?.totalLessons || totalLessons;


  return (
    <>
      <div className="col-xl-3 col-lg-4">
        <div className="courses__details-sidebar">
          <div className="courses__details-video">
            {videoUrl ? (
              <div
                ref={videoRef}
                className="video-container"
                style={{ width: "100%", height: "200px" }}
              ></div>
            ) : (
              <img
                src={coverImage || "/assets/img/courses/course_thumb02.jpg"}
                alt="img"
              />
            )}
            {videoUrl && (
              <a
                onClick={() => setIsVideoOpen(true)}
                style={{ cursor: "pointer" }}
                className="popup-video"
              >
                <i className="fas fa-play"></i>
              </a>
            )}
          </div>

          <div className="course-progress-wrap p-3 bg-light rounded mb-4">
            <h5 className="title mb-3">ความก้าวหน้าของคุณ</h5>
            {isLoading ? (
              <div className="text-center py-2">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">กำลังโหลด...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger py-1 px-2 small">
                <i className="fas fa-exclamation-triangle me-1"></i>
                {error}
              </div>
            ) : (
              <>
                <div className="progress mb-2" style={{ height: "10px" }} key={calculatedProgress}>
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: `${calculatedProgress}%` }}
                    aria-valuenow={calculatedProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
                <div className="d-flex justify-content-between">
                  <span>{calculatedProgress}% เสร็จสิ้น</span>
                  <span>
                    {calculatedEnrollmentStatus === "completed" && (
                      <span className="text-success">เรียนจบแล้ว</span>
                    )}
                    {calculatedEnrollmentStatus === "in_progress" && (
                      <span className="text-primary">กำลังเรียน</span>
                    )}
                    {calculatedEnrollmentStatus === "not_started" && (
                      <span className="text-warning">ยังไม่เริ่มเรียน</span>
                    )}
                  </span>
                </div>
                {courseProgress && (
                  <div className="mt-2 small">
                    <div>บทเรียนที่เรียนจบ: {courseProgress.completedLessons}/{courseProgress.totalLessons}</div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="courses__information-wrap">
            <h5 className="title">หลักสูตรประกอบด้วย:</h5>
            <ul className="list-wrap">
              <li>
                <InjectableSvg
                  src="/assets/img/icons/course_icon01.svg"
                  alt="img"
                  className="injectable"
                />
                วิชา
                <span>{fullContent?.subjects?.length || subjectCount} วิชา</span>
              </li>
              <li>
                <InjectableSvg
                  src="/assets/img/icons/course_icon03.svg"
                  alt="img"
                  className="injectable"
                />
                บทเรียน
                <span>{apiTotalLessons}</span>
              </li>
              <li>
                <InjectableSvg
                  src="/assets/img/icons/course_icon05.svg"
                  alt="img"
                  className="injectable"
                />
                ใบประกาศนียบัตร
                <span>ใช่</span>
              </li>
            </ul>
          </div>

          <div className="courses__details-social">
            <h5 className="title">แบ่งปันหลักสูตรนี้:</h5>
            <ul className="list-wrap">
              <li>
                <a href="#"><i className="fab fa-facebook-f"></i></a>
              </li>
              <li>
                <a href="#"><i className="fab fa-twitter"></i></a>
              </li>
              <li>
                <a href="#"><i className="fab fa-whatsapp"></i></a>
              </li>
              <li>
                <a href="#"><i className="fab fa-instagram"></i></a>
              </li>
            </ul>
          </div>

          <div className="sidebar-action">
            <button
              onClick={handleStartLearning}
              className="btn btn-primary w-100 mb-3"
            >
              เริ่มเรียน
              <BtnArrow />
            </button>

            {calculatedEnrollmentStatus === "completed" && (
              <Link to="/certificates" className="btn btn-success w-100">
                <i className="fas fa-certificate me-2"></i>
                ดูใบประกาศนียบัตร
              </Link>
            )}
          </div>
        </div>
      </div>

      {isVideoOpen && (
        <VideoPopup
          isVideoOpen={isVideoOpen}
          setIsVideoOpen={setIsVideoOpen}
          videoId={getYoutubeVideoId(videoUrl)}
        />
      )}
    </>
  );
};

export default EnrolledSidebar;
