"use client";

import { useState } from "react";
import { vapi } from "@/lib/vapi-client";

const SimpleVapiTest = () => {
  const [status, setStatus] = useState("Ready to test");
  const [isActive, setIsActive] = useState(false);

  const testWithPrebuiltAssistant = async () => {
    setStatus("Testing with pre-built assistant...");
    
    try {
      // Use the assistant I just created specifically for testing
      const assistantId = "73e36aeb-d8fd-4de5-8b43-482abb3a2b33";
      
      console.log("Starting call with assistant ID:", assistantId);
      
      // Start call with just the assistant ID
      await vapi.start(assistantId);
      
      setStatus("Call started successfully! The tutor should be speaking now.");
      setIsActive(true);
      
    } catch (error: any) {
      console.error("Test call failed:", error);
      setStatus(`Test failed: ${error.message}`);
    }
  };

  const testWithInlineConfig = async () => {
    setStatus("Testing with inline config...");
    
    try {
      const simpleConfig = {
        name: "Test Assistant",
        firstMessage: "Hello! This is a test. Can you hear me speaking?",
        firstMessageMode: "assistant-speaks-first" as const,
        transcriber: {
          provider: "deepgram" as const,
          model: "nova-2",
          language: "en-US",
        },
        voice: {
          provider: "11labs" as const,
          voiceId: "sarah",
        },
        model: {
          provider: "openai" as const,
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system" as const,
              content: "You are a test assistant. Keep responses very short. Always speak first.",
            },
          ],
        },
      };

      console.log("Starting test call with config:", simpleConfig);
      
      await vapi.start(simpleConfig);
      setStatus("Call started successfully!");
      setIsActive(true);
      
    } catch (error: any) {
      console.error("Test call failed:", error);
      setStatus(`Test failed: ${error.message}`);
    }
  };

  const stopCall = () => {
    try {
      vapi.stop();
      setStatus("Call stopped");
      setIsActive(false);
    } catch (error: any) {
      console.error("Error stopping call:", error);
      setStatus(`Error stopping: ${error.message}`);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-gray-50 max-w-md">
      <h3 className="text-lg font-bold mb-4">Simple Vapi Test</h3>
      <p className="mb-4 text-sm">Status: {status}</p>
      
      <div className="space-y-2">
        <button
          onClick={testWithPrebuiltAssistant}
          disabled={isActive}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          Test with Pre-built Assistant
        </button>
        
        <button
          onClick={testWithInlineConfig}
          disabled={isActive}
          className="w-full px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
        >
          Test with Inline Config
        </button>
        
        <button
          onClick={stopCall}
          disabled={!isActive}
          className="w-full px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400"
        >
          Stop Call
        </button>
      </div>
      
      <div className="mt-4 text-xs text-gray-600">
        <p>Check browser console for detailed logs</p>
        <p>Make sure microphone permission is granted</p>
      </div>
    </div>
  );
};

export default SimpleVapiTest;