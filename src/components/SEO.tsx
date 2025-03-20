import { Helmet } from "react-helmet-async";
// const SEO = ({ pageTitle }: any) => {
const SEO = ({  }: any) => {
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        {/* <title>{pageTitle} - คลังหลักสูตร</title> */}
        <title>RMU Credit Bank</title>
        <meta name="robots" content="noindex, follow" />
        <meta name="description" content="Zibber - Consulting React Template" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      </Helmet>
    </>
  );
};

export default SEO;
