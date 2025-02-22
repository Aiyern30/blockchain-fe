export async function chatWithAI(message: string): Promise<string> {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        if (response.status === 429) {
          return "Rate limit exceeded. Please wait and try again.";
        } else if (response.status === 404) {
          return "AI model not available. Please try again later.";
        } else {
          return "Something went wrong. Please try again.";
        }
      }
  
      return data.response;
    } catch (error) {
      console.error("Error fetching AI response:", error);
      return "Failed to connect to AI. Please check your internet connection.";
    }
  }
  