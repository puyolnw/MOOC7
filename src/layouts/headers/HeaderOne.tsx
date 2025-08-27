import NavMenu from "./menu/NavMenu";
import { useState } from "react";
import MobileSidebar from "./menu/MobileSidebar";
import { Link, useNavigate } from "react-router-dom";
import InjectableSvg from "../../hooks/InjectableSvg";
import useAuthHeader from "../../hooks/useAuthHeader";

import "../../../public/assets/css/header.css";
import axios from "axios";

const HeaderOne = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  
  const navigate = useNavigate();
  
  // ✅ ใช้ Custom Hook สำหรับ Authentication
  const { role, userName, refreshAuthStatus } = useAuthHeader();


  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.post(
        `${apiUrl}/api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      refreshAuthStatus(); // ✅ refresh auth status
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      <header>
        <div id="sticky-header" className="tg-header__area">
          <div className="container custom-container">
            <div className="row">
              <div className="col-12">
                <div className="tgmenu__wrap">
                  <nav className="tgmenu__nav">
                    <div className="logo">
                      <Link to="/">
                        <img src="/assets/img/logo/logo08.png" alt="Logo" />
                      </Link>
                    </div>
                    <div className="ms-auto d-flex align-items-center">
                      <div className="tgmenu__navbar-wrap tgmenu__main-menu d-none d-xl-flex">
                        <NavMenu />
                      </div>


                      <div className="tgmenu__action ms-3">
                        <ul className="list-wrap">
                          <li
                            className="header-btn user-icon"
                            onMouseEnter={() => setIsDropdownOpen(true)}
                            onMouseLeave={() => setIsDropdownOpen(false)}
                          >
                            <InjectableSvg
                              src="/assets/img/icons/user.svg"
                              alt="User Icon"
                              className="injectable"
                            />

                            {isDropdownOpen && (
                              <ul className="dropdown-menu">
                                {role ? (
                                  <>
                                    {userName && (
                                      <li className="user-name" style={{padding: "10px 15px", borderBottom: "1px solid #eee", fontWeight: "bold", color: "#333"}}>
                                        {userName}
                                      </li>
                                    )}
                                    {role === "student" && (
                                      <>
                                        <li className="logout-menu">
                                          <Link to="/student-dashboard" className="logout-link">
                                            <i className="fa-solid fa-user"></i>
                                            <span className="logout-text">บัญชีของฉัน</span>
                                          </Link>
                                        </li>
                                        <li className="logout-menu">
                                          <Link to="/student-enrolled-courses" className="logout-link">
                                            <i className="fa-solid fa-book"></i>
                                            <span className="logout-text">หลักสูตรของฉัน</span>
                                          </Link>
                                        </li>
                                        <li className="logout-menu">
                                          <Link to="/student-setting/${userId}" className="logout-link">
                                            <i className="fa-solid fa-gear"></i>
                                            <span className="logout-text">ตั้งค่า</span>
                                          </Link>
                                        </li>
                                      </>
                                    )}
                                    {role === "instructor" && (
                                      <>
                                        <li className="logout-menu">
                                          <Link to="/instructor-dashboard" className="logout-link">
                                            <i className="fa-solid fa-user"></i>
                                            <span className="logout-text">บัญชีของฉัน</span>
                                          </Link>
                                        </li>

                                      </>
                                    )}
                                    {role === "admin" && (
                                      <li className="logout-menu">
                                      <Link to="/admin-dashboard" className="logout-link">
                                        <i className="fa-solid fa-user-tie"></i>
                                        <span className="logout-text">แดชบอร์ดแอดมิน</span>
                                      </Link>
                                    </li>
                                    )}
                                    {role === "manager" && (
                                      <li className="logout-menu">
                                        <Link to="/manager-creditbank" className="logout-link">
                                          <i className="fa-solid fa-user-tie"></i>
                                          <span className="logout-text">แดชบอร์ดประธานหลักสูตร</span>
                                        </Link>
                                      </li>
                                    )}
                                    <li className="logout-menu">
                                      <span onClick={handleLogout} className="logout-link">
                                        <i className="fa-solid fa-right-from-bracket"></i>
                                        <span className="logout-text">ออกจากระบบ</span>
                                      </span>
                                    </li>
                                  </>
                                ) : (
                                  <>
                                    <li className="logout-menu">
                                      <Link to="/registration" className="logout-link">
                                        <i className="fa-solid fa-pen-to-square"></i>
                                        <span className="logout-text">ลงทะเบียน</span>
                                      </Link>
                                    </li>
                                    <li className="logout-menu">
                                      <Link to="/login" className="logout-link">
                                        <i className="fa-solid fa-user-tie"></i>
                                        <span className="logout-text">เข้าสู่ระบบ</span>
                                      </Link>
                                    </li>
                                  </>
                                )}
                              </ul>
                            )}
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="mobile-login-btn">
                      <Link to="/login">
                        <InjectableSvg
                          src="/assets/img/icons/user.svg"
                          alt=""
                          className="injectable"
                        />
                      </Link>
                    </div>

                    <div onClick={() => setIsActive(true)} className="mobile-nav-toggler">
                      <i className="tg-flaticon-menu-1"></i>
                    </div>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <MobileSidebar isActive={isActive} setIsActive={setIsActive} />
    </>
  );
};

export default HeaderOne;
