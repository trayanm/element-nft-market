import React, { Component } from "react";
import { withRouter } from "../hooksHandler";
import AppContext from "../store/app-context";

class Home extends Component {
  static contextType = AppContext;

  componentDidMount = async () => {
    await this.context.checkStateAsync();
  };

  render() {
    return (
      <React.Fragment>
        <section className="section">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="section-title">
                  <h2 className="wow fadeInUp" data-wow-delay=".4s">Home</h2>
                  <p className="wow fadeInUp" data-wow-delay=".6s">There are many variations of passages of Lorem
                    Ipsum available, but the majority have suffered alteration in some form.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </React.Fragment>
    );
  }
}

export default withRouter(Home);
