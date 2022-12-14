import React from "react";
import { HeaderNav } from "../components/HeaderNav";
import { Text, Container, Row, Col } from "@nextui-org/react";
import { GetCertificate } from "../components/GetCertificate";

export default function Home() {
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
              Credit Bureau NFT
            </Text>
          </Col>
        </Row>
        <GetCertificate />
      </Container>
    </>
  );
}
