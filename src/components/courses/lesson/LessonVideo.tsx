import { useEffect, useRef, useState } from "react";
import axios from 'axios';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import './LessonVideo.css';

const API_URL = import.meta.env.VITE_API_URL;

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
  const hasCompletedRef = useRef(false); // ใช้ ref เพื่อติดตามว่าได้ทำการ complete แล้วหรือยัง
  const lastSavedPositionRef = useRef<number>(0);

  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  // บันทึกความก้าวหน้าการดูวิดีโอ
  const saveVideoProgress = async (position: number, duration: number) => {
    console.log("NEW POSITION", position)
    console.log("NEW DURATION", duration)
    try {
      // ถ้าเคย complete แล้ว และไม่ได้อยู่ใกล้จุดจบ ไม่ต้องส่ง API อีก
      if (hasCompletedRef.current && position < duration * 0.9) {
        console.log("Video already completed, not sending progress update");
        console.log("TEST COMPLETE VIDEO")
        return;
      }
      
      console.log(`บันทึกความก้าวหน้า: ${position.toFixed(2)}/${duration.toFixed(2)} (${(position/duration*100).toFixed(2)}%)`);
      
      // บันทึกตำแหน่งล่าสุดที่บันทึก
      lastSavedPositionRef.current = position;
      setLastSavedTime(new Date());
      
      const response = await axios.post(`${API_URL}/api/learn/lesson/${lessonId}/video-progress`,
        { position, duration },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // ตรวจสอบว่าการบันทึกสำเร็จหรือไม่
      if (response.data.success) {
        // ถ้าตำแหน่งปัจจุบันมากกว่า 90% ของวิดีโอ ให้ถือว่าดูจบแล้ว
        if (position >= duration * 0.9 && !hasCompletedRef.current) {
          console.log("วิดีโอดูจบแล้ว (>90%)");
          setIsCompleted(true);
          setShowCompletionModal(true);
          hasCompletedRef.current = true;
          onComplete();
        }
      }
    } catch (error) {
      console.error("Error saving video progress:", error);
    }
  };

  // ดึงข้อมูลความก้าวหน้าการดูวิดีโอ
  const fetchVideoProgress = async () => {
    if (lessonId <= 0) return;

    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/learn/lesson/${lessonId}/video-progress`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success && response.data.progress) {
        const { last_position_seconds, duration_seconds, video_completed } = response.data.progress;
        
        console.log("ข้อมูลความก้าวหน้า:", {
          last_position_seconds,
          duration_seconds,
          video_completed
        });

        // ตั้งค่าตำแหน่งล่าสุดที่บันทึก
        if (last_position_seconds) {
          lastSavedPositionRef.current = last_position_seconds;
        }
        
        // ตั้งค่า duration ถ้ามี
        if (duration_seconds) {
      
        }

        // ถ้าวิดีโอดูจบแล้ว
        if (video_completed && !hasCompletedRef.current) {
          console.log("วิดีโอนี้ดูจบแล้ว (จากข้อมูลในฐานข้อมูล) และยังไม่เคย complete");
          setIsCompleted(true);
          hasCompletedRef.current = true;
          onComplete();
        } else if (last_position_seconds && duration_seconds) {
          const progressPercentage = (last_position_seconds / duration_seconds) * 100;
          console.log("Progress from API:", progressPercentage);
          if (progressPercentage >= 90 && !hasCompletedRef.current) {
            setIsCompleted(true);
            hasCompletedRef.current = true;
            onComplete();
          }
        }
      }
    } catch (error) {
      console.error("Error fetching video progress:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันสำหรับดูวิดีโอซ้ำ
  const handleRewatch = () => {
    if (playerRef.current) {
      playerRef.current.currentTime = 0;
      playerRef.current.play();
      setShowCompletionModal(false);
    }
  };

  // ฟังก์ชันสำหรับไปบทเรียนถัดไป
  const handleNextLesson = () => {
    setShowCompletionModal(false);
    if (onNextLesson) {
      onNextLesson();
    }
    setIsCompleted(false)
  };

  // ฟังก์ชันสำหรับไปทำแบบทดสอบ
  const handleGoToQuiz = () => {
    setShowCompletionModal(false);
    if (onGoToQuiz) {
      onGoToQuiz();
    }
    setIsCompleted(false)
  };

  // เมื่อ lessonId เปลี่ยน
  useEffect(() => {
    console.log(`โหลดวิดีโอบทเรียน ID: ${lessonId}`);
    
    const loadProgress = async () => {
      // รีเซ็ต refs และ state เมื่อ lessonId เปลี่ยน
      hasCompletedRef.current = false;
      lastSavedPositionRef.current = 0;
      setProgress(0);
      setShowCompletionModal(false);
      setIsCompleted(false);
      console.log("After reset - lastSavedPositionRef:", lastSavedPositionRef.current);
      
      // ดึงความก้าวหน้าก่อน
      await fetchVideoProgress();
    };
    
    loadProgress();
    
    // ยกเลิก interval เมื่อ component unmount หรือ lessonId เปลี่ยน
    return () => {
      hasCompletedRef.current = false;
    };
  }, [lessonId, youtubeId]);

  useEffect(() => {
    console.log("isCompleted state updated to:", isCompleted);
  }, [isCompleted]);

  // สร้าง player เมื่อ component โหลดหรือ lessonId เปลี่ยน
  useEffect(() => {
    if (containerRef.current && !isLoading) {
      console.log(`กำลังสร้าง player สำหรับวิดีโอ YouTube ID: ${youtubeId}`);
      
      // ลบ player เดิมถ้ามี
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
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen']
      });

      // เมื่อ player พร้อม
      playerRef.current.on('ready', () => {
        console.log("Player พร้อมแล้ว");
        
        // ตรวจสอบ duration จริงหลังจาก player พร้อม
        const checkDuration = setInterval(() => {
          if (playerRef.current?.duration && playerRef.current.duration > 0) {
            console.log(`Duration ของวิดีโอ: ${playerRef.current.duration} วินาที`);
  
            clearInterval(checkDuration);
            
            // ตั้งค่าตำแหน่งเริ่มต้นของวิดีโอ
            if (lastSavedPositionRef.current > 0 && playerRef.current) {
              playerRef.current.currentTime = lastSavedPositionRef.current;
              console.log(`ตั้งค่าตำแหน่งเริ่มต้นที่: ${playerRef.current.currentTime} วินาที`);
            }
          }
        }, 500);
      });

      // เมื่อเวลาวิดีโอเปลี่ยน
      playerRef.current.on('timeupdate', () => {
        if (playerRef.current && playerRef.current.duration > 0) {
          const currentTime = playerRef.current.currentTime;
          const duration = playerRef.current.duration;
          const currentProgress = (currentTime / duration) * 100;
          
          // อัปเดตความก้าวหน้า
          setProgress(currentProgress);
          
          // เมื่อถึง 90% และยังไม่เคย complete
          if (currentProgress >= 90 && !hasCompletedRef.current) {
            console.log("วิดีโอดูถึง 90% แล้ว - ถือว่าดูจบ");
            setIsCompleted(true);
            setShowCompletionModal(true);
            hasCompletedRef.current = true;
            
            // บันทึกความก้าวหน้า
            saveVideoProgress(currentTime, duration);
            
            // แจ้ง parent component ว่าดูจบแล้ว
            onComplete();
          }
        }
      });

      // เมื่อหยุดวิดีโอชั่วคราว
      playerRef.current.on('pause', () => {
        if (playerRef.current) {
          console.log("วิดีโอถูกหยุดชั่วคราว - บันทึกความก้าวหน้า");
          saveVideoProgress(playerRef.current.currentTime, playerRef.current.duration);
        }
      });

      // เมื่อมีการเลื่อนตำแหน่งวิดีโอ
      playerRef.current.on('seeked', () => {
        if (playerRef.current) {
          console.log("มีการเลื่อนตำแหน่งวิดีโอ - บันทึกความก้าวหน้า");
          saveVideoProgress(playerRef.current.currentTime, playerRef.current.duration);
        }
      });

      // เมื่อวิดีโอจบ
      playerRef.current.on('ended', () => {
        if (playerRef.current) {
          console.log("วิดีโอจบแล้ว - บันทึกความก้าวหน้าและแสดง modal");
          
          // บันทึกความก้าวหน้า - ใช้ duration เป็นทั้ง position และ duration
          saveVideoProgress(playerRef.current.duration, playerRef.current.duration);
          
          // ตั้งค่าว่าดูจบแล้ว (ถ้ายังไม่เคยตั้งค่า)
          if (!hasCompletedRef.current) {
            setIsCompleted(true);
            hasCompletedRef.current = true;
            onComplete();
          }
          
          // แสดง modal เมื่อวิดีโอจบ
          setShowCompletionModal(true);
        }
      });

      // เมื่อเกิดข้อผิดพลาด
      playerRef.current.on('error', (e) => {
        console.error('Player error:', e);
      });
    }

    // ยกเลิก interval และบันทึกความก้าวหน้าเมื่อ component unmount
    return () => {
      if (playerRef.current) {
        // console.log("Component unmount - บันทึกความก้าวหน้าครั้งสุดท้าย");
        // saveVideoProgress(
        //   playerRef.current.currentTime,
        //   playerRef.current.duration
        // );
        playerRef.current.destroy();
      }
    };
  }, [currentLesson, youtubeId, lessonId, isLoading]);

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
    <div className="video-lesson-container">
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
        <div className="video-additional-controls">
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

