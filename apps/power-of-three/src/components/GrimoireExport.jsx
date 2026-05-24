import React, { useState } from 'react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

export default function GrimoireExport({ circleData, completedRounds }) {
  const [isExporting, setIsExporting] = useState(false);

  const generateGrimoire = async () => {
    if (!completedRounds || completedRounds.length === 0) {
      toast.error("No completed rounds to export.");
      return;
    }

    setIsExporting(true);
    
    try {
      // Create jsPDF instance
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter'
      });

      const pageWidth = 8.5;
      const pageHeight = 11;
      const margin = 1.0;
      const usableWidth = pageWidth - 2 * margin;

      // Colors
      const bgColor = [245, 238, 220]; // Parchment
      const textColor = [18, 9, 26];   // Dark text
      const goldColor = [212, 175, 86]; // Gold

      // Helper to add background
      const addBackground = () => {
        doc.setFillColor(...bgColor);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
      };

      // Helper to draw gold divider
      const drawDivider = (y) => {
        doc.setDrawColor(...goldColor);
        doc.setLineWidth(0.02);
        doc.line(margin, y, pageWidth - margin, y);
      };

      // Helper to write text with word wrap
      const writeText = (text, x, y, options = {}) => {
        if (!text) return y;
        const {
          fontSize = 12,
          fontName = 'times',
          fontStyle = 'normal',
          color = textColor,
          align = 'left',
          maxWidth = usableWidth,
          lineHeight = 1.5
        } = options;

        doc.setFont(fontName, fontStyle);
        doc.setFontSize(fontSize);
        doc.setTextColor(...color);

        const lines = doc.splitTextToSize(String(text), maxWidth);
        const lh = (fontSize * lineHeight) / 72; // Line height in inches
        
        let currentY = y;
        
        lines.forEach(line => {
          if (currentY > pageHeight - margin) {
            doc.addPage();
            addBackground();
            currentY = margin + 0.5; // Reset Y with top margin padding
            doc.setFont(fontName, fontStyle);
            doc.setFontSize(fontSize);
            doc.setTextColor(...color);
          }
          doc.text(line, x, currentY, { align });
          currentY += lh;
        });

        return currentY;
      };

      // 1. Cover Page
      addBackground();
      
      let y = pageHeight / 2 - 1.5;
      y = writeText("THE GRIMOIRE", pageWidth / 2, y, { 
        fontSize: 32, fontStyle: 'bold', align: 'center', color: goldColor 
      });
      
      y += 0.3;
      y = writeText(circleData?.circleName || "A Cycle of Magic", pageWidth / 2, y, { 
        fontSize: 18, fontStyle: 'italic', align: 'center' 
      });
      
      y += 1.5;
      const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      y = writeText(`Compiled on ${today}`, pageWidth / 2, y, { 
        fontSize: 12, align: 'center' 
      });

      // 2. Table of Contents
      doc.addPage();
      addBackground();
      y = margin + 0.5;
      
      y = writeText("Contents", pageWidth / 2, y, { 
        fontSize: 24, fontStyle: 'bold', align: 'center', color: goldColor 
      });
      y += 0.5;

      completedRounds.forEach((round, index) => {
        const title = round.workTitle || `Round ${round.roundNumber} Work`;
        const entry = `Round ${round.roundNumber}: ${title}`;
        y = writeText(entry, margin, y, { fontSize: 14 });
        y += 0.1;
      });

      // 3. Rounds Content
      completedRounds.forEach(round => {
        doc.addPage();
        addBackground();
        y = margin + 0.5;

        // Round Header
        y = writeText(`Round ${round.roundNumber}`, pageWidth / 2, y, { 
          fontSize: 20, fontStyle: 'bold', align: 'center', color: goldColor 
        });
        
        y += 0.2;
        const completionStr = round.completed_at ? new Date(round.completed_at).toLocaleDateString() : 'Unknown';
        y = writeText(`Completed: ${completionStr}`, pageWidth / 2, y, { 
          fontSize: 12, fontStyle: 'italic', align: 'center' 
        });
        
        y += 0.3;
        drawDivider(y - 0.15);

        // Roles
        y = writeText(`Writer: ${round.current_writer || 'Unknown'}`, margin, y, { fontSize: 12, fontStyle: 'italic' });
        y = writeText(`Beta Reader: ${round.current_beta_reader || 'Unknown'}`, margin, y, { fontSize: 12, fontStyle: 'italic' });
        y = writeText(`Editor: ${round.current_editor || 'Unknown'}`, margin, y, { fontSize: 12, fontStyle: 'italic' });
        
        y += 0.3;
        
        // The Work
        y = writeText(round.workTitle || "Untitled Work", margin, y, { fontSize: 16, fontStyle: 'bold', color: goldColor });
        y += 0.1;
        y = writeText(`${round.wordCount || 0} words`, margin, y, { fontSize: 10, fontStyle: 'italic', color: goldColor });
        y += 0.2;
        y = writeText(round.workSubmission || "No text submitted.", margin, y, { fontSize: 11 });

        y += 0.4;
        drawDivider(y - 0.2);

        // Calling Questions
        if (round.callingQuestions) {
          y = writeText("The Calling", margin, y, { fontSize: 14, fontStyle: 'bold', color: goldColor });
          y += 0.1;
          y = writeText(round.callingQuestions, margin, y, { fontSize: 11, fontStyle: 'italic' });
          y += 0.3;
        }

        // Beta Feedback
        if (round.betaFeedback) {
          drawDivider(y - 0.15);
          y = writeText("The Beta Reader's Reflection", margin, y, { fontSize: 14, fontStyle: 'bold', color: goldColor });
          y += 0.15;
          
          y = writeText("What Resonated:", margin, y, { fontSize: 12, fontStyle: 'bold' });
          y = writeText(round.betaFeedback.what_resonated, margin, y, { fontSize: 11 });
          y += 0.2;
          
          y = writeText("Where the Spell Faltered:", margin, y, { fontSize: 12, fontStyle: 'bold' });
          y = writeText(round.betaFeedback.where_spell_faltered, margin, y, { fontSize: 11 });
          y += 0.2;

          y = writeText("Visions for the Writer:", margin, y, { fontSize: 12, fontStyle: 'bold' });
          y = writeText(round.betaFeedback.visions_for_writer, margin, y, { fontSize: 11 });
          y += 0.3;
        }

        // Editor Feedback
        if (round.editorFeedback) {
          drawDivider(y - 0.15);
          y = writeText("The Editor's Craft", margin, y, { fontSize: 14, fontStyle: 'bold', color: goldColor });
          y += 0.15;
          
          y = writeText("The Sharpening:", margin, y, { fontSize: 12, fontStyle: 'bold' });
          y = writeText(round.editorFeedback.the_sharpening, margin, y, { fontSize: 11 });
          y += 0.2;
          
          y = writeText("Structural Incantations:", margin, y, { fontSize: 12, fontStyle: 'bold' });
          y = writeText(round.editorFeedback.structural_incantations, margin, y, { fontSize: 11 });
          y += 0.2;

          y = writeText("The Final Blessing:", margin, y, { fontSize: 12, fontStyle: 'bold' });
          y = writeText(round.editorFeedback.the_final_blessing, margin, y, { fontSize: 11 });
          y += 0.3;
        }

        // Rituals
        drawDivider(y - 0.15);
        y = writeText("The Rituals", margin, y, { fontSize: 14, fontStyle: 'bold', color: goldColor });
        y += 0.15;
        
        y = writeText("Hope: " + (round.openingHope || "N/A"), margin, y, { fontSize: 11, fontStyle: 'italic' });
        y += 0.1;
        y = writeText("Learned: " + (round.closingLearned || "N/A"), margin, y, { fontSize: 11, fontStyle: 'italic' });
        y += 0.1;
        y = writeText("Win: " + (round.winCelebration || "N/A"), margin, y, { fontSize: 11, fontStyle: 'italic' });
      });

      // 4. Back Cover
      doc.addPage();
      addBackground();
      y = pageHeight / 2 - 1.0;
      
      y = writeText("The Power of Three · Quil Authors Guild", pageWidth / 2, y, { 
        fontSize: 16, fontStyle: 'italic', align: 'center', color: goldColor 
      });
      y += 0.5;
      
      const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric' });
      writeText(`© ${dateStr}`, pageWidth / 2, y, { 
        fontSize: 12, align: 'center' 
      });

      // Save PDF
      const sanitizedName = (circleData?.circleName || 'Circle').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const dateIso = new Date().toISOString().split('T')[0];
      doc.save(`${sanitizedName}-Grimoire-${dateIso}.pdf`);

      toast.success("The Grimoire has been scribed and downloaded.");
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast.error("Failed to scribe the Grimoire. The parchment tore.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={generateGrimoire}
      disabled={isExporting}
      className="button-shimmer bg-[hsl(var(--archives-text))] text-[#12091A] font-display font-bold py-2 px-4 rounded-md shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center min-w-[180px]"
    >
      {isExporting ? (
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#12091A] border-t-transparent rounded-full animate-spin"></div>
          Scribing...
        </span>
      ) : (
        'Download Grimoire'
      )}
    </button>
  );
}