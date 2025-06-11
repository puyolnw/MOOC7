import { ChangeEvent, useState, Dispatch, SetStateAction } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectCourses } from "../../../redux/features/courseSlice";
import { Course } from "./CourseS";

interface CourseTopProps {
  startOffset: number;
  endOffset: number;
  totalItems: number;
  setCourses: (courses: Course[]) => void;
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
  setCourses,
  handleTabClick,
  activeTab,
  searchQuery,
  setSearchQuery,
}: CourseTopProps) => {
  const allCourses = useSelector(selectCourses);
  const [selected, setSelected] = useState("");
  const navigate = useNavigate();

  // Debug: Log props on every render
  console.log("CourseTop Props:", { searchQuery, setSearchQuery, isSetSearchQueryFunction: typeof setSearchQuery === "function" });

  const selectHandler = (event: ChangeEvent<HTMLSelectElement>) => {
    const select = event.target.value;
    setSelected(select);

    let sortedCourses = [...allCourses];

    switch (select) {
      case "popular":
        sortedCourses = sortedCourses
          .filter((item) => item.popular)
          .sort((a, b) => {
            const aPopular = parseFloat(a.popular || "0");
            const bPopular = parseFloat(b.popular || "0");
            return bPopular - aPopular;
          });
        break;
      default:
        sortedCourses = allCourses;
        break;
    }
    setCourses(sortedCourses);
  };

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
      <div className="row align-items-center">
        <div className="col-md-5">
          <div className="courses-top-left">
            <p>แสดง {startOffset} - {endOffset} จาก {totalItems} ผลลัพธ์</p>
          </div>
        </div>
        <div className="col-md-7">
          <div className="d-flex justify-content-center justify-content-md-end align-items-center flex-wrap gap-3">
            <div className="courses__search mr-15">
              <form onSubmit={handleSearchSubmit}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
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
                  <button className="btn btn-primary" type="submit">
                    <i className="fas fa-search"></i> ค้นหา
                  </button>
                </div>
              </form>
            </div>
            <div className="courses-top-right m-0 ms-md-auto">
              <span className="sort-by">เรียง:</span>
              <div className="courses-top-right-select">
                <select onChange={selectHandler} value={selected} name="class" className="orderby">
                  <option value="">การเลือกทั้งหมด</option>
                  <option value="popular">เรียงลำดับตามความนิยม</option>
                </select>
              </div>
            </div>
            <ul className="nav nav-tabs courses__nav-tabs" id="myTab" role="tablist">
              {tab_title.map((tab, index) => (
                <li key={index} onClick={() => handleTabClick(index)} className="nav-item" role="presentation">
                  <button className={`nav-link ${activeTab === index ? "active" : ""}`}>{tab.icon}</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseTop;