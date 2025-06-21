import React, { useState } from "react";

interface Question {
  id: string;
  title: string;
  type: string;
  score: number;
}

interface SpecialQuizSectionProps {
  quizData: {
    title: string;
    description: string;
    allowFileUpload?: boolean;
  };
  fbQuestions: Question[];
  selectedExistingQuestions: string[];
  setSelectedExistingQuestions: React.Dispatch<React.SetStateAction<string[]>>;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: {
    questions: string;
  };
}

const SpecialQuizSection: React.FC<SpecialQuizSectionProps> = ({
  quizData,
  fbQuestions,
  selectedExistingQuestions,
  setSelectedExistingQuestions,
  handleCheckboxChange,
  errors
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredFbQuestions = fbQuestions.filter((question) =>
    question.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectQuestion = (id: string) => {
    if (selectedExistingQuestions.includes(id)) {
      setSelectedExistingQuestions(selectedExistingQuestions.filter((qId) => qId !== id));
    } else {
      setSelectedExistingQuestions([...selectedExistingQuestions, id]);
    }
  };

  return (
    <>
      {/* คำถามแบบพิเศษ */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">2. คำถามแบบเติมคำตอบ</h5>
          <div>
            <span className="badge bg-primary rounded-pill me-2">
              {selectedExistingQuestions.length} คำถามที่เลือก
            </span>
          </div>
        </div>
        <div className="card-body">
          {errors.questions && (
            <div className="alert alert-danger" role="alert">
              {errors.questions}
            </div>
          )}

          <p className="text-muted mb-3">
            แบบทดสอบพิเศษรองรับเฉพาะคำถามแบบเติมคำตอบ (Fill in the Blank) ที่ต้องการให้อาจารย์ตรวจด้วยตนเอง
          </p>

          <div className="mb-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="allowFileUpload"
                name="allowFileUpload"
                checked={quizData.allowFileUpload || false}
                onChange={handleCheckboxChange}
              />
              <label className="form-check-label" htmlFor="allowFileUpload">
                อนุญาตให้นักเรียนอัปโหลดไฟล์ประกอบคำตอบได้
              </label>
            </div>
          </div>

          {/* ปุ่มกดเพื่อเปิด Modal */}
          <div className="mb-3">
            <button
              type="button"
              className="btn btn-outline-primary w-100"
              onClick={() => setIsModalOpen(true)}
            >
              <i className="fas fa-plus me-2"></i>
              เลือกคำถาม
            </button>
          </div>

          {/* แสดงคำถามที่เลือก */}
          {selectedExistingQuestions.length > 0 && (
            <div className="mt-3 p-3 bg-light rounded">
              <h6>คำถามที่เลือก ({selectedExistingQuestions.length}):</h6>
              <ul className="list-group">
                {selectedExistingQuestions.map((id) => {
                  const question = fbQuestions.find((q) => q.id === id);
                  return question ? (
                    <li key={id} className="list-group-item d-flex justify-content-between align-items-center">
                      {question.title}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleSelectQuestion(id)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Modal สำหรับเลือกคำถาม */}
      {isModalOpen && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">เลือกคำถามแบบเติมคำตอบ</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ค้นหาคำถามแบบเติมคำตอบ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-outline-secondary" type="button">
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                </div>

                {fbQuestions.length === 0 ? (
                  <div className="alert alert-warning" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    ไม่พบคำถามแบบเติมคำตอบในระบบ กรุณาสร้างคำถามแบบเติมคำตอบก่อน
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover table-sm align-middle">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "50px" }}></th>
                          <th>คำถาม</th>
                          <th style={{ width: "80px" }}>คะแนน</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFbQuestions.length > 0 ? (
                          filteredFbQuestions.map((question) => (
                            <tr key={question.id}>
                              <td>
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`select-${question.id}`}
                                    checked={selectedExistingQuestions.includes(question.id)}
                                    onChange={() => handleSelectQuestion(question.id)}
                                  />
                                </div>
                              </td>
                              <td>{question.title}</td>
                              <td>{question.score}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="text-center py-3">
                              ไม่พบคำถามที่ตรงกับคำค้นหา
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setIsModalOpen(false)}
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* คำอธิบายเพิ่มเติม */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">3. ข้อมูลเพิ่มเติม</h5>
        </div>
        <div className="card-body">
          <div className="alert alert-info" role="alert">
            <h6 className="alert-heading"><i className="fas fa-info-circle me-2"></i>การตรวจแบบทดสอบพิเศษ</h6>
            <p className="mb-0">
              แบบทดสอบพิเศษจะไม่ตรวจอัตโนมัติ เมื่อนักเรียนส่งคำตอบแล้ว อาจารย์จะต้องเข้าไปตรวจและให้คะแนนด้วยตนเอง
              ในหน้า "งานที่รอตรวจ" ในเมนูแดชบอร์ดของอาจารย์
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SpecialQuizSection;