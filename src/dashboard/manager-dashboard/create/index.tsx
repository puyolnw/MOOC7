import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import AddCoursearea from './AddCoursearea'

const ManagerAddCourse = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <AddCoursearea />
         </main>
         <FooterOne />
      </>
   )
}

export default ManagerAddCourse
