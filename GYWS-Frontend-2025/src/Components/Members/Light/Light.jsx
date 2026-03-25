import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Card from "../components/Card";
import HCard from "../../HeaderCard/HCard.jsx";
import { membersAPI } from "../utils/apiService";

export default function Light() {
  const { year } = useParams();
  const [lightMembers, setLightMembers] = useState({ topMembers: [], otherMembers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLightMembers = async () => {
      try {
        setLoading(true);
        setError(null);
    
        const groupedMembers = await membersAPI.getMembersGroupedByPosition(parseInt(year));
        
        // Extract specific positions from Governing Body
        const governingBodyMembers = groupedMembers["Governing Body"] || {};
        const ceoMembers = governingBodyMembers["Chief Executive Officer, LiGHT"] || [];
        const prOfficerMembers = governingBodyMembers["Public Relations Officer, LiGHT"] || [];
        const socialStrategyMembers = governingBodyMembers["Social Strategy Development Officer, LiGHT"] || [];
        const networkMgmtMembers = governingBodyMembers["Network Management Officer, LiGHT"] || [];
        
        // Extract LiGHT team members
        const lightTeamMembers = groupedMembers["LiGHT"] || {};
        const topMembers = [];
        const otherMembers = [];
        
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
        
        // Add all specified Governing Body positions to top members
        addMembersToTop(ceoMembers);
        addMembersToTop(prOfficerMembers);
        addMembersToTop(socialStrategyMembers);
        addMembersToTop(networkMgmtMembers);
        
        // Process LiGHT team members
        Object.keys(lightTeamMembers).forEach(position => {
          lightTeamMembers[position].forEach(member => {
            if (member.show_in_website === true) {
              const uniqueKey = member._id || member.email || `${member.name}-${member.currentPosition}`;
              
              // Construct specific position title
              let displayPosition = member.currentPosition;
              
              // If position is generic "Head", make it specific for LiGHT
              if (member.currentPosition.toLowerCase() === 'head') {
                displayPosition = 'LiGHT Head';
              }
              
              const memberData = {
                name: member.name,
                position: displayPosition,
                imageUrl: member.photo_url || "/images/profile.png",
                facebookLink: member.social_media_links?.facebook || "#",
                email: member.email,
                linkedinLink: member.social_media_links?.linkedin || "#"
              };
              
              // Check if this is LiGHT Coordinator - add to top members
              if (position.toLowerCase().includes('coordinator') || 
                  member.currentPosition.toLowerCase().includes('coordinator')) {
                if (!topMembersMap.has(uniqueKey)) {
                  topMembersMap.set(uniqueKey, memberData);
                }
              }
              // Add all other members except senior executives to other members
              else if (!position.toLowerCase().includes('senior executive')) {
                if (!otherMembersMap.has(uniqueKey)) {
                  otherMembersMap.set(uniqueKey, memberData);
                }
              }
            }
          });
        });
        
        setLightMembers({
          topMembers: Array.from(topMembersMap.values()),
          otherMembers: Array.from(otherMembersMap.values())
        });
      } catch (error) {
        console.error('Error fetching LiGHT members:', error);
        setError('Failed to load LiGHT members');
      } finally {
        setLoading(false);
      }
    };

    if (year) {
      fetchLightMembers();
    }
  }, [year]);

  if (loading) {
    return <div className="loading">Loading LiGHT members...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <>
      {lightMembers.topMembers.length > 0 && (
        <>
          <HCard head={`LiGHT ${year}-${(parseInt(year) + 1).toString().slice(-2)}`} />
          <div className="members_container">
            {lightMembers.topMembers.map((member, index) => (
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

      {lightMembers.otherMembers.length > 0 && (
        <>
          <HCard head="LiGHT Heads" />
          <div className="members_container">
            {lightMembers.otherMembers.map((member, index) => (
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

      {lightMembers.topMembers.length === 0 && lightMembers.otherMembers.length === 0 && (
        <div className="no-members">
          No LiGHT members found for {year}-{(parseInt(year) + 1).toString().slice(-2)}
        </div>
      )}
    </>
  );
}
