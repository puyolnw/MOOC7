import { Link } from "react-router-dom"

const Instructors = () => {
   return (
      <div className="courses__instructors-wrap">
         <div className="courses__instructors-thumb">
            <img src="/assets/img/courses/course_instructors.png" alt="img" />
         </div>
         <div className="courses__instructors-content">
            <h2 className="title">ดร.ปรมาภรณ์ แสงภารา</h2>
            <span className="designation">สถิติประยุกต์</span>
            <p className="avg-rating"><i className="fas fa-star"></i>(4.8 Ratings)</p>
            <p>สาขาสถิติประยุกต์ คณะวิทยาศาสตร์และเทคโนโลยี

มหาวิทยาลัยราชภัฏมหาสารคาม

อำเภอเมือง จังหวัดมหาสารคาม 44000

โทรศัพท์: 043-742620

โทรสาร: 043-742620

e-mail: ps.parama@hotmail.com
โทรศัพท์มือถือ: 089-8420493  ประวัติการศึกษา

วิทยาศาสตร์บัณฑิต (วท.บ.) คณิตศาสตร์ มหาวิทยาลัยขอนแก่น
วิทยาศาสตร์มหาบัณฑิต (วท.ม.) สถิติประยุกต์ มหาวิทยาลัยขอนแก่น
ประสบการณ์ด้านการวิจัย

ความแม่นยำของวิธีการประมาณค่าอัตรามรณะและการสร้างตารางชีพแบบย่อราย จังหวัดของประเทศไทย
การวิเคราะห์แบบแผนของจำนวนนักศึกษามหาวิทยาลัยราชภัฏมหาสารคาม</p>
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
