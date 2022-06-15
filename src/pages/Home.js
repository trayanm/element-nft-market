import React, { Component } from "react";
import { withRouter } from "../hooksHandler";
import AppContext from "../store/app-context";

class Home extends Component {
    static contextType = AppContext;

    render() {

        return (
            <React.Fragment>
            <div className="row">
              <div className="col-12">
                <div className="section-title">
                  <h2 className="wow fadeInUp" data-wow-delay=".4s">Home</h2>
                  <p className="wow fadeInUp" data-wow-delay=".6s">There are many variations of passages of Lorem
                    Ipsum available, but the majority have suffered alteration in some form.</p>
                </div>
              </div>
            </div>
            </React.Fragment>
        );
    }
}

export default withRouter(Home);
