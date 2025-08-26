import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardSidebar from "../../dashboard-common/ManagerSidebar";
import DashboardBanner from "../../dashboard-common/ManagerBanner";

// Interface สำหรับข้อมูลแผนก
interface Department {
    department_id: number;
    department_name: string;
    faculty: string; // เพิ่ม field faculty
}

// Interface สำหรับข้อมูลคณะ
interface Faculty {
    name: string;
    department_count: number;
    course_count: number;
    subject_count: number;
    total_courses: number;
}

// Interface สำหรับข้อมูลนักศึกษา
interface Student {
    student_id: number;
    user_id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    status: 'active' | 'inactive' | 'pending';
    student_code: string;
    department_id: number;
    faculty_id?: number;
    course_id?: number;
    education_level: string;
    department_name?: string;
    faculty_name?: string;
    course_name?: string;
    academic_year?: number;
    school_name?: string;
    study_program?: string;
    grade_level?: string;
    gpa?: number;
    phone?: string;
    created_at: string;
}

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const SimplePagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = [];

    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - 1 && i <= currentPage + 1)
        ) {
            pageNumbers.push(i);
        } else if (
            (i === currentPage - 2 && currentPage > 3) ||
            (i === currentPage + 2 && currentPage < totalPages - 2)
        ) {
            pageNumbers.push(-1);
        }
    }

    const filteredPageNumbers = pageNumbers.filter(
        (number, index, array) => number !== -1 || (number === -1 && array[index - 1] !== -1)
    );

    return (
        <nav aria-label="Page navigation">
            <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>
                </li>

                {filteredPageNumbers.map((number, index) => {
                    if (number === -1) {
                        return (
                            <li key={`ellipsis-${index}`} className="page-item disabled">
                                <span className="page-link">...</span>
                            </li>
                        );
                    }

                    return (
                        <li key={`page-${number}-${index}`} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => onPageChange(number)}
                            >
                                {number}
                            </button>
                        </li>
                    );
                })}

                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </li>
            </ul>
        </nav>
    );
};

