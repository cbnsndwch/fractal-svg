'use client';

import { useState, useMemo, useEffect } from 'react';

import { FractalGenerator } from '@cbnsndwch/fractal-react';
import {
    type FractalType,
    type GeneratorOptions,
    FRACTAL_CONFIG,
} from '@cbnsndwch/fractal-generator';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

/**
 * Gradient presets from uiGradients (https://github.com/Ghosh/uiGradients)
 * MIT License - Community contributed gradients by @_ighosh
 */
const GRADIENT_PRESETS: Array<{ name: string; colors: string[] }> = [
    { name: 'None', colors: [] },
    // Requested gradients
    { name: 'Metapolis', colors: ['#659999', '#f4791f'] },
    { name: 'Kyoo Pal', colors: ['#dd3e54', '#6be585'] },
    // Beautiful multi-color gradients
    { name: 'Stripe', colors: ['#1FA2FF', '#12D8FA', '#A6FFCB'] },
    { name: 'Sunset', colors: ['#0B486B', '#F56217'] },
    { name: 'Mojito', colors: ['#1D976C', '#93F9B9'] },
    { name: 'Cherry', colors: ['#EB3349', '#F45C43'] },
    { name: 'Pinky', colors: ['#DD5E89', '#F7BB97'] },
    { name: 'Sea Blue', colors: ['#2b5876', '#4e4376'] },
    { name: 'Mango', colors: ['#ffe259', '#ffa751'] },
    { name: 'Purple Love', colors: ['#cc2b5e', '#753a88'] },
    { name: 'Aqua Marine', colors: ['#1A2980', '#26D0CE'] },
    { name: 'Sunrise', colors: ['#FF512F', '#F09819'] },
    { name: 'Sel', colors: ['#00467F', '#A5CC82'] },
    { name: 'Bloody Mary', colors: ['#FF512F', '#DD2476'] },
    { name: 'Moonlit Asteroid', colors: ['#0F2027', '#203A43', '#2C5364'] },
    { name: 'Cool Blues', colors: ['#2193b0', '#6dd5ed'] },
    { name: 'Timber', colors: ['#fc00ff', '#00dbde'] },
    { name: 'Relay', colors: ['#3A1C71', '#D76D77', '#FFAF7B'] },
    { name: 'Stellar', colors: ['#7474BF', '#348AC7'] },
];

const DEFAULT_BASE_OPTIONS = {
    size: 600,
    iter: 4,
    bg: 'none',
    circleBg: '#f0f0f0',
    fill: '#000000',
    gradient: null,
    gradientAngle: 0,
    stroke: 'none',
    strokeWidth: 1,
    margin: 20,
};

// Color picker with transparent option
function ColorPicker({
    label,
    value,
    onChange,
    allowTransparent = true,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    allowTransparent?: boolean;
}) {
    const isTransparent = value === 'none' || value === 'transparent';

    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            <div className="flex gap-2 items-center">
                <input
                    type="color"
                    value={isTransparent ? '#ffffff' : value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={isTransparent}
                    className={`flex-1 h-10 cursor-pointer rounded border border-input ${isTransparent ? 'opacity-50' : ''}`}
                />
                {allowTransparent && (
                    <Button
                        type="button"
                        variant={isTransparent ? 'default' : 'outline'}
                        size="sm"
                        onClick={() =>
                            onChange(isTransparent ? '#ffffff' : 'none')
                        }
                        title="Toggle transparent"
                    >
                        ∅
                    </Button>
                )}
            </div>
            {isTransparent && (
                <p className="text-xs text-muted-foreground">Transparent</p>
            )}
        </div>
    );
}

