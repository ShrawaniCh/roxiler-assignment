// import React, { useState, useEffect } from 'react';
// import { DataGrid } from '@mui/x-data-grid';
import "../App.css"
import { fetchTransactions } from '../apiService';

// const TransactionTable = () => {
//     const [transactions, setTransactions] = useState([]);
//     const [page, setPage] = useState(1);
//     const [perPage, setPerPage] = useState(10);
//     const [search, setSearch] = useState('');
//     const [month, setMonth] = useState('');

//     useEffect(() => {
//         const loadTransactions = async () => {
//             try {
//                 const data = await fetchTransactions(page, perPage, search, month);
//                 setTransactions(data.transactions);
//             } catch (error) {
//                 console.error('Failed to fetch transactions', error);
//             }
//         };

//         loadTransactions();
//     }, [page, perPage, search, month]);

//     const columns = [
//         { field: 'id', headerName: 'ID', width: 90 },
//         { field: 'title', headerName: 'Title', width: 250 },
//         { field: 'price', headerName: 'Price', width: 150 },
//         { field: 'description', headerName: 'Description', width: 350 },
//         { field: 'category', headerName: 'Category', width: 150 },
//         { field: 'sold', headerName: 'Sold', width: 100, renderCell: (params) => (params.value ? 'Yes' : 'No') },
//         { field: 'dateOfSale', headerName: 'Date of Sale', width: 180, valueFormatter: (params) => new Date(params.value).toLocaleDateString() }
//     ];

//     return (
//         <div style={{ height: 600, width: '100%' }}>
//             <div style={{ marginBottom: 16 }}>
//                 <input
//                     type="text"
//                     placeholder="Search by title, description or price..."
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                 />
//                 <select value={month} onChange={(e) => setMonth(e.target.value)}>
//                     <option value="">Select Month</option>
//                     <option value="January">January</option>
//                     <option value="February">February</option>
//                     {/* Add options for all months */}
//                 </select>
//             </div>
//             <DataGrid
//                 rows={transactions}
//                 columns={columns}
//                 pageSize={perPage}
//                 rowsPerPageOptions={[10, 25, 50]}
//                 pagination
//                 onPageSizeChange={(newPageSize) => setPerPage(newPageSize)}
//                 paginationMode="server"
//                 rowCount={transactions.length}
//                 // Implement sorting, filtering, and more as needed
//             />
//             <div>
//                 <button onClick={() => setPage(page - 1)} disabled={page === 1}>
//                     Previous
//                 </button>
//                 <button onClick={() => setPage(page + 1)}>Next</button>
//             </div>
//         </div>
//     );
// };

// export default TransactionTable;


import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionDashboard = ({month ,setMonth}) => {
    const [transactions, setTransactions] = useState([]);
    // Default to March
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalTransactions, setTotalTransactions] = useState(0);

    const fetchTransactionsWrapper = async (month, search, page) => {
        try {
            const response =await fetchTransactions(page,perPage,search, month != "All" ? month : "")
            console.log({response})
            setTransactions(response.transactions);
            setTotalTransactions(response.totalTransactions);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    useEffect(() => {
        fetchTransactionsWrapper(month, search, page);
    }, [month, search, page]);

    const handleMonthChange = (e) => {
        setMonth(e.target.value);
        setPage(1); // Reset page to 1 when month changes
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1); // Reset page to 1 when search changes
    };

    const handleNextPage = () => {
        if (page * perPage < totalTransactions) {
            setPage(page + 1);
        }
    };

    const handlePreviousPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    return (
        <div className="transaction-dashboard">
            <h2>Transaction Dashboard</h2>
            
            <div className="controls">
                <input
                    type="text"
                    placeholder="Search transaction"
                    value={search}
                    onChange={handleSearchChange}
                />
                <select value={month} onChange={handleMonthChange}>
                    {[ "All", 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
                        .map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                </select>
            </div>
            
            <table className="transaction-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th style={{width : "25%"}}>Title</th>
                        <th style={{width : "35%"}}>Description</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Sold</th>
                        <th>Image</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                            <td>{transaction.id}</td>
                            <td style={{width:"20%"}}>{transaction.title}</td>
                            <td style={{width : "35%"}}>{transaction.description}</td>
                            <td>{transaction.price}</td>
                            <td>{transaction.category}</td>
                            <td>{transaction.sold ? 'Yes' : 'No'}</td>
                            <td>
                                <img src={transaction.image} alt={transaction.title} width="50" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                <button onClick={handlePreviousPage} disabled={page === 1}>
                    Previous
                </button>
                <span>Page No: {page}</span>
                <button
                    onClick={handleNextPage}
                    disabled={page * perPage >= totalTransactions}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default TransactionDashboard;
