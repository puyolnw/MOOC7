//import HeaderTopOne from "./menu/HeaderTopOne";
import NavMenu from "./menu/NavMenu";
import React, { useState } from "react";
import MobileSidebar from "./menu/MobileSidebar";
import UseSticky from "../../hooks/UseSticky";
import { Link } from "react-router-dom";
import InjectableSvg from "../../hooks/InjectableSvg";
import CustomSelect from "../../ui/CustomSelect";

const HeaderOne = () => {
   const [selectedOption, setSelectedOption] = React.useState(null);
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

   const handleSelectChange = (option: React.SetStateAction<null>) => {
      setSelectedOption(option);
   };

   const { sticky } = UseSticky();
   const [isActive, setIsActive] = useState<boolean>(false);

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
                                 <Link to="/"><img src="/assets/img/logo/logo08.png" alt="Logo" /></Link>
                                 {/* <Link to="/"><img src="/assets/img/logo/logo.svg" alt="Logo" /></Link> */}
                              </div>
                              <div className="ms-auto d-flex align-items-center">
                                 <div className="tgmenu__navbar-wrap tgmenu__main-menu d-none d-xl-flex">
                                    <NavMenu />
                                 </div>
                                 <div className="tgmenu__search d-none d-md-block ms-3">
                                    <CustomSelect value={selectedOption} onChange={handleSelectChange} />
                                 </div>
                                 <div className="tgmenu__action ms-3">
                                    <ul className="list-wrap">
                                       {/* ปรับตำแหน่ง Icon User */}
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
                                                <li>
                                                   <Link to="/student-dashboard">บัญชีของฉัน</Link>
                                                </li>
                                                
                                                <li>
                                                   <Link to="/student-enrolled-courses">หลักสูตรของฉัน</Link>
                                                </li>
                                                <li>
                                                   <Link to="/student-setting">ตั้งค่า</Link>
                                                </li>
                                                <li>
                                                   <Link to="/instructor-dashboard">สำหรับอาจารย์</Link>
                                                </li>
                                                <li>
                                                   <span>ออกจากระบบ</span>
                                                </li>
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
