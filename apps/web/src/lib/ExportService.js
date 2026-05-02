import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import jsPDF from 'jspdf';

export const exportToTXT = async (manuscriptData) => {
  const { project, books, chaptersByBook, scenesByChapter } = manuscriptData;
  let content = `${project.name.toUpperCase()}\n\n`;

  for (const book of books) {
    content += `\n\n=== BOOK: ${book.title.toUpperCase()} ===\n\n`;
    const bookChapters = chaptersByBook[book.id] || [];
    
    for (const chapter of bookChapters) {
      content += `\n\n--- Chapter ${chapter.chapter_number}: ${chapter.title} ---\n\n`;
      const chapterScenes = scenesByChapter[chapter.id] || [];
      
      for (const scene of chapterScenes) {
        const plainText = scene.content ? scene.content.replace(/<[^>]*>?/gm, '') : '';
        content += `\n${scene.title}\n\n${plainText}\n\n* * *\n`;
      }
    }
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  return blob;
};

export const exportToDOCX = async (manuscriptData) => {
  const { project, books, chaptersByBook, scenesByChapter } = manuscriptData;
  
  const children = [
    new Paragraph({
      text: project.name,
      heading: HeadingLevel.TITLE,
      alignment: "center",
    }),
    new Paragraph({ text: "", pageBreakBefore: true })
  ];

  for (const book of books) {
    children.push(
      new Paragraph({
        text: `Book: ${book.title}`,
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
      })
    );

    const bookChapters = chaptersByBook[book.id] || [];
    for (const chapter of bookChapters) {
      children.push(
        new Paragraph({
          text: `Chapter ${chapter.chapter_number}: ${chapter.title}`,
          heading: HeadingLevel.HEADING_2,
          pageBreakBefore: true,
        })
      );

      const chapterScenes = scenesByChapter[chapter.id] || [];
      for (const scene of chapterScenes) {
        children.push(
          new Paragraph({
            text: scene.title,
            heading: HeadingLevel.HEADING_3,
          })
        );

        const plainText = scene.content ? scene.content.replace(/<[^>]*>?/gm, '') : '';
        const paragraphs = plainText.split('\n').filter(p => p.trim());
        
        for (const p of paragraphs) {
          children.push(
            new Paragraph({
              children: [new TextRun(p)],
            })
          );
        }
        
        children.push(
          new Paragraph({
            text: "* * *",
            alignment: "center",
          })
        );
      }
    }
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: children,
    }],
  });

  return await Packer.toBlob(doc);
};

export const exportToPDF = async (manuscriptData) => {
  const { project, books, chaptersByBook, scenesByChapter } = manuscriptData;
  const doc = new jsPDF();
  
  let y = 20;
  const margin = 20;
  const pageHeight = doc.internal.pageSize.height;
  const maxWidth = doc.internal.pageSize.width - margin * 2;

  doc.setFontSize(24);
  doc.text(project.name, doc.internal.pageSize.width / 2, y, { align: 'center' });
  y += 20;

  doc.setFontSize(12);
  
  for (const book of books) {
    doc.addPage();
    y = 30;
    doc.setFontSize(20);
    doc.text(`Book: ${book.title}`, margin, y);
    y += 15;

    const bookChapters = chaptersByBook[book.id] || [];
    for (const chapter of bookChapters) {
      if (y > pageHeight - 40) { doc.addPage(); y = 20; }
      doc.setFontSize(16);
      doc.text(`Chapter ${chapter.chapter_number}: ${chapter.title}`, margin, y);
      y += 10;

      const chapterScenes = scenesByChapter[chapter.id] || [];
      for (const scene of chapterScenes) {
        if (y > pageHeight - 30) { doc.addPage(); y = 20; }
        doc.setFontSize(14);
        doc.text(scene.title, margin, y);
        y += 10;

        doc.setFontSize(12);
        const plainText = scene.content ? scene.content.replace(/<[^>]*>?/gm, '') : '';
        const paragraphs = plainText.split('\n').filter(p => p.trim());
        
        for (const p of paragraphs) {
          const lines = doc.splitTextToSize(p, maxWidth);
          for (const line of lines) {
            if (y > pageHeight - 20) { doc.addPage(); y = 20; }
            doc.text(line, margin, y);
            y += 7;
          }
          y += 3; // paragraph spacing
        }
        y += 10;
      }
    }
  }

  return doc.output('blob');
};