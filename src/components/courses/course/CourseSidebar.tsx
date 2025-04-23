import { useState, useEffect } from "react";
import axios from 'axios';

interface ApiCourse {
  course_id: number;
  title: string;
  department_name: string;
  faculty_name: string;
  cover_image_file_id: string;
}

interface DepartmentResponse {
   success: boolean;
   departments: Department[];
 }

 interface Department {
   department_name: string;
   faculty: string;
 }
 

const CourseSidebar = ({ setCourses }: any) => {
  const apiURL = import.meta.env.VITE_API_URL;
  const [showMoreFaculty, setShowMoreFaculty] = useState(false);
  const [showMoreDepartment, setShowMoreDepartment] = useState(false);
  const [filterType, setFilterType] = useState<'faculty' | 'department'>('faculty');
  const [faculties, setFaculties] = useState<string[]>(['ทั้งหมด']);
  const [departments, setDepartments] = useState<string[]>(['ทั้งหมด']);
  const [facultySelected, setFacultySelected] = useState('');
  const [departmentSelected, setDepartmentSelected] = useState('');

  useEffect(() => {
   const fetchDepartments = async () => {
      try {
        const response = await axios.get<DepartmentResponse>(`${apiURL}/api/courses/subjects/departments/list`);
        if (response.data.success) {
          const departmentNames: string[] = response.data.departments.map(
            (dept: Department) => dept.department_name
          );
          const facultyNames: string[] = Array.from(new Set(
            response.data.departments.map((dept: Department) => dept.faculty)
          ));
          setDepartments(['ทั้งหมด', ...departmentNames]);
          setFaculties(['ทั้งหมด', ...facultyNames]);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();
  }, [apiURL]);

  const handleFilterTypeChange = (type: 'faculty' | 'department') => {
    setFilterType(type);
    setFacultySelected('');
    setDepartmentSelected('');
    filterCourses({ faculty: '', department: '' });
  };

  const handleSelection = (value: string) => {
    if (filterType === 'faculty') {
      const newValue = value === facultySelected ? '' : value;
      setFacultySelected(newValue);
      filterCourses({ faculty: newValue === 'ทั้งหมด' ? '' : newValue });
    } else {
      const newValue = value === departmentSelected ? '' : value;
      setDepartmentSelected(newValue);
      filterCourses({ department: newValue === 'ทั้งหมด' ? '' : newValue });
    }
  };

  const filterCourses = async ({ faculty, department }: { faculty?: string, department?: string }) => {
    try {
      const params = new URLSearchParams();
      if (faculty) {
        params.append('faculty', faculty);
      }
      if (department) {
        params.append('department', department);
      }

      const response = await axios.get(`${apiURL}/api/courses?${params}`);
      if (response.data.success) {
        const formattedCourses = response.data.courses.map((course: ApiCourse) => ({
          id: course.course_id,
          title: course.title,
          department_name: course.department_name,
          faculty_name: course.faculty_name,
          thumb: course.cover_image_file_id 
            ? `${apiURL}/api/courses/image/${course.cover_image_file_id}`
            : "/assets/img/courses/course_thumb01.jpg",
        }));
        setCourses(formattedCourses);
      }
    } catch (error) {
      console.error('Error filtering courses:', error);
    }
  };

  const itemsToShow = filterType === 'faculty' 
    ? (showMoreFaculty ? faculties : faculties.slice(0, 8))
    : (showMoreDepartment ? departments : departments.slice(0, 8));

  return (
    <div className="col-xl-3 col-lg-4">
      <aside className="courses__sidebar">
        <div className="courses-widget">
          <div className="filter-type-selector mb-4">
            <div className="btn-group w-100" role="group">
              <button 
                className={`btn ${filterType === 'faculty' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleFilterTypeChange('faculty')}
              >
                คณะ
              </button>
              <button 
                className={`btn ${filterType === 'department' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleFilterTypeChange('department')}
              >
                สาขา
              </button>
            </div>
          </div>

          <h4 className="widget-title">
            {filterType === 'faculty' ? 'คณะ' : 'สาขา'}
          </h4>
          
          <div className="courses-cat-list">
            <ul className="list-wrap">
              {itemsToShow.map((item, i) => (
                <li key={i}>
                  <div onClick={() => handleSelection(item)} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={item === (filterType === 'faculty' ? facultySelected : departmentSelected) || 
                              (item === 'ทั้งหมด' && !(filterType === 'faculty' ? facultySelected : departmentSelected))}
                      readOnly
                      id={`filter_${i}`}
                    />
                    <label className="form-check-label" htmlFor={`filter_${i}`}>
                      {item}
                    </label>
                  </div>
                </li>
              ))}
            </ul>
            <div className="show-more">
              <a
                className={`show-more-btn ${filterType === 'faculty' ? showMoreFaculty : showMoreDepartment ? 'active' : ''}`}
                style={{ cursor: "pointer" }}
                onClick={() => filterType === 'faculty' 
                  ? setShowMoreFaculty(!showMoreFaculty)
                  : setShowMoreDepartment(!showMoreDepartment)}
              >
                {(filterType === 'faculty' ? showMoreFaculty : showMoreDepartment) 
                  ? "แสดงน้อยลง -" 
                  : "แสดงเพิ่มเติม +"}
              </a>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default CourseSidebar;
