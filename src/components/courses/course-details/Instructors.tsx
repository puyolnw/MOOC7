import { Link } from "react-router-dom"

interface Instructor {
  instructor_id: number;
  name: string;
  position: string;
  avatar?: string;
  bio?: string;
}

interface InstructorsProps {
  instructors: Instructor[];
}

const Instructors = ({ instructors }: InstructorsProps) => {
   return (
      <div className="courses__instructors-wrap">
         <h2 className="title">ผู้สอนในหลักสูตร</h2>
         
         {instructors && instructors.length > 0 ? (
            instructors.map((instructor) => (
               <div key={instructor.instructor_id} className="courses__instructors-item mb-4">
                  <div className="courses__instructors-thumb">
                     <img 
                        src={instructor.avatar || "/assets/img/courses/course_instructors.png"} 
                        alt={instructor.name} 
                     />
                  </div>
                  <div className="courses__instructors-content">
                     <h2 className="title">{instructor.name}</h2>
                     <span className="designation">{instructor.position}</span>
                     <p className="avg-rating"><i className="fas fa-star"></i>(4.8 Ratings)</p>
                     <p>{instructor.bio || "ไม่มีข้อมูลประวัติผู้สอน"}</p>
                     <div className="instructor__social">
                        <ul className="list-wrap justify-content-start">
                           <li><Link to="#"><i className="fab fa-facebook-f"></i></Link></li>
                           <li><Link to="#"><i className="fab fa-twitter"></i></Link></li>
                           <li><Link to="#"><i className="fab fa-whatsapp"></i></Link></li>
                           <li><Link to="#"><i className="fab fa-instagram"></i></Link></li>
                        </ul>
                     </div>
                  </div>
               </div>
            ))
         ) : (
            <div className="alert alert-info">
               <i className="fas fa-info-circle me-2"></i>
               ยังไม่มีข้อมูลผู้สอนในหลักสูตรนี้
            </div>
         )}
      </div>
   )
}

export default Instructors
