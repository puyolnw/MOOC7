import Wrapper from '../../layouts/Wrapper';
import InsGrading from '../../dashboard/instructor-dashboard/instructor-grading';
import SEO from '../../components/SEO';


const InsGradingpage= () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Ins Questions'} />
         <InsGrading />
      </Wrapper>
   );
};

export default InsGradingpage;