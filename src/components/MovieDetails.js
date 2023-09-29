import React from 'react';

const MovieDetails = ({ movie, onClose }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <h2>{movie.title}</h2>
        <p>Release Date: {movie.release_date}</p>
        <p>{movie.overview}</p>
      </div>
    </div>
  );
};

export default MovieDetails;
