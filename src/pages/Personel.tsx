import Wrapper from '../layouts/Wrapper';
import Personnel1 from '../components/inner-pages/personnel';
import SEO from '../components/SEO';

const personelpage = () => {
  return (
    <Wrapper>
      <SEO pageTitle={'เกี่ยวกับเรา'} />
      <Personnel1 />
    </Wrapper>
  );
};

export default personelpage;