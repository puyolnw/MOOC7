import Wrapper from '../../../../layouts/Wrapper';
import AdminEditAccountInstructors from '../../../../dashboard/admin-account/instructor/edit';
import SEO from '../../../../components/SEO';


const EditAccountInstructorspage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Admin Dashboard'} />
         <AdminEditAccountInstructors />
      </Wrapper>
   );
};

export default EditAccountInstructorspage;