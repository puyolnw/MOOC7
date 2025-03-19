import { useEffect, useRef, useState } from "react";
import Plyr from 'plyr';
import './LessonVideo.css';

interface LessonVideoProps {
  onComplete: () => void;
  currentLesson: string;
}

const LessonVideo = ({ onComplete, currentLesson }: LessonVideoProps) => {
   const containerRef = useRef<HTMLDivElement>(null);
   const playerRef = useRef<Plyr | null>(null);
   const [progress, setProgress] = useState(0);
   const [isCompleted, setIsCompleted] = useState(false);

   useEffect(() => {
      if (containerRef.current) {
         const videoElement = document.createElement('video');
         videoElement.setAttribute('playsInline', '');
         videoElement.setAttribute('controls', '');
         videoElement.setAttribute('data-poster', '/assets/img/bg/video_bg.webp');

         const sourceMP4 = document.createElement('source');
         sourceMP4.src = '/assets/video/video.mp4';
         sourceMP4.type = 'video/mp4';
         
         videoElement.appendChild(sourceMP4);
         containerRef.current.appendChild(videoElement);

         playerRef.current = new Plyr(videoElement, {
            controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen']
         });

         playerRef.current.on('timeupdate', () => {
            const currentProgress = (playerRef.current?.currentTime || 0) / (playerRef.current?.duration || 1) * 100;
            setProgress(currentProgress);
            
            if (currentProgress > 90 && !isCompleted) {
               setIsCompleted(true);
               onComplete();
            }
         });
      }

      return () => {
         if (playerRef.current) {
            playerRef.current.destroy();
         }
         if (containerRef.current?.firstChild) {
            containerRef.current.removeChild(containerRef.current.firstChild);
         }
      };
   }, [currentLesson]);

   return (
      <div className="video-lesson-container">
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
      </div>
   );
};

export default LessonVideo;
