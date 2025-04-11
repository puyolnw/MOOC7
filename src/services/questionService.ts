import axios from 'axios';

// ใช้ค่า API URL จาก .env
const API_URL = import.meta.env.VITE_API_URL;
const QUESTIONS_ENDPOINT = `${API_URL}/api/courses/questions`;

// Interface สำหรับข้อมูลคำถาม
export interface Choice {
  id?: string;
  choice_id?: number;
  text: string;
  isCorrect?: boolean;
  is_correct?: boolean;
}

export interface Question {
  id?: number;
  question_id?: number;
  title: string;
  description?: string;
  type: "TF" | "MC" | "SC" | "FB" | "";
  choices: Choice[];
  score: number;
  quizzes?: string[] | number[];
}

// ฟังก์ชันสำหรับดึงข้อมูลคำถามทั้งหมด
export const getAllQuestions = async (params?: { type?: string; search?: string }) => {
  try {
    const response = await axios.get(QUESTIONS_ENDPOINT, { params });
    
    // แปลงข้อมูลจาก API ให้เข้ากับรูปแบบที่ใช้ในแอปพลิเคชัน
    const questions = response.data.questions.map((q: any) => ({
      id: q.question_id,
      text: q.title,
      description: q.description,
      type: q.type,
      score: q.score,
      choices: q.choices.map((c: any) => ({
        id: c.choice_id.toString(),
        text: c.text,
        isCorrect: c.is_correct
      })),
      quizzes: q.quizzes?.map((quiz: any) => quiz.quiz_id) || []
    }));
    
    return questions;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลคำถามตาม ID
export const getQuestionById = async (id: number) => {
  try {
    const response = await axios.get(`${QUESTIONS_ENDPOINT}/${id}`);
    
    const q = response.data.question;
    return {
      id: q.question_id,
      title: q.title,
      description: q.description,
      type: q.type,
      score: q.score,
      choices: q.choices.map((c: any) => ({
        id: c.choice_id.toString(),
        text: c.text,
        isCorrect: c.is_correct
      })),
      quizzes: q.quizzes?.map((quiz: any) => quiz.quiz_id) || []
    };
  } catch (error) {
    console.error(`Error fetching question with ID ${id}:`, error);
    throw error;
  }
};

// ฟังก์ชันสำหรับสร้างคำถามใหม่
export const createQuestion = async (questionData: Question) => {
  try {
    // แปลงข้อมูลให้ตรงกับรูปแบบที่ API ต้องการ
    const apiData = {
      title: questionData.title,
      description: questionData.description || "",
      type: questionData.type,
      score: questionData.score,
      choices: questionData.choices.map(choice => ({
        text: choice.text,
        isCorrect: choice.isCorrect
      })),
      quizzes: questionData.quizzes || []
    };
    
    const response = await axios.post(QUESTIONS_ENDPOINT, apiData);
    return response.data;
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
};

// ฟังก์ชันสำหรับอัปเดตคำถาม
export const updateQuestion = async (id: number, questionData: Question) => {
  try {
    // แปลงข้อมูลให้ตรงกับรูปแบบที่ API ต้องการ
    const apiData = {
      title: questionData.title,
      description: questionData.description || "",
      type: questionData.type,
      score: questionData.score,
      choices: questionData.choices.map(choice => ({
        text: choice.text,
        isCorrect: choice.isCorrect
      })),
      quizzes: questionData.quizzes || []
    };
    
    const response = await axios.put(`${QUESTIONS_ENDPOINT}/${id}`, apiData);
    return response.data;
  } catch (error) {
    console.error(`Error updating question with ID ${id}:`, error);
    throw error;
  }
};

// ฟังก์ชันสำหรับลบคำถาม
export const deleteQuestion = async (id: number) => {
  try {
    const response = await axios.delete(`${QUESTIONS_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting question with ID ${id}:`, error);
    throw error;
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลคำถามตามแบบทดสอบ
export const getQuestionsByQuiz = async (quizId: number) => {
  try {
    const response = await axios.get(`${QUESTIONS_ENDPOINT}/quiz/${quizId}`);
    
    const questions = response.data.questions.map((q: any) => ({
      id: q.question_id,
      title: q.title,
      description: q.description,
      type: q.type,
      score: q.score,
      choices: q.choices.map((c: any) => ({
        id: c.choice_id.toString(),
        text: c.text,
        isCorrect: c.is_correct
      }))
    }));
    
    return questions;
  } catch (error) {
    console.error(`Error fetching questions for quiz ID ${quizId}:`, error);
    throw error;
  }
};
