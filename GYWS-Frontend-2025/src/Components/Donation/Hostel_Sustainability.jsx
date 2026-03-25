import React, { useEffect }  from 'react';


function HostelSustainability() {
  document.title = "Donate Now | GYWS";
  useEffect(() => {

    // Load the first script
    const script1 = document.createElement("script");
    script1.src = "https://danamojo.org/dm/js/widget.js";
    script1.type = "text/javascript";
    document.body.appendChild(script1);

    // Set a timeout to check and modify the content container
    setTimeout(() => {
      const ngoContentContainer = document.getElementById(
        "ngoContentContainer"
      );
      if (ngoContentContainer && ngoContentContainer.innerHTML.length < 40) {
        ngoContentContainer.innerHTML =
          "<center> <p style='color:#a94442;'>we are sorry that our systems are down. we will be up shortly. apologies for the inconvenience.</p></center>";
      }
    }, 20000);
  }, []);
  return (
    <>
      <div className="container-fluid" style={{minHeight: '50vh'}}>
        <div className="row xrow">
          <div className="col-md-12" style={{ padding: '10px', fontSize: '17px' }}>
            <div id="dmScriptContainer" style={{ display: 'none' }}>
              <a href="/">Donate Now</a>
            </div>
            <div id="ngoContentContainer" ingoid="640" odisplay="product" oLayout="LIST"
              iproductid="6672,6673" icustombuttonimage="no">
              <center>
                <img alt="please wait..." src="https://danamojo.org/dm/css/images/loading.gif" />
              </center>
            </div>
          </div>
        </div>
      </div>
      <br />
    </>
  );
}

export default HostelSustainability;
