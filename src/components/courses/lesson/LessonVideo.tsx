import { useEffect, useRef, useState } from "react";
import axios from "axios";

import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import './LessonVideo.css';

interface LessonVideoProps {
  onComplete: () => void;
  currentLesson: string;
  youtubeId?: string;
  lessonId: number;
  onNextLesson?: () => void;
  hasQuiz?: boolean;
  onGoToQuiz?: () => void;
  // ✅ เพิ่ม prop ใหม่สำหรับการไปบทเรียนถัดไป (lesson ถัดไป)
  onGoToNextLesson?: () => void;
}

const LessonVideo = ({ 
  onComplete, 
  currentLesson, 
  youtubeId = 'BboMpayJomw', 
  lessonId, 
  onNextLesson,
  hasQuiz = false,
  onGoToQuiz,
  // ✅ เพิ่ม prop ใหม่สำหรับการไปบทเรียนถัดไป (lesson ถัดไป)
  onGoToNextLesson
}: LessonVideoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  const hasCompletedRef = useRef(false);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [savedPosition, setSavedPosition] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // สร้าง key สำหรับ localStorage
  const getStorageKey = () => {
    const userId = localStorage.getItem('userId') || 'anonymous';
    return `video_progress_lesson_${lessonId}_${youtubeId}_user_${userId}`;
  };

  // ล้าง localStorage ของ user เก่าเมื่อเปลี่ยน user
  const clearOldUserData = (newUserId: string) => {
    if (currentUserId && currentUserId !== newUserId) {
      console.log(`เปลี่ยน user จาก ${currentUserId} เป็น ${newUserId} - ล้างข้อมูลเก่า`);
      
      // ล้างข้อมูลทั้งหมดของ user เก่า
      const allKeys = Object.keys(localStorage);
      const oldUserKeys = allKeys.filter(key => key.includes(`user_${currentUserId}`));
      
      oldUserKeys.forEach(key => {
        console.log(`ล้างข้อมูล user เก่า: ${key}`);
        localStorage.removeItem(key);
      });
      
      // อัปเดต currentUserId
      setCurrentUserId(newUserId);
    } else if (!currentUserId) {
      // ครั้งแรกที่โหลด
      setCurrentUserId(newUserId);
    }
  };

  // ตรวจสอบและล้างข้อมูล user เก่า
  const checkAndClearUserData = () => {
    const userId = localStorage.getItem('userId') || 'anonymous';
    if (userId !== currentUserId) {
      clearOldUserData(userId);
    }
  };

  // ล้างข้อมูลทั้งหมดของ user ปัจจุบัน (สำหรับกรณี logout)
  const clearCurrentUserData = () => {
    if (currentUserId && currentUserId !== '') {
      console.log(`ล้างข้อมูลทั้งหมดของ user ปัจจุบัน: ${currentUserId}`);
      
      const allKeys = Object.keys(localStorage);
      const currentUserKeys = allKeys.filter(key => key.includes(`user_${currentUserId}`));
      
      currentUserKeys.forEach(key => {
        console.log(`ล้างข้อมูล: ${key}`);
        localStorage.removeItem(key);
      });
      
      setCurrentUserId(''); // ตั้งค่าเป็น '' เฉพาะเมื่อ currentUserId มีค่า
    }
  };

  // ตรวจสอบการ logout (เมื่อไม่มี userId หรือ token)
  const checkLogout = () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    if (!userId || !token) {
      console.log('ตรวจพบการ logout - ล้างข้อมูลทั้งหมด');
      clearCurrentUserData();
    }
  };

  // บันทึกความก้าวหน้าไปที่ localStorage
  const saveToLocalStorage = (currentTime: number, duration: number) => {
    const progressData = {
      position: currentTime,
      duration: duration,
      percentage: (currentTime / duration) * 100,
      completed: currentTime >= duration * 0.9,
      lastUpdated: new Date().toISOString() 
    };
    
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(progressData));
    
    setLastSavedTime(new Date());
    console.log(`บันทึก Local: ${currentTime.toFixed(1)}/${duration.toFixed(1)} (${progressData.percentage.toFixed(1)}%)`);
    
    return progressData;
  };

  // โหลดความก้าวหน้าจาก localStorage
  const loadFromLocalStorage = () => {
    const storageKey = getStorageKey();
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        const progressData = JSON.parse(saved);
        console.log("โหลดจาก Local:", progressData);
        return progressData;
      } catch (error) {
        console.error("Error parsing localStorage data:", error);
      }
    }
    return null;
  };

  // บันทึกความก้าวหน้าไปที่ Server
  const saveToServer = async (currentTime: number, duration: number) => {
    if (!isOnline) {
      console.log("ไม่สามารถเชื่อมต่ออินเทอร์เน็ต");
      return null;
    }
  
    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined') {
      console.log("ไม่มี token หรือ token ไม่ถูกต้อง - ข้ามการบันทึกไปยัง server");
      return null;
    }
  
    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const response = await axios.post(
        `${apiURL}/api/learn/lesson/${lessonId}/video-progress`,
        {
          position: currentTime,
          duration: duration
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        console.log(`บันทึก Server: ${currentTime.toFixed(1)}/${duration.toFixed(1)}`);
        return true;
      }
    } catch (error) {
      console.error("Error saving to server:", error);
    }
    return null;
  };
  
  const loadFromServer = async () => {
    if (!isOnline) {
      console.log("ไม่สามารถเชื่อมต่ออินเทอร์เน็ต");
      return null;
    }
  
    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined') {
      console.log("ไม่มี token หรือ token ไม่ถูกต้อง - ข้ามการโหลดจาก server");
      return null;
    }
  
    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const response = await axios.get(
        `${apiURL}/api/learn/lesson/${lessonId}/video-progress`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success && response.data.progress) {
        const progressData = response.data.progress;
        console.log("โหลดจาก Server:", progressData);
        
        if (progressData.video_completed) {
          console.log("🌐 โหลดจาก Server ใน loadFromServer - วิดีโอเสร็จแล้ว");
          setIsCompleted(true);
          hasCompletedRef.current = true;
          // ✅ ป้องกันการเรียก onComplete ซ้ำ
          if (typeof onComplete === 'function') {
            onComplete();
          }
        }
        
        return {
          position: progressData.last_position_seconds || 0,
          duration: progressData.duration_seconds || 0,
          percentage: progressData.duration_seconds > 0 ? 
            (progressData.last_position_seconds / progressData.duration_seconds) * 100 : 0,
          completed: progressData.video_completed || false,
          lastUpdated: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error("Error loading from server:", error);
    }
    return null;
  };

  // เริ่มต้นการบันทึกอัตโนมัติทุก 10 วินาที
  const startAutoSave = () => {
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
    }

    saveIntervalRef.current = setInterval(async () => {
      if (playerRef.current && playerRef.current.duration > 0) {
        const currentTime = playerRef.current.currentTime;
        const duration = playerRef.current.duration;
        
        if (currentTime > 0) {
          // ตรวจสอบว่าดูจบแล้วหรือยัง
          if (currentTime >= duration * 0.9 && !hasCompletedRef.current) {
            console.log("วิดีโอดูจบแล้ว (90%) - AutoSave");
            setIsCompleted(true);
            setShowCompletionModal(true);
            hasCompletedRef.current = true;
            // ✅ ป้องกันการเรียก onComplete ซ้ำ
            if (typeof onComplete === 'function') {
              onComplete();
            }
          }
        }
      }
    }, 10000); // บันทึกทุก 10 วินาที
  };

  // เริ่มต้นการ sync ไปยัง server ทุก 30 วินาที
  const startServerSync = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    syncIntervalRef.current = setInterval(async () => {
      if (playerRef.current && playerRef.current.duration > 0) {
        const currentTime = playerRef.current.currentTime;
        const duration = playerRef.current.duration;
        await saveToServer(currentTime, duration);
      }
    }, 30000); // sync ทุก 30 วินาที
  };

  // หยุดการบันทึกอัตโนมัติ
  const stopAutoSave = () => {
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
      saveIntervalRef.current = null;
    }
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  };

  // ฟังก์ชันสำหรับดูวิดีโอซ้ำ
  const handleRewatch = () => {
    if (playerRef.current) {
      playerRef.current.currentTime = 0;
      playerRef.current.play();
      setShowCompletionModal(false);
      
      // ✅ รีเซ็ตสถานะทั้งหมด
      setProgress(0);
      hasCompletedRef.current = false;
      setIsCompleted(false);
      setShowCompletionModal(false);
      
      // ✅ ล้าง localStorage เมื่อดูซ้ำ
      const storageKey = getStorageKey();
      localStorage.removeItem(storageKey);
    }
  };

  // ฟังก์ชันสำหรับไปบทเรียนถัดไป
  const handleNextLesson = () => {
    setShowCompletionModal(false);
    // ✅ Reset state ก่อนไปบทเรียนถัดไป
    setProgress(0);
    setIsCompleted(false);
    hasCompletedRef.current = false;
    
    // ✅ ใช้ onGoToNextLesson ถ้ามี (สำหรับวิดีโอบทเรียน)
    // เพื่อไปบทเรียนถัดไป (lesson ถัดไป) แทนที่จะเป็น item ถัดไปใน section เดียวกัน
    if (onGoToNextLesson) {
      console.log("🎯 ใช้ onGoToNextLesson - ไปบทเรียนถัดไป (lesson ถัดไป)");
      onGoToNextLesson();
    } else if (onNextLesson) {
      // ✅ ใช้ onNextLesson ถ้าไม่มี onGoToNextLesson (สำหรับเนื้อหาถัดไป)
      console.log("🎯 ใช้ onNextLesson - ไปเนื้อหาถัดไป");
      onNextLesson();
    }
  };

  // ฟังก์ชันสำหรับไปทำแบบทดสอบ
  const handleGoToQuiz = () => {
    setShowCompletionModal(false);
    // ✅ Reset state ก่อนไปทำแบบทดสอบ
    setProgress(0);
    setIsCompleted(false);
    hasCompletedRef.current = false;
    
    // ✅ ใช้ onGoToNextLesson ถ้ามี (สำหรับวิดีโอบทเรียน)
    // เพื่อไปบทเรียนถัดไป (lesson ถัดไป) แทนที่จะเป็น item ถัดไปใน section เดียวกัน
    if (onGoToNextLesson) {
      console.log("🎯 ใช้ onGoToNextLesson - ไปบทเรียนถัดไป (lesson ถัดไป)");
      onGoToNextLesson();
    } else if (onGoToQuiz) {
      // ✅ ใช้ onGoToQuiz ถ้าไม่มี onGoToNextLesson (สำหรับแบบทดสอบ)
      console.log("🎯 ใช้ onGoToQuiz - ไปทำแบบทดสอบ");
      onGoToQuiz();
    }
  };

  // ตรวจสอบสถานะการเชื่อมต่อ
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ตรวจสอบการเปลี่ยนแปลงของ userId (ครั้งแรกเท่านั้น)
  useEffect(() => {
    console.log("🔍 ตรวจสอบ userId ครั้งแรก");
    checkAndClearUserData();
  }, []); // ✅ เรียกครั้งเดียวตอน mount

  // ตรวจสอบ userId เมื่อ currentUserId เปลี่ยน
  useEffect(() => {
    const userId = localStorage.getItem('userId') || 'anonymous';
    const token = localStorage.getItem('token');
  
    // ตรวจสอบการเปลี่ยนแปลงของ userId
    if (userId !== currentUserId) {
      clearOldUserData(userId);
    }
  
    // ตรวจสอบการ logout เฉพาะเมื่อ userId และ token มีค่า
    if (userId !== 'anonymous' && token) {
      checkLogout();
    }
  }, [currentUserId]); // ✅ เพิ่ม semicolon และ dependency array ครบ


  // เมื่อ lessonId หรือ youtubeId เปลี่ยน
  useEffect(() => {
    console.log(`🔄 โหลดวิดีโอใหม่: Lesson ID: ${lessonId}, YouTube ID: ${youtubeId}`);
    
    // ✅ ตรวจสอบและล้างข้อมูล user เก่าก่อน (เรียกครั้งเดียว)
    const userId = localStorage.getItem('userId') || 'anonymous';
    if (userId !== currentUserId) {
      checkAndClearUserData();
    }
    
    // ✅ รีเซ็ตสถานะทั้งหมดเมื่อเปลี่ยนบทเรียน
    hasCompletedRef.current = false;
    setProgress(0);
    setShowCompletionModal(false);
    setIsCompleted(false);
    setSavedPosition(null);
    setLastSavedTime(null);
    
    // รีเซ็ต player state
    if (playerRef.current) {
      playerRef.current.currentTime = 0;
      playerRef.current.pause();
    }
    
    // ล้าง localStorage ของบทเรียนเก่า
    const currentStorageKey = getStorageKey();
    const allKeys = Object.keys(localStorage);
    const lessonKeys = allKeys.filter(key => key.includes('video_progress_lesson_'));
    
    lessonKeys.forEach(key => {
      if (key !== currentStorageKey) {
        console.log(`ล้าง localStorage เก่า: ${key}`);
        localStorage.removeItem(key);
      }
    });
    
    // โหลดข้อมูลจาก localStorage
    const localProgress = loadFromLocalStorage();
    if (localProgress) {
      setProgress(localProgress.percentage || 0);
      setSavedPosition(localProgress.position > 0 ? localProgress.position : null);
      
      if (localProgress.completed && !hasCompletedRef.current) {
        console.log("📱 โหลดจาก localStorage - วิดีโอเสร็จแล้ว");
        setIsCompleted(true);
        hasCompletedRef.current = true;
        // ✅ ป้องกันการเรียก onComplete ซ้ำ
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }
    }
    
    // โหลดข้อมูลจาก Server
    const loadServerProgress = async () => {
      const serverProgress = await loadFromServer();
      if (serverProgress && serverProgress.position > 0) {
        setSavedPosition(serverProgress.position);
        if (serverProgress.completed && !hasCompletedRef.current) {
          console.log("🌐 โหลดจาก Server - วิดีโอเสร็จแล้ว");
          setIsCompleted(true);
          hasCompletedRef.current = true;
          // ✅ ป้องกันการเรียก onComplete ซ้ำ
          if (typeof onComplete === 'function') {
            onComplete();
          }
        }
      }
    };
    loadServerProgress();
    
    return () => {
      stopAutoSave();
    };
  }, [lessonId, youtubeId]); // ✅ ลบ onComplete ออกจาก dependency array

  // สร้าง player
  useEffect(() => {
    if (containerRef.current && youtubeId && !playerRef.current) {
      console.log(`🎬 สร้าง player ใหม่สำหรับ YouTube ID: ${youtubeId}`);
      
      // ล้าง container เดิม
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }

      // สร้าง player ใหม่
      const videoDiv = document.createElement('div');
      videoDiv.className = 'plyr__video-embed';

      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${youtubeId}?origin=${window.location.origin}&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1`;
      iframe.allowFullscreen = true;
      iframe.allow = "autoplay";

      videoDiv.appendChild(iframe);
      containerRef.current.appendChild(videoDiv);

      playerRef.current = new Plyr(videoDiv, {
        controls: ['play-large', 'play', 'current-time', 'mute', 'volume', 'fullscreen']
      });

      // เมื่อ player พร้อม
      playerRef.current.on('ready', () => {
        console.log("Player พร้อมแล้ว");
        
        // รอให้ duration โหลด
        const checkDuration = setInterval(() => {
          if (playerRef.current?.duration && playerRef.current.duration > 0) {
            clearInterval(checkDuration);
            console.log(`Duration: ${playerRef.current.duration} วินาที`);
            
            // โหลดตำแหน่งที่บันทึกไว้จาก localStorage
            const localProgress = loadFromLocalStorage();
            if (localProgress && localProgress.position > 0 && playerRef.current) {
              // ลอง seek ไปยังตำแหน่งที่บันทึก
              try {
                playerRef.current.currentTime = localProgress.position;
                console.log(`เริ่มเล่นจากตำแหน่ง: ${localProgress.position} วินาที`);
              } catch (error) {
                console.log("ไม่สามารถ seek ได้ - YouTube restriction");
              }
            }
          }
        }, 500);
      });

      // เมื่อเริ่มเล่น
      playerRef.current.on('play', () => {
        console.log("เริ่มเล่นวิดีโอ - เริ่มบันทึกอัตโนมัติ");
        startAutoSave();
        startServerSync();
      });

      // เมื่อหยุดเล่น
      playerRef.current.on('pause', () => {
        console.log("หยุดเล่นวิดีโอ - หยุดบันทึกอัตโนมัติ");
        stopAutoSave();
        
        // บันทึกทันทีเมื่อ pause
        if (playerRef.current && playerRef.current.duration > 0) {
          saveToLocalStorage(playerRef.current.currentTime, playerRef.current.duration);
          saveToServer(playerRef.current.currentTime, playerRef.current.duration);
        }
      });

      // เมื่อเวลาเปลี่ยน (สำหรับอัปเดต progress bar)
      playerRef.current.on('timeupdate', () => {
        if (playerRef.current && playerRef.current.duration > 0) {
          const currentTime = playerRef.current.currentTime;
          const duration = playerRef.current.duration;
          const currentProgress = (currentTime / duration) * 100;
          
          setProgress(currentProgress);
          
          // ตรวจสอบว่าดูจบแล้วหรือยัง (90%)
          if (currentProgress >= 90 && !hasCompletedRef.current) {
            console.log("วิดีโอดูถึง 90% - ถือว่าจบ - TimeUpdate");
            setIsCompleted(true);
            setShowCompletionModal(true);
            hasCompletedRef.current = true;
            
            // บันทึกทันที
            saveToLocalStorage(currentTime, duration);
            saveToServer(currentTime, duration);
            // ✅ ป้องกันการเรียก onComplete ซ้ำ
            if (typeof onComplete === 'function') {
              onComplete();
            }
          }
        }
      });

      // เมื่อเลื่อนตำแหน่ง
      playerRef.current.on('seeked', () => {
        if (playerRef.current && playerRef.current.duration > 0) {
          console.log("เลื่อนตำแหน่งวิดีโอ - บันทึกทันที");
          saveToLocalStorage(playerRef.current.currentTime, playerRef.current.duration);
          saveToServer(playerRef.current.currentTime, playerRef.current.duration);
        }
      });

      // เมื่อวิดีโอจบ
      playerRef.current.on('ended', () => {
        console.log("วิดีโอจบแล้ว - Ended Event");
        stopAutoSave();
        
        if (playerRef.current) {
          // บันทึกว่าดูจบแล้ว
          saveToLocalStorage(playerRef.current.duration, playerRef.current.duration);
          saveToServer(playerRef.current.duration, playerRef.current.duration);
          
          if (!hasCompletedRef.current) {
            setIsCompleted(true);
            hasCompletedRef.current = true;
            // ✅ ป้องกันการเรียก onComplete ซ้ำ
            if (typeof onComplete === 'function') {
              onComplete();
            }
          }
          
          setShowCompletionModal(true);
        }
      });

      // เมื่อเกิดข้อผิดพลาด
      playerRef.current.on('error', (e) => {
        console.error('Player error:', e);
        stopAutoSave();
      });
    }

    // Cleanup
    return () => {
      stopAutoSave();
      if (playerRef.current) {
        // บันทึกครั้งสุดท้ายก่อน destroy
        if (playerRef.current.currentTime && playerRef.current.duration) {
          saveToLocalStorage(playerRef.current.currentTime, playerRef.current.duration);
          saveToServer(playerRef.current.currentTime, playerRef.current.duration);
        }
        playerRef.current.destroy();
      }
    };
  }, [youtubeId]); // Changed dependency to only youtubeId

  // Cleanup เมื่อ component unmount
  useEffect(() => {
    return () => {
      stopAutoSave();
      // ล้างข้อมูลเมื่อ component unmount
      if (playerRef.current) {
        // บันทึกครั้งสุดท้ายก่อน destroy
        if (playerRef.current.currentTime && playerRef.current.duration) {
          saveToLocalStorage(playerRef.current.currentTime, playerRef.current.duration);
          saveToServer(playerRef.current.currentTime, playerRef.current.duration);
        }
        playerRef.current.destroy();
      }
    };
  }, []);

  if (!youtubeId) { // Changed condition to directly check youtubeId
    return (
      <div className="video-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">กำลังโหลดวิดีโอ...</span>
        </div>
        <p className="mt-3">กำลังโหลดวิดีโอ...</p>
      </div>
    );
  }

  return (
    <div className="">
      <div className="lesson-title">
        <h3>{currentLesson}</h3>
      </div>
      
      <div ref={containerRef} className="video-player"></div>
      <div className="lesson-progress">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
      
      {isCompleted && (
        <div className="completion-badge">
          <i className="fas fa-check-circle me-2"></i>
          <span>บทเรียนนี้เรียนจบแล้ว</span>
        </div>
      )}
      
      <div className="video-controls-info">
        <div className="video-status">
          {playerRef.current?.playing ? (
            <span className="status-playing">
              <i className="fas fa-play-circle me-1"></i> กำลังเล่น
            </span>
          ) : (
            <span className="status-paused">
              <i className="fas fa-pause-circle me-1"></i> หยุดชั่วคราว
            </span>
          )}
        </div>
        <div className="video-progress-info">
          <span>
            <i className="fas fa-chart-line me-1"></i> 
            {progress.toFixed(0)}% ของวิดีโอ
          </span>
          {lastSavedTime && (
            <span className="ms-3 text-muted small">
              <i className="fas fa-save me-1"></i>
              บันทึกล่าสุด: {lastSavedTime.toLocaleTimeString()}
            </span>
          )}
          {savedPosition && (
            <span className="ms-3 text-info small">
              <i className="fas fa-bookmark me-1"></i>
              ตำแหน่งที่บันทึก: {Math.floor(savedPosition / 60)}:{(savedPosition % 60).toString().padStart(2, '0')}
            </span>
          )}
          {!isOnline && (
            <span className="ms-3 text-warning small">
              <i className="fas fa-wifi-slash me-1"></i>
              ทำงานแบบออฟไลน์
            </span>
          )}
        </div>
      </div>

      {/* ปุ่มควบคุมเพิ่มเติม */}
      <div className="video-additional-controls mt-0 p-3 bg-white shadow-sm rounded-bottom">
        {isCompleted && (
          <>
            <button 
              className="btn-rewatch-inline me-2" 
              onClick={handleRewatch}
            >
              <i className="fas fa-redo me-1"></i> ดูซ้ำ
            </button>
            
            {hasQuiz && onGoToQuiz && (
              <button 
                className="btn-go-to-quiz-inline me-2" 
                onClick={handleGoToQuiz}
              >
                <i className="fas fa-tasks me-1"></i> ทำแบบทดสอบ
              </button>
            )}
            
            {onNextLesson && (
              <button 
                className="btn-next-lesson-inline" 
                onClick={handleNextLesson}
              >
                <i className="fas fa-arrow-right me-1"></i> ไปเนื้อหาถัดไป
              </button>
            )}
          </>
        )}
      </div>

      {/* Modal เมื่อดูวิดีโอจบ */}
      {showCompletionModal && (
        <div className="video-completion-modal">
          <div className="video-completion-modal-content">
            <div className="video-completion-header">
              <h4>คุณดูวิดีโอจบแล้ว</h4>
              <button 
                className="close-button" 
                onClick={() => setShowCompletionModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="video-completion-body">
              <div className="completion-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h5>ยินดีด้วย! คุณได้เรียนรู้เนื้อหาบทเรียนนี้เรียบร้อยแล้ว</h5>
              <p>คุณต้องการทำอะไรต่อไป?</p>
              <div className="video-completion-buttons">
                <button 
                  className="btn-rewatch" 
                  onClick={handleRewatch}
                >
                  <i className="fas fa-redo me-1"></i> ดูซ้ำ
                </button>
                
                {hasQuiz && onGoToQuiz && (
                  <button 
                    className="btn-go-to-quiz" 
                    onClick={handleGoToQuiz}
                  >
                    <i className="fas fa-tasks me-1"></i> ทำแบบทดสอบ
                  </button>
                )}
                
                {onNextLesson && (
                  <button 
                    className="btn-next-lesson" 
                    onClick={handleNextLesson}
                  >
                    <i className="fas fa-arrow-right me-1"></i> ไปเนื้อหาถัดไป
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonVideo;

