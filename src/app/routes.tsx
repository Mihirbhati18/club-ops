import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import CoverPage from "./components/CoverPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import Dashboard from "./components/Dashboard";
import DepartmentsPage from "./components/DepartmentsPage";
import EventsPage from "./components/EventsPage";
import FinancePage from "./components/FinancePage";
import ProjectsPage from "./components/ProjectsPage";
import MeetingsPage from "./components/MeetingsPage";
import AboutPage from "./components/AboutPage";
import NotFound from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <CoverPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/app",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "departments",
        element: <DepartmentsPage />,
      },
      {
        path: "events",
        element: <EventsPage />,
      },
      {
        path: "finance",
        element: <FinancePage />,
      },
      {
        path: "projects",
        element: <ProjectsPage />,
      },
      {
        path: "meetings",
        element: <MeetingsPage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
