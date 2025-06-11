import DashboardBreadcrumb from '../../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../../layouts/footers/FooterOne'
import HeaderOne from '../../../../layouts/headers/HeaderOne'
import InstructorSubjectArea from './Instructor-SubjectArea'

const InstructorSubjectOverview = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <InstructorSubjectArea />
         </main>
         <FooterOne />
      </>
   )
}

export default InstructorSubjectOverview
