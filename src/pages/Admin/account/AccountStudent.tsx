import Wrapper from '../../../layouts/Wrapper';
import AccountStudent from '../../../dashboard/admin-account/student';
import SEO from '../../../components/SEO';


const adminAccountStudent = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Admin Dashboard'} />
         <AccountStudent />
      </Wrapper>
   );
};

export default adminAccountStudent;