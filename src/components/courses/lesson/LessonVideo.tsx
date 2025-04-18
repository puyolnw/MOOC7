import { useEffect, useRef, useState } from "react";
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import axios from "axios";
import './LessonVideo.css';

interface LessonVideoProps {
  onComplete: () => void;
  currentLesson: string;
  youtubeId: string;
  lessonData: any;
}

const LessonVideo = ({ onComplete, currentLesson, youtubeId = 'BboMpayJomw', lessonData }: LessonVideoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isSeekingRef = useRef(false);
  const apiURL = import.meta.env.VITE_API_URL;

  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchedTime, setWatchedTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (lessonData?.completed) {
      setIsCompleted(true);
      setProgress(100);
    } else {
      setIsCompleted(false);
      setProgress(lessonData?.progress || 0);
    }
  }, [lessonData]);

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
        setDuration(playerRef.current?.duration || 0);
      });

      playerRef.current.on('play', () => {
        setIsPlaying(true);
        if (!isSeekingRef.current) {
          timerRef.current = setInterval(() => {
            setWatchedTime(prev => prev + 1);
            updateProgress();
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
            updateProgress();
          }, 1000);
        }
      });

      playerRef.current.on('ended', () => {
        if (timerRef.current) clearInterval(timerRef.current);
        handleVideoComplete();
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
    setWatchedTime(0);
    setIsPlaying(false);
    
    // If the lesson is already completed, set progress to 100%
    if (lessonData?.completed) {
      setIsCompleted(true);
      setProgress(100);
    } else {
      setIsCompleted(false);
      setProgress(lessonData?.progress || 0);
    }
  }, [currentLesson, lessonData]);

  const updateProgress = async () => {
    if (!lessonData?.lesson_id) return;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const currentTime = playerRef.current?.currentTime || 0;
      const videoDuration = playerRef.current?.duration || 1;
      const currentProgress = (currentTime / videoDuration) * 100;
      
      setProgress(currentProgress);
      
      // Update progress on server every 5 seconds or when progress changes significantly
      if (Math.abs(currentProgress - progress) > 5 || watchedTime % 5 === 0) {
        await axios.post(
          `${apiURL}/api/courses/lessons/${lessonData.lesson_id}/progress`, 
          {
            position: currentTime,
            duration: videoDuration
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }
      
      // Mark as completed if watched more than 90%
      if (currentProgress > 90 && !isCompleted) {
        handleVideoComplete();
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const handleVideoComplete = async () => {
    if (isCompleted) return;
    
    try {
      const token = localStorage.getItem("token");
      if (!token || !lessonData?.lesson_id) return;
      
      await axios.post(
        `${apiURL}/api/courses/lessons/${lessonData.lesson_id}/complete`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setIsCompleted(true);
      setProgress(100);
      onComplete();
    } catch (error) {
      console.error("Error marking lesson as complete:", error);
    }
  };

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
