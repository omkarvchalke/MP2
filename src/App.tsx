import { Route, Routes, BrowserRouter } from "react-router-dom";
import NavBar from "./components/NavBar";
import SearchList from "./components/SearchList";
import Gallery from "./components/Gallery";
import Detail from "./components/Detail";


export default function App(){
return (
<BrowserRouter basename="/MP2">{/* set to your repo name */}
<NavBar />
<Routes>
<Route path="/" element={<SearchList/>} />
<Route path="/gallery" element={<Gallery/>} />
<Route path="/detail/:name" element={<Detail/>} />
</Routes>
</BrowserRouter>
);
}