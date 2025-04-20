import React from "react";
import { SubjectData } from './AddSubjects';
import { Quiz } from './AddSubjects';

interface QuizSectionProps {
  subjectData: SubjectData;
  setSubjectData: React.Dispatch<React.SetStateAction<SubjectData>>;
  findQuizById: (quizId: string | null) => Quiz | null;
  handleOpenQuizModal: (type: "pre" | "post") => void;
}

const QuizSection: React.FC<QuizSectionProps> = ({
  subjectData,
  setSubjectData,
  findQuizById,
  handleOpenQuizModal,
}) => (
  <div className="card shadow-sm border-0 mb-4">
    <div className="card-header bg-light">
      <h5 className="mb-0">3. แบบทดสอบ</h5>
    </div>
    <div className="card-body">
      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">แบบทดสอบก่อนเรียน (Pre-test)</label>
            <div className="d-flex">
              <div className="flex-grow-1">
                {subjectData.preTestId ? (
                  <div className="border rounded p-3 bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0">{findQuizById(subjectData.preTestId)?.title || "แบบทดสอบที่เลือก"}</h6>
                        <small className="text-muted">
                          {findQuizById(subjectData.preTestId)?.question_count || 0} คำถาม
                        </small>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setSubjectData({ ...subjectData, preTestId: null })}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline-primary w-100"
                    onClick={() => handleOpenQuizModal("pre")}
                  >
                    <i className="fas fa-plus-circle me-2"></i>เลือกแบบทดสอบก่อนเรียน
                  </button>
                )}
              </div>
            </div>
            <small className="text-muted d-block mt-2">
              แบบทดสอบก่อนเรียนจะให้ผู้เรียนทำก่อนเริ่มเรียนรายวิชา
            </small>
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">แบบทดสอบหลังเรียน (Post-test)</label>
            <div className="d-flex">
              <div className="flex-grow-1">
                {subjectData.postTestId ? (
                  <div className="border rounded p-3 bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0">{findQuizById(subjectData.postTestId)?.title || "แบบทดสอบที่เลือก"}</h6>
                        <small className="text-muted">
                          {findQuizById(subjectData.postTestId)?.question_count || 0} คำถาม
                        </small>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setSubjectData({ ...subjectData, postTestId: null })}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline-primary w-100"
                    onClick={() => handleOpenQuizModal("post")}
                  >
                    <i className="fas fa-plus-circle me-2"></i>เลือกแบบทดสอบหลังเรียน
                  </button>
                )}
              </div>
            </div>
            <small className="text-muted d-block mt-2">
              แบบทดสอบหลังเรียนจะให้ผู้เรียนทำหลังจากเรียนรายวิชาเสร็จสิ้น
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default QuizSection;
