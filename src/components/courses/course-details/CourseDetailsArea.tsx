import { useState } from "react";
import Overview from "./Overview";
import Sidebar from "./Sidebar";
import Curriculum from "./Curriculum"
import Reviews from "./Reviews"
import Instructors from "./Instructors"
import { Link } from "react-router-dom";

const tab_title: string[] = ["ข้อมูลทั่วไป", "บทเรียน", "ผู้สอน", "ความคิดเห็น"];


const CourseDetailsArea = ({ single_course }: any) => {

  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  return (
    <section className="courses__details-area section-py-120">
      <div className="container">
        <div className="row">
          <div className="col-xl-9 col-lg-8">
            <div className="courses__details-thumb">
              <img src="/assets/img/courses/courses_details.jpg" alt="img" />
            </div>
            <div className="courses__details-content">
              <ul className="courses__item-meta list-wrap">
                <li className="courses__item-tag">
                  <Link to="/courses">{single_course?.category ? single_course.category : "สถิตประยุกต์"}</Link>
                </li>
                <li className="avg-rating"><i className="fas fa-star"></i>{single_course?.rating ? single_course.rating : "(4.5 Reviews)"}</li>
              </ul>
              <h2 className="title">{single_course?.title ? single_course.title : "สถิติประยุกต์"}</h2>
              <div className="courses__details-meta">
                <ul className="list-wrap">
                  <li className="author-two">
                    <img src="/assets/img/courses/course_author02.png" alt="img" />
                    By <Link to="#">{single_course?.instructors ? single_course.instructors : "ดร.ปรมาภรณ์ แสงภารา"}</Link>
                  </li>
                  <li className="date"><i className="flaticon-calendar"></i>24/07/2024</li>
                  <li><i className="flaticon-mortarboard"></i>2,250 นักเรียน</li>
                </ul>
              </div>
              <ul className="nav nav-tabs" id="myTab" role="tablist">
                {tab_title.map((tab, index) => (
                  <li key={index} onClick={() => handleTabClick(index)} className="nav-item" role="presentation">
                    <button className={`nav-link ${activeTab === index ? "active" : ""}`}>{tab}</button>
                  </li>
                ))}
              </ul>
              <div className="tab-content" id="myTabContent">
                <div className={`tab-pane fade ${activeTab === 0 ? 'show active' : ''}`} id="overview-tab-pane" role="tabpanel" aria-labelledby="overview-tab">
                  <Overview />
                </div>
                <div className={`tab-pane fade ${activeTab === 1 ? 'show active' : ''}`} id="overview-tab-pane" role="tabpanel" aria-labelledby="overview-tab">
                  <Curriculum />
                </div>
                <div className={`tab-pane fade ${activeTab === 2 ? 'show active' : ''}`} id="overview-tab-pane" role="tabpanel" aria-labelledby="overview-tab">
                  <Instructors />
                </div>
                <div className={`tab-pane fade ${activeTab === 3 ? 'show active' : ''}`} id="overview-tab-pane" role="tabpanel" aria-labelledby="overview-tab">
                  <Reviews />
                </div>
              </div>
            </div>
          </div>
          <Sidebar />
        </div>
      </div>
    </section>
  )
}

export default CourseDetailsArea
