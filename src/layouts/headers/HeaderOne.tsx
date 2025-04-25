import NavMenu from "./menu/NavMenu";
import { useEffect, useState } from "react";
import MobileSidebar from "./menu/MobileSidebar";
import UseSticky from "../../hooks/UseSticky";
import { Link, useNavigate } from "react-router-dom";
import InjectableSvg from "../../hooks/InjectableSvg";

import "../../../public/assets/css/header.css";
import axios from "axios";

const HeaderOne = () => {

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const navigate = useNavigate();
  const { sticky } = UseSticky();

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      const user = JSON.parse(userJson);
      setRole(user.role);
    }
  }, []);


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
      setRole(null); // ✅ reset role
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      <header>
        <div id="header-fixed-height"></div>
        <div id="sticky-header" className={`tg-header__area ${sticky ? "sticky-menu" : ""}`}>
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
                                    {role === "student" && (
                                      <>
                                        <li><Link to="/student-dashboard">บัญชีของฉัน</Link></li>
                                        <li><Link to="/student-enrolled-courses">หลักสูตรของฉัน</Link></li>
                                        <li><Link to="/student-setting">ตั้งค่า</Link></li>
                                      </>
                                    )}
                                    {role === "instructor" && (
                                      <>
                                        <li><Link to="/instructor-dashboard">บัญชีของฉัน</Link></li>

                                      </>
                                    )}
                                    {role === "admin" && (
                                      <li><Link to="/admin-dashboard">Admin Panel</Link></li>
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
                                    <li><Link to="/registration">สมัครสมาชิก</Link></li>
                                    <li><Link to="/login">เข้าสู่ระบบ</Link></li>
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
