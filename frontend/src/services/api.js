const API_BASE_URL = "http://localhost:8000";

export async function runDetection(source) {
  const response = await fetch(`${API_BASE_URL}/detect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ source }),
  });

  if (!response.ok) {
    throw new Error("Failed to run detection");
  }

  return response.json();
}
