import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { setAuthExpiredHandler, setAuthSession } from "../api/baseQuery";
import { ALLOWED_AUTH_ROLES } from "../api/auth";
import { storage } from "../utils/secureStorage";

export interface AuthUser {
  _id: string;
  role: string;
  name?: string;
  email?: string;
  image?: string;
  phone?: string;
  teacherId?: string;
}

export interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  image?: string;
  profileImage?: string;
  classId?: any;
  sectionId?: any;
  rollNumber?: number;
}

interface AuthContextType {
  token: string | null;
  refreshToken: string | null;
  role: string | null;
  user: AuthUser | null;
  loading: boolean;
  students: Student[];
  selectedStudent: Student | null;
  login: (data: {
    token: string;
    refreshToken?: string | null;
    user: AuthUser;
    students?: Student[];
  }) => Promise<void>;
  updateUser: (patch: Partial<AuthUser>) => Promise<void>;
  logout: () => Promise<void>;
  setSelectedStudent: (student: Student) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEYS = {
  TOKEN: "token",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
  STUDENTS: "students",
  SELECTED: "selectedStudent",
};

const isAllowedRole = (role: string | undefined | null) =>
  ALLOWED_AUTH_ROLES.has(String(role || "").toUpperCase());

const safeParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.log("[startup] safeParse failed", error);
    return fallback;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudentState] = useState<Student | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      console.log("[startup] Auth restore start");
      try {
        const storedToken = await storage.getItem(STORAGE_KEYS.TOKEN);
        const storedRefreshToken = await storage.getItem(
          STORAGE_KEYS.REFRESH_TOKEN,
        );
        const storedUser = await storage.getItem(STORAGE_KEYS.USER);
        const storedStudents = await storage.getItem(
          STORAGE_KEYS.STUDENTS,
        );
        const storedSelected = await storage.getItem(
          STORAGE_KEYS.SELECTED,
        );

        if (storedToken && storedUser) {
          const parsedUser = safeParse<AuthUser | null>(storedUser, null);
          if (!parsedUser) {
            throw new Error("Stored user payload is invalid");
          }
          const normalizedUser = {
            ...parsedUser,
            role: String(parsedUser.role || "").toUpperCase(),
          };

          if (!isAllowedRole(normalizedUser.role)) {
            await storage.multiRemove([
              STORAGE_KEYS.TOKEN,
              STORAGE_KEYS.REFRESH_TOKEN,
              STORAGE_KEYS.USER,
              STORAGE_KEYS.STUDENTS,
              STORAGE_KEYS.SELECTED,
            ]);
            setAuthSession(null, null);
            return;
          }

          setToken(storedToken);
          setRefreshToken(storedRefreshToken);
          setUser(normalizedUser);
          setRole(normalizedUser.role);
          setAuthSession(storedToken, storedRefreshToken);

          if (normalizedUser.role === "PARENT") {
            if (storedStudents) {
              setStudents(safeParse<Student[]>(storedStudents, []));
            }
            if (storedSelected) {
              setSelectedStudentState(
                safeParse<Student | null>(storedSelected, null),
              );
            }
          }

          console.log("[startup] Auth restore success", normalizedUser.role);
        }
        if (!storedToken || !storedUser) {
          setAuthSession(null, null);
          console.log("[startup] No stored auth, showing login");
        }
      } catch (error) {
        console.log("[startup] Auth restore failed", error);
        // WHY: Authentication hydration should fail silently so a stale cache
        // does not block the app from rendering the login screen.
      } finally {
        console.log("[startup] Auth restore complete");
        setLoading(false);
      }
    };

    loadAuth();
  }, []);

  useEffect(() => {
    setAuthExpiredHandler(() => {
      void logout();
    });

    return () => {
      setAuthExpiredHandler(null);
    };
  }, []);

  const login = async (data: {
    token: string;
    refreshToken?: string | null;
    user: AuthUser;
    students?: Student[];
  }) => {
    const normalizedUser = {
      ...data.user,
      role: String(data.user.role || "").toUpperCase(),
    };

    if (!isAllowedRole(normalizedUser.role)) {
      throw new Error("User not found");
    }

    try {
      setStudents([]);
      setSelectedStudentState(null);

      setToken(data.token);
      setRefreshToken(data.refreshToken || null);
      setUser(normalizedUser);
      setRole(normalizedUser.role);
      setAuthSession(data.token, data.refreshToken || null);

      await storage.setItem(STORAGE_KEYS.TOKEN, data.token);
      if (data.refreshToken) {
        await storage.setItem(
          STORAGE_KEYS.REFRESH_TOKEN,
          data.refreshToken,
        );
      } else {
        await storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      }
      await storage.setItem(STORAGE_KEYS.USER, JSON.stringify(normalizedUser));

      if (normalizedUser.role === "PARENT") {
        const list = data.students || [];

        setStudents(list);

        if (list.length === 1) {
          setSelectedStudentState(list[0]);
          await storage.setItem(
            STORAGE_KEYS.SELECTED,
            JSON.stringify(list[0]),
          );
        }

        await storage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
      } else {
        await storage.multiRemove([
          STORAGE_KEYS.STUDENTS,
          STORAGE_KEYS.SELECTED,
        ]);
      }
    } catch {
      // WHY: Login state persistence is best-effort; API errors already surface
      // through the login screen, so we avoid noisy duplicate console output.
    }
  };

  const updateUser = async (patch: Partial<AuthUser>) => {
    setUser((current) => {
      if (!current) return current;

      const nextUser = { ...current, ...patch };

      storage.setItem(STORAGE_KEYS.USER, JSON.stringify(nextUser)).catch(
        () => {
          // WHY: Profile updates should not fail just because local cache write failed.
        },
      );

      return nextUser;
    });
  };

  const setSelectedStudent = async (student: Student) => {
    setSelectedStudentState(student);
    await storage.setItem(STORAGE_KEYS.SELECTED, JSON.stringify(student));
  };

  const logout = async () => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setRole(null);
    setStudents([]);
    setSelectedStudentState(null);
    setAuthSession(null, null);

    await storage.multiRemove([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
      STORAGE_KEYS.STUDENTS,
      STORAGE_KEYS.SELECTED,
    ]);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        refreshToken,
        role,
        user,
        loading,
        students,
        selectedStudent,
        login,
        updateUser,
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
