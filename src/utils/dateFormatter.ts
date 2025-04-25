// ฟังก์ชันสำหรับจัดรูปแบบวันที่
export const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    
    // ตรวจสอบว่าวันที่ถูกต้องหรือไม่
    if (isNaN(date.getTime())) return '-';
    
    // จัดรูปแบบวันที่เป็น dd/mm/yyyy
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // ฟังก์ชันสำหรับจัดรูปแบบวันที่และเวลา
  export const formatDateTime = (dateString: string): string => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    
    // ตรวจสอบว่าวันที่ถูกต้องหรือไม่
    if (isNaN(date.getTime())) return '-';
    
    // จัดรูปแบบวันที่และเวลาเป็น dd/mm/yyyy HH:MM
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // ฟังก์ชันสำหรับคำนวณระยะเวลาที่ผ่านมา (เช่น "2 วันที่แล้ว", "5 นาทีที่แล้ว")
  export const timeAgo = (dateString: string): string => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    
    // ตรวจสอบว่าวันที่ถูกต้องหรือไม่
    if (isNaN(date.getTime())) return '-';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    // คำนวณระยะเวลาที่ผ่านมา
    if (diffInSeconds < 60) {
      return `${diffInSeconds} วินาทีที่แล้ว`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} นาทีที่แล้ว`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} ชั่วโมงที่แล้ว`;
    } else if (diffInSeconds < 2592000) {
      return `${Math.floor(diffInSeconds / 86400)} วันที่แล้ว`;
    } else if (diffInSeconds < 31536000) {
      return `${Math.floor(diffInSeconds / 2592000)} เดือนที่แล้ว`;
    } else {
      return `${Math.floor(diffInSeconds / 31536000)} ปีที่แล้ว`;
    }
  };
  