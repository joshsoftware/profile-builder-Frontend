import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Form, Input, Space, Tabs } from "antd";
import { DndContext, PointerSensor, useSensor } from "@dnd-kit/core";
import { arrayMove, horizontalListSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useGetAchievementsQuery } from "../../../api/achievementApi";
import { post } from "../../../services/axios";
import { ResumeContext } from "../../../utils/ResumeContext";

const DraggableTabNode = ({ ...props }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: props["data-node-key"],
  });
  const style = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    cursor: "move",
  };
  return React.cloneElement(props.children, {
    ref: setNodeRef,
    style,
    ...attributes,
    ...listeners,
  });
};

const Achievement = () => {
  const { initialState, setInitialState } = useContext(ResumeContext);
  const [form] = Form.useForm();
  const [activeKey, setActiveKey] = useState("0");
  const [items, setItems] = useState([{ label: "Achievement 1", children: null, key: "0" }]);
  const newTabIndex = useRef(1);
  const { id } = useParams();
  const { data } = useGetAchievementsQuery(id);
  const sensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } });

  useEffect(() => {
    if (id && data) {
      setInitialState({ ...initialState, data });
      if (data.length > 0) {
        const tabs = data.map((achievement, index) => ({
          label: `Achievement ${index + 1}`,
          children: null,
          key: `${index}`,
        }));
        setItems(tabs);
        newTabIndex.current = data.length;
        form.setFieldsValue(
          data.reduce((acc, achievement, index) => {
            acc[`achievement_${index}`] = {
              name: achievement.name,
              description: achievement.description,
            };
            return acc;
          }, {})
        );
        setActiveKey("0");
      } else {
        resetItems();
      }
    }
  }, [id, data]);

  const resetItems = () => {
    setItems([{ label: "Achievement 1", children: null, key: "0" }]);
    newTabIndex.current = 1;
    form.resetFields();
  };

  const onFinish = (values) => {
    const achievements = items.map((item, index) => ({
      name: values[`achievement_${index}`]?.name,
      description: values[`achievement_${index}`]?.description,
    }));

    setInitialState({ ...initialState, achievements });
    post(`/api/profiles/${id}/achievements`, { achievements });
  };

  const onReset = () => {
    form.resetFields();
    setInitialState({ ...initialState, achievements: [] });
  };

  const onChange = (key) => {
    setActiveKey(key);
  };

  const add = () => {
    const newActiveKey = `${newTabIndex.current++}`;
    setItems([...items, { label: `Achievement ${newTabIndex.current}`, children: null, key: newActiveKey }]);
    setActiveKey(newActiveKey);
  };

  const remove = (targetKey) => {
    const newItems = items.filter((item) => item.key !== targetKey);
    setItems(newItems);
    if (newItems.length && targetKey === activeKey) {
      setActiveKey(newItems[0].key);
    }
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
        <Button onClick={add}>Add Achievement</Button>
      </div>
      <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((i) => i.key)} strategy={horizontalListSortingStrategy}>
          <Tabs
            hideAdd
            onChange={onChange}
            activeKey={activeKey}
            type="editable-card"
            onEdit={onEdit}
            items={items.map((item, index) => ({
              ...item,
              children: (
                <Form layout="vertical" form={form} name={`achievement_${item.key}`} onFinish={onFinish} key={item.key}>
                  <Form.Item
                    name={[`achievement_${index}`, "name"]}
                    label="Achievement Name"
                    rules={[{ required: true, message: "Name required" }]}
                  >
                    <Input placeholder="Achievement name eg. star performer" />
                  </Form.Item>
                  <Form.Item name={[`achievement_${index}`, "description"]} label="Description">
                    <Input.TextArea
                      placeholder="Please provide a basic overview of the above achievement"
                      showCount
                      maxLength={300}
                    />
                  </Form.Item>
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
              ),
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

export default Achievement;
