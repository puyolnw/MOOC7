import Banner from "./Banner"
import Features from "./Features"
import Courses from "./Courses"
import Cta from "./Cta"
import Choose from "./Choose"
import Categories from "./Categories"
import Instructor from "../home-one/Instructor"

import Testimonial from "./Testimonial"
import Newsletter from "./Newsletter"
import HeaderSeven from "../../../layouts/headers/HeaderSeven"
import BrandTwo from "../../common/brands/BrandTwo"
import FooterTwo from "../../../layouts/footers/FooterTwo"

const HomeSeven = () => {
   return (
      <>
         <HeaderSeven />
         <main className="main-area fix">
            <Banner />
            <Features />
            <Courses />
            <Cta />
            <Choose />
            <Categories />
            <Instructor />
            <Testimonial />
            <BrandTwo />

            <Newsletter />
         </main>
         <FooterTwo style={true} />
      </>
   )
}

export default HomeSeven

