import DashboardBreadcrumb from '../../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../../layouts/footers/FooterOne'
import HeaderOne from '../../../../layouts/headers/HeaderOne'
import AddLessonsArea from './AddLessonsArea'

const AdminAddLessons = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <AddLessonsArea />
         </main>
         <FooterOne />
      </>
   )
}

export default AdminAddLessons
