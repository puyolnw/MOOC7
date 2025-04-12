import Wrapper from '../../../layouts/Wrapper';
import AdminInstructors from '../../../dashboard/admin-account/instructor';
import SEO from '../../../components/SEO';


const adminAccountInstructorspage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Admin Dashboard'} />
         <AdminInstructors />
      </Wrapper>
   );
};

export default adminAccountInstructorspage;