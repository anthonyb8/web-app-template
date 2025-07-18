import { useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");

  const fetchMessage = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/hello");
      console.log(response);
      console.log("recieved response");
      setMessage(response.data.msg);
    } catch (error) {
      setMessage("Error fetching message");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>React + FastAPI</h1>
      <button onClick={fetchMessage}>Get Message from FastAPI</button>
      <p>{message}</p>
    </div>
  );
}

export default App;
