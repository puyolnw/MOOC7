import Wrapper from '../../../layouts/Wrapper';
import InsAddLessons from '../../../dashboard/instructor-dashboard/Lessons/Create';
import SEO from '../../../components/SEO';


const InsAddlessonspage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Admin Dashboard'} />
         <InsAddLessons />
      </Wrapper>
   );
};

export default InsAddlessonspage;