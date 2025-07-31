import DashboardBreadcrumb from '../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../layouts/footers/FooterOne'
import HeaderOne from '../../layouts/headers/HeaderOne'
import ManagePics from './displaymanage'

const AdminDisplaypics = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <ManagePics />
         </main>
         <FooterOne />
      </>
   )
}

export default AdminDisplaypics
