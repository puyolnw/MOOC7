import React from "react";

interface SettingsSectionProps {
  quizData: {
    timeLimit: {
      enabled: boolean;
      value: number;
      unit: string;
    };
    passingScore: {
      enabled: boolean;
      value: number;
    };
    attempts: {
      limited: boolean;
      unlimited: boolean;
      value: number;
    };
    status: string;
  };
  handleTimeLimitChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handlePassingScoreChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAttemptsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  quizData,
  handleTimeLimitChange,
  handlePassingScoreChange,
  handleAttemptsChange,
  handleInputChange
}) => (
  <div className="card shadow-sm border-0 mb-4">
    <div className="card-header bg-light">
      <h5 className="mb-0">4. ตั้งค่าแบบทดสอบ</h5>
    </div>
    <div className="card-body">
      {/* ระยะเวลาการทำแบบทดสอบ */}
      <div className="mb-4">
        <label className="form-label fw-medium">ระยะเวลาการทำแบบทดสอบ</label>
        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id="timeLimit"
            name="timeLimit"
            checked={quizData.timeLimit.enabled}
            onChange={handleTimeLimitChange}
          />
          <label className="form-check-label" htmlFor="timeLimit">
            จำกัดเวลาในการทำแบบทดสอบ
          </label>
        </div>
        
        {quizData.timeLimit.enabled && (
          <div className="row align-items-center mt-2">
            <div className="col-md-6">
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  id="timeLimitValue"
                  name="timeLimitValue"
                  value={quizData.timeLimit.value}
                  onChange={handleTimeLimitChange}
                  min="1"
                />
                <select
                  className="form-select"
                  id="timeLimitUnit"
                  name="timeLimitUnit"
                  value={quizData.timeLimit.unit}
                  onChange={handleTimeLimitChange}
                >
                  <option value="minutes">นาที</option>
                  <option value="hours">ชั่วโมง</option>
                  <option value="days">วัน</option>
                  <option value="weeks">สัปดาห์</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* เกณฑ์ผ่าน */}
      <div className="mb-4">
        <label className="form-label fw-medium">เกณฑ์ผ่าน</label>
        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id="passingScore"
            name="passingScore"
            checked={quizData.passingScore.enabled}
            onChange={handlePassingScoreChange}
          />
          <label className="form-check-label" htmlFor="passingScore">
            กำหนดเกณฑ์ผ่านแบบทดสอบ
          </label>
        </div>
        
        {quizData.passingScore.enabled && (
          <div className="row align-items-center mt-2">
            <div className="col-md-6">
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  id="passingScoreValue"
                  name="passingScoreValue"
                  value={quizData.passingScore.value}
                  onChange={handlePassingScoreChange}
                  min="0"
                />
                <span className="input-group-text">คะแนน</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* จำกัดจำนวนการทำข้อสอบซ้ำ */}
      <div className="mb-4">
        <label className="form-label fw-medium">จำกัดจำนวนการทำข้อสอบซ้ำ</label>
        <p className="text-muted small mb-2">กำหนดจำนวนครั้งที่ผู้เรียนสามารถทำแบบทดสอบนี้ได้</p>
        
        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id="attemptsLimited"
            name="attemptsLimited"
            checked={quizData.attempts.limited}
            onChange={handleAttemptsChange}
          />
          <label className="form-check-label" htmlFor="attemptsLimited">
            จำกัดจำนวนครั้ง
          </label>
        </div>
        
        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id="attemptsUnlimited"
            name="attemptsUnlimited"
            checked={quizData.attempts.unlimited}
            onChange={handleAttemptsChange}
          />
          <label className="form-check-label" htmlFor="attemptsUnlimited">
            ไม่จำกัดจำนวนครั้ง
          </label>
        </div>
        
        {quizData.attempts.limited && (
          <div className="row align-items-center mt-2">
            <div className="col-md-6">
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  id="attemptsValue"
                  name="attemptsValue"
                  value={quizData.attempts.value}
                  onChange={handleAttemptsChange}
                  min="1"
                />
                <span className="input-group-text">ครั้ง</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* สถานะแบบทดสอบ */}
      <div className="mb-4">
        <label className="form-label fw-medium">สถานะแบบทดสอบ</label>
        <select
          className="form-select"
          id="status"
          name="status"
          value={quizData.status}
          onChange={handleInputChange}
        >
          <option value="draft">ฉบับร่าง (Draft)</option>
          <option value="active">เปิดใช้งาน (Active)</option>
          <option value="inactive">ปิดใช้งาน (Inactive)</option>
        </select>
        <small className="text-muted mt-1 d-block">
          แบบทดสอบที่มีสถานะเป็น "ฉบับร่าง" จะไม่แสดงให้ผู้เรียนเห็น
        </small>
      </div>
    </div>
  </div>
);

export default SettingsSection;
