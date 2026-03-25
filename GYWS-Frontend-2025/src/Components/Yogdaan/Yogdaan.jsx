import React, { useState, useEffect } from "react";

const Yogdaan = () => {
  // Total amount targeted
  const [raisedAmount, setRaisedAmount] = useState(0);

 


  const FetchAmmount = () => {
    fetch('https://raw.githubusercontent.com/jatinsm2023/yogdaan.txt/main/TXT.txt')
    .then(response => response.text())
    .then(data => setRaisedAmount(data))
    .catch(error => console.error('Error fetching the file:', error));
  }

  useEffect(() => {
    FetchAmmount();
  }, []); // Runs once on component mount



  const totalAmount = 1000000; // 10,00,000
  
  // Current raised amount (can be fetched from an API or updated otherwise)
  
  // Calculate the percentage of the progress bar
  const progressPercentage = Math.min(
    (raisedAmount / totalAmount) * 100,
    100 // Cap at 100% if it exceeds totalAmount
  );
  
  // State to store days left
  const [daysLeft, setDaysLeft] = useState(0);

  // Calculate and update days left automatically
  useEffect(() => {
    // Set your end date (January 23, 2025). 
    // For year, 2025 => second parameter is month index (0 = January).
    const endDate = new Date(2025, 0, 23); 
    const today = new Date();

    // Calculate time difference in milliseconds
    const timeDifference = endDate.getTime() - today.getTime();
    // Convert to days, round up, and ensure we never show negative days
    const calculatedDaysLeft = Math.max(0, Math.ceil(timeDifference / (1000 * 60 * 60 * 24)));

    setDaysLeft(calculatedDaysLeft);
  }, []); // Runs once on component mount

  return (
    <div className="flex justify-center items-center">
      <div className="max-w-6xl p-6">
        {/* Header Section */}
        <div className="flex items-center space-x-4 mb-6">
          <img
            src="/images/logo.png"
            alt="Gopali Youth Welfare Society"
            className="h-36 w-36 rounded-full"
          />
          <h1 className="text-2xl font-bold text-blue-700">
            Gopali Youth Welfare Society
          </h1>
        </div>

        {/* Campaign Info Section */}
        <h2 className="text-xl font-semibold text-blue-700 mb-4">Yogdaan 2025</h2>
        <div className="mb-6 flex flex-col lg:flex-row w-full gap-10">
          <img
            src="/images/Yogdaan1.png"
            alt="Campaign Visual"
            className="w-full lg:w-1/2 h-full object-cover rounded-lg"
          />
          <img
            src="/images/Yogdaan2.png"
            alt="Campaign Visual"
            className="w-full lg:w-1/2 hidden lg:block h-full object-cover rounded-lg"
          />
        </div>

        {/* Progress and Days Left */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="my-1">
            <h3 className="text-base font-bold text-gray-600">
              ₹{raisedAmount.toLocaleString("en-IN")} raised of ₹{totalAmount.toLocaleString("en-IN")}
            </h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="h-2.5 rounded-full bg-green-500 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="text-right my-1">
            <p className="text-base font-semibold text-gray-600">
              {daysLeft} days left
            </p>
            <p className="text-sm text-gray-500">
              Campaign ends on 23rd Jan (page will be updated soon)
            </p>
          </div>
        </div>

        {/* Donations Info */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <p className="text-base font-semibold text-gray-600">Total Donations</p>
            <p className="text-lg font-bold">₹{raisedAmount.toLocaleString("en-IN")}</p>
          </div>
        </div>

        {/* Donation QRs */}
        <div className="mb-6 flex flex-col sm:flex-row w-full gap-10">
          <div>
            <h1 className="text-lg font-bold my-2">One Time Payment</h1>
            <img
              src="/images/sqr.jpg"
              alt="Campaign Visual"
              className="w-96 h-96 object-cover rounded-lg"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold my-2">Recurring Payment</h1>
            <img
              src="/images/rqr.jpg"
              alt="Campaign Visual"
              className="w-96 h-96 object-cover rounded-lg"
            />
          </div>
        </div>

        {/* Campaign Description */}
        <div className="text-gray-700">
          <p className="mb-4">
            Yogdaan donation drive is an annual donation drive organized each
            year by <strong>Gopali Youth Welfare Society</strong> (student-run
            NGO, IIT Kharagpur) in the IIT Kharagpur campus from 13th January to
            24th January.
          </p>
          <p className="mb-4">
            Every year, the collected funds are utilized for a noble cause that
            helps us improve the lives of the underprivileged in the Gopali
            village. The purpose of Yogdaan 2025 is Hostel Sustenance and
            Expansion.
          </p>
          <p className="mb-4">
            <strong>Gopali Youth Welfare Society (GYWS)</strong> aims to develop
            an ecosystem for the youth to provide them with skills, resources,
            and motivation to achieve sustainable development goals. Under our
            flagship initiative, Jagriti Vidya Mandir, we run an English medium
            school free of cost for children up to class 5. Currently, 240+
            students are studying at our school, and 70+ students are residing
            at our hostel, where we are providing them with the best environment
            for their holistic development.
          </p>
          <p>
            Your contribution would help us go a long way in sustaining and
            expanding our hostel facilities to provide the best care for our
            students. We wholeheartedly look forward to your active
            participation in this drive.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Yogdaan;
