import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { useEffect, useState } from 'react';

interface DataType {
   id: number;
   avatar_thumb: string;
   avatar_name: string;
   desc: string;
};

const testi_data: DataType[] = [
   {
      id: 1,
      avatar_thumb: "/assets/img/others/testi_author01.png",
      avatar_name: "Wade Warren",
      desc: "“ เมื่อช่างพิมพ์ที่ไม่รู้จักคนหนึ่งนำเครื่องพิมพ์ดีดจากตรอกซอกซอยมาพิมพ์หนังสือตัวอย่าง”",
   },
   {
      id: 2,
      avatar_thumb: "/assets/img/others/testi_author02.png",
      avatar_name: "Jenny Wilson",
      desc: "“เมื่อช่างพิมพ์ที่ไม่รู้จักคนหนึ่งนำเครื่องพิมพ์ดีดจากตรอกซอกซอยมาพิมพ์หนังสือตัวอย่าง”",
   },
   {
      id: 3,
      avatar_thumb: "/assets/img/others/testi_author03.png",
      avatar_name: "Guy Hawkin",
      desc: "“ เมื่อช่างพิมพ์ที่ไม่รู้จักคนหนึ่งนำเครื่องพิมพ์ดีดจากตรอกซอกซอยมาพิมพ์หนังสือตัวอย่าง”",
   },
   {
      id: 4,
      avatar_thumb: "/assets/img/others/testi_author02.png",
      avatar_name: "Jenny Wilson",
      desc: "“เมื่อช่างพิมพ์ที่ไม่รู้จักคนหนึ่งนำเครื่องพิมพ์ดีดจากตรอกซอกซอยมาพิมพ์หนังสือตัวอย่าง”",
   },
];

const setting = {
   slidesPerView: 3,
   spaceBetween: 30,
   observer: true,
   observeParents: true,
   loop: true,
   breakpoints: {
      '1500': {
         slidesPerView: 3,
      },
      '1200': {
         slidesPerView: 3,
      },
      '992': {
         slidesPerView: 3,
         spaceBetween: 24,
      },
      '768': {
         slidesPerView: 2,
         spaceBetween: 24,
      },
      '576': {
         slidesPerView: 1,
      },
      '0': {
         slidesPerView: 1,
      },
   },
   // Navigation arrows
   navigation: {
      nextEl: ".testimonial-button-next",
      prevEl: ".testimonial-button-prev",
   },
}

const Testimonial = () => {

   const [isLoop, setIsLoop] = useState(false);
   useEffect(() => {
      setIsLoop(true);
   }, []);

   return (
      <section className="testimonial__area section-py-120">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-5">
                  <div className="section__title text-center mb-50">
                     <span className="sub-title">ข้อความรับรองของเรา</span>
                     <h2 className="title">นักเรียนคิดและพูดเกี่ยวกับ SkillGrow อย่างไร</h2>
                     <p>เมื่อช่างพิมพ์ที่รู้จักได้ใช้แกลลอรี่ของประเภท scrambl edmake</p>
                  </div>
               </div>
            </div>
            
            <div className="row">
               <div className="col-12">
                  <div className="testimonial__item-wrap">
                     <Swiper
                        {...setting}
                        modules={[Navigation]}
                        loop={isLoop} className="swiper-container testimonial-swiper-active">
                        {testi_data.map((item) => (
                           <SwiperSlide key={item.id} className="swiper-slide">
                              <div className="testimonial__item">
                                 <div className="testimonial__item-top">
                                    <div className="testimonial__author">
                                       <div className="testimonial__author-thumb">
                                          <img src={item.avatar_thumb} alt="img" />
                                       </div>
                                       <div className="testimonial__author-content">
                                          <div className="rating">
                                             <i className="fas fa-star"></i>
                                             <i className="fas fa-star"></i>
                                             <i className="fas fa-star"></i>
                                             <i className="fas fa-star"></i>
                                             <i className="fas fa-star"></i>
                                          </div>
                                          <h2 className="title">{item.avatar_name}</h2>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="testimonial__content">
                                    <p>{item.desc}</p>
                                 </div>
                              </div>
                           </SwiperSlide>
                        ))}
                     </Swiper>
                     <div className="testimonial__nav">
                        <button className="testimonial-button-prev"><i className="flaticon-arrow-right"></i></button>
                        <button className="testimonial-button-next"><i className="flaticon-arrow-right"></i></button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default Testimonial
