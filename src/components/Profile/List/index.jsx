import React, { useRef, useState } from "react";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Button, Input, Space, Skeleton, Table, Tag } from "antd";
import Highlighter from "react-highlight-words";
import { useQuery } from "@tanstack/react-query";
import { get } from "../../../services/axios";
import styles from "./ListProfiles.module.css";

const ListProfiles = () => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const { isFetching, data, error, refetch } = useQuery({
    queryKey: ["data"],
    queryFn: async () => {
      try {
        const response = await get(`/list_profiles`);
        return response.data.profiles;
      } catch (error) {
        return error;
      }
    },
  });

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "20%",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "20%",
      ...getColumnSearchProps("email"),
    },
    {
      title: "Years of Experience",
      dataIndex: "years_of_experience",
      key: "years_of_experience",
      sorter: (a, b) => a.years_of_experience - b.years_of_experience,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Primary Skills",
      key: "primary_skills",
      dataIndex: "primary_skills",
      render: (_, { primary_skills }) => (
        <>
          {primary_skills.map((tag, index) => {
            let color =
              tag.length > Math.floor(Math.random() * 10) + 1
                ? "geekblue"
                : "green";
            if (tag === "python") {
              color = "volcano";
            }
            return (
              <Tag color={color} key={`${tag}-${index}`}>
                {tag.toUpperCase()}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: "Is Current Employee",
      dataIndex: "is_current_employee",
      key: "is_current_employee",
      render: (is_current_employee) => (
        <strong>{is_current_employee === 1 ? "YES" : "NO"}</strong>
      ),
      sorter: (a, b) => a.isCurrentEmployee - b.isCurrentEmployee,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Space size="middle">
          <EditOutlined />
          <DeleteOutlined />
        </Space>
      ),
    },
  ];

  return (
    <>
      {isFetching && <Skeleton active />}
      {error && <p>Failed to fetch list of Profile!</p>}
      {data && !isFetching && (
        <>
          <h1 className={styles.heading}>
            <span>List of Profiles</span>
          </h1>
          <Table
            columns={columns}
            dataSource={data}
            className={styles.table}
            bordered={true}
          />
        </>
      )}
    </>
  );
};

export default ListProfiles;