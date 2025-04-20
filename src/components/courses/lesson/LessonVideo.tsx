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
  progressData?: any;
  subjectId?: string;
}

const LessonVideo = ({ onComplete, currentLesson, youtubeId = 'BboMpayJomw', lessonData, progressData, subjectId }: LessonVideoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isSeekingRef = useRef(false);
  const apiURL = import.meta.env.VITE_API_URL;

  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchedTime, setWatchedTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);

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
        const duration = playerRef.current?.duration || 0;
        setVideoDuration(duration);
        
        if (progressData && progressData.lessons) {
          const lessonProgress = progressData.lessons.find(
            (lesson: any) => lesson.lesson_id === parseInt(lessonData?.lesson_id)
          );
          
          if (lessonProgress && lessonProgress.last_position_seconds) {
            playerRef.current?.forward(lessonProgress.last_position_seconds);
          }
        }
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
        setProgress(100);
        handleVideoComplete();
      });

      playerRef.current.on('error', (e) => {
        console.error('Player error:', e);
      });
      
      const durationCheckInterval = setInterval(() => {
        if (playerRef.current && playerRef.current.duration > 0) {
          setVideoDuration(playerRef.current.duration);
          clearInterval(durationCheckInterval);
        }
      }, 1000);
      
      return () => {
        clearInterval(durationCheckInterval);
      };
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentLesson, youtubeId, progressData, lessonData]);

  useEffect(() => {
    setWatchedTime(0);
    setIsPlaying(false);
    
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
      const duration = playerRef.current?.duration || 0;
      
      if (duration > 0) {
        if (currentTime >= duration) {
          setProgress(100);
          
          if (!isCompleted) {
            handleVideoComplete();
          }
        } else {
          const currentProgress = (currentTime / duration) * 100;
          setProgress(currentProgress);
          
          if (currentProgress > 90 && !isCompleted) {
            handleVideoComplete();
          }
        }
        
        const now = Date.now();
        if (watchedTime % 5 === 0 || now - lastUpdateTime > 5000 || Math.abs(currentTime - lastUpdateTime) > 10) {
          setLastUpdateTime(now);
          
          await axios.post(
            `${apiURL}/api/courses/lessons/${lessonData.lesson_id}/progress`, 
            {
              last_position_seconds: currentTime,
              duration_seconds: duration,
              completed: currentTime >= duration || progress >= 100,
              subject_id: subjectId
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          
          if (subjectId && (currentTime >= duration || progress >= 90)) {
            try {
              await axios.get(`${apiURL}/api/courses/subjects/${subjectId}/progress`, {
                headers: { Authorization: `Bearer ${token}` }
              });
            } catch (error) {
              console.error("Error updating subject progress:", error);
            }
          }
        }
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
        { subject_id: subjectId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setIsCompleted(true);
      setProgress(100);
      
      onComplete();
      
      if (subjectId) {
        try {
          await axios.get(`${apiURL}/api/courses/subjects/${subjectId}/progress`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (error) {
          console.error("Error updating subject progress:", error);
        }
      }
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
          {isCompleted || (playerRef.current && playerRef.current.currentTime >= playerRef.current.duration) ? (
            <span>100% ของวิดีโอ</span>
          ) : (
            <span>{progress.toFixed(0)}% ของวิดีโอ</span>
          )}
          <span className="video-duration">
            {" "}({isCompleted ? videoDuration.toFixed(1) : (playerRef.current ? playerRef.current.currentTime.toFixed(1) : 0)}/
            {playerRef.current ? playerRef.current.duration.toFixed(1) : 0} วินาที)
          </span>
        </div>
      </div>
    </div>
  );
};

export default LessonVideo;

