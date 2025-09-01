import { useEffect, useState, FC } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import DashboardBannerTwo from "../../dashboard-common/DashboardBannerTwo";
import "./StudentCertificate.css";

// --- Interfaces ---
interface Statistics {
totalCompletedCourses: number;
totalInProgressCourses: number;
totalCompletedSubjects: number;
totalInProgressSubjects: number;
totalCreditsEarned: number;
}

interface CompletedCourse {
courseId: number;
title: string;
description: string;
enrollmentDate: string;
departmentName: string;
totalSubjects: number;
completedSubjects: number;
totalLessons: number;
completedLessons: number;
progressPercentage: number;
status: string;
paymentApproved?: boolean;
hasPaymentSlip?: boolean;
lastPaymentDate?: string;
certificateStatus?: 'ready_to_download' | 'pending_approval' | 'waiting_payment' | 'not_completed';
}

interface CertificateData {
success: boolean;
message?: string;
statistics: Statistics;
enrolledCourses: CompletedCourse[];
}

// --- Utility Functions ---
const getApiClient = () => {
   const token = localStorage.getItem('token');
   if (!token) { throw new Error("ไม่พบข้อมูลการเข้าสู่ระบบ"); }
   const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
   return axios.create({ baseURL: apiURL, headers: { 'Authorization': `Bearer ${token}` } });
};


// --- Child Components ---
const LoadingIndicator: FC = () => (
   <div className="text-center p-5" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem' }}><span className="visually-hidden">Loading...</span></div>
      <p className="mt-3 text-muted">กำลังโหลดข้อมูล...</p>
   </div>
);

const ErrorDisplay: FC<{ message: string }> = ({ message }) => (
   <div className="alert alert-danger"><h4 className="alert-heading">เกิดข้อผิดพลาด!</h4><p className="mb-0">{message}</p></div>
);

const EmptyState: FC = () => (
   <div className="card text-center" style={{ padding: '3rem' }}>
      <div style={{ fontSize: '5rem', color: '#e9ecef', marginBottom: '1.5rem' }}><i className="fas fa-graduation-cap"></i></div>
      <h5 className="text-muted mb-3">คุณยังไม่มีคอร์สที่สามารถดาวน์โหลดใบรับรองได้</h5>
      <p className="text-muted mb-4">เพื่อดาวน์โหลดใบรับรอง คุณต้อง:</p>
      <div className="text-start mb-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
         <div className="d-flex align-items-center mb-2">
            <i className="fas fa-check-circle text-success me-2"></i>
            <span>เรียนคอร์สจนครบ 100%</span>
         </div>
         <div className="d-flex align-items-center mb-2">
            <i className="fas fa-credit-card text-warning me-2"></i>
            <span>ชำระเงินค่าเรียน</span>
         </div>
         <div className="d-flex align-items-center">
            <i className="fas fa-user-check text-info me-2"></i>
            <span>รอการอนุมัติจากผู้ดูแล</span>
         </div>
      </div>
      <Link to="/courses" className="btn btn-primary"><i className="fas fa-search me-2"></i>ค้นหาคอร์สเรียน</Link>
   </div>
);

