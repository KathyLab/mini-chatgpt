import { createBrowserRouter } from 'react-router-dom';
import ChatPage from '../pages/ChatPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <ChatPage />,
  },
]);

export default router;
