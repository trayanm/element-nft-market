import React, { Component } from "react";

class Footer extends Component {
    render() {
        return (
            <React.Fragment>
                {/* Start Footer Area */}
                <footer className="footer">
                    {/* Start Footer Bottom */}
                    <div className="footer-bottom">
                        <div className="container">
                            <div className="inner">
                                <div className="row">
                                    <div className="col-12">
                                        <div className="content">
                                            <ul className="footer-bottom-links">
                                                <li><a href="#">Terms of use</a></li>
                                                <li><a href="#"> Privacy Policy</a></li>
                                                <li><a href="#">Advanced Search</a></li>
                                                <li><a href="#">Site Map</a></li>
                                                <li><a href="#">Information</a></li>
                                            </ul>
                                            <p className="copyright-text">
                                                © {new Date().getFullYear()} Copyright
                                            </p>
                                            <ul className="footer-social">
                                                <li><a href="#"><i className="lni lni-facebook-filled"></i></a></li>
                                                <li><a href="#"><i className="lni lni-twitter-original"></i></a></li>
                                                <li><a href="#"><i className="lni lni-youtube"></i></a></li>
                                                <li><a href="#"><i className="lni lni-linkedin-original"></i></a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* End Footer Middle */}
                </footer>
                {/*/ End Footer Area */}
            </React.Fragment>
        );
    }
}

export default Footer;
