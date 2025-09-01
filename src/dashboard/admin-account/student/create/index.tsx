import FooterOne from '../../../../layouts/footers/FooterOne'
import HeaderOne from '../../../../layouts/headers/HeaderOne'
import AdminIconPanel from '../../../dashboard-common/AdminIconPanel'
import CreateAccountStudentsArea from './CreateAccountStudentsArea'

const AdminCreateAccountStudents = () => {
   return (
      <>
         <HeaderOne />
         <AdminIconPanel isOpen={true} />
         <main className="main-area fix">
            <CreateAccountStudentsArea />
         </main>
         <FooterOne />
      </>
   )
}

export default AdminCreateAccountStudents
