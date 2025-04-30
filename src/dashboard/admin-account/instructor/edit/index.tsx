import DashboardBreadcrumb from '../../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../../layouts/footers/FooterOne'
import HeaderOne from '../../../../layouts/headers/HeaderOne'
import EditAccountInstructorsArea from './EditAccountInstructorsArea'

const AdminEditAccountInstructorsArea = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <EditAccountInstructorsArea />
         </main>
         <FooterOne />
      </>
   )
}

export default AdminEditAccountInstructorsArea;
