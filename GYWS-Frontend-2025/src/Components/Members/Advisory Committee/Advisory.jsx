import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Card from "../components/Card";
import HCard from "../../HeaderCard/HCard.jsx";
import { membersAPI } from "../utils/apiService";

export default function Advisory() {
  const { year } = useParams();
  const [advisoryMembers, setAdvisoryMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdvisoryMembers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const groupedMembers = await membersAPI.getMembersGroupedByPosition(parseInt(year));
        
        // Extract Advisory Committee members
        const advisoryCommitteeMembers = groupedMembers["Advisory Committee"] || {};
        
        // Use Map to ensure each member appears only once, even if they have multiple positions
        const advisoryMembersMap = new Map();
        
        // Process all Advisory Committee positions
        Object.keys(advisoryCommitteeMembers).forEach(position => {
          advisoryCommitteeMembers[position].forEach(member => {
            if (member.show_in_website === true) {
              const uniqueKey = member._id || member.email || `${member.name}-${member.currentPosition}`;
              
              if (!advisoryMembersMap.has(uniqueKey)) {
                advisoryMembersMap.set(uniqueKey, {
                  name: member.name,
                  position: member.currentPosition,
                  imageUrl: member.photo_url || "/images/profile.png",
                  facebookLink: member.social_media_links?.facebook || "#",
                  email: member.email,
                  linkedinLink: member.social_media_links?.linkedin || "#"
                });
              }
            }
          });
        });
        
        setAdvisoryMembers(Array.from(advisoryMembersMap.values()));
      } catch (error) {
        console.error('Error fetching Advisory Committee members:', error);
        setError('Failed to load Advisory Committee members');
      } finally {
        setLoading(false);
      }
    };

    if (year) {
      fetchAdvisoryMembers();
    }
  }, [year]);

  if (loading) {
    return <div className="loading">Loading Advisory Committee members...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <>
      {advisoryMembers.length > 0 ? (
        <>
          <HCard head={`Advisory Committee ${year}-${(parseInt(year) + 1).toString().slice(-2)}`} />
          <div className="members_container">
            {advisoryMembers.map((member, index) => (
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
      ) : (
        <div className="no-members">
          No Advisory Committee members found for {year}-{(parseInt(year) + 1).toString().slice(-2)}
        </div>
      )}
    </>
  );
}
