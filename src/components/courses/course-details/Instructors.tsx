import { Link } from "react-router-dom";
import "./Instructors.css";

interface Instructor {
  instructor_id: number;
  name: string;
  instructor_name?: string;
  position: string;
  avatar_path?: string | null;
  avatar_file_id?: string | null;
  bio?: string;
}

interface InstructorsProps {
  instructors: Instructor[];
}

const apiURL = import.meta.env.VITE_API_URL;

const Instructors = ({ instructors }: InstructorsProps) => {
      // console.log("🎓 Instructors component received:", instructors);
  
  const getAvatarUrl = (instructor: Instructor) => {
    // ใช้ avatar_file_id ก่อน
    if (instructor.avatar_file_id) {
      return `${apiURL}/api/accounts/instructors/avatar/${instructor.avatar_file_id}`;
    }
    // หากไม่มี avatar_file_id ให้ลองใช้ avatar_path
    if (instructor.avatar_path) {
      return instructor.avatar_path;
    }
    // Fallback image
    return "/assets/img/courses/default-instructor.jpg";
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/assets/img/courses/default-instructor.jpg";
  };

  return (
    <div className="lesson-instructors-container">
      <div className="lesson-instructors-header">
        <div className="lesson-instructors-header-content">
          <div className="lesson-instructors-icon">
            <i className="fas fa-chalkboard-teacher"></i>
          </div>
          <div className="lesson-instructors-text">
            <h2 className="lesson-instructors-title">อาจารย์ประจำรายวิชา</h2>
            <p className="lesson-instructors-subtitle">
              พบกับทีมผู้สอนมืออาชีพที่จะนำพาคุณสู่ความสำเร็จ
            </p>
          </div>
        </div>
        <div className="lesson-instructors-count">
          <span className="lesson-instructors-count-number">{instructors.length}</span>
          <span className="lesson-instructors-count-label">ท่าน</span>
        </div>
      </div>

      {instructors && instructors.length > 0 ? (
        <div className="lesson-instructors-grid">
          {instructors.map((instructor, index) => (
            <div
              key={instructor.instructor_id}
              className="lesson-instructor-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="lesson-instructor-card-inner">
                {/* Avatar Section */}
                <div className="lesson-instructor-avatar-section">
                  <div className="lesson-instructor-avatar-container">
                    <img
                      src={getAvatarUrl(instructor)}
                      alt={instructor.instructor_name || instructor.name}
                      className="lesson-instructor-avatar"
                      onError={handleImageError}
                    />
                    <div className="lesson-instructor-verified-badge">
                      <i className="fas fa-check"></i>
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="lesson-instructor-info-section">
                  <div className="lesson-instructor-header">
                    <h3 className="lesson-instructor-name">{instructor.instructor_name || instructor.name}</h3>
                    <p className="lesson-instructor-position">{instructor.position}</p>
                  </div>

                  {instructor.bio && (
                    <div className="lesson-instructor-bio-section">
                      <p className="lesson-instructor-bio">
                        {instructor.bio.length > 120 
                          ? `${instructor.bio.substring(0, 120)}...` 
                          : instructor.bio
                        }
                      </p>
                    </div>
                  )}

                  {/* Social Links */}
                  <div className="lesson-instructor-social-section">
                    <div className="lesson-instructor-social-links">
                      {[
                        { icon: "envelope", color: "email", label: "อีเมล" },
                        { icon: "phone", color: "phone", label: "โทรศัพท์" },
                        { icon: "linkedin-in", color: "linkedin", label: "LinkedIn" },
                        { icon: "globe", color: "website", label: "เว็บไซต์" },
                      ].map((social, socialIndex) => (
                        <Link
                          key={socialIndex}
                          to="#"
                          className={`lesson-instructor-social-link lesson-instructor-social-${social.color}`}
                          title={social.label}
                          aria-label={`ติดต่อผ่าน ${social.label}`}
                        >
                          <i className={`fas fa-${social.icon}`}></i>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="lesson-instructor-hover-overlay">
                  <div className="lesson-instructor-overlay-content">
                    <i className="fas fa-user-circle"></i>
                    <span>ดูข้อมูลเพิ่มเติม</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="lesson-instructors-empty-state">
          <div className="lesson-instructors-empty-icon">
            <i className="fas fa-user-slash"></i>
          </div>
          <h3 className="lesson-instructors-empty-title">ยังไม่มีข้อมูลอาจารย์ประจำรายวิชา</h3>
          <p className="lesson-instructors-empty-description">
            ข้อมูลอาจารย์ผู้สอนจะแสดงที่นี่เมื่อมีการเพิ่มข้อมูล
          </p>
        </div>
      )}
    </div>
  );
};

export default Instructors;
