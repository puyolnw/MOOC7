import Wrapper from '../../../layouts/Wrapper';
import InsAddSubjects from '../../../dashboard/instructor-dashboard/Subjects/create';
import SEO from '../../../components/SEO';


const InsAddSubjectspage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Admin Dashboard'} />
         <InsAddSubjects />
      </Wrapper>
   );
};

export default InsAddSubjectspage;