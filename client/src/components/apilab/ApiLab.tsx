import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, getQueryFn } from '@/lib/queryClient';
import { ApiTemplate, ApiCall } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import ApiTemplateList from './ApiTemplateList';
import ApiTemplateForm from './ApiTemplateForm';
import ApiCallHistory from './ApiCallHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  Code, 
  History, 
  Beaker, 
  FileText,
  RefreshCw
} from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface ApiLabProps {
  onSelectTemplate: (template: ApiTemplate) => void;
  onSelectApiCall: (apiCall: ApiCall) => void;
  initialMode?: "browse" | "saveTemplate";
  currentOptions?: {
    systemPrompt?: string;
    extractionPrompt?: string;
    temperature?: string;
    thinkingEnabled?: boolean;
    thinkingBudget?: number;
  };
}

export default function ApiLab({ 
  onSelectTemplate, 
  onSelectApiCall, 
  initialMode = "browse",
  currentOptions
}: ApiLabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('templates');
  const [showForm, setShowForm] = useState(initialMode === "saveTemplate");
  const [editingTemplate, setEditingTemplate] = useState<ApiTemplate | undefined>(undefined);
  
  // If in save template mode, initialize with current options
  useEffect(() => {
    if (initialMode === "saveTemplate" && currentOptions) {
      setShowForm(true);
    }
  }, [initialMode, currentOptions]);

  // Fetch API templates
  const {
    data: templates = [],
    isLoading: templatesLoading,
    error: templatesError,
    refetch: refetchTemplates
  } = useQuery<ApiTemplate[]>({
    queryKey: ['/api/templates'],
    queryFn: getQueryFn<ApiTemplate[]>({ on401: 'returnNull' }),
  });

  // Fetch API call history
  const {
    data: apiCalls = [],
    isLoading: callsLoading,
    error: callsError,
    refetch: refetchCalls
  } = useQuery<ApiCall[]>({
    queryKey: ['/api/call-history'],
    queryFn: getQueryFn<ApiCall[]>({ on401: 'returnNull' }),
  });

  // Create a new API template
  const createTemplateMutation = useMutation({
    mutationFn: async (template: Omit<ApiTemplate, 'id' | 'userId' | 'createdAt'>) => {
      const response = await apiRequest<ApiTemplate>('/api/templates', {
        method: 'POST',
        body: template,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      setShowForm(false);
      setEditingTemplate(undefined);
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast({
        title: "Template Creation Failed",
        description: "There was an error creating the template.",
        variant: "destructive"
      });
    }
  });

  // Update an existing API template
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, template }: { id: number, template: Omit<ApiTemplate, 'id' | 'userId' | 'createdAt'> }) => {
      const response = await apiRequest<ApiTemplate>(`/api/templates/${id}`, {
        method: 'PUT',
        body: template,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      setShowForm(false);
      setEditingTemplate(undefined);
    },
    onError: (error) => {
      console.error('Error updating template:', error);
      toast({
        title: "Template Update Failed",
        description: "There was an error updating the template.",
        variant: "destructive"
      });
    }
  });

  // Delete an API template
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest<void>(`/api/templates/${id}`, {
        method: 'DELETE',
      });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      toast({
        title: "Template Deletion Failed",
        description: "There was an error deleting the template.",
        variant: "destructive"
      });
    }
  });

  // Handle template form submission
  const handleSubmitTemplate = async (template: Omit<ApiTemplate, 'id' | 'userId' | 'createdAt'>) => {
    if (editingTemplate) {
      await updateTemplateMutation.mutateAsync({ id: editingTemplate.id, template });
    } else {
      await createTemplateMutation.mutateAsync(template);
    }
  };

  // Handle creating a new template
  const handleCreateNew = () => {
    setEditingTemplate(undefined);
    setShowForm(true);
  };

  // Handle editing an existing template
  const handleEditTemplate = (template: ApiTemplate) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  // Handle selecting a template
  const handleSelectTemplate = (template: ApiTemplate) => {
    onSelectTemplate(template);
    toast({
      title: "Template Selected",
      description: `"${template.name}" will be used for the next graph generation.`,
      variant: "default"
    });
  };

  // Handle reusing an API call configuration
  const handleReuseApiCall = (apiCall: ApiCall) => {
    onSelectApiCall(apiCall);
    toast({
      title: "API Call Configuration Loaded",
      description: "The selected API call configuration has been loaded.",
      variant: "default"
    });
  };

  // Handle template deletion
  const handleDeleteTemplate = async (id: number) => {
    await deleteTemplateMutation.mutateAsync(id);
  };

  // Reset the form when closing
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTemplate(undefined);
  };

  // Refresh data
  const handleRefresh = () => {
    refetchTemplates();
    refetchCalls();
    toast({
      title: "Data Refreshed",
      description: "API Lab data has been refreshed.",
      variant: "default"
    });
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Beaker className="h-5 w-5 text-blue-600" />
          API Lab
        </h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRefresh}
          disabled={templatesLoading || callsLoading || createTemplateMutation.isPending || updateTemplateMutation.isPending || deleteTemplateMutation.isPending}
        >
          <RefreshCw className={`h-4 w-4 ${templatesLoading || callsLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      <div className="flex-grow overflow-hidden">
        {showForm ? (
          <div className="p-4 h-full overflow-auto">
            <ApiTemplateForm 
              template={editingTemplate} 
              initialOptions={initialMode === "saveTemplate" ? currentOptions : undefined}
              onSubmit={handleSubmitTemplate} 
              onCancel={handleCancelForm}
              isLoading={createTemplateMutation.isPending || updateTemplateMutation.isPending}
            />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="border-b px-4">
              <TabsList className="h-10">
                <TabsTrigger value="templates" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-1">
                  <History className="h-4 w-4" />
                  Call History
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="templates" className="flex-grow p-4 overflow-auto m-0 border-none">
              {templatesError ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to load API templates. Please try refreshing.
                  </AlertDescription>
                </Alert>
              ) : (
                <ApiTemplateList 
                  templates={templates || []} 
                  onCreateNew={handleCreateNew} 
                  onEdit={handleEditTemplate} 
                  onDelete={handleDeleteTemplate}
                  onSelect={handleSelectTemplate}
                  isLoading={templatesLoading}
                />
              )}
            </TabsContent>
            
            <TabsContent value="history" className="flex-grow p-4 overflow-auto m-0 border-none">
              {callsError ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to load API call history. Please try refreshing.
                  </AlertDescription>
                </Alert>
              ) : (
                <ApiCallHistory 
                  calls={apiCalls || []} 
                  onReuse={handleReuseApiCall}
                  isLoading={callsLoading}
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}