// Debounce hook for snappy preview updates
function useDebouncedValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function FractalPlayground() {
    const [options, setOptions] = useState<GeneratorOptions>({
        ...DEFAULT_BASE_OPTIONS,
        type: 'koch',
        sides: 3,
        inward: false,
        // Start with a beautiful gradient by default
        gradient: ['#659999', '#f4791f'],
    } as GeneratorOptions);

    const [selectedGradient, setSelectedGradient] = useState('Metapolis');
    const [showCircleBg, setShowCircleBg] = useState(false);

    // Debounce options for smooth preview updates (150ms delay)
    const debouncedOptions = useDebouncedValue(options, 150);

    // Compute effective options with circle backdrop toggle
    const effectiveOptions = useMemo(
        () => ({
            ...debouncedOptions,
            circleBg: showCircleBg ? debouncedOptions.circleBg : 'none',
        }),
        [debouncedOptions, showCircleBg],
    );

    const fractalType = options.type;
    const config = FRACTAL_CONFIG[fractalType];

    const handleFractalTypeChange = (type: FractalType) => {
        // Set type-specific defaults
        const baseOpts = {
            ...DEFAULT_BASE_OPTIONS,
            iter: FRACTAL_CONFIG[type].defaultIter,
            gradient: options.gradient, // Preserve current gradient
            gradientAngle: options.gradientAngle,
        };

        switch (type) {
            case 'koch':
                setOptions({
                    ...baseOpts,
                    type: 'koch',
                    sides: 3,
                    inward: false,
                });
                break;
            case 'carpet':
                setOptions({
                    ...baseOpts,
                    type: 'carpet',
                    D: 2.5,
                    kMin: 2,
                    kMax: 5,
                    maxRects: 10000,
                });
                break;
            case 'mandelbrot':
                setOptions({
                    ...baseOpts,
                    type: 'mandelbrot',
                    resolution: 200,
                    centerX: -0.5,
                    centerY: 0,
                    zoom: 1,
                    maxIter: 200,
                });
                break;
            case 'julia':
                setOptions({
                    ...baseOpts,
                    type: 'julia',
                    resolution: 200,
                    juliaReal: -0.7,
                    juliaImag: 0.27,
                    centerX: 0,
                    centerY: 0,
                    zoom: 1,
                    maxIter: 200,
                });
                break;
            case 'dragon':
                setOptions({ ...baseOpts, type: 'dragon' });
                break;
            case 'hilbert':
                setOptions({ ...baseOpts, type: 'hilbert' });
                break;
            case 'levy':
                setOptions({ ...baseOpts, type: 'levy' });
                break;
            case 'sierpinski':
                setOptions({ ...baseOpts, type: 'sierpinski' });
                break;
            case 'peano':
                setOptions({ ...baseOpts, type: 'peano' });
                break;
            case 'gosper':
                setOptions({ ...baseOpts, type: 'gosper' });
                break;
            default:
                setOptions({
                    ...baseOpts,
                    type: 'koch',
                    sides: 3,
                    inward: false,
                });
        }
    };

    const handleGradientChange = (gradientName: string) => {
        setSelectedGradient(gradientName);
        const preset = GRADIENT_PRESETS.find((p) => p.name === gradientName);
        if (preset) {
            updateOption(
                'gradient',
                preset.colors.length > 0 ? preset.colors : null,
            );
        }
    };

    const updateOption = (key: string, value: any) => {
        setOptions((prev) => ({ ...prev, [key]: value }));
    };

    const handleDownload = () => {
        const svgElement = document.querySelector('.fractal-preview svg');
        if (!svgElement) return;

        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fractalType}-fractal.svg`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controls Panel */}
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Controls</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Fractal Type */}
                        <div className="space-y-1.5">
                            <Label>Fractal Type</Label>
                            <Select
                                value={fractalType}
                                onValueChange={(value) =>
                                    handleFractalTypeChange(
                                        value as FractalType,
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a fractal" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="koch">
                                        Koch Snowflake
                                    </SelectItem>
                                    <SelectItem value="dragon">
                                        Dragon Curve
                                    </SelectItem>
                                    <SelectItem value="hilbert">
                                        Hilbert Curve
                                    </SelectItem>
                                    <SelectItem value="levy">
                                        Lévy C Curve
                                    </SelectItem>
                                    <SelectItem value="sierpinski">
                                        Sierpinski Triangle
                                    </SelectItem>
                                    <SelectItem value="peano">
                                        Peano Curve
                                    </SelectItem>
                                    <SelectItem value="gosper">
                                        Gosper Curve
                                    </SelectItem>
                                    <SelectItem value="carpet">
                                        Sierpinski Carpet
                                    </SelectItem>
                                    <SelectItem value="mandelbrot">
                                        Mandelbrot Set
                                    </SelectItem>
                                    <SelectItem value="julia">
                                        Julia Set
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {config.segmentFormula}
                            </p>
                        </div>

                        {/* Iterations / Resolution */}
                        <div className="space-y-1.5">
                            {fractalType === 'mandelbrot' ||
                            fractalType === 'julia' ? (
                                <>
                                    <div className="flex justify-between">
                                        <Label>Resolution</Label>
                                        <span className="text-sm text-muted-foreground">
                                            {(options as any).resolution}
                                        </span>
                                    </div>
                                    <Slider
                                        min={50}
                                        max={config.maxIter}
                                        step={10}
                                        value={[(options as any).resolution]}
                                        onValueChange={([value]) =>
                                            updateOption('resolution', value)
                                        }
                                    />
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between">
                                        <Label>Iterations</Label>
                                        <span className="text-sm text-muted-foreground">
                                            {options.iter}
                                        </span>
                                    </div>
                                    <Slider
                                        min={1}
                                        max={config.maxIter}
                                        step={1}
                                        value={[options.iter]}
                                        onValueChange={([value]) =>
                                            updateOption('iter', value)
                                        }
                                    />
                                </>
                            )}
                        </div>

                        {/* Size */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between">
                                <Label>Size</Label>
                                <span className="text-sm text-muted-foreground">
                                    {options.size}px
                                </span>
                            </div>
                            <Slider
                                min={200}
                                max={1200}
                                step={50}
                                value={[options.size]}
                                onValueChange={([value]) =>
                                    updateOption('size', value)
                                }
                            />
                        </div>

                        {/* Koch-specific options */}
                        {fractalType === 'koch' && (
                            <>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between">
                                        <Label>Sides</Label>
                                        <span className="text-sm text-muted-foreground">
                                            {(options as any).sides}
                                        </span>
                                    </div>
                                    <Slider
                                        min={3}
                                        max={8}
                                        step={1}
                                        value={[(options as any).sides]}
                                        onValueChange={([value]) =>
                                            updateOption('sides', value)
                                        }
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="inward"
                                        checked={(options as any).inward}
                                        onCheckedChange={(checked) =>
                                            updateOption('inward', checked)
                                        }
                                    />
                                    <Label htmlFor="inward">Inward</Label>
                                </div>
                            </>
                        )}

                        {/* Colors */}
                        <div className="space-y-3">
                            <ColorPicker
                                label="Background"
                                value={options.bg}
                                onChange={(value) => updateOption('bg', value)}
                                allowTransparent
                            />

                            {/* Circle Backdrop Toggle */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="circle-bg">
                                        Circle Backdrop
                                    </Label>
                                    <Switch
                                        id="circle-bg"
                                        checked={showCircleBg}
                                        onCheckedChange={setShowCircleBg}
                                    />
                                </div>
                                {showCircleBg && (
                                    <ColorPicker
                                        label="Circle Color"
                                        value={options.circleBg}
                                        onChange={(value) =>
                                            updateOption('circleBg', value)
                                        }
                                        allowTransparent
                                    />
                                )}
                            </div>

                            <ColorPicker
                                label="Stroke"
                                value={options.stroke}
                                onChange={(value) =>
                                    updateOption('stroke', value)
                                }
                                allowTransparent
                            />
                        </div>

                        {/* Fill Mode Toggle */}
                        <div className="space-y-1.5">
                            <Label>Fill Mode</Label>
                            <div className="flex gap-2">
                                <Button
                                    variant={
                                        !options.gradient ||
                                        options.gradient.length === 0
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => {
                                        setSelectedGradient('None');
                                        updateOption('gradient', null);
                                    }}
                                >
                                    Solid
                                </Button>
                                <Button
                                    variant={
                                        options.gradient &&
                                        options.gradient.length > 0
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => {
                                        if (
                                            !options.gradient ||
                                            options.gradient.length === 0
                                        ) {
                                            setSelectedGradient('Metapolis');
                                            updateOption('gradient', [
                                                '#659999',
                                                '#f4791f',
                                            ]);
                                        }
                                    }}
                                >
                                    Gradient
                                </Button>
                            </div>
                        </div>

                        {/* Solid Fill Color (only when no gradient) */}
                        {(!options.gradient ||
                            options.gradient.length === 0) && (
                            <ColorPicker
                                label="Fill Color"
                                value={options.fill}
                                onChange={(value) =>
                                    updateOption('fill', value)
                                }
                                allowTransparent
                            />
                        )}

                        {/* Gradient Preset Picker (only when gradient mode) */}
                        {options.gradient && options.gradient.length > 0 && (
                            <div className="space-y-1.5">
                                <Label>Gradient Preset</Label>
                                <Select
                                    value={selectedGradient}
                                    onValueChange={handleGradientChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a gradient" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {GRADIENT_PRESETS.filter(
                                            (p) => p.colors.length > 0,
                                        ).map((preset) => (
                                            <SelectItem
                                                key={preset.name}
                                                value={preset.name}
                                            >
                                                {preset.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {/* Gradient preview swatch */}
                                <div
                                    className="h-6 rounded border"
                                    style={{
                                        background: `linear-gradient(to right, ${options.gradient.join(', ')})`,
                                    }}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Gradients from{' '}
                                    <a
                                        href="https://github.com/Ghosh/uiGradients"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        uiGradients
                                    </a>
                                </p>
                            </div>
                        )}

                        {/* Gradient Angle (only show when gradient is active) */}
                        {options.gradient && options.gradient.length > 0 && (
                            <div className="space-y-1.5">
                                <div className="flex justify-between">
                                    <Label>Gradient Angle</Label>
                                    <span className="text-sm text-muted-foreground">
                                        {options.gradientAngle}°
                                    </span>
                                </div>
                                <Slider
                                    min={0}
                                    max={360}
                                    step={15}
                                    value={[options.gradientAngle]}
                                    onValueChange={([value]) =>
                                        updateOption('gradientAngle', value)
                                    }
                                />
                            </div>
                        )}

                        {/* Stroke Width */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between">
                                <Label>Stroke Width</Label>
                                <span className="text-sm text-muted-foreground">
                                    {options.strokeWidth}px
                                </span>
                            </div>
                            <Slider
                                min={0}
                                max={5}
                                step={0.5}
                                value={[options.strokeWidth]}
                                onValueChange={([value]) =>
                                    updateOption('strokeWidth', value)
                                }
                            />
                        </div>

                        {/* Download Button */}
                        <Button onClick={handleDownload} className="w-full">
                            Download SVG
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-2">
                <Card>
                    {/* <CardHeader>
                        <CardTitle>Preview</CardTitle>
                    </CardHeader> */}
                    {/* <CardContent> */}
                        <div
                            className="fractal-preview flex items-center justify-center rounded-lg overflow-hidden"
                            style={{
                                backgroundImage:
                                    'linear-gradient(45deg, #d9d9d9 25%, transparent 25%), linear-gradient(-45deg, #d9d9d9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d9d9d9 75%), linear-gradient(-45deg, transparent 75%, #d9d9d9 75%)',
                                backgroundSize: '20px 20px',
                                backgroundPosition:
                                    '0 0, 0 10px, 10px -10px, -10px 0px',
                            }}
                        >
                            <FractalGenerator options={effectiveOptions} />
                        </div>
                    {/* </CardContent> */}
                </Card>
            </div>
        </div>
    );
}
