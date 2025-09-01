import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import AdminIconPanel from '../../dashboard-common/AdminIconPanel'
import AdminAccountInstructorsArea from './AdminAccountInstructorsArea'

const AdminInstructors = () => {
   return (
      <>
         <HeaderOne />
         <AdminIconPanel isOpen={true} />
         <main className="main-area fix">
            <AdminAccountInstructorsArea/>
         </main>
         <FooterOne />
      </>
   )
}

export default AdminInstructors
