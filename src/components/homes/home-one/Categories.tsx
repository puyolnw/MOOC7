import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useFaculty } from '../../../hooks/useFaculty';

interface Faculty {
  faculty: string;
  course_count: number;
}

const facultyIcons: { [key: string]: string } = {
  'คณะวิทยาศาสตร์': 'skillgro-atom',
  'คณะเทคโนโลยีสารสนเทศ': 'skillgro-web-programming',
  'คณะวิทยาการจัดการ': 'skillgro-investment',
  'คณะรัฐศาสตร์และรัฐประศาสนศาสตร์': 'skillgro-law',
  'คณะนิติศาสตร์': 'skillgro-text-file',
  'คณะมนุษยศาสตร์และสังคมศาสตร์': 'skillgro-book-2',
  'คณะเทคโนโลยีการเกษตร': 'skillgro-lotus-flower',
  'คณะวิศวกรรมศาสตร์': 'skillgro-development',
  'คณะวิทยาศาสตร์และเทคโนโลยี': 'skillgro-bulb',
  'ศูนย์สหกิจศึกษา': 'skillgro-development-plan',
  'คณะครุศาสตร์': 'skillgro-mortarboard',
  'คณะพยาบาลศาสตร์': 'skillgro-heart-2',
  'คณะสัตวแพทยศาสตร์': 'skillgro-tooth',
  'คณะเภสัชศาสตร์': 'skillgro-stone',
  'คณะสาธารณสุขศาสตร์': 'skillgro-heart',
  'คณะทันตแพทยศาสตร์': 'skillgro-tooth',
  'คณะแพทยศาสตร์': 'skillgro-brain',
  'คณะศิลปกรรมศาสตร์': 'skillgro-vector',
  'คณะสถาปัตยกรรมศาสตร์': 'skillgro-customize',
  'คณะบริหารธุรกิจ': 'skillgro-profit',
  'คณะบัญชี': 'skillgro-taxes',
  'คณะนิเทศศาสตร์': 'skillgro-marketing',
  'คณะเศรษฐศาสตร์': 'skillgro-financial-profit',
};

const setting = {
  slidesPerView: 6,
  spaceBetween: 44,
  loop: true,
  navigation: {
    nextEl: '.categories-button-next',
    prevEl: '.categories-button-prev',
  },
  breakpoints: {
    '1500': { slidesPerView: 6 },
    '1200': { slidesPerView: 5 },
    '992': { slidesPerView: 4, spaceBetween: 30 },
    '768': { slidesPerView: 3, spaceBetween: 25 },
    '576': { slidesPerView: 2 },
    '0': { slidesPerView: 2, spaceBetween: 20 },
  },
};

const Categories = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const apiURL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const { setSelectedFaculty } = useFaculty();

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await axios.get(`${apiURL}/api/courses/subjects/departments/list`);
        if (response.data.success) {
          const allDepartments = response.data.departments;
          const facultiesMap: { [faculty: string]: Faculty } = {};
          
          allDepartments.forEach((dept: any) => {
            if (!facultiesMap[dept.faculty]) {
              facultiesMap[dept.faculty] = {
                faculty: dept.faculty,
                course_count: dept.course_count || 0,
              };
            } else {
              facultiesMap[dept.faculty].course_count += (dept.course_count || 0);
            }
          });
          
          const uniqueFaculties = Object.values(facultiesMap);
          setFaculties(uniqueFaculties);
        }
      } catch (error) {
        console.error('Error fetching faculties:', error);
      }
    };

    fetchFaculties();
  }, [apiURL]);

  const handleFacultyClick = (faculty: string) => {
    setSelectedFaculty(faculty);
    navigate(`/courses?faculty=${encodeURIComponent(faculty)}`);
  };

  return (
    <section className="categories-area section-py-120">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-5 col-lg-7">
            <div className="section__title text-center mb-40">
              <span className="sub-title">หมวดหมู่ที่ได้รับความนิยม</span>
              <h2 className="title">หมวดหมู่ที่เปิดสอน</h2>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="categories__wrap">
              <Swiper {...setting} modules={[Navigation]} className="swiper categories-active">
                {faculties.map((faculty) => (
                  <SwiperSlide key={faculty.faculty} className="swiper-slide">
                    <div className="categories__item">
                      <div
                        className="shine__animate-link"
                        onClick={() => handleFacultyClick(faculty.faculty)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="icon">
                          <i className={facultyIcons[faculty.faculty] || 'flaticon-education'}></i>
                        </div>
                        <span className="name">{faculty.faculty}</span>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="categories__nav">
                <button className="categories-button-prev">
                  <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 7L1 7M1 7L7 1M1 7L7 13" stroke="#161439" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button className="categories-button-next">
                  <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 7L15 7M15 7L9 1M15 7L9 13" stroke="#161439" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;