import Wrapper from '../../../layouts/Wrapper';
import InsAddQuestions from '../../../dashboard/instructor-dashboard/Questions/create';
import SEO from '../../../components/SEO';


const InsAddquestionpage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Admin Dashboard'} />
         <InsAddQuestions />
      </Wrapper>
   );
};

export default InsAddquestionpage;