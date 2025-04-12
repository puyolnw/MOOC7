interface OverviewProps {
   description: string;
 }
 
 const Overview = ({ description }: OverviewProps) => {
    return (
       <div className="courses__overview-wrap">
          <h3 className="title">รายละเอียดหลักสูตร</h3>
          <p>{description || "ไม่มีคำอธิบายหลักสูตร"}</p>
          
       </div>
    );
 };
 
 export default Overview;
 