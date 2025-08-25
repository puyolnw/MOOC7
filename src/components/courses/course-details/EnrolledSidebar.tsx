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
  totalQuizzes,
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
          console.log("Course Progress Data:", response.data);
          setCourseProgress(response.data);
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
          
          // อัปเดตจำนวนบทเรียนและแบบทดสอบจากข้อมูลที่ได้
          let lessonCount = 0;
          let quizCount = 0;
          
          response.data.course.subjects.forEach((subject: any) => {
            subject.lessons.forEach((lesson: any) => {
              lessonCount++;
              if (lesson.quiz) quizCount++;
            });
          });
          
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

  // Debug logging
  console.log("EnrolledSidebar Debug:", {
    courseProgress,
    calculatedProgress,
    initialProgress,
    subjects: courseProgress?.subjects
  });

  const calculatedEnrollmentStatus =
    courseProgress?.overallPercentage === 100
      ? "completed"
      : courseProgress?.overallPercentage > 0
      ? "in_progress"
      : "not_started";

  // คำนวณจำนวนบทเรียนและแบบทดสอบจาก big lessons
  const calculateBigLessonStats = () => {
    if (!fullContent || !fullContent.subjects) return { totalBigLessons: 0, totalQuizzes: 0 };
    
    let totalBigLessons = 0;
    let totalQuizzes = 0;
    
    fullContent.subjects.forEach((subject: any) => {
      if (subject.big_lessons) {
        totalBigLessons += subject.big_lessons.length;
        subject.big_lessons.forEach((bigLesson: any) => {
          if (bigLesson.quiz) totalQuizzes++;
          if (bigLesson.lessons) {
            bigLesson.lessons.forEach((lesson: any) => {
              if (lesson.quiz) totalQuizzes++;
            });
          }
        });
      }
      // เพิ่ม pre-test และ post-test
      if (subject.pre_test_id) totalQuizzes++;
      if (subject.post_test_id) totalQuizzes++;
    });
    
    return { totalBigLessons, totalQuizzes };
  };

  const { totalBigLessons, totalQuizzes: calculatedTotalQuizzes } = calculateBigLessonStats();

  // จำนวนบทเรียนและแบบทดสอบจาก API
  const apiTotalLessons = totalBigLessons || totalLessons;
  const apiTotalQuizzes = calculatedTotalQuizzes || totalQuizzes;


  const handleStartLearning = async () => {
    try {
      setStartError(null);
      setIsStarting(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // ดึงข้อมูลวิชาในคอร์สนี้
      const response = await axios.get(
        `${apiURL}/api/courses/${courseId}/enrolled-subjects`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success && response.data.subjects.length > 0) {
        // แสดง popup ให้เลือกวิชาเสมอ
        const firstSubject = response.data.subjects[0];
        setNextLessonInfo({
          title: "เริ่มเรียนวิชา",
          subject_title: firstSubject.title || firstSubject.subject_name,
          lesson_id: 0,
          subject_id: firstSubject.subject_id
        });
        setShowStartModal(true);
      } else {
        setStartError("คุณยังไม่ได้ลงทะเบียนวิชาในคอร์สนี้");
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
                    <div>บทเรียนหลักที่เรียนจบ: {courseProgress.subjects?.reduce((sum: number, subject: any) => sum + (subject.completedBigLessons || 0), 0) || 0}/{courseProgress.subjects?.reduce((sum: number, subject: any) => sum + (subject.totalBigLessons || 0), 0) || 0}</div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="courses__information-wrap">
            <h5 className="title">หลักสูตรประกอบด้วย:</h5>
            <ul className="list-wrap">
              {subjectCount > 0 && (
                <li>
                  <div className="courses__info-icon">
                    <i className="flaticon-file"></i>
                  </div>
                  <div className="courses__info-content">
                    <h6>{subjectCount} วิชา</h6>
                  </div>
                </li>
              )}
              {apiTotalLessons > 0 && (
                <li>
                  <div className="courses__info-icon">
                    <i className="flaticon-video"></i>
                  </div>
                  <div className="courses__info-content">
                    <h6>{apiTotalLessons} บทเรียน</h6>
                  </div>
                </li>
              )}
              {apiTotalQuizzes > 0 && (
                <li>
                  <div className="courses__info-icon">
                    <i className="flaticon-quiz"></i>
                  </div>
                  <div className="courses__info-content">
                    <h6>{apiTotalQuizzes} แบบทดสอบ</h6>
                  </div>
                </li>
              )}
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
          isVideoOpen={isVideoOpen}
          setIsVideoOpen={setIsVideoOpen}
        />
      )}


      {/* Start Learning Modal */}
      {showStartModal && (
        <div className="start-learning-modal">
          <div className="start-learning-modal-content">
            <div className="start-learning-modal-header">
              <h4>เลือกวิชาที่จะเรียน</h4>
              <button 
                className="close-button" 
                onClick={() => setShowStartModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="start-learning-modal-body">
              <div className="start-learning-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              
              <h5>เลือกวิชาที่คุณต้องการเริ่มเรียน</h5>
              <p>คุณสามารถเลือกวิชาใดก็ได้ในหลักสูตรนี้</p>
              
              <div className="subject-selection">
                {fullContent?.subjects?.map((subject: any, index: number) => (
                  <div 
                    key={subject.subject_id} 
                    className={`subject-option ${nextLessonInfo?.subject_id === subject.subject_id ? 'selected' : ''}`}
                    onClick={() => setNextLessonInfo({
                      title: "เริ่มเรียนวิชา",
                      subject_title: subject.title || subject.subject_name,
                      lesson_id: 0,
                      subject_id: subject.subject_id
                    })}
                  >
                    <div className="subject-number">{index + 1}</div>
                    <div className="subject-info">
                      <div className="subject-name">{subject.title || subject.subject_name}</div>
                      <div className="subject-code">{subject.subject_code}</div>
                    </div>
                    <div className="subject-arrow">
                      <i className="fas fa-chevron-right"></i>
                    </div>
                  </div>
                ))}
              </div>
              
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
                  disabled={!nextLessonInfo}
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

