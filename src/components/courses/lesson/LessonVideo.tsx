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
  // ✅ เพิ่ม prop ใหม่สำหรับการไปเนื้อหาล่าสุดที่ดูได้
  onGoToLatestContent?: () => void;
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
  onGoToNextLesson,
  // ✅ เพิ่ม prop ใหม่สำหรับการไปเนื้อหาล่าสุดที่ดูได้
  onGoToLatestContent
}: LessonVideoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  const hasCompletedRef = useRef(false);
  const lastSaveTimeRef = useRef(0);

  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [loadedPosition, setLoadedPosition] = useState<number | null>(null);

  // ✅ สร้าง key สำหรับ localStorage (ไม่แยกตาม user)
  const getStorageKey = () => {
    const key = `video_progress_lesson_${lessonId}_${youtubeId}`;
    return key;
  };


  // ✅ บันทึกความก้าวหน้าไปที่ localStorage (ไม่แยกตาม user)
  const saveToLocalStorage = (currentTime: number, duration: number) => {
    const percentage = (currentTime / duration) * 100;
    const isCompleted = percentage >= 100;
    
    // ✅ ถ้าดูครบ 100% แล้ว ให้ล้างข้อมูลออกจาก localStorage
    if (isCompleted) {
      const storageKey = getStorageKey();
      localStorage.removeItem(storageKey);
      return null;
    }
    
    const progressData = {
      position: currentTime,
      duration: duration,
      percentage: percentage,
      completed: isCompleted,
      lastUpdated: new Date().toISOString()
    };
    
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(progressData));
    setLastSavedTime(new Date());
    
    return progressData;
  };

  // ✅ โหลดความก้าวหน้าจาก localStorage (ไม่แยกตาม user)
  const loadFromLocalStorage = () => {
    const storageKey = getStorageKey();
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        const progressData = JSON.parse(saved);
        return progressData;
      } catch (error) {
        console.error("Error parsing localStorage data:", error);
      }
    } else {
    }
    return null;
  };

  // บันทึกความก้าวหน้าไปที่ Server
  const saveToServer = async (completed?: boolean) => {
    if (!isOnline) {
      return null;
    }
  
    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined') {
      return null;
    }
  
    try {
      const apiURL = import.meta.env.VITE_API_URL;
      
      // ส่งเฉพาะเมื่อ video เสร็จแล้วเท่านั้น
      if (completed) {
        // แสดง loading state
        setSaveStatus('saving');
        
        const response = await axios.post(
          `${apiURL}/api/learn/lesson/${lessonId}/video-progress`,
          {
            completed: true
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          setSaveStatus('success');
          // ซ่อน success message หลังจาก 3 วินาที
          setTimeout(() => setSaveStatus('idle'), 3000);
          return true;
        } else {
          console.error("❌ Server response not successful:", response.data);
          setSaveStatus('error');
          // ซ่อน error message หลังจาก 5 วินาที
          setTimeout(() => setSaveStatus('idle'), 5000);
          return false;
        }
      }
    } catch (error) {
      console.error("❌ Error saving to server:", error);
      setSaveStatus('error');
      // ซ่อน error message หลังจาก 5 วินาที
      setTimeout(() => setSaveStatus('idle'), 5000);
      return false;
    }
    return null;
  };
  
  const loadFromServer = async () => {
    if (!isOnline) {
      return null;
    }
  
    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined') {
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
        
        if (progressData.video_completed) {
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
    
    // ✅ ใช้ onGoToLatestContent ถ้ามี (สำหรับไปเนื้อหาล่าสุดที่ดูได้)
    if (onGoToLatestContent) {
      onGoToLatestContent();
    } else if (onGoToNextLesson) {
      // ✅ ใช้ onGoToNextLesson ถ้าไม่มี onGoToLatestContent (สำหรับวิดีโอบทเรียน)
      onGoToNextLesson();
    } else if (onNextLesson) {
      // ✅ ใช้ onNextLesson ถ้าไม่มี onGoToNextLesson (สำหรับเนื้อหาถัดไป)
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
    
    // ✅ ใช้ onGoToLatestContent ถ้ามี (สำหรับไปเนื้อหาล่าสุดที่ดูได้)
    if (onGoToLatestContent) {
      onGoToLatestContent();
    } else if (onGoToNextLesson) {
      // ✅ ใช้ onGoToNextLesson ถ้าไม่มี onGoToLatestContent (สำหรับวิดีโอบทเรียน)
      onGoToNextLesson();
    } else if (onGoToQuiz) {
      // ✅ ใช้ onGoToQuiz ถ้าไม่มี onGoToNextLesson (สำหรับแบบทดสอบ)
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

  // ตรวจสอบ localStorage เมื่อโหลดครั้งแรก
  useEffect(() => {
    // ไม่ต้องแสดง debug logs
  }, []); // ✅ เรียกครั้งเดียวตอน mount


  // เมื่อ lessonId หรือ youtubeId เปลี่ยน
  useEffect(() => {
    
    // ✅ รีเซ็ตสถานะทั้งหมดเมื่อเปลี่ยนบทเรียน (แต่ไม่รีเซ็ต progress จนกว่าจะโหลดจาก localStorage)
    hasCompletedRef.current = false;
    setShowCompletionModal(false);
    setLastSavedTime(null);
    setLoadedPosition(null);
    
    // รีเซ็ต player state
    if (playerRef.current) {
      try {
        playerRef.current.currentTime = 0;
        playerRef.current.pause();
      } catch (error) {
      }
    }
    
    // ✅ ล้าง localStorage ของบทเรียนเก่าของ user ปัจจุบัน (เฉพาะเมื่อเปลี่ยนบทเรียน)
    const currentStorageKey = getStorageKey();
    const userId = localStorage.getItem('userId') || 'anonymous';
    const allKeys = Object.keys(localStorage);
    const userLessonKeys = allKeys.filter(key => key.includes(`video_progress_user_${userId}_lesson_`));
    
    
    userLessonKeys.forEach(key => {
      if (key !== currentStorageKey) {
        localStorage.removeItem(key);
      } else {
      }
    });
    
    // โหลดข้อมูลจาก localStorage ก่อน
    const localProgress = loadFromLocalStorage();
    if (localProgress) {
      setProgress(localProgress.percentage || 0);
      
      if (localProgress.completed) {
        setIsCompleted(true);
        hasCompletedRef.current = true;
        // ✅ ป้องกันการเรียก onComplete ซ้ำ
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }
    } else {
      setProgress(0);
      setIsCompleted(false);
    }
    
    // โหลดข้อมูลจาก Server
    const loadServerProgress = async () => {
      const serverProgress = await loadFromServer();
      if (serverProgress && serverProgress.position > 0) {
        // Server position loaded
        if (serverProgress.completed && !hasCompletedRef.current) {
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
      // stopAutoSave(); // ลบออก
    };
  }, [lessonId, youtubeId]); // ✅ ลบ onComplete ออกจาก dependency array

  // สร้าง player
  useEffect(() => {
    if (containerRef.current && youtubeId) {
      
      // ✅ Cleanup player เก่าก่อนสร้างใหม่
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
        }
        playerRef.current = null;
      }
      
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
        
        // รอให้ duration โหลด
        const checkDuration = setInterval(() => {
          if (playerRef.current?.duration && playerRef.current.duration > 0) {
            clearInterval(checkDuration);
            
            // โหลดตำแหน่งที่บันทึกไว้จาก localStorage
            const localProgress = loadFromLocalStorage();
            if (localProgress && localProgress.position > 0 && playerRef.current) {
              // ลอง seek ไปยังตำแหน่งที่บันทึก
              try {
                // ✅ ตรวจสอบว่า player ยังมีอยู่และพร้อมใช้งาน
                if (playerRef.current && playerRef.current.currentTime !== undefined) {
                  // รอสักครู่ให้ player พร้อม
                  setTimeout(() => {
                    if (playerRef.current) {
                      playerRef.current.currentTime = localProgress.position;
                      setLoadedPosition(localProgress.position);
                    }
                  }, 1000); // รอ 1 วินาที
                } else {
                }
              } catch (error) {
              }
            } else {
            }
          }
        }, 500);
      });

      // เมื่อเริ่มเล่น
      playerRef.current.on('play', () => {
        // ไม่ต้องบันทึกอัตโนมัติแล้ว
      });

      // เมื่อหยุดเล่น
      playerRef.current.on('pause', () => {
        if (playerRef.current && playerRef.current.duration > 0) {
          saveToLocalStorage(playerRef.current.currentTime, playerRef.current.duration);
        }
      });

      // เมื่อเวลาเปลี่ยน (สำหรับอัปเดต progress bar)
      playerRef.current.on('timeupdate', async () => {
        if (playerRef.current && playerRef.current.duration > 0) {
          const currentTime = playerRef.current.currentTime;
          const duration = playerRef.current.duration;
          const currentProgress = (currentTime / duration) * 100;
          
          setProgress(currentProgress);
          
          // ✅ บันทึกอัตโนมัติทุกๆ 3 วินาที
          const now = Date.now();
          const SAVE_INTERVAL = 3000; // 3 วินาที
          
          if (now - lastSaveTimeRef.current >= SAVE_INTERVAL) {
            saveToLocalStorage(currentTime, duration);
            lastSaveTimeRef.current = now;
          }
          
          // ตรวจสอบว่าดูจบแล้วหรือยัง (90%)
          if (currentProgress >= 90 && !hasCompletedRef.current) {
            
            // บันทึกเฉพาะเมื่อจบแล้ว
            saveToLocalStorage(currentTime, duration);
            
            // ตรวจสอบผลลัพธ์จาก server ก่อนอัปเดตสถานะ
            const serverResult = await saveToServer(true);
            if (serverResult === true) {
              setIsCompleted(true);
              setShowCompletionModal(true);
              hasCompletedRef.current = true;
              
              // ✅ ป้องกันการเรียก onComplete ซ้ำ
              if (typeof onComplete === 'function') {
                onComplete();
              }
            } else {
              console.warn("⚠️ ไม่สามารถบันทึกไปยัง server ได้ - ไม่อัปเดตสถานะ");
            }
          }
        }
      });

      // เมื่อเลื่อนตำแหน่ง
      playerRef.current.on('seeked', () => {
        if (playerRef.current && playerRef.current.duration > 0) {
          saveToLocalStorage(playerRef.current.currentTime, playerRef.current.duration);
          // ไม่ส่งไป server เมื่อ seek
        }
      });

      // เมื่อวิดีโอจบ
      playerRef.current.on('ended', async () => {
        
        if (playerRef.current) {
          // บันทึกว่าดูจบแล้ว
          saveToLocalStorage(playerRef.current.duration, playerRef.current.duration);
          
          // ตรวจสอบผลลัพธ์จาก server ก่อนอัปเดตสถานะ
          const serverResult = await saveToServer(true);
          if (serverResult === true) {
            if (!hasCompletedRef.current) {
              setIsCompleted(true);
              hasCompletedRef.current = true;
              // ✅ ป้องกันการเรียก onComplete ซ้ำ
              if (typeof onComplete === 'function') {
                onComplete();
              }
            }
            setShowCompletionModal(true);
          } else {
            console.warn("⚠️ ไม่สามารถบันทึกไปยัง server ได้ - ไม่อัปเดตสถานะ");
          }
        }
      });

      // เมื่อเกิดข้อผิดพลาด
      playerRef.current.on('error', (e) => {
        console.error('Player error:', e);
      });
    }

    // Cleanup
    return () => {
      if (playerRef.current) {
        try {
          // บันทึกครั้งสุดท้ายก่อน destroy
          if (playerRef.current.currentTime && playerRef.current.duration) {
            saveToLocalStorage(playerRef.current.currentTime, playerRef.current.duration);
            saveToServer(hasCompletedRef.current);
          }
          playerRef.current.destroy();
        } catch (error) {
        } finally {
          playerRef.current = null;
        }
      }
    };
  }, [youtubeId]); // Changed dependency to only youtubeId

  // Cleanup เมื่อ component unmount
  useEffect(() => {
    return () => {
      // บันทึกครั้งสุดท้ายก่อน destroy
      if (playerRef.current) {
        try {
          if (playerRef.current.currentTime && playerRef.current.duration) {
            saveToLocalStorage(playerRef.current.currentTime, playerRef.current.duration);
            saveToServer(hasCompletedRef.current);
          }
          playerRef.current.destroy();
        } catch (error) {
        }
      }
    };
  }, []);

  if (!youtubeId) {
    return (
      <div className="modern-video-container">
        <div className="video-loading">
          <div className="loading-spinner"></div>
          <p>กำลังโหลดวิดีโอ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-video-container">
      {/* Video Header */}
      <div className="video-header">
        <h2 className="video-title">{currentLesson}</h2>
        <div className="video-progress-indicator">
          {Math.round(progress)}% เสร็จสิ้น
        </div>
      </div>

      {/* Video Player Container */}
      <div className="video-player-container">
        <div ref={containerRef} className="video-player"></div>
        
        {/* Completion Badge */}
        {isCompleted && (
          <div className="completion-badge">
            <i className="fas fa-check-circle"></i>
            <span>เรียนจบแล้ว</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="video-progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Video Controls */}
      <div className="video-controls">
        <div className="video-status">
          {playerRef.current?.playing ? (
            <span className="status-playing">
              <i className="fas fa-play-circle"></i> กำลังเล่น
            </span>
          ) : (
            <span className="status-paused">
              <i className="fas fa-pause-circle"></i> หยุดชั่วคราว
            </span>
          )}
        </div>
        <div className="video-time">
          {lastSavedTime && (
            <span>
              <i className="fas fa-save"></i> บันทึก: {lastSavedTime.toLocaleTimeString()}
            </span>
          )}
          {!isOnline && (
            <span>
              <i className="fas fa-wifi-slash"></i> ออฟไลน์
            </span>
          )}
          {saveStatus === 'saving' && (
            <span>
              <i className="fas fa-spinner fa-spin"></i> กำลังบันทึก...
            </span>
          )}
          {saveStatus === 'success' && (
            <span>
              <i className="fas fa-check-circle"></i> บันทึกสำเร็จ
            </span>
          )}
          {saveStatus === 'error' && (
            <span>
              <i className="fas fa-exclamation-circle"></i> บันทึกไม่สำเร็จ
            </span>
          )}
          {loadedPosition && (
            <span>
              <i className="fas fa-bookmark"></i> โหลดจาก: {Math.floor(loadedPosition / 60)}:{(loadedPosition % 60).toString().padStart(2, '0')}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {isCompleted && (
        <div className="video-actions">
          <button 
            className="btn-modern btn-secondary" 
            onClick={handleRewatch}
          >
            <i className="fas fa-redo"></i>
            ดูซ้ำ
          </button>
          
          {hasQuiz && onGoToQuiz && (
            <button 
              className="btn-modern btn-primary" 
              onClick={handleGoToQuiz}
            >
              <i className="fas fa-tasks"></i>
              ทำแบบทดสอบ
            </button>
          )}
          
          {onNextLesson && (
            <button 
              className="btn-modern btn-primary" 
              onClick={handleNextLesson}
            >
              <i className="fas fa-arrow-right"></i>
              ไปเนื้อหาถัดไป
            </button>
          )}
        </div>
      )}

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="completion-modal">
          <div className="completion-modal-content">
            <div className="completion-header">
              <div className="completion-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h3 className="completion-title">ยินดีด้วย!</h3>
              <p className="completion-subtitle">คุณได้เรียนรู้เนื้อหาบทเรียนนี้เรียบร้อยแล้ว</p>
            </div>
            <div className="completion-body">
              <p>คุณต้องการทำอะไรต่อไป?</p>
              <div className="completion-buttons">
                <button 
                  className="btn-modern btn-secondary" 
                  onClick={handleRewatch}
                >
                  <i className="fas fa-redo"></i>
                  ดูซ้ำ
                </button>
                
                {hasQuiz && onGoToQuiz && (
                  <button 
                    className="btn-modern btn-primary" 
                    onClick={handleGoToQuiz}
                  >
                    <i className="fas fa-tasks"></i>
                    ทำแบบทดสอบ
                  </button>
                )}
                
                {onNextLesson && (
                  <button 
                    className="btn-modern btn-primary" 
                    onClick={handleNextLesson}
                  >
                    <i className="fas fa-arrow-right"></i>
                    ไปเนื้อหาถัดไป
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

