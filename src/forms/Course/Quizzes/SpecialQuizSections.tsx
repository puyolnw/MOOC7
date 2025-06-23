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
  errors,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  // Filter and pagination
  const filteredFbQuestions = fbQuestions.filter((question) =>
    question.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFbQuestions.length / itemsPerPage);
  const paginatedQuestions = filteredFbQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary">
                <h5 className="modal-title text-white">
                  <i className="fas fa-edit me-2"></i>
                  เลือกคำถามแบบเติมคำตอบ
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ค้นหาคำถามแบบเติมคำตอบ..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1); // reset page when searching
                    }}
                  />
                </div>

                {fbQuestions.length === 0 ? (
                  <div className="alert alert-warning" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    ไม่พบคำถามแบบเติมคำตอบในระบบ กรุณาสร้างคำถามก่อน
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="bg-primary text-white">
                          <tr>
                            <th>คำถาม</th>
                            <th style={{ width: "80px" }}>คะแนน</th>
                            <th style={{ width: "100px" }} className="text-end">เลือก</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedQuestions.length > 0 ? (
                            paginatedQuestions.map((question) => {
                              const isSelected = selectedExistingQuestions.includes(question.id);
                              return (
                                <tr key={question.id}>
                                  <td>{question.title}</td>
                                  <td>{question.score}</td>
                                  <td className="text-end">
                                    <button
                                      type="button"
                                      className={`btn btn-sm ${isSelected ? "btn-success disabled" : "btn-outline-primary"}`}
                                      onClick={() => handleSelectQuestion(question.id)}
                                      disabled={isSelected}
                                    >
                                      {isSelected ? (
                                        <>
                                          <i className="fas fa-check me-1"></i> เลือกแล้ว
                                        </>
                                      ) : (
                                        <>เลือก</>
                                      )}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={3} className="text-center py-4">
                                <p className="text-muted mb-0">ไม่พบคำถามที่ตรงกับคำค้นหา</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <nav aria-label="Page navigation" className="mt-3">
                        <ul className="pagination justify-content-center mb-0">
                          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            >
                              <i className="fas fa-chevron-left small"></i>
                            </button>
                          </li>
                          {Array.from({ length: totalPages }, (_, i) => (
                            <li key={i + 1} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                              <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                                {i + 1}
                              </button>
                            </li>
                          ))}
                          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            >
                              <i className="fas fa-chevron-right small"></i>
                            </button>
                          </li>
                        </ul>
                      </nav>
                    )}
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ข้อมูลเพิ่มเติม */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">3. ข้อมูลเพิ่มเติม</h5>
        </div>
        <div className="card-body">
          <div className="alert alert-info" role="alert">
            <h6 className="alert-heading">
              <i className="fas fa-info-circle me-2"></i> การตรวจแบบทดสอบพิเศษ
            </h6>
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