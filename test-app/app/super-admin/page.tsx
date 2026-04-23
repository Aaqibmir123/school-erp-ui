"use client"

import { Card, Row, Col } from "antd"

export default function AdminDashboard() {

  return (

    <Row gutter={16}>

      <Col span={8}>
        <Card variant="borderless" title="Total Schools">
          12
        </Card>
      </Col>

      <Col span={8}>
        <Card variant="borderless" title="Pending Requests">
          3
        </Card>
      </Col>

      <Col span={8}>
        <Card variant="borderless" title="Active Schools">
          9
        </Card>
      </Col>

    </Row>

  )

}
