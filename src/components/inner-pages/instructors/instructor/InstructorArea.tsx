import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import inner_instructor_data from "../../../../data/inner-data/InstructorData"

// API URL configuration
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3301";

interface InstructorData {
   id: number;
   name: string;
   degisnation: string;
   thumb: string;
   page: string;
}

interface InstructorConfig {
   title?: string;
   subtitle?: string;
   instructor1_name?: string;
   instructor1_designation?: string;
   instructor1_image_file_id?: string;
   instructor2_name?: string;
   instructor2_designation?: string;
   instructor2_image_file_id?: string;
   instructor3_name?: string;
   instructor3_designation?: string;
   instructor3_image_file_id?: string;
   instructor4_name?: string;
   instructor4_designation?: string;
   instructor4_image_file_id?: string;
}

const InstructorArea = () => {
   const [instructorConfig, setInstructorConfig] = useState<InstructorConfig>({
      title: 'อาจารย์ระดับชั้นนำและผู้เชี่ยวชาญของเรา',
      subtitle: 'แนะนำผู้มีทักษะ',
      instructor1_name: 'อาจารย์ ดร.วีระพน ภานุรักษ์',
      instructor1_designation: 'นำร่อง หลักสูตรแบบชุดวิชา',
      instructor2_name: 'อาจารย์ภาสกร ธนศิระธรรม',
      instructor2_designation: 'สาขาเทคโนโลยีสารสนเทศ',
      instructor3_name: 'อาจารย์ทรงพล นามคุณ',
      instructor3_designation: 'วิศวกรรมคอมพิวเตอร์',
      instructor4_name: 'ดร.ณพรรธนนท์ ทองปาน',
      instructor4_designation: 'สาขาเทคโนโลยีคอมพิวเตอร์และดิจิทัล'
   });

   const [instructorData, setInstructorData] = useState<InstructorData[]>(
      inner_instructor_data.filter((items) => items.page === "inner_1")
   );

   useEffect(() => {
      fetchInstructorConfig();
   }, []);

   const fetchInstructorConfig = async () => {
      try {
         const response = await fetch(`${API_URL}/api/img/page-config?page=instructor`);
         if (response.ok) {
            const result = await response.json();
            if (result.success) {
               const config = result.page_config;
               console.log('Instructor config received:', config);
               
               setInstructorConfig(prev => ({
                  ...prev,
                  title: config.title || prev.title,
                  subtitle: config.subtitle || prev.subtitle,
                  instructor1_name: config.instructor1_name || prev.instructor1_name,
                  instructor1_designation: config.instructor1_designation || prev.instructor1_designation,
                  instructor1_image_file_id: config.instructor1_image_file_id,
                  instructor2_name: config.instructor2_name || prev.instructor2_name,
                  instructor2_designation: config.instructor2_designation || prev.instructor2_designation,
                  instructor2_image_file_id: config.instructor2_image_file_id,
                  instructor3_name: config.instructor3_name || prev.instructor3_name,
                  instructor3_designation: config.instructor3_designation || prev.instructor3_designation,
                  instructor3_image_file_id: config.instructor3_image_file_id,
                  instructor4_name: config.instructor4_name || prev.instructor4_name,
                  instructor4_designation: config.instructor4_designation || prev.instructor4_designation,
                  instructor4_image_file_id: config.instructor4_image_file_id
               }));

               // อัปเดตข้อมูลอาจารย์ด้วยข้อมูลจาก backend
               const updatedData = instructorData.map((item, index) => {
                  const instructorNum = index + 1;
                  const nameKey = `instructor${instructorNum}_name` as keyof InstructorConfig;
                  const designationKey = `instructor${instructorNum}_designation` as keyof InstructorConfig;
                  const imageKey = `instructor${instructorNum}_image_file_id` as keyof InstructorConfig;
                  
                  console.log(`Instructor ${instructorNum}:`, {
                     name: config[nameKey],
                     designation: config[designationKey], 
                     imageFileId: config[imageKey]
                  });
                  
                  return {
                     ...item,
                     name: config[nameKey] || item.name,
                     degisnation: config[designationKey] || item.degisnation,
                     thumb: config[imageKey] ? 
                        getImageUrl(config[imageKey] as string) : 
                        item.thumb
                  };
               });
               console.log('Updated instructor data:', updatedData);
               setInstructorData(updatedData);
            }
         }
      } catch (error) {
         console.error('Error fetching instructor config:', error);
         // ใช้ข้อมูล default ถ้าดึงไม่ได้
      }
   };

   const getImageUrl = (fileId?: string, fallbackPath?: string) => {
      if (fileId) {
         return `${API_URL}/api/img/display/${fileId}`;
      }
      return fallbackPath || '/assets/img/instructor/instructor001.png';
   };

   return (
      <section className="instructor__area">
         <div className="container">
            {/* หัวข้อหลักและรอง */}
            <div className="row">
               <div className="col-12">
                  <div className="section__title text-center mb-5">
                     <span className="sub-title">{instructorConfig.subtitle}</span>
                     <h2 className="title">{instructorConfig.title}</h2>
                  </div>
               </div>
            </div>
            
            <div className="row">
               {instructorData.map((item) => (
               <div key={item.id} className="col-xl-4 col-sm-6">
               <div className="instructor__item">
               <div className="instructor__thumb">
               <Link to="/instructor-details">
                     <img 
                        src={item.thumb} 
                     alt="img"
                     onError={(e) => {
                                     const target = e.target as HTMLImageElement;
                                     target.src = `/assets/img/instructor/instructor00${item.id}.png`;
                                     console.log(`Image failed to load for instructor ${item.id}, using fallback`);
                                  }}
                               />
                            </Link>
                         </div>
                         <div className="instructor__content">
                            <h2 className="title"><Link to="/instructor-details">{item.name}</Link></h2>
                            <span className="designation">{item.degisnation}</span>
                           <p className="avg-rating">
                              <i className="fas fa-star"></i>
                              (4.8 Ratings)
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
      </section>
   )
}

export default InstructorArea
