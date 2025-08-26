import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ManagerBannerProps {
  style?: boolean;
}

interface UserProfile {
  name: string;
  avatar_path: string;
  avatar_file_id: string;
  position: string;
}

const ManagerBanner: React.FC<ManagerBannerProps> = ({ style }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
   const fetchUserProfile = async () => {
     try {
       const token = localStorage.getItem('token');
       if (!token) {
         setIsLoading(false);
         return;
       }

       // ดึง user ID จาก token
       const tokenPayload = JSON.parse(atob(token.split('.')[1]));
       const userId = tokenPayload.id;

       const response = await axios.get(`${apiURL}/api/accounts/managers/profile/${userId}`, {
         headers: { 'Authorization': `Bearer ${token}` }
       });

       if (response.data.success) {
         setUserProfile(response.data.manager);
       }
     } catch (error) {
       console.error('Error fetching user profile:', error);
     } finally {
       setIsLoading(false);
     }
   };

   fetchUserProfile();
 }, [apiURL]);

  // สร้าง URL สำหรับรูปภาพ
  const getAvatarUrl = (fileId: string) => {
    return `${apiURL}/api/accounts/managers/avatar/${fileId}`;
  };

  // รูปภาพ default
  const defaultAvatar = style 
    ? "/assets/img/courses/details_instructors02.jpg"
    : "/assets/img/courses/details_instructors01.jpg";

  return (
    <div className="dashboard__top-wrap">
      <div className="dashboard__top-bg" style={{ backgroundImage: `url(/assets/img/bg/bg1.png)` }}></div>
      <div className="dashboard__instructor-info">
        <div className="dashboard__instructor-info-left">
          <div className="thumb">
            {isLoading ? (
              <div className="placeholder-avatar" style={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: '#f0f0f0',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="fas fa-user fa-2x text-muted"></i>
              </div>
            ) : userProfile?.avatar_file_id ? (
              <img 
                src={getAvatarUrl(userProfile.avatar_file_id)} 
                alt="Profile" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = defaultAvatar;
                }}
              />
            ) : (
              <img src={defaultAvatar} alt="Default Profile" />
            )}
          </div>
          <div className="content">
            <h4 className="title">
              {isLoading ? (
                <div className="placeholder-text" style={{ 
                  width: '120px', 
                  height: '20px', 
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px'
                }}></div>
              ) : userProfile?.name ? (
                userProfile.name
              ) : (
                "Manager"
              )}
            </h4>
            {userProfile?.position && (
              <div className="position-badge">
                <span className="badge bg-primary">
                  <i className="fas fa-user-tag me-1"></i>
                  {userProfile.position}
                </span>
              </div>
            )}
            <div className="review__wrap review__wrap-two">
              {/* สามารถเพิ่มข้อมูลเพิ่มเติมได้ที่นี่ */}
            </div>
          </div>
        </div>
        <div className="dashboard__instructor-info-right">
          {/* สามารถเพิ่มข้อมูลเพิ่มเติมได้ที่นี่ */}
        </div>
      </div>
    </div>
  );
};

export default ManagerBanner;