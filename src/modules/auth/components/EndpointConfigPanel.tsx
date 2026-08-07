import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { KnowledgeEndpointConfig } from "@/types/endpoint-config";
import { defaultKnowledgeEndpointConfig } from "@/types/endpoint-config";

interface EndpointConfigPanelProps {
  config: KnowledgeEndpointConfig;
  onChange: (config: KnowledgeEndpointConfig) => void;
}

export function EndpointConfigPanel({
  config,
  onChange,
}: EndpointConfigPanelProps) {
  const [open, setOpen] = useState(false);

  const update = (patch: Partial<KnowledgeEndpointConfig>) => {
    onChange({ ...config, ...patch });
  };

  return (
    <Collapsible onOpenChange={setOpen} open={open}>
      <CollapsibleTrigger asChild>
        <Button className="w-full gap-2" size="sm" variant="ghost">
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
          连接设置
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pt-2">
        <div className="space-y-2">
          <Label htmlFor="authBackendUrl">服务地址</Label>
          <Input
            id="authBackendUrl"
            onChange={(e) => update({ authBackendUrl: e.target.value })}
            placeholder={defaultKnowledgeEndpointConfig.authBackendUrl}
            value={config.authBackendUrl}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="authPrefix">Auth Prefix</Label>
          <Input
            id="authPrefix"
            onChange={(e) => update({ authPrefix: e.target.value })}
            value={config.authPrefix}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
