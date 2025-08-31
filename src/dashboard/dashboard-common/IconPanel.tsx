import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./css/IconPanel.css";

interface SubMenuType {
   id: number;
   link: string;
   title: string;
}

interface MenuItemType {
   id: number;
   link: string;
   icon: string;
   title: string;
   hasSubmenu?: boolean;
   submenu?: SubMenuType[];
}

interface IconPanelProps {
   isOpen: boolean;
}

const IconPanel: React.FC<IconPanelProps> = ({ isOpen }) => {
   const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
   const [isPinned, setIsPinned] = useState(false);
   const [isHovered, setIsHovered] = useState(false);
   const [isFaded, setIsFaded] = useState(false);
   const location = useLocation();
   const currentPath = location.pathname;
   const [instructorId, setInstructorId] = useState<string | null>(null);
   const panelRef = useRef<HTMLDivElement>(null);
   const toggleRef = useRef<HTMLButtonElement>(null);
   const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
   const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
   
   // Get user data from localStorage
   useEffect(() => {
      const userData = localStorage.getItem('user');
      if (userData) {
         try {
            const parsedUser = JSON.parse(userData);
            if (parsedUser.instructor_id) {
               setInstructorId(parsedUser.instructor_id.toString());
            } else if (parsedUser.id) {
               setInstructorId(parsedUser.id.toString());
            }
         } catch (error) {
            console.error("Error parsing user data:", error);
         }
      }
   }, []);

   // Load pinned state from localStorage
   useEffect(() => {
      const pinnedState = localStorage.getItem('iconPanelPinned');
      if (pinnedState === 'true') {
         setIsPinned(true);
      }
   }, []);

   // Save pinned state to localStorage
   useEffect(() => {
      localStorage.setItem('iconPanelPinned', isPinned.toString());
   }, [isPinned]);

   // Define menu items
   const menuItems: MenuItemType[] = [
      {
         id: 1,
         link: "/instructor-dashboard",
         icon: "fas fa-home",
         title: "แดชบอร์ด",
      },
      {
         id: 2,
         link: "/ins-creditbank",
         icon: "fas fa-graduation-cap",
         title: "คลังหลักสูตร",
         hasSubmenu: true,
         submenu: [
            {
               id: 1,
               link: "/ins-creditbank",
               title: "เรียกดูหลักสูตร",
            },
         ],
      },
      {
         id: 3,
         link: "/instructor-courses",
         icon: "skillgro-video-tutorial",
         title: "รายวิชาของฉัน",
      },
      {
         id: 4,
         link: "/instructor-grading",
         icon: "skillgro-video-tutorial",
         title: "การตรวจงาน",
      },
      {
         id: 5,
         link: instructorId ? `/instructor-setting/${instructorId}` : "/instructor-setting",
         icon: "fas fa-cog",
         title: "ตั้งค่าบัญชี",
      },
   ];

   const toggleSubmenu = (id: number) => {
      if (openSubmenu === id) {
         setOpenSubmenu(null);
      } else {
         setOpenSubmenu(id);
      }
   };

   const isActive = (path: string) => {
      return currentPath === path || currentPath.startsWith(path + '/');
   };

   const isSubmenuActive = (item: MenuItemType) => {
      if (!item.submenu) return false;
      return item.submenu.some(subItem => isActive(subItem.link));
   };

   useEffect(() => {
      menuItems.forEach(item => {
         if (item.hasSubmenu && isSubmenuActive(item)) {
            setOpenSubmenu(item.id);
         }
      });
   }, [currentPath]);

   // Handle hover events
   const handleToggleMouseEnter = () => {
      if (hoverTimeoutRef.current) {
         clearTimeout(hoverTimeoutRef.current);
      }
      if (fadeTimeoutRef.current) {
         clearTimeout(fadeTimeoutRef.current);
         setIsFaded(false);
      }
      setIsHovered(true);
   };

   const handleToggleMouseLeave = () => {
      if (!isPinned) {
         hoverTimeoutRef.current = setTimeout(() => {
            setIsHovered(false);
         }, 300); // Small delay to prevent flickering
      }
   };

   const handlePanelMouseEnter = () => {
      if (hoverTimeoutRef.current) {
         clearTimeout(hoverTimeoutRef.current);
      }
      if (fadeTimeoutRef.current) {
         clearTimeout(fadeTimeoutRef.current);
         setIsFaded(false);
      }
      setIsHovered(true);
   };

   const handlePanelMouseLeave = () => {
      if (!isPinned) {
         hoverTimeoutRef.current = setTimeout(() => {
            setIsHovered(false);
         }, 300);
      }
   };

   // Handle click to pin/unpin
   const handleToggleClick = () => {
      if (fadeTimeoutRef.current) {
         clearTimeout(fadeTimeoutRef.current);
         setIsFaded(false);
      }
      
      if (isPinned) {
         setIsPinned(false);
         setIsHovered(false);
      } else {
         setIsPinned(true);
         setIsHovered(true);
      }
   };

   // Handle any interaction with the panel
   const handlePanelInteraction = () => {
      if (fadeTimeoutRef.current) {
         clearTimeout(fadeTimeoutRef.current);
         setIsFaded(false);
      }
      
      // Start 5-second timer for fading
      fadeTimeoutRef.current = setTimeout(() => {
         if (!isPinned) {
            setIsFaded(true);
         }
      }, 5000);
   };

   // Determine if panel should be visible
   const isPanelVisible = isOpen || isHovered || isPinned;

   // Start fade timer when panel becomes visible
   useEffect(() => {
      if (isPanelVisible && !isPinned) {
         handlePanelInteraction();
      }
      
      return () => {
         if (fadeTimeoutRef.current) {
            clearTimeout(fadeTimeoutRef.current);
         }
      };
   }, [isPanelVisible, isPinned]);

   return (
      <>
         {/* Floating Icon Strip */}
         <div 
            ref={panelRef}
            className={`icon-panel-strip ${isFaded ? 'faded' : ''}`}
            onMouseEnter={handleToggleMouseEnter}
            onMouseLeave={handleToggleMouseLeave}
         >
            <div className="icon-strip-content">
               {menuItems.map((item) => (
                  <Link 
                     key={item.id}
                     to={item.link} 
                     className={`icon-strip-item ${isActive(item.link) ? "active" : ""}`}
                     title={item.title}
                     onClick={handlePanelInteraction}
                  >
                     <i className={item.icon}></i>
                  </Link>
               ))}
               <button 
                  ref={toggleRef}
                  className={`icon-strip-toggle ${isPinned ? 'pinned' : ''}`}
                  onClick={handleToggleClick}
                  title={isPinned ? "ปักหมุดเมนู" : "เปิดเมนูเต็ม"}
               >
                  <i className={`fas ${isPinned ? 'fa-thumbtack' : 'fa-bars'}`}></i>
               </button>
            </div>
         </div>

         {/* Expanded Icon Panel */}
         <div 
            className={`icon-panel ${isPanelVisible ? 'open' : ''} ${isPinned ? 'pinned' : ''} ${isFaded ? 'faded' : ''}`}
            onMouseEnter={handlePanelMouseEnter}
            onMouseLeave={handlePanelMouseLeave}
            onClick={handlePanelInteraction}
         >
            <div className="icon-panel-content">
               <nav className="icon-panel-menu">
                  <ul className="menu-list">
                     {menuItems.map((item) => (
                        <li key={item.id} className={item.hasSubmenu ? "has-submenu" : ""}>
                           {item.hasSubmenu ? (
                              <>
                                 <button 
                                    className={`menu-item ${openSubmenu === item.id ? "active" : ""} ${isSubmenuActive(item) ? "parent-active" : ""}`}
                                    onClick={() => {
                                       toggleSubmenu(item.id);
                                       handlePanelInteraction();
                                    }}
                                    title={item.title}
                                 >
                                    <i className={item.icon}></i>
                                    <span className="menu-title">{item.title}</span>
                                    <i className={`fas fa-chevron-down submenu-arrow ${openSubmenu === item.id ? "open" : ""}`}></i>
                                 </button>
                                 <ul className={`submenu ${openSubmenu === item.id ? "open" : ""}`}>
                                    {item.submenu?.map((subItem) => (
                                       <li key={subItem.id}>
                                          <Link 
                                             to={subItem.link} 
                                             className={`submenu-item ${isActive(subItem.link) ? "active" : ""}`}
                                             onClick={handlePanelInteraction}
                                          >
                                             <i className="fas fa-circle"></i>
                                             <span>{subItem.title}</span>
                                          </Link>
                                       </li>
                                    ))}
                                 </ul>
                              </>
                           ) : (
                              <Link 
                                 to={item.link} 
                                 className={`menu-item ${isActive(item.link) ? "active" : ""}`}
                                 title={item.title}
                                 onClick={handlePanelInteraction}
                              >
                                 <i className={item.icon}></i>
                                 <span className="menu-title">{item.title}</span>
                              </Link>
                           )}
                        </li>
                     ))}
                  </ul>
               </nav>
            </div>
         </div>

         {/* Overlay - only show when pinned */}
         {isPinned && (
            <div className="icon-panel-overlay" onClick={() => setIsPinned(false)}></div>
         )}
      </>
   );
};

export default IconPanel;


