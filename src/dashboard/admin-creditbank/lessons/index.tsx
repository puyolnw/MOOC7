import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import LessonsArea from './LessonsArea'

const AdminLessons = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <LessonsArea />
         </main>
         <FooterOne />
      </>
   )
}

export default AdminLessons
