import { useEffect, useRef, useState } from "react";

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
}

const LessonVideo = ({ 
  onComplete, 
  currentLesson, 
  youtubeId = 'BboMpayJomw', 
  lessonId, 
  onNextLesson,
  hasQuiz = false,
  onGoToQuiz
}: LessonVideoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  const hasCompletedRef = useRef(false);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  // สร้าง key สำหรับ localStorage
  const getStorageKey = () => {
    return `video_progress_lesson_${lessonId}_${youtubeId}`;
  };

  // บันทึกความก้าวหน้าไปที่ localStorage
  const saveToLocalStorage = (currentTime: number, duration: number) => {
    try {
      const storageKey = getStorageKey();
      const progressData = {
        position: currentTime,
        duration: duration,
        percentage: (currentTime / duration) * 100,
        completed: currentTime >= duration * 0.9,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(storageKey, JSON.stringify(progressData));
      setLastSavedTime(new Date());
      
      console.log(`บันทึก localStorage: ${currentTime.toFixed(1)}/${duration.toFixed(1)} (${progressData.percentage.toFixed(1)}%)`);
      
      return progressData;
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      return null;
    }
  };

  // โหลดความก้าวหน้าจาก localStorage
  const loadFromLocalStorage = () => {
    try {
      const storageKey = getStorageKey();
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        const progressData = JSON.parse(savedData);
        console.log("โหลดจาก localStorage:", progressData);
        return progressData;
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
    return null;
  };

  // เริ่มต้นการบันทึกอัตโนมัติทุก 10 วินาที
  const startAutoSave = () => {
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
    }

    saveIntervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.duration > 0) {
        const currentTime = playerRef.current.currentTime;
        const duration = playerRef.current.duration;
        
        if (currentTime > 0) {
          const savedData = saveToLocalStorage(currentTime, duration);
          
          // ตรวจสอบว่าดูจบแล้วหรือยัง
          if (savedData && savedData.completed && !hasCompletedRef.current) {
            console.log("วิดีโอดูจบแล้ว (90%)");
            setIsCompleted(true);
            setShowCompletionModal(true);
            hasCompletedRef.current = true;
            onComplete();
          }
        }
      }
    }, 10000); // บันทึกทุก 10 วินาที
  };

  // หยุดการบันทึกอัตโนมัติ
  const stopAutoSave = () => {
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
      saveIntervalRef.current = null;
    }
  };

  // ฟังก์ชันสำหรับดูวิดีโอซ้ำ
  const handleRewatch = () => {
    if (playerRef.current) {
      playerRef.current.currentTime = 0;
      playerRef.current.play();
      setShowCompletionModal(false);
      
      // รีเซ็ตสถานะ
      setProgress(0);
      hasCompletedRef.current = false;
      setIsCompleted(false);
      
      // ล้างข้อมูลใน localStorage
      const storageKey = getStorageKey();
      localStorage.removeItem(storageKey);
    }
  };

  // ฟังก์ชันสำหรับไปบทเรียนถัดไป
  const handleNextLesson = () => {
    setShowCompletionModal(false);
    if (onNextLesson) {
      onNextLesson();
    }
  };

  // ฟังก์ชันสำหรับไปทำแบบทดสอบ
  const handleGoToQuiz = () => {
    setShowCompletionModal(false);
    if (onGoToQuiz) {
      onGoToQuiz();
    }
  };

  // เมื่อ lessonId หรือ youtubeId เปลี่ยน
  useEffect(() => {
    console.log(`โหลดวิดีโอ Lesson ID: ${lessonId}, YouTube ID: ${youtubeId}`);
    
    // รีเซ็ตสถานะ
    hasCompletedRef.current = false;
    setProgress(0);
    setShowCompletionModal(false);
    setIsCompleted(false);
    setIsLoading(true);
    
    // โหลดข้อมูลจาก localStorage
    const savedProgress = loadFromLocalStorage();
    if (savedProgress) {
      setProgress(savedProgress.percentage || 0);
      
      if (savedProgress.completed) {
        setIsCompleted(true);
        hasCompletedRef.current = true;
        onComplete();
      }
    }
    
    setIsLoading(false);
    
    return () => {
      stopAutoSave();
    };
  }, [lessonId, youtubeId]);

  // สร้าง player
  useEffect(() => {
    if (containerRef.current && !isLoading) {
      console.log(`สร้าง player สำหรับ YouTube ID: ${youtubeId}`);
      
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
            
            // โหลดตำแหน่งที่บันทึกไว้
            const savedProgress = loadFromLocalStorage();
            if (savedProgress && savedProgress.position > 0) {
              playerRef.current.currentTime = savedProgress.position;
              console.log(`เริ่มเล่นจากตำแหน่ง: ${savedProgress.position} วินาที`);
            }
          }
        }, 500);
      });

      // เมื่อเริ่มเล่น
      playerRef.current.on('play', () => {
        console.log("เริ่มเล่นวิดีโอ - เริ่มบันทึกอัตโนมัติ");
        startAutoSave();
      });

      // เมื่อหยุดเล่น
      playerRef.current.on('pause', () => {
        console.log("หยุดเล่นวิดีโอ - หยุดบันทึกอัตโนมัติ");
        stopAutoSave();
        
        // บันทึกทันทีเมื่อ pause
        if (playerRef.current && playerRef.current.duration > 0) {
          saveToLocalStorage(playerRef.current.currentTime, playerRef.current.duration);
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
            console.log("วิดีโอดูถึง 90% - ถือว่าจบ");
            setIsCompleted(true);
            setShowCompletionModal(true);
            hasCompletedRef.current = true;
            
            // บันทึกทันที
            saveToLocalStorage(currentTime, duration);
            onComplete();
          }
        }
      });

      // เมื่อเลื่อนตำแหน่ง
      playerRef.current.on('seeked', () => {
        if (playerRef.current && playerRef.current.duration > 0) {
          console.log("เลื่อนตำแหน่งวิดีโอ - บันทึกทันที");
          saveToLocalStorage(playerRef.current.currentTime, playerRef.current.duration);
        }
      });

      // เมื่อวิดีโอจบ
      playerRef.current.on('ended', () => {
        console.log("วิดีโอจบแล้ว");
        stopAutoSave();
        
        if (playerRef.current) {
          // บันทึกว่าดูจบแล้ว
          saveToLocalStorage(playerRef.current.duration, playerRef.current.duration);
          
          if (!hasCompletedRef.current) {
            setIsCompleted(true);
            hasCompletedRef.current = true;
            onComplete();
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
        }
        playerRef.current.destroy();
      }
    };
  }, [isLoading, youtubeId]);

  // Cleanup เมื่อ component unmount
  useEffect(() => {
    return () => {
      stopAutoSave();
    };
  }, []);

  if (isLoading) {
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
        </div>
      </div>

      {/* ปุ่มควบคุมเพิ่มเติม */}
      {isCompleted && (
        <div className="video-additional-controls mt-0 p-3 bg-white shadow-sm rounded-bottom">
          <button 
            className="btn-rewatch-inline" 
            onClick={handleRewatch}
          >
            <i className="fas fa-redo me-1"></i> ดูซ้ำ
          </button>
          
          {hasQuiz && onGoToQuiz && (
            <button 
              className="btn-go-to-quiz-inline" 
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
        </div>
      )}

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

