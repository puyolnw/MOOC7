import Wrapper from '../../../layouts/Wrapper';
import AddCoursearea from '../../../dashboard/manager-dashboard/create';
import SEO from '../../../components/SEO';


const ManagerAddCoursepage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Manager Dashboard'} />
         <AddCoursearea />
      </Wrapper>
   );
};

export default ManagerAddCoursepage;