// --- Main Component ---
const StudentCertificateArea = () => {
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
   const [downloadingId, setDownloadingId] = useState<string | null>(null);

   useEffect(() => {
      const fetchCertificateData = async () => {
            try {
               setLoading(true);
               const apiClient = getApiClient();
               const response = await apiClient.get<any>('/api/data/student/certificates');
               
               console.log("=== API Response ===");
               console.log("Full response:", response.data);
               
               if (response.data.success) {
                  const rawData = response.data;
                  console.log("Raw data from API:", rawData);
                  
                  const toCamelCase = (str: string) => str.replace(/_([a-z])/g, g => g[1].toUpperCase());
                  const transformKeys = (obj: any): any => {
                        if (Array.isArray(obj)) return obj.map(v => transformKeys(v));
                        if (obj !== null && obj.constructor === Object) {
                           return Object.keys(obj).reduce((result, key) => {
                              result[toCamelCase(key)] = transformKeys(obj[key]);
                              return result;
                           }, {} as any);
                        }
                        return obj;
                  };
                  
                  const transformedData = transformKeys(rawData);
                  console.log("Transformed data:", transformedData);
                  
                  // ตรวจสอบข้อมูลคอร์สที่ลงทะเบียน
                  const allCourses = transformedData.enrolledCourses || [];
                  console.log("=== จำนวนคอร์สทั้งหมดที่ลงทะเบียน ===");
                  console.log("Total enrolled courses:", allCourses.length);
                  
                  // ตรวจสอบแต่ละคอร์สและเปอร์เซ็นต์
                  console.log("=== รายละเอียดแต่ละคอร์ส ===");
                  allCourses.forEach((course: any, index: number) => {
                     console.log(`Course ${index + 1}:`);
                     console.log(`  - ID: ${course.courseId}`);
                     console.log(`  - Title: ${course.title}`);
                     console.log(`  - Progress: ${course.progressPercentage}`);
                     console.log(`  - Status: ${course.status}`);
                     console.log(`  - Department: ${course.departmentName}`);
                     console.log("  - Full course object:", course);
                  });
                  
                  // กรองเฉพาะคอร์สที่มีความคืบหน้า 100%
                  const completedCourses = allCourses.filter((course: any) => {
                     console.log(`Course "${course.title}"`);
                     console.log(`  - Progress value:`, course.progressPercentage);
                     console.log(`  - Progress type:`, typeof course.progressPercentage);
                     console.log(`  - Certificate Status:`, course.certificateStatus);
                     console.log(`  - Has Payment Slip:`, course.hasPaymentSlip);
                     console.log(`  - Payment Approved:`, course.paymentApproved);
                     
                     // แปลงเป็น number เพื่อเปรียบเทียบ
                     const progressNum = Number(course.progressPercentage);
                     console.log(`  - Progress as number:`, progressNum);
                     
                     const isCompleted = progressNum === 100;
                     console.log(`  - Is 100%?:`, isCompleted);
                     
                     return isCompleted;
                  });
                  
                  console.log("=== คอร์สที่ครบ 100% ===");
                  console.log("Completed courses count:", completedCourses.length);
                  console.log("Completed courses:", completedCourses);

                  setCertificateData({
                     ...transformedData,
                     enrolledCourses: completedCourses
                  });
               } else {
                  console.log("API returned success: false");
                  console.log("Error message:", response.data.message);
                  throw new Error(response.data.message || "ไม่สามารถดึงข้อมูลได้");
               }
            } catch (err) {
               console.error("Error in fetchCertificateData:", err);
               const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อ";
               setError(message);
            } finally {
               setLoading(false);
            }
      };
      fetchCertificateData();
   }, []);

  const handleDownloadCertificate = async (courseId: number, title: string) => {
   const downloadKey = `course-${courseId}`;
   setDownloadingId(downloadKey);
   try {
         const apiClient = getApiClient();
         
         const requestData = {
            courseId: courseId,
            courseTitle: title
         };
         
         console.log("Sending request data:", requestData);
         
         // ส่ง request และรับ response เป็น blob
         const response = await apiClient.post('/api/data/certificate/generate', requestData, {
            responseType: 'blob' // สำคัญ: ต้องระบุเป็น blob สำหรับไฟล์ PDF
         });
         
         // สร้าง blob และดาวน์โหลด
         const blob = new Blob([response.data], { type: 'application/pdf' });
         const url = window.URL.createObjectURL(blob);
         const link = document.createElement('a');
         link.href = url;
         link.download = `Certificate-${title}-${new Date().toISOString().slice(0, 10)}.pdf`;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         window.URL.revokeObjectURL(url);
         
         console.log("Certificate downloaded successfully");
         
   } catch (err) {
         console.error("Download error:", err);
         const message = err instanceof Error ? err.message : "ไม่สามารถดาวน์โหลดได้";
         alert(`เกิดข้อผิดพลาด: ${message}`);
   } finally {
         setDownloadingId(null);
   }
};

   
 
   
   const renderContent = () => {
      console.log("=== Rendering Content ===");
      console.log("Loading:", loading);
      console.log("Error:", error);
      console.log("Certificate data:", certificateData);
      
      if (loading) return <LoadingIndicator />;
      if (error) return <ErrorDisplay message={error} />;
      if (!certificateData || !certificateData.enrolledCourses || certificateData.enrolledCourses.length === 0) {
            console.log("No certificate data or empty enrolled courses");
            return <EmptyState />;
      }

      const {  enrolledCourses } = certificateData;
      console.log("Final enrolled courses to render:", enrolledCourses);

      return (
            <>
               <div className="dashboard__content-title mb-4">
                  <h4 className="title"><i className="fas fa-certificate me-3"></i>ใบรับรองของฉัน</h4>
                  <p className="text-muted">คอร์สที่คุณเรียนจบแล้วและสามารถดาวน์โหลดใบรับรองได้</p>
               </div>


               
               <div className="card">
                  <div className="card-body p-0">
                        <div className="table-responsive">
                           <table className="table table-hover mb-0 align-middle">
                              <thead className="table-light">
                                 <tr>
                                    <th>วิชา</th>
                                    <th>หลักสูตร</th>
                                    <th>วันที่ยื่นขอ</th>
                                    <th className="text-center">สถานะ</th>
                                    <th className="text-center">ใบรับรอง</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {enrolledCourses.map((course) => (
                                    <tr key={course.courseId}>
                                       <td>
                                          <strong>{course.title}</strong>
                                          <p className="text-muted small mb-0">{course.departmentName || 'ไม่ระบุภาควิชา'}</p>
                                       </td>
                                       <td>
                                          <span className="badge bg-info text-dark">
                                             {course.departmentName?.includes('CS') ? 'วิทยาการคอมพิวเตอร์' : 
                                              course.departmentName?.includes('IT') ? 'เทคโนโลยีสารสนเทศ' : 
                                              course.departmentName || 'หลักสูตรทั่วไป'}
                                          </span>
                                       </td>
                                       <td>
                                          {/* วันที่ยื่นขอ = วันที่ส่งสลิป */}
                                          <span className="text-muted">
                                             {course.lastPaymentDate ? 
                                                new Date(course.lastPaymentDate).toLocaleDateString('th-TH', {
                                                   day: '2-digit',
                                                   month: '2-digit',
                                                   year: 'numeric'
                                                }) : 
                                                'ไม่ระบุ'
                                             }
                                          </span>
                                       </td>
                                       <td className="text-center">
                                          <div className="d-flex flex-column align-items-center gap-1">
                                             <span className="badge bg-success">
                                                <i className="fas fa-graduation-cap me-1"></i>เรียนจบแล้ว
                                             </span>
                                             {course.certificateStatus === 'ready_to_download' && (
                                                <span className="badge bg-success">
                                                   <i className="fas fa-check-circle me-1"></i>พร้อมดาวน์โหลด
                                                </span>
                                             )}
                                             {course.certificateStatus === 'pending_approval' && (
                                                <span className="badge bg-warning">
                                                   <i className="fas fa-clock me-1"></i>กำลังตรวจสอบ
                                                </span>
                                             )}
                                             {course.certificateStatus === 'waiting_payment' && (
                                                <span className="badge bg-info">
                                                   <i className="fas fa-credit-card me-1"></i>รอการชำระเงิน
                                                </span>
                                             )}
                                          </div>
                                       </td>
                                       <td className="text-center">
                                          {course.certificateStatus === 'ready_to_download' ? (
                                             <button 
                                                className="btn btn-success btn-sm" 
                                                onClick={() => handleDownloadCertificate(course.courseId, course.title)}
                                                disabled={downloadingId === `course-${course.courseId}`}
                                             >
                                                {downloadingId === `course-${course.courseId}` 
                                                  ? <><i className="fas fa-spinner fa-spin me-1"></i>กำลังสร้าง...</>
                                                  : <><i className="fas fa-download me-1"></i>ดาวน์โหลด</>
                                                }
                                             </button>
                                          ) : course.certificateStatus === 'pending_approval' ? (
                                             <button className="btn btn-warning btn-sm" disabled>
                                                <i className="fas fa-clock me-1"></i>รอการอนุมัติ
                                             </button>
                                          ) : (
                                             <button className="btn btn-info btn-sm" disabled>
                                                <i className="fas fa-credit-card me-1"></i>รอการชำระเงิน
                                             </button>
                                          )}
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                  </div>
               </div>
            </>
      );
   };

   return (
      <section className="dashboard__area section-pb-120">
         <div className="container">
            <div className="dashboard__inner-wrap">
               <div className="row">
                  <div className="col-12">
                     <div className="dashboard__content-wrap">
                        {renderContent()}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
};

export default StudentCertificateArea;

