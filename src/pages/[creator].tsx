import { FC, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { Skeleton, Stack, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import { IPage, ICreator } from "src/types";
import { Content, Tabs } from "src/components";
import {
    Donate,
    AboutCreator,
    ManageCreator,
    WithdrawBalance,
    EmbedTab,
} from "src/sections";
import {
    contract,
    pageContractAbi,
    formatBigNumber,
    getCreator,
    payWalletContractAbi,
    formatAddress,
    storageClient,
    imgCIDToUrl,
} from "src/utils";
import { useImmer } from "use-immer";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const { creator } = ctx.query;
    const pageContract = contract(
        String(process.env.NEXT_PUBLIC_MANAGER_CONTRACT),
        pageContractAbi
    );
    const paypage = await pageContract.paypage(creator);
    if (!formatBigNumber(paypage))
        return {
            notFound: true,
        };

    const wallContract = contract(String(paypage), payWalletContractAbi);
    const ipns = await wallContract.ipns();
    const creatorAddress = await wallContract.creator();
    const publicKey = await wallContract.publicKey();
    return {
        props: {
            pageId: creator,
            address: paypage,
            creatorAddress,
            publicKey,
            ipns,
        },
    };
};

interface IPayWall extends IPage {
    pageId: string;
    address: string;
    creatorAddress: string;
    publicKey: string;
    ipns: string;
}
const Page: FC<IPayWall> = ({
    pageId,
    address,
    creatorAddress,
    publicKey,
    ipns,
    authWallet,
}) => {
    const [creator, updateCreator] = useImmer<ICreator>({ address });

    const updateField = (field: keyof ICreator, value: string | number) => {
        updateCreator((draft) => {
            draft[field] = value as never;
        });
    };

    const handlePhoto = () => {
        if (creatorAddress === authWallet.address) {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                    const blob = file.slice(0, file.size, "image/png");
                    const photoImage = new File([blob], "image.jpeg", {
                        type: "image/png",
                    });
                    storageClient.put([photoImage]).then((cid) => {
                        updateField("photoURL", cid);
                    });
                }
            };
            input.click();
        }
    };

    useEffect(() => {
        getCreator(ipns, address, pageId)
            .then(updateCreator)
            .catch(() => {});
    }, []);

    return (
        <>
            <Head>
                <title>Support {pageId} | Unit e</title>
            </Head>
            <Content
                sx={{
                    display: "flex",
                    minHeight: "300px",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#060606",
                }}
            >
                <Typography
                    align="center"
                    onClick={handlePhoto}
                    sx={{
                        cursor:
                            authWallet.address === creatorAddress
                                ? "pointer"
                                : "auto",
                    }}
                >
                    {creator?.photoURL ? (
                        <Image
                            src={imgCIDToUrl(creator.photoURL)}
                            width="150px"
                            height="150px"
                            style={{ borderRadius: "50%", textAlign: "center" }}
                        />
                    ) : (
                        <Skeleton variant="circular" width={150} height={150} />
                    )}
                </Typography>
                {creator?.name ? (
                    <>
                        <Typography
                            align="center"
                            variant="h6"
                            fontWeight="bold"
                            color="secondary"
                        >
                            @{creator.name}
                            <div style={{ fontSize: "small", color: "white" }}>
                                ({formatAddress(creatorAddress)})
                            </div>
                        </Typography>
                        <Typography>{creator?.bio}</Typography>
                    </>
                ) : (
                    <>
                        <Skeleton variant="text" width={150} height={40} />
                        <Skeleton variant="text" width={150} height={15} />
                    </>
                )}
            </Content>
            <Stack justifyContent="center" alignItems="center">
                <Tabs
                    color="secondary"
                    current={1}
                    tabs={[
                        {
                            label: "About",
                            content: <AboutCreator creator={creator} />,
                        },
                        {
                            label: "Donations",
                            content: (
                                <Donate
                                    creator={creator}
                                    authWallet={authWallet}
                                    creatorAddress={creatorAddress}
                                />
                            ),
                        },
                        ...(creatorAddress === authWallet.address
                            ? [
                                  {
                                      label: "\u0489 Manage \u0489",
                                      content: (
                                          <ManageCreator
                                              ipns={ipns}
                                              creator={creator}
                                              publicKey={publicKey}
                                              updateField={updateField}
                                          />
                                      ),
                                  },
                                  {
                                      label: "\u0489 Withdraw \u0489",
                                      content: (
                                          <WithdrawBalance
                                              creator={creator}
                                              authWallet={authWallet}
                                          />
                                      ),
                                  },
                                  {
                                      label: "\u0489 Embed \u0489",
                                      content: <EmbedTab creator={creator} />,
                                  },
                              ]
                            : []),
                    ]}
                />
            </Stack>
        </>
    );
};

Page.displayName = "Creators";

export default Page;
