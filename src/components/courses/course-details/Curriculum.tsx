import React, { useState, CSSProperties, useEffect } from "react";
import { Link } from "react-router-dom";

interface Prerequisite {
  prerequisite_id: number;
  prerequisite_name: string;
  prerequisite_code: string;
}

interface Subject {
  subject_id: number;
  subject_code: string;
  subject_name: string;
  credits: number;
  order_number: number;
  instructor_count?: number;
  lesson_count?: number;
  cover_image?: string;
  cover_image_file_id?: number;
  prerequisites?: Prerequisite[];
}

interface CurriculumProps {
  subjects: Subject[];
  courseId: number; // Add this line
}

const Curriculum: React.FC<CurriculumProps> = ({ subjects, courseId }) => {

  const styles: Record<string, CSSProperties> = {
    row: {
      display: "flex",
      flexWrap: "wrap",
      margin: "0 -15px",
    },
    col: {
      flex: "0 0 33.333333%",
      maxWidth: "33.333333%",
      padding: "0 15px",
      boxSizing: "border-box",
      marginBottom: "30px",
    },
    card: {
      border: "none",
      borderRadius: "16px",
      overflow: "hidden",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#fff",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      position: "relative",
    },
    cardImage: {
      width: "100%",
      height: "200px",
      objectFit: "cover",
      borderBottom: "none",
      transition: "transform 0.4s ease",
    },
    cardHeader: {
      padding: "1.5rem",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      position: "relative",
      overflow: "hidden",
    },
    cardHeaderOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.1)",
      zIndex: 1,
    },
    cardCode: {
      fontSize: "0.875rem",
      color: "rgba(255, 255, 255, 0.9)",
      marginBottom: "0.5rem",
      fontWeight: "500",
      letterSpacing: "0.5px",
      position: "relative",
      zIndex: 2,
    },
    cardTitle: {
      fontSize: "1.25rem",
      marginBottom: "0",
      color: "white",
      fontWeight: "600",
      lineHeight: "1.3",
      position: "relative",
      zIndex: 2,
    },
    cardBody: {
      padding: "1.5rem",
      flexGrow: 1,
      backgroundColor: "#fafbfc",
    },
    infoList: {
      listStyle: "none",
      padding: 0,
      margin: 0,
    },
    infoItem: {
      marginBottom: "1rem",
      display: "flex",
      alignItems: "center",
      padding: "0.75rem",
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    },
    infoItemHover: {
      transform: "translateX(5px)",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
    },
    icon: {
      marginRight: "12px",
      color: "#667eea",
      width: "18px",
      fontSize: "1.1rem",
    },
    cardFooter: {
      padding: "1.5rem",
      borderTop: "1px solid #e9ecef",
      backgroundColor: "white",
    },
    button: {
      display: "inline-block",
      width: "100%",
      padding: "12px 20px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      textDecoration: "none",
      borderRadius: "8px",
      textAlign: "center",
      transition: "all 0.3s ease",
      border: "none",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "0.95rem",
      position: "relative",
      overflow: "hidden",
    },
    buttonHover: {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
    },
    buttonIcon: {
      marginLeft: "8px",
      transition: "transform 0.3s ease",
    },
    placeholderImage: {
      width: "100%",
      height: "200px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "1.1rem",
      fontWeight: "500",
    },
    prerequisitesBadge: {
      display: "inline-block",
      padding: "0.4rem 0.8rem",
      fontSize: "0.8rem",
      fontWeight: "600",
      lineHeight: "1",
      textAlign: "center",
      whiteSpace: "nowrap",
      verticalAlign: "baseline",
      borderRadius: "20px",
      color: "white",
      background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
      marginRight: "0.5rem",
      marginBottom: "0.5rem",
      boxShadow: "0 2px 4px rgba(255, 107, 107, 0.3)",
    },
    prerequisitesContainer: {
      marginTop: "1.5rem",
      borderTop: "2px dashed #e9ecef",
      paddingTop: "1.5rem",
    },
    prerequisitesTitle: {
      fontSize: "0.9rem",
      fontWeight: "600",
      marginBottom: "0.75rem",
      color: "#495057",
      display: "flex",
      alignItems: "center",
    },
    prerequisitesList: {
      display: "flex",
      flexWrap: "wrap",
      margin: "0",
      padding: "0",
    },
    orderBadge: {
      position: "absolute",
      top: "15px",
      right: "15px",
      background: "rgba(255, 255, 255, 0.9)",
      color: "#667eea",
      borderRadius: "50%",
      width: "40px",
      height: "40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      fontSize: "1.1rem",
      zIndex: 3,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    },
  };

  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredButton, setHoveredButton] = useState<number | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [windowWidth]);

  const getColumnStyle = (): CSSProperties => {
    if (windowWidth <= 768) {
      return {
        flex: "0 0 100%",
        maxWidth: "100%",
        padding: "0 15px",
        boxSizing: "border-box",
        marginBottom: "30px",
      };
    } else if (windowWidth <= 992) {
      return {
        flex: "0 0 50%",
        maxWidth: "50%",
        padding: "0 15px",
        boxSizing: "border-box",
        marginBottom: "30px",
      };
    } else {
      return styles.col;
    }
  };

  return (
    <div className="courses__curriculum-wrap">
      <h3 className="title">รายวิชาในหลักสูตร</h3>
      <p>
        หลักสูตรนี้ประกอบด้วยรายวิชาทั้งหมด {subjects.length} รายวิชา
        ซึ่งแต่ละรายวิชาจะมีบทเรียนและแบบทดสอบที่ออกแบบมาเพื่อให้ผู้เรียนได้รับความรู้และทักษะอย่างครบถ้วน
      </p>

      {subjects.length > 0 ? (
        <div style={styles.row}>
          {subjects.map((subject) => {
            return (
              <div key={subject.subject_id} style={getColumnStyle()}>
                <div
                  style={{
                    ...styles.card,
                    transform: hoveredCard === subject.subject_id ? "translateY(-8px)" : "none",
                    boxShadow: hoveredCard === subject.subject_id ? "0 20px 40px rgba(0, 0, 0, 0.15)" : "none",
                  }}
                  onMouseEnter={() => setHoveredCard(subject.subject_id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Order Badge */}
                  <div style={styles.orderBadge}>
                    {subject.order_number || 1}
                  </div>

                  {subject.cover_image ? (
                    <img
                      src={
                        subject.cover_image && subject.cover_image_file_id
                          ? `${apiURL}/api/courses/subjects/image/${subject.cover_image_file_id}`
                          : "/assets/img/courses/course_thumb01.jpg"
                      }
                      alt={subject.subject_name || "รายวิชา"}
                      style={{
                        ...styles.cardImage,
                        transform: hoveredCard === subject.subject_id ? "scale(1.05)" : "scale(1)",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/img/courses/course_thumb01.jpg";
                      }}
                    />
                  ) : (
                    <div style={styles.placeholderImage}>
                      <i className="fas fa-book-open" style={{ marginRight: "8px" }}></i>
                      {subject.subject_code || "ไม่มีรหัสวิชา"}
                    </div>
                  )}

                  <div style={styles.cardHeader}>
                    <div style={styles.cardHeaderOverlay}></div>
                    <h4 style={styles.cardCode}>{subject.subject_code || "ไม่มีรหัสวิชา"}</h4>
                    <h5 style={styles.cardTitle}>{subject.subject_name || "ไม่มีชื่อวิชา"}</h5>
                  </div>

                  <div style={styles.cardBody}>
                    <ul style={styles.infoList}>
                      <li 
                        style={{
                          ...styles.infoItem,
                          ...(hoveredCard === subject.subject_id ? styles.infoItemHover : {})
                        }}
                      >
                        <i className="fas fa-graduation-cap" style={styles.icon}></i>
                        <span>{subject.credits ?? 0} หน่วยกิต</span>
                      </li>
                      <li 
                        style={{
                          ...styles.infoItem,
                          ...(hoveredCard === subject.subject_id ? styles.infoItemHover : {})
                        }}
                      >
                        <i className="fas fa-book" style={styles.icon}></i>
                        <span>{subject.lesson_count ?? 0} บทเรียน</span>
                      </li>
                      <li 
                        style={{
                          ...styles.infoItem,
                          ...(hoveredCard === subject.subject_id ? styles.infoItemHover : {})
                        }}
                      >
                        <i className="fas fa-chalkboard-teacher" style={styles.icon}></i>
                        <span>{subject.instructor_count ?? 0} ผู้สอน</span>
                      </li>
                    </ul>

                    {subject.prerequisites && subject.prerequisites.length > 0 ? (
                      <div style={styles.prerequisitesContainer}>
                        <h6 style={styles.prerequisitesTitle}>
                          <i className="fas fa-project-diagram" style={{ marginRight: "8px" }}></i>
                          วิชาที่ต้องเรียนก่อน:
                        </h6>
                        <div style={styles.prerequisitesList}>
                          {subject.prerequisites.map((prereq) => (
                            <span
                              key={prereq.prerequisite_id}
                              style={styles.prerequisitesBadge}
                              title={prereq.prerequisite_name || ""}
                            >
                              {prereq.prerequisite_code || "ไม่มีรหัส"}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div style={styles.cardFooter}>
                    <Link
                      to={`/subject-details/${courseId}/${subject.subject_id}`}
                      style={{
                        ...styles.button,
                        ...(hoveredButton === subject.subject_id ? styles.buttonHover : {}),
                      }}
                      onMouseEnter={() => setHoveredButton(subject.subject_id)}
                      onMouseLeave={() => setHoveredButton(null)}
                    >
                      ดูรายละเอียดรายวิชา
                      <i 
                        className="fas fa-arrow-right" 
                        style={{
                          ...styles.buttonIcon,
                          transform: hoveredButton === subject.subject_id ? "translateX(5px)" : "translateX(0)",
                        }}
                      ></i>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="alert alert-info">
          <i className="fas fa-info-circle" style={{ marginRight: "8px" }}></i>
          ยังไม่มีรายวิชาในหลักสูตรนี้
        </div>
      )}
    </div>
  );
};

export default Curriculum;