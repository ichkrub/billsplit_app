import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './pages/landing/LandingPage'
import QuickSplitPage from './pages/quicksplit/QuickSplitPage'
import SharedSplitPage from './pages/SharedSplitPage'

const App = () => (
  <Router>
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/quicksplit" element={<QuickSplitPage />} />
        <Route path="/split/:id" element={<SharedSplitPage />} />
      </Routes>
    </Layout>
  </Router>
)

export default App 