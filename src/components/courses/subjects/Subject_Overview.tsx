
// Define the props interface to match what you're passing
interface OverviewProps {
  description: string;
  preTest?: any; // Using optional props with appropriate types
  postTest?: any;
}

const Overview = ({ description}: OverviewProps) => {
  return (
    <div className="courses__overview-wrap">
      <h3 className="title">รายละเอียดรายวิชา</h3>
      
      {/* Display the description with proper formatting */}
      <div className="description">
        {description ? (
          <div dangerouslySetInnerHTML={{ __html: description }} />
        ) : (
          <p>ไม่มีคำอธิบายรายวิชา</p>
        )}
      </div>
      
    </div>
  );
};

export default Overview;
