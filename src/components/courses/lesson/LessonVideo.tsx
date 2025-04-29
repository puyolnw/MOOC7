import { useEffect, useRef, useState } from "react";
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import './LessonVideo.css';

interface LessonVideoProps {
  onComplete: () => void;
  currentLesson: string;
  youtubeId?: string;
}

const LessonVideo = ({ onComplete, currentLesson, youtubeId = 'BboMpayJomw' }: LessonVideoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isSeekingRef = useRef(false);

  const [progress, setProgress] = useState(10); // เริ่มต้นที่ 10%
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchedTime, setWatchedTime] = useState(0);

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

      playerRef.current.on('ready', () => {
        // เมื่อ player พร้อม ให้ตั้งตำแหน่งวิดีโอที่ 10%
        if (playerRef.current) {
          const duration = playerRef.current.duration || 0;
          const tenPercentPosition = duration * 0.1;
          playerRef.current.currentTime = tenPercentPosition;
          setWatchedTime(tenPercentPosition);
        }
      });

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
      });

      playerRef.current.on('error', (e) => {
        console.error('Player error:', e);
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentLesson, youtubeId]);

  useEffect(() => {
    // เมื่อเปลี่ยนบทเรียน ให้ตั้งค่าเริ่มต้นที่ 10%
    setProgress(10);
    setWatchedTime(0); // ตั้งเป็น 0 เพราะเราจะตั้งค่าใหม่ใน ready event
    setIsCompleted(false);
    setIsPlaying(false);
  }, [currentLesson]);

  useEffect(() => {
    const duration = playerRef.current?.duration || 1;
    const currentProgress = (watchedTime / duration) * 100;
    setProgress(Math.max(10, currentProgress)); // ให้ progress ไม่ต่ำกว่า 10%

    if (currentProgress > 90 && !isCompleted) {
      setIsCompleted(true);
      onComplete();
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
