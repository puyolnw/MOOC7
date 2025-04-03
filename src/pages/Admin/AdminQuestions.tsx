import Wrapper from '../../layouts/Wrapper';
import AdminQuestions from '../../dashboard/admin-creditbank/questions';
import SEO from '../../components/SEO';


const AdminQuestionspage= () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Admin Dashboard'} />
         <AdminQuestions />a
      </Wrapper>
   );
};

export default AdminQuestionspage;