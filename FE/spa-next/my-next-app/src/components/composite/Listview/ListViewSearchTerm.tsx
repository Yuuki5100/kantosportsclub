import React, { useState } from "react";
import { Box, DropBox, Font12, IconButtonBase, TextBox, ToggleButton, ToggleButtonGroup } from "@/components/base";
import SearchIcon from "@mui/icons-material/Search";
import type { SelectChangeEvent } from "@/components/base";
import { SearchParams } from "./SearchParams";

type SearchTermProps = {
  searchColumns: string[];
  sortColumns: string[];
  onSearch: (params: SearchParams) => void;
  onSortChange: (params: SearchParams) => void;
};

const SearchTerm: React.FC<SearchTermProps> = ({
  searchColumns,
  sortColumns,
  onSearch,
  onSortChange,
}) => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    searchColumn: searchColumns[0] || "",
    keyword: "",
    sortColumn: sortColumns[0] || "",
    sortOrder: "asc",
  });

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...searchParams, keyword: e.target.value };
    setSearchParams(updated);
  };

  const handleSearchSubmit = () => {
    onSearch(searchParams);
  };

  const handleSearchColumnChange = (e: SelectChangeEvent<string>) => {
    const updated = { ...searchParams, searchColumn: e.target.value };
    setSearchParams(updated);
  };

  const handleSortColumnChange = (e: SelectChangeEvent<string>) => {
    const updated = { ...searchParams, sortColumn: e.target.value };
    setSearchParams(updated);
    onSortChange(updated);
  };

  const handleSortOrderChange = (
    event: React.MouseEvent<HTMLElement>,
    newOrder: "asc" | "desc" | null
  ) => {
    if (newOrder) {
      const updated = { ...searchParams, sortOrder: newOrder };
      setSearchParams(updated);
      onSortChange(updated);
    }
  };

  const searchColumnOptions = searchColumns.map((col) => ({
    value: col,
    label: col,
  }));

  const sortColumnOptions = sortColumns.map((col) => ({
    value: col,
    label: col,
  }));

  return (
    <Box display="flex" flexDirection="row" flexWrap="wrap" gap={2} alignItems="center" sx={{ mb: 2 }}>
      {/* 検索対象カラム */}
      <Box display="flex" flexDirection="column" gap={0.5}>
        <Font12 bold={false}>検索対象</Font12>
        <DropBox
          name="search-column"
          selectedValue={searchParams.searchColumn}
          options={searchColumnOptions}
          onChange={handleSearchColumnChange}
          customStyle={{ minWidth: '140px' }}
        />
      </Box>

      {/* 検索キーワード */}
      <Box display="flex" flexDirection="column" gap={0.5}>
        <Font12 bold={false}>検索キーワード</Font12>
        <TextBox
          name="search-keyword"
          value={searchParams.keyword}
          onChange={handleSearchInputChange}
          customStyle={{ minWidth: '200px' }}
          endAdornment={
            <IconButtonBase aria-label="検索" onClick={handleSearchSubmit} size="small">
              <SearchIcon />
            </IconButtonBase>
          }
        />
      </Box>

      {/* ソートカラム */}
      <Box display="flex" flexDirection="column" gap={0.5}>
        <Font12 bold={false}>並び順</Font12>
        <DropBox
          name="sort-column"
          selectedValue={searchParams.sortColumn}
          options={sortColumnOptions}
          onChange={handleSortColumnChange}
          customStyle={{ minWidth: '140px' }}
        />
      </Box>

      {/* 昇順／降順 */}
      <ToggleButtonGroup
        value={searchParams.sortOrder}
        exclusive
        onChange={handleSortOrderChange}
        size="small"
      >
        <ToggleButton value="asc">昇順</ToggleButton>
        <ToggleButton value="desc">降順</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default SearchTerm;
