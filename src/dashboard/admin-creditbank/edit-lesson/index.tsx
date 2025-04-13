import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import EditLessonArea from './EditLessonArea'

const AdminEditLessons = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <EditLessonArea />
         </main>
         <FooterOne />
      </>
   )
}

export default AdminEditLessons
