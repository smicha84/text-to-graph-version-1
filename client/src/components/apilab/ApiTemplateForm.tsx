import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ApiTemplate } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { X, Save, FileText } from 'lucide-react';

interface ApiTemplateFormProps {
  template?: ApiTemplate;
  onSubmit: (template: Omit<ApiTemplate, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ApiTemplateForm({ template, onSubmit, onCancel, isLoading = false }: ApiTemplateFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    extractionPrompt: '',
    temperature: '1.0',
    thinkingEnabled: true,
    thinkingBudget: 2000
  });

  // Initialize form with template data if editing an existing template
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || '',
        systemPrompt: template.systemPrompt,
        extractionPrompt: template.extractionPrompt,
        temperature: template.temperature,
        thinkingEnabled: template.thinkingEnabled,
        thinkingBudget: template.thinkingBudget
      });
    }
  }, [template]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, thinkingEnabled: checked }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Template name is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.systemPrompt.trim()) {
      toast({
        title: "Validation Error",
        description: "System prompt is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.extractionPrompt.trim()) {
      toast({
        title: "Validation Error",
        description: "Extraction prompt is required",
        variant: "destructive"
      });
      return;
    }

    try {
      await onSubmit(formData);
      toast({
        title: "Success",
        description: `Template ${template ? 'updated' : 'created'} successfully`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: `Failed to ${template ? 'update' : 'create'} template`,
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-md">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {template ? 'Edit API Template' : 'Create API Template'}
        </h3>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={onCancel}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="name">Template Name</Label>
        <Input 
          id="name" 
          name="name" 
          value={formData.name} 
          onChange={handleChange}
          placeholder="E.g., Default Extraction, Detailed Analysis, Simple Graph..."
          className="w-full"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea 
          id="description" 
          name="description" 
          value={formData.description} 
          onChange={handleChange}
          placeholder="Explain what this template is optimized for..."
          className="h-16"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="systemPrompt">System Prompt</Label>
        <Textarea 
          id="systemPrompt" 
          name="systemPrompt" 
          value={formData.systemPrompt} 
          onChange={handleChange}
          placeholder="Instructions for Claude on how to behave and what to prioritize..."
          className="h-24 font-mono text-sm"
          required
        />
        <p className="text-xs text-gray-500">
          The system prompt sets the context and explains Claude's role in the task.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="extractionPrompt">Extraction Prompt</Label>
        <Textarea 
          id="extractionPrompt" 
          name="extractionPrompt" 
          value={formData.extractionPrompt} 
          onChange={handleChange}
          placeholder="Detailed instructions for Claude on how to extract and structure the graph data..."
          className="h-40 font-mono text-sm"
          required
        />
        <p className="text-xs text-gray-500">
          This prompt contains the specific instructions for how to extract and format the graph data.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="temperature">Temperature</Label>
        <div className="flex items-center gap-2">
          <Input 
            id="temperature" 
            name="temperature" 
            type="text" 
            value={formData.temperature} 
            onChange={handleChange}
            className="w-24"
            pattern="^(0(\.\d{1,2})?|1(\.0{1,2})?)$"
            title="Value between 0 and 1 with up to 2 decimal places"
          />
          <span className="text-sm text-gray-500">
            (0-1: Lower for deterministic output, higher for more creativity)
          </span>
        </div>
        <p className="text-xs text-gray-500">
          Note: When thinking is enabled, temperature will be set to exactly 1.0 as required by the API.
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="thinkingEnabled" className="cursor-pointer">
            Enable Thinking Mode
          </Label>
          <Switch 
            id="thinkingEnabled" 
            checked={formData.thinkingEnabled}
            onCheckedChange={handleSwitchChange}
          />
        </div>
        <p className="text-xs text-gray-500">
          Thinking mode allows Claude to show its reasoning process during graph generation.
        </p>
      </div>
      
      {formData.thinkingEnabled && (
        <div className="space-y-2">
          <Label htmlFor="thinkingBudget">Thinking Budget (Tokens)</Label>
          <Input 
            id="thinkingBudget" 
            name="thinkingBudget" 
            type="number" 
            min="500" 
            max="10000" 
            step="100" 
            value={formData.thinkingBudget} 
            onChange={handleNumberChange}
          />
          <p className="text-xs text-gray-500">
            More tokens allow for more detailed reasoning (default: 2000, range: 500-10000)
          </p>
        </div>
      )}
      
      <div className="flex justify-end pt-4 space-x-3">
        <Button 
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isLoading}
          className="gap-1"
        >
          <Save className="h-4 w-4" />
          {isLoading ? 'Saving...' : 'Save Template'}
        </Button>
      </div>
    </form>
  );
}