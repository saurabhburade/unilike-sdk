import { JsonRpcProvider } from '@ethersproject/providers'
import JSBI from 'jsbi'
import {
  ChainId,
  ETHER,
  CurrencyAmount,
  Pair,
  Route,
  Token,
  TokenAmount,
  Trade,
  TradeType,
  WETH,
  Fetcher
} from '../src'

describe('Trade', () => {
  const token0 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000001', 18, 't0')
  const token1 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000002', 18, 't1')
  const token2 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000003', 18, 't2')
  const token3 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000004', 18, 't3')

  const pair_0_1 = new Pair(new TokenAmount(token0, JSBI.BigInt(1000)), new TokenAmount(token1, JSBI.BigInt(1000)))
  const pair_0_2 = new Pair(new TokenAmount(token0, JSBI.BigInt(1000)), new TokenAmount(token2, JSBI.BigInt(1100)))
  const pair_0_3 = new Pair(new TokenAmount(token0, JSBI.BigInt(1000)), new TokenAmount(token3, JSBI.BigInt(900)))
  const pair_1_2 = new Pair(new TokenAmount(token1, JSBI.BigInt(1200)), new TokenAmount(token2, JSBI.BigInt(1000)))
  const pair_1_3 = new Pair(new TokenAmount(token1, JSBI.BigInt(1200)), new TokenAmount(token3, JSBI.BigInt(1300)))

  const pair_weth_0 = new Pair(
    new TokenAmount(WETH[ChainId.MAINNET], JSBI.BigInt(1000)),
    new TokenAmount(token0, JSBI.BigInt(1000))
  )

  const empty_pair_0_1 = new Pair(new TokenAmount(token0, JSBI.BigInt(0)), new TokenAmount(token1, JSBI.BigInt(0)))

  describe('#bestTradeExactOut', () => {
    it('provides best route', async () => {
      // const DAI = new Token(ChainId.MAINNET, '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', 18)
      // const BUSD = new Token(ChainId.MAINNET, '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', 18)
      // const pair1 = await Fetcher.fetchPairData(
      //   DAI,
      //   BUSD,
      //   new JsonRpcProvider('https://bscrpc.com'),
      //   '0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6', // APE Factory
      //   '0xf4ccce374816856d11f00e4069e7cada164065686fbef53c6167a63ec2fd8c5b' //init hash
      // )
      // const pair_2 = await Fetcher.fetchPairData(
      //   BUSD,
      //   WETH[DAI.chainId],
      //   new JsonRpcProvider('https://bscrpc.com'),
      //   '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73', //pcs factory
      //   '0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5' //init hash
      // )

      // console.log({ pair1, pair_2 })

      // const route = new Route([pair_2, pair1], WETH[DAI.chainId])
      // const trade = new Trade(route, new TokenAmount(WETH[DAI.chainId], '1'), TradeType.EXACT_INPUT)
      // console.log(trade.executionPrice.toFixed(2), trade.priceImpact.toFixed(2), trade.route.path)
      const ETH_DAI = new Token(1, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18)
      const ETH_WETH = new Token(1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18)

      const pair_eth = await Fetcher.fetchPairData(
        ETH_DAI,
        ETH_WETH,
        new JsonRpcProvider('https://eth.public-rpc.com'),
        '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', //pcs factory
        '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f' //init hash
      )
      const route2 = new Route([pair_eth], ETH_WETH)
      const trade2 = new Trade(route2, new TokenAmount(ETH_WETH, '1'), TradeType.EXACT_INPUT)
      console.log(trade2.executionPrice.toFixed(2), trade2.priceImpact.toFixed(2), trade2.route.path)

      // const result = Trade.bestTradeExactOut(
      //   [pair_0_1, pair_0_2, pair_1_2],
      //   token0,
      //   new TokenAmount(token2, JSBI.BigInt(100))
      // )
      // expect(result).toHaveLength(2)
      // expect(result[0].route.pairs).toHaveLength(1) // 0 -> 2 at 10:11
      // expect(result[0].route.path).toEqual([token0, token2])
      // expect(result[0].inputAmount).toEqual(new TokenAmount(token0, JSBI.BigInt(101)))
      // expect(result[0].outputAmount).toEqual(new TokenAmount(token2, JSBI.BigInt(100)))
      // expect(result[1].route.pairs).toHaveLength(2) // 0 -> 1 -> 2 at 12:12:10
      // expect(result[1].route.path).toEqual([token0, token1, token2])
      // expect(result[1].inputAmount).toEqual(new TokenAmount(token0, JSBI.BigInt(156)))
      // expect(result[1].outputAmount).toEqual(new TokenAmount(token2, JSBI.BigInt(100)))
    })

    it('doesnt throw for zero liquidity pairs', () => {
      expect(Trade.bestTradeExactOut([empty_pair_0_1], token1, new TokenAmount(token1, JSBI.BigInt(100)))).toHaveLength(
        0
      )
    })

    it('respects maxHops', () => {
      const result = Trade.bestTradeExactOut(
        [pair_0_1, pair_0_2, pair_1_2],
        token0,
        new TokenAmount(token2, JSBI.BigInt(10)),
        { maxHops: 1 }
      )
      expect(result).toHaveLength(1)
      expect(result[0].route.pairs).toHaveLength(1) // 0 -> 2 at 10:11
      expect(result[0].route.path).toEqual([token0, token2])
    })

    it('insufficient liquidity', () => {
      const result = Trade.bestTradeExactOut(
        [pair_0_1, pair_0_2, pair_1_2],
        token0,
        new TokenAmount(token2, JSBI.BigInt(1200))
      )
      expect(result).toHaveLength(0)
    })

    it('insufficient liquidity in one pair but not the other', () => {
      const result = Trade.bestTradeExactOut(
        [pair_0_1, pair_0_2, pair_1_2],
        token0,
        new TokenAmount(token2, JSBI.BigInt(1050))
      )
      expect(result).toHaveLength(1)
    })

    it('respects n', () => {
      const result = Trade.bestTradeExactOut(
        [pair_0_1, pair_0_2, pair_1_2],
        token0,
        new TokenAmount(token2, JSBI.BigInt(10)),
        { maxNumResults: 1 }
      )

      expect(result).toHaveLength(1)
    })

    it('no path', () => {
      const result = Trade.bestTradeExactOut(
        [pair_0_1, pair_0_3, pair_1_3],
        token0,
        new TokenAmount(token2, JSBI.BigInt(10))
      )
      expect(result).toHaveLength(0)
    })

    it('works for ETHER currency input', () => {
      const result = Trade.bestTradeExactOut(
        [pair_weth_0, pair_0_1, pair_0_3, pair_1_3],
        ETHER,
        new TokenAmount(token3, JSBI.BigInt(100))
      )
      expect(result).toHaveLength(2)
      expect(result[0].inputAmount.currency).toEqual(ETHER)
      expect(result[0].route.path).toEqual([WETH[ChainId.MAINNET], token0, token1, token3])
      expect(result[0].outputAmount.currency).toEqual(token3)
      expect(result[1].inputAmount.currency).toEqual(ETHER)
      expect(result[1].route.path).toEqual([WETH[ChainId.MAINNET], token0, token3])
      expect(result[1].outputAmount.currency).toEqual(token3)
    })
    it('works for ETHER currency output', () => {
      const result = Trade.bestTradeExactOut(
        [pair_weth_0, pair_0_1, pair_0_3, pair_1_3],
        token3,
        CurrencyAmount.ether(JSBI.BigInt(100))
      )
      expect(result).toHaveLength(2)
      expect(result[0].inputAmount.currency).toEqual(token3)
      expect(result[0].route.path).toEqual([token3, token0, WETH[ChainId.MAINNET]])
      expect(result[0].outputAmount.currency).toEqual(ETHER)
      expect(result[1].inputAmount.currency).toEqual(token3)
      expect(result[1].route.path).toEqual([token3, token1, token0, WETH[ChainId.MAINNET]])
      expect(result[1].outputAmount.currency).toEqual(ETHER)
    })
  })
})
