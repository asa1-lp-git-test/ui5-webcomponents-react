import { enrichEventWithDetails } from '@ui5/webcomponents-react-base/lib/Utils';
import { ThemingParameters } from '@ui5/webcomponents-react-base/lib/ThemingParameters';
import { useConsolidatedRef } from '@ui5/webcomponents-react-base/lib/useConsolidatedRef';
import { ColumnChartPlaceholder } from '@ui5/webcomponents-react-charts/lib/ColumnChartPlaceholder';
import { useInitialize } from '@ui5/webcomponents-react-charts/lib/initialize';
import { ChartContainer } from '@ui5/webcomponents-react-charts/lib/next/ChartContainer';
import { useLegendItemClick } from '@ui5/webcomponents-react-charts/lib/useLegendItemClick';
import { useResolveDataKeys } from '@ui5/webcomponents-react-charts/lib/useResolveDataKeys';
import React, { FC, forwardRef, Ref, useCallback, useMemo } from 'react';
import {
  Bar as Column,
  BarChart as ColumnChartLib,
  Brush,
  CartesianGrid,
  Legend,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { RechartBaseProps } from '../../interfaces/RechartBaseProps';
import { useDataLabel, useAxisLabel, useSecondaryDimensionLabel } from '../../hooks/useLabelElements';
import { useChartMargin } from '../../hooks/useChartMargin';

type ColumnChartProps = RechartBaseProps;

/**
 * <code>import { ColumnChart } from '@ui5/webcomponents-react-charts/lib/next/ColumnChart';</code>
 * **This component is under active development. The API is not stable yet and might change without further notice.**
 */
const ColumnChart: FC<ColumnChartProps> = forwardRef((props: ColumnChartProps, ref: Ref<any>) => {
  const {
    color,
    loading,
    labelKey = 'name',
    secondaryDimensionKey,
    width = '100%',
    height = '300px',
    dataset,
    dataKeys,
    labels,
    noLegend = false,
    onDataPointClick,
    onLegendClick,
    axisInterval,
    valueFormatter = (el) => el,
    labelFormatter = (el) => el,
    dataLabelCustomElement = undefined,
    chartConfig = {
      margin: {},
      yAxisVisible: false,
      xAxisVisible: true,
      xAxisUnit: '',
      yAxisUnit: '',
      gridStroke: ThemingParameters.sapList_BorderColor,
      gridHorizontal: true,
      gridVertical: false,
      yAxisColor: ThemingParameters.sapList_BorderColor,
      legendPosition: 'top',
      barSize: undefined,
      barGap: 3,
      zoomingTool: false,
      strokeOpacity: 1,
      fillOpacity: 1,
      stacked: false,
      dataLabel: true,
      secondYAxis: {
        dataKey: undefined,
        name: undefined,
        color: undefined
      },
      referenceLine: {
        label: undefined,
        value: undefined,
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

  const currentDataKeys = useResolveDataKeys(dataKeys, labelKey, dataset, secondaryDimensionKey);

  const colorSecondY = useMemo(
    () => (chartConfig.secondYAxis ? currentDataKeys.findIndex((key) => key === chartConfig.secondYAxis.dataKey) : 0),
    [chartConfig, currentDataKeys]
  );

  const onItemLegendClick = useLegendItemClick(onLegendClick);

  const onDataPointClickInternal = useCallback(
    (payload, eventOrIndex, event) => {
      if (payload && onDataPointClick) {
        onDataPointClick(
          enrichEventWithDetails(event, {
            dataKey: Object.keys(payload).filter((key) =>
              payload.value.length
                ? payload[key] === payload.value[1] - payload.value[0]
                : payload[key] === payload.value && key !== 'value'
            )[0],
            value: payload.value.length ? payload.value[1] - payload.value[0] : payload.value,
            xIndex: eventOrIndex,
            payload: payload.payload
          })
        );
      }
    },
    [onDataPointClick]
  );

  const ColumnDataLabel = useDataLabel(
    chartConfig.dataLabel,
    dataLabelCustomElement,
    labelFormatter,
    chartConfig.stacked,
    false,
    false
  );

  const bigDataSet = dataset?.length > 30 ?? false;

  const SecondaryDimensionLabel = useSecondaryDimensionLabel();

  const XAxisLabel = useAxisLabel(valueFormatter, chartConfig.xAxisUnit);

  const marginChart = useChartMargin(
    dataset,
    labelKey,
    labelFormatter,
    chartConfig.margin,
    false,
    secondaryDimensionKey,
    chartConfig.zoomingTool
  );

  return (
    <ChartContainer
      dataset={dataset}
      loading={loading}
      placeholder={ColumnChartPlaceholder}
      width={width}
      height={height}
      ref={chartRef}
      style={style}
      className={className}
      tooltip={tooltip}
      slot={slot}
    >
      <ColumnChartLib margin={marginChart} data={dataset} barGap={chartConfig.barGap}>
        <CartesianGrid
          vertical={chartConfig.gridVertical ?? false}
          horizontal={chartConfig.gridHorizontal}
          stroke={chartConfig.gridStroke ?? ThemingParameters.sapList_BorderColor}
        />
        {(chartConfig.xAxisVisible ?? true) && (
          <XAxis interval={axisInterval ?? bigDataSet ? 2 : 0} tick={XAxisLabel} dataKey={labelKey} xAxisId={0} />
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
          tickFormatter={labelFormatter}
          unit={chartConfig.yAxisUnit}
          axisLine={chartConfig.yAxisVisible ?? false}
          tickLine={false}
          yAxisId={'left'}
          interval={0}
        />
        {chartConfig.secondYAxis && (
          <YAxis
            dataKey={chartConfig.secondYAxis.dataKey}
            stroke={chartConfig.secondYAxis.color ?? `var(--sapUiChartAccent${(colorSecondY % 12) + 1})`}
            label={{ value: chartConfig.secondYAxis.name, angle: +90, position: 'center' }}
            orientation={'right'}
            yAxisId={'right'}
            interval={0}
          />
        )}
        {currentDataKeys.map((key, index) => (
          <Column
            yAxisId={chartConfig.secondYAxis && chartConfig.secondYAxis.dataKey === key ? 'right' : 'left'}
            stackId={chartConfig.stacked ? 'A' : undefined}
            strokeOpacity={chartConfig.strokeOpacity}
            fillOpacity={chartConfig.fillOpacity}
            label={ColumnDataLabel}
            key={key}
            name={labels?.[key] || key}
            dataKey={key}
            fill={color ?? `var(--sapUiChartAccent${(index % 12) + 1})`}
            stroke={color ?? `var(--sapUiChartAccent${(index % 12) + 1})`}
            barSize={chartConfig.barSize}
            onClick={onDataPointClickInternal}
          />
        ))}
        {!noLegend && <Legend verticalAlign={chartConfig.legendPosition ?? 'top'} onClick={onItemLegendClick} />}
        {chartConfig.referenceLine && (
          <ReferenceLine
            stroke={chartConfig.referenceLine.color}
            y={chartConfig.referenceLine.value}
            label={chartConfig.referenceLine.label}
            yAxisId={'left'}
          />
        )}
        <Tooltip cursor={{ fillOpacity: 0.3 }} labelFormatter={valueFormatter} />
        {chartConfig.zoomingTool && (
          <Brush y={1} dataKey={labelKey} stroke={`var(--sapUiChartAccent6)`} travellerWidth={10} height={20} />
        )}
      </ColumnChartLib>
    </ChartContainer>
  );
});

ColumnChart.displayName = 'ColumnChart';

export { ColumnChart };
