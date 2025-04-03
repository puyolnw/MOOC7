import Wrapper from '../../../layouts/Wrapper';
import AdminAddQuizzes from '../../../dashboard/admin-creditbank/quizzes/create';
import SEO from '../../../components/SEO';


const AdminAddQuizzespage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Admin Dashboard'} />
         <AdminAddQuizzes />
      </Wrapper>
   );
};

export default AdminAddQuizzespage;