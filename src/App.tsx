import Popup from "./components/Popup";
import "./styles/common.scss";

const App = () => {
  return (
    <div
      className="app-container"
      style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Popup />
      </div>
    </div>
  );
};

export default App;
