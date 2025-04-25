import Wrapper from '../../layouts/Wrapper';
import InsLessons from '../../dashboard/instructor-dashboard/Lessons';
import SEO from '../../components/SEO';


const InsLessonspage= () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Ins Questions'} />
         <InsLessons />a
      </Wrapper>
   );
};

export default InsLessonspage;