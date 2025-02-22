export async function chatWithAI(message: string): Promise<string> {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
  
      const data = await res.json();
      if (data.response) {
        return data.response;
      } else {
        return "AI response error";
      }
    } catch (error) {
      console.error("Chat error:", error);
      return "Error fetching AI response";
    }
  }
  