import FooterOne from "../../../layouts/footers/FooterOne";
import HeaderOne from "../../../layouts/headers/HeaderOne";
import BreadcrumbOne from "../../common/breadcrumb/BreadcrumbOne";


const BlogThree = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <BreadcrumbOne title="Blog Full Width" sub_title="Blogs" />

         </main>
         <FooterOne style={false} style_2={true}  />
      </>
   )
}

export default BlogThree;

