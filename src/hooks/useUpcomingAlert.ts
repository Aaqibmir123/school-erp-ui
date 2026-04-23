import { useEffect, useRef, useState } from "react";
import { Vibration } from "react-native";

export const useUpcomingAlert = (classData: any) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  const triggeredRef = useRef({
    tenMin: false,
    fiveMin: false,
    oneMin: false,
  });

  useEffect(() => {
    if (!classData?.startTime) {
      setTimeLeft("");
      return;
    }

    // 🔥 reset triggers when class changes
    triggeredRef.current = {
      tenMin: false,
      fiveMin: false,
      oneMin: false,
    };

    const getStartTime = () => {
      const [hour, minute] = classData.startTime.split(":").map(Number);

      const date = new Date();
      date.setHours(hour);
      date.setMinutes(minute);
      date.setSeconds(0);
      date.setMilliseconds(0);

      return date;
    };

    const interval = setInterval(() => {
      const now = new Date();
      const classTime = getStartTime();

      const diff = classTime.getTime() - now.getTime();

      // ⏱ TIMER
      if (diff <= 0) {
        setTimeLeft("Started");
        return;
      }

      const totalSec = Math.floor(diff / 1000);
      const mins = Math.floor(totalSec / 60);
      const secs = totalSec % 60;

      setTimeLeft(`${mins}m ${secs}s`);

      // 🔔 10 MIN ALERT
      if (!triggeredRef.current.tenMin && mins <= 10 && mins > 9) {
        Vibration.vibrate(500);
        triggeredRef.current.tenMin = true;
      }

      // 🔔 5 MIN ALERT
      if (!triggeredRef.current.fiveMin && mins <= 5 && mins > 4) {
        Vibration.vibrate([400, 200, 400]);
        triggeredRef.current.fiveMin = true;
      }

      // 🔔 1 MIN ALERT
      if (!triggeredRef.current.oneMin && mins < 1 && mins >= 0) {
        Vibration.vibrate([300, 100, 300, 100, 300]);
        triggeredRef.current.oneMin = true;
      }
    }, 1000000000);

    return () => clearInterval(interval);
  }, [classData?.startTime]); // 🔥 FIXED DEPENDENCY

  return { timeLeft };
};
