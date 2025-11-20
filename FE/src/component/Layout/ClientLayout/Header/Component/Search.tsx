import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!keyword.trim()) return;
    navigate(`/tim-kiem?keyword=${encodeURIComponent(keyword)}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="position-relative w-100" style={{ maxWidth: "300px" }}>
      <input
        type="text"
        className="form-control rounded-pill ps-4 pe-5 py-2"
        placeholder="Tìm phim, rạp"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      <Search
        size={18}
        onClick={handleSearch}
        className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary"
        style={{ cursor: "pointer" }}
      />
    </div>
  );
}
