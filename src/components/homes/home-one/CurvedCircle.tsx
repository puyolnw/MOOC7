import React, { useEffect, useRef } from 'react';
import CircleType from 'circletype';

const CurvedCircle: React.FC = () => {

  const curvedCircleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (curvedCircleRef.current) {
      const circleType = new CircleType(curvedCircleRef.current);
      circleType.radius(280).dir(1); // Customize as needed
    }
  }, []);

  return (
    <div className="curved-circle" ref={curvedCircleRef}>
      * การศึกษา * ระบบ * สามารถ * สร้าง * เปลี่ยนแปลง *
    </div>
  );
};

export default CurvedCircle;


