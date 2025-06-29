import { useEffect, useState } from "react";
import axios from "axios";
import FooterOne from "../../../layouts/footers/FooterOne";
import HeaderOne from "../../../layouts/headers/HeaderOne";
import BreadcrumbTwo from "../../common/breadcrumb/BreadcrumbTwo";
import CourseDetailsArea from "./CourseDetailsArea";
import EnrolledCourseDetailsArea from "./EnrolledCourseDetailsArea";

// Interface สำหรับอาจารย์
interface Instructor {
  instructor_id: number;
  instructor_name: string;
  instructor_image_file_id?: string | null; // ยังคง field นี้ไว้
  instructor_image_path?: string;
  avatar_file_id?: string | null; // เพิ่ม field นี้เพื่อให้สอดคล้องกับ Instructors.tsx
}

// Interface สำหรับ Props ของ CourseDetails
interface CourseDetailsProps {
  single_course: {
    id: number;
    title: string;
    category: string;
    department: string;
    description: string;
    thumb: string;
    videoUrl?: string;
    subjects: any[];
    subjectCount: number;
    totalLessons: number;
    totalQuizzes: number;
    instructors: Instructor[]; // ใช้ Interface Instructor ที่กำหนดไว้
    isLoading: boolean;
    onStartLearning?: () => void;
    error: string | null;
  };
}

// Interface สำหรับ Notification State
interface Notification {
  message: string;
  type: "success" | "error";
  show: boolean;
}

