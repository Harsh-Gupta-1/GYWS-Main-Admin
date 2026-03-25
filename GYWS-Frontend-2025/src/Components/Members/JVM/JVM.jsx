import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Card from "../components/Card";
import HCard from "../../HeaderCard/HCard.jsx";
import { membersAPI } from "../utils/apiService";
import "../Members.css";

export default function JVM() {
  const { year } = useParams();
  const [jvmMembers, setJvmMembers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define team order based on old JVM page (Members2025-26/JVM/jvm.jsx)
  const getTeamDisplayOrder = (teams) => {
    const preferredOrder = [
      'Coordinators',        // Coordie component
      'School Review Committee',                 // Src component  
      'Technical Operations', // Tech component
      'Sponsorship',         // Spons component
      'Finance',             // Finance component
      'Design',              // Design component
      'Media and Publicity'  // Media component
    ];
    
    // First show teams in preferred order, then any remaining teams
    const orderedTeams = [];
    preferredOrder.forEach(team => {
      if (teams.includes(team)) {
        orderedTeams.push(team);
      }
    });
    
    // Add any remaining teams not in preferred order
    teams.forEach(team => {
      if (!preferredOrder.includes(team)) {
        orderedTeams.push(team);
      }
    });
    
    return orderedTeams;
  };

  useEffect(() => {
    const fetchJVMMembers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const groupedMembers = await membersAPI.getMembersGroupedByPosition(parseInt(year));
        
        // Get all teams except Governing Body and Advisory Committee
        const excludedTeams = ['Governing Body', 'Advisory Committee'];
        const transformedJVMMembers = {};
        
        // Define preferred teams for JVM
        const preferredTeams = [
          'Coordinators',
          'School Review Committee',
          'Technical Operations',
          'Sponsorship',
          'Finance',
          'Design',
          'Media and Publicity'
        ];

        Object.keys(groupedMembers).forEach(teamName => {
          if (!excludedTeams.includes(teamName) && preferredTeams.includes(teamName)) {
            const teamMembers = groupedMembers[teamName] || {};
            
            // Collect all members for the current team across all positions
            const allTeamMembers = Object.values(teamMembers).flat();

            // Filter out senior executives and members not shown on the website
            const filteredTeamMembers = allTeamMembers.filter(member => 
              member.show_in_website === true &&
              !member.currentPosition.toLowerCase().includes('senior executive')
            );

            if (filteredTeamMembers.length > 0) {
              // Use a Map to ensure each member is added only once per team, based on their unique ID
              const uniqueMembersMap = new Map();
              filteredTeamMembers.forEach(member => {
                // Use member ID as unique key instead of email to avoid conflicts
                const uniqueKey = member._id || member.email || `${member.name}-${member.currentPosition}`;
                if (!uniqueMembersMap.has(uniqueKey)) {
                  // Construct specific position title
                  let displayPosition = member.currentPosition;
                  
                  // If position is generic "Head", make it specific based on team
                  if (member.currentPosition.toLowerCase() === 'head') {
                     if (teamName === 'Technical Operations') {
                      displayPosition = 'TechOps Head';
                    } else if (teamName === 'School Review Committee') {
                      displayPosition = 'SRC Head';
                    } else {
                      // For other teams, use team name + Head
                      displayPosition = `${teamName} Head`;
                    }
                  }
                  
                  uniqueMembersMap.set(uniqueKey, {
                    name: member.name,
                    position: displayPosition,
                    imageUrl: member.photo_url || "/images/profile.png",
                    facebookLink: member.social_media_links?.facebook || "#",
                    email: member.email,
                    linkedinLink: member.social_media_links?.linkedin || "#"
                  });
                }
              });

              transformedJVMMembers[teamName] = Array.from(uniqueMembersMap.values());
            }
          }
        });
        
        setJvmMembers(transformedJVMMembers);
      } catch (error) {
        console.error('Error fetching JVM members:', error);
        setError('Failed to load JVM members');
      } finally {
        setLoading(false);
      }
    };

    if (year) {
      fetchJVMMembers();
    }
  }, [year]);

  if (loading) {
    return <div className="loading">Loading JVM members...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const renderTeamSection = (teamName, members) => {
    if (!members || members.length === 0) return null;

    return (
      <div key={teamName}>
        <HCard head={`${teamName}${teamName === 'Coordinators' ? '' : ' Heads'} ${year}-${(parseInt(year) + 1).toString().slice(-2)}`} />
        <div className="members_container">
          {members.map((member, index) => (
            <Card
              key={index}
              name={member.name}
              position={member.position}
              imageUrl={member.imageUrl}
              facebookLink={member.facebookLink}
              email={member.email}
              linkedinLink={member.linkedinLink}
              data={member}
            />
          ))}
        </div>
        <br />
        <br />
      </div>
    );
  };

  // Sort teams according to the defined order
  const availableTeams = Object.keys(jvmMembers).filter(teamName => 
    jvmMembers[teamName] && jvmMembers[teamName].length > 0
  );
  const sortedTeamNames = getTeamDisplayOrder(availableTeams);

  return (
    <>
      <div className="chlna">
        <h1>JAGRITI VIDYA MANDIR</h1>
      </div>
      <br />
      <hr />
      <br />
      
      {sortedTeamNames.length > 0 ? (
        sortedTeamNames.map(teamName => 
          renderTeamSection(teamName, jvmMembers[teamName])
        )
      ) : (
        <div className="no-members">
          No JVM members found for {year}-{(parseInt(year) + 1).toString().slice(-2)}
        </div>
      )}
    </>
  );
}
