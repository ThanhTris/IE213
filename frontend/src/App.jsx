import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import CreateNewProduct from "./pages/admin/CreateNewProduct";


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-new-product" element={<CreateNewProduct />} />
      </Routes>
    </div>
  );
}

export default App;
