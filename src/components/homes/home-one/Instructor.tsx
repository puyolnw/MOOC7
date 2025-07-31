import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

// API URL configuration
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3301";


interface DataType {
   id: number;
   thumb: string
   title: string;
   designation: string;

};

const instructor_data: DataType[] = [
   {
      id: 1,
      thumb: "/assets/img/instructor/instructor001.png",
      title: "อาจารย์ ดร.วีระพน ภานุรักษ์",
      designation: "นำร่อง หลักสูตรแบบชุดวิชา",

   },
   {
      id: 2,
      thumb: "/assets/img/instructor/in02.png",
      title: "อาจารย์ภาสกร  ธนศิระธรรม",
      designation: "สาขาเทคโนโลยีสารสนเทศ ",

   },
   {
      id: 3,
      thumb: "/assets/img/instructor/in06.png",
      title: "อาจารย์ทรงพล นามคุณ ",
      designation: "วิศวกรรมคอมพิวเตอร์",

   },
   {
      id: 4,
      thumb: "/assets/img/instructor/in09.png",
      title: "ดร.ณพรรธนนท์ ทองปาน" ,
      designation: "สาขาเทคโนโลยีคอมพิวเตอร์และดิจิทัล ",
   
   },
];

const Instructor = () => {
   const [instructorImages, setInstructorImages] = useState<{[key: number]: string}>({});

   useEffect(() => {
     fetchInstructorImages();
   }, []);

   const fetchInstructorImages = async () => {
     try {
       const response = await fetch(`${API_URL}/api/img/page-config?page=instructor`);
       if (response.ok) {
         const result = await response.json();
         if (result.success) {
           const config = result.page_config;
           const images: {[key: number]: string} = {};
           
           // Map instructor images from backend
           for (let i = 1; i <= 4; i++) {
             const fileIdKey = `instructor${i}_image_file_id`;
             if (config[fileIdKey]) {
               images[i] = `${API_URL}/api/img/display/${config[fileIdKey]}`;
             }
           }
           setInstructorImages(images);
         }
       }
     } catch (error) {
       console.error('Error fetching instructor images:', error);
       // ใช้รูปเดิมถ้าดึงไม่ได้
     }
   };

   const getInstructorImage = (id: number, defaultThumb: string) => {
     return instructorImages[id] || defaultThumb;
   };

   return (
      <section className="instructor__area">
         <div className="container">
            <div className="row align-items-center">
               <div className="col-xl-4">
                  <div className="instructor__content-wrap">
                     <div className="section__title mb-15">
                        <span className="sub-title">แนะนำผู้มีทักษะ</span>
                        <h2 className="title">อาจารย์ระดับชั้นนำและผู้เชี่ยวชาญของเรา</h2>
                     </div>
                     {/* <p>when an unknown printer took a galley of type and scrambled makespecimen book has survived not only five centuries</p> */}
                  </div>
               </div>

               <div className="col-xl-8">
                  <div className="instructor__item-wrap">
                     <div className="row">
                        {instructor_data.map((item) => (
                           <div key={item.id} className="col-sm-6">
                              <div className="instructor__item">
                                 <div className="instructor__thumb">
                                 <Link to="#">
                                      <img 
                                         src={getInstructorImage(item.id, item.thumb)} 
                                         alt="img"
                                         onError={(e) => {
                                           const target = e.target as HTMLImageElement;
                                           target.src = item.thumb;
                                         }}
                                       />
                                     </Link>
                                  </div>
                                 <div className="instructor__content">
                                    <h2 className="title"><Link to="
                                    #">{item.title}</Link></h2>
                                    <span className="designation">{item.designation}</span>

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
