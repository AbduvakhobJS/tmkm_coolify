import React from 'react';
import { useNavigate } from 'react-router-dom';
import HrAnalitikaDetail from "../Parts/HrAnalitika/HrAnalitikaDetail";
import Esg from "../Parts/ESG/ESG";
import Finance from "../Parts/Finance/Finance";
import Investing from "../Parts/Investing/Investing";
import SingleTreasury from "../Parts/SingleTreasury/SingleTreasury";

const Parts = () => {
    const navigate = useNavigate();

    return (
        <div className=" d-flex  align-items-center justify-content-center flex-wrap" style={{height: "100vh", flexDirection: "column"}}>
            <div className="row  d-flex" >
                <div className="col-md-2">
                    <button
                        className="btn btn-primary part-btn"
                        onClick={() => navigate('/main/full')}
                    >
                        Full screen
                    </button>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/1')}
                    >
                        1/6
                    </button>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/2')}
                    >
                        2/6
                    </button>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/3')}
                    >
                        3/6
                    </button>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/4')}
                    >
                        4/6
                    </button>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/6')}
                    >
                        5.1/6
                    </button>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/7')}
                    >
                        5.2/6
                    </button>
                </div>

                <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/5')}
                    >
                        5/6
                    </button>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/9')}
                    >
                       Rasxod Resurs
                    </button>
                </div>
            </div>
            <div className="row  d-flex " style={{marginTop: "10px"}} >


                {/*<div className="col-md-2">*/}
                {/*    <button className="btn btn-primary part-btn"*/}
                {/*            onClick={() => navigate('/main/8')}*/}
                {/*    >*/}
                {/*        Stats*/}
                {/*    </button>*/}
                {/*</div>*/}

                <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/hse-big')}
                    >
                        HSE-SLA
                    </button>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/hse')}
                    >
                        HSE
                    </button>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/marketing')}
                    >
                        Marketing
                    </button>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/marketing-detail')}
                    >
                        Marketing Detail
                    </button>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/pr-media')}
                    >
                        Pr Mdeia
                    </button>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/pr-media-detail')}
                    >
                        PR Media Detail
                    </button>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/hr-bi-main')}
                    >
                        HR BI MAIN
                    </button>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/new-hr-detail')}
                    >
                        HR NEW
                    </button>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/hr-bi-detail')}
                    >
                        HR BI DETAIL
                    </button>
                </div>


            </div>
            <div className="row  d-flex " style={{marginTop: "10px"}} >

            <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/contact-hub')}
                    >
                        Contact hub
                    </button>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/contact-hub-detail')}
                    >
                        Contact hub detail
                    </button>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/esg')}
                    >
                        ESG
                    </button>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/esg-detail')}
                    >
                        ESG detail
                    </button>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/finance')}
                    >
                        Finance
                    </button>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/finance-new')}
                    >
                        Finance 2 new
                    </button>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/investing')}
                    >
                        Investing
                    </button>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/single-treasury')}
                    >
                        Single Treasury
                    </button>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-primary part-btn"
                            onClick={() => navigate('/main/constructor')}
                    >
                       Constructor
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Parts;