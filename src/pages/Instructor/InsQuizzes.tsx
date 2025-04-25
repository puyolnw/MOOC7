import Wrapper from '../../layouts/Wrapper';
import InstQuizzes from '../../dashboard/instructor-dashboard/Quizzes';
import SEO from '../../components/SEO';


const InsQuizzespage= () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Ins Questions'} />
         <InstQuizzes />a
      </Wrapper>
   );
};

export default InsQuizzespage;