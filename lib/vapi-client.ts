import Vapi from "@vapi-ai/web";

const vapiToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;

if (!vapiToken) {
  console.error("NEXT_PUBLIC_VAPI_WEB_TOKEN is not set in environment variables");
  throw new Error("Vapi token is required");
}

console.log("Vapi token loaded:", vapiToken ? "✓" : "✗");
console.log("Vapi token (first 10 chars):", vapiToken?.substring(0, 10));

export const vapi = new Vapi(vapiToken);

// Add global error handling
vapi.on("error", (error) => {
  console.error("Global Vapi error:", error);
});

// Log when Vapi is ready
console.log("Vapi SDK initialized successfully");