import { createContext, useContext, useState, ReactNode } from 'react';

interface FacultyContextType {
  selectedFaculty: string | null;
  setSelectedFaculty: (faculty: string | null) => void;
}

const FacultyContext = createContext<FacultyContextType | undefined>(undefined);

export const FacultyProvider = ({ children }: { children: ReactNode }) => {
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);

  return (
    <FacultyContext.Provider value={{ selectedFaculty, setSelectedFaculty }}>
      {children}
    </FacultyContext.Provider>
  );
};

export const useFaculty = () => {
  const context = useContext(FacultyContext);
  if (!context) {
    throw new Error('useFaculty must be used within a FacultyProvider');
  }
  return context;
};