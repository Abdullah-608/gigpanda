import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Focus the search input when it becomes visible
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    // Handle clicking outside to close search
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleSearch = () => {
    setShowSearch(prev => !prev);
    if (!showSearch) {
      // Reset search query when opening
      setSearchQuery("");
    }
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
    }
  };

  return (
    <div className="relative flex items-center" ref={searchContainerRef}>
      {/* Expandable search input - now positioned to the left of the icon */}
      {showSearch ? (
        <form 
          onSubmit={handleSearchSubmit} 
          className="flex items-center bg-white rounded-lg overflow-hidden transition-all duration-200 ease-in-out"
        >
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search..."
            className="w-40 pl-3 py-2 text-sm text-gray-700 focus:outline-none border-b-2 border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit" 
            className="p-2 text-gray-600 hover:text-gray-900"
            aria-label="Submit search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="p-1 ml-1 text-gray-400 hover:text-gray-600"
            onClick={toggleSearch}
            aria-label="Close search"
          >
            &times;
          </button>
        </form>
      ) : (
        /* Search icon button */
        <button 
          type="button" 
          className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none rounded-full hover:bg-gray-100 transition-colors"
          onClick={toggleSearch}
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>
      )}
      
      {/* Search suggestions dropdown */}
      {showSearch && searchQuery.length > 0 && (
        <div className="absolute left-0 top-full mt-1 w-48 bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 py-2 text-sm z-10">
          <p className="px-4 py-1 text-gray-500">Press Enter to search</p>
        </div>
      )}
    </div>
  );
};

export default SearchBar; 