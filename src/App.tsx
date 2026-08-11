import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { RequireAuth } from './components/auth/RequireAuth';
import { Login } from './pages/Login';
import { SupplierList } from './pages/SupplierList';
import { RaiseQuery } from './pages/RaiseQuery';
import { QueryStatus } from './pages/QueryStatus';

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RequireAuth />}>
            <Route path="/" element={<SupplierList />} />
            <Route path="/queries/new" element={<RaiseQuery />} />
            <Route path="/queries/:id" element={<QueryStatus />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MotionConfig>
  );
}

export default App;
