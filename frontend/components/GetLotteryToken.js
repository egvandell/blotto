import { useWeb3Contract } from "react-moralis"
import abi from "../constants/abi.json"
//const hre = require("hardhat");


export default function GetLotteryToken() {
//    console.log(`${req.body}`)
    // Get Lottery Token button
//    const body = req.body;
//    console.log(`Tokens submitted: ${body.tokens}`)
//    const blottoContract =hre.ethers.getContract("Blotto")
//    console.log(`${blottoContract.contractAddress}`)


const { runContractFunction: Tester } = useWeb3Contract ({
        abi: abi,
        contractAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
        functionName: "Tester",
        msgValue: "0",
        params: {testint: 95},
    })

    return(
        <div>
            <button className="rounded ml-auto font-bold bg-green-500" 
            onClick={async () => {
                await Tester()
            }}
            >Get Lottery Token</button>
        </div>
    )
}
/*
import { ethers } from "hardhat"
import { useWeb3Contract } from "react-moralis"

export async function GetLotteryToken(req, res) {
//    console.log(`${req.body}`)
    // Get Lottery Token button
//    const body = req.body;

//    console.log(`Tokens submitted: ${body.tokens}`)
    const blottoContract = await ethers.getContract("Blotto")

    const { runContractFunction: PayableTester } = useWeb3Contract ({
        abi: blottoContract.abi,
        contractAddress: blottoContract.address,
        functionName: "PayableTester",
        msgValue: "1",
        params: {testint: 97},
    })

    return(
        <div>
            <button className="rounded ml-auto font-bold bg-green-500" 
            onClick={async () => {
                await PayableTester()
            }}
            >Get Lottery Token</button>
        </div>
    )
}*/
