import React from 'react';
import './ScoreProgressBar.css';

interface ScoreProgressBarProps {
    currentScore: number;
    maxScore: number;
    passingScore: number;
    progressPercentage: number;
    subjectTitle?: string;
}

const ScoreProgressBar: React.FC<ScoreProgressBarProps> = ({
    currentScore,
    maxScore,
    passingScore,
    progressPercentage,
    subjectTitle
}) => {
    const scoreNeeded = Math.max(0, passingScore - currentScore);
    const isPassed = currentScore >= passingScore;
    const passingPercentage = maxScore > 0 ? (passingScore / maxScore) * 100 : 0;

    return (
        <div className="score-progress-container">
            {/* Header */}
            <div className="score-progress-header">
                <h4>📊 ความคืบหน้าการเรียน</h4>
                {subjectTitle && (
                    <p className="subject-title">{subjectTitle}</p>
                )}
            </div>

            {/* Score Summary */}
            <div className="score-summary">
                <div className="score-item">
                    <span className="score-label">คะแนนปัจจุบัน</span>
                    <span className="score-value current">{currentScore}</span>
                </div>
                <div className="score-divider">/</div>
                <div className="score-item">
                    <span className="score-label">คะแนนเต็ม</span>
                    <span className="score-value total">{maxScore}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar-container">
                <div className="progress-bar-wrapper">
                    {/* Main Progress */}
                    <div 
                        className="progress-bar-fill"
                        style={{ 
                            width: `${(currentScore / maxScore) * 100}%`
                        }}
                    ></div>
                    
                    {/* Passing Threshold Line */}
                    <div 
                        className="passing-threshold"
                        style={{ 
                            left: `${passingPercentage}%`
                        }}
                    >
                        <div className="threshold-marker"></div>
                        <div className="threshold-label">ผ่าน: {passingScore}</div>
                    </div>
                </div>
                
                {/* Progress Labels */}
                <div className="progress-labels">
                    <span>0</span>
                    <span>{maxScore}</span>
                </div>
            </div>

            {/* Status Information */}
            <div className="score-status">
                <div className="status-row">
                    <div className="status-item">
                        <span className="status-label">เกณฑ์ผ่าน:</span>
                        <span className="status-value">{passingScore} คะแนน ({passingPercentage.toFixed(0)}%)</span>
                    </div>
                </div>
                
                <div className="status-row">
                    <div className="status-item">
                        <span className="status-label">คะแนนที่ขาด:</span>
                        <span className={`status-value ${isPassed ? 'passed' : 'needed'}`}>
                            {isPassed ? 'ผ่านเกณฑ์แล้ว ✓' : `${scoreNeeded} คะแนน`}
                        </span>
                    </div>
                </div>

                <div className="status-row">
                    <div className="status-item">
                        <span className="status-label">ความคืบหน้ารวม:</span>
                        <span className="status-value">{progressPercentage.toFixed(1)}%</span>
                    </div>
                </div>
            </div>

            {/* Overall Status */}
            <div className={`overall-status ${isPassed ? 'passed' : 'in-progress'}`}>
                <div className="status-icon">
                    {isPassed ? '🎉' : '📚'}
                </div>
                <div className="status-text">
                    {isPassed ? 'ผ่านเกณฑ์การประเมิน' : 'กำลังดำเนินการเรียน'}
                </div>
            </div>
        </div>
    );
};

export default ScoreProgressBar;
