import React from 'react';
import './ScoreDisplay.css';

interface ScoreDisplayProps {
  currentScore: number;
  maxScore: number;
  passingPercentage: number;
  isPassed: boolean;
  showDetails?: boolean;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  currentScore,
  maxScore,
  passingPercentage,
  isPassed,
  showDetails = true
}) => {
  const scorePercentage = maxScore > 0 ? (currentScore / maxScore) * 100 : 0;
  const passingScore = maxScore * (passingPercentage / 100);
  const scoreNeeded = Math.max(0, passingScore - currentScore);

  return (
    <div className="score-display">
      <div className="score-main">
        <div className="score-current">
          <span className="score-label">คะแนนปัจจุบัน:</span>
          <span className="score-value">{currentScore}/{maxScore}</span>
        </div>
        
        <div className="score-percentage">
          <div className="percentage-bar">
            <div 
              className="percentage-fill" 
              style={{ width: `${Math.min(scorePercentage, 100)}%` }}
            ></div>
          </div>
          <span className="percentage-text">{scorePercentage.toFixed(1)}%</span>
        </div>
      </div>

      {showDetails && (
        <div className="score-details">
          <div className="passing-criteria">
            <span className="criteria-label">เกณฑ์ผ่าน:</span>
            <span className="criteria-value">{passingPercentage}%</span>
          </div>
          
          <div className="passing-score">
            <span className="score-label">คะแนนที่ต้องได้:</span>
            <span className="score-value">{passingScore.toFixed(1)}</span>
          </div>
          
          {!isPassed && scoreNeeded > 0 && (
            <div className="score-needed">
              <span className="needed-label">คะแนนที่ขาด:</span>
              <span className="needed-value">{scoreNeeded.toFixed(1)}</span>
            </div>
          )}
          
          <div className="pass-status">
            <span className="status-label">สถานะ:</span>
            <span className={`status-value ${isPassed ? 'passed' : 'failed'}`}>
              {isPassed ? 'ผ่าน' : 'ไม่ผ่าน'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreDisplay;
