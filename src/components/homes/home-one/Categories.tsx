import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Department {
  department_id: number;
  department_name: string;
  faculty: string;
  course_count: number;
}

const departmentIcons: { [key: string]: string } = {
  'คณะวิทยาศาสตร์': 'skillgro-calculator',
  'คณะเทคโนโลยีสารสนเทศ': 'skillgro-computer',
  'คณะวิทยาการจัดการ': 'skillgro-taxes',
  'คณะรัฐประศาสนศาสตร์และรัฐศาสตร์': 'skillgro-mortarboard',
  'คณะศิลปกรรมศาสตร์และภาษา': 'skillgro-book',
  'คณะเทคโนโลยีการเกษตรและสัตวแพทยศาสตร์': 'skillgro-plant',
  'คณะสาธารณสุขศาสตร์และเทคโนโลยีสุขภาพ': 'skillgro-heart',
  'ศูนย์การศึกษาสำหรับผู้ใหญ่': 'skillgro-audio-book',
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
  const [faculties, setFaculties] = useState<Department[]>([]);
  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${apiURL}/api/courses/subjects/departments/list`);
        if (response.data.success) {
          const allDepartments: Department[] = response.data.departments;

          // ✅ รวมภาควิชาในคณะเดียวกันให้เหลือคณะเดียว และรวม course_count
          const uniqueFaculties = Object.values(
            allDepartments.reduce((acc, curr) => {
              if (!acc[curr.faculty]) {
                acc[curr.faculty] = { ...curr };
              } else {
                acc[curr.faculty].course_count += curr.course_count;
              }
              return acc;
            }, {} as { [faculty: string]: Department })
          );

          setFaculties(uniqueFaculties);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, [apiURL]);

  return (
    <section className="categories-area section-py-120">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-5 col-lg-7">
            <div className="section__title text-center mb-40">
              <span className="sub-title">หมวดหมู่ที่ได้รับความนิยม</span>
              <h2 className="title">หมวดหมู่หลักสูตร</h2>
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
                      <Link to="/courses">
                        <div className="icon">
                          <i className={departmentIcons[faculty.faculty] || 'flaticon-education'}></i>
                        </div>
                        <span className="name">{faculty.faculty}</span>

                      </Link>
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
