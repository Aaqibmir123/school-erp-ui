import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { setAuthToken } from "../api/baseQuery";

export interface AuthUser {
  _id: string;
  role: string;
  name?: string;
  email?: string;
  image?: string;
  phone?: string;
}

export interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  classId?: any;
  sectionId?: any;
}

interface AuthContextType {
  token: string | null;
  role: string | null;
  user: AuthUser | null;
  loading: boolean;
  students: Student[];
  selectedStudent: Student | null;
  login: (data: {
    token: string;
    user: AuthUser;
    students?: Student[];
  }) => Promise<void>;
  logout: () => Promise<void>;
  setSelectedStudent: (student: Student) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  STUDENTS: "students",
  SELECTED: "selectedStudent",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudentState] = useState<Student | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        const storedStudents = await AsyncStorage.getItem(
          STORAGE_KEYS.STUDENTS,
        );
        const storedSelected = await AsyncStorage.getItem(
          STORAGE_KEYS.SELECTED,
        );

        if (storedToken && storedUser) {
          const parsedUser: AuthUser = JSON.parse(storedUser);

          setToken(storedToken);
          setUser(parsedUser);
          setRole(parsedUser.role);
          setAuthToken(storedToken);

          if (parsedUser.role === "PARENT") {
            if (storedStudents) setStudents(JSON.parse(storedStudents));
            if (storedSelected) {
              setSelectedStudentState(JSON.parse(storedSelected));
            }
          }
        }
      } catch (error) {
        console.log("Auth load error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAuth();
  }, []);

  const login = async (data: {
    token: string;
    user: AuthUser;
    students?: Student[];
  }) => {
    try {
      setStudents([]);
      setSelectedStudentState(null);

      setToken(data.token);
      setUser(data.user);
      setRole(data.user.role);
      setAuthToken(data.token);

      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));

      if (data.user.role === "PARENT") {
        const list = data.students || [];

        setStudents(list);

        if (list.length === 1) {
          setSelectedStudentState(list[0]);
          await AsyncStorage.setItem(
            STORAGE_KEYS.SELECTED,
            JSON.stringify(list[0]),
          );
        }

        await AsyncStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
      }
    } catch (error) {
      console.log("Login state error:", error);
    }
  };

  const setSelectedStudent = async (student: Student) => {
    setSelectedStudentState(student);
    await AsyncStorage.setItem(STORAGE_KEYS.SELECTED, JSON.stringify(student));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    setRole(null);
    setStudents([]);
    setSelectedStudentState(null);
    setAuthToken(null);

    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.USER,
      STORAGE_KEYS.STUDENTS,
      STORAGE_KEYS.SELECTED,
    ]);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        user,
        loading,
        students,
        selectedStudent,
        login,
        logout,
        setSelectedStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) throw new Error("Wrap inside AuthProvider");

  return context;
};
