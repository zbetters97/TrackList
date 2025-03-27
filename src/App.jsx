import { ErrorBoundary } from "react-error-boundary";
import { createBrowserRouter, Link, RouterProvider } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import HomePage from "./pages/Home/HomePage";
import Layout from "./components/Layout/Layout";
import LoginPage from "./pages/Login/LoginPage";
import AppProviders from "./context/AppProviders";
import SearchPage from "./pages/Search/SearchPage";
import ArtistPage from "./pages/Artist/ArtistPage";

export default function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <HomePage />,
        },
        {
          path: "/account/login",
          element: <LoginPage />,
        },
        {
          path: "/search",
          element: <SearchPage />,
        },
        {
          path: "/artists/:artistId",
          element: <ArtistPage />,
        },
        {
          path: "/account/*",
          element: <SearchPage />,
        },
        {
          path: "*",
          element: <ErrorPage is404={true} />,
        },
      ],
    },
  ]);

  return (
    <ErrorBoundary FallbackComponent={(props) => <ErrorPage {...props} />}>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ErrorBoundary>
  );
}

function ErrorPage({ error, is404 }) {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center text-5xl">
      <FontAwesomeIcon
        icon={faExclamationTriangle}
        className="text-6xl text-red-500"
      />

      <h1 className="text-3xl font-bold">
        {is404 ? "404 - Page Not Found" : "Oops! Something went wrong :("}
      </h1>
      {error && <p>{error.message}</p>}

      <Link
        to="/"
        className="mt-6 flex w-fit items-center gap-4 rounded-full bg-green-700 px-4 py-2 text-2xl no-underline"
        style={{ textDecoration: "none" }}
      >
        <FontAwesomeIcon icon={faHome} />
        Go to home
      </Link>
    </div>
  );
}
