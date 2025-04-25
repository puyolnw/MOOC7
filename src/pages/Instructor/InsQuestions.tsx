import Wrapper from '../../layouts/Wrapper';
import InsQuestions from '../../dashboard/instructor-dashboard/Questions';
import SEO from '../../components/SEO';


const InsQuestionspage= () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Ins Questions'} />
         <InsQuestions />a
      </Wrapper>
   );
};

export default InsQuestionspage;