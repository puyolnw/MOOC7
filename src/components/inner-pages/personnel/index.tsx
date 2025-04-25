import FooterOne from "../../../layouts/footers/FooterOne"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import BreadcrumbOne from "../../common/breadcrumb/BreadcrumbOne"
import Personnel from "./personnel"

const Personnel1 = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <BreadcrumbOne title="บุคลากร" sub_title="Personnel" />
            <Personnel />


         </main>
         <FooterOne style={false} style_2={false} />
      </>
   )
}

export default Personnel1
