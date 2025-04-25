import Wrapper from '../../../layouts/Wrapper';
import InsAddQuizzes from '../../../dashboard/instructor-dashboard/Quizzes/create';
import SEO from '../../../components/SEO';


const InsAddQuizzespage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Admin Dashboard'} />
         <InsAddQuizzes />
      </Wrapper>
   );
};

export default InsAddQuizzespage;