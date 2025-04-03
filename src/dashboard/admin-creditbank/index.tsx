import DashboardBreadcrumb from '../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../layouts/footers/FooterOne'
import HeaderOne from '../../layouts/headers/HeaderOne'
import AdminCreditbankArea from './AdminCreditbankArea'

const AdminCreditbank = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <AdminCreditbankArea />
         </main>
         <FooterOne />
      </>
   )
}

export default AdminCreditbank
