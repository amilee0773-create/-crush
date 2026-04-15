import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Analyzing from './pages/Analyzing'
import Report from './pages/Report'

function App() {
  return (
    <div className="max-w-md mx-auto min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/analyzing" element={<Analyzing />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </div>
  )
}

export default App
