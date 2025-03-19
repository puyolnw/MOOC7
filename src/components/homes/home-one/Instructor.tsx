import { Link } from "react-router-dom";
import BtnArrow from "../../../svg/BtnArrow";

interface DataType {
   id: number;
   thumb: string
   title: string;
   designation: string;
   rating: string;
};

const instructor_data: DataType[] = [
   {
      id: 1,
      thumb: "/assets/img/instructor/instructor01.png",
      title: "Mark Jukarberg",
      designation: "ผการออกแบบ UX",
      rating: "(4.8 รีวิว)"
   },
   {
      id: 2,
      thumb: "/assets/img/instructor/instructor02.png",
      title: "Olivia Mia",
      designation: "การออกแบบเว็บไซต์",
      rating: "(4.8 รีวิว)"
   },
   {
      id: 3,
      thumb: "/assets/img/instructor/instructor03.png",
      title: "William Hope",
      designation: "การตลาดดิจิตอล",
      rating: "(4.8 รีวิว)"
   },
   {
      id: 4,
      thumb: "/assets/img/instructor/instructor04.png",
      title: "Sophia Ava",
      designation: "การพัฒนาเว็บ",
      rating: "(4.8 รีวิว)"
   },
];

const Instructor = () => {
   return (
      <section className="instructor__area">
         <div className="container">
            <div className="row align-items-center">
               <div className="col-xl-4">
                  <div className="instructor__content-wrap">
                     <div className="section__title mb-15">
                        <span className="sub-title">แนะนำผู้มีทักษะ</span>
                        <h2 className="title">อาจารย์ระดับชั้นนำและผู้เชี่ยวชาญของเราอยู่ในที่เดียว</h2>
                     </div>
                     {/* <p>when an unknown printer took a galley of type and scrambled makespecimen book has survived not only five centuries</p> */}
                     <div className="tg-button-wrap">
                        <Link to="/instructors" className="btn arrow-btn">ดูผู้สอนทั้งหมด<BtnArrow /></Link>
                     </div>
                  </div>
               </div>

               <div className="col-xl-8">
                  <div className="instructor__item-wrap">
                     <div className="row">
                        {instructor_data.map((item) => (
                           <div key={item.id} className="col-sm-6">
                              <div className="instructor__item">
                                 <div className="instructor__thumb">
                                    <Link to="/instructor-datails"><img src={item.thumb} alt="img" /></Link>
                                 </div>
                                 <div className="instructor__content">
                                    <h2 className="title"><Link to="/instructor-datails">{item.title}</Link></h2>
                                    <span className="designation">{item.designation}</span>
                                    <p className="avg-rating">
                                       <i className="fas fa-star"></i>{item.rating}
                                    </p>
                                    <div className="instructor__social">
                                       <ul className="list-wrap">
                                          <li><Link to="#"><i className="fab fa-facebook-f"></i></Link></li>
                                          <li><Link to="#"><i className="fab fa-twitter"></i></Link></li>
                                          <li><Link to="#"><i className="fab fa-whatsapp"></i></Link></li>
                                          <li><Link to="#"><i className="fab fa-instagram"></i></Link></li>
                                       </ul>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default Instructor
