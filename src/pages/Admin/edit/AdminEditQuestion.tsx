import Wrapper from '../../../layouts/Wrapper';
import AdminEditQuestion from '../../../dashboard/admin-creditbank/edit-question'
import SEO from '../../../components/SEO';

const AdminEditQuestionpage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank AdminEditQuestion'} />
         <AdminEditQuestion />
      </Wrapper>
   );
};

export default AdminEditQuestionpage;