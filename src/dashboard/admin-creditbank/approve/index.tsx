import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import AdminIconPanel from '../../dashboard-common/AdminIconPanel'
import ApproveArea from './ApproveArea'

const AdminApprove = () => {
   return (
      <>
         <HeaderOne />
         <AdminIconPanel isOpen={true} />
         <main className="main-area fix">
            <ApproveArea/>
         </main>
         <FooterOne />
      </>
   )
}

export default AdminApprove
