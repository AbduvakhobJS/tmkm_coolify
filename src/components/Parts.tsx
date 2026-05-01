import React from 'react';
import { useNavigate } from 'react-router-dom';

const Parts = () => {
    const navigate = useNavigate();

    return (
        <div className="d-flex align-items-center justify-content-center h-100" style={{display: "flex", alignItems: "center", justifyContent: "center", height: "100vh"}}>
            <button 
                className="btn btn-primary part-btn" 
                onClick={() => navigate('/full')}
            >
                Full screen
            </button>
            <button className="btn btn-primary part-btn"
                    onClick={() => navigate('/1')}
            >
                1/6
            </button>
            <button className="btn btn-primary part-btn"
                    onClick={() => navigate('/2')}
            >
                2/6
            </button>
            <button className="btn btn-primary part-btn"
                    onClick={() => navigate('/3')}
            >
                3/6
            </button>
            <button className="btn btn-primary part-btn"
                    onClick={() => navigate('/4')}
            >
                4/6
            </button>
            <button className="btn btn-primary part-btn"
                    onClick={() => navigate('/5')}
            >
                5/6
            </button>
            <button className="btn btn-primary part-btn"
                    onClick={() => navigate('/6')}
            >
                5.1/6
            </button>
        </div>
    );
};

export default Parts;