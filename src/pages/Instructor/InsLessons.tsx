import Wrapper from '../../layouts/Wrapper';
import SEO from '../../components/SEO';
import InsLessons from '../../dashboard/instructor-dashboard/Lessons';



const InsLessonspage= () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Ins Questions'} />
         <InsLessons />a
      </Wrapper>
   );
};

export default InsLessonspage;