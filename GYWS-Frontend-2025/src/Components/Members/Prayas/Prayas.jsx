import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Card from "../components/Card";
import HCard from "../../HeaderCard/HCard.jsx";
import { membersAPI } from "../utils/apiService";

export default function Prayas() {
  const { year } = useParams();
  const [prayasMembers, setPrayasMembers] = useState({ topMembers: [], otherMembers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrayasMembers = async () => {
      try {
        setLoading(true);
        setError(null);
    
        const groupedMembers = await membersAPI.getMembersGroupedByPosition(parseInt(year));
        
        // Extract specific positions from Governing Body
        const governingBodyMembers = groupedMembers["Governing Body"] || {};
        const ceoMembers = governingBodyMembers["Chief Executive Officer, PRAYAS"] || [];
        const chiefAdvisoryMembers = governingBodyMembers["Chief Advisory, Prayas"] || [];
        
        // Extract Prayas team members
        const prayasTeamMembers = groupedMembers["Prayas"] || {};
        
        // Use Maps to ensure each member appears only once, even if they have multiple positions
        const topMembersMap = new Map();
        const otherMembersMap = new Map();
        
        // Helper function to add members to top members
        const addMembersToTop = (members) => {
          members
            .filter(member => member.show_in_website === true)
            .forEach(member => {
              const uniqueKey = member._id || member.email || `${member.name}-${member.currentPosition}`;
              if (!topMembersMap.has(uniqueKey)) {
                topMembersMap.set(uniqueKey, {
                  name: member.name,
                  position: member.currentPosition,
                  imageUrl: member.photo_url || "/images/profile.png",
                  facebookLink: member.social_media_links?.facebook || "#",
                  email: member.email,
                  linkedinLink: member.social_media_links?.linkedin || "#"
                });
              }
            });
        };
        
        // Add Governing Body positions to top members
        addMembersToTop(ceoMembers);
        addMembersToTop(chiefAdvisoryMembers);
        
        // Process Prayas team members
        Object.keys(prayasTeamMembers).forEach(position => {
          prayasTeamMembers[position].forEach(member => {
            if (member.show_in_website === true) {
              const uniqueKey = member._id || member.email || `${member.name}-${member.currentPosition}`;
              
              // Construct specific position title
              let displayPosition = member.currentPosition;
              
              // If position is generic "Head", make it specific for Prayas
              if (member.currentPosition.toLowerCase() === 'head') {
                displayPosition = 'Prayas Head';
              }
              
              const memberData = {
                name: member.name,
                position: displayPosition,
                imageUrl: member.photo_url || "/images/profile.png",
                facebookLink: member.social_media_links?.facebook || "#",
                email: member.email,
                linkedinLink: member.social_media_links?.linkedin || "#"
              };
              
              // Add all members except senior executives to other members
              if (!position.toLowerCase().includes('senior executive member')) {
                if (!otherMembersMap.has(uniqueKey)) {
                  otherMembersMap.set(uniqueKey, memberData);
                }
              }
            }
          });
        });
        
        setPrayasMembers({
          topMembers: Array.from(topMembersMap.values()),
          otherMembers: Array.from(otherMembersMap.values())
        });
      } catch (error) {
        console.error('Error fetching Prayas members:', error);
        setError('Failed to load Prayas members');
      } finally {
        setLoading(false);
      }
    };

    if (year) {
      fetchPrayasMembers();
    }
  }, [year]);

  if (loading) {
    return <div className="loading">Loading Prayas members...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <>
      {prayasMembers.topMembers.length > 0 && (
        <>
          <HCard head={`Prayas ${year}-${(parseInt(year) + 1).toString().slice(-2)}`} />
          <div className="members_container">
            {prayasMembers.topMembers.map((member, index) => (
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
        </>
      )}

      {prayasMembers.otherMembers.length > 0 && (
        <>
          <HCard head="Prayas Heads" />
          <div className="members_container">
            {prayasMembers.otherMembers.map((member, index) => (
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
        </>
      )}

      {prayasMembers.topMembers.length === 0 && prayasMembers.otherMembers.length === 0 && (
        <div className="no-members">
          No Prayas members found for {year}-{(parseInt(year) + 1).toString().slice(-2)}
        </div>
      )}
    </>
  );
}
