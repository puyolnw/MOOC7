import { Link } from "react-router-dom";
import menu_data from "../../../data/home-data/MenuData";
import { useEffect, useState } from "react";

const NavMenu = () => {
   const [navClick, setNavClick] = useState<boolean>(false);

   useEffect(() => {
      window.scrollTo(0, 0);
   }, [navClick]);

   return (
      <ul className="navigation d-flex justify-content-end">
         {menu_data.map((menu) => (
            <li 
               key={menu.id} 
               className={menu.sub_menus && menu.sub_menus.length > 0 ? "menu-item-has-children" : ""}
            >
               <Link onClick={() => setNavClick(!navClick)} to={menu.link}>
                  {menu.title}
               </Link>
               {menu.sub_menus && menu.sub_menus.length > 0 && (
                  <ul className={`sub-menu ${menu.menu_class || ""}`}>
                     {menu.sub_menus.map((sub_m, index) => (
                        <li key={index} className={sub_m.mega_menus && sub_m.mega_menus.length > 0 ? "menu-item-has-children" : ""}>
                           <Link onClick={() => setNavClick(!navClick)} to={sub_m.link}>{sub_m.title}</Link>
                           {sub_m.mega_menus && sub_m.mega_menus.length > 0 && (
                              <ul className="sub-menu">
                                 {sub_m.mega_menus.map((mega_m, i) => (
                                    <li key={i}>
                                       <Link onClick={() => setNavClick(!navClick)} to={mega_m.link}>{mega_m.title}</Link>
                                    </li>
                                 ))}
                              </ul>
                           )}
                        </li>
                     ))}
                  </ul>
               )}
            </li>
         ))}
      </ul>
   );
};

export default NavMenu;
