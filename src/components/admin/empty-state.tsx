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
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4 shadow-sm">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-base mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground mb-5 max-w-xs">{description}</p>
      {onAdd && (
        <Button size="sm" onClick={onAdd} className="gap-1.5" style={{ backgroundColor: "#0d2144" }}>
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}
