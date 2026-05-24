import { jsPDF } from "jspdf";

export const generatePDF = (roundData, circleName) => {
  const doc = new jsPDF();
  
  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.text(`The Power of Three - ${circleName || 'Circle'}`, 20, 20);
  
  doc.setFontSize(16);
  doc.text(`Round ${roundData.roundNumber || 1}`, 20, 30);
  
  doc.setFont("times", "normal");
  doc.setFontSize(12);
  
  let y = 45;
  const addSection = (title, content) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("times", "bold");
    doc.text(title, 20, y);
    y += 7;
    doc.setFont("times", "normal");
    
    const splitContent = doc.splitTextToSize(content || 'None', 170);
    doc.text(splitContent, 20, y);
    y += (splitContent.length * 7) + 10;
  };

  addSection("Title:", roundData.workTitle);
  addSection("Submission:", roundData.workSubmission);
  addSection("Questions:", roundData.callingQuestions);
  addSection("The Opening (Hope):", roundData.openingHope);
  addSection("The Closing (Learned):", roundData.closingLearned);
  addSection("The Win (Celebration):", roundData.winCelebration);
  
  doc.save(`power-of-three-round-${roundData.roundNumber || 1}.pdf`);
};