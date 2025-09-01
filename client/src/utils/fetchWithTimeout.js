export async function fetchWithTimeout(resource, options = {}, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const { signal } = controller;
  
    const method = options?.method || "GET";
    const body = options?.body;
  
    console.log("%c[FETCH] Request:", "color: cyan", method, resource);
    if (body) {
      try {
        console.log("%c[FETCH] Body:", "color: gray", JSON.parse(body));
      } catch {
        console.log("%c[FETCH] Body (raw):", "color: gray", body);
      }
    }
  
    try {
      const response = await fetch(resource, {
        ...options,
        signal,
      });
  
      clearTimeout(id);
  
      console.log("%c[FETCH] Response Status:", "color: green", response.status, response.statusText);
  
      const contentType = response.headers.get("content-type");
      let data = null;
  
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
        console.log("%c[FETCH] Response JSON:", "color: green", data);
      } else {
        const text = await response.text();
        if (text) {
          console.log("%c[FETCH] Response Text:", "color: green", text);
          throw new Error(text);
        }
      }
  
      return { response, data };
    } catch (error) {
      clearTimeout(id);
  
      if (error.name === "AbortError") {
        console.error("%c[FETCH ERROR] Timeout raggiunto (5 sec):", "color: red", resource);
        throw new Error("Timeout: il server non ha risposto in tempo.");
      }
  
      console.error("%c[FETCH ERROR]", "color: red", error.message);
      throw error;
    }
  }
  