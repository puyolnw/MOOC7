import FooterOne from '../../../../layouts/footers/FooterOne'
import HeaderOne from '../../../../layouts/headers/HeaderOne'
import AdminIconPanel from '../../../dashboard-common/AdminIconPanel'
import CreateAccountManagersArea from './CreateAccountManagersArea'

const CreateAccountManagers = () => {
   return (
      <>
         <HeaderOne />
         <AdminIconPanel isOpen={true} />
         <main className="main-area fix">
            <CreateAccountManagersArea/>
         </main>
         <FooterOne />
      </>
   )
}

export default CreateAccountManagers
