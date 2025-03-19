import FooterOne from "../../../layouts/footers/FooterOne"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import BreadcrumbOne from "../../common/breadcrumb/BreadcrumbOne"
import LoginArea from "./LoginArea"

const Login = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <BreadcrumbOne title="เข้าสู่ระบบ" sub_title="Login" />
            <LoginArea />
         </main>
         <FooterOne style={false} style_2={false} />
      </>
   )
}

export default Login

