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
    <div className="flex items-center justify-between mb-7 pb-5 border-b">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {onAdd && (
        <Button onClick={onAdd} size="sm" className="gap-1.5" style={{ backgroundColor: "#0d2144" }}>
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}
