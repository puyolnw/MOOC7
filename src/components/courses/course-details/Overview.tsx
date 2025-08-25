import './Overview.css';

interface OverviewProps {
   description: string;
   subjectCount?: number;
   totalLessons?: number;
   totalQuizzes?: number;
   instructors?: any[];
   department?: string;
   category?: string;
 }
 
 const Overview = ({ description, subjectCount = 0, totalLessons = 0, totalQuizzes = 0, instructors = [], department, category }: OverviewProps) => {
    return (
       <div className="courses__overview-wrap">
          <h3 className="title">รายละเอียดหลักสูตร</h3>
          
          {/* ข้อมูลสรุปหลักสูตร */}
          <div className="course-summary mb-4">
            <div className="row">
              {subjectCount > 0 && (
                <div className="col-md-3 col-sm-6 mb-3">
                  <div className="summary-card">
                    <div className="summary-icon">
                      <i className="fas fa-book-open"></i>
                    </div>
                    <div className="summary-content">
                      <h4>{subjectCount}</h4>
                      <p>วิชา</p>
                    </div>
                  </div>
                </div>
              )}
              
              {totalLessons > 0 && (
                <div className="col-md-3 col-sm-6 mb-3">
                  <div className="summary-card">
                    <div className="summary-icon">
                      <i className="fas fa-chalkboard"></i>
                    </div>
                    <div className="summary-content">
                      <h4>{totalLessons}</h4>
                      <p>บทเรียน</p>
                    </div>
                  </div>
                </div>
              )}
              
              {totalQuizzes > 0 && (
                <div className="col-md-3 col-sm-6 mb-3">
                  <div className="summary-card">
                    <div className="summary-icon">
                      <i className="fas fa-pencil-alt"></i>
                    </div>
                    <div className="summary-content">
                      <h4>{totalQuizzes}</h4>
                      <p>แบบทดสอบ</p>
                    </div>
                  </div>
                </div>
              )}
              
              {instructors && instructors.length > 0 && (
                <div className="col-md-3 col-sm-6 mb-3">
                  <div className="summary-card">
                    <div className="summary-icon">
                      <i className="fas fa-chalkboard-teacher"></i>
                    </div>
                    <div className="summary-content">
                      <h4>{instructors.length}</h4>
                      <p>ผู้สอน</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* คำอธิบายหลักสูตร */}
          <div className="course-description">
            <h4 className="subtitle">คำอธิบายหลักสูตร</h4>
            <p>{description || "ไม่มีคำอธิบายหลักสูตร"}</p>
          </div>
          
          {/* ข้อมูลเพิ่มเติม */}
          {(department || category) && (
            <div className="course-details mt-4">
              <h4 className="subtitle">ข้อมูลเพิ่มเติม</h4>
              <div className="row">
                {department && (
                  <div className="col-md-6 mb-3">
                    <div className="detail-item">
                      <i className="fas fa-building"></i>
                      <span><strong>ภาควิชา:</strong> {department}</span>
                    </div>
                  </div>
                )}
                {category && (
                  <div className="col-md-6 mb-3">
                    <div className="detail-item">
                      <i className="fas fa-tag"></i>
                      <span><strong>หมวดหมู่:</strong> {category}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          

       </div>
    );
 };
 
 export default Overview;
 