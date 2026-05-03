import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { toast } from 'sonner';
import { Download, Loader2, FileText, FileType2, File } from 'lucide-react';
import { exportToTXT, exportToDOCX, exportToPDF } from '@/lib/ExportService.js';

const ExportValidationDialog = ({ isOpen, onClose, manuscriptData }) => {
  const [format, setFormat] = useState('txt');
  const [isExporting, setIsExporting] = useState(false);
  const [options, setOptions] = useState({
    includeFrontMatter: true,
    includeSummaries: false,
    includeMetadata: false
  });

  const handleExport = async () => {
    if (!manuscriptData || !manuscriptData.project) {
      toast.error('No manuscript data available to export.');
      return;
    }

    setIsExporting(true);
    toast.loading(`Generating ${format.toUpperCase()}...`, { id: 'export' });

    try {
      let blob;
      if (format === 'txt') {
        blob = await exportToTXT(manuscriptData);
      } else if (format === 'docx') {
        blob = await exportToDOCX(manuscriptData);
      } else if (format === 'pdf') {
        blob = await exportToPDF(manuscriptData);
      }

      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${manuscriptData.project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_manuscript.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Export complete!', { id: 'export' });
        onClose();
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export manuscript.', { id: 'export' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Export Manuscript</DialogTitle>
          <DialogDescription>
            Choose your preferred format and options for exporting your project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Export Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="txt">
                  <div className="flex items-center"><FileText className="w-4 h-4 mr-2" /> Plain Text (.txt)</div>
                </SelectItem>
                <SelectItem value="docx">
                  <div className="flex items-center"><FileType2 className="w-4 h-4 mr-2" /> Word Document (.docx)</div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center"><File className="w-4 h-4 mr-2" /> PDF Document (.pdf)</div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Export Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="frontMatter" 
                  checked={options.includeFrontMatter}
                  onCheckedChange={(c) => setOptions({...options, includeFrontMatter: c})}
                />
                <Label htmlFor="frontMatter" className="font-normal">Include Title Page & Front Matter</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="summaries" 
                  checked={options.includeSummaries}
                  onCheckedChange={(c) => setOptions({...options, includeSummaries: c})}
                />
                <Label htmlFor="summaries" className="font-normal">Include Chapter Summaries</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="metadata" 
                  checked={options.includeMetadata}
                  onCheckedChange={(c) => setOptions({...options, includeMetadata: c})}
                />
                <Label htmlFor="metadata" className="font-normal">Include Scene Metadata (POV, Status)</Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>Cancel</Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Export {format.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportValidationDialog;