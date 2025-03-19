import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import StudentCertificateArea from './StudentCertificateArea'

const StudentCertificate = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <StudentCertificateArea />
         </main>
         <FooterOne />
      </>
   )
}

export default StudentCertificate
