import Wrapper from '../../../../layouts/Wrapper';
import AdminCreateAccountInstructors from '../../../../dashboard/admin-account/instructor/create';
import SEO from '../../../../components/SEO';


const CreateAccountInstructorspage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Admin Dashboard'} />
         <AdminCreateAccountInstructors />
      </Wrapper>
   );
};

export default CreateAccountInstructorspage;