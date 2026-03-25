// API service for fetching members data
 const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api`;

export const membersAPI = {
  // Fetch all members with show_in_website: true
  async getAllMembers() {
    try {
      const response = await fetch(`${API_BASE_URL}/members`);
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }
      const result = await response.json();
      const data = result.data || [];
      return data.filter(member => 
        member.show_in_website === true && 
        !member.positions.some(pos => 
          pos.position_id && 
          pos.position_id.pos_name && 
          pos.position_id.pos_name.toLowerCase().includes('senior executive')
        )
      );
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  },

  // Fetch members by year with show_in_website: true
  async getMembersByYear(year) {
    try {
      const response = await fetch(`${API_BASE_URL}/members/year/${year}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch members for year ${year}`);
      }
      const result = await response.json();
      const data = result.data?.allMembers || [];
      return data.filter(member => member.show_in_website === true);
    } catch (error) {
      console.error(`Error fetching members for year ${year}:`, error);
      throw error;
    }
  },

  // Fetch members by year and team with show_in_website: true
  async getMembersByYearAndTeam(year, team) {
    try {
      const response = await fetch(`${API_BASE_URL}/members?year=${year}&team=${team}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch members for year ${year} and team ${team}`);
      }
      const result = await response.json();
      const data = result.data || [];
      return data.filter(member => 
        member.show_in_website === true && 
        !member.positions.some(pos => 
          pos.position_id && 
          pos.position_id.pos_name && 
          pos.position_id.pos_name.toLowerCase().includes('senior executive')
        )
      );
    } catch (error) {
      console.error(`Error fetching members for year ${year} and team ${team}:`, error);
      throw error;
    }
  },

  // Fetch all positions
  async getPositions() {
    try {
      const response = await fetch(`${API_BASE_URL}/positions`);
      if (!response.ok) {
        throw new Error('Failed to fetch positions');
      }
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw error;
    }
  },

  // Get unique years from members data
  async getAvailableYears() {
    try {
      console.log('Getting available years...');
      const response = await fetch(`${API_BASE_URL}/members`);
      if (!response.ok) {
        throw new Error('Failed to fetch members for years');
      }
      const result = await response.json();
      console.log('Raw API response for years:', result);
      
      const members = result.data || [];
      console.log('Members array length:', members.length);
      
      if (members.length === 0) {
        console.log('No members found in database');
        return [];
      }
      
      const years = new Set();
      
      members.forEach((member, index) => {
        console.log(`Member ${index}:`, member.name, 'show_in_website:', member.show_in_website);
        if (member.show_in_website && member.positions) {
          member.positions.forEach(position => {
            if (position.year) {
              years.add(position.year);
              console.log('Added year:', position.year);
            }
          });
        }
      });
      
      const yearArray = Array.from(years).sort((a, b) => b - a);
      console.log('Available years:', yearArray);
      return yearArray;
    } catch (error) {
      console.error('Error getting available years:', error);
      throw error;
    }
  },

  // Get members grouped by position for a specific year
  async getMembersGroupedByPosition(year) {
    try {
      const response = await fetch(`${API_BASE_URL}/members/year/${year}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch members for year ${year}`);
      }
      const result = await response.json();
      
      // Use the membersByTeam data from backend which is already grouped
      const membersByTeam = result.data?.membersByTeam || {};
      const grouped = {};
      
      // Transform backend structure to match frontend expectations
      Object.keys(membersByTeam).forEach(team => {
        grouped[team] = {};
        
        membersByTeam[team].forEach(member => {
          member.positions.forEach(position => {
            if (position.year === year && position.position_id) {
              const posName = position.position_id.pos_name;
              if (!grouped[team][posName]) {
                grouped[team][posName] = [];
              }
              grouped[team][posName].push({
                ...member,
                currentPosition: posName
              });
            }
          });
        });
      });
      
      return grouped;
    } catch (error) {
      console.error(`Error grouping members by position for year ${year}:`, error);
      throw error;
    }
  }
};
