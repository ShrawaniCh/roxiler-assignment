
import './App.css'
import TransactionTable from './components/TransactionTable'
import Statistics from './components/Statistics'
import BarChart from './components/BarChart'
import { useState } from 'react';


function App() {
  const [month, setMonth] = useState('All'); 

  return (
    <>
      <TransactionTable month={month} setMonth={setMonth}/>
     
      <Statistics month={month}/>
      <BarChart month={month}/>
    </>
  )
}

export default App
