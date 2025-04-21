import { useState, useEffect } from "react";
import axios from "axios";
import Overview from "./Subject_Overview";
import Sidebar from "./Subject_Sidebar";
import Curriculum from "./Subject_Curriculum";
import Instructors from "./Subject_Instructors";
import { Link } from "react-router-dom";

const tab_title: string[] = ["ภาพรวม", "บทเรียน", "อาจารย์ผู้สอน"];

interface SubjectDetailsAreaProps {
  subject_details: any;
}

const SubjectDetailsArea = ({ subject_details }: SubjectDetailsAreaProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [coverImageUrl, setCoverImageUrl] = useState<string>("/assets/img/courses/courses_details.jpg");
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [imageError, setImageError] = useState<string | null>(null);

  const apiURL = import.meta.env.VITE_API_URL || "http://localhost:3301";

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  // ฟังก์ชันสำหรับดึง cover_image
  const fetchCoverImage = async () => {
    try {
      setIsLoadingImage(true);
      setImageError(null);

      const url = `${apiURL}/api/courses/subjects/${subject_id}`;
      console.log(`Fetching cover image from: ${url}`);

      const token = localStorage.getItem("token");
      const response = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      console.log("API Response for cover image:", response.data);

      if (response.data && response.data.success && response.data.subject) {
        const coverImage = response.data.subject.cover_image;
        console.log("Cover image from API (raw):", coverImage);
        console.log("Cover image length:", coverImage?.length);

        // ตรวจสอบว่า cover_image เป็น base64 string หรือ path
        const detectImageType = (str: string) => {
          if (str.startsWith("iVBORw0KGgo")) {
            return "image/png";
          } else if (str.startsWith("/9j/")) {
            return "image/jpeg";
          } else {
            return null;
          }
        };

        const isBase64 = (str: string) => {
          return str.startsWith("iVBORw0KGgo") || str.startsWith("/9j/");
        };

        if (coverImage && typeof coverImage === "string") {
          if (isBase64(coverImage)) {
            const mimeType = detectImageType(coverImage) || "image/jpeg";
            const imageUrl = `data:${mimeType};base64,${coverImage}`;
            console.log("Processed cover image URL (base64):", imageUrl);
            setCoverImageUrl(imageUrl);
          } else if (coverImage.startsWith("/")) {
            const imageUrl = `${apiURL}${coverImage}`;
            console.log("Processed cover image URL (path):", imageUrl);
            setCoverImageUrl(imageUrl);
          } else {
            console.warn("Cover image format is not recognized:", coverImage);
            setCoverImageUrl("/assets/img/courses/courses_details.jpg");
            setImageError("รูปภาพมีรูปแบบไม่ถูกต้อง");
          }
        } else if (coverImage === null || coverImage === undefined) {
          console.warn("Cover image is missing:", coverImage);
          setCoverImageUrl("/assets/img/courses/courses_details.jpg");
          setImageError("ไม่พบรูปภาพสำหรับรายวิชานี้");
        } else {
          console.warn("Cover image is invalid:", coverImage);
          setCoverImageUrl("/assets/img/courses/courses_details.jpg");
          setImageError("รูปภาพไม่ถูกต้อง");
        }
      } else {
        console.warn("No cover image found in API response:", response.data);
        setCoverImageUrl("/assets/img/courses/courses_details.jpg");
        setImageError("ไม่สามารถโหลดรูปภาพได้");
      }
    } catch (err: any) {
      console.error("Error fetching cover image:", err);
      setImageError("ไม่สามารถโหลดรูปภาพได้");
      setCoverImageUrl("/assets/img/courses/courses_details.jpg");
    } finally {
      setIsLoadingImage(false);
    }
  };

  // ตรวจสอบว่า subject_details มีค่าหรือไม่
  if (!subject_details) {
    return (
      <section className="courses__details-area section-py-120">
        <div className="container">
          <div className="alert alert-warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            ไม่พบข้อมูลรายวิชา
          </div>
        </div>
      </section>
    );
  }

  // ดึงข้อมูลที่จำเป็นจาก subject_details พร้อมกับตรวจสอบว่ามีค่าหรือไม่
  const {
    subject_id,
    subject_code = "รหัสวิชา",
    subject_name = "ชื่อรายวิชา",
    description = "",
    credits = 0,
    department_name = "ไม่ระบุสาขา",
    instructors = [],
    lessons = [],
    preTest,
    postTest,
    quiz_count = 0,
  } = subject_details;

  console.log("Extracted data:", {
    subject_id,
    subject_code,
    subject_name,
    credits,
    department_name,
    instructors_length: instructors.length,
    lessons_length: lessons.length,
    has_preTest: !!preTest,
    has_postTest: !!postTest,
    quiz_count,
  });

  // ดึง cover_image จาก API โดยใช้ subject_id
  useEffect(() => {
    fetchCoverImage();
  }, [apiURL, subject_id]);

  // คำนวณจำนวนแบบทดสอบทั้งหมด (รวมแบบทดสอบก่อนเรียน หลังเรียน และในบทเรียน)
  const totalQuizCount = (preTest ? 1 : 0) + (postTest ? 1 : 0) + (quiz_count || 0);

  // ปรับการจัดการ avatar ของ instructor
  const instructorAvatar = instructors[0]?.avatar
    ? typeof instructors[0].avatar === "string" && instructors[0].avatar.startsWith("data:image/")
      ? instructors[0].avatar
      : `${apiURL}/${instructors[0].avatar}`
    : "/assets/img/courses/course_author001.png";

  return (
    <section className="courses__details-area section-py-120">
      <div className="container">
        <div className="row">
          <div className="col-xl-9 col-lg-8">
            <div className="courses__details-thumb">
              {isLoadingImage ? (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">กำลังโหลดรูปภาพ...</span>
                  </div>
                </div>
              ) : imageError ? (
                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {imageError}
                  <button className="btn btn-link ms-2" onClick={fetchCoverImage}>
                    ลองใหม่
                  </button>
                </div>
              ) : (
                <img
                  src={coverImageUrl}
                  alt={subject_name}
                  onError={(e) => {
                    console.log("Failed to load cover image in SubjectDetailsArea, using default");
                    (e.target as HTMLImageElement).src = "/assets/img/courses/courses_details.jpg";
                  }}
                  loading="lazy"
                />
              )}
            </div>
            <div className="courses__details-content">
              <ul className="courses__item-meta list-wrap">
                <li className="courses__item-tag">
                  <Link to="/subjects">{department_name}</Link>
                </li>
                <li className="credits">
                  <i className="fas fa-graduation-cap me-1"></i>
                  {credits} หน่วยกิต
                </li>
              </ul>
              <h2 className="title">
                {subject_code} - {subject_name}
              </h2>
              <div className="courses__details-meta">
                <ul className="list-wrap">
                  {instructors.length > 0 && (
                    <li className="author-two">
                      <img
                        src={instructorAvatar}
                        alt={instructors[0].name}
                        onError={(e) => {
                          console.log("Failed to load instructor avatar, using default");
                          (e.target as HTMLImageElement).src =
                            "/assets/img/courses/course_author001.png";
                        }}
                        loading="lazy"
                      />
                      โดย <Link to="#">{instructors[0].name}</Link>
                      {instructors.length > 1 && ` และอีก ${instructors.length - 1} ท่าน`}
                    </li>
                  )}
                  <li>
                    <i className="flaticon-book"></i>
                    {lessons.length} บทเรียน
                  </li>
                  <li>
                    <i className="flaticon-quiz"></i>
                    {totalQuizCount} แบบทดสอบ
                  </li>
                </ul>
              </div>
              <ul className="nav nav-tabs" id="myTab" role="tablist">
                {tab_title.map((tab, index) => (
                  <li
                    key={index}
                    onClick={() => handleTabClick(index)}
                    className="nav-item"
                    role="presentation"
                  >
                    <button className={`nav-link ${activeTab === index ? "active" : ""}`}>
                      {tab}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="tab-content" id="myTabContent">
                <div
                  className={`tab-pane fade ${activeTab === 0 ? "show active" : ""}`}
                  id="overview-tab-pane"
                  role="tabpanel"
                  aria-labelledby="overview-tab"
                >
                  <Overview description={description} preTest={preTest} postTest={postTest} />
                </div>
                <div
                  className={`tab-pane fade ${activeTab === 1 ? "show active" : ""}`}
                  id="curriculum-tab-pane"
                  role="tabpanel"
                  aria-labelledby="curriculum-tab"
                >
                  <Curriculum lessons={lessons} />
                </div>
                <div
                  className={`tab-pane fade ${activeTab === 2 ? "show active" : ""}`}
                  id="instructors-tab-pane"
                  role="tabpanel"
                  aria-labelledby="instructors-tab"
                >
                  <Instructors instructors={instructors} />
                </div>
              </div>
            </div>
          </div>
          <Sidebar
            subject_id={subject_id}
            subject_code={subject_code}
            subject_name={subject_name}
            credits={credits}
            lesson_count={lessons.length}
            quiz_count={totalQuizCount}
            cover_image={coverImageUrl}
          />
        </div>
      </div>
    </section>
  );
};

export default SubjectDetailsArea;