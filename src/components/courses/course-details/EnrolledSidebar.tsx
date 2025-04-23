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
  totalQuizzes,
  courseId,
  videoUrl,
  coverImage,
  progress: initialProgress,
  enrollmentStatus: initialEnrollmentStatus,
  subjects: initialSubjects = [],
}: EnrolledSidebarProps) => {
  const navigate = useNavigate();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);
  const apiURL = import.meta.env.VITE_API_URL;

  const [subjects, setSubjects] = useState(initialSubjects);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(
          `${apiURL}/api/courses/${courseId}/progress`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success && response.data.subjects) {
          setSubjects(response.data.subjects);
          console.log("Fetched subjects in EnrolledSidebar:", response.data.subjects);
        }
      } catch (error) {
        console.error("Error fetching subjects in EnrolledSidebar:", error);
      }
    };

    if (!initialSubjects.length) {
      fetchSubjects();
    }
  }, [courseId, apiURL, initialSubjects]);

  console.log("Subjects details:", subjects);
  console.log("Progress percentage:", subjects[0]?.progress_percentage);

  const calculatedProgress = subjects.length > 0 && subjects[0]?.progress_percentage
    ? Math.round(
        subjects.reduce((sum: number, subject: any) => {
          const progress = parseFloat(subject.progress_percentage);
          return sum + (isNaN(progress) ? 0 : progress);
        }, 0) / subjects.length
      )
    : initialProgress;

  const calculatedEnrollmentStatus =
    subjects.length > 0 && subjects[0]?.progress_percentage
      ? calculatedProgress === 100
        ? "completed"
        : calculatedProgress > 0
        ? "in_progress"
        : "not_started"
      : initialEnrollmentStatus;

  console.log("EnrolledSidebar values:", {
    subjects,
    calculatedProgress,
    calculatedEnrollmentStatus,
  });

  const handleStartLearning = async () => {
    try {
      if (subjects && subjects.length > 0) {
        const firstSubject = subjects[0];
        navigate(`/course-learning/${courseId}/${firstSubject.subject_id}`);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

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
                <span>{subjectCount} วิชา</span>
              </li>
              <li>
                <InjectableSvg
                  src="/assets/img/icons/course_icon03.svg"
                  alt="img"
                  className="injectable"
                />
                บทเรียน
                <span>{totalLessons}</span>
              </li>
              <li>
                <InjectableSvg
                  src="/assets/img/icons/course_icon04.svg"
                  alt="img"
                  className="injectable"
                />
                แบบทดสอบ
                <span>{totalQuizzes}</span>
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
                <Link to="#">
                  <i className="fab fa-facebook-f"></i>
                </Link>
              </li>
              <li>
                <Link to="#">
                  <i className="fab fa-twitter"></i>
                </Link>
              </li>
              <li>
                <Link to="#">
                  <i className="fab fa-whatsapp"></i>
                </Link>
              </li>
              <li>
                <Link to="#">
                  <i className="fab fa-instagram"></i>
                </Link>
              </li>
              <li>
                <Link to="#">
                  <i className="fab fa-youtube"></i>
                </Link>
              </li>
            </ul>
          </div>

          <div className="courses__details-enroll">
            <div className="tg-button-wrap">
              <button onClick={handleStartLearning} className="btn btn-two arrow-btn">
                เริ่มเรียน
                <BtnArrow />
              </button>
            </div>
          </div>
        </div>
      </div>
      <VideoPopup
        isVideoOpen={isVideoOpen}
        setIsVideoOpen={setIsVideoOpen}
        videoId={getYoutubeVideoId(videoUrl)}
      />
    </>
  );
};

export default EnrolledSidebar;