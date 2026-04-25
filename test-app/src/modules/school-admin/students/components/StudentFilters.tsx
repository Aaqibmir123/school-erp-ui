"use client";

import { Col, Input, Row, Select } from "antd";

type SelectOption = {
  label: string;
  value: string;
};

interface Props {
  classOptions: SelectOption[];
  sectionOptions: SelectOption[];
  selectedClassId: string | null;
  selectedSectionId: string | null;
  search: string;
  onClassChange: (value: string | null) => void;
  onSectionChange: (value: string | null) => void;
  onSearchChange: (value: string) => void;
}

export default function StudentFilters({
  classOptions,
  sectionOptions,
  selectedClassId,
  selectedSectionId,
  search,
  onClassChange,
  onSectionChange,
  onSearchChange,
}: Props) {
  const hasSections = sectionOptions.length > 0;

  return (
    <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
      <Col xs={24} md={7}>
        <Select
          allowClear
          placeholder="Select Class"
          style={{ width: "100%" }}
          options={classOptions}
          value={selectedClassId}
          onChange={(value) => onClassChange(value || null)}
          showSearch
          optionFilterProp="label"
        />
      </Col>

      <Col xs={24} md={7}>
        <Select
          allowClear
          disabled={!selectedClassId || !hasSections}
          placeholder="Select Section (Optional)"
          style={{ width: "100%" }}
          options={sectionOptions}
          value={selectedSectionId}
          onChange={(value) => onSectionChange(value || null)}
          showSearch
          optionFilterProp="label"
        />
      </Col>

      <Col xs={24} md={10}>
        <Input.Search
          allowClear
          placeholder="Search student name or roll number"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </Col>
    </Row>
  );
}
