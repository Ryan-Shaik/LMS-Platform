import SimpleVapiTest from "@/components/SimpleVapiTest";
import VapiDebug from "@/components/VapiDebug";

export default function TestVapiPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Vapi Testing Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <VapiDebug />
        <SimpleVapiTest />
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Testing Instructions:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>First check the environment debug to ensure the token is loaded</li>
          <li>Allow microphone permissions when prompted</li>
          <li>Try "Test with Pre-built Assistant" first</li>
          <li>If that doesn't work, try "Test with Inline Config"</li>
          <li>Check browser console for detailed error messages</li>
          <li>The tutor should start speaking immediately when the call connects</li>
        </ol>
      </div>
    </div>
  );
}