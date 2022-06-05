import React, { Component } from "react";

class Footer extends Component {
    render() {
        return (
            <React.Fragment>
                <footer className="bg-dark text-center text-white">
                    <div className="container p-4">
                        <section className="mb-4">
                            <a className="btn btn-outline-light btn-floating m-1" href="#!" role="button" ><i className="fab fa-facebook-f"></i></a>

                            <a className="btn btn-outline-light btn-floating m-1" href="#!" role="button"><i className="fab fa-twitter"></i></a>

                            <a className="btn btn-outline-light btn-floating m-1" href="#!" role="button"><i className="fab fa-google"></i></a>

                            <a className="btn btn-outline-light btn-floating m-1" href="#!" role="button"><i className="fab fa-instagram"></i></a>

                            <a className="btn btn-outline-light btn-floating m-1" href="#!" role="button"><i className="fab fa-linkedin-in"></i></a>

                            <a className="btn btn-outline-light btn-floating m-1" href="#!" role="button"><i className="fab fa-github"></i></a>
                        </section>

                    </div>

                    <div className="text-center p-3" >
                        © {new Date().getFullYear()} Copyright
                    </div>
                </footer>
            </React.Fragment>
        );
    }
}

export default Footer;
