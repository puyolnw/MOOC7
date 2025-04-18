import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import AccountStudentArea from './AccountStudentArea'

const AdminStudent = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <AccountStudentArea/>
         </main>
         <FooterOne />
      </>
   )
}

export default AdminStudent ;
