import { Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";

interface CourseTopProps {
  startOffset: number;
  endOffset: number;
  totalItems: number;
  handleTabClick: (index: number) => void;
  activeTab: number;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
}

interface TitleType {
  id: number;
  icon: JSX.Element;
}

const tab_title: TitleType[] = [
  {
    id: 1,
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4.5 6C4.5 6.55 4.95 7 5.5 7H8.5C9.05 7 9.5 6.55 9.5 6V3C9.5 2.45 9.05 2 8.5 2H5.5C4.95 2 4.5 2.45 4.5 3V6Z"
          fill="currentColor"
        />
        <path
          d="M10.5 6C10.5 6.55 10.95 7 11.5 7H14.5C15.05 7 15.5 6.55 15.5 6V3C15.5 2.45 15.05 2 14.5 2H11.5C10.95 2 10.5 2.45 10.5 3V6Z"
          fill="currentColor"
        />
        <path
          d="M4.5 14C4.5 14.55 4.95 15 5.5 15H8.5C9.05 15 9.5 14.55 9.5 14V11C9.5 10.45 9.05 10 8.5 10H5.5C4.95 10 4.5 10.45 4.5 11V14Z"
          fill="currentColor"
        />
        <path
          d="M10.5 14C10.5 14.55 10.95 15 11.5 15H14.5C15.05 15 15.5 14.55 15.5 14V11C15.5 10.45 15.05 10 14.5 10H11.5C10.95 10 10.5 10.45 10.5 11V14Z"
          fill="currentColor"
        />
        <path
          d="M4.5 3V6C4.5 6.55 4.95 7 5.5 7H8.5C9.05 7 9.5 6.55 9.5 6V3C9.5 2.45 9.05 2 8.5 2H5.5C4.95 2 4.5 2.45 4.5 3Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: 2,
    icon: (
      <svg width="19" height="15" viewBox="0 0 19 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M1.5 6C0.67 6 0 6.67 0 7.5C0 8.33 0.67 9 1.5 9C2.33 9 3 8.33 3 7.5C3 6.67 2.33 6 1.5 6ZM1.5 0C0.67 0 0 0.67 0 1.5C0 2.33 0.67 3 1.5 3C2.33 3 3 2.33 3 1.5C3 0.67 2.33 0 1.5 0ZM1.5 12C0.67 12 0 12.68 0 13.5C0 14.32 0.68 15 1.5 15C2.32 15 3 14.32 3 13.5C3 12.68 2.33 12 1.5 12ZM5.5 14.5H17.5C18.05 14.5 18.5 14.05 18.5 13.5C18.5 12.95 18.05 12.5 17.5 12.5H5.5C4.95 12.5 4.5 12.95 4.5 13.5C4.5 14.05 4.95 14.5 5.5 14.5ZM5.5 8.5H17.5C18.05 8.5 18.5 8.05 18.5 7.5C18.5 6.95 18.05 6.5 17.5 6.5H5.5C4.95 6.5 4.5 6.95 4.5 7.5C4.5 8.05 4.95 8.5 5.5 8.5ZM4.5 1.5C4.5 2.05 4.95 2.5 5.5 2.5H17.5C18.05 2.5 18.5 2.05 18.5 1.5C18.5 0.95 18.05 0.5 17.5 0.5H5.5C4.95 0.5 4.5 0.95 4.5 1.5Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

const CourseTop = ({
  startOffset,
  endOffset,
  totalItems,
  handleTabClick,
  activeTab,
  searchQuery,
  setSearchQuery,
}: CourseTopProps) => {
  const navigate = useNavigate();

  // Debug: Log props on every render
  console.log("CourseTop Props:", { searchQuery, setSearchQuery, isSetSearchQueryFunction: typeof setSearchQuery === "function" });


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search Button Clicked:", searchQuery);
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate(`/courses`);
    }
  };

  return (
    <div className="courses-top-wrap">
      <div className="container-fluid">
        <div className="row">
          {/* Controls Section */}
          <div className="col-12">
            <div className="courses-controls-wrapper">
              <div className="row align-items-center">
                {/* Search Section */}
                <div className="col-lg-5 col-md-12 mb-3 mb-lg-0">
                  <div className="courses-search-section">
                    <form onSubmit={handleSearchSubmit} className="search-form">
                      <div className="search-input-group">
                        <input
                          type="text"
                          className="form-control search-input"
                          placeholder="ค้นหาหลักสูตร..."
                          value={searchQuery}
                          onChange={(e) => {
                            console.log("Search Input:", e.target.value);
                            if (typeof setSearchQuery === "function") {
                              setSearchQuery(e.target.value);
                            } else {
                              console.error("setSearchQuery is not a function:", setSearchQuery);
                            }
                          }}
                        />
                        <button 
                          className="btn btn-primary search-btn" 
                          type="submit"
                        >
                          <i className="fas fa-search"></i>
                          <span>ค้นหา</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Results Info */}
                <div className="col-lg-3 col-md-6 mb-3 mb-lg-0">
                  <div className="courses-results-info">
                    <p className="results-text">
                      แสดง {startOffset} - {endOffset} จาก {totalItems} ผลลัพธ์
                    </p>
                  </div>
                </div>

                {/* View Toggle Section */}
                <div className="col-lg-4 col-md-6">
                  <div className="courses-actions-section">
                    <div className="d-flex align-items-center justify-content-lg-end flex-wrap gap-3">
                      {/* View Toggle */}
                      <div className="view-toggle-section">
                        <div className="view-toggle-buttons">
                          {tab_title.map((tab, index) => (
                            <button 
                              key={index}
                              onClick={() => handleTabClick(index)} 
                              className={`view-toggle-btn ${activeTab === index ? "active" : ""}`}
                              type="button"
                            >
                              {tab.icon}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseTop;