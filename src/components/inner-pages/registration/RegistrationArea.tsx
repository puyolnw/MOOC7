import { Link } from "react-router-dom"
import RegistrationForm from "../../../forms/RegistrationForm"

const RegistrationArea = () => {
   return (
      <section className="singUp-area section-py-120">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-6 col-lg-8">
                  <div className="singUp-wrap">
                     <h2 className="title">สร้างบัญชีของคุณ</h2>
                     <p>สวัสดี! พร้อมที่จะเข้าร่วมกับเราแล้วใช่ไหม? เราต้องการรายละเอียดเพียงเล็กน้อยจากคุณเพื่อเริ่มต้น<br /> มาเริ่มกันเลย!</p>
                     <RegistrationForm />
                     <div className="account__switch">
                        <p>มีบัญชีอยู่แล้ว?<Link to="/login">เข้าสู่ระบบ</Link></p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default RegistrationArea