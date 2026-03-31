import { createInjection } from "@/util/create-inject";
import { useState } from "react";

export const pageState = createInjection(() => {
  const [isStudentDashboard, setIsStudentDashboard] = useState(true);
  return {
    isStudentDashboard,
    setIsStudentDashboard,
  };
});
