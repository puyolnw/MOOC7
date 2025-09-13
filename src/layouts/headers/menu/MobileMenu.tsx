import { useState } from "react";
import { Link } from "react-router-dom";
import useMenuData from '../../../data/home-data/MenuData';

const MobileMenu = () => {
   const [navTitle, setNavTitle] = useState<string | null>(null);
   const [subNavTitle, setSubNavTitle] = useState<string | null>(null);
   const { menuData, isLoading } = useMenuData();

   const openMobileMenu = (menu: string) => {
      setNavTitle(navTitle === menu ? null : menu);
   };

   const openMobileSubMenu = (sub_m: string) => {
      setSubNavTitle(subNavTitle === sub_m ? null : sub_m);
   };

   if (isLoading) {
      return (
         <ul className="navigation">
            <li>
               <span style={{ padding: "10px 15px", color: "#666" }}>กำลังโหลด...</span>
            </li>
         </ul>
      );
   }

   if (!menuData || menuData.length === 0) {
      return null;
   }

   return (
      <ul className="navigation">
         {menuData.map((menu) => (
            <li key={menu.id} className="menu-item-has-children">
               <Link to={menu.link}>{menu.title}</Link>
               <ul
                  className={`sub-menu ${menu.menu_class}`}
                  style={{ display: navTitle === menu.title ? "block" : "none" }}
               >
                  {menu.sub_menus?.map((sub_m, index) => (
                     <li
                        key={index}
                        className={`${sub_m.dropdown ? "menu-item-has-children" : ""}`}
                     >
                        <Link to={sub_m.link}>{sub_m.title}</Link>
                        {sub_m.mega_menus && (
                           <ul
                              className="sub-menu"
                              style={{
                                 display: subNavTitle === sub_m.title ? "block" : "none",
                              }}
                           >
                              {sub_m.mega_menus.map((mega_m, i) => (
                                 <li key={i}>
                                    <Link to={mega_m.link}>{mega_m.title}</Link>
                                 </li>
                              ))}
                           </ul>
                        )}
                        {sub_m.mega_menus && (
                           <div
                              className={`dropdown-btn ${subNavTitle === sub_m.title ? "open" : ""}`}
                              onClick={() => openMobileSubMenu(sub_m.title)}
                           >
                              <span className="plus-line"></span>
                           </div>
                        )}
                     </li>
                  ))}
               </ul>
               <div
                  className={`dropdown-btn ${navTitle === menu.title ? "open" : ""}`}
                  onClick={() => openMobileMenu(menu.title)}
               >
                  <span className="plus-line"></span>
               </div>
            </li>
         ))}
      </ul>
   );
};

export default MobileMenu;
