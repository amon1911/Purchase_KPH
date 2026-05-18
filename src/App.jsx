import React, { useState, useEffect } from "react";
import LoginScreen from "./components/LoginScreen";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import CreateRequest from "./pages/CreateRequest";
import RequestList from "./pages/RequestList";
import RequestDetail from "./pages/RequestDetail";
import PrintView from "./pages/PrintView";
import { useAuth } from "./hooks/useAuth";
import { getStats } from "./lib/requests";

export default function App() {
  const auth = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [awaitingCount, setAwaitingCount] = useState(0);

  useEffect(() => {
    if (auth.currentUser) {
      getStats(auth.currentUser).then((s) => setAwaitingCount(s.awaitingMe));
    }
  }, [auth.currentUser, currentPage]);

  // ถ้ายังไม่ login → เเสดง LoginScreen
  if (auth.loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-bold">
        กำลังโหลด...
      </div>
    );
  }

  if (!auth.currentUser) {
    return (
      <LoginScreen
        authHook={auth}
        onLogin={() => setCurrentPage("dashboard")}
      />
    );
  }

  // Layout เมื่อ login เเล้ว
  // หน้า Print เป็นโหมดเต็มจอ ไม่มี Sidebar
  if (currentPage === "print" && selectedRequestId) {
    return (
      <PrintView
        requestId={selectedRequestId}
        setCurrentPage={setCurrentPage}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={(p) => {
          setCurrentPage(p);
          if (p !== "detail" && p !== "print") setSelectedRequestId(null);
        }}
        currentUser={auth.currentUser}
        onLogout={auth.logout}
        awaitingCount={awaitingCount}
      />

      <main className="flex-1 overflow-x-hidden">
        {currentPage === "dashboard" && (
          <Dashboard
            currentUser={auth.currentUser}
            setCurrentPage={setCurrentPage}
            setSelectedRequestId={setSelectedRequestId}
          />
        )}
        {currentPage === "create" && (
          <CreateRequest
            currentUser={auth.currentUser}
            setCurrentPage={setCurrentPage}
          />
        )}
        {currentPage === "list" && (
          <RequestList
            currentUser={auth.currentUser}
            setCurrentPage={setCurrentPage}
            setSelectedRequestId={setSelectedRequestId}
          />
        )}
        {currentPage === "detail" && selectedRequestId && (
          <RequestDetail
            requestId={selectedRequestId}
            currentUser={auth.currentUser}
            setCurrentPage={setCurrentPage}
          />
        )}
      </main>
    </div>
  );
}
