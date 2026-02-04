import { useDyslexia, ReadEasySettings } from "@/lib/DyslexiaContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ReadEasySettings() {
  const { readEasyMode, readEasySettings, updateReadEasySettings, resetReadEasySettings } = useDyslexia();

  if (!readEasyMode) {
    return null;
  }

  const handleFontSizeChange = (value: number) => {
    updateReadEasySettings({ fontSize: value });
  };

  const handleLineHeightChange = (value: number) => {
    updateReadEasySettings({ lineHeight: parseFloat(value.toFixed(2)) });
  };

  const handleLetterSpacingChange = (value: number) => {
    updateReadEasySettings({ letterSpacing: parseFloat(value.toFixed(3)) });
  };

  const handleWordSpacingChange = (value: number) => {
    updateReadEasySettings({ wordSpacing: parseFloat(value.toFixed(3)) });
  };

  return (
    <div className="space-y-5 border-t pt-5 mt-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Font Size</Label>
          <span className="text-xs font-medium bg-secondary px-2 py-1 rounded">
            {readEasySettings.fontSize}%
          </span>
        </div>
        <input
          type="range"
          min="80"
          max="150"
          step="5"
          value={readEasySettings.fontSize}
          onChange={(e) => handleFontSizeChange(Number(e.target.value))}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
          aria-label="Adjust font size for ReadEasy mode"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Small</span>
          <span>Large</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Line Height</Label>
          <span className="text-xs font-medium bg-secondary px-2 py-1 rounded">
            {readEasySettings.lineHeight.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="1.2"
          max="2"
          step="0.1"
          value={readEasySettings.lineHeight}
          onChange={(e) => handleLineHeightChange(Number(e.target.value))}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
          aria-label="Adjust line height for ReadEasy mode"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Tight</span>
          <span>Loose</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Letter Spacing</Label>
          <span className="text-xs font-medium bg-secondary px-2 py-1 rounded">
            {readEasySettings.letterSpacing.toFixed(3)}em
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="0.3"
          step="0.01"
          value={readEasySettings.letterSpacing}
          onChange={(e) => handleLetterSpacingChange(Number(e.target.value))}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
          aria-label="Adjust letter spacing for ReadEasy mode"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Normal</span>
          <span>Wide</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Word Spacing</Label>
          <span className="text-xs font-medium bg-secondary px-2 py-1 rounded">
            {readEasySettings.wordSpacing.toFixed(3)}em
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="0.15"
          step="0.01"
          value={readEasySettings.wordSpacing}
          onChange={(e) => handleWordSpacingChange(Number(e.target.value))}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
          aria-label="Adjust word spacing for ReadEasy mode"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Normal</span>
          <span>Wide</span>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={resetReadEasySettings}
        className="w-full"
        aria-label="Reset ReadEasy settings to defaults"
      >
        Reset to Defaults
      </Button>

      <p className="text-xs text-muted-foreground italic">
        Preview these changes in real-time as you adjust the settings.
      </p>
    </div>
  );
}
