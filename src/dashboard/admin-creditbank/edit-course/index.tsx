import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import EditCourseArea from './EditCourseArea'

const AdminEditCoruse = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <EditCourseArea />
         </main>
         <FooterOne />
      </>
   )
}

export default AdminEditCoruse
