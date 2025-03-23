import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ApiTemplate } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  FileText,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ApiTemplateListProps {
  templates: ApiTemplate[];
  onCreateNew: () => void;
  onEdit: (template: ApiTemplate) => void;
  onDelete: (id: number) => Promise<void>;
  onSelect: (template: ApiTemplate) => void;
  isLoading?: boolean;
}

export default function ApiTemplateList({ 
  templates, 
  onCreateNew, 
  onEdit, 
  onDelete, 
  onSelect,
  isLoading = false 
}: ApiTemplateListProps) {
  const { toast } = useToast();
  const [expandedTemplateId, setExpandedTemplateId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<ApiTemplate | null>(null);

  const handleToggleExpand = (id: number) => {
    setExpandedTemplateId(expandedTemplateId === id ? null : id);
  };

  const handleDeleteClick = (template: ApiTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setTemplateToDelete(template);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;
    
    try {
      await onDelete(templateToDelete.id);
      toast({
        title: "Template Deleted",
        description: `The template "${templateToDelete.name}" has been deleted.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Deletion Failed",
        description: "There was an error deleting the template.",
        variant: "destructive"
      });
    } finally {
      setDeleteConfirmOpen(false);
      setTemplateToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          API Templates
        </h3>
        <Button 
          onClick={onCreateNew}
          size="sm"
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>
      
      {templates.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-md border border-dashed border-gray-300">
          <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No API templates yet</p>
          <Button 
            variant="secondary" 
            size="sm" 
            className="gap-1"
            onClick={onCreateNew}
          >
            <Plus className="h-4 w-4" />
            Create First Template
          </Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[120px]">Created</TableHead>
                <TableHead className="w-[140px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map(template => (
                <React.Fragment key={template.id}>
                  <TableRow 
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => handleToggleExpand(template.id)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {template.name}
                        {template.thinkingEnabled && (
                          <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                            <BrainCircuit className="h-3 w-3 mr-1" />
                            Thinking
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 truncate max-w-[300px]">
                      {template.description || 'No description'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(template.createdAt)}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(template);
                        }}
                        title="Use this template"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(template);
                        }}
                        title="Edit template"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteClick(template, e)}
                        title="Delete template"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                      {expandedTemplateId === template.id ? (
                        <ChevronUp className="h-4 w-4 inline-block ml-2" />
                      ) : (
                        <ChevronDown className="h-4 w-4 inline-block ml-2" />
                      )}
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded Details */}
                  {expandedTemplateId === template.id && (
                    <TableRow>
                      <TableCell colSpan={4} className="bg-gray-50">
                        <div className="p-3 space-y-3">
                          <div>
                            <h4 className="font-medium text-sm mb-1">System Prompt</h4>
                            <div className="bg-white border border-gray-200 rounded p-2 font-mono text-xs overflow-auto max-h-32">
                              {template.systemPrompt}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm mb-1">Extraction Prompt</h4>
                            <div className="bg-white border border-gray-200 rounded p-2 font-mono text-xs overflow-auto max-h-48">
                              {template.extractionPrompt}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                            <div>
                              <span className="font-medium">Temperature:</span>{' '}
                              {template.temperature}
                            </div>
                            <div>
                              <span className="font-medium">Thinking:</span>{' '}
                              {template.thinkingEnabled ? `Enabled (${template.thinkingBudget} tokens)` : 'Disabled'}
                            </div>
                            <div className="flex-grow text-right">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelect(template);
                                }}
                              >
                                <Copy className="h-3.5 w-3.5" />
                                Use Template
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the template "{templateToDelete?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}