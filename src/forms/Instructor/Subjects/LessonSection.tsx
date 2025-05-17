import React from "react";
import { SubjectData } from './AddSubjects';
import { Droppable, Draggable } from 'react-beautiful-dnd';

interface LessonSectionProps {
  subjectData: SubjectData;
  errors: {
    title: string;
    code: string;
    credits: string;
    coverImage: string;
    lessons: string;
  };
  handleLessonAccessChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveLesson: (lessonId: string) => void;
  setShowLessonModal: (show: boolean) => void;
}

const LessonSection: React.FC<LessonSectionProps> = ({
  subjectData,
  errors,
  handleLessonAccessChange,
  handleRemoveLesson,
  setShowLessonModal,
}) => (
  <div className="card shadow-sm border-0 mb-4">
    <div className="card-header bg-light d-flex justify-content-between align-items-center">
      <h5 className="mb-0">2. บทเรียนในรายวิชา</h5>
      <div>
        <span className="badge bg-primary rounded-pill me-2">
          {subjectData.lessons.length} / 20 บทเรียน
        </span>
      </div>
    </div>
    <div className="card-body">
      {errors.lessons && (
        <div className="alert alert-danger" role="alert">
          {errors.lessons}
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="allowAllLessons"
            checked={subjectData.allowAllLessons}
            onChange={handleLessonAccessChange}
          />
          <label className="form-check-label" htmlFor="allowAllLessons">
            อนุญาตให้เข้าถึงบทเรียนทั้งหมดได้ทันที (ไม่ต้องเรียนตามลำดับ)
          </label>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setShowLessonModal(true)}
          disabled={subjectData.lessons.length >= 20}
        >
          <i className="fas fa-plus-circle me-2"></i>เพิ่มบทเรียน
        </button>
      </div>

      {subjectData.lessons.length > 0 ? (
        <Droppable droppableId="lessons">
          {(provided) => (
            <div 
              className="table-responsive"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "60px" }}>ลำดับ</th>
                    <th>ชื่อบทเรียน</th>
                    <th style={{ width: "80px" }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectData.lessons.map((lesson, index) => (
                    <Draggable 
                      key={lesson.id} 
                      draggableId={lesson.id} 
                      index={index}
                    >
                      {(provided) => (
                        <tr
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <td className="text-center">
                            <div className="d-flex align-items-center justify-content-center">
                              <i className="fas fa-grip-vertical text-muted me-2" style={{ cursor: 'grab' }}></i>
                              {index + 1}
                            </div>
                          </td>
                          <td>{lesson.title}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemoveLesson(lesson.id)}
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </tbody>
              </table>
            </div>
          )}
        </Droppable>
      ) : (
        <div className="alert alert-info" role="alert">
          ยังไม่มีบทเรียนในรายวิชานี้ กรุณาเพิ่มบทเรียนอย่างน้อย 1 บทเรียนนะ
        </div>
      )}
    </div>
  </div>
);

export default LessonSection;
