import Wrapper from '../../layouts/Wrapper';
import AdminDisplaypics from '../../dashboard/admin-creditbank/indexdisplay';
import SEO from '../../components/SEO';


const Admindisplaypage = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Creditbank Admin Dashboard'} />
         <AdminDisplaypics />
      </Wrapper>
   );
};

export default Admindisplaypage;