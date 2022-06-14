import React, {useEffect, useState} from "react";
import { ethers } from 'ethers';

import {contractABI, contractAddress} from '../utils/constants';


export const TransactionContext = React.createContext();

const { ethereum } = window;

// window.ethereum

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    // console.log( {
    //     provider,
    //     signer,
    //     transactionContract
    // });
    return transactionContract;
}



export const TransactionProvider = ({ children }) => {

   const [currentAccount, setCurrentAccount] = useState('')
   const [formData, setFormData] = useState({addressTo: '', amount: '', keyword: '', message: ''}) //state vatriables
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
    const[transactions, setTransactions] = useState([]);
    
   
   const handleChange = ( e, name)=> { //update the form data
        setFormData( (prevState) => ({...prevState, [name]: e.target.value}));

        }

        const getAllTransactions = async () => {
            try {
                if(!ethereum) return alert("Please install Metamask");
                const transactionContract =  getEthereumContract();
                const availableTransactions = await transactionContract.getAllTransactions();
                console.log(availableTransactions)

                const structuredTransactions = availableTransactions.map( (transaction) => ({
                 addressTo: transaction.receiver,
                 addressFrom: transaction.sender,
                 timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                 message: transaction.message,
                 keyword: transaction.keyword,
                 amount: parseInt(transaction.amount._hex) / (10 ** 18)    
                }))

                console.log(structuredTransactions)

                setTransactions(structuredTransactions)


            } catch (error) {
                console.log(error);
            }
        }

    
    const checkIfWalletIsConnected = async () => {


        try {
            if(!ethereum) return alert("Please install Metamask");

            const accounts = await ethereum.request( { method:'eth_accounts'});
            console.log(accounts);
            if(accounts.length) {
                setCurrentAccount(accounts[0]);
                getAllTransactions();
            }
            else{
                console.log('No accounts found')
            }
            
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.")
            
        }
       

    }


    const checkIfTransactionsExist = async () => {
        try {
            const transactionContract =  getEthereumContract();
            const transactionCount = await transactionContract.getTransactionCount();
            
            window.localStorage.setItem("transactionCount", transactionCount)
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.")
        }
    }


    const connectWallet = async () => {
        try {
            
            if(!ethereum) return alert("Please install Metamask");
            const accounts = await ethereum.request( { method:'eth_requestAccounts'});
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.")
            
        }

    }

    
    const sendTransaction = async () => {
        try {

            if(!ethereum) return alert("Please install Metamask");
            //get data from the form...

            const { addressTo, amount, keyword, message } = formData; 
            const transactionContract =  getEthereumContract();
            const parsedAmount = ethers.utils.parseEther(amount);  //converts amount to hexadecimal
            await ethereum.request( {
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas:  '0x5208' ,//21000 gwei
                    value: parsedAmount._hex, //0.0001
    
                }]
               
            });

            const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);
            setIsLoading(true);
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait(); 

            setIsLoading(false);
            console.log(`Success - ${transactionHash.hash}`);
            await transactionHash.wait(); //wait for the transaction to finish
           


            const transactionCount = await transactionContract.getTransactionCount();

            setTransactionCount(transactionCount.toNumber());
            window.reload()
            
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.")
        }
    
    }






    useEffect( () => {
        checkIfWalletIsConnected();
        checkIfTransactionsExist();
    }, []);



    return (  //sending props
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, setFormData, handleChange, sendTransaction, transactions, isLoading}}> 
            {children}
        </TransactionContext.Provider>
    )

}