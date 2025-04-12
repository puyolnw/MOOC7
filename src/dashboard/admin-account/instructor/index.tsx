import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import AdminAccountInstructorsArea from './AdminAccountInstructorsArea'

const AdminInstructors = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <AdminAccountInstructorsArea/>
         </main>
         <FooterOne />
      </>
   )
}

export default AdminInstructors ;
