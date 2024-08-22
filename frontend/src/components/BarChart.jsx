import React, { useEffect, useState } from 'react'
import ReactApexChart from 'react-apexcharts';
import { fetchBarChartData } from '../apiService';

function BarChart({month}) {
    const [ priceRanges , setPriceRanges] = useState({})
    const [series , setSeries] = useState()
    const [options ,setOptions ] = useState()

      const getBarChartData = async(month) => {
        try{
            const response = await fetchBarChartData(month)
            setPriceRanges(response)
        }catch(err){
            console.log(err)
        }
      }

      useEffect(() => {
        console.log("is This Even triggered")
        getBarChartData(month)
      },[month])

  
  return (
    <div className='bar-chart'>
      <h2>Bar Chart - {month} <span>(Selected month name from dropdown)</span></h2>
      <div className='bar-chart-container'>

      {month == "All" ?
        <p>Please Select a Specific month to see Bar Chart</p> 
        :<>
      <ReactApexChart type='bar' options={
        {
            chart: {
              type: 'bar',
              height: 350
            },
            plotOptions: {
              bar: {
                horizontal: false,
                columnWidth: '55%',
                endingShape: 'rounded'
              },
            },
            dataLabels: {
              enabled: false
            },
            stroke: {
              show: true,
              width: 2,
              colors: ['transparent']
            },
            xaxis: {
              categories: Object.keys(priceRanges),
            },
            yaxis: {
              title: {
                text: 'Sales'
              }
            },
            fill: {
              opacity: 1
            },
            // tooltip: {
            //   y: {
            //     formatter: function (val) {
            //       return "$ " + val + " thousands"
            //     }
            //   }
            // }
          }
      } series={[{
        name: 'Price Ranges',
        data: Object.values(priceRanges)
      }]} height={350} /></>}
      </div>
    </div>
  )
}

export default BarChart
