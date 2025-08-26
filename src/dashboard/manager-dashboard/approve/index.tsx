import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import ApproveArea from './ApproveArea'

const AdminApprove = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <ApproveArea/>
         </main>
         <FooterOne />
      </>
   )
}

export default AdminApprove;
