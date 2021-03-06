import { ThemingParameters } from '@ui5/webcomponents-react-base/lib/ThemingParameters';
import React from 'react';
import ContentLoader from 'react-content-loader';

export const PieChartPlaceholder = (props) => {
  return (
    <ContentLoader
      height={150}
      width={150}
      speed={2}
      backgroundColor={ThemingParameters.sapContent_ImagePlaceholderBackground}
      foregroundColor={ThemingParameters.sapContent_ImagePlaceholderForegroundColor}
      backgroundOpacity={ThemingParameters.sapContent_DisabledOpacity as any}
      {...props}
    >
      <circle cy="75" cx="85" r="60" />
    </ContentLoader>
  );
};
