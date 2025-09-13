import NavMenu from "./menu/NavMenu";
import { useState, memo, useCallback, useMemo, useRef, useEffect } from "react";
import MobileSidebar from "./menu/MobileSidebar";
import { Link, useNavigate, useLocation } from "react-router-dom";
import InjectableSvg from "../../hooks/InjectableSvg";
import useAuthHeader from "../../hooks/useAuthHeader";

import "../../../public/assets/css/header.css";
import axios from "axios";

const HeaderOne = memo(() => {
  const [isActive, setIsActive] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ ใช้ Custom Hook สำหรับ Authentication
  const { role, userName, refreshAuthStatus } = useAuthHeader();

  // Memoize auth data เพื่อป้องกัน re-renders
  const authData = useMemo(() => ({
    role,
    userName,
    refreshAuthStatus
  }), [role, userName, refreshAuthStatus]);

  // Memoize location เพื่อให้ logo re-render เมื่อเปลี่ยนหน้า
  const currentPath = useMemo(() => location.pathname, [location.pathname]);

  // ป้องกัน re-render ของ header
  useEffect(() => {
    if (headerRef.current) {
      // เพิ่ม CSS class เพื่อป้องกัน re-render
      headerRef.current.style.willChange = 'auto';
    }
  }, []);


  const handleLogout = useCallback(async () => {
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
      authData.refreshAuthStatus(); // ✅ refresh auth status
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, [authData.refreshAuthStatus, navigate]);

  return (
    <>
      <header ref={headerRef}>
        <div id="sticky-header" className="tg-header__area">
          <div className="container custom-container">
            <div className="row">
              <div className="col-12">
                <div className="tgmenu__wrap">
                  <nav className="tgmenu__nav">
                    <div className="logo">
                      <Link to="/" key={currentPath}>
                        <img src="/assets/img/logo/logo08.png" alt="Logo" />
                      </Link>
                    </div>
                    <div className="ms-auto d-flex align-items-center">
                      <div className="tgmenu__navbar-wrap tgmenu__main-menu d-none d-xl-flex">
                        <NavMenu />
                      </div>


                      <div className="tgmenu__action ms-3">
                        <ul className="list-wrap">
                          <li className="header-btn user-icon">
                            <InjectableSvg
                              src="/assets/img/icons/user.svg"
                              alt="User Icon"
                              className="injectable"
                            />

                            <ul className="dropdown-menu">
                                {authData.role ? (
                                  <>
                                    {authData.userName && (
                                      <li className="user-name">
                                        {authData.userName}
                                      </li>
                                    )}
                                    {authData.role === "student" && (
                                      <>
                                        <li className="logout-menu">
                                          <Link to="/student-dashboard" className="logout-link">
                                            <span className="logout-text">บัญชีของฉัน</span>
                                          </Link>
                                        </li>
                                        <li className="logout-menu">
                                          <Link to="/student-enrolled-courses" className="logout-link">
                                            <span className="logout-text">หลักสูตรของฉัน</span>
                                          </Link>
                                        </li>
                                        <li className="logout-menu">
                                          <Link to="/student-setting/${userId}" className="logout-link">
                                            <span className="logout-text">ตั้งค่า</span>
                                          </Link>
                                        </li>
                                      </>
                                    )}
                                    {authData.role === "instructor" && (
                                      <>
                                        <li className="logout-menu">
                                          <Link to="/instructor-dashboard" className="logout-link">
                                            <span className="logout-text">บัญชีของฉัน</span>
                                          </Link>
                                        </li>

                                      </>
                                    )}
                                    {authData.role === "admin" && (
                                      <li className="logout-menu">
                                      <Link to="/admin-dashboard" className="logout-link">
                                        <span className="logout-text">แดชบอร์ดแอดมิน</span>
                                      </Link>
                                    </li>
                                    )}
                                    {authData.role === "manager" && (
                                      <li className="logout-menu">
                                        <Link to="/manager-creditbank" className="logout-link">
                                          <span className="logout-text">แดชบอร์ดประธานหลักสูตร</span>
                                        </Link>
                                      </li>
                                    )}
                                    <li className="logout-menu">
                                      <span onClick={handleLogout} className="logout-link">
                                        <span className="logout-text">ออกจากระบบ</span>
                                      </span>
                                    </li>
                                  </>
                                ) : (
                                  <>
                                    <li className="logout-menu">
                                      <Link to="/registration" className="logout-link">
                                        <span className="logout-text">ลงทะเบียน</span>
                                      </Link>
                                    </li>
                                    <li className="logout-menu">
                                      <Link to="/login" className="logout-link">
                                        <span className="logout-text">เข้าสู่ระบบ</span>
                                      </Link>
                                    </li>
                                  </>
                                )}
                            </ul>
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
});

HeaderOne.displayName = 'HeaderOne';

export default HeaderOne;
