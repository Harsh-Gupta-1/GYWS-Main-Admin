import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Card from "../components/Card";
import HCard from "../../HeaderCard/HCard.jsx";
import { membersAPI } from "../utils/apiService";

export default function Rise() {
  const { year } = useParams();
  const [riseMembers, setRiseMembers] = useState({ ceo: [], heads: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRiseMembers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const groupedMembers = await membersAPI.getMembersGroupedByPosition(parseInt(year));
        
        // Extract CEO from Governing Body (Chief Executive Officer, Rise)
        const governingBodyMembers = groupedMembers["Governing Body"] || {};
        const ceoMembers = governingBodyMembers["Chief Executive Officer, Rise"] || [];
        
        // Extract Rise heads from Rise team
        const riseTeamMembers = groupedMembers["Rise"] || {};
        const riseHeadsMap = new Map();
        
        // Collect all Rise heads (excluding senior executives, only show_in_website=true)
        Object.keys(riseTeamMembers).forEach(position => {
          if (!position.toLowerCase().includes('senior executive')) {
            riseTeamMembers[position].forEach(member => {
              if (member.show_in_website === true) {
                const uniqueKey = member._id || member.email || `${member.name}-${member.currentPosition}`;
                
                if (!riseHeadsMap.has(uniqueKey)) {
                  // Construct specific position title
                  let displayPosition = member.currentPosition;
                  
                  // If position is generic "Head", make it specific for Rise
                  if (member.currentPosition.toLowerCase() === 'head') {
                    displayPosition = 'Rise Head';
                  }
                  
                  riseHeadsMap.set(uniqueKey, {
                    name: member.name,
                    position: displayPosition,
                    imageUrl: member.photo_url || "/images/profile.png",
                    facebookLink: member.social_media_links?.facebook || "#",
                    email: member.email,
                    linkedinLink: member.social_media_links?.linkedin || "#"
                  });
                }
              }
            });
          }
        });
        
        // Use Map for CEO members as well to prevent duplicates
        const ceoMembersMap = new Map();
        ceoMembers
          .filter(member => member.show_in_website === true)
          .forEach(member => {
            const uniqueKey = member._id || member.email || `${member.name}-${member.currentPosition}`;
            if (!ceoMembersMap.has(uniqueKey)) {
              ceoMembersMap.set(uniqueKey, {
                name: member.name,
                position: member.currentPosition,
                imageUrl: member.photo_url || "/images/profile.png",
                facebookLink: member.social_media_links?.facebook || "#",
                email: member.email,
                linkedinLink: member.social_media_links?.linkedin || "#"
              });
            }
          });

        setRiseMembers({
          ceo: Array.from(ceoMembersMap.values()),
          heads: Array.from(riseHeadsMap.values())
        });
      } catch (error) {
        console.error('Error fetching Rise members:', error);
        setError('Failed to load Rise members');
      } finally {
        setLoading(false);
      }
    };

    if (year) {
      fetchRiseMembers();
    }
  }, [year]);

  if (loading) {
    return <div className="loading">Loading Rise members...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <>
      {riseMembers.ceo.length > 0 && (
        <>
          <HCard head={`Rise ${year}-${(parseInt(year) + 1).toString().slice(-2)}`} />
          <div className="members_container">
            {riseMembers.ceo.map((member, index) => (
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

      {riseMembers.heads.length > 0 && (
        <>
          <HCard head={`Rise Heads ${year}-${(parseInt(year) + 1).toString().slice(-2)}`} />
          <div className="members_container">
            {riseMembers.heads.map((member, index) => (
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

      {riseMembers.ceo.length === 0 && riseMembers.heads.length === 0 && (
        <div className="no-members">
          No Rise members found for {year}-{(parseInt(year) + 1).toString().slice(-2)}
        </div>
      )}
    </>
  );
}
