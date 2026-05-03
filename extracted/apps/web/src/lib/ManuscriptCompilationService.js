import pb from '@/lib/pocketbaseClient.js';

export const getScenesByChapter = async (projectId, userId) => {
  try {
    const [chapters, scenes] = await Promise.all([
      pb.collection('chapters').getFullList({
        filter: `projectId = "${projectId}"`,
        sort: 'chapter_number,created',
        $autoCancel: false,
      }),
      pb.collection('scenes').getFullList({
        filter: `projectId = "${projectId}"`,
        sort: 'order,created',
        $autoCancel: false,
      })
    ]);

    const chaptersWithScenes = chapters.map(chapter => ({
      ...chapter,
      scenes: scenes.filter(scene => scene.chapter_id === chapter.id)
    }));

    const unassignedScenes = scenes.filter(scene => !scene.chapter_id);
    
    if (unassignedScenes.length > 0) {
      chaptersWithScenes.push({
        id: 'unassigned',
        title: 'Unassigned Notes',
        chapter_number: null,
        scenes: unassignedScenes
      });
    }

    return chaptersWithScenes;
  } catch (error) {
    console.error('Error fetching scenes by chapter:', error);
    return [];
  }
};