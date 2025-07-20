"use client";

import { useEffect, useState } from "react";

const VapiDebug = () => {
  const [envCheck, setEnvCheck] = useState<any>({});

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
    
    setEnvCheck({
      tokenExists: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 10) || "N/A",
      allEnvVars: Object.keys(process.env).filter(key => key.includes('VAPI')),
    });

    console.log("Environment check:", {
      token: token ? "✓ Found" : "✗ Missing",
      length: token?.length,
      start: token?.substring(0, 10),
    });
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-yellow-50">
      <h3 className="text-lg font-bold mb-4">Vapi Environment Debug</h3>
      
      <div className="space-y-2 text-sm">
        <p><strong>Token exists:</strong> {envCheck.tokenExists ? "✅ Yes" : "❌ No"}</p>
        <p><strong>Token length:</strong> {envCheck.tokenLength}</p>
        <p><strong>Token start:</strong> {envCheck.tokenStart}</p>
        <p><strong>Vapi env vars:</strong> {envCheck.allEnvVars?.join(", ") || "None"}</p>
      </div>
      
      <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
        <p><strong>Expected:</strong> Token should be 36 characters starting with UUID format</p>
        <p><strong>Current token:</strong> ce308ec9-e0b9-4d3e-b05d-3dc48d120efa</p>
      </div>
    </div>
  );
};

export default VapiDebug;