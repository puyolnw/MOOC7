import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const [isVisible, setIsVisible] = useState(true); // เริ่มต้นด้วย true
  const location = useLocation();

  useEffect(() => {
    // ใช้ requestAnimationFrame เพื่อให้ animation smooth ขึ้น
    const showPage = () => {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    };

    // เริ่มต้นด้วยการแสดงหน้า
    showPage();
  }, [location.pathname]);

  return (
    <div 
      className={`page-transition ${isVisible ? 'fade-in' : 'fade-out'}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
        minHeight: '100vh'
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;
