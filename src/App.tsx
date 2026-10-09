import { Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { BoardPage } from './pages/BoardPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SessionProvider } from './session/SessionContext'

export default function App() {
  return (
    <SessionProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="board" element={<BoardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </SessionProvider>
  )
}
