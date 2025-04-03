import { useEffect, useRef, useState } from "react";
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import './LessonVideo.css';

interface LessonVideoProps {
  onComplete: () => void;
  currentLesson: string;
  youtubeId?: string; // เพิ่ม prop สำหรับรับ YouTube ID
}

const LessonVideo = ({ onComplete, currentLesson, youtubeId = 'glEiPXAYE-U' }: LessonVideoProps) => {
   const containerRef = useRef<HTMLDivElement>(null);
   const playerRef = useRef<Plyr | null>(null);
   const [progress, setProgress] = useState(0);
   const [isCompleted, setIsCompleted] = useState(false);
   const [isPlaying, setIsPlaying] = useState(false);

   useEffect(() => {
      if (containerRef.current) {
         // ล้าง container ก่อนเพื่อป้องกันการซ้ำซ้อน
         while (containerRef.current.firstChild) {
            containerRef.current.removeChild(containerRef.current.firstChild);
         }

         // สร้าง div สำหรับ Plyr YouTube
         const videoDiv = document.createElement('div');
         videoDiv.className = 'plyr__video-embed';
         
         // สร้าง iframe สำหรับ YouTube
         const iframe = document.createElement('iframe');
         iframe.src = `https://www.youtube.com/embed/${youtubeId}?origin=${window.location.origin}&amp;iv_load_policy=3&amp;modestbranding=1&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1`;
         iframe.allowFullscreen = true;
         iframe.allow = "autoplay";
         
         videoDiv.appendChild(iframe);
         containerRef.current.appendChild(videoDiv);

         // สร้าง Plyr player สำหรับ YouTube
         playerRef.current = new Plyr(videoDiv, {
            controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen']
         });

         // ติดตามความคืบหน้าของวิดีโอ
         playerRef.current.on('timeupdate', () => {
            const currentProgress = (playerRef.current?.currentTime || 0) / (playerRef.current?.duration || 1) * 100;
            setProgress(currentProgress);
            
            if (currentProgress > 90 && !isCompleted) {
               setIsCompleted(true);
               onComplete();
            }
         });

         // เพิ่ม event listeners สำหรับการเล่นและหยุด
         playerRef.current.on('play', () => {
            setIsPlaying(true);
         });

         playerRef.current.on('pause', () => {
            setIsPlaying(false);
         });

         // ตรวจสอบข้อผิดพลาด
         playerRef.current.on('error', (e) => {
            console.error('Player error:', e);
         });
      }

      return () => {
         if (playerRef.current) {
            playerRef.current.destroy();
         }
      };
   }, [currentLesson, youtubeId]);

   // รีเซ็ตสถานะเมื่อเปลี่ยนบทเรียน
   useEffect(() => {
      setProgress(0);
      setIsCompleted(false);
      setIsPlaying(false);
   }, [currentLesson]);

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
