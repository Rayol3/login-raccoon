import axios from 'axios';
import { Platform } from 'react-native';

// Use your computer's IP address here
// For Android Emulator, use '10.0.2.2'
// For iOS Simulator, use 'localhost'
// For physical device, use your computer's LAN IP (e.g., 192.168.1.52)

const API_URL = 'http://172.20.10.3:3000/api';

const productsApi = axios.create({
    baseURL: API_URL,
});

export { productsApi };
