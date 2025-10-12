import React from "react";

interface TrailerModalProps {
  show: boolean;
  onClose: () => void;
  videoUrl: string;
}

const TrailerModal: React.FC<TrailerModalProps> = ({ show, onClose, videoUrl }) => {
  if (!show) return null;

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
      }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content bg-transparent border-0">
          <div className="modal-body p-0 position-relative">
            <button
              type="button"
              className="btn-close position-absolute top-0 end-0 m-3"
              aria-label="Close"
              onClick={onClose}
              style={{ filter: "invert(1)" }}
            ></button>
            <div className="ratio ratio-16x9">
              <iframe
                src={videoUrl}
                title="Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;
