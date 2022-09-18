import { useCallback, useEffect, useState } from "react";
import "./App.css";
import Web3 from "web3";
import detectEthereumProvider from '@metamask/detect-provider'
import { loadContract } from "./utils/load-contract";

function App() {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    contract: null
  })

  const [balance, setBallance] = useState(null)
  const [account, setAccount] = useState(null)
  const [shouldReload, reload] = useState(false)

  useEffect(() => {
    const loadProvider = async () => {
      const provider = await detectEthereumProvider()
      const contract = await loadContract("Faucet", provider)

      if (provider) {
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract
        })
      } else {
        console.error("Please install Metamask. ")
      }
    }

    loadProvider()
  }, [])

  useEffect(() => {
    const loadBalance = async () => {
      const { contract, web3 } = web3Api
      const balance = await web3.eth.getBalance(contract.address)
      setBallance(web3.utils.fromwei(balance, "ether"))
    }

    web3Api.contract && loadBalance()
  }, [web3Api, shouldReload])

  useEffect(() => {
    const getAccount = async () => {
      const accounts = await web3Api.web3.eth.getAccounts()
      setAccount(accounts[0])
    }

    web3Api.web3 && getAccount()
  }, [web3Api.web3])

  const addFunds = useCallback(async () => {
    const { contract, web3 } = web3Api
    await contract.addFunds({
      from: account,
      value: web3.utils.toWei("1", "ether",)
    })


    reloadEffect()
  }, [web3Api, account])

  return (
    <>
      <div className="faucet-wrapper">
        <div className="faucet">
          <div className="is-flex is-align-items-center">
            <span>
              <strong className="mr-2">Account: </strong>
            </span>
            {account ?
              <div>{account}</div> :
              <button
                className="button is-small is-rounded"
                onClick={() =>
                  web3Api.provider.request({ method: "eth_requestAccounts" }
                  )}

              >
                Connect Wallet

              </button>

            }
          </div>
          <div className="balance-view is-size-2 mb-4">
            Current Balance: <strong>1{balance}</strong> ETH
          </div>
          <button
            className="button is-primary is-light is-rounded mr-2">
              Donate 0.1 eth
              </button>
          <button
          onClick={withdraw}
            className="button is-link is-light is-rounded">Withdraw</button>
        </div>
      </div>
    </>
  );
}

export default App;