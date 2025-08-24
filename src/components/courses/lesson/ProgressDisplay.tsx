import React from 'react';
import './ProgressDisplay.css';

interface ProgressDisplayProps {
  currentScore: number;
  maxPossibleScore: number;
  passingPercentage: number;
  isPassed: boolean;
  showDetails?: boolean;
  className?: string;
}

const ProgressDisplay: React.FC<ProgressDisplayProps> = ({
  currentScore,
  maxPossibleScore,
  passingPercentage,
  isPassed,
  showDetails = true,
  className = ''
}) => {
  const progressPercentage = maxPossibleScore > 0 ? (currentScore / maxPossibleScore) * 100 : 0;
  const passingScore = maxPossibleScore * (passingPercentage / 100);
  const scoreNeeded = Math.max(0, passingScore - currentScore);

  return (
    <div className={`progress-display ${className}`}>
      <div className="progress-main">
        <div className="progress-info">
          <div className="progress-score">
            <span className="score-label">คะแนนรวม:</span>
            <span className="score-value">{currentScore.toFixed(1)}/{maxPossibleScore.toFixed(1)}</span>
          </div>
          
          <div className="progress-percentage">
            <span className="percentage-label">ความก้าวหน้า:</span>
            <span className="percentage-value">{progressPercentage.toFixed(1)}%</span>
          </div>
        </div>
        
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
            {passingScore > 0 && (
              <div 
                className="passing-threshold"
                style={{ left: `${Math.min((passingScore / maxPossibleScore) * 100, 100)}%` }}
              ></div>
            )}
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="progress-details">
          <div className="passing-info">
            <div className="passing-criteria">
              <span className="criteria-label">เกณฑ์ผ่าน:</span>
              <span className="criteria-value">{passingPercentage}%</span>
            </div>
            
            <div className="passing-score">
              <span className="score-label">คะแนนที่ต้องได้:</span>
              <span className="score-value">{passingScore.toFixed(1)}</span>
            </div>
          </div>
          
          {!isPassed && scoreNeeded > 0 && (
            <div className="score-needed">
              <span className="needed-label">คะแนนที่ขาด:</span>
              <span className="needed-value">{scoreNeeded.toFixed(1)}</span>
            </div>
          )}
          
          <div className="pass-status">
            <span className="status-label">สถานะ:</span>
            <span className={`status-badge ${isPassed ? 'passed' : 'failed'}`}>
              {isPassed ? 'ผ่าน' : 'ไม่ผ่าน'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressDisplay;
