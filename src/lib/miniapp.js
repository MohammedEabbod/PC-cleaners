export const miniapp = {
    // Check if running in Hylid/SuperQi environment
    isNative: () => typeof window !== 'undefined' && window.my,

    // Authentication
    getAuthCode: () => {
        return new Promise((resolve, reject) => {
            if (miniapp.isNative()) {
                window.my.getAuthCode({
                    scopes: ['auth_base', 'USER_ID'],
                    success: (res) => resolve(res),
                    fail: (err) => reject(err),
                });
            } else {
                // Mock for Dev
                console.log('[Dev] Mocking Auth Code...');
                setTimeout(() => {
                    resolve({ authCode: 'mock_auth_code_123' });
                }, 1000);
            }
        });
    },

    // Get Location
    getLocation: () => {
        return new Promise((resolve, reject) => {
            if (miniapp.isNative()) {
                window.my.getLocation({
                    success: (res) => resolve(res),
                    fail: (err) => reject(err),
                });
            } else {
                // Mock for Dev
                console.log('[Dev] Mocking Location...');
                setTimeout(() => {
                    resolve({
                        latitude: 33.3152,
                        longitude: 44.3661,
                        address: 'Baghdad, Mansour',
                    });
                }, 1500);
            }
        });
    },

    // Payment
    tradePay: (paymentUrl) => {
        return new Promise((resolve, reject) => {
            if (miniapp.isNative()) {
                window.my.tradePay({
                    paymentUrl: paymentUrl,
                    success: (res) => resolve(res),
                    fail: (err) => reject(err),
                });
            } else {
                // Mock for Dev
                console.log('[Dev] Mocking Payment for URL:', paymentUrl);
                setTimeout(() => {
                    resolve({ resultCode: '9000' }); // 9000 is success in Alipay/Hylid standards
                }, 2000);
            }
        });
    },

    // Scan
    scan: () => {
        return new Promise((resolve, reject) => {
            if (miniapp.isNative()) {
                window.my.scan({
                    success: (res) => resolve(res),
                    fail: (err) => reject(err),
                });
            } else {
                console.log('[Dev] Mocking Scan...');
                resolve({ code: 'mock_qr_code' });
            }
        });
    }
};
