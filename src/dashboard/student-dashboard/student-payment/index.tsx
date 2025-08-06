import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import StudentPaymentArea from './StudentPaymentArea'

const StudentPayment = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <StudentPaymentArea/>
         </main>
         <FooterOne />
      </>
   )
}

export default StudentPayment;
