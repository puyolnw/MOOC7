import { Link } from "react-router-dom"
import RegistrationForm from "../../../forms/RegistrationForm"

const RegistrationArea = () => {
   return (
      <section className="singUp-area section-py-120">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-6 col-lg-8">
                  <div className="singUp-wrap">
                     <h2 className="title">ลงทะเบียน</h2>
                     <p></p>
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