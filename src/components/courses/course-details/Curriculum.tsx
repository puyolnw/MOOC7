import React, { useState, CSSProperties, useEffect } from "react";
import { Link } from "react-router-dom";

interface Subject {
  subject_id: number;
  subject_code: string;
  subject_name: string;
  credits: number;
  order_number: number;
  instructor_count: number;
  lesson_count: number;
  cover_image?: string;
}

interface CurriculumProps {
  subjects: Subject[];
}

const Curriculum: React.FC<CurriculumProps> = ({ subjects }) => {
  // กำหนดสไตล์ด้วย CSSProperties
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
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      overflow: "hidden",
      transition: "transform 0.3s, box-shadow 0.3s",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#fff",
    },
    cardImage: {
      width: "100%",
      height: "180px",
      objectFit: "cover",
      borderBottom: "1px solid #e0e0e0",
    },
    cardHeader: {
      padding: "1.5rem",
      backgroundColor: "#f8f9fa",
      borderBottom: "1px solid #e0e0e0",
    },
    cardCode: {
      fontSize: "1rem",
      color: "#6c757d",
      marginBottom: "0.5rem",
    },
    cardTitle: {
      fontSize: "1.25rem",
      marginBottom: "0",
      color: "#212529",
    },
    cardBody: {
      padding: "1.5rem",
      flexGrow: 1,
    },
    infoList: {
      listStyle: "none",
      padding: 0,
      margin: 0,
    },
    infoItem: {
      marginBottom: "0.75rem",
      display: "flex",
      alignItems: "center",
    },
    icon: {
      marginRight: "10px",
      color: "#0d6efd",
      width: "16px",
    },
    cardFooter: {
      padding: "1.5rem",
      borderTop: "1px solid #e0e0e0",
    },
    button: {
      display: "inline-block",
      width: "100%",
      padding: "10px 15px",
      backgroundColor: "#0d6efd",
      color: "white",
      textDecoration: "none",
      borderRadius: "4px",
      textAlign: "center",
      transition: "background-color 0.3s",
      border: "none",
      cursor: "pointer",
    },
    buttonIcon: {
      marginLeft: "8px",
    },
    placeholderImage: {
      width: "100%",
      height: "180px",
      backgroundColor: "#f0f0f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#6c757d",
      fontSize: "1rem",
    }
  };

  // ฟังก์ชันสำหรับจัดการเอฟเฟกต์ hover
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredButton, setHoveredButton] = useState<number | null>(null);
  
  // สร้าง state สำหรับเก็บขนาดหน้าจอ
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // ฟังก์ชันสำหรับอัปเดตขนาดหน้าจอ
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // คำนวณสไตล์ column ตามขนาดหน้าจอ
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
        หลักสูตรนี้ประกอบด้วยรายวิชาทั้งหมด {subjects.length} รายวิชา ซึ่งแต่ละรายวิชาจะมีบทเรียนและแบบทดสอบที่ออกแบบมาเพื่อให้ผู้เรียนได้รับความรู้และทักษะอย่างครบถ้วน
      </p>
      
      {subjects.length > 0 ? (
        <div style={styles.row}>
          {subjects.map((subject) => (
            <div 
              key={subject.subject_id} 
              style={getColumnStyle()}
            >
              <div 
                style={{
                  ...styles.card,
                  transform: hoveredCard === subject.subject_id ? 'translateY(-5px)' : 'none',
                  boxShadow: hoveredCard === subject.subject_id ? '0 10px 20px rgba(0, 0, 0, 0.1)' : 'none',
                }}
                onMouseEnter={() => setHoveredCard(subject.subject_id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {subject.cover_image ? (
                  <img 
                    src={subject.cover_image} 
                    alt={subject.subject_name} 
                    style={styles.cardImage}
                  />
                ) : (
                  <div style={styles.placeholderImage}>
                    <i className="fas fa-book-open" style={{ marginRight: "8px" }}></i>
                    {subject.subject_code}
                  </div>
                )}
                
                <div style={styles.cardHeader}>
                  <h4 style={styles.cardCode}>{subject.subject_code}</h4>
                  <h5 style={styles.cardTitle}>{subject.subject_name}</h5>
                </div>
                
                <div style={styles.cardBody}>
                  <ul style={styles.infoList}>
                    <li style={styles.infoItem}>
                      <i className="fas fa-graduation-cap" style={styles.icon}></i>
                      <span>{subject.credits} หน่วยกิต</span>
                    </li>
                    <li style={styles.infoItem}>
                      <i className="fas fa-book" style={styles.icon}></i>
                      <span>{subject.lesson_count} บทเรียน</span>
                    </li>
                    <li style={styles.infoItem}>
                      <i className="fas fa-chalkboard-teacher" style={styles.icon}></i>
                      <span>{subject.instructor_count} ผู้สอน</span>
                    </li>
                  </ul>
                </div>
                
                <div style={styles.cardFooter}>
                  <Link 
                    to={`/subject-details/${subject.subject_id}`} 
                    style={{
                      ...styles.button,
                      backgroundColor: hoveredButton === subject.subject_id ? '#0b5ed7' : '#0d6efd',
                    }}
                    onMouseEnter={() => setHoveredButton(subject.subject_id)}
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    ดูรายละเอียดรายวิชา
                    <i className="fas fa-arrow-right" style={styles.buttonIcon}></i>
                  </Link>
                </div>
              </div>
            </div>
          ))}
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
