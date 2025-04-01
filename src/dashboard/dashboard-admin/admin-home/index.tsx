import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import AdminHomeArea from './AdminHomeArea'

const AdminHome = () => {
    return (
      <>
        <HeaderOne />
        <main className="main-area fix">
        <DashboardBreadcrumb />
        <AdminHomeArea />
        </main>
        <FooterOne />
      </>
    )
  }
  
  export default AdminHome