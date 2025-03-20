import faq_data from "../../../data/home-data/FaqData";
import InjectableSvg from "../../../hooks/InjectableSvg";
import MotionAnimation from "../../../hooks/MotionAnimation";
import SvgAnimation from "../../../hooks/SvgAnimation";
import CurvedCircle from "./CurvedCircle"
import {useState, useEffect } from "react"

interface faqItem {
   id: number;
   page: string;
   question: string;
   answer: string;
   showAnswer: boolean;
};

const FaqArea = () => {

   const [faqData, setFaqData] = useState<faqItem[]>([]);

   useEffect(() => {
       const initialFaqData: faqItem[] = faq_data.map((faq, index) => ({
           ...faq,
           showAnswer: index === 0,
       }));
       setFaqData(initialFaqData);
   }, []);

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
                        <img src="/assets/img/others/faq_img.png" alt="img" />
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
                        <span className="sub-title">คำถามที่พบบ่อย</span>
                        <h2 className="title">เริ่มต้นการเรียนรู้จาก <br /> อาจารย์ผู้สอนมืออาชีพระดับโลก</h2>
                     </div>
                     {/* <p>กล่องจดหมายแบบแชร์ที่ใช้งานง่ายของ Groove ช่วยให้สมาชิกในทีมจัดระเบียบ กำหนดลำดับความสำคัญ และ... ในตอนนี้</p> */}
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
