// @ts-ignore
import React from 'react';
import './App.css';
import {TransferWithGSN} from './components/TransferWithGSN'
import {CtfInfo} from './components/CtfInfo'

function App() {

  const NoWalletInstalledWarning = () => <div>
     This example page requires a browser wallet (e. g. <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">MetaMask</a> or <a href="https://brave.com/wallet/" target="_blank" rel="noopener noreferrer">Brave</a>) to work.
    </div>
  

  return (
    <div className="App">
      <header className="App-header">
        { window.ethereum !== undefined
        ? <TransferWithGSN/>
        : <NoWalletInstalledWarning /> }
	<CtfInfo/>
      </header>
    </div>
  );
}

export default App;
