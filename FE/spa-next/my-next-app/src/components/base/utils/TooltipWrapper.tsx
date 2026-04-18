import React, { CSSProperties } from 'react';
import { Tooltip, TooltipProps } from '@mui/material';

type TooltipWrapperProps = Omit<TooltipProps, 'children'> & {
  /**
   * ツールチップを表示する対象の要素
   */
  children: React.ReactElement;
  /**
   * ツールチップの内容
  */
  title?: React.ReactNode;

  spanStyle?: CSSProperties;
};

/**
 * 任意のコンポーネントにツールチップ（説明）を簡単に付与するためのラッパーコンポーネント
 */
const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  title,
  arrow = true,
  placement = 'top',
  enterDelay = 300,
  spanStyle,
  ...rest
}) => {
  if (!title) {
    return children;
  }

  return (
    <Tooltip
      title={title}
      arrow={arrow}
      placement={placement}
      enterDelay={enterDelay}
      {...rest}
    >
      {/* どのコンポーネントでもツールチップを表示させるため、spanを挟む */}
      <span style={spanStyle}>
        {children}
      </span>
    </Tooltip>
  );
};

export default TooltipWrapper;
