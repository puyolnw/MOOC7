import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import InstSubjectsArea from './InstSubjectsArea'

const InstSubjects = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <InstSubjectsArea />
         </main>
         <FooterOne />
      </>
   )
}

export default InstSubjects
