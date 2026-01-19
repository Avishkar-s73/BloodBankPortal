// src/components/ApiInfo.tsx
import React from "react";

interface ApiInfoProps {
  apiUrl: string;
}

const ApiInfo: React.FC<ApiInfoProps> = ({ apiUrl }) => {
  return (
    <div>
      <p>
        Current API endpoint (public): <strong>{apiUrl}</strong>
      </p>
      <p>
        Private secrets like DATABASE_URL stay on the server; access them via
        server-only code (e.g., API routes or server actions) so they never
        reach the browser bundle.
      </p>
    </div>
  );
};

export default ApiInfo;
