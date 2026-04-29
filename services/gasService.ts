export const GAS_URL = 'https://script.google.com/macros/s/AKfycbyU6QZ-mwd6oGhOPETtKBBzefXGo6uyBCfYa6kuSTSzXX4DH4W5_2QcTzuG4mdaojpD/exec';

export const logToGas = async (action: string, data: any) => {
    try {
        // Using text/plain avoids CORS preflight issues with Google Apps Script
        await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify({
                action,
                data,
                user: {
                    name: localStorage.getItem('ff_name') || 'Unknown',
                    email: localStorage.getItem('ff_email') || 'Unknown',
                    role: localStorage.getItem('ff_role') || 'Unknown',
                },
                timestamp: new Date().toISOString()
            })
        });
    } catch (error) {
        console.error('GAS Sync Error:', error);
    }
};
