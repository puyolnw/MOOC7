import { Link } from "react-router-dom";

interface Instructor {
  instructor_id: number;
  name: string;
  position: string;
  avatar_path?: string | null; 
  avatar_file_id?: string | null; 
  bio: string;
  instructor_name?: string;
}

interface InstructorsProps {
  instructors: Instructor[];
}

const Instructors = ({ instructors }: InstructorsProps) => {
  const apiURL = import.meta.env.VITE_API_URL;

  const getAvatarUrl = (instructor: Instructor) => {
    if (instructor.avatar_file_id) {
      return `${apiURL}/api/courses/image/${instructor.avatar_file_id}`;
    } else if (instructor.avatar_path) {
      return instructor.avatar_path;
    } else {
      return "/assets/img/icon/instructor-default.png";
    }
  };

  return (
    <div className="courses__instructors-wrap">
      <h3 className="title mb-4">อาจารย์ผู้สอนประจำรายวิชา</h3>
      
      {instructors.length > 0 ? (
        <div className="row">
          {instructors.map(instructor => (
            <div key={instructor.instructor_id} className="col-lg-6 col-md-6 mb-4">
              <div className="instructor-card border rounded p-4 h-100" style={{
                backgroundColor: '#fff',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease-in-out'
              }}>
                <div className="d-flex align-items-center mb-3">
                  <div className="instructor-avatar me-3" style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    <img 
                      src={getAvatarUrl(instructor)}
                      alt={instructor.instructor_name || instructor.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/img/icon/instructor-default.png";
                      }}
                    />
                  </div>
                  <div className="instructor-info flex-grow-1">
                    <h4 className="instructor-name mb-1" style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: '#333',
                      margin: 0
                    }}>
                      {instructor.instructor_name || instructor.name}
                    </h4>
                    <p className="instructor-position mb-0" style={{
                      fontSize: '0.9rem',
                      color: '#666',
                      margin: 0
                    }}>
                      {instructor.position || "อาจารย์"}
                    </p>
                  </div>
                </div>
                
                {instructor.bio && (
                  <div className="instructor-bio mb-3">
                    <p style={{
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      color: '#555',
                      margin: 0
                    }}>
                      {instructor.bio.length > 150 ? `${instructor.bio.substring(0, 150)}...` : instructor.bio}
                    </p>
                  </div>
                )}
                
                <div className="instructor-social">
                  <div className="d-flex gap-2">
                    <Link to="#" className="social-link" style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      backgroundColor: '#f8f9fa',
                      color: '#666',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease'
                    }}>
                      <i className="fab fa-facebook-f"></i>
                    </Link>
                    <Link to="#" className="social-link" style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      backgroundColor: '#f8f9fa',
                      color: '#666',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease'
                    }}>
                      <i className="fab fa-twitter"></i>
                    </Link>
                    <Link to="#" className="social-link" style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      backgroundColor: '#f8f9fa',
                      color: '#666',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease'
                    }}>
                      <i className="fab fa-linkedin-in"></i>
                    </Link>
                    <Link to="#" className="social-link" style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      backgroundColor: '#f8f9fa',
                      color: '#666',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease'
                    }}>
                      <i className="fab fa-youtube"></i>
                    </Link>
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
