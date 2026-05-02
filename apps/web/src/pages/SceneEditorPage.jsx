import React from 'react';
import { Helmet } from 'react-helmet';
import AppLayout from '@/components/AppLayout.jsx';
import SceneEditor from '@/components/SceneEditor.jsx';

const SceneEditorPage = () => {
  return (
    <AppLayout>
      <Helmet>
        <title>Scene Editor - Quil Forge</title>
        <meta name="description" content="Write and refine your manuscript with mystical editing tools and AI assistance" />
      </Helmet>
      <SceneEditor />
    </AppLayout>
  );
};

export default SceneEditorPage;