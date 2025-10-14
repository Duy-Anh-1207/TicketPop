import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="position-relative w-100" style={{ maxWidth: "300px" }}>
      <input
        type="text"
        className="form-control rounded-pill ps-4 pe-5 py-2"
        placeholder="Tìm phim, rạp"
      />
      <Search
        size={18}
        className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary"
        style={{ cursor: "pointer" }}
      />
    </div>
  );
}
