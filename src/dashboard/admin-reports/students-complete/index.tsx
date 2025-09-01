import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import AdminIconPanel from '../../dashboard-common/AdminIconPanel'
import StudentsComplete from './StudentsCompleteArea'

const AdminStudentsCompleteArea = () => {
   return (
      <>
         <HeaderOne />
         <AdminIconPanel isOpen={true} />
         <main className="main-area fix">
            <StudentsComplete/>
         </main>
         <FooterOne />
      </>
   )
}

export default AdminStudentsCompleteArea
