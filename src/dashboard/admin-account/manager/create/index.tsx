import DashboardBreadcrumb from '../../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../../layouts/footers/FooterOne'
import HeaderOne from '../../../../layouts/headers/HeaderOne'
import CreateAccountManagersArea from './CreateAccountManagersArea'

const CreateAccountManagers = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <CreateAccountManagersArea/>
         </main>
         <FooterOne />
      </>
   )
}

export default CreateAccountManagers ;
