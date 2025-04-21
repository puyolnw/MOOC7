import { useState } from "react";
import InjectableSvg from "../../../hooks/InjectableSvg";
import { Link } from "react-router-dom";
import VideoPopup from "../../../modals/VideoPopup";

interface SidebarProps {
  subject_id: number;
  subject_code: string;
  subject_name: string;
  credits: number;
  lesson_count: number;
  quiz_count: number;
  cover_image?: string;
}

const Sidebar = ({
  subject_code,
  subject_name,
  credits,
  lesson_count,
  quiz_count,
  cover_image,
}: SidebarProps) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  console.log("Cover image received in Sidebar:", cover_image);

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