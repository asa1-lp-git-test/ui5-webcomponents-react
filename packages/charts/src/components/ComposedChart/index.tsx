import { enrichEventWithDetails } from '@ui5/webcomponents-react-base/lib/Utils';
import { ThemingParameters } from '@ui5/webcomponents-react-base/lib/ThemingParameters';
import { useConsolidatedRef } from '@ui5/webcomponents-react-base/lib/useConsolidatedRef';
import { useInitialize } from '@ui5/webcomponents-react-charts/lib/initialize';
import { LineChartPlaceholder } from '@ui5/webcomponents-react-charts/lib/LineChartPlaceholder';
import { ChartContainer } from '@ui5/webcomponents-react-charts/lib/next/ChartContainer';
import { useLegendItemClick } from '@ui5/webcomponents-react-charts/lib/useLegendItemClick';
import React, { ComponentType, CSSProperties, FC, forwardRef, Ref, useCallback, useMemo } from 'react';
import {
  Area,
  Bar,
  Brush,
  CartesianGrid,
  ComposedChart as ComposedChartLib,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { RechartBaseProps } from '../../interfaces/RechartBaseProps';
import { useDataLabel, useAxisLabel, useSecondaryDimensionLabel } from '../../hooks/useLabelElements';
import { useChartMargin } from '../../hooks/useChartMargin';

enum ChartTypes {
  line = Line,
  bar = Bar,
  area = Area
}

const BAR_DEFAULT_PADDING = 20;

type AvailableChartTypes = 'line' | 'bar' | 'area' | string;

interface ChartElement {
  color?: CSSProperties['color'];
  dataLabelFormatter?: (d: number) => unknown;
  dataLabelCustomElement?: undefined;
  type: AvailableChartTypes;
  accessor: string;
  stackId?: string;

  [key: string]: unknown | number;
}

export interface ComposedChartProps extends RechartBaseProps {
  placeholder?: ComponentType<unknown>;
  elements?: ChartElement[];
  defaults?: ChartElement;
}

const mergeWithDefaults = (config, defaults) => {
  return {
    ...defaults,
    ...config
  };
};

/**
 * <code>import { ComposedChart } from '@ui5/webcomponents-react-charts/lib/next/ComposedChart';</code>
 * **This component is under active development. The API is not stable yet and might change without further notice.**
 */
const ComposedChart: FC<ComposedChartProps> = forwardRef((props: ComposedChartProps, ref: Ref<any>) => {
  const {
    height = '500px',
    width = '100%',
    loading,
    dataset,
    labelKey = 'name',
    secondaryDimensionKey,
    onDataPointClick,
    noLegend = false,
    labels,
    axisInterval,
    valueFormatter = (el) => el,
    labelFormatter = (el) => el,
    defaults = {
      barSize: undefined,
      barGap: 3,
      lineType: 'monotone',
      xAxisFormatter: (d) => d,
      yAxisFormatter: (d) => d,
      dataLabelCustomElement: undefined,
      label: { position: 'top' },
      stackId: undefined
    },
    elements,
    onLegendClick,
    chartConfig = {
      margin: {},
      xAxisUnit: '',
      yAxisUnit: '',
      yAxisVisible: false,
      xAxisVisible: true,
      gridStroke: ThemingParameters.sapList_BorderColor,
      gridHorizontal: true,
      gridVertical: false,
      yAxisId: '',
      yAxisColor: ThemingParameters.sapList_BorderColor,
      legendPosition: 'top',
      zoomingTool: false,
      dataLabel: true,
      barSize: 20,
      barGap: undefined,
      secondYAxis: {
        name: undefined,
        dataKey: undefined,
        color: undefined
      }
    },
    style,
    className,
    tooltip,
    slot
  } = props;

  useInitialize();

  const chartRef = useConsolidatedRef<any>(ref);

  const onDataPointClickInternal = useCallback(
    (payload, eventOrIndex, event) => {
      if (payload.name && onDataPointClick) {
        onDataPointClick(
          enrichEventWithDetails(event ?? eventOrIndex, {
            value: payload.value.length ? payload.value[1] - payload.value[0] : payload.value,
            xIndex: payload.index ?? eventOrIndex,
            dataKey: payload.value.length
              ? Object.keys(payload).filter((key) =>
                  payload.value.length
                    ? payload[key] === payload.value[1] - payload.value[0]
                    : payload[key] === payload.value && key !== 'value'
                )[0]
              : payload.dataKey ??
                Object.keys(payload).find((key) => payload[key] === payload.value && key !== 'value'),
            payload: payload.payload
          })
        );
      } else {
        onDataPointClick(
          enrichEventWithDetails(event ?? eventOrIndex, {
            value: eventOrIndex.value,
            xIndex: eventOrIndex.index ?? eventOrIndex,
            dataKey:
              eventOrIndex.dataKey ??
              Object.keys(eventOrIndex).find((key) => eventOrIndex[key] === eventOrIndex.value && key !== 'value'),
            payload: eventOrIndex.payload
          })
        );
      }
    },
    [onDataPointClick]
  );

  const onItemLegendClick = useLegendItemClick(onLegendClick);

  const paddingCharts = useMemo(
    () =>
      elements?.reduce((acc, chartElement) => {
        if (chartElement.type === 'bar') {
          // @ts-ignore
          acc += chartElement?.barSize ?? 20;
        }
        return acc;
      }, BAR_DEFAULT_PADDING),
    [elements]
  );

  const ComposedDataLabel = (noSizeCheck) =>
    useDataLabel(
      chartConfig.dataLabel,
      defaults.dataLabelCustomElement,
      labelFormatter,
      defaults.stackId,
      false,
      noSizeCheck
    );

  const XAxisLabel = useAxisLabel(valueFormatter, chartConfig.xAxisUnit);
  const SecondaryDimensionLabel = useSecondaryDimensionLabel();

  const marginChart = useChartMargin(
    dataset,
    labelFormatter,
    labelKey,
    chartConfig.margin,
    false,
    secondaryDimensionKey,
    chartConfig.zoomingTool
  );

  const bigDataSet = dataset?.length > 30 ?? false;

  return (
    <ChartContainer
      ref={chartRef}
      width={width}
      height={height}
      loading={loading}
      dataset={dataset}
      placeholder={LineChartPlaceholder}
      style={style}
      className={className}
      tooltip={tooltip}
      slot={slot}
    >
      <ComposedChartLib margin={marginChart} data={dataset}>
        <CartesianGrid
          vertical={chartConfig.gridVertical ?? false}
          horizontal={chartConfig.gridHorizontal}
          stroke={chartConfig.gridStroke ?? ThemingParameters.sapList_BorderColor}
        />
        {(chartConfig.xAxisVisible ?? true) && (
          <XAxis
            interval={axisInterval ?? bigDataSet ? 2 : 0}
            dataKey={labelKey}
            tick={XAxisLabel}
            padding={{ left: paddingCharts / 2, right: paddingCharts / 2 }}
            xAxisId={0}
          />
        )}
        {secondaryDimensionKey && (
          <XAxis
            interval={0}
            dataKey={secondaryDimensionKey}
            tickLine={false}
            tick={SecondaryDimensionLabel}
            axisLine={false}
            xAxisId={1}
          />
        )}
        <YAxis
          axisLine={chartConfig.yAxisVisible ?? false}
          unit={chartConfig.yAxisUnit}
          tickLine={false}
          yAxisId="left"
          tickFormatter={labelFormatter}
          interval={0}
        />
        {chartConfig.secondYAxis && chartConfig.secondYAxis.dataKey && (
          <YAxis
            unit={chartConfig.yAxisUnit}
            dataKey={chartConfig.secondYAxis.dataKey}
            stroke={chartConfig.secondYAxis.color}
            orientation="right"
            yAxisId="right"
            interval={0}
          />
        )}
        <Tooltip cursor={{ fillOpacity: 0.3 }} labelFormatter={valueFormatter} />
        {!noLegend && <Legend onClick={onItemLegendClick} verticalAlign={chartConfig.legendPosition ?? 'top'} />}
        {elements?.map((config, index) => {
          const { type, accessor, color, lineType, dataLabelCustomElement, ...safeProps } = mergeWithDefaults(
            config,
            defaults
          );
          const ChartElement = (ChartTypes[type] as any) as FC<any>;
          const yAxisId = chartConfig.secondYAxis && chartConfig.secondYAxis.dataKey === accessor ? 'right' : 'left';

          const chartElementProps: any = {};

          switch (config.type) {
            case 'line':
              chartElementProps.stroke = color ?? `var(--sapUiChartAccent${(index % 12) + 1})`;
              chartElementProps.activeDot = {
                onClick: onDataPointClickInternal
              };
              chartElementProps.label = bigDataSet ? false : ComposedDataLabel(true);
              chartElementProps.type = lineType;
              break;
            case 'bar':
              chartElementProps.barSize = chartConfig.barSize ?? defaults.barSize;
              chartElementProps.barGap = chartConfig.barGap ?? defaults.barGap;
              chartElementProps.stackId = config.stackId ?? undefined;
              chartElementProps.fill = color ?? `var(--sapUiChartAccent${(index % 12) + 1})`;
              chartElementProps.onClick = onDataPointClickInternal;
              chartElementProps.label = ComposedDataLabel(false);
              break;
            case 'area':
              chartElementProps.type = 'monotone';
              chartElementProps.fillOpacity = 0.3;
              chartElementProps.fill = color ?? `var(--sapUiChartAccent${(index % 12) + 1})`;
              chartElementProps.onClick = onDataPointClickInternal;
              chartElementProps.label = bigDataSet ? false : ComposedDataLabel(true);
              break;
          }
          return (
            <ChartElement
              key={accessor}
              name={labels?.[accessor] || accessor}
              dataKey={accessor}
              yAxisId={yAxisId}
              {...safeProps}
              {...chartElementProps}
            />
          );
        })}
        {chartConfig.zoomingTool && (
          <Brush y={0} dataKey={labelKey} stroke={`var(--sapUiChartAccent6)`} travellerWidth={10} height={20} />
        )}
      </ComposedChartLib>
    </ChartContainer>
  );
});

ComposedChart.displayName = 'ComposedChart';

export { ComposedChart };
