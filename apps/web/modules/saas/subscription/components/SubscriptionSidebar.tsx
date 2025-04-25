"use client";

import { Card } from "@ui/components/card";
import { MoreVerticalIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { EditIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@ui/components/dialog";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface SubscriptionSidebarProps {
  onCategorySelect: (id: string | null) => void;
}

export function SubscriptionSidebar({ onCategorySelect, organizationId }: SubscriptionSidebarProps & { organizationId?: string }) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  
  const { data: subscriptionCategories = [], isLoading, error } = useQuery({
    queryKey: ['subscription-categories', organizationId],
    queryFn: async () => {
      const url = organizationId ? `/api/subscription-categories?organizationId=${organizationId}` : '/api/subscription-categories';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received');
      }

      return [{ id: 'all', name: 'All', subscriptionCount: data.reduce((acc, cat) => acc + (cat.subscriptionCount || 0), 0) }, ...data];
    },
  });

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{id: string, name: string} | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <span>Loading categories...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>Error: {error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm underline"
        >
          Try again
        </button>
      </div>
    );
  }
  
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }
  
    const isDuplicate = subscriptionCategories.some(
      (cat) => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    );
  
    if (isDuplicate) {
      toast.error("Category already exists");
      return;
    }
  
    try {
      setIsAddingCategory(true);
      const response = await fetch('/api/subscription-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategoryName, organizationId }),
      });
  
      if (!response.ok) {
        throw new Error(await response.text());
      }
  
      setNewCategoryName("");
      toast.success("Category added successfully");
      queryClient.invalidateQueries(['subscription-categories']);
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to add category");
    } finally {
      setIsAddingCategory(false);
    }
  };
  
  const handleEditCategory = async () => {
    if (!editingCategory?.name.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }
  
    try {
      const response = await fetch(`/api/subscription-categories/${editingCategory.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editingCategory.name, organizationId }),
      });
  
      if (!response.ok) {
        throw new Error(await response.text());
      }
  
      toast.success("Category updated successfully");
      queryClient.invalidateQueries(['subscription-categories']);
      setEditingCategory(null);
    } catch (error) {
      toast.error(error.message || "Failed to update category");
    }
  };
  
  const handleDeleteCategory = async () => {
    if (!deleteCategoryId) return;
  
    try {
      const response = await fetch(`/api/subscription-categories/${deleteCategoryId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error(await response.text());
      }
  
      toast.success("Category deleted successfully");
      queryClient.invalidateQueries(['subscription-categories']);
      setDeleteCategoryId(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete category");
    }
  };

  return (
    <div className="@container">
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              value={editingCategory?.name || ''}
              onChange={(e) => setEditingCategory(prev => prev ? {...prev, name: e.target.value} : null)}
            />
            <div className="flex gap-2 justify-end">
              <Button onClick={() => setEditingCategory(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleEditCategory}>
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  
      <Dialog open={!!deleteCategoryId} onOpenChange={(open) => !open && setDeleteCategoryId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p>Are you sure you want to delete this category?</p>
            <div className="flex gap-2 justify-end">
              <Button onClick={() => setDeleteCategoryId(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleDeleteCategory}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-lg">
          {t("subscription.categories.title")}
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1"
            >
              <PlusIcon className="size-4" />
              <span>New</span>
            </Button>
          </DialogTrigger>
          <DialogContent onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              
            </div>
            <DialogFooter>
              <Button 
                variant="primary"
                onClick={handleAddCategory}
                disabled={isAddingCategory}
              >
                {isAddingCategory ? "Adding..." : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-2">
        {subscriptionCategories.map((category) => (
          <Card
            key={category.id}
            className={`flex cursor-pointer items-center justify-between p-4 ${selectedCategoryId === category.id ? 'bg-primary/10 border-primary' : ''}`}
            onClick={() => {
              const newSelectedId = category.id === 'all' ? null : (selectedCategoryId === category.id ? null : category.id);
              setSelectedCategoryId(newSelectedId);
              onCategorySelect(newSelectedId);
            }}
          >
            <span className={`font-medium ${selectedCategoryId === category.id ? 'text-primary' : ''}`}>
              <div className="flex items-center gap-2">
              <span className="truncate max-w-[155px]">{category.name}</span>
              <span>({category.subscriptionCount})</span>
            </div>
            </span>
            {category.id !== 'all' && (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreVerticalIcon className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setEditingCategory(category)}>
                    <EditIcon className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => setDeleteCategoryId(category.id)}
                  >
                    <Trash2Icon className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}