import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PostButton from "../Buttons/PostButton";
import { useAuthContext } from "../../context/Auth/AuthContext";

export default function Navbar() {
  const { globalUser, logout } = useAuthContext();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  function handleUserClick() {
    if (globalUser) {
      setShowDropdown(!showDropdown);
    } else {
      navigate("/account/login");
    }
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <ul className="flex items-center gap-6 px-6 py-4 text-2xl">
      <li>
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${isActive ? "text-green-700" : "hover:text-gray-400"}`
          }
        >
          Home
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/search"
          className={({ isActive }) =>
            `${isActive ? "text-green-700" : "hover:text-gray-400"}`
          }
        >
          Search
        </NavLink>
      </li>
      <li className="ml-auto">
        {globalUser ? (
          <PostButton />
        ) : (
          <NavLink
            to="/account/login"
            className="flex cursor-pointer items-center gap-1 rounded-md bg-green-900 px-2 py-1 hover:text-gray-400"
          >
            <FontAwesomeIcon icon={faPlus} />
            <p>Post</p>
          </NavLink>
        )}
      </li>
      <li>
        <div ref={dropdownRef} className="relative">
          <FaUser
            onClick={handleUserClick}
            className={`cursor-pointer text-4xl ${
              location.pathname.startsWith("/account")
                ? "text-green-700"
                : "text-white hover:text-gray-400"
            }`}
          />
          <div
            className={`absolute top-10 right-0 w-fit overflow-hidden rounded-lg bg-green-900 text-white transition-all duration-300 ease-in-out ${
              showDropdown
                ? "max-h-screen p-2 opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <DropdownMenu
              items={[
                { label: "Profile", path: "/account/profile" },
                { label: "Lists", path: "/account/lists" },
                { label: "Friends", path: "/account/friends" },
                { label: "Logout", path: "/account/login", action: logout },
              ]}
              onClose={() => setShowDropdown(false)}
            />
          </div>
        </div>
      </li>
    </ul>
  );

  function DropdownMenu({ items, onClose }) {
    return (
      <ul className="flex flex-col gap-2 px-4 py-2">
        {items.map(({ label, path, action }) => (
          <li
            key={label}
            className="transition-all duration-150 hover:text-gray-400"
          >
            <Link
              to={path}
              onClick={() => {
                if (action) action();
                onClose();
              }}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    );
  }
}
