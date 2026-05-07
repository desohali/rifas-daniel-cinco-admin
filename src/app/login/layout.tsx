import { Col, Row } from 'antd'
import Image from 'next/image'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Row gutter={0}>
      <Col xs={24} sm={24} md={24} lg={12} xl={8} xxl={6}>
        {children}
      </Col>
      <Col xs={24} sm={24} md={24} lg={12} xl={16} xxl={18}>
        <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
          <Image
            style={{ objectFit: 'cover' }}
            fill
            priority
            src="/Leonardo_2.jpg"
            alt="Logo"
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={100}
          />
        </div>
      </Col>
    </Row>
  )
}

export default layout;