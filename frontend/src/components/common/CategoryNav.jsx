import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { navigationConfig } from "../../config/navigation.js";

const CategoryNav = () => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(null);
  const closeTimer = useRef(null);
  const navRef = useRef(null);

  const handleNavigate = (categoryId, subcategoryLabel) => {
    navigate(`/products?search=${encodeURIComponent(subcategoryLabel)}`);
    setActiveId(null);
  };

  const openMenu = useCallback((id) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveId(id);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setActiveId(null), 100);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const activeCategory = navigationConfig.find((c) => c.id === activeId);

  return (
    <>
      {/* ── Sticky category bar ───────────────────────────── */}
      <nav
        ref={navRef}
        className="bg-white border-b border-gray-200"
        onMouseLeave={scheduleClose}
      >
        <div className="max-w-7xl mx-auto px-6">
          <ul
            className="flex gap-0 scrollbar-hide"
            style={{
              overflowX: "auto",
              overflowY: "visible",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {navigationConfig.map((category) => (
              <li key={category.id} className="shrink-0">
                <button
                  onMouseEnter={() => openMenu(category.id)}
                  style={{ outline: "none" }}
                  className={[
                    "py-3 px-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-150 block",
                    activeId === category.id
                      ? "text-[#570D48] border-[#570D48]"
                      : "text-gray-700 border-transparent hover:text-[#570D48] hover:border-[#570D48]",
                  ].join(" ")}
                >
                  {category.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Full-width mega menu ─────────────────────────── */}
        {/*
          Rendered INSIDE the sticky <nav> so it scrolls with it,
          but uses left: 50%, transform to break out of the max-w wrapper
          and span the full viewport.
        */}
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100vw",
            maxWidth: "100vw",
            zIndex: 50,
            pointerEvents: activeId ? "auto" : "none",
            opacity: activeId ? 1 : 0,
            visibility: activeId ? "visible" : "hidden",
            transition: "opacity 200ms ease, transform 200ms ease",
            transformOrigin: "top center",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderTop: "2px solid #570D48",
              boxShadow: "0 8px 32px -4px rgba(0,0,0,0.15), 0 2px 12px -2px rgba(0,0,0,0.08)",
              borderBottomLeftRadius: "8px",
              borderBottomRightRadius: "8px",
            }}
          >
            <div
              style={{
                maxWidth: "1280px",
                margin: "0 auto",
                padding: "32px 48px",
              }}
            >
              {activeCategory && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${Math.max(3, Math.min(activeCategory.columns.length, 5))}, 1fr)`,
                    gap: "0 56px",
                  }}
                >
                  {activeCategory.columns.map((col, i) => (
                    <div key={i}>
                      <h4
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#570D48",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          marginBottom: "16px",
                          paddingBottom: "10px",
                          borderBottom: "1px solid #f3e0e8",
                        }}
                      >
                        {col.heading}
                      </h4>
                      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                        {col.links.map((link) => (
                          <li key={link} style={{ marginBottom: "2px" }}>
                            <button
                              onClick={() => handleNavigate(activeCategory.id, link)}
                              style={{
                                background: "none",
                                border: "none",
                                padding: "6px 8px 6px 0",
                                cursor: "pointer",
                                fontSize: "13.5px",
                                color: "#374151",
                                textAlign: "left",
                                width: "100%",
                                borderRadius: "4px",
                                transition: "color 120ms ease, padding-left 120ms ease",
                                display: "block",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = "#570D48";
                                e.currentTarget.style.paddingLeft = "8px";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = "#374151";
                                e.currentTarget.style.paddingLeft = "0";
                              }}
                            >
                              {link}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default CategoryNav;