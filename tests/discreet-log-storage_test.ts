import { Clarinet, Tx, Chain, Account, types, assertEquals, pricePackageToCV, assertStringIncludes } from "./deps.ts";
import type { PricePackage, Block } from "./deps.ts";

//NOTE: the get-block-info-time alway returns u0 so the closing-time is set according to that in the tests

// Unfortunately it is not straightforward to import "../src/stacks-redstone.ts"
// in Clarinet test files. Values are therefore generated by the helper scripts
// found in the ./scripts directory. The parameters used to generate the data
// is provided in comments.

const BTChex = "BTC";
const UUID = "fakeuuid";
const nftAssetContract = "open-dlc";
const contractName = "discreet-log-storage-v3";

const trustedOraclePubkey = "0x035ca791fed34bf9e9d54c0ce4b9626e1382cf13daa46aa58b657389c24a751cc6";
const untrustedOraclePubkey = "0x03cd2cfdbd2ad9332828a7a13ef62cb999e063421c708e863a7ffed71fb61c88c9";

const pricePackage: PricePackage = {
    timestamp: 1647332581,
    prices: [{ symbol: "BTC", value: 2.5 }]
}

const pricePackageWrong: PricePackage = {
    timestamp: 1647332581,
    prices: [{ symbol: "ETH", value: 2.5 }]
}

const packageCV = pricePackageToCV(pricePackage);
const wrongPackageCV = pricePackageToCV(pricePackageWrong);
const signature = "0x4ee83f2bdc6d67619e13c5786c42aa66a899cc63229310400247bac0dd22e99454cec834a98b56a5042bcec5e709a76e90d072569e5db855e58e4381d0adb0c201";
const wrongPackageSingature = "0x5cf7810162047b1dd7f9788259431bc971f3be913c5a7875169f78f3a83b7ed662c068fd55000a37c7fcbb3881b31f59d707a5d33163bb7f4280ba43efb48f5800";

function setTrustedOracle(chain: Chain, senderAddress: string): Block {
    return chain.mineBlock([
        Tx.contractCall(contractName, "set-trusted-oracle", [trustedOraclePubkey, types.bool(true)], senderAddress),
    ]);
}


function hex2ascii(hexx: string) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 2; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

Clarinet.test({
    name: "Contract owner can set trusted oracle",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const block = setTrustedOracle(chain, deployer.address);
        const [receipt] = block.receipts;
        receipt.result.expectOk().expectBool(true);
        const trusted = chain.callReadOnlyFn(contractName, "is-trusted-oracle", [trustedOraclePubkey], deployer.address);
        const untrusted = chain.callReadOnlyFn(contractName, "is-trusted-oracle", [untrustedOraclePubkey], deployer.address);
        trusted.result.expectBool(true);
        untrusted.result.expectBool(false);
    },
});

Clarinet.test({
    name: "create-dlc emits an event",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;

        let block = chain.mineBlock([
            Tx.contractCall(contractName, "create-dlc", [types.buff(BTChex), types.uint(10), types.uint(10)], deployer.address)
        ]);

        block.receipts[0].result.expectOk().expectBool(true);
        const event = block.receipts[0].events[0];

        assertEquals(typeof event, 'object');
        assertEquals(event.type, 'contract_event');
        assertEquals(event.contract_event.topic, "print");
        assertStringIncludes(event.contract_event.value, "asset: 0x425443")
    },
});


Clarinet.test({
    name: "open-new-dlc creates a new dlc and mints an open-dlc nft",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall(contractName, "open-new-dlc", [types.buff(UUID), types.buff(BTChex), types.uint(10), types.uint(10), types.principal(wallet_1.address)], deployer.address),
            Tx.contractCall(contractName, "get-dlc", [types.buff(UUID)], deployer.address)
        ]);

        block.receipts[0].result.expectOk().expectBool(true);
        const event = block.receipts[0].events[0];

        assertEquals(typeof event, 'object');
        assertEquals(event.type, 'nft_mint_event');
        assertEquals(event.nft_mint_event.asset_identifier.split("::")[1], nftAssetContract);
        assertEquals(event.nft_mint_event.recipient.split(".")[1], contractName);

        const dlc: any = block.receipts[1].result.expectSome().expectTuple();

        assertEquals(hex2ascii(dlc.asset), "BTC");
        assertEquals(hex2ascii(dlc.uuid), "fakeuuid");
        assertEquals(dlc["closing-price"], "none");
        assertEquals(dlc.creator, wallet_1.address);
    },
});

Clarinet.test({
    name: "can't add the same DLC twice",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall(contractName, "open-new-dlc", [types.buff(UUID), types.buff(BTChex), types.uint(10), types.uint(10), types.principal(wallet_1.address)], deployer.address),
            Tx.contractCall(contractName, "open-new-dlc", [types.buff(UUID), types.buff(BTChex), types.uint(10), types.uint(10), types.principal(wallet_1.address)], deployer.address)
        ]);

        const err = block.receipts[1].result.expectErr();
        assertEquals(err, "u2002"); // err-dlc-already-added
    },
});

