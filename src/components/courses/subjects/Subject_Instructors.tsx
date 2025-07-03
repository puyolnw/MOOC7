import { Link } from "react-router-dom";

interface Instructor {
  instructor_id: number;
  name: string;
  position: string;
  avatar_path?: string | null; 
  avatar_file_id?: string | null; 
  bio: string;
}

interface InstructorsProps {
  instructors: Instructor[];
}

const Instructors = ({ instructors }: InstructorsProps) => {
  const apiURL = import.meta.env.VITE_API_URL;

  return (
    <div className="courses__instructors-wrap">
      <h3 className="title">อาจารย์ผู้สอน</h3>
      
      {instructors.length > 0 ? (
        <div className="row">
          {instructors.map(instructor => (
            <div key={instructor.instructor_id} className="col-lg-6 col-md-6">
              <div className="team__item-two">
                <div className="team__thumb-two">
                  <img 
                    src={
                      instructor.avatar_file_id
                        ? `${apiURL}/api/accounts/instructors/avatar/${instructor.avatar_file_id}`
                        : "/assets/img/courses/course_thumb01.jpg"
                    } 
                    alt={instructor.name} 
                  />
                </div>
                <div className="team__content-two">
                  <h4 className="name">{instructor.name}</h4>
                  <span className="designation">{instructor.position || "อาจารย์"}</span>
                  
                  {instructor.bio && (
                    <p className="bio">{instructor.bio.length > 120 ? `${instructor.bio.substring(0, 120)}...` : instructor.bio}</p>
                  )}
                  
                  <div className="team__social-two">
                    <ul className="list-wrap">
                      <li><Link to="#"><i className="fab fa-facebook-f"></i></Link></li>
                      <li><Link to="#"><i className="fab fa-twitter"></i></Link></li>
                      <li><Link to="#"><i className="fab fa-linkedin-in"></i></Link></li>
                      <li><Link to="#"><i className="fab fa-youtube"></i></Link></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          ยังไม่มีข้อมูลอาจารย์ผู้สอนในรายวิชานี้
        </div>
      )}
    </div>
  );
};

export default Instructors;
