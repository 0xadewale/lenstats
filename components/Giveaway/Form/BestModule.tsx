import { useEffect, useState } from "react";
import Select from "../../ui/Select";
import Profile from "../../../types/Profile";
import {
    useAddress,
    useContract,
    useTokenBalance,
    useTransferToken,
    useTransferBatchToken,
    Web3Button
} from "@thirdweb-dev/react";
import { ERC20ABI } from "../../../const/abis";
import FollowerProfile from "../../../types/FollowerProfile";

type Props = {
    address: string,
    winner: Profile|null,
    winners: FollowerProfile[]|null,
    label: string,
    currencies: any
}

export default function BestModule(props: Props) {
    const [amount, setAmount] = useState(0)
    const [selectedCurrency, setSelectedCurrency] = useState({
        name: "Wrapped Matic",
        symbol: "WMATIC",
        decimals: 18,
        address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"
    })
    const [valid, setValid] = useState(false)
    const [selected, setSelected] = useState({ name: ''})

    const address = useAddress()
    const { contract } = useContract(selectedCurrency.address, ERC20ABI);
    const { data: tokenBalance } = useTokenBalance(contract, address)
    const { mutateAsync: transferTokens } = useTransferToken(contract);
    const { mutateAsync: transferBatchTokens } = useTransferBatchToken(contract);

    const handleCurrencySelected = async (currency: any) => {
        setSelectedCurrency(currency)
    }

    const handleAmountChange = (e: any) => {
        setAmount(e.target.value)
        validate(e.target.value, tokenBalance?.displayValue)
    }

    const validate = (value: any, balance: any) => {
        if (selectedCurrency !== null) {
            console.log(value, parseInt(balance))
            if (value > parseInt(balance)) {
                setValid(false)
            } else {
                setValid(true)
            }
        }
    }

    const giveaway = async () => {
        if (valid) {
            if (props.winner !== null) {
                await transferTokens(
                    {
                        to: props.winner.ownedBy,
                        amount
                    }
                )
            }
            if (props.winners !== null) {
                const data = props.winners.map((winner: any) => {
                    return {
                        to: winner.wallet.defaultProfile.ownedBy,
                        amount: Number(amount)
                    }
                })
                console.log(data)
                await transferBatchTokens(data)
            }
        }
    }

    if (!props.winner && !props.winners) {
        return (
            <div>No { props.label }</div>
        )
    }
    return (
        <div>
            <div className="flex flex-col my-4 gap-4">
                <div className="z-20">
                    <div className="form-control font-semibold">Currency</div>
                    <div className="block -z-10">
                        { selected?.name }
                        <Select
                            list={props.currencies}
                            selected={selectedCurrency}
                            onSelect={handleCurrencySelected}
                        />
                    </div>
                </div>
                <div>
                    <div>
                        <div className="flex items-center justify-between">
                            <div>Amount</div>
                            <div className="font-thin text-gray-500">Balance : {tokenBalance?.displayValue}</div>
                        </div>
                    </div>
                    <input type='number' className="input" onChange={handleAmountChange} />
                </div>
            </div>
            <div className="flex mt-4 z-10">
                <button
                    className={`w-auto sm:w-full btn btn-success ${valid ? '' : 'btn-disabled'}`}
                    onClick={() => giveaway()}
                >Giveaway</button>
                <Web3Button
                    contractAddress={selectedCurrency.address}
                    action={() =>
                        transferBatchTokens([
                            {
                                to: "0x5f831bBC519d0a13Fc70a5F0AAFc3e01E81d071a", // Transfer 10 tokens to a wallet
                                amount: 0.1,
                            },
                            {
                                to: "0x9197822DaaD536Cd94993b6E41617eFE2A7c431f", // Transfer 20 tokens to another wallet
                                amount: 0.1,
                            },
                        ])
                    }
                >
                    Transfer Batch Tokens
                </Web3Button>
            </div>
        </div>
    )
}
