import { useEffect, useState } from "react";
import {
  Text,
  Row,
  Button,
  Modal,
  Input,
  Loading,
  Grid,
  Card,
  Col,
  Image,
  Spacer,
  Link,
} from "@nextui-org/react";
import { ethers } from "ethers";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import CreditCertificate from "../artifacts/contracts/CreditCertificate.sol/CreditCertificate.json";
import Swal from "sweetalert2";
import { useRouter } from "next/router";


export const GetCertificate = () => {
  const [name, setName] = useState("");
  const router = useRouter();
  const [maticAmount, setMaticAmount] = useState();
  const [visible, setVisible] = useState(false);
  const [loading, setIsLoading] = useState();
  const [nftData, setNFTData] = useState();
  const { address, isConnected } = useAccount();

  const handler = () => setVisible(true);

  const closeHandler = () => {
    setVisible(false);
  };

  async function checkForCertificate() {
    if (isConnected && address) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_CONTRACT,
          CreditCertificate.abi,
          provider
        );
        let data = await contract.getLockData(address);
        console.log(data);
        setNFTData({
          name: data.name,
          tokenUrI: data.tokenUrI,
          tokenId: data.tokenId.toString(),
          description: data.description,
          amountLocked: data.amount.toString(),
        });
        console.log(nftData);
      } catch (err) {
        console.log(err.message);
      }
    } else {
      setNFTData();
    }
  }

  useEffect(() => {
    checkForCertificate();
  }, [isConnected, address]);

  const unLockFunds = async () => {
    setIsLoading(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT,
      CreditCertificate.abi,
      signer
    );
    try {
      const tx = await contract.unLock(address);
      await tx.wait();
      console.log(tx);
      setIsLoading(false);
      closeHandler();
      Swal.fire({
        icon: "success",
        title: "MATIC's unlock successfully",
        html: `<a href="https://rinkeby.etherscan.io/tx/${tx.hash}">View on explorer</a>`,
      }).then(router.push('/'));
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.log(err.message);
      Swal.fire({
        icon: "error",
        title: "Something Went Wrong",
      });
    }
  };

  const createCertificate = async () => {
    setIsLoading(true);
    const fullName = name;
    const amount = ethers.utils.parseUnits(maticAmount, "ether");
    const description = `This is certificate issued for ${fullName} for stacking ${maticAmount} MATIC in credit bureau`;
    const tokenUri = "https://ipfs.io/ipfs/bafkreieokh3pwl6h2ydnjv3a2cl7aqxed5gfxp6mto74i4p53xminikfyu";
    if (maticAmount < 1) {
      setIsLoading(false);
      alert("Amount should be greater than 1");
      return;
    }
    if (!fullName || !maticAmount) {
      setIsLoading(false);
      alert("Please fill all the input values");
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT,
      CreditCertificate.abi,
      signer
    );

    try {
      const tx = await contract.lockFunds(
        amount,
        tokenUri,
        fullName,
        description,
        {
          value: amount,
        }
      );
      await tx.wait();
      console.log(tx);
      setIsLoading(false);
      closeHandler();
      Swal.fire({
        icon: "success",
        title: "Certificate generate successfully",
        html: `<a href="https://rinkeby.etherscan.io/tx/${tx.hash}">View on explorer</a>`,
      }).then(router.push('/'));
    } catch (err) {
      console.log(err.message);
      setIsLoading(false);
      closeHandler();
      Swal.fire({
        icon: "error",
        title: "Something Went Wrong",
      });
    }
  };

  return (
    <>
      {nftData && nftData.name !== "" ? (
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
                    width={500}
                    height={300}
                    maxDelay={10000}
                    src={nftData.tokenUrI}
                    alt="Certificate"
                  />
                </Card.Body>
                <Card.Footer>
                  <Row
                    justify="center"
                    align="center"
                    css={{ m: "40px 0 0 0" }}
                  >
                    {!loading ? (
                      <Button onClick={unLockFunds}>UnLock Funds</Button>
                    ) : (
                      <Button disabled>UnLocking...</Button>
                    )}
                  </Row>
                </Card.Footer>
              </Card>
            </Grid>
          </Grid.Container>
        </Row>
      ) : (
        <>
          <Row justify="center" align="center" css={{ m: "40px 0 0 0" }}>
            <Text>
              Lock MATIC to get certificate {"(Only one certificate allowed)"}
            </Text>
          </Row>
          <Row justify="center" align="center" css={{ m: "10px 0 0 0" }}>
            {isConnected && address ? (
              <>
                <Button onClick={handler}>Get Certificate</Button>
              </>
            ) : (
              <>
                <Button disabled>Connect Wallet</Button>
              </>
            )}
          </Row>
        </>
      )}
      <Spacer y={1} />
      <Row justify="center" align="center" css={{ m: "10px 0 0 0" }}>
        <Text>Or</Text>
      </Row>
      <Row justify="center" align="center" css={{ m: "10px 0 0 0" }}>
        <Text>
          <Button onPress={() => router.push("/verify")}>
            Verify Certificate
          </Button>
        </Text>
      </Row>

      <Modal
        closeButton
        aria-labelledby="modal-title"
        open={visible}
        onClose={closeHandler}
      >
        <Modal.Header>
          <Text id="modal-title" size={18}>
            Lock&nbsp;
            <Text b size={18}>
              MATIC
            </Text>
          </Text>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <Loading
              type="points-opacity"
              loadingCss={{ $$loadingSize: "50px" }}
            />
          ) : (
            <>
              <Input
                clearable
                bordered
                fullWidth
                color="primary"
                size="lg"
                placeholder="Your Full Name"
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                clearable
                bordered
                fullWidth
                color="primary"
                size="lg"
                type="number" 
                min="100"
                placeholder="Amount In Matic"
                onChange={(e) => setMaticAmount(e.target.value)}
              />
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {loading ? (
            " "
          ) : (
            <>
              <Button auto flat color="error" onClick={closeHandler}>
                Close
              </Button>
              <Button auto color="success" onClick={createCertificate}>
                Lock
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};
