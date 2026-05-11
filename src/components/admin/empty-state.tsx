import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onAdd?: () => void;
  addLabel?: string;
}

export function EmptyState({ icon: Icon, title, description, onAdd, addLabel = "Add" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      {onAdd && (
        <Button size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-1.5" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}
