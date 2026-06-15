import { createContext, useContext, useEffect, useState } from "react";
import { sortLogsNewestFirst } from "../lib/carbon";

const DataContext = createContext();
const seedLogs = [
  { id: "seed-1", total: 27.4, score: 63, category: "Medium", createdAt: new Date(Date.now() - 6 * 86400000).toISOString(), breakdown: { transport: 9.2, electricity: 12.3, food: 2.5, waste: 3.4 } },
  { id: "seed-2", total: 23.1, score: 69, category: "Medium", createdAt: new Date(Date.now() - 4 * 86400000).toISOString(), breakdown: { transport: 7.6, electricity: 10.2, food: 2.5, waste: 2.8 } },
  { id: "seed-3", total: 18.8, score: 75, category: "Medium", createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), breakdown: { transport: 5.8, electricity: 8.1, food: 2.5, waste: 2.4 } }
];

function readLogs() {
  try {
    const saved = localStorage.getItem("ecotrack-logs");
    const parsed = saved ? JSON.parse(saved) : seedLogs;
    const logs = Array.isArray(parsed) ? parsed : seedLogs;
    return sortLogsNewestFirst(logs.map((log) => ({
      ...log,
      trees: Number(log.total) > 0 ? Math.ceil((Number(log.total) * 365) / 21) : 0
    })));
  } catch {
    return seedLogs;
  }
}

export function DataProvider({ children }) {
  const [logs, setLogs] = useState(readLogs);

  useEffect(() => {
    localStorage.setItem("ecotrack-logs", JSON.stringify(logs));
  }, [logs]);

  const addLog = (input, result) => {
    const log = {
      userId: "demo-user",
      ...input,
      ...result,
      breakdown: { transport: result.transport, electricity: result.electricity, food: result.food, waste: result.waste },
      createdAt: new Date().toISOString()
    };
    const savedLog = { ...log, id: crypto.randomUUID() };
    setLogs((current) => [savedLog, ...current]);
    return savedLog;
  };

  return <DataContext.Provider value={{ logs, addLog }}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
