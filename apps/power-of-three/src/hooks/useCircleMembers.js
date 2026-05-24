import pb from '@/lib/pocketbaseClient';

export const useCircleMembers = () => {
  
  const getCircleMembers = async (circleId) => {
    try {
      const circle = await pb.collection('circles').getOne(circleId, { $autoCancel: false });
      return [
        { id: circle.member_1_id, name: circle.member_1_name, slot: 1 },
        { id: circle.member_2_id, name: circle.member_2_name, slot: 2 },
        { id: circle.member_3_id, name: circle.member_3_name, slot: 3 }
      ];
    } catch (err) {
      console.error("Failed to fetch circle members:", err);
      throw err;
    }
  };

  const isCircleFull = async (circleId) => {
    const members = await getCircleMembers(circleId);
    return members.every(m => m.id && m.name);
  };

  const isUserMember = async (circleId, userId) => {
    if (!userId) return false;
    const members = await getCircleMembers(circleId);
    return members.some(m => m.id === userId);
  };

  const updateCircleStatus = async (circleId) => {
    try {
      // The DB hook handles auto-updating status to 'active' when 3 members are present, 
      // but we can manually trigger an empty update to let the hook fire if needed.
      await pb.collection('circles').update(circleId, {}, { $autoCancel: false });
    } catch (err) {
      console.error("Failed to trigger status update:", err);
    }
  };

  const addMemberToCircle = async (circleId, userId, userName) => {
    try {
      const circle = await pb.collection('circles').getOne(circleId, { $autoCancel: false });
      
      let updateData = {};
      if (!circle.member_2_id) {
        updateData = { member_2_id: userId, member_2_name: userName };
      } else if (!circle.member_3_id) {
        updateData = { member_3_id: userId, member_3_name: userName };
      } else {
        throw new Error("Circle is already full.");
      }

      await pb.collection('circles').update(circleId, updateData, { $autoCancel: false });
      return true;
    } catch (err) {
      console.error("Failed to add member:", err);
      throw err;
    }
  };

  return {
    getCircleMembers,
    isCircleFull,
    isUserMember,
    updateCircleStatus,
    addMemberToCircle
  };
};