import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Card from "../components/Card";
import HCard from "../../HeaderCard/HCard.jsx";
import { membersAPI } from "../utils/apiService";
import "../styles/GBTable.css";

export default function GoverningBody() {
  const { year } = useParams();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGoverningBodyMembers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const groupedMembers = await membersAPI.getMembersGroupedByPosition(parseInt(year));
        
        // Extract Governing Body members
        const gbMembers = groupedMembers["Governing Body"] || {};
        
        // Define position order based on GB.js from Members2025-26
        const positionOrder = [
          'President',
          'Vice President',
          'General Secretary',
          'Assistant Secretary',
          'Human Resource Manager',
          'Chief Executive Officer, LiGHT',
          'Chief Technical Officer',
          'Treasurer',
          'School Development Officer',
          'Chief Fundraising Officer',
          'Foreign and Corporate Relations Officer',
          'Donor Engagement Officer',
          'Public Relations Officer',
          'Hostel Committee Officer',
          'Chief Executive Officer, Rise'
        ];
        
        // Create a map to group members by name and combine their positions
        const memberMap = new Map();
        
        // Helper function to add member to map
        const addMemberToMap = (member, position) => {
          if (member.show_in_website === true) {
            const memberKey = member.name;
            
            if (memberMap.has(memberKey)) {
              // Member already exists, add position to existing entry
              const existingMember = memberMap.get(memberKey);
              existingMember.positions.push(position);
            } else {
              // New member, create entry
              memberMap.set(memberKey, {
                name: member.name,
                positions: [position],
                imageUrl: member.photo_url || "/images/profile.png",
                facebookLink: member.social_media_links?.facebook || "#",
                email: member.email,
                linkedinLink: member.social_media_links?.linkedin || "#"
              });
            }
          }
        };
        
        // First, add members in the defined order
        positionOrder.forEach(position => {
          if (gbMembers[position]) {
            gbMembers[position].forEach(member => {
              addMemberToMap(member, position);
            });
          }
        });
        
        // Then, add any remaining positions not in the defined order
        Object.keys(gbMembers).forEach(position => {
          if (!positionOrder.includes(position)) {
            gbMembers[position].forEach(member => {
              addMemberToMap(member, position);
            });
          }
        });
        
        // Convert map to array and format positions
        const allGBMembers = Array.from(memberMap.values()).map(member => ({
          ...member,
          position: member.positions.join(' and ')
        }));
        
        setMembers(allGBMembers);
      } catch (error) {
        console.error('Error fetching governing body members:', error);
        setError('Failed to load governing body members');
      } finally {
        setLoading(false);
      }
    };

    if (year) {
      fetchGoverningBodyMembers();
    }
  }, [year]);

  if (loading) {
    return <div className="loading">Loading governing body members...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  // Check if we should use table format for years 2019-20 and 2020-21
  const shouldUseTableFormat = year === "2019" || year === "2020";

  return (
    <>
      <HCard head={`Governing Body Members ${year}-${(parseInt(year) + 1).toString().slice(-2)}`} />
      
      {shouldUseTableFormat ? (
        // Table format for 2019-20 and 2020-21
        <div className="table-container">
          {members.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Position</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{member.name}</td>
                    <td>{member.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-members">No governing body members found for {year}-{(parseInt(year) + 1).toString().slice(-2)}</div>
          )}
        </div>
      ) : (
        // Card format for other years
        <div className="members_container">
          {members.length > 0 ? (
            members.map((member, index) => (
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
            ))
          ) : (
            <div className="no-members">No governing body members found for {year}-{(parseInt(year) + 1).toString().slice(-2)}</div>
          )}
        </div>
      )}
    </>
  );
}
