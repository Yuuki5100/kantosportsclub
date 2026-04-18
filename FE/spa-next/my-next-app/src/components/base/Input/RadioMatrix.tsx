import { OptionInfo } from '@/components/base/Input/OptionInfo';
import { Box, Paper, Radio, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import React from 'react';

// RadioMatrixのプロパティ
export type RadioMatrixProps = {
  /**
   * 選択肢の定義配列
   */
  options: OptionInfo[];

  /**
   * 現在選択されている値のID
   */
  selectedValue?: string;

  /**
   * フォントサイズ
   */
  fontSize?: string;

  /**
   * 値が変更されたときに呼び出されるコールバック関数
   * 選択された選択肢IDが渡されます
   */
  onChange?: (optionId: string) => void;
};

/**
 * シンプルな1行ラジオボタン選択コンポーネント
 * 各選択肢は個別に無効化が可能
 */
const RadioMatrix: React.FC<RadioMatrixProps> = ({
  options,
  selectedValue,
  fontSize = '0.875rem', // デフォルトのフォントサイズ
  onChange,
}) => {
  // 値変更時のハンドラー
  const handleChange = (optionId: string) => {
    // 親コンポーネントに変更を通知
    if (onChange) {
      onChange(optionId);
    }
  };

  return (
    <Box sx={{ mb: 0, mt: 0 }}>
      <TableContainer
        component={Paper}
        sx={{
          overflow: 'hidden', // 両方向のスクロールを非表示
          width: '100%',
          maxWidth: '100%',
          height: 'auto',
          boxSizing: 'border-box',
          padding: '0 8px', // コンテナ自体の左右パディング
          margin: 0,
          boxShadow: 'none', // シャドウを削除して平面的なデザインに
          border: 'none', // ボーダーを削除
          backgroundColor: 'transparent', // 背景を透明に
        }}
      >
        <Table
          size="small"
          sx={{
            tableLayout: 'fixed',
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
          }}
        >
          <TableBody>
            <TableRow
              sx={{
                height: '40px',
                margin: 0,
              }}
            >
              {options.map((option) => {
                const isSelected = selectedValue === option.value;

                return (
                  <TableCell
                    key={option.value}
                    align="center"
                    sx={{
                      width: `${100 / options.length}%`,
                      padding: '0 8px',
                      borderBottom: 'none',
                      height: '40px',
                      maxHeight: '40px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <Box
                      role="radio"
                      aria-checked={isSelected}
                      aria-disabled={option.disabled}
                      tabIndex={option.disabled ? -1 : 0}
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        opacity: option.disabled ? 0.7 : 1,
                        padding: '4px 16px',
                        cursor: option.disabled ? 'not-allowed' : 'pointer',
                        width: '100%',
                        height: '100%',
                        boxSizing: 'border-box',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                        border: isSelected ? '2px solid #0066cc' : '1px solid #e0e0e0',
                        ...(isSelected
                          ? {
                              backgroundColor: option.disabled ? '#a0a0a0' : '#2196f3',
                              color: 'white',
                              fontWeight: 'bold',
                              borderRadius: '4px',
                            }
                          : {}),
                        ...(option.disabled && !isSelected
                          ? {
                              backgroundColor: '#f0f0f0',
                              color: '#a0a0a0',
                            }
                          : {}),
                        '&:hover': {
                          ...(!option.disabled && !isSelected
                            ? {
                                backgroundColor: '#f5f5f5',
                              }
                            : {}),
                        },
                      }}
                      onClick={() => {
                        if (!option.disabled) {
                          handleChange(option.value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (!option.disabled && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          handleChange(option.value);
                        }
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          width: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          boxSizing: 'border-box',
                          fontSize: fontSize,
                        }}
                      >
                        {option.label}
                      </Box>
                      {/* ラジオボタンを非表示にし、クリック領域はBox全体に */}
                      <Radio
                        checked={isSelected}
                        value={option.value}
                        disabled={option.disabled}
                        sx={{ display: 'none' }}
                      />
                    </Box>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RadioMatrix;
