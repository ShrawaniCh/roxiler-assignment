import React, { useEffect, useState } from 'react'
import { fetchStatistics } from '../apiService'

function Statistics({month}) {
    const [stats, setStats] = useState({})
    const getStats = async (month) => {
        if(month == "All") return
        const response = await fetchStatistics(month)
        console.log({response})
        setStats(response)
    }

    useEffect(() => {
        getStats(month)
    },[month])
  return (
    <div className='statistics'>
      <h2>Statistics - {month} <span>(Selected month name from dropdown)</span></h2>
      <div className='statistics-container'>
        {month == "All" ?
        <p>Please Select a Specific month to see Statistics</p> 
        :<><div className='statistics-row'>
            <p>Total Sale</p>
            <p>{stats.totalSaleAmount}</p>
            </div>
        <div className='statistics-row'>
        <p>Total sold item</p>
        <p>{stats.soldItemsCount}</p></div>
        <div className='statistics-row'>
        <p>Total not sold item</p>
        <p>{stats.unsoldItemsCount}</p>
        </div></>}
      </div>
    </div>
  )
}

export default Statistics
