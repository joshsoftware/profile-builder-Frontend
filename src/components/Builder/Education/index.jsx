import React, { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { Button, Col, Form, Input, Row, Space, Tabs } from "antd";
import { DndContext, PointerSensor, useSensor } from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext
} from "@dnd-kit/sortable";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetEducationsQuery } from "../../../api/educationApi";
import { useCreateEducationMutation } from "../../../api/educationApi";
import { DraggableTabNode } from "../../../common-components/DraggbleTabs";
import { INVALID_ID_ERROR } from "../../../Constants";
import { validateId } from "../../../utils/dto/constants";
import { ResumeContext } from "../../../utils/ResumeContext";

const Education = () => {
  const [createEducationervice] = useCreateEducationMutation();
  const { initialState, setInitialState } = useContext(ResumeContext);
  const [form] = Form.useForm();
  const [activeKey, setActiveKey] = useState("0");
  const [items, setItems] = useState([
    {
      label: "Education 1",
      children: null,
      key: "0"
    }
  ]);
  const newTabIndex = useRef(1);
  const { profile_id } = useParams();
  const { data } = useGetEducationsQuery(profile_id ?? skipToken);
  const sensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 10
    }
  });

  useEffect(() => {
    if (profile_id && data) {
      setInitialState({ ...initialState, data });
      if (data.length > 0) {
        const tabs = data.map((education, index) => ({
          label: `Education ${index + 1}`,
          children: null,
          key: `${index}`
        }));
        setItems(tabs);
        newTabIndex.current = data.length;
        form.setFieldsValue(
          data.reduce((acc, education, index) => {
            acc[`education_${index}`] = education;
            return acc;
          }, {})
        );
        setActiveKey("0");
      } else {
        setItems([{ label: "Education 1", children: null, key: "0" }]);
        newTabIndex.current = 1;
        form.setFieldsValue({});
      }
    }
  }, [profile_id, data]);

  const onFinish = async (values) => {
    const educations = items.map((item, index) => {
      return {
        degree: values[`education_${index}`]?.degree,
        university_name: values[`education_${index}`]?.university_name,
        place: values[`education_${index}`]?.place,
        percent_or_cgpa: values[`education_${index}`]?.percent_or_cgpa,
        passing_year: values[`education_${index}`]?.passing_year
      };
    });

    setInitialState({
      ...initialState,
      educations
    });

    if (!validateId(profile_id)) {
      toast.error(INVALID_ID_ERROR);
      return;
    }

    try {
      const response = await createEducationervice({
        profile_id: profile_id,
        values: educations
      });
      if (response.data?.message) {
        toast.success(response.data?.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.error_message);
    }
  };

  const onReset = () => {
    form.resetFields();
    setInitialState({
      ...initialState,
      educations: []
    });
  };

  const onChange = (key) => {
    setActiveKey(key);
  };

  const add = () => {
    const newActiveKey = `${newTabIndex.current++}`;
    setItems([
      ...items,
      {
        label: `Education ${newTabIndex.current}`,
        children: null,
        key: newActiveKey
      }
    ]);
  };

  const remove = (targetKey) => {
    const targetIndex = items.findIndex((pane) => pane.key === targetKey);
    const newPanes = items.filter((pane) => pane.key !== targetKey);
    if (newPanes.length && targetKey === activeKey) {
      const { key } =
        newPanes[
          targetIndex === newPanes.length ? targetIndex - 1 : targetIndex
        ];
      setActiveKey(key);
    }
    setItems(newPanes);
  };

  const onEdit = (targetKey, action) => {
    if (action === "add") {
      add();
    } else {
      remove(targetKey);
    }
  };

  const onDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setItems((prev) => {
        const activeIndex = prev.findIndex((i) => i.key === active.id);
        const overIndex = prev.findIndex((i) => i.key === over?.id);
        return arrayMove(prev, activeIndex, overIndex);
      });
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button onClick={add}>Add Education</Button>
      </div>
      <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
        <SortableContext
          items={items.map((i) => i.key)}
          strategy={horizontalListSortingStrategy}
        >
          <Tabs
            hideAdd
            onChange={onChange}
            activeKey={activeKey}
            type="editable-card"
            onEdit={onEdit}
            items={items.map((item, index) => ({
              ...item,
              children: (
                <Form
                  layout="vertical"
                  form={form}
                  name={`education_${item.key}`}
                  onFinish={onFinish}
                  key={item.key}
                >
                  <Form.Item
                    name={[`education_${index}`, "degree"]}
                    label="Degree"
                    rules={[
                      {
                        required: true,
                        message: "Degree required"
                      }
                    ]}
                  >
                    <Input placeholder="Eg. MCS, BTech in CS" />
                  </Form.Item>
                  <Row>
                    <Col span={11}>
                      <Form.Item
                        name={[`education_${index}`, "university_name"]}
                        label="University Name"
                      >
                        <Input placeholder="Eg. Savitribai Phule Pune University" />
                      </Form.Item>
                    </Col>
                    <Col span={11} offset={2}>
                      <Form.Item
                        name={[`education_${index}`, "place"]}
                        label="Place"
                      >
                        <Input placeholder="Eg. Pune" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={11}>
                      <Form.Item
                        name={[`education_${index}`, "percent_or_cgpa"]}
                        label="CGPA/Percentage (%)"
                      >
                        <Input placeholder="9.2 or 92%" />
                      </Form.Item>
                    </Col>
                    <Col span={11} offset={2}>
                      <Form.Item
                        name={[`education_${index}`, "passing_year"]}
                        label="Passout Year"
                      >
                        <Input placeholder="2024" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item>
                    <Space>
                      <Button type="primary" htmlType="submit">
                        Save
                      </Button>
                      <Button htmlType="button" onClick={onReset}>
                        Reset
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              )
            }))}
            renderTabBar={(tabBarProps, DefaultTabBar) => (
              <DefaultTabBar {...tabBarProps}>
                {(node) => (
                  <DraggableTabNode {...node.props} key={node.key}>
                    {node}
                  </DraggableTabNode>
                )}
              </DefaultTabBar>
            )}
          />
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default Education;
