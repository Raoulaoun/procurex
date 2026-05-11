import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  onAdd?: () => void;
  addLabel?: string;
}

export function PageHeader({ title, description, onAdd, addLabel = "Add" }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {onAdd && (
        <Button onClick={onAdd} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}
