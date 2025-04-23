import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Department {
  department_id: number;
  department_name: string;
  course_count: number;
}

const departmentIcons: { [key: string]: string } = {
   'วิทยาการคอมพิวเตอร์': 'skillgro-browser',
   'คณิตศาสตร์': 'skillgro-calculator',
   'เทคโนโลยีสารสนเทศ': 'skillgro-computer',
   'ธุรกิจดิจิทัล': 'skillgro-financial-profit',
   'เศรษฐศาสตร์': 'skillgro-taxes',
   'การบริหารจัดการท้องถิ่น': 'skillgro-development-plan',
   'รัฐประศาสนศาสตร์': 'skillgro-notepad',
   'รัฐศาสตร์': 'skillgro-mortarboard',
   'นิติศาสตร์': 'skillgro-text-file',
   'ศิลปกรรมศาสตร์': 'skillgro-vector',
   'ภาษาไทยเพื่อการสื่อสาร': 'skillgro-book',
   'เทคนิคสัตวแพทย์': 'skillgro-microscope',
   'เทคโนโลยีการเกษตร': 'skillgro-plant',
   'เทคโนโลยีไฟฟ้า': 'skillgro-smart-watch',
   'วิศวกรรมคอมพิวเตอร์': 'skillgro-coding',
   'เทคโนโลยีคอมพิวเตอร์': 'skillgro-web-programming',
   'เทคโนโลยีชีวภาพ': 'skillgro-dna',
   'สาธารณสุขชุมชน': 'skillgro-happy-face',
   'สถิติประยุกต์': 'skillgro-presentation',
   'ชีววิทยา': 'skillgro-research',
   'ปราชญ์ชาวบ้าน': 'skillgro-lotus',
   'หลักสูตรแบบชุดวิชา': 'skillgro-audio-book',
   'การบริหารการพัฒนา': 'skillgro-strategy',
   'เทคโนโลยีคอมพิวเตอร์และดิจิทัล': 'skillgro-innovation',
   'เทคโนโลยีสารสนเทศการเกษตร': 'skillgro-agriculture',
   'เทคนิคสัตวแพทย์และการพยาบาลสัตว์': 'skillgro-heart',
   'ปราชญ์ชาวบ้านและภูมิปัญญาท้องถิ่น': 'skillgro-culture'
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
    '1500': {
      slidesPerView: 6,
    },
    '1200': {
      slidesPerView: 5,
    },
    '992': {
      slidesPerView: 4,
      spaceBetween: 30,
    },
    '768': {
      slidesPerView: 3,
      spaceBetween: 25,
    },
    '576': {
      slidesPerView: 2,
    },
    '0': {
      slidesPerView: 2,
      spaceBetween: 20,
    },
  },
};

const Categories = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const apiURL = import.meta.env.VITE_API_URL;
 
 
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${apiURL}/api/courses/subjects/departments/list`);
        if (response.data.success) {
          setDepartments(response.data.departments);
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
                {departments.map((dept) => (
                  <SwiperSlide key={dept.department_id} className="swiper-slide">
                    <div className="categories__item">
                      <Link to="/courses">
                        <div className="icon">
                          <i className={departmentIcons[dept.department_name] || 'flaticon-education'}></i>
                        </div>
                        <span className="name">{dept.department_name}</span>
                        <span className="courses">{dept.course_count} หลักสูตร</span>
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
