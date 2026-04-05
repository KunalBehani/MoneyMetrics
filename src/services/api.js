import axios from 'axios';

// Using exchangerate-api.com for currency conversion
const BASE_URL = 'https://api.exchangerate-api.com/v4/latest';

export const fetchExchangeRates = async (baseCurrency = 'INR') => {
  try {
    const response = await axios.get(`${BASE_URL}/${baseCurrency}`);
    return response.data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return null;
  }
};
