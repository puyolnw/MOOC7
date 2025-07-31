import faq_data from "../../../data/home-data/FaqData";
import InjectableSvg from "../../../hooks/InjectableSvg";
import MotionAnimation from "../../../hooks/MotionAnimation";
import SvgAnimation from "../../../hooks/SvgAnimation";
import CurvedCircle from "./CurvedCircle"
import {useState, useEffect } from "react"

// API URL configuration
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3301";

interface faqItem {
   id: number;
   page: string;
   question: string;
   answer: string;
   showAnswer: boolean;
};

const FaqArea = () => {

   const [faqData, setFaqData] = useState<faqItem[]>([]);
   const [faqImage, setFaqImage] = useState<string>('/assets/img/others/faq_img.png');
   const [faqContent, setFaqContent] = useState({
     title: 'เริ่มต้นการเรียนรู้จาก <br /> อาจารย์ผู้สอนมืออาชีพ',
     subtitle: 'คำถามที่พบบ่อย'
   });

   useEffect(() => {
       const initialFaqData: faqItem[] = faq_data.map((faq, index) => ({
           ...faq,
           showAnswer: index === 0,
       }));
       setFaqData(initialFaqData);
       
       // โหลดรูปภาพ FAQ จาก backend
       fetchFaqImage();
   }, []);

   const fetchFaqImage = async () => {
     try {
       const response = await fetch(`${API_URL}/api/img/page-config?page=faq`);
       if (response.ok) {
         const result = await response.json();
         if (result.success) {
           const config = result.page_config;
           
           // อัปเดตรูปภาพ
           if (config.main_image_file_id) {
             setFaqImage(`${API_URL}/api/img/display/${config.main_image_file_id}`);
           }
           
           // อัปเดตข้อความ
           setFaqContent({
             title: config.title || faqContent.title,
             subtitle: config.subtitle || faqContent.subtitle
           });
         }
       }
     } catch (error) {
       console.error('Error fetching FAQ config:', error);
       // ใช้ข้อมูลเดิมถ้าดึงไม่ได้
     }
   };

   const toggleAnswer = (index: number) => {
       setFaqData((prevFaqData) => {
           const updatedFaqData = prevFaqData.map((faq, i) => ({
               ...faq,
               showAnswer: i === index ? !faq.showAnswer : false,
           }));
           return updatedFaqData;
       });
   };

   MotionAnimation();
   const svgIconRef = SvgAnimation('/assets/img/others/faq_shape02.svg');

   return (
      <section className="faq__area">
         <div className="container">
            <div className="row align-items-center">
               <div className="col-lg-6">
                  <div className="faq__img-wrap tg-svg" ref={svgIconRef}>
                     <div className="faq__round-text">
                        <CurvedCircle />
                     </div>
                     <div className="faq__img">
                     <img 
                           src={faqImage} 
                           alt="FAQ" 
                           onError={(e) => {
                             const target = e.target as HTMLImageElement;
                             target.src = '/assets/img/others/faq_img.png';
                           }}
                         />
                        <div className="shape-one">
                           <InjectableSvg src="/assets/img/others/faq_shape01.svg" className="injectable tg-motion-effects4" alt="img" />
                        </div>
                        <div className="shape-two">
                           <span className="svg-icon"></span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="col-lg-6">
                  <div className="faq__content">
                     <div className="section__title pb-10">
                     <span className="sub-title">{faqContent.subtitle}</span>
                     <h2 className="title" dangerouslySetInnerHTML={{ __html: faqContent.title }}></h2>
                     </div>
                  
                     <div className="faq__wrap">
                        <div className="accordion" id="accordionExample">
                           {faqData.map((item, index) => (
                              <div key={item.id} className="accordion-item">
                                 <h2 className="accordion-header">
                                    <button className={`accordion-button  ${item.showAnswer ? "" : "collapsed"}`}
                                            type="button" onClick={() => toggleAnswer(index)}>
                                       {item.question}
                                    </button>
                                 </h2>
                                 {item.showAnswer && (
                                 <div id={`collapse${item.id}`}  className="accordion-collapse collapse show">
                                    <div className="accordion-body">
                                       <p>{item.answer}</p>
                                    </div>
                                 </div>
                                 )}
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default FaqArea
