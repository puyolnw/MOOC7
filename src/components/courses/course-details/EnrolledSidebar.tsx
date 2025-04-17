import { useState, useEffect } from "react";
import InjectableSvg from "../../../hooks/InjectableSvg";
import { Link } from "react-router-dom";
import VideoPopup from "../../../modals/VideoPopup";

interface EnrolledSidebarProps {
  subjectCount: number;
  totalLessons: number;
  totalQuizzes: number;
  courseId: number;
  videoUrl?: string;
  coverImage?: string;
  progress: number;
  enrollmentStatus: string;
}

const EnrolledSidebar = ({ 
  subjectCount, 
  totalLessons, 
  totalQuizzes, 
  courseId, 
  videoUrl, 
  coverImage,
  progress,
  enrollmentStatus
}: EnrolledSidebarProps) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [thumbnailImage, setThumbnailImage] = useState(coverImage || "/assets/img/courses/course_thumb02.jpg");
  
  // ดึง video ID จาก YouTube URL (ถ้ามี)
  const getYoutubeVideoId = (url?: string) => {
    if (!url) return "Ml4XCF-JS0k"; // ค่าเริ่มต้นถ้าไม่มี URL
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11)
      ? match[2]
      : "Ml4XCF-JS0k"; // ค่าเริ่มต้นถ้าไม่สามารถดึง ID ได้
  };
  
  // ใช้ useEffect เพื่อตั้งค่ารูปภาพปกจาก YouTube เมื่อ videoUrl เปลี่ยนแปลง
  useEffect(() => {
    if (videoUrl) {
      const videoId = getYoutubeVideoId(videoUrl);
      // ใช้รูปภาพคุณภาพสูงจาก YouTube
      const youtubeThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      
      // ตรวจสอบว่ารูปภาพมีอยู่จริงหรือไม่
      const img = new Image();
      img.onload = () => {
        // ถ้ารูปภาพโหลดสำเร็จ ใช้รูปภาพนั้น
        setThumbnailImage(youtubeThumbnail);
      };
      img.onerror = () => {
        // ถ้ารูปภาพไม่มีอยู่ ใช้รูปภาพคุณภาพต่ำแทน
        setThumbnailImage(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
      };
      img.src = youtubeThumbnail;
    } else if (coverImage) {
      // ถ้าไม่มี videoUrl แต่มี coverImage ให้ใช้ coverImage
      setThumbnailImage(coverImage);
    }
  }, [videoUrl, coverImage]);

  return (
    <>
      <div className="col-xl-3 col-lg-4">
        <div className="courses__details-sidebar">
          <div className="courses__details-video">
            <img src={thumbnailImage} alt="img" />
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
              <Link to={`/course-learning/${courseId}`} className="btn btn-two arrow-btn">
                เข้าสู่บทเรียน <i className="fas fa-arrow-right ms-2"></i>
              </Link>
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
