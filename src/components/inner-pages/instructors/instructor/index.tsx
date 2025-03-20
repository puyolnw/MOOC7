import FooterOne from "../../../../layouts/footers/FooterOne"
import HeaderOne from "../../../../layouts/headers/HeaderOne"
import BreadcrumbOne from "../../../common/breadcrumb/BreadcrumbOne"
import InstructorArea from "./InstructorArea"

const Instructors = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <BreadcrumbOne title="รายชื่ออาจารย์" sub_title="อาจารย์" />
            <InstructorArea />
         </main>
         <FooterOne style={false} style_2={false} />
      </>
   )
}

export default Instructors
