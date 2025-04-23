import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export interface Course {
  id: number;
  title: string;
  thumb: string | undefined;
  faculty_name: string;
  department_name: string;
  desc: string;
  price_type: string;
  language: string;
  popular?: string;
}

interface CourseState {
  courses: Course[];
  course: Course | null;
  loading: boolean;
  error: string | null;
}

const initialState: CourseState = {
  courses: [],
  course: null,
  loading: false,
  error: null
};

export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/courses`);
      return response.data.courses;
    } catch (error) {
      return rejectWithValue('Failed to fetch courses');
    }
  }
);

export const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    single_course: (state, action: PayloadAction<number>) => {
      state.course = state.courses.find((p) => p.id === action.payload) || null;
    },
    filter_courses: (state, action: PayloadAction<{faculty?: string; department?: string}>) => {
      const { faculty, department } = action.payload;
      const filteredCourses = state.courses.filter(course => {
        if (faculty && faculty !== 'ทั้งหมด') {
          return course.faculty_name.replace(/^คณะ\s*/, '') === faculty;
        }
        if (department && department !== 'ทั้งหมด') {
          return course.department_name === department;
        }
        return true;
      });
      return { ...state, courses: filteredCourses };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch courses';
      });
  },
});

export const { single_course, filter_courses } = courseSlice.actions;
export const selectCourses = (state: { courses: CourseState }) => state.courses.courses;
export const selectCourse = (state: { courses: CourseState }) => state.courses.course;
export const selectLoading = (state: { courses: CourseState }) => state.courses.loading;
export const selectError = (state: { courses: CourseState }) => state.courses.error;

export default courseSlice.reducer;
