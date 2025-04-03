import Wrapper from '../../layouts/Wrapper';
import AdminQuizzes from '../../dashboard/admin-creditbank/quizzes';
import SEO from '../../components/SEO';


const AdminQuizzespage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Admin Dashboard'} />
         <AdminQuizzes />a
      </Wrapper>
   );
};

export default AdminQuizzespage;