import React from "react";
import { HeaderNav } from "../components/HeaderNav";
import { Text, Container, Row, Col } from "@nextui-org/react";
import { VerifyCertificate } from "../components/VerifyCertificate";

export default function Verify() {
  return (
    <>
      <HeaderNav />
      <Container>
        <Row justify="center" align="center">
          <Col align="center" span={6}>
            <Text
              h1
              size={60}
              css={{
                textGradient: "45deg, $purple600 -20%, $pink600 100%",
              }}
              weight="bold"
            >
              Verify Credit Bureau NFT
            </Text>
          </Col>
        </Row>
        <VerifyCertificate />
      </Container>
    </>
  );
}
