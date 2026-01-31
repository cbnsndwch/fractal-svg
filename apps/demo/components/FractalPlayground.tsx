'use client';

import { Download } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import {
    type FractalType,
    type GeneratorOptions,
    FRACTAL_CONFIG,
} from '@cbnsndwch/fractal-generator';
import { FractalGenerator } from '@cbnsndwch/fractal-react';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

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
            <div className="lg:col-span-1 space-y-4">
                <Card>
                    <CardContent className="p-0">
                        <Accordion
                            type="single"
                            collapsible
                            defaultValue="fractal-type"
                            className="w-full"
                        >
                            {/* Fractal Type Section */}
                            <AccordionItem value="fractal-type">
                                <AccordionTrigger className="px-4">
                                    <div className="flex flex-1 items-center justify-between mr-2">
                                        <span>Fractal Type</span>
                                        <Badge
                                            variant="secondary"
                                            className="font-normal"
                                        >
                                            {fractalType === 'koch'
                                                ? 'Koch'
                                                : fractalType === 'dragon'
                                                  ? 'Dragon'
                                                  : fractalType === 'hilbert'
                                                    ? 'Hilbert'
                                                    : fractalType === 'levy'
                                                      ? 'Lévy'
                                                      : fractalType ===
                                                          'sierpinski'
                                                        ? 'Sierpinski'
                                                        : fractalType ===
                                                            'peano'
                                                          ? 'Peano'
                                                          : fractalType ===
                                                              'gosper'
                                                            ? 'Gosper'
                                                            : fractalType ===
                                                                'carpet'
                                                              ? 'Carpet'
                                                              : fractalType ===
                                                                  'mandelbrot'
                                                                ? 'Mandelbrot'
                                                                : fractalType ===
                                                                    'julia'
                                                                  ? 'Julia'
                                                                  : fractalType}
                                        </Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4 space-y-4">
                                    <div className="space-y-1.5">
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
                                                    value={[
                                                        (options as any).sides,
                                                    ]}
                                                    onValueChange={([value]) =>
                                                        updateOption(
                                                            'sides',
                                                            value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="inward"
                                                    checked={
                                                        (options as any).inward
                                                    }
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        updateOption(
                                                            'inward',
                                                            checked,
                                                        )
                                                    }
                                                />
                                                <Label htmlFor="inward">
                                                    Inward
                                                </Label>
                                            </div>
                                        </>
                                    )}
                                </AccordionContent>
                            </AccordionItem>

                            {/* Dimensions Section */}
                            <AccordionItem value="dimensions">
                                <AccordionTrigger className="px-4">
                                    <div className="flex flex-1 items-center justify-between mr-2">
                                        <span>Dimensions</span>
                                        <Badge
                                            variant="secondary"
                                            className="font-normal"
                                        >
                                            {fractalType === 'mandelbrot' ||
                                            fractalType === 'julia'
                                                ? `${(options as any).resolution}res`
                                                : `${options.iter}iter`}{' '}
                                            · {options.size}px
                                        </Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4 space-y-4">
                                    {/* Iterations / Resolution */}
                                    <div className="space-y-1.5">
                                        {fractalType === 'mandelbrot' ||
                                        fractalType === 'julia' ? (
                                            <>
                                                <div className="flex justify-between">
                                                    <Label>Resolution</Label>
                                                    <span className="text-sm text-muted-foreground">
                                                        {
                                                            (options as any)
                                                                .resolution
                                                        }
                                                    </span>
                                                </div>
                                                <Slider
                                                    min={50}
                                                    max={config.maxIter}
                                                    step={10}
                                                    value={[
                                                        (options as any)
                                                            .resolution,
                                                    ]}
                                                    onValueChange={([value]) =>
                                                        updateOption(
                                                            'resolution',
                                                            value,
                                                        )
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
                                                        updateOption(
                                                            'iter',
                                                            value,
                                                        )
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
                                </AccordionContent>
                            </AccordionItem>

                            {/* Colors & Fill Section */}
                            <AccordionItem value="colors">
                                <AccordionTrigger className="px-4">
                                    <div className="flex flex-1 items-center justify-between mr-2">
                                        <span>Colors & Fill</span>
                                        <Badge
                                            variant="secondary"
                                            className="font-normal"
                                        >
                                            {options.gradient &&
                                            options.gradient.length > 0
                                                ? selectedGradient
                                                : 'Solid'}
                                        </Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4 space-y-4">
                                    {/* Background */}
                                    <ColorPicker
                                        label="Background"
                                        value={options.bg}
                                        onChange={(value) =>
                                            updateOption('bg', value)
                                        }
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
                                                onCheckedChange={
                                                    setShowCircleBg
                                                }
                                            />
                                        </div>
                                        {showCircleBg && (
                                            <ColorPicker
                                                label="Circle Color"
                                                value={options.circleBg}
                                                onChange={(value) =>
                                                    updateOption(
                                                        'circleBg',
                                                        value,
                                                    )
                                                }
                                                allowTransparent
                                            />
                                        )}
                                    </div>

                                    {/* Fill Mode Toggle */}
                                    <div className="space-y-1.5">
                                        <Label>Fill Mode</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                variant={
                                                    !options.gradient ||
                                                    options.gradient.length ===
                                                        0
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => {
                                                    setSelectedGradient('None');
                                                    updateOption(
                                                        'gradient',
                                                        null,
                                                    );
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
                                                        options.gradient
                                                            .length === 0
                                                    ) {
                                                        setSelectedGradient(
                                                            'Metapolis',
                                                        );
                                                        updateOption(
                                                            'gradient',
                                                            [
                                                                '#659999',
                                                                '#f4791f',
                                                            ],
                                                        );
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
                                    {options.gradient &&
                                        options.gradient.length > 0 && (
                                            <div className="space-y-1.5">
                                                <Label>Gradient Preset</Label>
                                                <Select
                                                    value={selectedGradient}
                                                    onValueChange={
                                                        handleGradientChange
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a gradient" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {GRADIENT_PRESETS.filter(
                                                            (p) =>
                                                                p.colors
                                                                    .length > 0,
                                                        ).map((preset) => (
                                                            <SelectItem
                                                                key={
                                                                    preset.name
                                                                }
                                                                value={
                                                                    preset.name
                                                                }
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
                                    {options.gradient &&
                                        options.gradient.length > 0 && (
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between">
                                                    <Label>
                                                        Gradient Angle
                                                    </Label>
                                                    <span className="text-sm text-muted-foreground">
                                                        {options.gradientAngle}°
                                                    </span>
                                                </div>
                                                <Slider
                                                    min={0}
                                                    max={360}
                                                    step={15}
                                                    value={[
                                                        options.gradientAngle,
                                                    ]}
                                                    onValueChange={([value]) =>
                                                        updateOption(
                                                            'gradientAngle',
                                                            value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        )}
                                </AccordionContent>
                            </AccordionItem>

                            {/* Stroke Section */}
                            <AccordionItem value="stroke">
                                <AccordionTrigger className="px-4">
                                    <div className="flex flex-1 items-center justify-between mr-2">
                                        <span>Stroke</span>
                                        <Badge
                                            variant="secondary"
                                            className="font-normal"
                                        >
                                            {options.stroke === 'none' ||
                                            options.stroke === 'transparent'
                                                ? 'None'
                                                : `${options.strokeWidth}px`}
                                        </Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4 space-y-4">
                                    <ColorPicker
                                        label="Stroke Color"
                                        value={options.stroke}
                                        onChange={(value) =>
                                            updateOption('stroke', value)
                                        }
                                        allowTransparent
                                    />

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
                                                updateOption(
                                                    'strokeWidth',
                                                    value,
                                                )
                                            }
                                        />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                {/* Download Button - Always visible */}
                <Button
                    onClick={handleDownload}
                    className="w-full bg-white font-semibold text-primary hover:bg-white/90 shadow-md"
                >
                    <Download className="h-4 w-4" />
                    Download SVG
                </Button>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-2 space-y-3">
                <Card className="relative">
                    {/* Quick Actions Overlay */}
                    <div className="absolute top-2 right-2 z-10">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleDownload}
                                        className="bg-white/80 hover:bg-white/95 text-foreground shadow-sm"
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Download SVG</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
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
                </Card>

                {/* Attribution */}
                <div className="flex justify-center gap-2">
                    <a
                        href="https://x.com/cbnsndwch"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Badge className="flex gap-1 bg-gray-900 hover:bg-gray-800 text-white cursor-pointer">
                            <svg
                                className="h-3 w-3"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            @cbnsndwch
                        </Badge>
                    </a>
                    <a
                        href="https://github.com/cbnsndwch/fractal-svg"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Badge className="flex gap-1 bg-gray-900 hover:bg-gray-800 text-white cursor-pointer">
                            <svg
                                className="h-3 w-3"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            cbnsndwch/fractal-svg
                        </Badge>
                    </a>
                </div>
            </div>
        </div>
    );
}