Clarinet.test({
    name: "only contract owner can add DLC",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet_1 = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall(contractName, "open-new-dlc", [types.buff(UUID), types.buff(BTChex), types.uint(10), types.uint(10), types.principal(wallet_1.address)], wallet_1.address),
        ]);

        const err = block.receipts[0].result.expectErr();
        assertEquals(err, "u2001"); // err-unauthorised
    },
});

Clarinet.test({
    name: "close-dlc updates closing-price and actual-closing-time and burns the corresponding nft",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;

        setTrustedOracle(chain, deployer.address);

        let block = chain.mineBlock([
            Tx.contractCall(contractName, "open-new-dlc", [types.buff(UUID), types.buff(BTChex), types.uint(0), types.uint(0), types.principal(wallet_1.address)], deployer.address),
            Tx.contractCall(contractName, "close-dlc", [types.buff(UUID), packageCV.timestamp, packageCV.prices, signature], wallet_1.address),
            Tx.contractCall(contractName, "get-dlc", [types.buff(UUID)], deployer.address)
        ]);

        block.receipts[0].result.expectOk().expectBool(true);
        const mintEvent = block.receipts[0].events[0];

        assertEquals(typeof mintEvent, 'object');
        assertEquals(mintEvent.type, 'nft_mint_event');
        assertEquals(mintEvent.nft_mint_event.asset_identifier.split("::")[1], nftAssetContract);
        assertEquals(mintEvent.nft_mint_event.recipient.split(".")[1], contractName);

        block.receipts[1].result.expectOk().expectBool(true);
        const burnEvent = block.receipts[1].events[0];

        assertEquals(typeof burnEvent, 'object');
        assertEquals(burnEvent.type, 'nft_burn_event');
        assertEquals(burnEvent.nft_burn_event.asset_identifier.split("::")[1], nftAssetContract);
        assertEquals(burnEvent.nft_burn_event.sender.split(".")[1], contractName);

        const dlc: any = block.receipts[2].result.expectSome().expectTuple();
        assertEquals(dlc['closing-price'], "(some u250000000)")
    },
});


Clarinet.test({
    name: "early-close-dlc updates closing-price and actual-closing-time and burns the corresponding nft",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall(contractName, "set-trusted-oracle", [trustedOraclePubkey, types.bool(true)], deployer.address),
            Tx.contractCall(contractName, "open-new-dlc", [types.buff(UUID), types.buff(BTChex), types.uint(5), types.uint(0), types.principal(wallet_1.address)], deployer.address),
            Tx.contractCall(contractName, "early-close-dlc", [types.buff(UUID), packageCV.timestamp, packageCV.prices, signature], wallet_1.address),
            Tx.contractCall(contractName, "get-dlc", [types.buff(UUID)], deployer.address)
        ]);

        block.receipts[0].result.expectOk().expectBool(true);
        const mintEvent: any = block.receipts[1].events[0];

        assertEquals(typeof mintEvent, 'object');
        assertEquals(mintEvent.type, 'nft_mint_event');
        assertEquals(mintEvent.nft_mint_event.asset_identifier.split("::")[1], nftAssetContract);
        assertEquals(mintEvent.nft_mint_event.recipient.split(".")[1], contractName);

        block.receipts[1].result.expectOk().expectBool(true);
        const burnEvent = block.receipts[2].events[0];

        assertEquals(typeof burnEvent, 'object');
        assertEquals(burnEvent.type, 'nft_burn_event');
        assertEquals(burnEvent.nft_burn_event.asset_identifier.split("::")[1], nftAssetContract);
        assertEquals(burnEvent.nft_burn_event.sender.split(".")[1], contractName);

        const dlc: any = block.receipts[3].result.expectSome().expectTuple();
        assertEquals(dlc["closing-price"], "(some u250000000)")
    },
});

Clarinet.test({
    name: "can't close a dlc with wrong asset submitted",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;

        setTrustedOracle(chain, deployer.address);

        let block = chain.mineBlock([
            Tx.contractCall(contractName, "open-new-dlc", [types.buff(UUID), types.buff(BTChex), types.uint(0), types.uint(0), types.principal(wallet_1.address)], deployer.address),
            Tx.contractCall(contractName, "close-dlc", [types.buff(UUID), wrongPackageCV.timestamp, wrongPackageCV.prices, wrongPackageSingature], wallet_1.address),
        ]);

        const err = block.receipts[1].result.expectErr();
        assertEquals(err, "u2008"); // err-already-closed
    },
});

Clarinet.test({
    name: "can't early close a dlc with wrong asset submitted",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;

        setTrustedOracle(chain, deployer.address);

        let block = chain.mineBlock([
            Tx.contractCall(contractName, "open-new-dlc", [types.buff(UUID), types.buff(BTChex), types.uint(0), types.uint(5), types.principal(wallet_1.address)], deployer.address),
            Tx.contractCall(contractName, "early-close-dlc", [types.buff(UUID), wrongPackageCV.timestamp, wrongPackageCV.prices, wrongPackageSingature], wallet_1.address),
        ]);

        const err = block.receipts[1].result.expectErr();
        assertEquals(err, "u2008"); // err-already-closed
    },
});

