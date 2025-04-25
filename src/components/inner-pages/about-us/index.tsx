import FooterOne from "../../../layouts/footers/FooterOne"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import BrandOne from "../../common/brands/BrandOne"
import BreadcrumbOne from "../../common/breadcrumb/BreadcrumbOne"
import Features from "../../homes/home-one/Features"
import Feature from "../../homes/home-two/Feature"
import About from "./About"

const AboutUs = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <BreadcrumbOne title="เกี่ยวกับเรา" sub_title="About Us" />
            <About />
            <BrandOne />
            <Feature style={true} />
            <Features />
         </main>
         <FooterOne style={false} style_2={false} />
      </>
   )
}

export default AboutUs
