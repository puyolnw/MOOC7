import Wrapper from '../layouts/Wrapper';
import SubjectDetails from '../components/courses/subjects';
import SEO from '../components/SEO';

const SubjectDetailsPage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Subject Details'} />
         <SubjectDetails />
      </Wrapper>
   );
};

export default SubjectDetailsPage;