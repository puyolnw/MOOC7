import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminBanner from "../../dashboard-common/AdminBanner";

// Interface สำหรับข้อมูลผู้เรียนที่เรียนสำเร็จ
interface StudentComplete {
    student_id: number;
    user_id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    status: 'active' | 'inactive' | 'pending';
    student_code: string;
    department_id: number;
    course_id: number;
    subject_id: number;
    education_level: string;
    department_name?: string;
    faculty_name?: string;
    course_name?: string;
    subject_name?: string;
    academic_year?: number;
    school_name?: string;
    study_program?: string;
    grade_level?: string;
    registration_date: string;
    completion_date: string;
    student_type: string;
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

const StudentsCompleteArea: React.FC = () => {
    const apiURL = import.meta.env.VITE_API_URL;
    const [studentsComplete, setStudentsComplete] = useState<StudentComplete[]>([]);
    const [filteredStudentsComplete, setFilteredStudentsComplete] = useState<StudentComplete[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [courseFilter, setCourseFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [schoolFilter, setSchoolFilter] = useState('all');
    const [semesterFilter, setSemesterFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [userTypeFilter, setUserTypeFilter] = useState('all');
    const [sortBy, setSortBy] = useState('completion_date');
    const [sortOrder, setSortOrder] = useState('desc');

    // ดึงข้อมูลผู้เรียนที่เรียนสำเร็จ
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

                // ดึงข้อมูลผู้เรียนที่เรียนสำเร็จ
                const studentsCompleteResponse = await axios.get(`${apiURL}/api/accounts/students/complete/report`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (studentsCompleteResponse.data.success) {
                    const allStudentsComplete = studentsCompleteResponse.data.students_complete.map((student: any) => ({
                        student_id: student.student_id,
                        user_id: student.user_id,
                        username: student.username,
                        first_name: student.first_name,
                        last_name: student.last_name,
                        email: student.email,
                        status: student.status,
                        student_code: student.student_code,
                        department_id: student.department_id,
                        course_id: student.course_id,
                        subject_id: student.subject_id,
                        education_level: student.education_level,
                        department_name: student.department_name,
                        faculty_name: student.faculty_name,
                        course_name: student.course_name,
                        subject_name: student.subject_name,
                        academic_year: student.academic_year,
                        school_name: student.school_name,
                        study_program: student.study_program,
                        grade_level: student.grade_level,
                        registration_date: student.registration_date,
                        completion_date: student.completion_date,
                        student_type: student.student_type,
                        department_faculty: student.department_faculty || `${student.department_name || ''} - ${student.faculty_name || ''}`.trim(),
                    }));

                    setStudentsComplete(allStudentsComplete);
                    setFilteredStudentsComplete(allStudentsComplete);
                    setTotalPages(Math.ceil(allStudentsComplete.length / itemsPerPage));
                } else {
                    setError('ไม่สามารถดึงข้อมูลผู้เรียนที่เรียนสำเร็จได้');
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
        let results = studentsComplete;

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
                    (student.subject_name || '').toLowerCase().includes(searchLower) ||
                    (student.course_name || '').toLowerCase().includes(searchLower) ||
                    (student.department_name || '').toLowerCase().includes(searchLower) ||
                    (student.faculty_name || '').toLowerCase().includes(searchLower) ||
                    (student.school_name || '').toLowerCase().includes(searchLower)
            );
        }

        // กรองตามวิชา
        if (subjectFilter !== 'all') {
            results = results.filter(student => student.subject_name === subjectFilter);
        }

        // กรองตามหลักสูตร
        if (courseFilter !== 'all') {
            results = results.filter(student => student.course_name === courseFilter);
        }

        // กรองตามสาขา/คณะ
        if (departmentFilter !== 'all') {
            results = results.filter(student => student.department_faculty === departmentFilter);
        }

        // กรองตามโรงเรียน
        if (schoolFilter !== 'all') {
            results = results.filter(student => student.school_name === schoolFilter);
        }

        // กรองตามภาคการศึกษา
        if (semesterFilter !== 'all') {
            results = results.filter(student => String(student.academic_year) === semesterFilter);
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
        results = sortStudentsComplete(results);
        
        setFilteredStudentsComplete(results);
        setTotalPages(Math.ceil(results.length / itemsPerPage));
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [searchTerm, subjectFilter, courseFilter, departmentFilter, schoolFilter, semesterFilter, userTypeFilter, studentsComplete, itemsPerPage, sortBy, sortOrder]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStudentsComplete.slice(indexOfFirstItem, indexOfLastItem);

    // ฟังก์ชัน sort ข้อมูล
    const sortStudentsComplete = (studentsToSort: StudentComplete[]) => {
        return [...studentsToSort].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (sortBy) {
                case 'completion_date':
                    aValue = new Date(a.completion_date || 0);
                    bValue = new Date(b.completion_date || 0);
                    break;
                case 'registration_date':
                    aValue = new Date(a.registration_date || 0);
                    bValue = new Date(b.registration_date || 0);
                    break;
                case 'name':
                    aValue = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
                    bValue = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
                    break;
                default:
                    aValue = a.completion_date ? new Date(a.completion_date) : new Date(0);
                    bValue = b.completion_date ? new Date(b.completion_date) : new Date(0);
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
                                        <i className="fas fa-graduation-cap me-2"></i>
                                        รายงานสรุปผู้เรียนที่สำเร็จการศึกษา
                                    </h2>
                                    <p className="dashboard__content-subtitle">
                                        แสดงข้อมูลรายละเอียดของนักศึกษามหาวิทยาลัยและนักเรียนมัธยมศึกษาที่เรียนจบแล้ว
                                    </p>
                                </div>

                                {/* แสดงข้อมูลแยกตามประเภทผู้เรียน */}
                                <div className="card mb-4">
                                    <div className="card-body py-3">
                                        <div className="d-flex justify-content-center">
                                            <div className="text-center">
                                                <h6 className="mb-2">
                                                    <i className="fas fa-chart-pie me-2"></i>
                                                    สรุปข้อมูลผู้เรียนที่สำเร็จการศึกษา
                                                </h6>
                                                <div className="d-flex gap-3 justify-content-center">
                                                    <span className="badge bg-primary fs-6">
                                                        <i className="fas fa-graduation-cap me-1"></i>
                                                        นักศึกษา: {studentsComplete.filter(s => s.student_type !== 'school').length} คน
                                                    </span>
                                                    <span className="badge bg-success fs-6">
                                                        <i className="fas fa-school me-1"></i>
                                                        นักเรียน: {studentsComplete.filter(s => s.student_type === 'school').length} คน
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
                                                        setSortBy('completion_date');
                                                        setSortOrder('desc');
                                                    }}
                                                >
                                                    <i className="fas fa-users me-2"></i>
                                                    ทั้งหมด
                                                    <span className="badge bg-secondary ms-2">
                                                        {studentsComplete.length}
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`btn ${userTypeFilter === 'university' ? 'btn-primary' : 'btn-outline-primary'} position-relative`}
                                                    onClick={() => {
                                                        setUserTypeFilter('university');
                                                        setSortBy('completion_date');
                                                        setSortOrder('desc');
                                                    }}
                                                >
                                                    <i className="fas fa-graduation-cap me-2"></i>
                                                    นักศึกษา
                                                    <span className="badge bg-secondary ms-2">
                                                        {studentsComplete.filter(s => s.student_type !== 'school').length}
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`btn ${userTypeFilter === 'school' ? 'btn-primary' : 'btn-outline-primary'} position-relative`}
                                                    onClick={() => {
                                                        setUserTypeFilter('school');
                                                        setSortBy('completion_date');
                                                        setSortOrder('desc');
                                                    }}
                                                >
                                                    <i className="fas fa-school me-2"></i>
                                                    นักเรียน
                                                    <span className="badge bg-secondary ms-2">
                                                        {studentsComplete.filter(s => s.student_type === 'school').length}
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
                                                    setSubjectFilter('all');
                                                    setCourseFilter('all');
                                                    setDepartmentFilter('all');
                                                    setSchoolFilter('all');
                                                    setSemesterFilter('all');
                                                    setUserTypeFilter('all');
                                                    setSortBy('completion_date');
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
                                            {/* Sort Controls */}
                                            <div className="col-md-2 mb-3">
                                                <label className="form-label small">เรียงตาม</label>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={sortBy}
                                                    onChange={(e) => setSortBy(e.target.value)}
                                                >
                                                    <option value="completion_date">วันที่เรียนเสร็จ</option>
                                                    <option value="registration_date">วันที่ลงทะเบียน</option>
                                                    <option value="name">ชื่อ-นามสกุล</option>
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
                                                        <label className="form-label small">สาขา/คณะ</label>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={departmentFilter}
                                                            onChange={(e) => setDepartmentFilter(e.target.value)}
                                                        >
                                                            <option value="all">ทุกสาขา/คณะ</option>
                                                            {[...new Set(studentsComplete.filter(s => s.student_type !== 'school').map(s => s.department_faculty).filter(Boolean))].map((dept) => (
                                                                <option key={dept} value={dept}>
                                                                    {dept}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="col-md-2 mb-3">
                                                        <label className="form-label small">ปีการศึกษา</label>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={semesterFilter}
                                                            onChange={(e) => setSemesterFilter(e.target.value)}
                                                        >
                                                            <option value="all">ทุกปี</option>
                                                            {[...new Set(studentsComplete.filter(s => s.student_type !== 'school').map(s => s.academic_year).filter(Boolean))].sort((a, b) => (b as number) - (a as number)).map((year) => (
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
                                                            {[...new Set(studentsComplete.filter(s => s.student_type === 'school').map(s => s.school_name).filter(Boolean))].map((school) => (
                                                                <option key={school} value={school}>
                                                                    {school}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </>
                                            )}

                                            {/* Universal filters */}
                                            <div className="col-md-2 mb-3">
                                                <label className="form-label small">วิชา</label>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={subjectFilter}
                                                    onChange={(e) => setSubjectFilter(e.target.value)}
                                                >
                                                    <option value="all">ทุกวิชา</option>
                                                    {[...new Set(studentsComplete.map(s => s.subject_name).filter(Boolean))].map((subject) => (
                                                        <option key={subject} value={subject}>
                                                            {subject}
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
                                                    {[...new Set(studentsComplete.map(s => s.course_name).filter(Boolean))].map((course) => (
                                                        <option key={course} value={course}>
                                                            {course}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* สรุปข้อมูล */}
                                <div className="row mb-4">
                                    <div className="col-md-3">
                                        <div className="card bg-primary text-white">
                                            <div className="card-body text-center">
                                                <h5 className="card-title">จำนวนทั้งหมด</h5>
                                                <h3 className="mb-0">{filteredStudentsComplete.length}</h3>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card bg-success text-white">
                                            <div className="card-body text-center">
                                                <h5 className="card-title">นักศึกษามหาวิทยาลัย</h5>
                                                <h3 className="mb-0">
                                                    {filteredStudentsComplete.filter(s => s.student_type !== 'school').length}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card bg-info text-white">
                                            <div className="card-body text-center">
                                                <h5 className="card-title">นักเรียนมัธยม</h5>
                                                <h3 className="mb-0">
                                                    {filteredStudentsComplete.filter(s => s.student_type === 'school').length}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card bg-warning text-white">
                                            <div className="card-body text-center">
                                                <h5 className="card-title">ล่าสุด</h5>
                                                <h3 className="mb-0">
                                                    {filteredStudentsComplete.length > 0 
                                                        ? new Date(Math.max(...filteredStudentsComplete.map(s => new Date(s.completion_date).getTime()))).toLocaleDateString('th-TH', {
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })
                                                        : 'ไม่มี'}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {filteredStudentsComplete.length === 0 ? (
                                    <div className="text-center py-5 bg-light rounded">
                                        <i className="fas fa-user-slash fa-3x text-muted mb-3"></i>
                                        <h5>
                                            ไม่พบข้อมูล
                                            {userTypeFilter === 'university'
                                                ? 'นักศึกษา'
                                                : userTypeFilter === 'school'
                                                    ? 'นักเรียน'
                                                    : 'ผู้เรียน'}
                                            ที่เรียนสำเร็จ
                                        </h5>
                                        <p className="text-muted">
                                            {searchTerm || subjectFilter !== 'all' || courseFilter !== 'all' || userTypeFilter !== 'all'
                                                ? 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา'
                                                : 'ยังไม่มีข้อมูลผู้เรียนที่เรียนสำเร็จในระบบ'}
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
                                                            downloadCSV(csvContent, 'students_complete_report.csv');
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
                                                                                        <th scope="col" className="border-end">สาขา/คณะ</th>
                                                                                        <th scope="col" className="border-end">ปีการศึกษา</th>
                                                                                        <th scope="col" className="border-end text-nowrap" style={{ minWidth: '140px', width: '140px', maxWidth: '140px' }}>วันที่ลงทะเบียน</th>
                                                                                        <th scope="col" className="border-end text-nowrap" style={{ minWidth: '140px', width: '140px', maxWidth: '140px' }}>วันที่เรียนเสร็จ</th>
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
                                                                                                        {student.course_name || 'ไม่ระบุ'}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </td>
                                                                                            
                                                                                            {/* สาขา/คณะ */}
                                                                                            <td className="border-end">
                                                                                                <div className="text-center">
                                                                                                    <div className="badge bg-info-subtle text-info px-3 py-2 mb-1">
                                                                                                        {student.department_faculty || 'ไม่ระบุ'}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </td>
                                                                                            
                                                                                            {/* ภาคการศึกษา */}
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
                                                                                                        {student.registration_date ? new Date(student.registration_date).toLocaleDateString('th-TH', {
                                                                                                            year: 'numeric',
                                                                                                            month: 'short',
                                                                                                            day: 'numeric'
                                                                                                        }) : 'ไม่ระบุ'}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </td>
                                                                                            
                                                                                            {/* วันที่เรียนเสร็จ */}
                                                                                            <td>
                                                                                                <div className="text-center">
                                                                                                    <div className="text-success fw-bold small">
                                                                                                        {student.completion_date ? new Date(student.completion_date).toLocaleDateString('th-TH', {
                                                                                                            year: 'numeric',
                                                                                                            month: 'short',
                                                                                                            day: 'numeric'
                                                                                                        }) : 'ไม่ระบุ'}
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
                                                                                        <th scope="col" className="border-end">โรงเรียน</th>
                                                                                        <th scope="col" className="text-nowrap" style={{ minWidth: '140px', width: '140px', maxWidth: '140px' }}>วันที่ลงทะเบียน</th>
                                                                                        <th scope="col" className="text-nowrap" style={{ minWidth: '140px', width: '140px', maxWidth: '140px' }}>วันที่เรียนเสร็จ</th>
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
                                                                                                        {student.course_name || 'ไม่ระบุ'}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </td>
                                                                                            
                                                                                            {/* โรงเรียน */}
                                                                                            <td className="border-end">
                                                                                                <div className="text-center">
                                                                                                    <div className="badge bg-warning-subtle text-warning px-3 py-2 mb-1">
                                                                                                        {student.school_name || 'ไม่ระบุ'}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </td>
                                                                                            
                                                                                            {/* วันที่ลงทะเบียน */}
                                                                                            <td className="border-end">
                                                                                                <div className="text-center">
                                                                                                    <div className="text-muted small">
                                                                                                        {student.registration_date ? new Date(student.registration_date).toLocaleDateString('th-TH', {
                                                                                                            year: 'numeric',
                                                                                                            month: 'short',
                                                                                                            day: 'numeric'
                                                                                                        }) : 'ไม่ระบุ'}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </td>
                                                                                            
                                                                                            {/* วันที่เรียนเสร็จ */}
                                                                                            <td>
                                                                                                <div className="text-center">
                                                                                                    <div className="text-success fw-bold small">
                                                                                                        {student.completion_date ? new Date(student.completion_date).toLocaleDateString('th-TH', {
                                                                                                            year: 'numeric',
                                                                                                            month: 'short',
                                                                                                            day: 'numeric'
                                                                                                        }) : 'ไม่ระบุ'}
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
                                                                        ที่เรียนสำเร็จ
                                                                    </h5>
                                                                    <p className="text-muted">
                                                                        {searchTerm || subjectFilter !== 'all' || courseFilter !== 'all'
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
                                                แสดง {indexOfFirstItem + 1} ถึง {Math.min(indexOfLastItem, filteredStudentsComplete.length)} จาก {filteredStudentsComplete.length} รายการ
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
            'สาขา/คณะ',
            'โรงเรียน',
            'ปีการศึกษา',
            'วันที่ลงทะเบียน',
            'วันที่เรียนเสร็จ',
            'ประเภทผู้เรียน'
        ];

        const csvRows = [headers.join(',')];

        filteredStudentsComplete.forEach((student, index) => {
            const row = [
                index + 1,
                `"${student.first_name} ${student.last_name}"`,
                student.subject_name || 'ไม่ระบุ',
                student.course_name || 'ไม่ระบุ',
                student.department_faculty || 'ไม่ระบุ',
                student.school_name || 'ไม่ระบุ',
                student.academic_year || 'ไม่ระบุ',
                student.registration_date ? new Date(student.registration_date).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) : 'ไม่ระบุ',
                student.completion_date ? new Date(student.completion_date).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) : 'ไม่ระบุ',
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

export default StudentsCompleteArea;
