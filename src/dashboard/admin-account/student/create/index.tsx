import DashboardBreadcrumb from '../../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../../layouts/footers/FooterOne'
import HeaderOne from '../../../../layouts/headers/HeaderOne'
import CreateAccountStudentsArea from './CreateAccountStudentsArea'

const AdminCreateAccountStudents = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <CreateAccountStudentsArea />
         </main>
         <FooterOne />
      </>
   )
}

export default AdminCreateAccountStudents;
