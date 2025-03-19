import { useState } from "react";
import InjectableSvg from "../../../hooks/InjectableSvg";
import { Link } from "react-router-dom";
import BtnArrow from "../../../svg/BtnArrow";
import VideoPopup from "../../../modals/VideoPopup";

const Sidebar = () => {

   const [isVideoOpen, setIsVideoOpen] = useState(false);

   return (
      <>
         <div className="col-xl-3 col-lg-4">
            <div className="courses__details-sidebar">
               <div className="courses__details-video">
                  <img src="/assets/img/courses/course_thumb02.jpg" alt="img" />
                  <a onClick={() => setIsVideoOpen(true)} style={{ cursor: "pointer" }} className="popup-video"><i className="fas fa-play"></i></a>
               </div>

               <div className="courses__information-wrap">
                  <h5 className="title">หลักสูตรประกอบด้วย:</h5>
                  <ul className="list-wrap">
                     <li>
                        <InjectableSvg src="/assets/img/icons/course_icon01.svg" alt="img" className="injectable" />
                        ระดับ
                        <span>ผู้เชี่ยวชาญ</span>
                     </li>
                     <li>
                        <InjectableSvg src="/assets/img/icons/course_icon02.svg" alt="img" className="injectable" />
                        ระยะเวลา
                        <span>11h 20m</span>
                     </li>
                     <li>
                        <InjectableSvg src="/assets/img/icons/course_icon03.svg" alt="img" className="injectable" />
                        บทเรียน
                        <span>12</span>
                     </li>
                     <li>
                        <InjectableSvg src="/assets/img/icons/course_icon04.svg" alt="img" className="injectable" />
                        แบบทดสอบ
                        <span>145</span>
                     </li>
                     <li>
                        <InjectableSvg src="/assets/img/icons/course_icon05.svg" alt="img" className="injectable" />
                        ใบประกาศนียบัตร
                        <span>ใช่</span>
                     </li>
                     <li>
                        <InjectableSvg src="/assets/img/icons/course_icon06.svg" alt="img" className="injectable" />
                        สำเร็จการศึกษา
                        <span>25K</span>
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
                     <Link to="/student-enrolled-courses" className="btn btn-two arrow-btn">
                     ลงทะเบียนเรียน<BtnArrow />
                     </Link>
                  </div>
               </div>
            </div>
         </div>
         <VideoPopup
            isVideoOpen={isVideoOpen}
            setIsVideoOpen={setIsVideoOpen}
            videoId={"Ml4XCF-JS0k"}
         />
      </>
   )
}

export default Sidebar
