import { Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { BoardPage } from './pages/BoardPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { AnalyticsPage } from './pages/AnalyticsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="board" element={<BoardPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
