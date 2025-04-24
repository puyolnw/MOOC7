import Banner from "./Banner"
import Choose from "./Choose"
import Course from "./Course"
import Video from "./Video"
import Instructor from "./Instructor"
import Event from "./Event"
import Cta from "./Cta"
import Testimonial from "./Testimonial"
import HeaderFour from "../../../layouts/headers/HeaderFour"
import BrandOne from "../../common/brands/BrandOne"
import FooterTwo from "../../../layouts/footers/FooterTwo"

const HomeFour = () => {
   return (
      <>
         <HeaderFour />
         <main className="main-area fix">
            <Banner />
            <Choose />
            <Course />
            <Video />
            <Instructor />
            <BrandOne />
            <Event />
            <Testimonial />
            <Cta />
         </main>
         <FooterTwo style={false} />
      </>
   )
}

export default HomeFour
