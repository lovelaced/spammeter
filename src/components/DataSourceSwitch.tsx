import { Switch } from '@/components/ui/switch';

interface DataSourceSwitchProps {
  useMockData: boolean;
  onToggle: () => void;
}

export function DataSourceSwitch({ useMockData, onToggle }: DataSourceSwitchProps) {
  return (
    <div className="flex items-center space-x-2 mt-2 p-2 rounded-md relative border border-dashed border-gray-500">
      <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-2 text-xs font-bold text-gray-500">
        DEVELOPMENT_AREA
      </span>
      <Switch id="data-source" checked={!useMockData} onCheckedChange={onToggle} />
    </div>
  );
}
