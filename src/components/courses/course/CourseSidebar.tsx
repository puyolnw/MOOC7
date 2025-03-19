import { useState } from "react";
import { useSelector } from "react-redux";
import { Rating } from 'react-simple-star-rating';
import { selectCourses } from "../../../redux/features/courseSlice";

interface FilterCriteria {
   category: string;
   language: string;
   price: string;
   rating: number | null;
   skill: string;
   instructor: string;
}

const CourseSidebar = ({ setCourses }: any) => {

   const [showMoreCategory, setShowMoreCategory] = useState(false);
  // const [showMoreLanguage, setShowMoreLanguage] = useState(false);
   const [showMoreInstructor, setShowMoreInstructor] = useState(false);

   const [categorySelected, setCategorySelected] = useState('');
   const [languageSelected] = useState('');
   const [priceSelected] = useState('');
   const [skillSelected] = useState('');
   const [instructorSelected, setInstructorSelected] = useState('');
   const [ratingSelected, setRatingSelected] = useState<number | null>(null);

   const categoryFilter = useSelector(selectCourses).map(course => course.category);
   //const languageFilter = useSelector(selectCourses).map(course => course.language);
   //const priceFilter = useSelector(selectCourses).map(course => course.price_type);
   //const skillFilter = useSelector(selectCourses).map(course => course.skill_level);
   const instructorFilter = useSelector(selectCourses).map(course => course.instructors);

   const allCategory = ['หลักสูตรทั้งหมด', ...new Set(categoryFilter)];
   //const allLanguage = ['ภาษาทั้งหมด', ...new Set(languageFilter)];
   //const allPrice = ['ราคาทั้งหมด', ...new Set(priceFilter)];
   //const allSkill = ['ทักษะทั้งหมด', ...new Set(skillFilter)];
   const allInstructor = ['ผู้สอนทั้งหมด', ...new Set(instructorFilter)];

   const allCourses = useSelector(selectCourses);

   // Handle category selection
   const handleCategory = (category: string) => {
      setCategorySelected(prevCategory => prevCategory === category ? '' : category);
      filterCourses({ 
         category: category === categorySelected ? '' : category, 
         language: languageSelected, 
         price: priceSelected, 
         rating: ratingSelected, 
         skill: skillSelected, 
         instructor: instructorSelected 
      });
   };

   // Handle Instructor selection
   const handleInstructor = (instructor: string) => {
      setInstructorSelected(instructor);
      filterCourses({ 
         category: categorySelected, 
         language: languageSelected, 
         price: priceSelected, 
         rating: ratingSelected, 
         skill: skillSelected, 
         instructor 
      });
   };

   // Handle rating selection
   const handleRating = (rating: number) => {
      setRatingSelected(prevRating => prevRating === rating ? null : rating);
      filterCourses({ 
         category: categorySelected, 
         language: languageSelected, 
         price: priceSelected, 
         rating: rating === ratingSelected ? null : rating, 
         skill: skillSelected, 
         instructor: instructorSelected 
      });
   };

   // Filter courses based on selected criteria
   const filterCourses = ({ category, language, price, rating, skill, instructor }: FilterCriteria) => {
      let filteredCourses = allCourses;

      if (category && category !== 'All Category') {
         filteredCourses = filteredCourses.filter(course => course.category === category);
      }

      if (language && language !== 'All Language') {
         filteredCourses = filteredCourses.filter(course => course.language === language);
      }

      if (price && price !== 'All Price') {
         filteredCourses = filteredCourses.filter(course => course.price_type === price);
      }

      if (skill && skill !== 'All Skill') {
         filteredCourses = filteredCourses.filter(course => course.skill_level === skill);
      }

      if (instructor && instructor !== 'All Instructors') {
         filteredCourses = filteredCourses.filter(course => course.instructors === instructor);
      }

      if (rating) {
         filteredCourses = filteredCourses.filter(course => course.rating >= rating);
      }

      setCourses(filteredCourses);
   };

   // Determine categories to display based on "Show More" toggle
   const categoriesToShow = showMoreCategory ? allCategory : allCategory.slice(0, 8);
   //const languageToShow = showMoreLanguage ? allLanguage : allLanguage.slice(0, 4);
   const instructorToShow = showMoreInstructor ? allInstructor : allInstructor.slice(0, 4);

   return (
      <div className="col-xl-3 col-lg-4">
         <aside className="courses__sidebar">
            <div className="courses-widget">
               <h4 className="widget-title">หลักสูตร</h4>
               <div className="courses-cat-list">
                  <ul className="list-wrap">
                     {categoriesToShow.map((category, i) => (
                        <li key={i}>
                           <div onClick={() => handleCategory(category)} className="form-check">
                              <input className="form-check-input" type="checkbox" checked={category === categorySelected} readOnly id={`cat_${i}`} />
                              <label className="form-check-label" htmlFor={`cat_${i}`} onClick={() => handleCategory(category)}>{category}</label>
                           </div>
                        </li>
                     ))}
                  </ul>
                  <div className="show-more">
                     <a className={`show-more-btn ${showMoreCategory ? 'active' : ''}`} style={{ cursor: "pointer" }} onClick={() => setShowMoreCategory(!showMoreCategory)}>
                        {showMoreCategory ? "แสดงน้อยลง -" : "แสดงเพิ่มเติม +"}
                     </a>
                  </div>
               </div>
            </div>
            {/* Instructors Filter */}
            <div className="courses-widget">
               <h4 className="widget-title">ผู้สอน</h4>
               <div className="courses-cat-list">
                  <ul className="list-wrap">
                     {instructorToShow.map((instructor, i) => (
                        <li key={i}>
                           <div onClick={() => handleInstructor(instructor)} className="form-check">
                              <input className="form-check-input" type="checkbox" checked={instructor === instructorSelected} readOnly id={`instructor_${i}`} />
                              <label className="form-check-label" htmlFor={`instructor_${i}`} onClick={() => handleInstructor(instructor)}>{instructor}</label>
                           </div>
                        </li>
                     ))}
                  </ul>
                  <div className="show-more">
                     <a className={`show-more-btn ${showMoreInstructor ? 'active' : ''}`} style={{ cursor: "pointer" }} onClick={() => setShowMoreInstructor(!showMoreInstructor)}>
                        {showMoreInstructor ? "แสดงน้อยลง -" : "แสดงเพิ่มเติม +"}
                     </a>
                  </div>
               </div>
            </div>

            {/* Rating Filter */}
            <div className="courses-widget">
               <h4 className="widget-title">รีวิว</h4>
               <div className="courses-rating-list">
                  <ul className="list-wrap">
                     {[5, 4, 3, 2, 1].map((rating, i) => (
                        <li key={i}>
                           <div onClick={() => handleRating(rating)} className="form-check">
                              <input className="form-check-input" type="checkbox" checked={rating === ratingSelected} readOnly id={`rating_${i}`} />
                              <label className="form-check-label" htmlFor={`rating_${i}`} onClick={() => handleRating(rating)}>
                                 <div className="rating">
                                    <Rating initialValue={rating} size={20} readonly />
                                 </div>
                              </label>
                           </div>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         </aside>
      </div>
   );
}

export default CourseSidebar;
