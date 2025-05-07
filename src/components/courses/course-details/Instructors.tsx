import { Link } from "react-router-dom";
import styles from "./Instructors.module.css";
import { useState } from "react";

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
  const [activeTab, setActiveTab] = useState<string>("instructors");
  
  // Separate instructors into groups (dummy logic for now, replace with real data handling later)
  const courseSupervisors: Instructor[] = []; // No data for now
  const courseCommittee: Instructor[] = []; // No data for now
  const courseInstructors = instructors; // Use all instructors as course instructors

  const getAvatarUrl = (instructor: Instructor) => {
    if (instructor.avatar_file_id) {
      return `${apiURL}/api/accounts/instructors/avatar/${instructor.avatar_file_id}`;
    }
    return "/assets/img/courses/course_thumb01.jpg";
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/assets/img/courses/course_thumb01.jpg";
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className={styles["section-header"]}>
        <div className={styles["section-icon"]}>
          <i className="fas fa-chalkboard-teacher"></i>
        </div>
        <h2 className={styles["section-title"]}>รายละเอียดทีมอาจารย์</h2>
      </div>

      {/* Tabs Navigation */}
      <div className={styles["tabs-container"]}>
        <button
          className={`${styles["tab-button"]} ${
            activeTab === "instructors" ? styles["tab-button-active"] : ""
          }`}
          onClick={() => setActiveTab("instructors")}
        >
          ผู้สอนประจำรายวิชา
        </button>
        <button
          className={`${styles["tab-button"]} ${
            activeTab === "supervisors" ? styles["tab-button-active"] : ""
          }`}
          onClick={() => setActiveTab("supervisors")}
        >
          อาจารย์ผู้ดูแลหลักสูตร
        </button>
        <button
          className={`${styles["tab-button"]} ${
            activeTab === "committee" ? styles["tab-button-active"] : ""
          }`}
          onClick={() => setActiveTab("committee")}
        >
          กรรมการหลักสูตร
        </button>
      </div>

      {/* Course Instructors Section */}
      {activeTab === "instructors" && (
        <div>
          {courseInstructors && courseInstructors.length > 0 ? (
            <div className={styles["instructors-grid"]}>
              {courseInstructors.map((instructor) => (
                <div
                  key={instructor.instructor_id}
                  className={styles["instructor-card"]}
                >
                  <div className="relative">
                    <img
                      src={getAvatarUrl(instructor)}
                      alt={instructor.name}
                      className={styles["instructor-image"]}
                      onError={handleImageError}
                    />
                    <div className={styles["verified-badge"]}>
                      <i className="fas fa-check text-white text-xs"></i>
                    </div>
                  </div>

                  <p className={styles["instructor-position"]}>{instructor.position}</p>
                  <h4 className={styles["instructor-name"]}>{instructor.name}</h4>

                  <p className={styles["instructor-bio"]}>
                    {instructor.bio || "ไม่มีข้อมูลประวัติผู้สอน"}
                  </p>

                  <div className={styles["social-links"]}>
                    {[
                      { icon: "facebook-f", color: "hover:bg-blue-600" },
                      { icon: "twitter", color: "hover:bg-sky-500" },
                      { icon: "linkedin-in", color: "hover:bg-blue-700" },
                      { icon: "instagram", color: "hover:bg-pink-600" },
                    ].map((social, index) => (
                      <Link
                        key={index}
                        to="#"
                        className={`${styles["social-link"]} ${social.color} hover:text-white`}
                        aria-label={`${social.icon} link`}
                      >
                        <i className={`fab fa-${social.icon}`}></i>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles["empty-state"]}>
              <i className="fas fa-info-circle text-2xl mb-2"></i>
              <p>ยังไม่มีข้อมูลผู้สอนในหลักสูตรนี้</p>
            </div>
          )}
        </div>
      )}

      {/* Course Supervisors Section */}
      {activeTab === "supervisors" && (
        <div>
          {courseSupervisors.length > 0 ? (
            <div className={styles["instructors-grid"]}>
              {courseSupervisors.map((supervisor) => (
                <div
                  key={supervisor.instructor_id}
                  className={styles["instructor-card"]}
                >
                  <div className="relative">
                    <img
                      src={getAvatarUrl(supervisor)}
                      alt={supervisor.name}
                      className={styles["instructor-image"]}
                      onError={handleImageError}
                    />
                    <div className={styles["verified-badge"]}>
                      <i className="fas fa-check text-white text-xs"></i>
                    </div>
                  </div>
                  <p className={styles["instructor-position"]}>{supervisor.position}</p>
                  <h4 className={styles["instructor-name"]}>{supervisor.name}</h4>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles["empty-state"]}>
              <i className="fas fa-user-tie text-2xl mb-2"></i>
              <p>ยังไม่มีข้อมูลอาจารย์ผู้ดูแลหลักสูตร</p>
            </div>
          )}
        </div>
      )}

      {/* Course Committee Section */}
      {activeTab === "committee" && (
        <div>
          {courseCommittee.length > 0 ? (
            <div className={styles["instructors-grid"]}>
              {courseCommittee.map((committee) => (
                <div
                  key={committee.instructor_id}
                  className={styles["instructor-card"]}
                >
                  <div className="relative">
                    <img
                      src={getAvatarUrl(committee)}
                      alt={committee.name}
                      className={styles["instructor-image"]}
                      onError={handleImageError}
                    />
                    <div className={styles["verified-badge"]}>
                      <i className="fas fa-check text-white text-xs"></i>
                    </div>
                  </div>
                  <p className={styles["instructor-position"]}>{committee.position}</p>
                  <h4 className={styles["instructor-name"]}>{committee.name}</h4>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles["empty-state"]}>
              <i className="fas fa-users-cog text-2xl mb-2"></i>
              <p>ยังไม่มีข้อมูลกรรมการหลักสูตร</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Instructors;
