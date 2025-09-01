import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./css/AdminIconPanel.css";

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

interface CategoryType {
  id: number;
  title: string;
  icon: string;
  items: MenuItemType[];
}

interface StudentIconPanelProps {
  isOpen?: boolean;
}

const StudentIconPanel: React.FC<StudentIconPanelProps> = () => {
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFaded, setIsFaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [lastHoveredCategory, setLastHoveredCategory] = useState<number | null>(null);

  const location = useLocation();
  const currentPath = location.pathname;

  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visibilityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load pinned state from localStorage
  useEffect(() => {
    const pinnedState = localStorage.getItem("studentIconPanelPinned");
    if (pinnedState === "true") {
      setIsPinned(true);
      setIsVisible(true);
    }
  }, []);

  // Save pinned state to localStorage
  useEffect(() => {
    localStorage.setItem("studentIconPanelPinned", isPinned.toString());
  }, [isPinned]);

  // Resolve user id for dynamic settings link (match DashboardSidebarTwo)
  const resolvedUserId: string = (() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsed = JSON.parse(userData);
        return String(parsed.id || parsed.user_id || "");
      }
    } catch {}
    return "";
  })();

  // Define categories with items to mirror DashboardSidebarTwo exactly
  const categories: CategoryType[] = [
    {
      id: 1,
      title: "ภาพรวม",
      icon: "fas fa-home",
      items: [
        {
          id: 1,
          link: "/student-dashboard",
          icon: "fas fa-home",
          title: "แดชบอร์ด",
        },
      ],
    },
    {
      id: 2,
      title: "การเรียน",
      icon: "skillgro-book",
      items: [
        {
          id: 3,
          link: "/student-enrolled-courses",
          icon: "skillgro-book",
          title: "หลักสูตรที่ลงทะเบียน",
        },
        {
          id: 6,
          link: "/student-attempts",
          icon: "fas fa-tasks",
          title: "ประวัติการทำแบบทดสอบ",
        },
        {
          id: 7,
          link: "/student-certificate",
          icon: "fas fa-certificate",
          title: "ใบรับรองของฉัน",
        },
        {
          id: 8,
          link: "/student-payment",
          icon: "fas fa-credit-card",
          title: "การชำระเงิน",
        },
      ],
    },
    {
      id: 3,
      title: "การจัดการบัญชี",
      icon: "fas fa-cog",
      items: [
        {
          id: 9,
          link: resolvedUserId ? `/student-setting/${resolvedUserId}` : "/student-setting",
          icon: "fas fa-cog",
          title: "ตั้งค่าโปรไฟล์",
        },
      ],
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
    return currentPath === path || currentPath.startsWith(path + "/");
  };

  const isSubmenuActive = (item: MenuItemType) => {
    if (!item.submenu) return false;
    return item.submenu.some((subItem) => isActive(subItem.link));
  };

  // auto-open submenu if active
  useEffect(() => {
    categories.forEach((category) => {
      category.items.forEach((item) => {
        if (item.hasSubmenu && isSubmenuActive(item)) {
          setOpenSubmenu(item.id);
        }
      });
    });

    // set lastHoveredCategory from current path
    const activeCat = categories.find((cat) =>
      cat.items.some((item) =>
        item.hasSubmenu && item.submenu
          ? item.submenu.some((s) => isActive(s.link))
          : isActive(item.link)
      )
    );
    if (activeCat) setLastHoveredCategory(activeCat.id);
  }, [currentPath]);

  // Hover handlers
  const handleHoverAreaMouseEnter = () => {
    if (visibilityTimeoutRef.current) clearTimeout(visibilityTimeoutRef.current);
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      setIsFaded(false);
    }
    setIsVisible(true);
    setIsHovered(true);
  };

  const handleHoverAreaMouseLeave = () => {
    if (!isPinned) {
      visibilityTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        setIsHovered(false);
        setHoveredCategory(null);
      }, 300);
    }
  };

  const handlePanelMouseEnter = () => {
    if (visibilityTimeoutRef.current) clearTimeout(visibilityTimeoutRef.current);
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      setIsFaded(false);
    }
    setIsVisible(true);
    setIsHovered(true);
  };

  const handlePanelMouseLeave = () => {
    if (!isPinned) {
      visibilityTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        setIsHovered(false);
        setHoveredCategory(null);
      }, 300);
    }
  };

  const handleCategoryHover = (categoryId: number) => {
    setHoveredCategory(categoryId);
    setLastHoveredCategory(categoryId);
  };
  
  const handleCategoryLeave = () => {
    setHoveredCategory(null);
  };

  const handleToggleClick = () => {
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      setIsFaded(false);
    }

    if (isPinned) {
      setIsPinned(false);
      setIsHovered(false);
      setHoveredCategory(null);
    } else {
      setIsPinned(true);
      setIsVisible(true);
      setIsHovered(true);
    }
  };

  const handlePanelInteraction = () => {
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      setIsFaded(false);
    }
    fadeTimeoutRef.current = setTimeout(() => {
      if (!isPinned) setIsFaded(true);
    }, 5000);
  };

  const isPanelVisible = isHovered || isPinned;

  useEffect(() => {
    if (isPanelVisible && !isPinned) {
      handlePanelInteraction();
    }
    return () => {
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
      if (visibilityTimeoutRef.current) clearTimeout(visibilityTimeoutRef.current);
    };
  }, [isPanelVisible, isPinned]);

  return (
    <>
      {/* Small Hover Indicator */}
      <div className="admin-hover-indicator" />

      {/* Invisible Hover Area */}
      <div
        className="admin-icon-panel-hover-area"
        onMouseEnter={handleHoverAreaMouseEnter}
        onMouseLeave={handleHoverAreaMouseLeave}
      />

      {/* Floating Icon Strip */}
      <div
        ref={panelRef}
        className={`admin-icon-panel-strip ${isFaded ? "faded" : ""} ${isVisible ? "visible" : "hidden"}`}
        onMouseEnter={handlePanelMouseEnter}
        onMouseLeave={handlePanelMouseLeave}
      >
        <div className="admin-icon-strip-content">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`admin-icon-strip-category ${hoveredCategory === category.id ? "active" : ""}`}
              onMouseEnter={() => handleCategoryHover(category.id)}
              onMouseLeave={handleCategoryLeave}
              title={category.title}
            >
              <i className={category.icon}></i>
            </div>
          ))}
          <button
            ref={toggleRef}
            className={`admin-icon-strip-toggle ${isPinned ? "pinned" : ""}`}
            onClick={handleToggleClick}
            title={isPinned ? "ปักหมุดเมนู" : "เปิดเมนูเต็ม"}
          >
            <i className={`fas ${isPinned ? "fa-thumbtack" : "fa-bars"}`}></i>
          </button>
        </div>
      </div>

      {/* Expanded Icon Panel */}
      <div
        className={`admin-icon-panel ${isPanelVisible ? "open" : ""} ${isPinned ? "pinned" : ""} ${
          isFaded ? "faded" : ""
        } ${isVisible ? "visible" : "hidden"}`}
        onMouseEnter={handlePanelMouseEnter}
        onMouseLeave={handlePanelMouseLeave}
        onClick={handlePanelInteraction}
      >
        <div className="admin-icon-panel-content">
          {(hoveredCategory ?? lastHoveredCategory) ? (
            <div className="admin-category-content">
              <h4 className="admin-category-title">
                {categories.find((cat) => cat.id === (hoveredCategory ?? lastHoveredCategory))?.title}
              </h4>
              <nav className="admin-icon-panel-menu">
                <ul className="admin-menu-list">
                  {categories
                    .find((cat) => cat.id === (hoveredCategory ?? lastHoveredCategory))
                    ?.items.map((item) => (
                      <li key={item.id} className={item.hasSubmenu ? "has-submenu" : ""}>
                        {item.hasSubmenu ? (
                          <>
                            <button
                              className={`admin-menu-item ${openSubmenu === item.id ? "active" : ""} ${
                                isSubmenuActive(item) ? "parent-active" : ""
                              }`}
                              onClick={() => {
                                toggleSubmenu(item.id);
                                handlePanelInteraction();
                              }}
                              title={item.title}
                            >
                              <i className={item.icon}></i>
                              <span className="admin-menu-title">{item.title}</span>
                              <i
                                className={`fas fa-chevron-down admin-submenu-arrow ${
                                  openSubmenu === item.id ? "open" : ""
                                }`}
                              ></i>
                            </button>
                            <ul className={`admin-submenu ${openSubmenu === item.id ? "open" : ""}`}>
                              {item.submenu?.map((subItem) => (
                                <li key={subItem.id}>
                                  <Link
                                    to={subItem.link}
                                    className={`admin-submenu-item ${isActive(subItem.link) ? "active" : ""}`}
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
                            className={`admin-menu-item ${isActive(item.link) ? "active" : ""}`}
                            title={item.title}
                            onClick={handlePanelInteraction}
                          >
                            <i className={item.icon}></i>
                            <span className="admin-menu-title">{item.title}</span>
                          </Link>
                        )}
                      </li>
                    ))}
                </ul>
              </nav>
            </div>
          ) : null}
        </div>
      </div>

      {/* Overlay */}
      {isPinned && <div className="admin-icon-panel-overlay" onClick={() => setIsPinned(false)}></div>}
    </>
  );
};

export default StudentIconPanel;
