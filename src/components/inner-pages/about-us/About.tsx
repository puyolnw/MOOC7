import { useState, useEffect } from "react";
import SvgAnimation from "../../../hooks/SvgAnimation";
import { Link } from "react-router-dom";
import VideoPopup from "../../../modals/VideoPopup";
import BtnArrow from "../../../svg/BtnArrow";

// API URL configuration
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3301";

interface AboutConfig {
   title?: string;
   subtitle?: string;
   description?: string;
   student_count?: string;
   student_text?: string;
   main_image_file_id?: string;
   student_group_file_id?: string;
}


const About = () => {

   const [isVideoOpen, setIsVideoOpen] = useState(false);
   const svgIconRef = SvgAnimation('/assets/img/others/inner_about_shape.svg');
   
   const [aboutConfig, setAboutConfig] = useState<AboutConfig>({
      title: 'คลังหน่วยกิต<span>หลักสูตรออนไลน์</span><br />มหาวิทยาลัยราชภัฏมหาสารคาม',
      subtitle: 'เกี่ยวกับระบบ',
      description: 'ระบบคลังหน่วยกิตนี้ พัฒนาขึ้นโดยอาจารย์และบุคลากรภายในมหาวิทยาลัยราชภัฏมหาสารคาม เพื่อให้นักศึกษาสามารถเข้าถึงข้อมูลหลักสูตร วิชาที่เปิดสอน และพัฒนาการเรียนรู้อย่างเป็นระบบและยืดหยุ่นตามความถนัดของแต่ละคน',
      student_count: '36K+',
      student_text: 'Enrolled Students'
   });

   useEffect(() => {
      fetchAboutConfig();
   }, []);

   const fetchAboutConfig = async () => {
      try {
         const response = await fetch(`${API_URL}/api/img/page-config?page=about`);
         if (response.ok) {
            const result = await response.json();
            if (result.success) {
               const config = result.page_config;
               setAboutConfig(prev => ({
                  ...prev,
                  title: config.title || prev.title,
                  subtitle: config.subtitle || prev.subtitle,
                  description: config.description || prev.description,
                  student_count: config.student_count || prev.student_count,
                  student_text: config.student_text || prev.student_text,
                  main_image_file_id: config.main_image_file_id,
                  student_group_file_id: config.student_group_file_id
               }));
            }
         }
      } catch (error) {
         console.error('Error fetching about config:', error);
         // ใช้ข้อมูล default ถ้าดึงไม่ได้
      }
   };

   const getImageUrl = (fileId?: string, fallbackPath?: string) => {
      if (fileId) {
         return `${API_URL}/api/img/display/${fileId}`;
      }
      return fallbackPath || '/assets/img/others/inner_about_img.png';
   };

   return (
      <>
         <section className="about-area-three section-py-120">
            <div className="container">
               <div className="row align-items-center justify-content-center">
                  <div className="col-lg-6 col-md-9">
                     <div className="about__images-three tg-svg" ref={svgIconRef}>
                     <img 
                            src={getImageUrl(aboutConfig.main_image_file_id, '/assets/img/others/inner_about_img.png')} 
                            alt="มหาวิทยาลัยราชภัฏมหาสารคาม"
                            onError={(e) => {
                               const target = e.target as HTMLImageElement;
                               target.src = '/assets/img/others/inner_about_img.png';
                            }}
                         />
                        <span className="svg-icon" id="about-svg"></span>
                        <a onClick={() => setIsVideoOpen(true)} style={{ cursor: "pointer" }} className="popup-video">
                           <svg xmlns="http://www.w3.org/2000/svg" width="22" height="28" viewBox="0 0 22 28" fill="none">
                              <path d="M0.19043 26.3132V1.69421C0.190288 1.40603 0.245303 1.12259 0.350273 0.870694C0.455242 0.6188 0.606687 0.406797 0.79027 0.254768C0.973854 0.10274 1.1835 0.0157243 1.39936 0.00193865C1.61521 -0.011847 1.83014 0.0480663 2.02378 0.176003L20.4856 12.3292C20.6973 12.4694 20.8754 12.6856 20.9999 12.9535C21.1245 13.2214 21.1904 13.5304 21.1904 13.8456C21.1904 14.1608 21.1245 14.4697 20.9999 14.7376C20.8754 15.0055 20.6973 15.2217 20.4856 15.3619L2.02378 27.824C1.83056 27.9517 1.61615 28.0116 1.40076 27.9981C1.18536 27.9847 0.97607 27.8983 0.792638 27.7472C0.609205 27.596 0.457661 27.385 0.352299 27.1342C0.246938 26.8833 0.191236 26.6008 0.19043 26.3132Z" fill="currentcolor" />
                           </svg>
                        </a>
                     </div>
                  </div>

                  <div className="col-lg-6">
                     <div className="about__content-three">
                     <div className="section__title mb-10">
                     <span className="sub-title">{aboutConfig.subtitle}</span>
                     <h2 className="title" dangerouslySetInnerHTML={{ __html: aboutConfig.title || '' }}>
                     </h2>
                     </div>
                     <p className="desc">{aboutConfig.description}</p>
                        <ul className="about__info-list list-wrap">
                           <li className="about__info-list-item">
                              <i className="flaticon-angle-right"></i>
                              <p className="content">คณาจารย์ผู้เชี่ยวชาญในสาขาวิชาต่างๆ</p>
                           </li>
                           <li className="about__info-list-item">
                              <i className="flaticon-angle-right"></i>
                              <p className="content">หลักสูตรที่ตอบสนองความต้องการของท้องถิ่น</p>
                           </li>
                           <li className="about__info-list-item">
                              <i className="flaticon-angle-right"></i>
                              <p className="content">การเรียนรู้ที่ยืดหยุ่นผ่านระบบออนไลน์</p>
                           </li>
                        </ul>
                        <div className="tg-button-wrap">
                           <Link to="/contact" className="btn arrow-btn">เริ่มเรียนรู้กับเรา <BtnArrow /></Link>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </section>
         <VideoPopup
            isVideoOpen={isVideoOpen}
            setIsVideoOpen={setIsVideoOpen}
            videoId={"Ml4XCF-JS0k"}
         />
      </>
   )
}

export default About
