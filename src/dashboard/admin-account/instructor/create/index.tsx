import FooterOne from '../../../../layouts/footers/FooterOne'
import HeaderOne from '../../../../layouts/headers/HeaderOne'
import AdminIconPanel from '../../../dashboard-common/AdminIconPanel'
import CreateAccountInstructorsArea from './CreateAccountInstructorsArea'

const AdminCreateAccountInstructors = () => {
   return (
      <>
         <HeaderOne />
         <AdminIconPanel isOpen={true} />
         <main className="main-area fix">
            <CreateAccountInstructorsArea />
         </main>
         <FooterOne />
      </>
   )
}

export default AdminCreateAccountInstructors