const StudentArea: React.FC = () => {
    const apiURL = import.meta.env.VITE_API_URL;
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    // const [courses, setCourses] = useState<Course[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [facultyFilter, setFacultyFilter] = useState('all');

    const [schoolFilter, setSchoolFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [gradeFilter, setGradeFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [schools, setSchools] = useState<string[]>([]);
    const [academicYears, setAcademicYears] = useState<number[]>([]);
    const [userTypeFilter, setUserTypeFilter] = useState('all'); // all, university, school
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    // ดึงข้อมูลนักศึกษาและข้อมูลที่เกี่ยวข้อง
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const token = localStorage.getItem('token');
                if (!token) {
                    setError('ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่');
                    setIsLoading(false);
                    return;
                }

                // ดึงข้อมูลคณะ
                const facultyResponse = await axios.get(`${apiURL}/api/departments/faculties`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // ดึงข้อมูลแผนก
                const departmentResponse = await axios.get(`${apiURL}/api/departments`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });



                // ดึงข้อมูลนักศึกษามหาวิทยาลัย
                const studentResponse = await axios.get(`${apiURL}/api/accounts/students`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // ดึงข้อมูลนักเรียนมัธยม
                const schoolStudentResponse = await axios.get(`${apiURL}/api/accounts/school_students`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                                 console.log('Student response:', studentResponse.data);
                 console.log('Department response:', departmentResponse.data);
                 console.log('Faculty response:', facultyResponse.data);
                 console.log('School student response:', schoolStudentResponse.data);
                 
                 if (studentResponse.data.success && departmentResponse.data.success && facultyResponse.data.success) {
                    // รวมข้อมูลนักศึกษาและนักเรียนมัธยม
                    let allStudents = [];

                                         // เพิ่มข้อมูลที่เกี่ยวข้องให้กับนักศึกษามหาวิทยาลัย
                     const updatedStudents = studentResponse.data.students.map((student: Student) => {
                         const dept = departmentResponse.data.departments.find(
                             (d: Department) => d.department_id === student.department_id
                         );
                         
                         // หาคณะจากแผนก
                         let facultyName = 'ไม่ระบุ';
                         if (dept && dept.faculty) {
                             facultyName = dept.faculty;
                         }
                         
                         return {
                             ...student,
                             department_name: dept ? dept.department_name : 'ไม่ระบุ',
                             faculty_name: facultyName,
                             course_name: 'ไม่ระบุ',
                             education_level: student.education_level || 'ปริญญาตรี'
                         };
                     });

                    allStudents = [...updatedStudents];

                                         // เพิ่มข้อมูลนักเรียนมัธยม
                     if (schoolStudentResponse.data.success && schoolStudentResponse.data.school_students) {
                         console.log('School students data:', schoolStudentResponse.data.school_students); // Debug log
                         const schoolStudents = schoolStudentResponse.data.school_students.map((schoolStudent: any) => {
                             return {
                                 student_id: schoolStudent.school_student_id || schoolStudent.student_id,
                                 user_id: schoolStudent.user_id,
                                 username: schoolStudent.username,
                                 first_name: schoolStudent.first_name,
                                 last_name: schoolStudent.last_name,
                                 email: schoolStudent.email,
                                 status: schoolStudent.status,
                                 student_code: schoolStudent.student_code,
                                 department_id: null,
                                 faculty_id: null,
                                 course_id: null,
                                 education_level: schoolStudent.grade_level === 'ม.1' || schoolStudent.grade_level === 'ม.2' || schoolStudent.grade_level === 'ม.3' ? 'มัธยมต้น' : 'มัธยมปลาย',
                                 department_name: 'ไม่ระบุ',
                                 faculty_name: 'ไม่ระบุ',
                                 course_name: 'ไม่ระบุ',
                                 academic_year: null,
                                 school_name: schoolStudent.school_name,
                                 study_program: schoolStudent.study_program,
                                 grade_level: schoolStudent.grade_level,
                                 gpa: schoolStudent.gpa,
                                 phone: schoolStudent.phone,
                                 created_at: schoolStudent.created_at
                             };
                         });

                         allStudents = [...allStudents, ...schoolStudents];
                         console.log('Total students after adding school students:', allStudents.length); // Debug log
                     } else {
                         console.log('School student response:', schoolStudentResponse.data); // Debug log
                     }

                    setStudents(allStudents);
                    setFilteredStudents(allStudents);
                                         setDepartments(departmentResponse.data.departments || []);
                     
                     // สร้างรายการคณะจากแผนก
                     const uniqueFaculties = [...new Set(departmentResponse.data.departments.map((dept: Department) => dept.faculty).filter(Boolean))] as string[];
                     setFaculties(uniqueFaculties.map(facultyName => ({
                         name: facultyName,
                         department_count: departmentResponse.data.departments.filter((dept: Department) => dept.faculty === facultyName).length,
                         course_count: 0,
                         subject_count: 0,
                         total_courses: 0
                     })));
                     
                    //  setCourses(courseResponse.data.courses || []);

                    // สร้างรายการโรงเรียนและปีการศึกษา
                    const uniqueSchools = [...new Set(allStudents.map((s: Student) => s.school_name).filter(Boolean))] as string[];
                    const uniqueYears = [...new Set(allStudents.map((s: Student) => s.academic_year).filter(Boolean))] as number[];
                    uniqueYears.sort((a, b) => (b as number) - (a as number));

                    setSchools(uniqueSchools);
                    setAcademicYears(uniqueYears);
                    setTotalPages(Math.ceil(allStudents.length / itemsPerPage));
                } else {
                    setError('ไม่สามารถดึงข้อมูลนักศึกษาได้');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [apiURL, itemsPerPage]);

    // กรองข้อมูลนักศึกษา
    useEffect(() => {
        let results = students;

        // กรองตามคำค้นหา
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            results = results.filter(
                student =>
                    student.username.toLowerCase().includes(searchLower) ||
                    student.first_name.toLowerCase().includes(searchLower) ||
                    student.last_name.toLowerCase().includes(searchLower) ||
                    student.email.toLowerCase().includes(searchLower) ||
                    student.student_code.toLowerCase().includes(searchLower) ||
                    (student.department_name || '').toLowerCase().includes(searchLower) ||
                    (student.faculty_name || '').toLowerCase().includes(searchLower) ||
                    (student.course_name || '').toLowerCase().includes(searchLower) ||
                    (student.school_name || '').toLowerCase().includes(searchLower)
            );
        }

        // กรองตามสถานะ
        if (statusFilter !== 'all') {
            results = results.filter(student => student.status === statusFilter);
        }

        // กรองตามแผนก
        if (departmentFilter !== 'all') {
            results = results.filter(student => String(student.department_id) === departmentFilter);
        }

        // กรองตามคณะ
        if (facultyFilter !== 'all') {
            results = results.filter(student => student.faculty_name === facultyFilter);
        }



        // กรองตามโรงเรียน
        if (schoolFilter !== 'all') {
            results = results.filter(student => student.school_name === schoolFilter);
        }

        // กรองตามปีการศึกษา
        if (yearFilter !== 'all') {
            results = results.filter(student => String(student.academic_year) === yearFilter);
        }

        // กรองตามระดับชั้น
        if (gradeFilter !== 'all') {
            results = results.filter(student => student.grade_level === gradeFilter);
        }

                 // กรองตามประเภทผู้ใช้
         if (userTypeFilter !== 'all') {
             console.log('Filtering by user type:', userTypeFilter);
             console.log('Students before filtering:', results.length);
             
             results = results.filter(student => {
                 const isSchoolStudent = student.education_level === 'มัธยมต้น' || student.education_level === 'มัธยมปลาย' || student.grade_level;
                 
                 if (userTypeFilter === 'university') {
                     return !isSchoolStudent;
                 } else if (userTypeFilter === 'school') {
                     return isSchoolStudent;
                 }
                 return true;
             });
             
             console.log('Students after filtering:', results.length);
             console.log('Sample filtered students:', results.slice(0, 3));
         }

        // Sort ข้อมูล
        results = sortStudents(results);
        
        setFilteredStudents(results);
        setTotalPages(Math.ceil(results.length / itemsPerPage));
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [searchTerm, statusFilter, departmentFilter, facultyFilter, schoolFilter, yearFilter, gradeFilter, userTypeFilter, students, itemsPerPage, sortBy, sortOrder]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

         // ฟังก์ชัน sort ข้อมูล
     const sortStudents = (studentsToSort: Student[]) => {
         return [...studentsToSort].sort((a, b) => {
             let aValue: any;
             let bValue: any;

             // ตรวจสอบว่า sort option ที่เลือกเหมาะสมกับข้อมูลหรือไม่
             if (sortBy === 'academic_year' && userTypeFilter === 'school') {
                 // ถ้าเป็นนักเรียนและเลือก sort ตามปีการศึกษา ให้ใช้ created_at แทน
                 aValue = new Date(a.created_at || 0);
                 bValue = new Date(b.created_at || 0);
             } else if (sortBy === 'grade_level' && userTypeFilter === 'university') {
                 // ถ้าเป็นนักศึกษาและเลือก sort ตามระดับชั้น ให้ใช้ created_at แทน
                 aValue = new Date(a.created_at || 0);
                 bValue = new Date(b.created_at || 0);
             } else {
                 switch (sortBy) {
                     case 'created_at':
                         aValue = new Date(a.created_at || 0);
                         bValue = new Date(b.created_at || 0);
                         break;
                     case 'grade_level':
                         aValue = convertGradeLevelToNumber(a.grade_level || '');
                         bValue = convertGradeLevelToNumber(b.grade_level || '');
                         break;
                     case 'academic_year':
                         aValue = a.academic_year || 0;
                         bValue = b.academic_year || 0;
                         break;
                     case 'name':
                         aValue = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
                         bValue = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
                         break;
                     default:
                         aValue = a.created_at ? new Date(a.created_at) : new Date(0);
                         bValue = b.created_at ? new Date(b.created_at) : new Date(0);
                 }
             }

             if (sortOrder === 'asc') {
                 return aValue > bValue ? 1 : -1;
             } else {
                 return aValue < bValue ? 1 : -1;
             }
         });
     };

    // ฟังก์ชันแปลงระดับชั้นเป็นตัวเลขสำหรับ sort
    const convertGradeLevelToNumber = (gradeLevel: string): number => {
        if (!gradeLevel) return 0;
        
        const cleanGrade = gradeLevel.toLowerCase().trim();
        
        const match = cleanGrade.match(/ม\.?(\d+)/);
        if (match) {
            const num = parseInt(match[1]);
            if (num >= 1 && num <= 6) {
                return num;
            }
        }
        
        const match2 = cleanGrade.match(/มัธยมศึกษาปีที่\s*(\d+)/);
        if (match2) {
            const num = parseInt(match2[1]);
            if (num >= 1 && num <= 6) {
                return num;
            }
        }
        
        if (cleanGrade.includes('มัธยมต้น')) return 1.5;
        if (cleanGrade.includes('มัธยมปลาย')) return 4.5;
        
        return 0;
    };

    // ฟังก์ชันแปลงระดับชั้นเป็นข้อความที่อ่านง่าย
    // const formatGradeLevel = (gradeLevel: string): string => {
    //     if (!gradeLevel) return 'ไม่ระบุ';
        
    //     const cleanGrade = gradeLevel.toLowerCase().trim();
        
    //     const match = cleanGrade.match(/ม\.?(\d+)/);
    //     if (match) {
    //         const num = parseInt(match[1]);
    //         if (num >= 1 && num <= 6) {
    //             return `มัธยมศึกษาปีที่ ${num}`;
    //         }
    //     }
        
    //     const match2 = cleanGrade.match(/มัธยมศึกษาปีที่\s*(\d+)/);
    //     if (match2) {
    //         const num = parseInt(match2[1]);
    //         if (num >= 1 && num <= 6) {
    //             return `มัธยมศึกษาปีที่ ${num}`;
    //         }
    //     }
        
    //     if (cleanGrade.includes('มัธยมต้น')) return 'มัธยมต้น';
    //     if (cleanGrade.includes('มัธยมปลาย')) return 'มัธยมปลาย';
        
    //     return gradeLevel;
    // };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const StatusBadge = ({ status }: { status: Student["status"] }) => {
        let badgeClass = "";
        let statusText = "";

        switch (status) {
            case "active":
                badgeClass = "badge bg-success-subtle text-success rounded-pill px-3 py-1 small";
                statusText = "ปกติ";
                break;
            case "inactive":
                badgeClass = "badge bg-danger-subtle text-danger rounded-pill px-3 py-1 small";
                statusText = "พ้นสภาพ";
                break;
            case "pending":
                badgeClass = "badge bg-warning-subtle text-warning rounded-pill px-3 py-1 small";
                statusText = "พักการเรียน";
                break;
            default:
                badgeClass = "badge bg-secondary-subtle text-secondary rounded-pill px-3 py-1 small";
                statusText = "ไม่ระบุ";
                break;
        }
        return <span className={badgeClass}>{statusText}</span>;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'ไม่ระบุ';
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <section className="dashboard__area section-pb-120">
                <div className="container">
                    <DashboardBanner />
                    <div className="dashboard__inner-wrap">
                        <div className="row">
                            <DashboardSidebar />
                            <div className="dashboard__content-area col-lg-9">
                                <div className="dashboard__content-main">
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">กำลังโหลด...</span>
                                        </div>
                                        <p className="mt-3">กำลังโหลดข้อมูล...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="dashboard__area section-pb-120">
                <div className="container">
                    <DashboardBanner />
                    <div className="dashboard__inner-wrap">
                        <div className="row">
                            <DashboardSidebar />
                            <div className="dashboard__content-area col-lg-9">
                                <div className="dashboard__content-main">
                                    <div className="alert alert-danger" role="alert">
                                        <h4 className="alert-heading">เกิดข้อผิดพลาด!</h4>
                                        <p>{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="dashboard__area section-pb-120">
            <div className="container">
                <DashboardBanner />
                <div className="dashboard__inner-wrap">
                    <div className="row">
                        <DashboardSidebar />
                        <div className="dashboard__content-area col-lg-9">
                            <div className="dashboard__content-main">
                                <div className="dashboard__content-header">
                                    <h2 className="dashboard__content-title">
                                        <i className="fas fa-chart-bar me-2"></i>
                                        รายงานข้อมูลนักศึกษาและนักเรียน
                                    </h2>
                                    <p className="dashboard__content-subtitle">
                                        แสดงข้อมูลรายละเอียดของนักศึกษามหาวิทยาลัยและนักเรียนมัธยมศึกษา
                                    </p>
                                </div>

                                {/* User Type Filter Tabs */}
                                <div className="card mb-4">
                                    <div className="card-body py-3">
                                        <div className="d-flex justify-content-center">
                                            <div className="btn-group" role="group" aria-label="ประเภทผู้ใช้">
                                                                                                 <button
                                                     type="button"
                                                     className={`btn ${userTypeFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'} position-relative`}
                                                     onClick={() => {
                                                         setUserTypeFilter('all');
                                                         // Reset sort options สำหรับทั้งหมด
                                                         setSortBy('created_at');
                                                         setSortOrder('desc');
                                                     }}
                                                 >
                                                    <i className="fas fa-users me-2"></i>
                                                    ทั้งหมด
                                                    <span className="badge bg-secondary ms-2">
                                                        {students.length}
                                                    </span>
                                                </button>
                                                                                                 <button
                                                     type="button"
                                                     className={`btn ${userTypeFilter === 'university' ? 'btn-primary' : 'btn-outline-primary'} position-relative`}
                                                     onClick={() => {
                                                         setUserTypeFilter('university');
                                                         // Reset sort options สำหรับนักศึกษา
                                                         setSortBy('created_at');
                                                         setSortOrder('desc');
                                                     }}
                                                 >
                                                    <i className="fas fa-graduation-cap me-2"></i>
                                                    นักศึกษา
                                                                                                         <span className="badge bg-secondary ms-2">
                                                         {(() => {
                                                             const count = students.filter(s => {
                                                                 const isSchoolStudent = s.education_level === 'มัธยมต้น' || s.education_level === 'มัธยมปลาย' || s.grade_level;
                                                                 return !isSchoolStudent;
                                                             }).length;
                                                             console.log('University students count:', count);
                                                             return count;
                                                         })()}
                                                     </span>
                                                </button>
                                                                                                 <button
                                                     type="button"
                                                     className={`btn ${userTypeFilter === 'school' ? 'btn-primary' : 'btn-outline-primary'} position-relative`}
                                                     onClick={() => {
                                                         setUserTypeFilter('school');
                                                         // Reset sort options สำหรับนักเรียน
                                                         setSortBy('created_at');
                                                         setSortOrder('desc');
                                                     }}
                                                 >
                                                    <i className="fas fa-school me-2"></i>
                                                    นักเรียน
                                                                                                         <span className="badge bg-secondary ms-2">
                                                         {(() => {
                                                             const count = students.filter(s => {
                                                                 const isSchoolStudent = s.education_level === 'มัธยมต้น' || s.education_level === 'มัธยมปลาย' || s.grade_level;
                                                                 return isSchoolStudent;
                                                             }).length;
                                                             console.log('School students count:', count);
                                                             return count;
                                                         })()}
                                                     </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Search and Basic Filters */}
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3 mb-md-0">
                                        <div className="input-group">
                                            <span className="input-group-text bg-white">
                                                <i className="fas fa-search text-muted"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control border-start-0"
                                                placeholder="ค้นหาชื่อ, รหัส, อีเมล, โรงเรียน..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex justify-content-end">
                                            <button
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setStatusFilter('all');
                                                    setDepartmentFilter('all');
                                                    setFacultyFilter('all');

                                                    setSchoolFilter('all');
                                                    setYearFilter('all');
                                                    setGradeFilter('all');
                                                    setUserTypeFilter('all');
                                                    setSortBy('created_at');
                                                    setSortOrder('desc');
                                                }}
                                            >
                                                <i className="fas fa-undo me-1"></i>ล้างตัวกรอง
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Advanced Filters */}
                                <div className="card mb-4">
                                    <div className="card-header bg-light">
                                        <h6 className="mb-0">
                                            <i className="fas fa-filter me-2"></i>ตัวกรองข้อมูล
                                            {userTypeFilter !== 'all' && (
                                                <span className="badge bg-primary ms-2">
                                                    {userTypeFilter === 'university' ? 'นักศึกษา' : 'นักเรียน'}
                                                </span>
                                            )}
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            {/* Universal filters */}
                                            <div className="col-md-3 mb-3">
                                                <label className="form-label small">สถานะ</label>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={statusFilter}
                                                    onChange={(e) => setStatusFilter(e.target.value)}
                                                >
                                                    <option value="all">ทุกสถานะ</option>
                                                    <option value="active">ปกติ</option>
                                                    <option value="inactive">พ้นสภาพ</option>
                                                    <option value="pending">พักการเรียน</option>
                                                </select>
                                            </div>

                                            {/* Sort Controls */}
                                            <div className="col-md-3 mb-3">
                                                <label className="form-label small">เรียงตาม</label>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={sortBy}
                                                    onChange={(e) => setSortBy(e.target.value)}
                                                >
                                                    <option value="created_at">วันที่ลงทะเบียน</option>
                                                    <option value="name">ชื่อ-นามสกุล</option>
                                                    {userTypeFilter !== 'school' && (
                                                        <option value="academic_year">ชั้นปีการศึกษา</option>
                                                    )}
                                                    {userTypeFilter !== 'university' && (
                                                        <option value="grade_level">ระดับชั้น</option>
                                                    )}
                                                </select>
                                            </div>

                                            <div className="col-md-3 mb-3">
                                                <label className="form-label small">ลำดับ</label>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={sortOrder}
                                                    onChange={(e) => setSortOrder(e.target.value)}
                                                >
                                                    <option value="desc">ใหม่สุด</option>
                                                    <option value="asc">เก่าสุด</option>
                                                </select>
                                            </div>

                                            {/* University student specific filters */}
                                            {(userTypeFilter === 'all' || userTypeFilter === 'university') && (
                                                <>
                                                    <div className="col-md-3 mb-3">
                                                        <label className="form-label small">คณะ</label>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={facultyFilter}
                                                            onChange={(e) => setFacultyFilter(e.target.value)}
                                                        >
                                                            <option value="all">ทุกคณะ</option>
                                                            {faculties.map((faculty) => (
                                                                <option key={faculty.name} value={faculty.name}>
                                                                    {faculty.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="col-md-3 mb-3">
                                                        <label className="form-label small">สาขาวิชา</label>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={departmentFilter}
                                                            onChange={(e) => setDepartmentFilter(e.target.value)}
                                                        >
                                                            <option value="all">ทุกสาขา</option>
                                                            {departments.map((dept) => (
                                                                <option key={dept.department_id} value={dept.department_id}>
                                                                    {dept.department_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="col-md-3 mb-3">
                                                        <label className="form-label small">ปีการศึกษา</label>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={yearFilter}
                                                            onChange={(e) => setYearFilter(e.target.value)}
                                                        >
                                                            <option value="all">ทุกปี</option>
                                                            {academicYears.map((year) => (
                                                                <option key={year} value={year}>
                                                                    {year}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </>
                                            )}

                                            {/* School student specific filters */}
                                            {(userTypeFilter === 'all' || userTypeFilter === 'school') && (
                                                <>
                                                    <div className="col-md-3 mb-3">
                                                        <label className="form-label small">โรงเรียน</label>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={schoolFilter}
                                                            onChange={(e) => setSchoolFilter(e.target.value)}
                                                        >
                                                            <option value="all">ทุกโรงเรียน</option>
                                                            {schools.map((school) => (
                                                                <option key={school} value={school}>
                                                                    {school}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="col-md-3 mb-3">
                                                        <label className="form-label small">ระดับชั้น</label>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={gradeFilter}
                                                            onChange={(e) => setGradeFilter(e.target.value)}
                                                        >
                                                            <option value="all">ทุกระดับ</option>
                                                            <option value="ม.1">มัธยมศึกษาปีที่ 1</option>
                                                            <option value="ม.2">มัธยมศึกษาปีที่ 2</option>
                                                            <option value="ม.3">มัธยมศึกษาปีที่ 3</option>
                                                            <option value="ม.4">มัธยมศึกษาปีที่ 4</option>
                                                            <option value="ม.5">มัธยมศึกษาปีที่ 5</option>
                                                            <option value="ม.6">มัธยมศึกษาปีที่ 6</option>
                                                        </select>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* สรุปข้อมูล */}
                                <div className="row mb-4">
                                    <div className="col-md-3">
                                        <div className="card bg-primary text-white">
                                            <div className="card-body text-center">
                                                <h5 className="card-title">จำนวนทั้งหมด</h5>
                                                <h3 className="mb-0">{filteredStudents.length}</h3>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card bg-success text-white">
                                            <div className="card-body text-center">
                                                <h5 className="card-title">นักศึกษามหาวิทยาลัย</h5>
                                                                                                 <h3 className="mb-0">
                                                     {(() => {
                                                         const count = filteredStudents.filter(s => s.education_level !== 'มัธยมต้น' && s.education_level !== 'มัธยมปลาย' && !s.grade_level).length;
                                                         console.log('Filtered university students count:', count);
                                                         return count;
                                                     })()}
                                                 </h3>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card bg-info text-white">
                                            <div className="card-body text-center">
                                                <h5 className="card-title">นักเรียนมัธยม</h5>
                                                                                                 <h3 className="mb-0">
                                                     {(() => {
                                                         const count = filteredStudents.filter(s => s.education_level === 'มัธยมต้น' || s.education_level === 'มัธยมปลาย' || s.grade_level).length;
                                                         console.log('Filtered school students count:', count);
                                                         return count;
                                                     })()}
                                                 </h3>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card bg-warning text-white">
                                            <div className="card-body text-center">
                                                <h5 className="card-title">สถานะปกติ</h5>
                                                <h3 className="mb-0">
                                                    {filteredStudents.filter(s => s.status === 'active').length}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isLoading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">กำลังโหลด...</span>
                                        </div>
                                        <p className="mt-2 text-muted">กำลังโหลดข้อมูลนักศึกษา...</p>
                                    </div>
                                ) : error ? (
                                    <div className="alert alert-danger">
                                        <i className="fas fa-exclamation-circle me-2"></i>
                                        {error}
                                    </div>
                                ) : filteredStudents.length === 0 ? (
                                    <div className="text-center py-5 bg-light rounded">
                                        <i className="fas fa-user-slash fa-3x text-muted mb-3"></i>
                                        <h5>
                                            ไม่พบข้อมูล
                                            {userTypeFilter === 'university'
                                                ? 'นักศึกษา'
                                                : userTypeFilter === 'school'
                                                    ? 'นักเรียน'
                                                    : 'ผู้ใช้'}
                                        </h5>
                                        <p className="text-muted">
                                            {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all' || userTypeFilter !== 'all'
                                                ? 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา'
                                                : 'ยังไม่มีข้อมูลผู้ใช้ในระบบ'}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="card">
                                            <div className="card-header d-flex justify-content-between align-items-center">
                                                <h5 className="mb-0">รายละเอียดข้อมูล</h5>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => {
                                                            const csvContent = generateCSV();
                                                            downloadCSV(csvContent, 'student_report.csv');
                                                        }}
                                                    >
                                                        <i className="fas fa-download me-1"></i>
                                                        ดาวน์โหลด CSV
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                <div className="table-responsive">
                                                    <table className="table table-hover table-sm mb-0 align-middle">
                                                        <thead className="table-dark">
                                                            <tr>
                                                                <th scope="col" style={{ width: '40px' }}>#</th>
                                                                {userTypeFilter === 'university' ? (
                                                                    <>
                                                                        <th scope="col">รหัสนักศึกษา</th>
                                                                        <th scope="col">ชื่อ - นามสกุล</th>
                                                                        <th scope="col">คณะ</th>
                                                                        <th scope="col">สาขา</th>
                                                                        <th scope="col">โรงเรียน</th>
                                                                        <th scope="col">วันที่ลงทะเบียน</th>
                                                                        <th scope="col">สถานะ</th>
                                                                    </>
                                                                ) : userTypeFilter === 'school' ? (
                                                                    <>
                                                                        <th scope="col">รหัสนักเรียน</th>
                                                                        <th scope="col">ชื่อ - นามสกุล</th>
                                                                        <th scope="col">หลักสูตร</th>
                                                                        <th scope="col">โรงเรียน</th>
                                                                        <th scope="col">วันที่ลงทะเบียน</th>
                                                                        <th scope="col">สถานะ</th>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <th scope="col">รหัส</th>
                                                                        <th scope="col">ชื่อ - นามสกุล</th>
                                                                        <th scope="col">ประเภท</th>
                                                                        <th scope="col">ข้อมูลเพิ่มเติม</th>
                                                                        <th scope="col">วันที่ลงทะเบียน</th>
                                                                        <th scope="col">สถานะ</th>
                                                                    </>
                                                                )}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {currentItems.map((student, index) => (
                                                                <tr key={`student-${student.student_id}-${index}`}>
                                                                    <td>{indexOfFirstItem + index + 1}</td>
                                                                    
                                                                    {/* รหัส */}
                                                                    <td>
                                                                        <strong className="text-primary">
                                                                            {student.student_code || 'ไม่ระบุ'}
                                                                        </strong>
                                                                    </td>
                                                                    
                                                                    {/* ชื่อ - นามสกุล */}
                                                                    <td>
                                                                        <div>
                                                                            <div className="fw-bold">
                                                                                {`${student.first_name || ''} ${student.last_name || ''}`.trim()}
                                                                            </div>
                                                                            <div className="text-muted small">
                                                                                <i className="fas fa-envelope me-1"></i>{student.email}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    
                                                                    {/* ข้อมูลเฉพาะประเภทผู้ใช้ */}
                                                                    {userTypeFilter === 'university' ? (
                                                                        <>
                                                                            
                                                                            {/* สาขา */}
                                                                            <td>
                                                                                <span className="badge bg-warning-subtle text-warning">
                                                                                    {student.department_name || 'ไม่ระบุ'}
                                                                                </span>
                                                                            </td>
                                                                            
                                                                            {/* คณะ */}
                                                                            <td>
                                                                                <span className="badge bg-success-subtle text-success">
                                                                                    {student.faculty_name || 'ไม่ระบุ'}
                                                                                </span>
                                                                            </td>
                                                                            
                                                                            {/* โรงเรียน */}
                                                                            <td>
                                                                                <span className="text-muted">
                                                                                    {student.school_name || 'ไม่ระบุ'}
                                                                                </span>
                                                                            </td>
                                                                        </>
                                                                    ) : userTypeFilter === 'school' ? (
                                                                        <>
                                                                            {/* สาย */}
                                                                            <td>
                                                                                <span className="badge bg-info-subtle text-info">
                                                                                    {student.study_program || 'ไม่ระบุ'}
                                                                                </span>
                                                                            </td>
                                                                            
                                                                            {/* โรงเรียน */}
                                                                            <td>
                                                                                <span className="badge bg-warning-subtle text-warning">
                                                                                    {student.school_name || 'ไม่ระบุ'}
                                                                                </span>
                                                                            </td>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            {/* ประเภท */}
                                                                            <td>
                                                                                <span className={`badge ${student.education_level === 'มัธยมต้น' || student.education_level === 'มัธยมปลาย' || student.grade_level ? 'bg-info-subtle text-info' : 'bg-success-subtle text-success'}`}>
                                                                                    {student.education_level === 'มัธยมต้น' || student.education_level === 'มัธยมปลาย' || student.grade_level ? 'นักเรียน' : 'นักศึกษา'}
                                                                                </span>
                                                                            </td>
                                                                            
                                                                            {/* ข้อมูลเพิ่มเติม */}
                                                                            <td>
                                                                                <div className="text-muted small">
                                                                                    {student.education_level === 'มัธยมต้น' || student.education_level === 'มัธยมปลาย' || student.grade_level ? (
                                                                                        <>
                                                                                            <div><i className="fas fa-school me-1"></i>{student.school_name || 'ไม่ระบุ'}</div>
                                                                                            <div><i className="fas fa-book me-1"></i>{student.study_program || 'ไม่ระบุ'}</div>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <div><i className="fas fa-graduation-cap me-1"></i>{student.department_name || 'ไม่ระบุ'}</div>
                                                                                            <div><i className="fas fa-university me-1"></i>{student.faculty_name || 'ไม่ระบุ'}</div>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                        </>
                                                                    )}
                                                                    
                                                                    {/* วันที่ลงทะเบียน */}
                                                                    <td>
                                                                        <div className="text-muted small">
                                                                            {student.created_at ? new Date(student.created_at).toLocaleDateString('th-TH', {
                                                                                year: 'numeric',
                                                                                month: 'short',
                                                                                day: 'numeric'
                                                                            }) : 'ไม่ระบุ'}
                                                                        </div>
                                                                    </td>
                                                                    
                                                                    {/* สถานะ */}
                                                                    <td>
                                                                        <StatusBadge status={student.status} />
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="d-flex justify-content-center mt-4">
                                                <SimplePagination
                                                    currentPage={currentPage}
                                                    totalPages={totalPages}
                                                    onPageChange={handlePageChange}
                                                />
                                            </div>
                                        )}

                                        {/* แสดงจำนวนรายการ */}
                                        <div className="text-center mt-3">
                                            <small className="text-muted">
                                                แสดง {indexOfFirstItem + 1} ถึง {Math.min(indexOfLastItem, filteredStudents.length)} จาก {filteredStudents.length} รายการ
                                            </small>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );

    // ฟังก์ชันสร้าง CSV
    const generateCSV = () => {
        let headers: string[];
        
        if (userTypeFilter === 'university') {
            headers = [
                'รหัสนักศึกษา',
                'ชื่อ - นามสกุล',
                'อีเมล',
                'คณะ',
                'สาขา',
                'โรงเรียน',
                'วันที่ลงทะเบียน',
                'สถานะ'
            ];
        } else if (userTypeFilter === 'school') {
            headers = [
                'รหัสนักเรียน',
                'ชื่อ - นามสกุล',
                'อีเมล',
                'สาย',
                'โรงเรียน',
                'วันที่ลงทะเบียน',
                'สถานะ'
            ];
        } else {
            headers = [
                'รหัส',
                'ชื่อ - นามสกุล',
                'อีเมล',
                'ประเภท',
                'ข้อมูลเพิ่มเติม',
                'วันที่ลงทะเบียน',
                'สถานะ'
            ];
        }

        const csvRows = [headers.join(',')];

        filteredStudents.forEach(student => {
            let row: string[];
            
            if (userTypeFilter === 'university') {
                row = [
                    student.student_code || 'ไม่ระบุ',
                    `"${student.first_name} ${student.last_name}"`,
                    student.email,
                    student.course_name || 'ไม่ระบุ',
                    student.department_name || 'ไม่ระบุ',
                    student.faculty_name || 'ไม่ระบุ',
                    student.school_name || 'ไม่ระบุ',
                    formatDate(student.created_at),
                    student.status === 'active' ? 'ปกติ' : student.status === 'inactive' ? 'พ้นสภาพ' : 'พักการเรียน'
                ];
            } else if (userTypeFilter === 'school') {
                row = [
                    student.student_code || 'ไม่ระบุ',
                    `"${student.first_name} ${student.last_name}"`,
                    student.email,
                    student.study_program || 'ไม่ระบุ',
                    student.school_name || 'ไม่ระบุ',
                    formatDate(student.created_at),
                    student.status === 'active' ? 'ปกติ' : student.status === 'inactive' ? 'พ้นสภาพ' : 'พักการเรียน'
                ];
            } else {
                const isSchoolStudent = student.education_level === 'มัธยมต้น' || student.education_level === 'มัธยมปลาย' || student.grade_level;
                const additionalInfo = isSchoolStudent 
                    ? `${student.school_name || 'ไม่ระบุ'} - ${student.study_program || 'ไม่ระบุ'}`
                    : `${student.department_name || 'ไม่ระบุ'} - ${student.faculty_name || 'ไม่ระบุ'}`;
                
                row = [
                    student.student_code || 'ไม่ระบุ',
                    `"${student.first_name} ${student.last_name}"`,
                    student.email,
                    isSchoolStudent ? 'นักเรียน' : 'นักศึกษา',
                    additionalInfo,
                    formatDate(student.created_at),
                    student.status === 'active' ? 'ปกติ' : student.status === 'inactive' ? 'พ้นสภาพ' : 'พักการเรียน'
                ];
            }
            
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    };

    // ฟังก์ชันดาวน์โหลด CSV
    const downloadCSV = (csvContent: string, filename: string) => {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
};

export default StudentArea;
