import { Link } from "react-router-dom"
import LoginForm from "../../../forms/LoginForm"

const LoginArea = () => {
   return (
      <section className="singUp-area section-py-120">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-6 col-lg-8">
                  <div className="singUp-wrap">
                     <h2 className="title">เข้าสู่ระบบ</h2>

                     <LoginForm />
                     <div className="account__switch">
                        <p>ยังไม่มีบัญชี?<Link to="/registration">ลงทะเบียน</Link></p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default LoginArea
