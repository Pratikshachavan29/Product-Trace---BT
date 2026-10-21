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
  const [navParams, setNavParams] = useState(null)

  function handleNavigate(page, params = null) {
    setCurrentPage(page)
    setNavParams(params)
  }

  const Page = pages[currentPage] || Dashboard

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      <Page onNavigate={handleNavigate} navParams={navParams} />
    </Layout>
  )
}
