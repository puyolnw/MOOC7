import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminBanner from "../../dashboard-common/AdminBanner";

// Interface สำหรับข้อมูลแผนก
interface Department {
    department_id: number;
    department_name: string;
    faculty: string;
}

// Interface สำหรับข้อมูลคณะ
interface Faculty {
    name: string;
    department_count: number;
    course_count: number;
    subject_count: number;
    total_courses: number;
}

// Interface สำหรับข้อมูลหลักสูตร
interface Course {
    course_id: number;
    title: string;
    department_name: string;
    faculty: string;
}

// Interface สำหรับข้อมูลรายวิชา
interface Subject {
    subject_id: number;
    subject_name: string;
    course_title: string;
    department_name: string;
    faculty: string;
}

// Interface สำหรับข้อมูลผู้เรียนและความคืบหน้า
interface StudentProgress {
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
    // ข้อมูลความคืบหน้า
    subject_name?: string;
    course_title?: string;
    progress_percentage?: number;
    completed_lessons?: number;
    total_lessons?: number;
    completed_quizzes?: number;
    total_quizzes?: number;
    student_type?: string; // Added for user type filtering
    pre_test_completed?: boolean;
    post_test_completed?: boolean;
    big_lesson_quiz_completed?: boolean;
    // เพิ่ม field ใหม่
    department_faculty?: string;
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

const StudentsProgressArea: React.FC = () => {
    const apiURL = import.meta.env.VITE_API_URL;
    const [studentsProgress, setStudentsProgress] = useState<StudentProgress[]>([]);
    const [filteredStudentsProgress, setFilteredStudentsProgress] = useState<StudentProgress[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [facultyFilter, setFacultyFilter] = useState('all');
    const [courseFilter, setCourseFilter] = useState('all');
    const [subjectFilter, setSubjectFilter] = useState('all');
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
    const [userTypeFilter, setUserTypeFilter] = useState('all');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    // ดึงข้อมูลผู้เรียนและความคืบหน้า
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

                // ดึงข้อมูลหลักสูตร
                const courseResponse = await axios.get(`${apiURL}/api/courses`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // ดึงข้อมูลรายวิชา
                const subjectResponse = await axios.get(`${apiURL}/api/courses/subjects`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // ดึงข้อมูลผู้เรียนและความคืบหน้าแบบครบถ้วนจาก API ใหม่
                const studentsProgressResponse = await axios.get(`${apiURL}/api/accounts/students/progress/overview`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (studentsProgressResponse.data.success && departmentResponse.data.success && facultyResponse.data.success) {
                    // ใช้ข้อมูลจาก API ใหม่
                    const allStudentsProgress = studentsProgressResponse.data.students_progress.map((student: any) => ({
                        student_id: student.student_id,
                        user_id: student.user_id,
                        username: student.username,
                        first_name: student.first_name,
                        last_name: student.last_name,
                        email: student.email,
                        status: student.status,
                        student_code: student.student_code,
                        department_id: student.department_id,
                        faculty_id: null,
                        course_id: student.course_id,
                        education_level: student.education_level,
                        department_name: student.department_name,
                        faculty_name: student.faculty,
                        course_name: student.course_title,
                        subject_name: student.subject_name,
                        course_title: student.course_title,
                        academic_year: student.academic_year,
                        school_name: student.school_name,
                        study_program: student.study_program,
                        grade_level: student.grade_level,
                        gpa: null,
                        phone: null,
                        created_at: student.registration_date, // ใช้วันที่ลงทะเบียนวิชา
                        progress_percentage: student.progress_percentage || 0,
                        completed_lessons: student.completed_lessons || 0,
                        total_lessons: student.total_lessons || 0,
                        completed_quizzes: (student.pre_test_completed || 0) + (student.post_test_completed || 0) + (student.big_lesson_quiz_completed || 0),
                        total_quizzes: 3, // pre-test, post-test, big lesson quiz
                        student_type: student.student_type,
                        pre_test_completed: student.pre_test_completed,
                        post_test_completed: student.post_test_completed,
                        big_lesson_quiz_completed: student.big_lesson_quiz_completed,
                        department_faculty: student.department_faculty || `${student.department_name || ''} - ${student.faculty_name || ''}`.trim(),
                    }));

                    setStudentsProgress(allStudentsProgress);
                    setFilteredStudentsProgress(allStudentsProgress);
                    setDepartments(departmentResponse.data.departments || []);
                    setCourses(courseResponse.data.courses || []);
                    setSubjects(subjectResponse.data.subjects || []);
                    
                    // สร้างรายการคณะจากแผนก
                    const uniqueFaculties = [...new Set(departmentResponse.data.departments.map((dept: Department) => dept.faculty).filter(Boolean))] as string[];
                    setFaculties(uniqueFaculties.map(facultyName => ({
                        name: facultyName,
                        department_count: departmentResponse.data.departments.filter((dept: Department) => dept.faculty === facultyName).length,
                        course_count: 0,
                        subject_count: 0,
                        total_courses: 0
                    })));
                    
                    // สร้างรายการโรงเรียนและปีการศึกษา
                    const uniqueSchools = [...new Set(allStudentsProgress.map((s: any) => s.school_name).filter(Boolean))] as string[];
                    const uniqueYears = [...new Set(allStudentsProgress.map((s: any) => s.academic_year).filter(Boolean))] as number[];
                    uniqueYears.sort((a, b) => (b as number) - (a as number));

                    setSchools(uniqueSchools);
                    setAcademicYears(uniqueYears);
                    setTotalPages(Math.ceil(allStudentsProgress.length / itemsPerPage));
                } else {
                    setError('ไม่สามารถดึงข้อมูลผู้เรียนได้');
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

    // กรองข้อมูลผู้เรียน
    useEffect(() => {
        let results = studentsProgress;

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
                    (student.subject_name || '').toLowerCase().includes(searchLower) ||
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

        // กรองตามหลักสูตร
        if (courseFilter !== 'all') {
            results = results.filter(student => student.course_title === courseFilter);
        }

        // กรองตามรายวิชา
        if (subjectFilter !== 'all') {
            results = results.filter(student => student.subject_name === subjectFilter);
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
            results = results.filter(student => {
                const isSchoolStudent = student.student_type === 'school';
                
                if (userTypeFilter === 'university') {
                    return !isSchoolStudent;
                } else if (userTypeFilter === 'school') {
                    return isSchoolStudent;
                }
                return true;
            });
        }

        // Sort ข้อมูล
        results = sortStudentsProgress(results);
        
        setFilteredStudentsProgress(results);
        setTotalPages(Math.ceil(results.length / itemsPerPage));
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [searchTerm, statusFilter, departmentFilter, facultyFilter, courseFilter, subjectFilter, schoolFilter, yearFilter, gradeFilter, userTypeFilter, studentsProgress, itemsPerPage, sortBy, sortOrder]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStudentsProgress.slice(indexOfFirstItem, indexOfLastItem);

    // ฟังก์ชัน sort ข้อมูล
    const sortStudentsProgress = (studentsToSort: StudentProgress[]) => {
        return [...studentsToSort].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (sortBy) {
                case 'created_at':
                    aValue = new Date(a.created_at || 0);
                    bValue = new Date(b.created_at || 0);
                    break;
                case 'progress_percentage':
                    aValue = a.progress_percentage || 0;
                    bValue = b.progress_percentage || 0;
                    break;
                case 'name':
                    aValue = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
                    bValue = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
                    break;
                default:
                    aValue = a.created_at ? new Date(a.created_at) : new Date(0);
                    bValue = b.created_at ? new Date(b.created_at) : new Date(0);
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // const StatusBadge = ({ status }: { status: StudentProgress["status"] }) => {
    //     let badgeClass = "";
    //     let statusText = "";

    //     switch (status) {
    //         case "active":
    //             badgeClass = "badge bg-success-subtle text-success rounded-pill px-3 py-1 small";
    //             statusText = "ปกติ";
    //             break;
    //         case "inactive":
    //             badgeClass = "badge bg-danger-subtle text-danger rounded-pill px-3 py-1 small";
    //             statusText = "พ้นสภาพ";
    //             break;
    //         case "pending":
    //             badgeClass = "badge bg-warning-subtle text-warning rounded-pill px-3 py-1 small";
    //             statusText = "พักการเรียน";
    //             break;
    //         default:
    //             badgeClass = "badge bg-secondary-subtle text-secondary rounded-pill px-3 py-1 small";
    //             statusText = "ไม่ระบุ";
    //             break;
    //     }
    //     return <span className={badgeClass}>{statusText}</span>;
    // };

    const ProgressBar = ({ percentage }: { percentage: number }) => {
        let colorClass = '';
        if (percentage >= 80) colorClass = 'bg-success';
        else if (percentage >= 60) colorClass = 'bg-info';
        else if (percentage >= 40) colorClass = 'bg-warning';
        else colorClass = 'bg-danger';

        return (
            <div className="progress" style={{ height: '20px' }}>
                <div 
                    className={`progress-bar ${colorClass}`} 
                    role="progressbar" 
                    style={{ width: `${percentage}%` }}
                    aria-valuenow={percentage} 
                    aria-valuemin={0} 
                    aria-valuemax={100}
                >
                    {percentage}%
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <section className="dashboard__area section-pb-120">
                <div className="container">
                    <AdminBanner />
                    <div className="dashboard__inner-wrap">
                        <div className="row">
                            <div className="dashboard__content-area col-12">
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
                    <AdminBanner />
                    <div className="dashboard__inner-wrap">
                        <div className="row">
                            <div className="dashboard__content-area col-12">
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
                <AdminBanner />
                <div className="dashboard__inner-wrap">
                    <div className="row">
                        <div className="dashboard__content-area col-12">
                            <div className="dashboard__content-main">
                                <div className="dashboard__content-header">
                                    <h2 className="dashboard__content-title">
                                        <i className="fas fa-chart-line me-2"></i>
                                        รายงานสรุปผู้เรียนที่ลงทะเบียนและความคืบหน้า
                                    </h2>
                                    <p className="dashboard__content-subtitle">
                                        แสดงข้อมูลรายละเอียดของนักศึกษามหาวิทยาลัยและนักเรียนมัธยมศึกษา พร้อมความคืบหน้าในการเรียน
                                    </p>
                                </div>

                                {/* แสดงข้อมูลแยกตามประเภทผู้เรียน */}
                                <div className="card mb-4">
                                    <div className="card-body py-3">
                                        <div className="d-flex justify-content-center">
                                            <div className="text-center">
                                                <h6 className="mb-2">
                                                    <i className="fas fa-chart-pie me-2"></i>
                                                    สรุปข้อมูลผู้เรียน
                                                </h6>
                                                <div className="d-flex gap-3 justify-content-center">
                                                    <span className="badge bg-primary fs-6">
                                                        <i className="fas fa-graduation-cap me-1"></i>
                                                        นักศึกษา: {studentsProgress.filter(s => s.student_type !== 'school').length} คน
                                                    </span>
                                                    <span className="badge bg-success fs-6">
                                                        <i className="fas fa-school me-1"></i>
                                                        นักเรียน: {studentsProgress.filter(s => s.student_type === 'school').length} คน
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Toggle สำหรับเลือกประเภทผู้เรียน */}
                                <div className="card mb-4">
                                    <div className="card-body py-3">
                                        <div className="d-flex justify-content-center">
                                            <div className="btn-group" role="group" aria-label="ประเภทผู้เรียน">
                                                <button
                                                    type="button"
                                                    className={`btn ${userTypeFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'} position-relative`}
                                                    onClick={() => {
                                                        setUserTypeFilter('all');
                                                        setSortBy('created_at');
                                                        setSortOrder('desc');
                                                    }}
                                                >
                                                    <i className="fas fa-users me-2"></i>
                                                    ทั้งหมด
                                                    <span className="badge bg-secondary ms-2">
                                                        {studentsProgress.length}
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`btn ${userTypeFilter === 'university' ? 'btn-primary' : 'btn-outline-primary'} position-relative`}
                                                    onClick={() => {
                                                        setUserTypeFilter('university');
                                                        setSortBy('created_at');
                                                        setSortOrder('desc');
                                                    }}
                                                >
                                                    <i className="fas fa-graduation-cap me-2"></i>
                                                    นักศึกษา
                                                    <span className="badge bg-secondary ms-2">
                                                        {studentsProgress.filter(s => s.student_type !== 'school').length}
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`btn ${userTypeFilter === 'school' ? 'btn-primary' : 'btn-outline-primary'} position-relative`}
                                                    onClick={() => {
                                                        setUserTypeFilter('school');
                                                        setSortBy('created_at');
                                                        setSortOrder('desc');
                                                    }}
                                                >
                                                    <i className="fas fa-school me-2"></i>
                                                    นักเรียน
                                                    <span className="badge bg-secondary ms-2">
                                                        {studentsProgress.filter(s => s.student_type === 'school').length}
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
                                        <div className="d-flex justify-content-end gap-2">
                                            <button
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setStatusFilter('all');
                                                    setDepartmentFilter('all');
                                                    setFacultyFilter('all');
                                                    setCourseFilter('all');
                                                    setSubjectFilter('all');
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
                                            <div className="col-md-2 mb-3">
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
                                            <div className="col-md-2 mb-3">
                                                <label className="form-label small">เรียงตาม</label>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={sortBy}
                                                    onChange={(e) => setSortBy(e.target.value)}
                                                >
                                                    <option value="created_at">วันที่ลงทะเบียน</option>
                                                    <option value="name">ชื่อ-นามสกุล</option>
                                                    <option value="progress_percentage">ความคืบหน้า</option>
                                                </select>
                                            </div>

                                            <div className="col-md-2 mb-3">
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
                                                    <div className="col-md-2 mb-3">
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
                                                    <div className="col-md-2 mb-3">
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
                                                    <div className="col-md-2 mb-3">
                                                        <label className="form-label small">หลักสูตร</label>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={courseFilter}
                                                            onChange={(e) => setCourseFilter(e.target.value)}
                                                        >
                                                            <option value="all">ทุกหลักสูตร</option>
                                                            {courses.map((course) => (
                                                                <option key={course.course_id} value={course.title}>
                                                                    {course.title}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="col-md-2 mb-3">
                                                        <label className="form-label small">รายวิชา</label>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={subjectFilter}
                                                            onChange={(e) => setSubjectFilter(e.target.value)}
                                                        >
                                                            <option value="all">ทุกรายวิชา</option>
                                                            {subjects.map((subject) => (
                                                                <option key={subject.subject_id} value={subject.subject_name}>
                                                                    {subject.subject_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="col-md-2 mb-3">
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
                                                    <div className="col-md-2 mb-3">
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
                                                    <div className="col-md-2 mb-3">
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
                                                <h3 className="mb-0">{filteredStudentsProgress.length}</h3>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card bg-success text-white">
                                            <div className="card-body text-center">
                                                <h5 className="card-title">นักศึกษามหาวิทยาลัย</h5>
                                                <h3 className="mb-0">
                                                    {filteredStudentsProgress.filter(s => s.student_type !== 'school').length}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card bg-info text-white">
                                            <div className="card-body text-center">
                                                <h5 className="card-title">นักเรียนมัธยม</h5>
                                                <h3 className="mb-0">
                                                    {filteredStudentsProgress.filter(s => s.student_type === 'school').length}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card bg-warning text-white">
                                            <div className="card-body text-center">
                                                <h5 className="card-title">ความคืบหน้าสูงสุด</h5>
                                                <h3 className="mb-0">
                                                    {filteredStudentsProgress.length > 0 
                                                        ? Math.max(...filteredStudentsProgress.map(s => s.progress_percentage || 0))
                                                        : 0}%
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
                                        <p className="mt-2 text-muted">กำลังโหลดข้อมูลผู้เรียน...</p>
                                    </div>
                                ) : error ? (
                                    <div className="alert alert-danger">
                                        <i className="fas fa-exclamation-circle me-2"></i>
                                        {error}
                                    </div>
                                ) : filteredStudentsProgress.length === 0 ? (
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
                                                            downloadCSV(csvContent, 'students_progress_report.csv');
                                                        }}
                                                    >
                                                        <i className="fas fa-download me-1"></i>
                                                        ดาวน์โหลด CSV
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                {/* แยกแสดงข้อมูลนักเรียนและนักศึกษา */}
                                                {(() => {
                                                    // กรองข้อมูลตาม toggle ที่เลือก
                                                    let filteredUniversityStudents = currentItems.filter(s => s.student_type !== 'school');
                                                    let filteredSchoolStudents = currentItems.filter(s => s.student_type === 'school');
                                                    
                                                    // ถ้าเลือกประเภทเฉพาะ ให้แสดงเฉพาะประเภทนั้น
                                                    if (userTypeFilter === 'university') {
                                                        filteredSchoolStudents = [];
                                                    } else if (userTypeFilter === 'school') {
                                                        filteredUniversityStudents = [];
                                                    }
                                                    
                                                    return (
                                                        <>
                                                            {/* ตารางนักศึกษามหาวิทยาลัย */}
                                                            {filteredUniversityStudents.length > 0 && (
                                                                <div className="card mb-4">
                                                                    <div className="card-header bg-primary text-white">
                                                                        <h6 className="mb-0">
                                                                            <i className="fas fa-graduation-cap me-2"></i>
                                                                            นักศึกษามหาวิทยาลัย ({filteredUniversityStudents.length} คน)
                                                                        </h6>
                                                                    </div>
                                                                    <div className="card-body p-0">
                                                                        <div className="table-responsive">
                                                                            <table className="table table-hover table-sm mb-0 align-middle">
                                                                                <thead className="table-primary">
                                                                                    <tr>
                                                                                        <th scope="col" style={{ width: '40px' }} className="border-end">#</th>
                                                                                        <th scope="col" className="border-end">ชื่อผู้เรียน</th>
                                                                                        <th scope="col" className="border-end">วิชา</th>
                                                                                        <th scope="col" className="border-end">หลักสูตร</th>
                                                                                        <th scope="col" className="border-end">คณะ - สาขา</th>
                                                                                        <th scope="col" className="border-end">ปีการศึกษา</th>
                                                                                        <th scope="col" className="border-end">วันที่ลงทะเบียน</th>
                                                                                        <th scope="col">ความคืบหน้า (%)</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {filteredUniversityStudents.map((student, index) => (
                                                                                        <tr key={`university-${student.student_id}-${index}`} className="border-bottom">
                                                                                            <td className="border-end">{indexOfFirstItem + index + 1}</td>
                                                                                            
                                                                                            {/* ชื่อผู้เรียน */}
                                                                                            <td className="border-end">
                                                                                                <div className="d-flex flex-column">
                                                                                                    <div className="fw-bold text-primary mb-1">
                                                                                                        {`${student.first_name || ''} ${student.last_name || ''}`.trim()}
                                                                                                    </div>
                                                                                                    <div className="d-flex flex-column gap-1">
                                                                                                        <div className="text-muted small">
                                                                                                            <i className="fas fa-envelope me-1"></i>{student.email}
                                                                                                        </div>
                                                                                                        <div className="text-muted small">
                                                                                                            <i className="fas fa-id-card me-1"></i>{student.student_code || 'ไม่ระบุ'}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </td>
                                                                                            
                                                                                            {/* วิชา */}
                                                                                            <td className="border-end">
                                                                                                <div className="text-center">
                                                                                                    <span className="badge bg-primary-subtle text-primary px-3 py-2">
                                                                                                        {student.subject_name || 'ไม่ระบุ'}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </td>
                                                                                            
                                                                                            {/* หลักสูตร */}
                                                                                            <td className="border-end">
                                                                                                <div className="text-center">
                                                                                                    <span className="badge bg-success-subtle text-success px-3 py-2">
                                                                                                        {student.course_title || 'ไม่ระบุ'}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </td>
                                                                                            
                                                                                            {/* คณะ - สาขา */}
                                                                                            <td className="border-end">
                                                                                                <div className="text-center">
                                                                                                    <div className="badge bg-info-subtle text-info px-3 py-2 mb-1">
                                                                                                        {student.department_faculty || 'ไม่ระบุ'}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </td>
                                                                                            
                                                                                            {/* ปีการศึกษา */}
                                                                                            <td className="border-end">
                                                                                                <div className="text-center">
                                                                                                    <span className="badge bg-secondary-subtle text-secondary px-2 py-1">
                                                                                                        {student.academic_year || 'ไม่ระบุ'}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </td>
                                                                                            
                                                                                            {/* วันที่ลงทะเบียน */}
                                                                                            <td className="border-end">
                                                                                                <div className="text-center">
                                                                                                    <div className="text-muted small">
                                                                                                        {student.created_at ? new Date(student.created_at).toLocaleDateString('th-TH', {
                                                                                                            year: 'numeric',
                                                                                                            month: 'short',
                                                                                                            day: 'numeric'
                                                                                                        }) : 'ไม่ระบุ'}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </td>
                                                                                            
                                                                                            {/* ความคืบหน้า */}
                                                                                            <td>
                                                                                                <div className="d-flex flex-column align-items-center gap-2">
                                                                                                    <ProgressBar percentage={student.progress_percentage || 0} />
                                                                                                    <div className="d-flex flex-column gap-1 text-center">
                                                                                                        <small className="text-muted">
                                                                                                            บทเรียน: {student.completed_lessons || 0}/{student.total_lessons || 0}
                                                                                                        </small>
                                                                                                        <small className="text-muted">
                                                                                                            แบบทดสอบ: {student.completed_quizzes || 0}/{student.total_quizzes || 0}
                                                                                                        </small>
                                                                                                        {student.pre_test_completed !== undefined && (
                                                                                                            <div className="d-flex gap-2 justify-content-center mt-1">
                                                                                                                <small className={`badge ${student.pre_test_completed ? 'bg-success' : 'bg-secondary'} text-white px-2 py-1`}>
                                                                                                                    Pre-test: {student.pre_test_completed ? '✓' : '✗'}
                                                                                                                </small>
                                                                                                                <small className={`badge ${student.post_test_completed ? 'bg-success' : 'bg-secondary'} text-white px-2 py-1`}>
                                                                                                                    Post-test: {student.post_test_completed ? '✓' : '✗'}
                                                                                                                </small>
                                                                                                                <small className={`badge ${student.big_lesson_quiz_completed ? 'bg-success' : 'bg-secondary'} text-white px-2 py-1`}>
                                                                                                                    Big Lesson: {student.big_lesson_quiz_completed ? '✓' : '✗'}
                                                                                                                </small>
                                                                                                            </div>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* ตารางนักเรียนมัธยม */}
                                                            {filteredSchoolStudents.length > 0 && (
                                                                <div className="card mb-4">
                                                                    <div className="card-header bg-success text-white">
                                                                        <h6 className="mb-0">
                                                                            <i className="fas fa-school me-2"></i>
                                                                            นักเรียนมัธยมศึกษา ({filteredSchoolStudents.length} คน)
                                                                        </h6>
                                                                    </div>
                                                                    <div className="card-body p-0">
                                                                        <div className="table-responsive">
                                                                            <table className="table table-hover table-sm mb-0 align-middle">
                                                                                <thead className="table-success">
                                                                                    <tr>
                                                                                        <th scope="col" style={{ width: '40px' }} className="border-end">#</th>
                                                                                        <th scope="col" className="border-end">ชื่อผู้เรียน</th>
                                                                                        <th scope="col" className="border-end">วิชา</th>
                                                                                        <th scope="col" className="border-end">หลักสูตร</th>
                                                                                        <th scope="col" className="border-end">โรงเรียน - ระดับชั้น</th>
                                                                                        <th scope="col" className="border-end">วันที่ลงทะเบียน</th>
                                                                                        <th scope="col">ความคืบหน้า (%)</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {filteredSchoolStudents.map((student, index) => (
                                                                                        <tr key={`school-${student.student_id}-${index}`} className="border-bottom">
                                                                                            <td className="border-end">{indexOfFirstItem + index + 1}</td>
                                                                                            
                                                                                            {/* ชื่อผู้เรียน */}
                                                                                            <td className="border-end">
                                                                                                <div className="d-flex flex-column">
                                                                                                    <div className="fw-bold text-success mb-1">
                                                                                                        {`${student.first_name || ''} ${student.last_name || ''}`.trim()}
                                                                                                    </div>
                                                                                                    <div className="d-flex flex-column gap-1">
                                                                                                        <div className="text-muted small">
                                                                                                            <i className="fas fa-envelope me-1"></i>{student.email}
                                                                                                        </div>
                                                                                                        <div className="text-muted small">
                                                                                                            <i className="fas fa-id-card me-1"></i>{student.student_code || 'ไม่ระบุ'}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </td>
                                                                                            
                                                                                            {/* วิชา */}
                                                                                            <td className="border-end">
                                                                                                <div className="text-center">
                                                                                                    <span className="badge bg-primary-subtle text-primary px-3 py-2">
                                                                                                        {student.subject_name || 'ไม่ระบุ'}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </td>
                                                                                            
                                                                                            {/* หลักสูตร */}
                                                                                            <td className="border-end">
                                                                                                <div className="text-center">
                                                                                                    <span className="badge bg-success-subtle text-success px-3 py-2">
                                                                                                        {student.course_title || 'ไม่ระบุ'}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </td>
                                                                                            
                                                                                            {/* โรงเรียน - ระดับชั้น */}
                                                                                            <td className="border-end">
                                                                                                <div className="text-center">
                                                                                                    <div className="badge bg-warning-subtle text-warning px-3 py-2 mb-1">
                                                                                                        {student.department_faculty || 'ไม่ระบุ'}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </td>
                                                                                            
                                                                                            {/* วันที่ลงทะเบียน */}
                                                                                            <td className="border-end">
                                                                                                <div className="text-center">
                                                                                                    <div className="text-muted small">
                                                                                                        {student.created_at ? new Date(student.created_at).toLocaleDateString('th-TH', {
                                                                                                            year: 'numeric',
                                                                                                            month: 'short',
                                                                                                            day: 'numeric'
                                                                                                        }) : 'ไม่ระบุ'}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </td>
                                                                                            
                                                                                            {/* ความคืบหน้า */}
                                                                                            <td>
                                                                                                <div className="d-flex flex-column align-items-center gap-2">
                                                                                                    <ProgressBar percentage={student.progress_percentage || 0} />
                                                                                                    <div className="d-flex flex-column gap-1 text-center">
                                                                                                        <small className="text-muted">
                                                                                                            บทเรียน: {student.completed_lessons || 0}/{student.total_lessons || 0}
                                                                                                        </small>
                                                                                                        <small className="text-muted">
                                                                                                            แบบทดสอบ: {student.completed_quizzes || 0}/{student.total_quizzes || 0}
                                                                                                        </small>
                                                                                                        {student.pre_test_completed !== undefined && (
                                                                                                            <div className="d-flex gap-2 justify-content-center mt-1">
                                                                                                                <small className={`badge ${student.pre_test_completed ? 'bg-success' : 'bg-secondary'} text-white px-2 py-1`}>
                                                                                                                    Pre-test: {student.pre_test_completed ? '✓' : '✗'}
                                                                                                                </small>
                                                                                                                <small className={`badge ${student.post_test_completed ? 'bg-success' : 'bg-secondary'} text-white px-2 py-1`}>
                                                                                                                    Post-test: {student.post_test_completed ? '✓' : '✗'}
                                                                                                                </small>
                                                                                                                <small className={`badge ${student.big_lesson_quiz_completed ? 'bg-success' : 'bg-secondary'} text-white px-2 py-1`}>
                                                                                                                    Big Lesson: {student.big_lesson_quiz_completed ? '✓' : '✗'}
                                                                                                                </small>
                                                                                                            </div>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                            {/* แสดงข้อความเมื่อไม่มีข้อมูลตามประเภทที่เลือก */}
                                            {userTypeFilter !== 'all' && filteredUniversityStudents.length === 0 && filteredSchoolStudents.length === 0 && (
                                                <div className="text-center py-5 bg-light rounded">
                                                    <i className="fas fa-user-slash fa-3x text-muted mb-3"></i>
                                                    <h5>
                                                        ไม่พบข้อมูล
                                                        {userTypeFilter === 'university' ? 'นักศึกษา' : 'นักเรียน'}
                                                    </h5>
                                                    <p className="text-muted">
                                                        {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
                                                            ? 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา'
                                                            : 'ยังไม่มีข้อมูลในประเภทที่เลือก'}
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
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
                                                แสดง {indexOfFirstItem + 1} ถึง {Math.min(indexOfLastItem, filteredStudentsProgress.length)} จาก {filteredStudentsProgress.length} รายการ
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
        const headers = [
            'ลำดับ',
            'ชื่อผู้เรียน',
            'วิชา',
            'หลักสูตร',
            'สาขา',
            'คณะ',
            'โรงเรียน',
            'วันที่ลงทะเบียน',
            'ความคืบหน้า (%)',
            'บทเรียนที่เสร็จสิ้น',
            'บทเรียนทั้งหมด',
            'แบบทดสอบที่เสร็จสิ้น',
            'แบบทดสอบทั้งหมด',
            'Pre-test',
            'Post-test',
            'Big Lesson Quiz',
            'ประเภทผู้เรียน'
        ];

        const csvRows = [headers.join(',')];

        filteredStudentsProgress.forEach((student, index) => {
            const row = [
                index + 1,
                `"${student.first_name} ${student.last_name}"`,
                student.subject_name || 'ไม่ระบุ',
                student.course_title || 'ไม่ระบุ',
                student.department_name || 'ไม่ระบุ',
                student.faculty_name || 'ไม่ระบุ',
                student.school_name || 'ไม่ระบุ',
                student.created_at ? new Date(student.created_at).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) : 'ไม่ระบุ',
                student.progress_percentage || 0,
                student.completed_lessons || 0,
                student.total_lessons || 0,
                student.completed_quizzes || 0,
                student.total_quizzes || 0,
                student.pre_test_completed ? 'เสร็จสิ้น' : 'ยังไม่เสร็จ',
                student.post_test_completed ? 'เสร็จสิ้น' : 'ยังไม่เสร็จ',
                student.big_lesson_quiz_completed ? 'เสร็จสิ้น' : 'ยังไม่เสร็จ',
                student.student_type === 'school' ? 'นักเรียน' : 'นักศึกษา'
            ];
            
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

export default StudentsProgressArea;
