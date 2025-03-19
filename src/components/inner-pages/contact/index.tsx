import FooterOne from "../../../layouts/footers/FooterOne"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import BreadcrumbOne from "../../common/breadcrumb/BreadcrumbOne"
import ContactArea from "./ContactArea"

const Contact = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <BreadcrumbOne title="ติดต่อเรา" sub_title="ติดต่อเรา" />
            <ContactArea />
         </main>
         <FooterOne style={false} style_2={false} />
      </>
   )
}

export default Contact

