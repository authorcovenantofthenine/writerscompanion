export const sampleManuscriptText = `CHAPTER 1
THE BEGINNING

The cold wind howled through the narrow streets of the ancient city, carrying with it the scent of rain and woodsmoke. Elara pulled her cloak tighter around her shoulders, her eyes scanning the shadows for any sign of movement. She had been waiting for nearly an hour, and her patience was wearing thin.

"You're late," she whispered to the darkness, though she knew no one was there to hear her.

Suddenly, a flicker of movement caught her eye. A figure emerged from the alleyway, their face obscured by a deep hood. Elara's hand instinctively went to the hilt of her dagger, her heart pounding in her chest.`;

export const manuscriptTemplates = [
  {
    id: 'standard-draft',
    name: 'Standard Draft',
    description: 'A clean, readable format for general writing, drafting, and note-taking.',
    category: 'digital',
    specifications: {
      layout: 'Flowable text',
      font: 'Serif 12pt',
      spacing: 'Double-spaced',
      alignment: 'Left-aligned'
    },
    fileRequirements: [
      'Standard text formatting',
      'Optimized for screen reading',
      'Clear paragraph separation'
    ],
    previewDescription: 'Clean serif layout for easy reading and editing.',
    styles: {
      '--template-font-family': '"EB Garamond", serif',
      '--template-font-size': '12pt',
      '--template-line-height': '2',
      '--template-max-width': '800px',
      '--template-padding': '2rem',
      '--template-text-align': 'left',
      '--template-text-indent': '1.5em',
      '--template-paragraph-spacing': '0'
    }
  },
  {
    id: 'minimal-notes',
    name: 'Minimal Notes',
    description: 'A modern, sans-serif layout perfect for organizing worldbuilding notes and outlines.',
    category: 'digital',
    specifications: {
      layout: 'Responsive',
      font: 'Sans-serif 11pt',
      spacing: '1.5 line height',
      alignment: 'Left-aligned'
    },
    fileRequirements: [
      'Modern typography',
      'Block paragraphs',
      'No indentation'
    ],
    previewDescription: 'Modern sans-serif layout with block paragraphs.',
    styles: {
      '--template-font-family': 'system-ui, -apple-system, sans-serif',
      '--template-font-size': '11pt',
      '--template-line-height': '1.6',
      '--template-max-width': '100%',
      '--template-padding': '2rem',
      '--template-text-align': 'left',
      '--template-text-indent': '0',
      '--template-paragraph-spacing': '1em'
    }
  },
  {
    id: 'focus-mode',
    name: 'Deep Focus',
    description: 'A centered, distraction-free layout for immersive writing sessions.',
    category: 'digital',
    specifications: {
      layout: 'Centered column',
      font: 'Monospace or Serif',
      spacing: 'Relaxed',
      alignment: 'Justified'
    },
    fileRequirements: [
      'Centered reading column',
      'Comfortable line length',
      'Immersive spacing'
    ],
    previewDescription: 'Centered layout optimized for deep focus and minimal distraction.',
    styles: {
      '--template-font-family': '"Times New Roman", Times, serif',
      '--template-font-size': '13pt',
      '--template-line-height': '1.8',
      '--template-max-width': '65ch',
      '--template-padding': '3rem 2rem',
      '--template-text-align': 'justify',
      '--template-text-indent': '2em',
      '--template-paragraph-spacing': '0'
    }
  }
];