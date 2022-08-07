import { useEffect, useState } from "react";
import {
  Text,
  Row,
  Col,
  Grid,
  Card,
  Input,
  Loading,
  Image,
  Button,
} from "@nextui-org/react";
import { ethers, AlchemyProvider } from "ethers";
import CreditCertificate from "../artifacts/contracts/CreditCertificate.sol/CreditCertificate.json";
import Swal from "sweetalert2";


export const VerifyCertificate = () => {
  const [address, setAddress] = useState();
  const [loading, setIsLoading] = useState(false);
  const [nftData, setNFTData] = useState();

  async function verifyNft() {
    setIsLoading(true);
    const addressCheck = ethers.utils.isAddress( address )
    if(!address || !addressCheck){
      Swal.fire({
        icon: "error",
        title: "Please Check your address",
      });
      setIsLoading(false);
      return
    }
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
      );
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT,
        CreditCertificate.abi,
        provider
      );
      let data = await contract.getLockData(address);
      if (data.name != "" && data.description != "") {
        setNFTData({
          name: data.name,
          tokenUrI: data.tokenUrI,
          tokenId: data.tokenId.toString(),
          description: data.description,
          amountLocked: data.amount.toString(),
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "No Data for this address",
        });
      }
      setIsLoading(false);
      console.log(nftData);
    } catch (err) {
      setIsLoading(false);
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
      });
      console.log(err.message);
    }
  }

  return (
    <>
      <Row css={{ mt: "40px" }}>
        <Grid.Container justify="center" align="center">
          <Grid justify="center" align="center">
            <Row>
              <Input
                size={"lg"}
                css={{w: '300px'}}
                clearable
                label="Search for Holder Address"
                initialValue="0x00000..."
                onChange={(e) => setAddress(e.target.value)}
              />
            </Row>
            <Row css={{ mt: "10px" }} justify="center" align="center">
              {!loading ? (
                <Button size="sm" onPress={verifyNft}>
                  Verify
                </Button>
              ) : (
                <Button size="sm" disabled>
                  Verifying...
                </Button>
              )}
            </Row>
          </Grid>
        </Grid.Container>
      </Row>
      {nftData ? (
        <Row justify="center" align="center" css={{ m: "40px 0 0 0" }}>
          <Grid.Container justify="center" align="center">
            <Grid xs={12} lg={4} md={6} justify="center" align="center">
              <Card>
                <Card.Header>
                  <Row justify="flex-end">
                    <Col span={12}>
                      <Text h4 justify="center" align="center">
                        Certificate Number #{nftData.tokenId}
                      </Text>
                    </Col>
                  </Row>
                </Card.Header>
                <Card.Body css={{ py: "$2" }}>
                  <Row justify="flex-end">
                    <Col span={12}>
                      <Text color={"secondary"} justify="center" align="center">
                        Certificate of {nftData.name}
                      </Text>
                    </Col>
                  </Row>
                  <Row justify="center">
                    <Col span={12}>
                      <Text justify="center" align="center">
                        {nftData.description}
                      </Text>
                    </Col>
                  </Row>
                  <Image
                    css={{ m: "10px 0 0 0" }}
                    showSkeleton
                    width={320}
                    height={180}
                    maxDelay={10000}
                    src={nftData.tokenUrI}
                    alt="Certificate"
                  />
                </Card.Body>
                <Card.Footer></Card.Footer>
              </Card>
            </Grid>
          </Grid.Container>
        </Row>
      ) : (
        <Row justify="center" align="center" css={{ m: "40px 0 0 0" }}>
          <Grid.Container justify="center" align="center">
            <Grid xs={12} lg={4} md={6} justify="center" align="center">
              <Text>No Data To show</Text>
            </Grid>
          </Grid.Container>
        </Row>
      )}
    </>
  );
};
