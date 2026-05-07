import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Switch, Button, message, Checkbox } from "antd";
import { Image } from 'antd';
import {
  SaveOutlined,
} from '@ant-design/icons';

export default function ModalActualizarPremio({ open, onCancel, initialValues = null, onFinish }: any) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [sumarPremio, setSumarPremio] = useState(initialValues?.sumarPremio || true);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        descripcion: initialValues.descripcion || "",
        premio: initialValues.premio ?? 0,
        sumarPremio: !!initialValues.sumarPremio,
      });
      setSumarPremio(!!initialValues.sumarPremio);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);



  return (
    <Modal
      title={initialValues ? "Editar premio" : "Nuevo premio"}
      open={open}
      onCancel={() => onCancel && onCancel()}
      width={425}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={async (values) => {
          setLoading(true);
          await onFinish(values);
          setLoading(false);
        }}
        initialValues={{ premio: 0, sumarPremio: true }}
      >
        <div style={{ textAlign: "center", margin: "auto" }}>
          <Image
            width="25%"
            height="25%"
            src={initialValues?.urlFB}
          />
        </div>

        <Form.Item
          name="sumarPremio"
          valuePropName="checked"
        >
          <Checkbox onChange={(e) => {
            setSumarPremio(e.target.checked);
          }}>Sumar premio</Checkbox>
        </Form.Item>
        <Form.Item label="Descripción" name="descripcion" rules={[{ required: !sumarPremio ? true : false, message: "Ingrese la descripción" }]}>
          <Input placeholder="Descripción del premio" />
        </Form.Item>

        <Form.Item label="Valor del premio" name="premio" rules={[{ required: sumarPremio ? true : false, message: "Ingrese el valor del premio" }]}>
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>

        <Form.Item>
          <div style={{ textAlign: "center", margin: "auto" }}>
            <Button icon={<SaveOutlined />} type="primary" htmlType="submit" loading={loading}>
              Actualizar
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}