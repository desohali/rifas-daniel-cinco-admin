import React, { useState } from "react";
import { Form, Table, Select, InputNumber, Button, Popconfirm, Typography } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import "./inputsTable.css";


const FormPremiosDinamicos = ({
  titulo = "Premios",
  form,
  optionsPremios = [],
  monedaCarpeta,
  initialValues
}: any) => {

  const [dataSource, setDataSource] = useState<any[]>(initialValues || []);

  React.useEffect(() => {
    setDataSource(initialValues || []);
    form.setFieldsValue({ items: initialValues });
  }, [initialValues]);


  const addRow = () => {
    setDataSource([
      ...dataSource,
      { _id: Date.now(), premio: undefined, cantidad: undefined },
    ]);
  };

  const removeRow = (_id: any) => {
    const newData = dataSource.filter((item) => item._id !== _id);
    setDataSource(newData);

    // Obtener valores actuales del formulario
    const currentItems = form.getFieldValue("items") || [];

    // Filtrar los valores del formulario que correspondan a las filas actuales
    const newItems = currentItems.filter((_: any, index: number) => {
      return dataSource[index]?._id !== _id;
    });

    // Reasignar el array actualizado al formulario
    form.setFieldsValue({ items: newItems });
  };




  const columns: any = [
    {
      title: titulo,
      dataIndex: "premios",
      key: "premios",
      align: "center",
      children: [
        {
          title: "Premio",
          dataIndex: "premio",
          key: "premio",
          render: (_: any, record: any, index: number) => (
            <Form.Item
              label=""
              name={["items", index, "premio"]}
              rules={[{ required: true, message: 'Seleccione premio' }]}
            >
              <Select
                optionFilterProp="label"
                optionLabelProp="label"
                placeholder="Seleccione premio" style={{ width: "100%", minWidth: "200px", margin: "0px" }}>
                {optionsPremios.map((premio: any) => (
                  <Select.Option
                    key={premio._id}
                    value={premio._id}
                    disabled={dataSource.some((item) => item?.premio === premio?._id)}
                    label={premio?.descripcion || premio?.premio}
                  >
                    <div>
                      <span style={{ color: "#888" }}>
                        {monedaCarpeta?.simbolo} {premio?.premio}
                      </span>
                      <p style={{ paddingBottom: "0px", marginBottom: "0px" }}>
                        {premio?.descripcion}
                      </p>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          ),
        },
        {
          title: "Cantidad",
          dataIndex: "cantidad",
          key: "cantidad",
          render: (_: any, record: any, index: number) => (
            <Form.Item
              label=""
              name={["items", index, "cantidad"]}
              rules={[{ required: true, message: 'Seleccione cantidad' }]}
            >
              <InputNumber
                min={0}
                placeholder="Cantidad"
                style={{ width: "100%", margin: "0px" }} />
            </Form.Item>
          ),
        },
        {
          title: "",
          dataIndex: "acciones",
          key: "acciones",
          align: "center" as const,
          render: (_: any, record: any) => {
            return (
              <Button
                type="text"
                icon={<DeleteOutlined style={{ color: "red" }} />}
                onClick={() => removeRow(record?._id)}
              />
            )
          }

        },
      ]
    }
  ];

  return (
    <Form
      form={form}
      autoComplete="off">
      <Table
        bordered
        size="small"
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        rowKey="_id"
        footer={() => (
          <Button
            type="dashed"
            onClick={addRow}
            icon={<PlusOutlined />}
            block
          >
            Agregar premio
          </Button>
        )}
      />
    </Form>
  );
};

export default FormPremiosDinamicos;
