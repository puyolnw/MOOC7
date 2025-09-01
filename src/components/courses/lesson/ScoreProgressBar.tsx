import React from 'react';
import './ScoreProgressBar.css';

interface ScoreProgressBarProps {
    currentScore: number;
    maxScore: number;
    passingScore: number;
    progressPercentage: number;
    subjectTitle?: string;
    passingPercentage?: number;
    isSubjectPassed?: boolean; // ✅ เพิ่ม prop สำหรับสถานะการผ่านวิชา
}

const ScoreProgressBar: React.FC<ScoreProgressBarProps> = ({
    currentScore,
    maxScore,
    passingScore,
    progressPercentage,
    subjectTitle,
    passingPercentage: propPassingPercentage,
    isSubjectPassed: propIsSubjectPassed
}) => {
    const currentScoreNum = Number(currentScore) || 0;
    const passingScoreNum = Number(passingScore) || 0;
    const scoreNeeded = Math.max(0, passingScoreNum - currentScoreNum);
    const isPassed = currentScoreNum >= passingScoreNum;
    const passingPercentage = Number(propPassingPercentage) || (maxScore > 0 ? (passingScoreNum / maxScore) * 100 : 0);
    
    // ✅ ใช้ prop isSubjectPassed ถ้ามี หรือคำนวณจากคะแนนอย่างเดียวถ้าไม่มี
    const isSubjectPassed = propIsSubjectPassed !== undefined ? propIsSubjectPassed : isPassed;

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
                    <span className="score-value current">{currentScoreNum.toFixed(2)}</span>
                </div>
                <div className="score-divider">/</div>
                <div className="score-item">
                    <span className="score-label">คะแนนเต็ม</span>
                    <span className="score-value total">{Number(maxScore).toFixed(2)}</span>
                </div>
            </div>
            
            {/* ✅ เพิ่มการแสดง Progress Summary */}
            <div className="progress-summary">
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '8px'
                }}>
                    <span className="progress-label">ความคืบหน้ารวม:</span>
                    <span className={`progress-value ${progressPercentage >= 100 ? 'completed' : 'in-progress'}`}>
                        {Number(progressPercentage).toFixed(1)}%
                    </span>
                </div>
                
                {/* Progress Bar สำหรับความคืบหน้า */}
                <div className="progress-bar-mini">
                    <div className={`progress-bar-mini-fill ${progressPercentage >= 100 ? 'completed' : 'in-progress'}`}
                         style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}>
                    </div>
                </div>
                
                {/* Progress Status */}
                <div className={`progress-status-message ${progressPercentage >= 100 ? 'completed' : 'in-progress'}`}>
                    {progressPercentage >= 100 ? '🎯 ครบ 100% - พร้อมทำแบบทดสอบท้ายบทเรียน' : '📚 ยังไม่ครบ 100% - ต้องเรียนให้ครบก่อน'}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar-container">
                <div className="progress-bar-wrapper">
                    {/* Main Progress - แสดงความคืบหน้าจริง (ไม่ใช่คะแนน) */}
                    <div 
                        className={`progress-bar-fill ${progressPercentage >= 100 ? 'enhanced' : 'warning'}`}
                        style={{ 
                            width: `${Math.min(100, Math.max(0, progressPercentage))}%`
                        }}
                    ></div>
                    
                    {/* 100% Progress Line */}
                    <div 
                        className="progress-100-line"
                        style={{ 
                            position: 'absolute',
                            left: '100%',
                            top: '0',
                            bottom: '0',
                            width: '2px',
                            backgroundColor: '#81c784',
                            zIndex: 2
                        }}
                    >
                        <div style={{ 
                            position: 'absolute',
                            top: '-20px',
                            left: '-15px',
                            backgroundColor: '#81c784',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '0.7rem',
                            whiteSpace: 'nowrap'
                        }}>
                            100%
                        </div>
                    </div>
                    
                    {/* Passing Threshold Line */}
                    <div 
                        className="passing-threshold"
                        style={{ 
                            left: `${Math.min(100, Math.max(0, passingPercentage))}%`
                        }}
                    >
                        <div className="threshold-marker"></div>
                        <div className="threshold-label">ผ่าน: {passingScoreNum.toFixed(0)}</div>
                    </div>
                </div>
                
                {/* Progress Labels */}
                <div className="progress-labels">
                    <span>0%</span>
                    <span>100%</span>
                </div>
                
                {/* Progress Description */}
                <div className="progress-description">
                    ความคืบหน้านี้คำนวณจาก: Pre-test + Big Lessons + Post-test
                </div>
            </div>

            {/* Status Information */}
            <div className="score-status">
                <div className="status-row">
                    <div className="status-item">
                        <span className="status-label">เกณฑ์ผ่าน:</span>
                        <span className="status-value">{passingScoreNum.toFixed(0)} คะแนน ({passingPercentage.toFixed(0)}%)</span>
                    </div>
                </div>
                
                <div className="status-row">
                    <div className="status-item">
                        <span className="status-label">คะแนนที่ขาด:</span>
                        <span className={`status-value ${isPassed ? 'passed' : 'needed'}`}>
                            {isPassed ? 'ผ่านเกณฑ์แล้ว ✓' : `${scoreNeeded.toFixed(0)} คะแนน`}
                        </span>
                    </div>
                </div>

                <div className="status-row enhanced">
                    <div className="status-item">
                        <span className="status-label">ความคืบหน้ารวม:</span>
                        <span className={`status-value ${progressPercentage >= 100 ? 'passed' : 'needed'}`}>
                            {Number(progressPercentage).toFixed(1)}%
                        </span>
                    </div>
                </div>
                
                {/* ✅ เพิ่มการแสดงเงื่อนไขการผ่านใหม่ */}
                {propIsSubjectPassed !== undefined && (
                    <div className="status-row enhanced">
                        <div className="status-item">
                            <span className="status-label">เงื่อนไขการผ่าน:</span>
                            <div style={{ marginTop: '5px' }}>
                                <div className={`condition-item ${isPassed ? 'score-status' : 'progress-status'}`}>
                                    • คะแนน: {isPassed ? 'ผ่าน' : 'ไม่ผ่าน'} ({currentScoreNum.toFixed(0)}/{passingScoreNum.toFixed(0)})
                                </div>
                                <div className={`condition-item ${progressPercentage >= 100 ? 'score-status' : 'progress-status'}`}>
                                    • ความคืบหน้า: {progressPercentage >= 100 ? 'ครบ 100%' : `${progressPercentage.toFixed(1)}%`}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Overall Status */}
            <div className={`overall-status ${isSubjectPassed ? 'passed' : 'in-progress'}`}>
                <div className="status-icon">
                    {isSubjectPassed ? '🎉' : '📚'}
                </div>
                <div className="status-text">
                    {isSubjectPassed ? 'ผ่านเกณฑ์การประเมิน' : 'กำลังดำเนินการเรียน'}
                </div>
                
                {/* ✅ แสดงรายละเอียดสถานะการผ่าน */}
                {propIsSubjectPassed !== undefined && (
                    <div className="status-details">
                        <div className="condition-item">
                            <span className={isPassed ? 'score-status' : 'progress-status'}>
                                {isPassed ? '✓' : '✗'} คะแนน: {isPassed ? 'ผ่าน' : 'ไม่ผ่าน'} ({currentScoreNum.toFixed(0)}/{passingScoreNum.toFixed(0)})
                            </span>
                        </div>
                        <div className="condition-item">
                            <span className={progressPercentage >= 100 ? 'score-status' : 'progress-status'}>
                                {progressPercentage >= 100 ? '✓' : '✗'} ความคืบหน้า: {progressPercentage >= 100 ? 'ครบ 100%' : `${progressPercentage.toFixed(1)}%`}
                            </span>
                        </div>
                        
                        {/* ✅ แสดงข้อความสรุป */}
                        <div className={`overall-status-summary ${isSubjectPassed ? 'passed' : 'in-progress'}`}>
                            {isSubjectPassed 
                                ? '🎉 ผ่านเกณฑ์การประเมิน (คะแนน + ความคืบหน้า)' 
                                : '📚 ต้องผ่านทั้งคะแนนและความคืบหน้า 100%'
                            }
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScoreProgressBar;
