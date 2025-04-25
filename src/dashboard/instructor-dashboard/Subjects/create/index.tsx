import DashboardBreadcrumb from '../../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../../layouts/footers/FooterOne'
import HeaderOne from '../../../../layouts/headers/HeaderOne'
import AddSubjectsArea from './AddSubjectsArea'

const InsAddSubjects = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <AddSubjectsArea />
         </main>
         <FooterOne />
      </>
   )
}

export default InsAddSubjects
