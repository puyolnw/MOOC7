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
}

const LessonVideo = ({ onComplete, currentLesson, youtubeId = 'BboMpayJomw', lessonId, onNextLesson }: LessonVideoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  const hasCompletedRef = useRef(false); // ใช้ ref เพื่อติดตามว่าได้ทำการ complete แล้วหรือยัง

  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0); 
  console.log("Video Duration:", videoDuration);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const saveVideoProgress = async (position: number, duration: number) => {
    try {
      // ถ้าเคย complete แล้ว ไม่ต้องส่ง API อีก
      if (hasCompletedRef.current && position >= duration * 0.9) {
        console.log("Video already completed, not sending progress update");
        return;
      }
      
      await axios.post(`${API_URL}/api/learn/lesson/${lessonId}/video-progress`,
        { position, duration },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
    } catch (error) {
      console.error("Error saving video progress:", error);
    }
  };

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

        if (playerRef.current && last_position_seconds) {
          playerRef.current.currentTime = last_position_seconds;
        }
        if (duration_seconds) {
          setVideoDuration(duration_seconds);
        }

        if (video_completed) {
          setIsCompleted(true);
          hasCompletedRef.current = true; // บันทึกว่าได้ complete แล้ว
          onComplete();
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
  };

  useEffect(() => {
    fetchVideoProgress();
    
    // Reset refs when lessonId changes
    return () => {
      hasCompletedRef.current = false;
    };
  }, [lessonId]);

  useEffect(() => {
    if (containerRef.current && !isLoading) {
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }

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

      playerRef.current.on('ready', () => {
        // ดึง duration จริง ๆ หลัง ready
        const checkDuration = setInterval(() => {
          if (playerRef.current?.duration && playerRef.current.duration > 0) {
            setVideoDuration(playerRef.current.duration);
            clearInterval(checkDuration);
          }
        }, 500);
      });

      playerRef.current.on('timeupdate', () => {
        if (playerRef.current && playerRef.current.duration > 0) {
          const currentProgress = (playerRef.current.currentTime / playerRef.current.duration) * 100;
          setProgress(currentProgress);

          // เมื่อถึง 90% และยังไม่เคย complete
          if (currentProgress >= 90 && !hasCompletedRef.current) {
            setIsCompleted(true);
            hasCompletedRef.current = true; // บันทึกว่าได้ complete แล้ว
            onComplete();
            // ไม่แสดง modal ทันที ให้ดูวิดีโอต่อไปได้
          }
        }
      });

      playerRef.current.on('pause', () => {
        if (playerRef.current) {
          saveVideoProgress(playerRef.current.currentTime, playerRef.current.duration);
        }
      });

      playerRef.current.on('seeked', () => {
        if (playerRef.current) {
          saveVideoProgress(playerRef.current.currentTime, playerRef.current.duration);
        }
      });

      playerRef.current.on('ended', () => {
        if (playerRef.current) {
          saveVideoProgress(playerRef.current.duration, playerRef.current.duration);
          // แสดง modal เมื่อวิดีโอจบจริงๆ
          setShowCompletionModal(true);
        }
      });

      playerRef.current.on('error', (e) => {
        console.error('Player error:', e);
      });
    }

    return () => {
      if (playerRef.current) {
        saveVideoProgress(
          playerRef.current.currentTime,
          playerRef.current.duration
        );
        playerRef.current.destroy();
      }
    };
  }, [currentLesson, youtubeId, lessonId, isLoading]);

  if (isLoading) {
    return <div className="video-loading">กำลังโหลดวิดีโอ...</div>;
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
          <i className="fas fa-check-circle"></i>
          <span>บทเรียนนี้เรียนจบแล้ว</span>
        </div>
      )}
      <div className="video-controls-info">
        <div className="video-status">
          {playerRef.current?.playing ? (
            <span className="status-playing">กำลังเล่น</span>
          ) : (
            <span className="status-paused">หยุดชั่วคราว</span>
          )}
        </div>
        <div className="video-progress-info">
          <span>{progress.toFixed(0)}% ของวิดีโอ</span>
        </div>
      </div>

      {/* ปุ่มควบคุมเพิ่มเติม */}
      {isCompleted && (
        <div className="video-additional-controls">
          <button 
            className="btn-rewatch-inline" 
            onClick={handleRewatch}
          >
            <i className="fas fa-redo"></i> ดูซ้ำ
          </button>
          {onNextLesson && (
            <button 
              className="btn-next-lesson-inline" 
              onClick={handleNextLesson}
            >
              <i className="fas fa-arrow-right"></i> ไปเนื้อหาถัดไป
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
                  <i className="fas fa-redo"></i> ดูซ้ำ
                </button>
                {onNextLesson && (
                  <button 
                    className="btn-next-lesson" 
                    onClick={handleNextLesson}
                  >
                    <i className="fas fa-arrow-right"></i> ไปเนื้อหาถัดไป
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
