import FooterOne from "../../../layouts/footers/FooterOne"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import BreadcrumbOne from "../../common/breadcrumb/BreadcrumbOne"
import RegistrationArea from "./RegistrationArea"

const Registration = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <BreadcrumbOne title="ลงทะเบียนสำหรับนักเรียน" sub_title="SingUp" />
            <RegistrationArea />
         </main>
         <FooterOne style={false} style_2={false} />
      </>
   )
}

export default Registration

