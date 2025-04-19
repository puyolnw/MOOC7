import { useState, useEffect, useRef } from "react"; // เพิ่ม useRef
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
  progress,
  enrollmentStatus,
  subjects = []
}: EnrolledSidebarProps) => {
  const navigate = useNavigate();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null); // เพิ่ม ref สำหรับวิดีโอ
  const apiURL = import.meta.env.VITE_API_URL;
  
  // ฟังก์ชันสำหรับเริ่มเรียน
  const handleStartLearning = async () => {
    try {
      // ถ้ามี subjects ที่ส่งมาและมีอย่างน้อย 1 วิชา
      if (subjects && subjects.length > 0) {
        // ใช้วิชาแรก
        const firstSubject = subjects[0];
        navigate(`/course-learning/${courseId}/${firstSubject.subject_id}`);
        return;
      }
      
      // ถ้าไม่มี subjects ที่ส่งมา ให้เรียก API เพื่อดึงข้อมูลวิชา
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await axios.get(
        `${apiURL}/api/courses/${courseId}/enrolled-subjects`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success && response.data.subjects.length > 0) {
        // ถ้ามีวิชาที่ลงทะเบียน ให้นำทางไปยังวิชาแรก
        const firstSubject = response.data.subjects[0];
        navigate(`/course-learning/${courseId}/${firstSubject.subject_id}`);
      } else {
        // ถ้าไม่มีวิชาที่ลงทะเบียน ให้แสดงข้อความแจ้งเตือน
        alert("คุณยังไม่ได้ลงทะเบียนวิชาในคอร์สนี้");
      }
    } catch (error) {
      console.error("Error fetching enrolled subjects:", error);
      alert("เกิดข้อผิดพลาดในการเริ่มเรียน กรุณาลองใหม่อีกครั้ง");
    }
  };
  
  // ดึง video ID จาก YouTube URL (ถ้ามี)
  const getYoutubeVideoId = (url?: string) => {
    if (!url) return "Ml4XCF-JS0k"; // ค่าเริ่มต้นถ้าไม่มี URL
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11)
      ? match[2]
      : "Ml4XCF-JS0k"; // ค่าเริ่มต้นถ้าไม่สามารถดึง ID ได้
  };
  
  // ใช้ useEffect เพื่อตั้งค่า YouTube iframe เมื่อ videoUrl เปลี่ยนแปลง
  useEffect(() => {
    if (videoUrl && videoRef.current) {
      const videoId = getYoutubeVideoId(videoUrl);
      
      // ล้างเนื้อหาเดิมใน videoRef
      while (videoRef.current.firstChild) {
        videoRef.current.removeChild(videoRef.current.firstChild);
      }
      
      // สร้าง iframe สำหรับ YouTube
      const iframe = document.createElement('iframe');
      iframe.width = "100%";
      iframe.height = "100%";
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&showinfo=0&rel=0`;
      iframe.frameBorder = "0";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      
      // เพิ่ม iframe ลงใน videoRef
      videoRef.current.appendChild(iframe);
    }
  }, [videoUrl]);

  return (
    <>
      <div className="col-xl-3 col-lg-4">
        <div className="courses__details-sidebar">
          {/* แสดงวิดีโอจาก YouTube โดยตรง */}
          <div className="courses__details-video">
            {videoUrl ? (
              <div ref={videoRef} className="video-container" style={{ width: "100%", height: "200px" }}></div>
            ) : (
              <img src={coverImage || "/assets/img/courses/course_thumb02.jpg"} alt="img" />
            )}
            {videoUrl && (
              <a onClick={() => setIsVideoOpen(true)} style={{ cursor: "pointer" }} className="popup-video">
                <i className="fas fa-play"></i>
              </a>
            )}
          </div>
          
          {/* แสดงความก้าวหน้า */}
          <div className="course-progress-wrap p-3 bg-light rounded mb-4">
            <h5 className="title mb-3">ความก้าวหน้าของคุณ</h5>
            <div className="progress mb-2" style={{ height: "10px" }}>
              <div 
                className="progress-bar bg-success" 
                role="progressbar" 
                style={{ width: `${progress}%` }}
                aria-valuenow={progress} 
                aria-valuemin={0} 
                aria-valuemax={100}
              ></div>
            </div>
            <div className="d-flex justify-content-between">
              <span>{progress}% เสร็จสิ้น</span>
              <span>
                {enrollmentStatus === 'completed' && <span className="text-success">เรียนจบแล้ว</span>}
                {enrollmentStatus === 'in_progress' && <span className="text-primary">กำลังเรียน</span>}
                {enrollmentStatus === 'not_started' && <span className="text-warning">ยังไม่เริ่มเรียน</span>}
              </span>
            </div>
          </div>

          <div className="courses__information-wrap">
            <h5 className="title">หลักสูตรประกอบด้วย:</h5>
            <ul className="list-wrap">
              <li>
                <InjectableSvg src="/assets/img/icons/course_icon01.svg" alt="img" className="injectable" />
                วิชา
                <span>{subjectCount} วิชา</span>
              </li>
              <li>
                <InjectableSvg src="/assets/img/icons/course_icon03.svg" alt="img" className="injectable" />
                บทเรียน
                <span>{totalLessons}</span>
              </li>
              <li>
                <InjectableSvg src="/assets/img/icons/course_icon04.svg" alt="img" className="injectable" />
                แบบทดสอบ
                <span>{totalQuizzes}</span>
              </li>
              <li>
                <InjectableSvg src="/assets/img/icons/course_icon05.svg" alt="img" className="injectable" />
                ใบประกาศนียบัตร
                <span>ใช่</span>
              </li>
            </ul>
          </div>
          
          <div className="courses__details-social">
            <h5 className="title">แบ่งปันหลักสูตรนี้:</h5>
            <ul className="list-wrap">
              <li><Link to="#"><i className="fab fa-facebook-f"></i></Link></li>
              <li><Link to="#"><i className="fab fa-twitter"></i></Link></li>
              <li><Link to="#"><i className="fab fa-whatsapp"></i></Link></li>
              <li><Link to="#"><i className="fab fa-instagram"></i></Link></li>
              <li><Link to="#"><i className="fab fa-youtube"></i></Link></li>
            </ul>
          </div>
          
          <div className="courses__details-enroll">
            <div className="tg-button-wrap">
              <button 
                onClick={handleStartLearning} 
                className="btn btn-two arrow-btn"
              >
                เริ่มเรียน<BtnArrow />
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
