import DashboardBreadcrumb from '../../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../../layouts/footers/FooterOne'
import HeaderOne from '../../../../layouts/headers/HeaderOne'
import EditAccountManagersArea from './EditAccountManagersArea'

const EditAccountManagers = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <EditAccountManagersArea/>
         </main>
         <FooterOne />
      </>
   )
}

export default EditAccountManagers ;
