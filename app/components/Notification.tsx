"use client";

import * as React from "react";

type Kind = "success" | "error" | "info";

type Ctx = {
  showNotification: (msg: string, kind?: Kind) => void;
};

const NotificationContext = React.createContext<Ctx>({
  showNotification: () => {},
});

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [message, setMessage] = React.useState<string | null>(null);
  const [kind, setKind] = React.useState<Kind>("info");

  const showNotification = (msg: string, k: Kind = "info") => {
    setKind(k);
    setMessage(msg);
    // auto hide after 2.5s
    setTimeout(() => setMessage(null), 2500);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="toast toast-end z-50">
        {message && (
          <div
            className={`alert ${
              kind === "success"
                ? "alert-success"
                : kind === "error"
                ? "alert-error"
                : "alert-info"
            }`}
          >
            <span>{message}</span>
          </div>
        )}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return React.useContext(NotificationContext);
}
