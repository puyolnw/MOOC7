import { useState, useEffect, useRef } from "react";

import { useNavigate } from "react-router-dom";

import VideoPopup from "../../../modals/VideoPopup";
import axios from "axios";
import "./EnrolledSidebar.css"; // เพิ่ม import CSS

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
  
  // เพิ่ม state สำหรับ popup
  const [showStartModal, setShowStartModal] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [nextLessonInfo, setNextLessonInfo] = useState<{
    title: string;
    subject_title: string;
    lesson_id: number;
    subject_id: number;
  } | null>(null);

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
      setStartError(null);
      setIsStarting(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // ถ้ามีข้อมูล fullContent แล้ว ให้หาบทเรียนแรกที่ยังไม่เรียนจบ
      if (fullContent && fullContent.subjects && fullContent.subjects.length > 0) {
        let foundNextLesson = false;
        
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
                  
                  // เก็บข้อมูลบทเรียนถัดไปที่ควรเรียน
                  setNextLessonInfo({
                    title: lesson.title,
                    subject_title: subject.title,
                    lesson_id: lesson.lesson_id,
                    subject_id: subject.subject_id
                  });
                  
                  // แสดง popup
                  setShowStartModal(true);
                  foundNextLesson = true;
                  break;
                }
              }
            }
            
            if (foundNextLesson) break;
          } catch (error) {
            console.error(`Error checking subject ${subject.subject_id} progress:`, error);
          }
        }
        
        // ถ้าไม่พบบทเรียนที่ยังไม่เรียนจบ ให้ไปที่วิชาแรก
        if (!foundNextLesson) {
          setNextLessonInfo({
            title: fullContent.subjects[0].lessons[0].title,
            subject_title: fullContent.subjects[0].title,
            lesson_id: fullContent.subjects[0].lessons[0].lesson_id,
            subject_id: fullContent.subjects[0].subject_id
          });
          setShowStartModal(true);
        }
      } else {
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
          setStartError("คุณยังไม่ได้ลงทะเบียนวิชาในคอร์สนี้");
        }
      }
    } catch (error) {
      console.error("Error fetching enrolled subjects:", error);
      setStartError("เกิดข้อผิดพลาดในการเริ่มเรียน กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsStarting(false);
    }
  };

  // ฟังก์ชันเริ่มเรียนจาก popup
  const handleConfirmStart = () => {
    if (nextLessonInfo) {
      navigate(`/course-learning/${courseId}/${nextLessonInfo.subject_id}`);
    }
    setShowStartModal(false);
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
                <div className="courses__info-icon">
                  <i className="flaticon-file"></i>
                </div>
                <div className="courses__info-content">
                  <h6>{subjectCount} วิชา</h6>
                </div>
              </li>
              <li>
                <div className="courses__info-icon">
                  <i className="flaticon-video"></i>
                </div>
                <div className="courses__info-content">
                  <h6>{apiTotalLessons} บทเรียน</h6>
                </div>
              </li>
            </ul>
          </div>

          <div className="courses__details-action">
          <button
  className="btn btn-primary w-100 mb-3"
  onClick={handleStartLearning}
  disabled={isStarting}
>
  {isStarting ? (
    <>
      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      กำลังเริ่มเรียน...
    </>
  ) : (
    <>
      {/* แก้ไขตรงนี้ */}
      <i className="fas fa-play me-2"></i> เริ่มเรียน
    </>
  )}
</button>

            {startError && (
              <div className="alert alert-danger py-2 small">
                <i className="fas fa-exclamation-triangle me-1"></i>
                {startError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Popup */}
{isVideoOpen && (
  <VideoPopup
    videoId={getYoutubeVideoId(videoUrl)}
    isVideoOpen={isVideoOpen}  // เพิ่ม prop นี้
    setIsVideoOpen={setIsVideoOpen}
  />
)}


      {/* Start Learning Modal */}
      {showStartModal && (
        <div className="start-learning-modal">
          <div className="start-learning-modal-content">
            <div className="start-learning-modal-header">
              <h4>เริ่มเรียนหลักสูตร</h4>
              <button 
                className="close-button" 
                onClick={() => setShowStartModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="start-learning-modal-body">
              <div className="start-learning-icon">
                <i className="fas fa-book-reader"></i>
              </div>
              
              {nextLessonInfo && (
                <>
                  <h5>คุณกำลังจะเริ่มเรียน</h5>
                  <div className="next-lesson-info">
                    <div className="subject-title">
                      <span>วิชา:</span> {nextLessonInfo.subject_title}
                    </div>
                    <div className="lesson-title">
                      <span>บทเรียน:</span> {nextLessonInfo.title}
                    </div>
                  </div>
                </>
              )}
              
              <p>คุณพร้อมที่จะเริ่มเรียนหรือไม่?</p>
              
              <div className="start-learning-buttons">
                <button 
                  className="btn-cancel" 
                  onClick={() => setShowStartModal(false)}
                >
                  <i className="fas fa-times"></i> ยกเลิก
                </button>
                <button 
                  className="btn-start" 
                  onClick={handleConfirmStart}
                >
                  <i className="fas fa-play"></i> เริ่มเรียนเลย
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EnrolledSidebar;

