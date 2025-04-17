import { useEffect, useRef, useState } from "react";
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import './LessonVideo.css';
import axios from 'axios';

interface LessonVideoProps {
  onComplete: () => void;
  currentLesson: string;
  lessonId: number; // เพิ่ม lessonId เพื่อใช้ในการบันทึกความก้าวหน้า
  youtubeId?: string;
  initialPosition?: number; // เพิ่มตำแหน่งเริ่มต้น
}

const LessonVideo = ({ 
  onComplete, 
  currentLesson, 
  lessonId,
  youtubeId = 'BboMpayJomw',
  initialPosition = 0
}: LessonVideoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isSeekingRef = useRef(false);
  const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3301';

  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchedTime, setWatchedTime] = useState(0);

  // ฟังก์ชันสำหรับบันทึกความก้าวหน้า
  const saveProgress = async (position: number, completed: boolean = false) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(
        `${apiURL}/api/lessons/${lessonId}/progress`,
        {
          last_position_seconds: position,
          completed: completed,
          duration_seconds: position
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (error) {
      console.error("Error saving lesson progress:", error);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
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

      // ตั้งค่าตำแหน่งเริ่มต้น (ถ้ามี)
      if (initialPosition > 0 && playerRef.current) {
        playerRef.current.once('ready', () => {
          playerRef.current?.forward(initialPosition);
        });
      }

      playerRef.current.on('play', () => {
        setIsPlaying(true);
        if (!isSeekingRef.current) {
          timerRef.current = setInterval(() => {
            setWatchedTime(prev => prev + 1);
          }, 1000);
        }
      });

      playerRef.current.on('pause', () => {
        setIsPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
        
        // บันทึกความก้าวหน้าเมื่อหยุดวิดีโอ
        if (playerRef.current) {
          const currentTime = Math.floor(playerRef.current.currentTime);
          saveProgress(currentTime);
        }
      });

      playerRef.current.on('seeking', () => {
        isSeekingRef.current = true;
        if (timerRef.current) clearInterval(timerRef.current);
      });

      playerRef.current.on('seeked', () => {
        isSeekingRef.current = false;
        if (playerRef.current?.playing) {
          timerRef.current = setInterval(() => {
            setWatchedTime(prev => prev + 1);
          }, 1000);
        }
      });

      playerRef.current.on('ended', () => {
        if (timerRef.current) clearInterval(timerRef.current);
        
        // บันทึกว่าดูจบแล้ว
        if (playerRef.current) {
          const duration = Math.floor(playerRef.current.duration);
          saveProgress(duration, true);
        }
      });

      playerRef.current.on('error', (e) => {
        console.error('Player error:', e);
      });
    }

    // ตั้ง interval สำหรับบันทึกความก้าวหน้าทุก 30 วินาที
    const progressInterval = setInterval(() => {
      if (playerRef.current && !isSeekingRef.current && playerRef.current.playing) {
        const currentTime = Math.floor(playerRef.current.currentTime);
        saveProgress(currentTime);
      }
    }, 30000); // บันทึกทุก 30 วินาที

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      clearInterval(progressInterval);
    };
  }, [currentLesson, youtubeId, initialPosition]);

  useEffect(() => {
    setProgress(0);
    setWatchedTime(0);
    setIsCompleted(false);
    setIsPlaying(false);
  }, [currentLesson]);

  useEffect(() => {
    const duration = playerRef.current?.duration || 1;
    const currentProgress = (watchedTime / duration) * 100;
    setProgress(currentProgress);

    if (currentProgress > 90 && !isCompleted) {
      setIsCompleted(true);
      onComplete();
      
      // บันทึกว่าดูจบแล้ว
      if (playerRef.current) {
        const duration = Math.floor(playerRef.current.duration);
        saveProgress(duration, true);
      }
    }
  }, [watchedTime, onComplete, isCompleted]);

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
          {isPlaying ? (
            <span className="status-playing">กำลังเล่น</span>
          ) : (
            <span className="status-paused">หยุดชั่วคราว</span>
          )}
        </div>
        <div className="video-progress-info">
          <span>{progress.toFixed(0)}% ของวิดีโอ</span>
        </div>
      </div>
    </div>
  );
};

export default LessonVideo;
