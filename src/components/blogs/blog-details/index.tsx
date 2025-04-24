import FooterOne from "../../../layouts/footers/FooterOne"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import BreadcrumbOne from "../../common/breadcrumb/BreadcrumbOne"

const BlogDetails = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <BreadcrumbOne title="รายละเอียดบล็อก" sub_title="Blogs" sub_title_2="วิธีการตระหนักรู้ในตนเองอย่างเหลือเชื่อใน 20 นาที" style={true} />
         </main>
         <FooterOne style={false} style_2={true}  />
      </>
   )
}

export default BlogDetails

