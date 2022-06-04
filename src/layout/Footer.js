import React, { Component } from "react";

class Footer extends Component {
    render() {
        return (
            <React.Fragment>
                <footer class="bg-dark text-center text-white">
                    <div class="container p-4">
                        <section class="mb-4">
                            <a class="btn btn-outline-light btn-floating m-1" href="#!" role="button" ><i class="fab fa-facebook-f"></i></a>

                            <a class="btn btn-outline-light btn-floating m-1" href="#!" role="button"><i class="fab fa-twitter"></i></a>

                            <a class="btn btn-outline-light btn-floating m-1" href="#!" role="button"><i class="fab fa-google"></i></a>

                            <a class="btn btn-outline-light btn-floating m-1" href="#!" role="button"><i class="fab fa-instagram"></i></a>

                            <a class="btn btn-outline-light btn-floating m-1" href="#!" role="button"><i class="fab fa-linkedin-in"></i></a>

                            <a class="btn btn-outline-light btn-floating m-1" href="#!" role="button"><i class="fab fa-github"></i></a>
                        </section>

                    </div>

                    <div class="text-center p-3" >
                        © {new Date().getFullYear()} Copyright
                    </div>
                </footer>
            </React.Fragment>
        );
    }
}

export default Footer;