const CourseDetails = ({ single_course }: CourseDetailsProps) => {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<any>(null);
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(true);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [showEnrollPopup, setShowEnrollPopup] = useState(false);
  const [notification, setNotification] = useState<Notification>({
    message: "",
    type: "success",
    show: false,
  });

  const apiURL = import.meta.env.VITE_API_URL; // ตรวจสอบว่า VITE_API_URL ถูกตั้งค่าใน .env

  useEffect(() => {
    if (!single_course || !single_course.id) return;

    const checkEnrollment = async () => {
      try {
        setIsCheckingEnrollment(true);
        setEnrollError(null);

        const token = localStorage.getItem("token");

        if (!token) {
          setIsEnrolled(false);
          setIsCheckingEnrollment(false);
          return;
        }

        const response = await fetch(
          `${apiURL}/api/courses/${single_course.id}/progress`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404 || response.status === 401) {
            setIsEnrolled(false);
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } else {
          const data = await response.json();
          if (data.success && data.isEnrolled) {
            setIsEnrolled(true);
            setEnrollmentData(data);
          } else {
            setIsEnrolled(false);
          }
        }
      } catch (error: any) {
        console.error("Error checking enrollment:", error);
        setEnrollError("เกิดข้อผิดพลาดในการตรวจสอบสถานะการลงทะเบียน");
      } finally {
        setIsCheckingEnrollment(false);
      }
    };

    checkEnrollment();
  }, [single_course?.id, apiURL]);

  const handleEnrollClick = () => {
    setShowEnrollPopup(true);
  };

  const confirmEnrollment = async () => {
    setShowEnrollPopup(false); // ปิด Popup ยืนยันการลงทะเบียน
    setEnrollError(null); // เคลียร์ข้อความ Error เก่า
    setNotification({ ...notification, show: false }); // ซ่อน Notification เก่า

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Redirect ไปหน้า Login ถ้าไม่มี token
        window.location.href = `/login?redirect=${encodeURIComponent(
          window.location.pathname
        )}`;
        return;
      }

      const response = await axios.post(
        `${apiURL}/api/courses/${single_course.id}/enroll`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setIsEnrolled(true);
        // ดึงข้อมูล progress ล่าสุดหลังลงทะเบียนสำเร็จ
        const progressResponse = await axios.get(
          `${apiURL}/api/courses/${single_course.id}/progress`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (progressResponse.data.success) {
          setEnrollmentData(progressResponse.data);
        }

        // แสดงแจ้งเตือนสำเร็จ
        setNotification({
          message: "ลงทะเบียนหลักสูตรสำเร็จ!",
          type: "success",
          show: true,
        });
        setTimeout(() => {
          setNotification({ ...notification, show: false });
        }, 3000); // ซ่อนแจ้งเตือนใน 3 วินาที
      } else {
        const errorMessage =
          response.data.message || "เกิดข้อผิดพลาดในการลงทะเบียนหลักสูตร";
        setEnrollError(errorMessage);
        // แสดงแจ้งเตือนผิดพลาด
        setNotification({
          message: errorMessage,
          type: "error",
          show: true,
        });
        setTimeout(() => {
          setNotification({ ...notification, show: false });
        }, 5000); // ซ่อนแจ้งเตือนใน 5 วินาที
      }
    } catch (error: any) {
      console.error("Error enrolling in course:", error);
      const errorMessage =
        (error.response && error.response.data && error.response.data.message) ||
        "เกิดข้อผิดพลาดในการลงทะเบียนหลักสูตร กรุณาลองใหม่อีกครั้ง";
      setEnrollError(errorMessage);
      // แสดงแจ้งเตือนผิดพลาด
      setNotification({
        message: errorMessage,
        type: "error",
        show: true,
      });
      setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 5000); // ซ่อนแจ้งเตือนใน 5 วินาที
    }
  };

  const cancelEnrollment = () => {
    setShowEnrollPopup(false);
  };

  // Helper function to get instructor image URL
  const getInstructorImageUrl = (instructor: Instructor) => {
    // ใช้ avatar_file_id ก่อนตามโครงสร้างที่พบใน Instructors.tsx
    if (instructor.avatar_file_id) {
      return `${apiURL}/api/accounts/instructors/avatar/${instructor.avatar_file_id}`;
    }
    // หากไม่มี avatar_file_id ให้ลองใช้ instructor_image_file_id
    if (instructor.instructor_image_file_id) {
      return `${apiURL}/api/courses/image/${instructor.instructor_image_file_id}`;
    }
    // Fallback image if no fileId
    return "/assets/img/icon/instructor-default.png";
  };

  // Handle image error for instructor avatar in popup
  const handleInstructorImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/assets/img/icon/instructor-default.png";
  };

  return (
    <>
      <HeaderOne />
      <main className="main-area fix">
        <BreadcrumbTwo title={single_course.title} sub_title="หลักสูตร" />

        {single_course.isLoading || isCheckingEnrollment ? (
          <div className="container py-5 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">กำลังโหลด...</span>
            </div>
            <p className="mt-3">กำลังโหลดข้อมูล...</p>
          </div>
        ) : single_course.error ? (
          <div className="container py-5">
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {single_course.error}
            </div>
          </div>
        ) : isEnrolled ? (
          <EnrolledCourseDetailsArea
            single_course={single_course}
            enrollmentData={enrollmentData}
            onStartLearning={single_course.onStartLearning}
          />
        ) : (
          <>
            <CourseDetailsArea
              single_course={single_course}
              onEnroll={handleEnrollClick}
            />
          </>
        )}

        {/* --- Popup ยืนยันการลงทะเบียน --- */}
        {showEnrollPopup && (
          <div
            className="enroll-popup-overlay" // Add a class for overlay
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.6)", // Darker, more prominent overlay
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
              pointerEvents: "auto",
              backdropFilter: "blur(4px)", // Subtle blur effect
            }}
          >
            <div
              className="enroll-popup-content" // Add a class for content
              style={{
                backgroundColor: "white",
                padding: "40px", // Increased padding
                borderRadius: "12px", // More rounded corners
                maxWidth: "700px", // Adjusted max-width for better flow
                width: "90%",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)", // Stronger, modern shadow
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                maxHeight: "90vh",
                overflowY: "auto",
                animation: "zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards", // Pop-in animation
              }}
            >
              <h3
                style={{
                  marginBottom: "25px",
                  color: "#2c3e50", // Darker heading color
                  fontSize: "28px", // Larger font size
                  fontWeight: "700",
                }}
              >
                ยืนยันการลงทะเบียนหลักสูตร
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "40px", // Increased gap
                  width: "100%",
                  marginBottom: "30px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {/* ข้อมูลหลักสูตรด้านซ้าย */}
                <div style={{ flex: 1, minWidth: "280px", textAlign: "center" }}>
                  <img
                    src={single_course.thumb}
                    alt={single_course.title}
                    style={{
                      width: "100%",
                      maxHeight: "220px", // Slightly increased height
                      objectFit: "cover",
                      borderRadius: "10px", // More rounded image
                      marginBottom: "20px", // Increased margin
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)", // Shadow for image
                    }}
                  />
                  <h4
                    style={{
                      color: "#007bff",
                      marginBottom: "15px",
                      fontSize: "24px", // Larger course title
                      fontWeight: "600",
                    }}
                  >
                    {single_course.title}
                  </h4>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", // Adjusted minmax for better responsiveness
                      gap: "15px", // Increased gap
                      marginTop: "20px",
                    }}
                  >
                    {/* ภาควิชา */}
                    <div
                      style={{
                        backgroundColor: "#e3f2fd", // Light Blue
                        padding: "15px", // Increased padding
                        borderRadius: "10px", // More rounded corners
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)", // More defined shadow
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        borderBottom: "4px solid #2196f3", // Thicker border
                      }}
                    >
                      <i
                        className="fas fa-building fa-lg"
                        style={{ color: "#2196f3", marginBottom: "8px" }} // Increased margin
                      ></i>
                      <p style={{ margin: 0, fontSize: "13px", color: "#555" }}>
                        ภาควิชา
                      </p>
                      <span
                        style={{
                          fontWeight: "bold",
                          color: "#333",
                          fontSize: "14px", // Slightly larger font
                        }}
                      >
                        {single_course.department || "N/A"}
                      </span>
                    </div>

                    {/* จำนวนวิชา */}
                    <div
                      style={{
                        backgroundColor: "#e8f5e9", // Light Green
                        padding: "15px",
                        borderRadius: "10px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        borderBottom: "4px solid #4caf50",
                      }}
                    >
                      <i
                        className="fas fa-book-open fa-lg"
                        style={{ color: "#4caf50", marginBottom: "8px" }}
                      ></i>
                      <p style={{ margin: 0, fontSize: "13px", color: "#555" }}>
                        จำนวนวิชา
                      </p>
                      <span
                        style={{
                          fontWeight: "bold",
                          color: "#333",
                          fontSize: "14px",
                        }}
                      >
                        {single_course.subjectCount || 0}
                      </span>
                    </div>

                    {/* บทเรียนทั้งหมด */}
                    <div
                      style={{
                        backgroundColor: "#fff3e0", // Light Orange
                        padding: "15px",
                        borderRadius: "10px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        borderBottom: "4px solid #ff9800",
                      }}
                    >
                      <i
                        className="fas fa-chalkboard fa-lg"
                        style={{ color: "#ff9800", marginBottom: "8px" }}
                      ></i>
                      <p style={{ margin: 0, fontSize: "13px", color: "#555" }}>
                        บทเรียนทั้งหมด
                      </p>
                      <span
                        style={{
                          fontWeight: "bold",
                          color: "#333",
                          fontSize: "14px",
                        }}
                      >
                        {single_course.totalLessons || 0}
                      </span>
                    </div>

                    {/* แบบทดสอบทั้งหมด */}
                    <div
                      style={{
                        backgroundColor: "#fbe9e7", // Light Red (for quizzes)
                        padding: "15px",
                        borderRadius: "10px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        borderBottom: "4px solid #f44336",
                      }}
                    >
                      <i
                        className="fas fa-pencil-alt fa-lg"
                        style={{ color: "#f44336", marginBottom: "8px" }}
                      ></i>
                      <p style={{ margin: 0, fontSize: "13px", color: "#555" }}>
                        แบบทดสอบทั้งหมด
                      </p>
                      <span
                        style={{
                          fontWeight: "bold",
                          color: "#333",
                          fontSize: "14px",
                        }}
                      >
                        {single_course.totalQuizzes || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* รายละเอียดเพิ่มเติมและอาจารย์ด้านขวา */}
                <div style={{ flex: 2, minWidth: "350px" }}>
                  <h5
                    style={{
                      color: "#2c3e50",
                      marginBottom: "15px",
                      fontSize: "20px",
                      fontWeight: "600",
                    }}
                  >
                    คำอธิบายหลักสูตร:
                  </h5>
                  <p
                    style={{
                      color: "#666",
                      lineHeight: "1.7",
                      maxHeight: "150px", // Increased height
                      overflowY: "auto",
                      fontSize: "15px",
                      backgroundColor: "#f8f9fa", // Light background for description
                      padding: "15px",
                      borderRadius: "8px",
                      border: "1px solid #eee",
                    }}
                  >
                    {single_course.description}
                  </p>

                  {/* ส่วนแสดงอาจารย์ */}
                  {single_course.instructors && single_course.instructors.length > 0 && (
                    <div style={{ marginTop: "25px" }}>
                      <h5
                        style={{
                          color: "#2c3e50",
                          marginBottom: "15px",
                          fontSize: "20px",
                          fontWeight: "600",
                        }}
                      >
                        ผู้สอนในหลักสูตร:
                      </h5>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "20px", // Increased gap
                          justifyContent: "flex-start",
                        }}
                      >
                        {single_course.instructors.map((instructor) => (
                          <div
                            key={instructor.instructor_id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              border: "1px solid #ddd", // Subtle border
                              borderRadius: "25px", // Pill shape
                              padding: "8px 20px",
                              backgroundColor: "#f0f4f7", // Light grey background
                              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
                              transition: "transform 0.2s ease",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.transform = "translateY(-3px)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.transform = "translateY(0)")
                            }
                          >
                            <img
                              src={getInstructorImageUrl(instructor)} // ส่ง object instructor เข้าไปทั้งก้อน
                              alt={instructor.instructor_name}
                              onError={handleInstructorImageError}
                              style={{
                                width: "35px", // Slightly smaller image
                                height: "35px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                marginRight: "12px", // Increased margin
                                border: "2px solid #007bff", // Accent border
                              }}
                            />
                            <span
                              style={{
                                color: "#444",
                                fontSize: "15px",
                                fontWeight: "600", // Bolder font
                              }}
                            >
                              {instructor.instructor_name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ปุ่มยืนยันและยกเลิก */}
              <div
                style={{
                  marginTop: "30px",
                  display: "flex",
                  gap: "20px", // More space between buttons
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <button
                  onClick={confirmEnrollment}
                  className="modern-button confirm" // Add custom class
                  style={{
                    backgroundColor: "#28a745", // Green for confirm
                    color: "white",
                    border: "none",
                    padding: "14px 30px", // Larger padding
                    borderRadius: "8px", // More rounded
                    cursor: "pointer",
                    fontSize: "17px", // Larger font
                    fontWeight: "700", // Bolder
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 10px rgba(40, 167, 69, 0.2)", // Subtle shadow
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#218838";
                    e.currentTarget.style.boxShadow = "0 6px 15px rgba(40, 167, 69, 0.3)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#28a745";
                    e.currentTarget.style.boxShadow = "0 4px 10px rgba(40, 167, 69, 0.2)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <i className="fas fa-check-circle me-2"></i> ยืนยันการลงทะเบียน
                </button>
                <button
                  onClick={cancelEnrollment}
                  className="modern-button cancel" // Add custom class
                  style={{
                    backgroundColor: "#dc3545", // Red for cancel
                    color: "white",
                    border: "none",
                    padding: "14px 30px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "17px",
                    fontWeight: "700",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 10px rgba(220, 53, 69, 0.2)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#c82333";
                    e.currentTarget.style.boxShadow = "0 6px 15px rgba(220, 53, 69, 0.3)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#dc3545";
                    e.currentTarget.style.boxShadow = "0 4px 10px rgba(220, 53, 69, 0.2)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <i className="fas fa-times-circle me-2"></i> ยกเลิก
                </button>
              </div>

              {/* แสดง Error Message ใน Popup */}
              {enrollError && (
                <div
                  className="alert alert-danger mt-4" // Increased margin-top
                  style={{
                    width: "100%",
                    textAlign: "center",
                    padding: "15px",
                    borderRadius: "8px",
                    backgroundColor: "#f8d7da",
                    color: "#721c24",
                    border: "1px solid #f5c6cb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    fontSize: "15px",
                  }}
                >
                  <i className="fas fa-exclamation-circle"></i>
                  {enrollError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- Notification Modal/Toast --- */}
        {notification.show && (
          <div
            className={`notification-toast ${notification.type}`} // Add classes for styling
            style={{
              position: "fixed",
              top: "25px", // Slightly lower
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1001,
              backgroundColor:
                notification.type === "success" ? "#d4edda" : "#f8d7da",
              color: notification.type === "success" ? "#155724" : "#721c24",
              padding: "18px 30px", // More padding
              borderRadius: "10px", // More rounded
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)", // Softer shadow
              display: "flex",
              alignItems: "center",
              gap: "12px", // More gap
              animation: "slideInTop 0.5s ease-out forwards, fadeOut 0.5s ease-in 2.5s forwards", // Combined animations
              maxWidth: "90%",
              minWidth: "320px", // Slightly wider min-width
              textAlign: "center",
              justifyContent: "center",
              fontWeight: "600",
              fontSize: "17px", // Larger font size
            }}
          >
            {notification.type === "success" ? (
              <i className="fas fa-check-circle fa-lg"></i>
            ) : (
              <i className="fas fa-times-circle fa-lg"></i>
            )}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification({ ...notification, show: false })}
              style={{
                background: "none",
                border: "none",
                fontSize: "22px", // Larger close button
                cursor: "pointer",
                color: notification.type === "success" ? "#155724" : "#721c24",
                marginLeft: "15px",
                lineHeight: "1", // Align vertically
                opacity: 0.7,
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
            >
              &times;
            </button>
          </div>
        )}

        {/* --- เพิ่ม CSS keyframes สำหรับ animation --- */}
        <style>
          {`
          /* Keyframes for Popup */
          @keyframes zoomIn {
            0% {
              transform: scale(0.8);
              opacity: 0;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }

          /* Keyframes for Notification */
          @keyframes slideInTop {
            0% {
              transform: translate(-50%, -100%);
              opacity: 0;
            }
            100% {
              transform: translate(-50%, 0);
              opacity: 1;
            }
          }

          @keyframes fadeOut {
            0% {
              opacity: 1;
              transform: translate(-50%, 0);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -20px); /* Slightly move up as it fades */
            }
          }
        `}
        </style>
      </main>
      <FooterOne style={false} style_2={true} />
    </>
  );
};

export default CourseDetails;