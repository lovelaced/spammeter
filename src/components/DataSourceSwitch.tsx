import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface DataSourceSwitchProps {
  useMockData: boolean
  onToggle: () => void
}

export function DataSourceSwitch({ useMockData, onToggle }: DataSourceSwitchProps) {
  return (
    <div className="flex items-center space-x-2 mt-2 p-2 rounded-md">
      <Switch
        id="data-source"
        checked={!useMockData}
        onCheckedChange={onToggle}
      />
      <Label htmlFor="data-source" className="text-sm font-medium text-black">
        {useMockData ? 'Testnet Data' : 'Kusama Data'}
      </Label>
    </div>
  )
}