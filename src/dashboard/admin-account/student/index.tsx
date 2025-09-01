import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import AdminIconPanel from '../../dashboard-common/AdminIconPanel'
import AccountStudentArea from './AccountStudentArea'

const AdminStudent = () => {
   return (
      <>
         <HeaderOne />
         <AdminIconPanel isOpen={true} />
         <main className="main-area fix">
            <AccountStudentArea/>
         </main>
         <FooterOne />
      </>
   )
}

export default AdminStudent
