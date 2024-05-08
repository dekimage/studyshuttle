"use client";
import { Input } from "@/components/ui/input";
import { CtaDialog, ProffesorCard, RocketCta } from "../page";
import { proffesorsData } from "@/src/data";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const filtersData = [
  { title: "основно образование", color: "chili", filter: "основно" },
  { title: "средно образование", color: "sky", filter: "средно" },
  { title: "универзитет", color: "sun", filter: "универзитет" },
];

const SearchPingIcon = ({ searchText, setSearchText }) => {
  const [isSelected, setIsSelected] = useState(false);
  const inputRef = useRef(null); // Create a ref to the input element

  const handleClick = () => {
    setIsSelected(true);
    setTimeout(() => {
      inputRef.current.focus();
    }, 50); // Adjust the timeout as needed
  };

  return (
    <div className="relative my-16 w-full border-t">
      {/* Ping Effect */}
      {/* {!isSelected && (
        <div className="absolute left-[44%] top-[-26px] h-[50px] w-[50px]  animate-ping rounded-full bg-blue-500 opacity-50"></div>
      )} */}

      {/* Center Icon */}
      {isSelected ? (
        <Input
          ref={inputRef}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search"
          className="absolute left-[5%] top-[-20px] max-w-[300px] lg:left-[20%] lg:max-w-[600px]"
        />
      ) : (
        <div
          className="absolute left-[50%] top-[-30px] flex h-[60px] w-[60px] -translate-x-1/2 cursor-pointer items-center justify-center rounded-full border bg-white text-center"
          onClick={handleClick}
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute left-[16] top-[-16px] h-[50px] w-[50px]  animate-ping rounded-full bg-blue-500 opacity-50"></div>
            <Search />
          </div>
        </div>
      )}
    </div>
  );
};
const FilterBtn = ({ data, isSelected, onClick }) => {
  const { title, color } = data;
  return (
    <div
      style={{
        boxShadow: isSelected
          ? "inset 2px 7px 4px -5px rgba(0, 0, 0, 0.49)"
          : "2px 7px 4px -5px rgba(0, 0, 0, 0.49)",
      }}
      className={`my-2 w-[220px] rounded-[10px] px-8  py-2 text-center text-[12px] font-bold bg-${color} cursor-pointer text-white`}
      onClick={onClick}
    >
      {title}
    </div>
  );
};

const PaginationExample = ({
  proffesorsData,
  filter,
  searchText,
  currentPage,
  setCurrentPage,
}) => {
  const filterBySearch = searchText
    ? proffesorsData.filter((p) => {
        // Convert search text to lowercase for case-insensitive comparisons
        const lowerCaseSearchText = searchText.toLowerCase();

        // Check if name matches partially
        const nameMatches = p.name?.toLowerCase().includes(lowerCaseSearchText);

        // Check if title matches partially
        const titleMatches = p.title
          ?.toLowerCase()
          .includes(lowerCaseSearchText);

        // Check if scope matches partially
        const scopeMatches = p.scope
          ?.toLowerCase()
          .includes(lowerCaseSearchText);

        // Check if any filter matches
        const filtersMatch = p.filters.some((filter) =>
          filter.toLowerCase().includes(lowerCaseSearchText),
        );

        // Check if any subject matches
        const subjectsMatch = p.subjects.some((subject) =>
          subject.toLowerCase().includes(lowerCaseSearchText),
        );

        // Return true if any of the criteria match
        return (
          nameMatches ||
          titleMatches ||
          scopeMatches ||
          filtersMatch ||
          subjectsMatch
        );
      })
    : proffesorsData;

  const filteredProffesors = filter
    ? filterBySearch.filter((p) => p.filters.includes(filter))
    : filterBySearch;
  const itemsPerPage = 9;

  // Calculate the total number of pages
  const totalPages = Math.ceil(filteredProffesors.length / itemsPerPage);

  // Determine the items for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPageItems = filteredProffesors.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Page navigation functions
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div>
      {/* Display professors */}
      <div className="flex items-center justify-center">
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {currentPageItems.map((proffesor, index) => (
            <ProffesorCard proffesor={proffesor} key={index} />
          ))}
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="mt-8 flex items-center justify-center gap-4">
        {/* Previous Arrow */}
        <div
          onClick={prevPage}
          className="cursor-pointer px-4 py-2"
          disabled={currentPage === 1}
        >
          <ChevronLeft />
        </div>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (page) => (
            <div
              key={page}
              onClick={() => goToPage(page)}
              className={`cursor-pointer px-4 py-2 font-semibold ${
                page === currentPage ? "text-chili" : ""
              }`}
            >
              {page}
            </div>
          ),
        )}

        {/* Next Arrow */}
        <div
          onClick={nextPage}
          className="cursor-pointer px-4 py-2"
          disabled={currentPage === totalPages}
        >
          <ChevronRight />
        </div>
      </div>
    </div>
  );
};

const ProffesorsPage = () => {
  const [filter, setFilter] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const handleFilterClick = (data) => {
    setFilter(data.filter);
    setSearchText("");
    setCurrentPage(1);
  };
  return (
    <div className="flex flex-col">
      <SearchPingIcon searchText={searchText} setSearchText={setSearchText} />
      <div className="mb-8 flex flex-col items-center justify-center gap-4 lg:mb-0 lg:flex-row lg:gap-8">
        {filtersData.map((data, index) => (
          <FilterBtn
            data={data}
            onClick={() => handleFilterClick(data)}
            isSelected={filter == data.filter}
            key={index}
          />
        ))}
      </div>

      <div className="my-24 mt-16 hidden text-center text-[55px] font-semibold lg:block">
        Запознајте се со нашите професори!
      </div>

      <PaginationExample
        filter={filter}
        searchText={searchText}
        proffesorsData={proffesorsData}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <RocketCta isProf active={6} />

      <div className="my-8 flex flex-col items-center justify-center gap-8 lg:hidden">
        <div className="text-center text-[35px] font-semibold text-chili">
          Сеуште немаш профил?
        </div>
        <CtaDialog
          cta={
            <Button className="w-fit rounded-full bg-sky text-white">
              Регистрирај се
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default ProffesorsPage;
