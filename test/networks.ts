/**
 * @prettier
 */
/* global describe, it */
import * as assert from 'assert';
import { coins, networks } from '../src';
import { Network } from '../src/networkTypes';

describe('networks', function () {
  // Ideally, all properties for all coins should be distinct.
  // However, there are some exceptions and some networks share the same properties.

  // Here we define some groups of networks that are allowed to share properties.
  const bitcoinSharedMessagePrefix = (network) =>
    coins.isBitcoin(network) || coins.isBitcoinCash(network) || coins.isBitcoinSV(network);

  const bitcoinMainnetSharedPubkeyPrefix = (network) =>
    coins.isMainnet(network) &&
    (coins.isBitcoin(network) || coins.isBitcoinCash(network) || coins.isBitcoinSV(network));

  const verusSharedMessagePrefix = (network) =>
    coins.isVerus(network) ||
    coins.isPBaaS(network)

  const verusSharedScriptPrefix = (network) =>
    coins.isVerus(network) ||
    coins.isPBaaS(network) ||
    coins.isKomodo(network)

  const verusSharedPubkeyPrefix = (network) =>
    coins.isPBaaS(network) ||
    coins.isKomodo(network)

  const dogeSharedPubkeyPrefix = (network) =>
    coins.isDigibyte(network) ||
    coins.isDoge(network)

  const verusSharedWIFPrefix = (network) =>
    coins.isPBaaS(network) ||
    coins.isVerus(network) ||
    coins.isKomodo(network)

  const hasDogeBip32 = (network) =>
    network.bip32.public === networks.doge.bip32.public &&
    network.bip32.private === networks.doge.bip32.private

  const bitcoinMainnetSharedScriptPrefix = (network) =>
  coins.isMainnet(network) &&
  (
    coins.isBitcoin(network) ||
    coins.isBitcoinCash(network) ||
    coins.isBitcoinSV(network) ||
    coins.isDigibyte(network)
  )

  const bitcoinTestnetSharedPubkeyPrefix = (network) =>
    coins.isTestnet(network) &&
    (coins.isBitcoin(network) ||
      coins.isBitcoinCash(network) ||
      coins.isBitcoinSV(network) ||
      coins.isBitcoinGold(network) ||
      coins.isLitecoin(network));

  const bitcoinTestnetSharedScriptPrefix = (network) =>
    bitcoinTestnetSharedPubkeyPrefix(network) && !coins.isLitecoin(network);

  const bitcoinMainnetSharedWIFPrefix = (network) =>
    coins.isMainnet(network) &&
    (coins.isBitcoin(network) ||
      coins.isBitcoinCash(network) ||
      coins.isBitcoinGold(network) ||
      coins.isBitcoinSV(network) ||
      coins.isZcash(network) ||
      coins.isDigibyte(network)
    )

  const bitcoinTestnetSharedWIFPrefix = (network) =>
    coins.isTestnet(network) &&
    (
      coins.isBitcoin(network) ||
      coins.isBitcoinCash(network) ||
      coins.isBitcoinGold(network) ||
      coins.isBitcoinSV(network) ||
      coins.isZcash(network) ||
      coins.isDash(network) ||
      coins.isLitecoin(network) ||
      coins.isDigibyte(network)
    )

  const bech32Coins = (network) =>
    coins.isBitcoin(network) ||
    coins.isBitcoinGold(network) ||
    coins.isPBaaS(network) ||
    coins.isKomodo(network) ||
    coins.isLitecoin(network)

  const bip32PBaaSCompatible = (network) =>
    coins.isPBaaS(network) ||
    coins.isVerus(network) ||
    coins.isKomodo(network)

  const sameGroup = (group, network, otherNetwork) =>
    group(network) && group(otherNetwork)

  describe('getNetworkList()', function () {
    it('mainnets are sorted alphabetically', function () {
      const mainnets = coins.getNetworkList().filter(coins.isMainnet);
      const sortedMainnets = [...mainnets].sort((a, b) =>
        coins.getNetworkName(a).localeCompare(coins.getNetworkName(b))
      );
      assert.deepStrictEqual(mainnets, sortedMainnets);
    });

    it('testnet(s) follow mainnets', function () {
      const list = coins.getNetworkList();
      while (list.length > 0) {
        // first element is a mainnet
        const mainnet = list.shift();
        assert.strictEqual(coins.isMainnet(mainnet), true);

        // subsequent entries are testnets
        while (list.length > 0 && coins.isTestnet(list[0])) {
          assert.strictEqual(coins.getMainnet(list[0]), mainnet);
          list.shift();
        }
      }
    });
  });

  for (const name in networks) {
    const network: Network = networks[name];

    describe(`networks.${name}`, function () {
      it('is valid network', function () {
        assert(coins.isValidNetwork(network));
      });

      it('getNetworkName() returns network name', function () {
        assert.strictEqual(name, coins.getNetworkName(network));
      });

      it('has corresponding testnet/mainnet', function () {
        if (coins.isMainnet(network)) {
          assert.strictEqual(coins.isTestnet(network), false);
          assert.strictEqual(coins.getMainnet(network), network);
          assert.strictEqual(typeof coins.getTestnet(network), 'object');
        } else {
          assert.strictEqual(coins.isMainnet(network), false);
          assert.strictEqual(coins.getTestnet(network), network);
          assert.notStrictEqual(coins.getMainnet(network), network);
          assert.strictEqual(typeof coins.getMainnet(network), 'object');
        }
      });

      it('has expected properties', function () {
        assert.strictEqual(typeof network, 'object');
        assert.strictEqual(typeof network.messagePrefix, 'string');
        assert.strictEqual(typeof network.bech32, bech32Coins(network) ? 'string' : 'undefined');
        assert.strictEqual(typeof network.bip32, 'object');
        assert.strictEqual(typeof network.pubKeyHash, 'number');
        assert.strictEqual(typeof network.scriptHash, 'number');
        assert.strictEqual(typeof network.wif, 'number');
        assert.strictEqual(typeof network.coin, 'string');

        if (bip32PBaaSCompatible(network)) {
          assert.strictEqual(network.bip32.public, networks.bitcoin.bip32.public)
          assert.strictEqual(network.bip32.private, networks.bitcoin.bip32.private)
        } else if (coins.isDoge(network)) {
          assert.strictEqual(hasDogeBip32(network), true)
        } else if (coins.isMainnet(network)) {
          assert.strictEqual(network.bip32.public, networks.bitcoin.bip32.public)
          assert.strictEqual(network.bip32.private, networks.bitcoin.bip32.private)
        } else {
          assert.strictEqual(network.bip32.public, networks.testnet.bip32.public);
          assert.strictEqual(network.bip32.private, networks.testnet.bip32.private);
        }
      });

      for (const otherName in networks) {
        const otherNetwork = networks[otherName];

        it('isSameCoin() returns true testnet/mainnet variants', function () {
          assert.strictEqual(
            coins.isSameCoin(network, otherNetwork),
            otherNetwork === coins.getMainnet(network) || otherNetwork === coins.getTestnet(network)
          );

          assert.strictEqual(name === otherName, network === otherNetwork);
        });

        if (network === otherNetwork) {
          continue;
        }

        it(`has distinct properties with ${otherName}`, function () {
          assert.strictEqual(
            (network.messagePrefix === otherNetwork.messagePrefix),
            coins.isSameCoin(network, otherNetwork) ||
            sameGroup(bitcoinSharedMessagePrefix, network, otherNetwork) ||
            sameGroup(verusSharedMessagePrefix, network, otherNetwork)
          )

          assert.strictEqual(
            network.pubKeyHash === otherNetwork.pubKeyHash,
            sameGroup(bitcoinMainnetSharedPubkeyPrefix, network, otherNetwork) ||
            sameGroup(bitcoinTestnetSharedPubkeyPrefix, network, otherNetwork) ||
            sameGroup(dogeSharedPubkeyPrefix, network, otherNetwork) ||
            sameGroup(verusSharedPubkeyPrefix, network, otherNetwork)
          )

          assert.strictEqual(
            network.scriptHash === otherNetwork.scriptHash,
            sameGroup(bitcoinMainnetSharedScriptPrefix, network, otherNetwork) ||
            sameGroup(bitcoinTestnetSharedScriptPrefix, network, otherNetwork) ||
            sameGroup(verusSharedScriptPrefix, network, otherNetwork)
          )

          assert.strictEqual(
            network.wif === otherNetwork.wif,
            sameGroup(bitcoinMainnetSharedWIFPrefix, network, otherNetwork) ||
            sameGroup(bitcoinTestnetSharedWIFPrefix, network, otherNetwork) ||
            sameGroup(verusSharedWIFPrefix, network, otherNetwork)
          )
        })
      }
    });
  }
});
