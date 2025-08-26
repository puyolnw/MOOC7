import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import AdminAccountManagersArea from './AdminAccountManagersArea'

const AdminAccountManagers = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <AdminAccountManagersArea/>
         </main>
         <FooterOne />
      </>
   )
}

export default AdminAccountManagers ;