Clarinet.test({
    name: "can't close a dlc twice",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;

        setTrustedOracle(chain, deployer.address);

        let block = chain.mineBlock([
            Tx.contractCall(contractName, "open-new-dlc", [types.buff(UUID), types.buff(BTChex), types.uint(0), types.uint(0), types.principal(wallet_1.address)], deployer.address),
            Tx.contractCall(contractName, "close-dlc", [types.buff(UUID), packageCV.timestamp, packageCV.prices, signature], wallet_1.address),
            Tx.contractCall(contractName, "close-dlc", [types.buff(UUID), packageCV.timestamp, packageCV.prices, signature], wallet_1.address),
        ]);

        const err = block.receipts[2].result.expectErr();
        assertEquals(err, "u2005"); // err-already-closed
    },
});

Clarinet.test({
    name: "can't early close a dlc twice",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall(contractName, "set-trusted-oracle", [trustedOraclePubkey, types.bool(true)], deployer.address),
            Tx.contractCall(contractName, "open-new-dlc", [types.buff(UUID), types.buff(BTChex), types.uint(5), types.uint(0), types.principal(wallet_1.address)], deployer.address),
            Tx.contractCall(contractName, "early-close-dlc", [types.buff(UUID), packageCV.timestamp, packageCV.prices, signature], wallet_1.address),
            Tx.contractCall(contractName, "early-close-dlc", [types.buff(UUID), packageCV.timestamp, packageCV.prices, signature], wallet_1.address),
        ]);

        const err = block.receipts[3].result.expectErr();
        assertEquals(err, "u2005"); // err-already-closed
    },
});

Clarinet.test({
    name: "only authorized wallets can close dlc",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;
        const wallet_2 = accounts.get('wallet_2')!;

        setTrustedOracle(chain, deployer.address);

        let block = chain.mineBlock([
            Tx.contractCall(contractName, "open-new-dlc", [types.buff(UUID), types.buff(BTChex), types.uint(0), types.uint(0), types.principal(wallet_1.address)], deployer.address),
            Tx.contractCall(contractName, "close-dlc", [types.buff(UUID), packageCV.timestamp, packageCV.prices, signature], wallet_2.address),
        ]);

        const err = block.receipts[1].result.expectErr();
        assertEquals(err, "u2001"); // err-already-closed
    },
});

Clarinet.test({
    name: "only authorized wallets can eraly close dlc",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;
        const wallet_2 = accounts.get('wallet_2')!;

        let block = chain.mineBlock([
            Tx.contractCall(contractName, "set-trusted-oracle", [trustedOraclePubkey, types.bool(true)], deployer.address),
            Tx.contractCall(contractName, "open-new-dlc", [types.buff(UUID), types.buff(BTChex), types.uint(5), types.uint(0), types.principal(wallet_1.address)], deployer.address),
            Tx.contractCall(contractName, "early-close-dlc", [types.buff(UUID), packageCV.timestamp, packageCV.prices, signature], wallet_2.address),
        ]);

        const err = block.receipts[2].result.expectErr();
        assertEquals(err, "u2001"); // err-already-closed
    },
});

Clarinet.test({
    name: "get-dlc-closing-price-and-time throws u2007 of not closed",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;
        const wallet_2 = accounts.get('wallet_2')!;

        let block = chain.mineBlock([
            Tx.contractCall(contractName, "open-new-dlc", [types.buff(UUID), types.buff(BTChex), types.uint(5), types.uint(0), types.principal(wallet_1.address)], deployer.address),
            Tx.contractCall(contractName, "get-dlc-closing-price-and-time", [types.buff(UUID)], wallet_2.address),
        ]);

        const err = block.receipts[1].result.expectErr();
        assertEquals(err, "u2007"); // err-already-closed
    },
});

Clarinet.test({
    name: "get-dlc-closing-price-and-time returns correct closing-price for closed DLC",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;

        setTrustedOracle(chain, deployer.address);

        let block = chain.mineBlock([
            Tx.contractCall(contractName, "open-new-dlc", [types.buff(UUID), types.buff(BTChex), types.uint(0), types.uint(0), types.principal(wallet_1.address)], deployer.address),
            Tx.contractCall(contractName, "close-dlc", [types.buff(UUID), packageCV.timestamp, packageCV.prices, signature], wallet_1.address),
            Tx.contractCall(contractName, "get-dlc-closing-price-and-time", [types.buff(UUID)], wallet_1.address),
        ]);

        const partialDLC: any = block.receipts[2].result.expectOk().expectTuple();
        assertEquals(partialDLC["closing-price"], "(some u250000000)");
        assertEquals(partialDLC["closing-time"], "u0")
    },
});
