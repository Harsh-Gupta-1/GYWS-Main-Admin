import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useParams, Navigate, useLocation } from "react-router-dom";
import "./Members.css";
import logo from "./hands.png";
import { membersAPI } from "./utils/apiService";
import GoverningBody from "./Governing Body/GoverningBody";
import Advisory from "./Advisory Committee/Advisory";
import JVM from "./JVM/JVM";
import Rise from "./Rise/Rise";
import Light from "./Light/Light";
import Prayas from "./Prayas/Prayas";

function Members() {
  document.title = "Members | GYWS";
  let menuRef = useRef();
  const location = useLocation();
  const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/members`;
  // Extract year from URL path
  const getYearFromPath = () => {
    const pathParts = location.pathname.split('/');
    const yearIndex = pathParts.findIndex(part => part === 'member') + 1;
    if (yearIndex > 0 && pathParts[yearIndex] && !isNaN(pathParts[yearIndex])) {
      return parseInt(pathParts[yearIndex]);
    }
    return null;
  };
  const [availableYears, setAvailableYears] = useState([]);
  const [currentYear, setCurrentYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamAvailability, setTeamAvailability] = useState({
    JVM: false,
    RISE: false,
    LiGHT: false,
    Prayas: false
  });
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  function getWindowSize() {
    const { innerWidth, innerHeight } = window;
    return { innerWidth, innerHeight };
  }

  const [windowSize, setWindowSize] = useState(getWindowSize());
  const [isSessionOpen, setSessionOpen] = useState(false);

  useEffect(() => {
    function handleWindowResize() {
      setWindowSize(getWindowSize());
    }

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  const [isCollapsed, setCollapsed] = useState(
    windowSize.innerWidth >= 1024 ? false : true
  );

  const toggleSidebar = () => {
    setCollapsed(!isCollapsed);
  };

  useEffect(() => {
    let handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setCollapsed(true);
        setSessionOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  });

  const toggleSessionDropdown = () => {
    setSessionOpen(!isSessionOpen);
  };

  const closeSessionDropdown = () => {
    setSessionOpen(false);
  };

  // Function to check team availability for a given year
  const checkTeamAvailability = async (year) => {
    try {
      const groupedMembers = await membersAPI.getMembersGroupedByPosition(parseInt(year));
      
      const availability = {
        JVM: false,
        RISE: false,
        LiGHT: false,
        Prayas: false
      };

      // Check if each team has members
      Object.keys(groupedMembers).forEach(team => {
        if (team === 'Coordinators' && Object.keys(groupedMembers[team]).length > 0) {
          availability.JVM = true;
        }
        if (team === 'Rise' && Object.keys(groupedMembers[team]).length > 0) {
          availability.RISE = true;
        }
        if (team === 'LiGHT' && Object.keys(groupedMembers[team]).length > 0) {
          availability.LiGHT = true;
        }
        if (team === 'Prayas' && Object.keys(groupedMembers[team]).length > 0) {
          availability.Prayas = true;
        }
      });

      setTeamAvailability(availability);
    } catch (error) {
      console.error('Error checking team availability:', error);
    }
  };

  // Fetch available years on component mount
  useEffect(() => {
    const fetchYears = async () => {
      try {
        setLoading(true);
        console.log('DynamicMembers: Starting to fetch years...');
        
        // Test basic API connectivity first
        const testResponse = await fetch({API_URL});
        console.log('API test response status:', testResponse.status);
        
        if (!testResponse.ok) {
          throw new Error(`API not reachable: ${testResponse.status}`);
        }
        
        const years = await membersAPI.getAvailableYears();
        console.log('DynamicMembers: Received years:', years);
        setAvailableYears(years);
        
        if (years.length > 0) {
          // First check if there's a year in the URL
          const urlYear = getYearFromPath();
          let yearToSet = urlYear;
          
          // If URL year exists and is valid, use it; otherwise use most recent year
          if (!urlYear || !years.includes(urlYear)) {
            yearToSet = years[0]; // Most recent year as fallback
          }
          
          setCurrentYear(yearToSet);
          
          // Check team availability for the selected year
          await checkTeamAvailability(yearToSet);
        }
      } catch (error) {
        console.error('Error fetching available years:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchYears();
  }, []);

  // Update currentYear when URL changes
  useEffect(() => {
    if (availableYears.length > 0) {
      const urlYear = getYearFromPath();
      if (urlYear && availableYears.includes(urlYear) && urlYear !== currentYear) {
        setCurrentYear(urlYear);
        checkTeamAvailability(urlYear);
      }
    }
  }, [location.pathname, availableYears]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Members | GYWS";
  }, []);

  if (loading) {
    return <div className="loading">Loading members data...</div>;
  }

  return (
    <>
      <div className="wrapper">
        <div ref={menuRef}>
          <div className="hamburger" onClick={toggleSidebar}>
            <img src={logo} alt="" width={"35px"} />
          </div>
          <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
            <div className="everything">
              <h2>Members</h2>
              <ul>
                <li
                  className="dropdown"
                  onMouseLeave={closeSessionDropdown}
                >
                  <div className="jack" onClick={toggleSessionDropdown}>
                    <span>Session {currentYear ? `${currentYear}-${(currentYear + 1).toString().slice(-2)}` : 'Select Year'}</span>
                    <span style={{ fontSize: "10px", marginLeft: "20px" }}>
                      {isSessionOpen ? "▲" : "▼"}
                    </span>
                  </div>
                  {isSessionOpen && (
                    <ul className="dropdown-content">
                      {availableYears.map((year) => (
                        <li key={year}>
                          <Link
                            to={`/member/${year}`}
                            onClick={async () => {
                              setCurrentYear(year);
                              await checkTeamAvailability(year);
                              toggleSidebar();
                              scrollToTop();
                            }}
                          >
                            Session {year}-{(year + 1).toString().slice(-2)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>

                {currentYear && (
                  <>
                    <Link
                      to={`/member/${currentYear}`}
                      onClick={() => {
                        toggleSidebar();
                        scrollToTop();
                      }}
                    >
                      <li>Governing Body {currentYear}-{(currentYear + 1).toString().slice(-2)}</li>
                    </Link>
                    <Link
                      to={`/member/${currentYear}/advisory`}
                      onClick={() => {
                        toggleSidebar();
                        scrollToTop();
                      }}
                    >
                      <li>Advisory Committee</li>
                    </Link>
                  </>
                )}

                {/* Only show Initiatives heading if at least one initiative is available */}
                {currentYear && (teamAvailability.JVM || teamAvailability.RISE || teamAvailability.LiGHT || teamAvailability.Prayas) && (
                  <>
                    <h2>Initiatives</h2>
                    <ul>
                      {teamAvailability.JVM && (
                        <Link
                          to={`/member/${currentYear}/jvm`}
                          onClick={() => {
                            toggleSidebar();
                            scrollToTop();
                          }}
                        >
                          <li>
                            Jagriti Vidya Mandir <br />
                            Education Initiative
                          </li>
                        </Link>
                      )}
                      {teamAvailability.RISE && (
                        <Link
                          to={`/member/${currentYear}/rise`}
                          onClick={() => {
                            toggleSidebar();
                            scrollToTop();
                          }}
                        >
                          <li>
                            RISE <br />
                            Reform and Innovate School Education
                          </li>
                        </Link>
                      )}
                      {teamAvailability.LiGHT && (
                        <Link
                          to={`/member/${currentYear}/light`}
                          onClick={() => {
                            toggleSidebar();
                            scrollToTop();
                          }}
                        >
                          <li>
                            LiGHT <br />
                            Expansion Initiative
                          </li>
                        </Link>
                      )}
                      {teamAvailability.Prayas && (
                        <Link
                          to={`/member/${currentYear}/prayas`}
                          onClick={() => {
                            toggleSidebar();
                            scrollToTop();
                          }}
                        >
                          <li>
                            Prayas <br />
                            Business Development Initiative
                          </li>
                        </Link>
                      )}
                    </ul>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
        <div className="main_content">
          <Routes>
            <Route path="/" element={
              availableYears.length > 0 ? 
                <Navigate to={`/member/${availableYears[0]}`} replace /> : 
                <div className="loading">Loading...</div>
            } />
            <Route path="/:year" element={<GoverningBody />} />
            <Route path="/:year/advisory" element={<Advisory />} />
            <Route path="/:year/jvm" element={<JVM />} />
            <Route path="/:year/rise" element={<Rise />} />
            <Route path="/:year/light" element={<Light />} />
            <Route path="/:year/prayas" element={<Prayas />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default Members;
