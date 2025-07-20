import { Link } from "react-router-dom";
import styles from "./Instructors.module.css";

interface Instructor {
  instructor_id: number;
  name: string;
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
  const getAvatarUrl = (instructor: Instructor) => {
    if (instructor.avatar_file_id) {
      return `${apiURL}/api/accounts/instructors/avatar/${instructor.avatar_file_id}`;
    }
    return "/assets/img/courses/default-instructor.jpg";
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/assets/img/courses/default-instructor.jpg";
  };

  return (
    <div className={styles["instructors-container"]}>
      <div className={styles["section-header"]}>
        <div className={styles["header-content"]}>
          <div className={styles["section-icon"]}>
            <i className="fas fa-chalkboard-teacher"></i>
          </div>
          <div className={styles["header-text"]}>
            <h2 className={styles["section-title"]}>อาจารย์ประจำรายวิชา</h2>
            <p className={styles["section-subtitle"]}>
              พบกับทีมผู้สอนมืออาชีพที่จะนำพาคุณสู่ความสำเร็จ
            </p>
          </div>
        </div>
        <div className={styles["instructor-count"]}>
          <span className={styles["count-number"]}>{instructors.length}</span>
          <span className={styles["count-label"]}>ท่าน</span>
        </div>
      </div>

      {instructors && instructors.length > 0 ? (
        <div className={styles["instructors-grid"]}>
          {instructors.map((instructor, index) => (
            <div
              key={instructor.instructor_id}
              className={styles["instructor-card"]}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={styles["card-inner"]}>
                {/* Avatar Section */}
                <div className={styles["avatar-section"]}>
                  <div className={styles["avatar-container"]}>
                    <img
                      src={getAvatarUrl(instructor)}
                      alt={instructor.name}
                      className={styles["instructor-avatar"]}
                      onError={handleImageError}
                    />
                    <div className={styles["verified-badge"]}>
                      <i className="fas fa-check"></i>
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className={styles["info-section"]}>
                  <div className={styles["instructor-header"]}>
                    <h3 className={styles["instructor-name"]}>{instructor.name}</h3>
                    <p className={styles["instructor-position"]}>{instructor.position}</p>
                  </div>

                  {instructor.bio && (
                    <div className={styles["bio-section"]}>
                      <p className={styles["instructor-bio"]}>
                        {instructor.bio.length > 120 
                          ? `${instructor.bio.substring(0, 120)}...` 
                          : instructor.bio
                        }
                      </p>
                    </div>
                  )}

                  {/* Social Links */}
                  <div className={styles["social-section"]}>
                    <div className={styles["social-links"]}>
                      {[
                        { icon: "envelope", color: "email", label: "อีเมล" },
                        { icon: "phone", color: "phone", label: "โทรศัพท์" },
                        { icon: "linkedin-in", color: "linkedin", label: "LinkedIn" },
                        { icon: "globe", color: "website", label: "เว็บไซต์" },
                      ].map((social, socialIndex) => (
                        <Link
                          key={socialIndex}
                          to="#"
                          className={`${styles["social-link"]} ${styles[social.color]}`}
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
                <div className={styles["hover-overlay"]}>
                  <div className={styles["overlay-content"]}>
                    <i className="fas fa-user-circle"></i>
                    <span>ดูข้อมูลเพิ่มเติม</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles["empty-state"]}>
          <div className={styles["empty-icon"]}>
            <i className="fas fa-user-slash"></i>
          </div>
          <h3 className={styles["empty-title"]}>ยังไม่มีข้อมูลอาจารย์ประจำรายวิชา</h3>
          <p className={styles["empty-description"]}>
            ข้อมูลอาจารย์ผู้สอนจะแสดงที่นี่เมื่อมีการเพิ่มข้อมูล
          </p>
        </div>
      )}
    </div>
  );
};

export default Instructors;
