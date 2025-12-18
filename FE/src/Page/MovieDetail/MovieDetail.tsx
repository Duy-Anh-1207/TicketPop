import "./MovieDetail.css";
import Description from "./Component/Description/Description";
import LichChieu from "./Component/LichChieu/LichChieu";
import DanhGiaList from "./Component/Rate/DanhGiaList";

const MovieDetail = () => {
    return (
        <div className="movie-detail-page">
            <div className="movie-detail-container">
                <Description />
                <LichChieu />
                <DanhGiaList />
            </div>
        </div>
    );
};

export default MovieDetail;
