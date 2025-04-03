import Wrapper from '../../../layouts/Wrapper';
import AdminAddQuestions from '../../../dashboard/admin-creditbank/questions/create';
import SEO from '../../../components/SEO';


const AdminAddquestionpage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Admin Dashboard'} />
         <AdminAddQuestions />
      </Wrapper>
   );
};

export default AdminAddquestionpage;