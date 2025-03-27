import { useEffect, useRef, useState } from "react";
import Plyr from 'plyr';
import 'plyr/dist/plyr.css'; // นำเข้า CSS ของ Plyr โดยตรง
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
   const [isPlaying, setIsPlaying] = useState(false);

   useEffect(() => {
      if (containerRef.current) {
         // ล้าง container ก่อนเพื่อป้องกันการซ้ำซ้อน
         while (containerRef.current.firstChild) {
            containerRef.current.removeChild(containerRef.current.firstChild);
         }

         const videoElement = document.createElement('video');
         videoElement.setAttribute('playsInline', '');
         videoElement.setAttribute('controls', '');
         videoElement.setAttribute('data-poster', '/assets/img/bg/video_bg.webp');

         const sourceMP4 = document.createElement('source');
         // ใช้วิดีโอตัวอย่างจากอินเทอร์เน็ต
         sourceMP4.src = 'https://www.youtube.com/watch?v=3oo356UNY8o&ab_channel=9Arkkhan';
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

         // เพิ่ม event listeners สำหรับการเล่นและหยุด
         playerRef.current.on('play', () => {
            setIsPlaying(true);
         });

         playerRef.current.on('pause', () => {
            setIsPlaying(false);
         });

         // ตรวจสอบว่าวิดีโอโหลดสำเร็จหรือไม่
         videoElement.addEventListener('error', (e) => {
            console.error('Video error:', e);
         });

         // ตรวจสอบว่าวิดีโอพร้อมเล่นหรือไม่
         videoElement.addEventListener('canplay', () => {
            console.log('Video can play');
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
