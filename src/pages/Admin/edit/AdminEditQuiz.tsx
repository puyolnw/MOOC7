import Wrapper from '../../../layouts/Wrapper';
import AdminEditQuiz from '../../../dashboard/admin-creditbank/edit-quiz'
import SEO from '../../../components/SEO';

const AdminEditQuizpage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank AdminEditQuiz'} />
         <AdminEditQuiz />
      </Wrapper>
   );
};

export default AdminEditQuizpage;