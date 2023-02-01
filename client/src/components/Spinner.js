const Spinner = () => {
  return (
    // <div className="text-center mt-5">
    //   <div className="spinner-border text-info text-center"></div>
    // </div>
    <div className="preloader">
      <div className="preloader-inner">
        <div className="preloader-icon">
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default Spinner;