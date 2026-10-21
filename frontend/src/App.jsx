import { useState } from 'react'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import RegisterProduct from './pages/RegisterProduct.jsx'
import TrackProduct from './pages/TrackProduct.jsx'
import VerifyProduct from './pages/VerifyProduct.jsx'

const pages = {
  dashboard: Dashboard,
  register: RegisterProduct,
  track: TrackProduct,
  verify: VerifyProduct,
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const Page = pages[currentPage]

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      <Page onNavigate={setCurrentPage} />
    </Layout>
  )
}
