import { Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { BoardPage } from './pages/BoardPage'
import { PlanningPage } from './pages/PlanningPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="board" element={<BoardPage />} />
        <Route path="planning" element={<PlanningPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
