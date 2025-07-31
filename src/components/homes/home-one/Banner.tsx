import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SvgAnimation from '../../../hooks/SvgAnimation';
import BtnArrow from '../../../svg/BtnArrow';

// API URL configuration
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3301";

interface BannerData {
   title: string;
   subtitle: string;
   description: string;
   main_image?: string;
   main_image_file_id?: string;
   instructor1_name: string;
   instructor1_image?: string;
   instructor1_image_file_id?: string;
   instructor2_name: string;
   instructor2_image?: string;
   instructor2_image_file_id?: string;
   background_image?: string;
   background_image_file_id?: string;
}

const Banner = () => {
   const svgIconRef = SvgAnimation('/assets/img/objects/title_shape.svg');
   
   const [bannerData, setBannerData] = useState<BannerData>({
      title: 'อย่าหยุดการเรียนรู้ ชีวิต อย่าหยุด พัฒนา',
      subtitle: 'ทุกบทเรียนคือก้าวใหม่ เราพร้อมอยู่เคียงข้างคุณในทุกเส้นทาง',
      description: 'ลงทะเบียนตอนนี้',
      instructor1_name: 'ดร. วีระพน ภานุรักษ์',
      instructor2_name: 'อ. วินัย โกหลำ'
   });

   // โหลดข้อมูล Banner จาก API
   useEffect(() => {
      fetchBannerData();
   }, []);

   const fetchBannerData = async () => {
      try {
         const response = await fetch(`${API_URL}/api/img/banner-config`);
         if (response.ok) {
            const result = await response.json();
            if (result.success) {
               const config = result.banner_config;
               const newBannerData = {
                  title: config.banner_title || bannerData.title,
                  subtitle: config.banner_subtitle || bannerData.subtitle,
                  description: config.banner_cta_text || bannerData.description,
                  instructor1_name: config.banner_instructor1_name || bannerData.instructor1_name,
                  instructor2_name: config.banner_instructor2_name || bannerData.instructor2_name,
                  main_image_file_id: config.main_image_file_id,
                  instructor1_image_file_id: config.instructor1_image_file_id,
                  instructor2_image_file_id: config.instructor2_image_file_id,
                  background_image_file_id: config.background_image_file_id
               };
               
               setBannerData(newBannerData);
            }
         }
      } catch (error) {
         console.error('Error fetching banner data:', error);
         // ใช้ข้อมูล default ถ้าดึงไม่ได้
      }
   };

   const getImageUrl = (fileId?: string, fallbackPath?: string) => {
      if (fileId) {
         return `${API_URL}/api/img/display/${fileId}`;
      }
      return fallbackPath || '/assets/img/banner/banner_img.png';
   };

   return (
   <section
   className="banner-area banner-bg tg-motion-effects"
   style={{ 
        backgroundImage: `url(${getImageUrl(bannerData.background_image_file_id, '/assets/img/banner/banner_bg.png')})` 
   }}
   >
   <div className="container">
   <div className="row justify-content-between align-items-start">
   <div className="col-xl-5 col-lg-6">
   <div className="banner__content">
   <h3 className="title tg-svg" data-aos="fade-right" data-aos-delay="400" ref={svgIconRef}>
   {bannerData.title.split(' ').slice(0, 1).join(' ')}
   <span className="position-relative" style={{ marginLeft: "10px" }}>
   <span className="svg-icon"></span>
   <svg x="0px" y="0px" preserveAspectRatio="none" viewBox="0 0 209 59" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.74438 7.70565C69.7006 -1.18799 136.097 -2.38304 203.934 4.1205C207.178 4.48495 209.422 7.14626 208.933 10.0534C206.793 23.6481 205.415 36.5704 204.801 48.8204C204.756 51.3291 202.246 53.5582 199.213 53.7955C136.093 59.7623 74.1922 60.5985 13.5091 56.3043C10.5653 56.0924 7.84371 53.7277 7.42158 51.0325C5.20725 38.2627 2.76333 25.6511 0.0898448 13.1978C-0.465589 10.5873 1.61173 8.1379 4.73327 7.70565" fill="#4CAF50" />
      </svg>
      {bannerData.title.split(' ').slice(1, 2).join(' ')}
   </span>
      <br />
      {bannerData.title.split(' ').slice(2).join(' ')}
   </h3>
   <p data-aos="fade-right" data-aos-delay="600">
      {bannerData.subtitle}
   </p>
   <div className="banner__btn-wrap" data-aos="fade-right" data-aos-delay="800">
   <Link to="/registration" className="btn arrow-btn">
         {bannerData.description} <BtnArrow />
         </Link>
         </div>
                  </div>
   </div>

   <div className="col-lg-6">
   <div className="banner__images">
   <img 
      src={getImageUrl(bannerData.main_image_file_id, '/assets/img/banner/banner_img.png')} 
      alt="img" 
      className="main-img"
      onError={(e) => {
      // Fallback หากรูปจาก backend โหลดไม่ได้
   const target = e.target as HTMLImageElement;
   target.src = '/assets/img/banner/banner_img.png';
   }}
   />
   <div className="shape big-shape" data-aos="fade-up-right" data-aos-delay="600">
   <img src="/assets/img/banner/banner_shape01.png" alt="shape" className="tg-motion-effects1" />
   </div>
   <img src="/assets/img/banner/bg_dots.svg" alt="shape" className="shape bg-dots rotateme" />
   <img src="/assets/img/banner/banner_shape02.png" alt="shape" className="shape small-shape tg-motion-effects3" />
   <div className="banner__author">
   <div className="banner__author-item">
      <div className="image">
            <img 
                  src={getImageUrl(bannerData.instructor1_image_file_id, '/assets/img/banner/banner_author01.png')} 
                     alt="instructor1"
                        onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/assets/img/banner/banner_author01.png';
                              }}
                              />
                           </div>
                           <h6 className="name">{bannerData.instructor1_name}</h6>
                        </div>
                        <div className="banner__author-item">
                           <div className="image">
                              <img 
                                 src={getImageUrl(bannerData.instructor2_image_file_id, '/assets/img/banner/banner_author02.png')} 
                                 alt="instructor2"
                                 onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/assets/img/banner/banner_author02.png';
                                 }}
                              />
                           </div>
                           <h6 className="name">{bannerData.instructor2_name}</h6>
                        </div>
                        <img src="/assets/img/banner/banner_shape02.svg" alt="shape" className="arrow-shape tg-motion-effects3" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <img src="/assets/img/banner/banner_shape01.svg" alt="shape" className="line-shape" data-aos="fade-right" data-aos-delay="1600" />
      </section>
   );
};

export default Banner;
