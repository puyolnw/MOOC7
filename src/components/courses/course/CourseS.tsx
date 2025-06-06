export interface Course {
  id: number;
  title: string;
  thumb: string | undefined;
  faculty_name: string;
  department_name: string;
  desc: string;
  price_type: string;
  language: string;
  popular?: string; // Optional, for sorting in CourseTop
}