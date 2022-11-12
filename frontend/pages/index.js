import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Header from "../components/Header"
import GetLotteryToken from "../components/GetLotteryToken"
import { useMoralis } from 'react-moralis'

export default function Home() {
  const { isWeb3Enabled } = useMoralis()

  return (
    <div className={styles.container}>
      <Header />
      {isWeb3Enabled ? (
        <GetLotteryToken />
      ) : (
        <div>Metamask was not detected</div>
      )}
    </div>
  )
}
