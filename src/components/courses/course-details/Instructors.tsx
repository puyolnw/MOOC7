import { Link } from "react-router-dom"

const Instructors = () => {
   return (
      <div className="courses__instructors-wrap">
         <div className="courses__instructors-thumb">
            <img src="/assets/img/courses/course_instructors.png" alt="img" />
         </div>
         <div className="courses__instructors-content">
            <h2 className="title">Mark Jukarberg</h2>
            <span className="designation">หัวหน้าฝ่ายออกแบบ UX</span>
            <p className="avg-rating"><i className="fas fa-star"></i>(4.8 Ratings)</p>
            <p>ความเจ็บปวดนั้นก็เจ็บปวดในตัวของมันเอง ความเจ็บปวดที่เกิดขึ้นกับชนชั้นสูงนั้นรุนแรง แต่เกิดขึ้นในลักษณะที่บางครั้งต้องทนทุกข์ทรมานและเจ็บปวดอย่างมาก และบางคนก็ทนทุกข์ทรมานจนหยุดหายใจไป เสียงหัวเราะนั้นไพเราะและมีชีวิตชีวา และผู้เป็นแม่ก็มีความประพฤติดี</p>
            <div className="instructor__social">
               <ul className="list-wrap justify-content-start">
                  <li><Link to="#"><i className="fab fa-facebook-f"></i></Link></li>
                  <li><Link to="#"><i className="fab fa-twitter"></i></Link></li>
                  <li><Link to="#"><i className="fab fa-whatsapp"></i></Link></li>
                  <li><Link to="#"><i className="fab fa-instagram"></i></Link></li>
               </ul>
            </div>
         </div>
      </div>
   )
}

export default Instructors
