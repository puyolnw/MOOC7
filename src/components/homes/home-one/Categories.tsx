import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Faculty {
  faculty: string;
  course_count: number;
}

// กำหนดไอคอนสำหรับแต่ละคณะ
// กำหนดไอคอนสำหรับแต่ละคณะที่เหมาะสมจากไฟล์ flaticon-skillgro-new.css
const facultyIcons: { [key: string]: string } = {
  'คณะวิทยาศาสตร์': 'skillgro-atom', // ไอคอนอะตอม เหมาะกับวิทยาศาสตร์
  'คณะเทคโนโลยีสารสนเทศ': 'skillgro-web-programming', // ไอคอนเว็บโปรแกรมมิ่ง เหมาะกับ IT
  'คณะวิทยาการจัดการ': 'skillgro-investment', // ไอคอนการลงทุน เหมาะกับการจัดการ
  'คณะรัฐศาสตร์และรัฐประศาสนศาสตร์': 'skillgro-law', // ไอคอนกฎหมาย เหมาะกับรัฐศาสตร์
  'คณะนิติศาสตร์': 'skillgro-text-file', // ไอคอนไฟล์ข้อความ เหมาะกับนิติศาสตร์
  'คณะมนุษยศาสตร์และสังคมศาสตร์': 'skillgro-book-2', // ไอคอนหนังสือ เหมาะกับมนุษยศาสตร์
  'คณะเทคโนโลยีการเกษตร': 'skillgro-lotus-flower', // ไอคอนดอกบัว ใกล้เคียงกับการเกษตร
  'คณะวิศวกรรมศาสตร์': 'skillgro-development', // ไอคอนการพัฒนา เหมาะกับวิศวกรรม
  'คณะวิทยาศาสตร์และเทคโนโลยี': 'skillgro-bulb', // ไอคอนหลอดไฟ เหมาะกับวิทยาศาสตร์และเทคโนโลยี
  'ศูนย์สหกิจศึกษา': 'skillgro-development-plan', // ไอคอนแผนการพัฒนา เหมาะกับสหกิจศึกษา
  'คณะครุศาสตร์': 'skillgro-mortarboard', // ไอคอนหมวกรับปริญญา เหมาะกับครุศาสตร์
  'คณะพยาบาลศาสตร์': 'skillgro-heart-2', // ไอคอนหัวใจ เหมาะกับพยาบาล
  'คณะสัตวแพทยศาสตร์': 'skillgro-tooth', // ไอคอนฟัน ใกล้เคียงกับสัตวแพทย์
  'คณะเภสัชศาสตร์': 'skillgro-stone', // ไอคอนหิน ใกล้เคียงกับเภสัชศาสตร์
  'คณะสาธารณสุขศาสตร์': 'skillgro-heart', // ไอคอนหัวใจ เหมาะกับสาธารณสุข
  'คณะทันตแพทยศาสตร์': 'skillgro-tooth', // ไอคอนฟัน เหมาะกับทันตแพทย์
  'คณะแพทยศาสตร์': 'skillgro-brain', // ไอคอนสมอง เหมาะกับแพทย์
  'คณะศิลปกรรมศาสตร์': 'skillgro-vector', // ไอคอนเวกเตอร์ เหมาะกับศิลปกรรม
  'คณะสถาปัตยกรรมศาสตร์': 'skillgro-customize', // ไอคอนการปรับแต่ง เหมาะกับสถาปัตยกรรม
  'คณะบริหารธุรกิจ': 'skillgro-profit', // ไอคอนกำไร เหมาะกับบริหารธุรกิจ
  'คณะบัญชี': 'skillgro-taxes', // ไอคอนภาษี เหมาะกับบัญชี
  'คณะนิเทศศาสตร์': 'skillgro-marketing', // ไอคอนการตลาด เหมาะกับนิเทศศาสตร์
  'คณะเศรษฐศาสตร์': 'skillgro-financial-profit', // ไอคอนกำไรทางการเงิน เหมาะกับเศรษฐศาสตร์
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

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await axios.get(`${apiURL}/api/courses/subjects/departments/list`);
        if (response.data.success) {
          const allDepartments = response.data.departments;

          // รวมภาควิชาในคณะเดียวกันให้เหลือคณะเดียว และรวม course_count
          const facultiesMap: { [faculty: string]: Faculty } = {};
          
          allDepartments.forEach((dept: any) => {
            if (!facultiesMap[dept.faculty]) {
              facultiesMap[dept.faculty] = {
                faculty: dept.faculty,
                course_count: dept.course_count || 0
              };
            } else {
              facultiesMap[dept.faculty].course_count += (dept.course_count || 0);
            }
          });
          
          // แปลงเป็น array
          const uniqueFaculties = Object.values(facultiesMap);
          
          setFaculties(uniqueFaculties);
        }
      } catch (error) {
        console.error('Error fetching faculties:', error);
      }
    };

    fetchFaculties();
  }, [apiURL]);

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
                      <Link to="/courses">
                        <div className="icon">
                          <i className={facultyIcons[faculty.faculty] || 'flaticon-education'}></i>
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
