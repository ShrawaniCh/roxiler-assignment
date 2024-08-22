import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Function to fetch transactions
export const fetchTransactions = async (page = 1, perPage = 10, search = '', month = '') => {
    console.log("THIS")
    const response = await axios.get(`${API_URL}/transactions`, {
        params: { page, perPage, search, month }
    });
    return response.data;
};

// Function to fetch statistics
export const fetchStatistics = async (month) => {
    const response = await axios.get(`${API_URL}/statistics`, {
        params: { month }
    });
    return response.data;
};

// Function to fetch bar chart data
export const fetchBarChartData = async (month) => {
    const response = await axios.get(`${API_URL}/price-range-chart`, {
        params: { month }
    });
    return response.data;
};

// Function to fetch pie chart data
export const fetchPieChartData = async (month) => {
    const response = await axios.get(`${API_URL}/piechart`, {
        params: { month }
    });
    return response.data;
};

// Function to fetch combined data
export const fetchCombinedData = async (month) => {
    const response = await axios.get(`${API_URL}/combined-data`, {
        params: { month }
    });
    return response.data;
};
