import DashboardBreadcrumb from '../../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../../layouts/footers/FooterOne'
import HeaderOne from '../../../../layouts/headers/HeaderOne'
import CreateAccountInstructorsArea from './CreateAccountInstructorsArea'

const AdminCreateAccountInstructors = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <CreateAccountInstructorsArea />
         </main>
         <FooterOne />
      </>
   )
}

export default AdminCreateAccountInstructors;
